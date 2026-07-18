# Patrones de Cache en Engram

## Estrategia híbrida

### Principios

1. **Índice liviano**: Metadata mínima en Engram para búsqueda rápida
2. **Contenido cacheado**: Documentos completos con timestamp para validación
3. **Frescura garantizada**: Comparar `last_edited_time` antes de usar cache
4. **Sincronización incremental**: Solo re-leer documentos que cambiaron

## Estructura de topic_keys

### Índice de documentos

```
topic_key: "notion-docs/index"
title: "Notion Documentation Index"
type: "config"
```

**Contenido:**

```json
{
  "parent_page_id": "35f80bf9-7f94-80d7-83ff-e06cb99a1505",
  "last_synced": "2026-07-14T00:40:00.000Z",
  "documents": [
    {
      "id": "35f80bf9-7f94-814a-96d6-ccb90055e545",
      "title": "Architecture & Foundation",
      "last_edited": "2026-06-19T19:44:00.000Z",
      "tags": ["arquitectura", "tokens", "standalone"]
    }
  ]
}
```

### Contenido por documento

```
topic_key: "notion-docs/{doc-id}"
title: "Notion Doc: {title}"
type: "architecture" | "pattern" | "config"
```

**Contenido:**

```json
{
  "id": "35f80bf9-7f94-814a-96d6-ccb90055e545",
  "title": "Architecture & Foundation",
  "last_edited": "2026-06-19T19:44:00.000Z",
  "cached_at": "2026-07-14T00:40:00.000Z",
  "content": "# Project Vision\nBuild an Angular component library...",
  "markdown_length": 12500,
  "tags": ["arquitectura", "tokens", "standalone"]
}
```

### Análisis de issues de GitHub

```
topic_key: "github-issue/{issue-number}/analysis"
title: "Analysis: Issue #{number} - {title}"
type: "decision"
```

**Contenido:**

```json
{
  "issue_number": 11,
  "title": "Theme Engine extensible basado en tokens",
  "analyzed_at": "2026-07-14T00:35:00.000Z",
  "documents_consulted": [
    "35f80bf9-7f94-814a-96d6-ccb90055e545",
    "35f80bf9-7f94-8149-80a0-ede8a524fad9",
    "38480bf9-7f94-812c-a909-e1d7f457e8df"
  ],
  "gaps_found": [
    "Falta estructura de archivos específica",
    "Falta algoritmo de derivación HSL"
  ],
  "issue_updated_via": "gh issue edit",
  "cache_stats": {
    "documents_read_from_cache": 2,
    "documents_reread_from_notion": 1,
    "total_api_calls": 5
  }
}
```

Nota: este topic_key solo guarda el resultado del análisis en Engram; nunca
implica una escritura en Notion. La actualización real del work item ocurre en
GitHub vía `gh issue edit` / `gh issue comment`.

## Patrones de lectura

### Cargar índice

```typescript
// Buscar índice en Engram
const indexResult = await mem_search({
  query: 'notion-docs/index',
  project: 'pa-ui',
});

if (!indexResult || indexResult.length === 0) {
  // Índice no existe, ejecutar sincronización
  await syncNotionDocs();
  return await mem_search({ query: 'notion-docs/index', project: 'pa-ui' });
}

const index = await mem_get_observation({ id: indexResult[0].id });
return JSON.parse(index.content);
```

### Validar frescura

```typescript
async function validateFreshness(docId: string, cachedLastEdited: string) {
  // Obtener metadata actual de Notion
  const currentPage =
    (await notion_API) - retrieve - a - page({ page_id: docId });

  // Comparar timestamps
  if (currentPage.last_edited_time !== cachedLastEdited) {
    return { fresh: false, currentLastEdited: currentPage.last_edited_time };
  }

  return { fresh: true };
}
```

### Leer documento (con cache)

```typescript
async function getDocumentContent(docId: string) {
  // 1. Buscar en Engram
  const cached = await mem_search({
    query: `notion-docs/${docId}`,
    project: 'pa-ui',
  });

  if (cached && cached.length > 0) {
    const observation = await mem_get_observation({ id: cached[0].id });
    const doc = JSON.parse(observation.content);

    // 2. Validar frescura
    const freshness = await validateFreshness(docId, doc.last_edited);

    if (freshness.fresh) {
      // 3a. Cache válido, usar contenido cacheado
      return { content: doc.content, source: 'cache' };
    }
  }

  // 3b. Cache obsoleto o no existe, re-leer de Notion
  const markdown =
    (await notion_API) - retrieve - page - markdown({ page_id: docId });
  const metadata = (await notion_API) - retrieve - a - page({ page_id: docId });

  // 4. Actualizar cache
  await saveDocumentToEngram(
    docId,
    metadata.title,
    metadata.last_edited_time,
    markdown,
  );

  return { content: markdown, source: 'notion' };
}
```

### Guardar documento en Engram

```typescript
async function saveDocumentToEngram(
  docId: string,
  title: string,
  lastEdited: string,
  content: string,
) {
  await mem_save({
    title: `Notion Doc: ${title}`,
    type: 'architecture',
    project: 'pa-ui',
    topic_key: `notion-docs/${docId}`,
    content: JSON.stringify({
      id: docId,
      title: title,
      last_edited: lastEdited,
      cached_at: new Date().toISOString(),
      content: content,
      markdown_length: content.length,
    }),
    capture_prompt: false,
  });
}
```

## Patrones de sincronización

### Sincronización completa

```typescript
async function syncNotionDocs() {
  // 1. Obtener lista de documentos de Notion
  const blocks =
    (await notion_API) -
    get -
    block -
    children({
      block_id: '35f80bf9-7f94-80d7-83ff-e06cb99a1505',
    });

  const documents = [];

  // 2. Para cada documento, leer metadata y contenido
  for (const block of blocks.results) {
    if (block.type === 'child_page') {
      const metadata =
        (await notion_API) - retrieve - a - page({ page_id: block.id });
      const markdown =
        (await notion_API) - retrieve - page - markdown({ page_id: block.id });

      // 3. Generar tags automáticos
      const tags = generateTags(markdown, metadata.title);

      // 4. Guardar contenido en Engram
      await saveDocumentToEngram(
        block.id,
        metadata.title,
        metadata.last_edited_time,
        markdown,
      );

      // 5. Agregar al índice
      documents.push({
        id: block.id,
        title: metadata.title,
        last_edited: metadata.last_edited_time,
        tags: tags,
      });
    }
  }

  // 6. Actualizar índice en Engram
  await mem_save({
    title: 'Notion Documentation Index',
    type: 'config',
    project: 'pa-ui',
    topic_key: 'notion-docs/index',
    content: JSON.stringify({
      parent_page_id: '35f80bf9-7f94-80d7-83ff-e06cb99a1505',
      last_synced: new Date().toISOString(),
      documents: documents,
    }),
    capture_prompt: false,
  });

  return { synced: documents.length };
}
```

### Sincronización incremental

```typescript
async function syncChangedDocs() {
  // 1. Cargar índice desde Engram
  const index = await loadIndexFromEngram();

  let changedCount = 0;

  // 2. Para cada documento, validar frescura
  for (const doc of index.documents) {
    const freshness = await validateFreshness(doc.id, doc.last_edited);

    if (!freshness.fresh) {
      // 3. Documento cambió, re-leer
      const markdown =
        (await notion_API) - retrieve - page - markdown({ page_id: doc.id });
      const metadata =
        (await notion_API) - retrieve - a - page({ page_id: doc.id });

      // 4. Actualizar cache
      await saveDocumentToEngram(
        doc.id,
        metadata.title,
        metadata.last_edited_time,
        markdown,
      );

      // 5. Actualizar índice
      doc.last_edited = metadata.last_edited_time;
      doc.tags = generateTags(markdown, metadata.title);

      changedCount++;
    }
  }

  // 6. Guardar índice actualizado
  await saveIndexToEngram(index);

  return { changed: changedCount };
}
```

## Optimización de tokens

### Minimizar contenido en Engram

Engram tiene límites de tamaño. Para documentos muy grandes:

```typescript
// Opción 1: Truncar contenido si es muy largo
const MAX_CONTENT_LENGTH = 50000; // caracteres
const truncatedContent =
  content.length > MAX_CONTENT_LENGTH
    ? content.substring(0, MAX_CONTENT_LENGTH) + '\n\n[TRUNCATED]'
    : content;

// Opción 2: Dividir en chunks
if (content.length > MAX_CONTENT_LENGTH) {
  const chunks = splitIntoChunks(content, MAX_CONTENT_LENGTH);
  for (let i = 0; i < chunks.length; i++) {
    await mem_save({
      topic_key: `notion-docs/${docId}/chunk-${i}`,
      content: chunks[i],
    });
  }
}
```

### Evitar duplicados

```typescript
// Antes de guardar, verificar si ya existe
const existing = await mem_search({
  query: `notion-docs/${docId}`,
  project: 'pa-ui',
});

if (existing && existing.length > 0) {
  // Actualizar en lugar de crear nuevo
  await mem_update({
    id: existing[0].id,
    content: newContent,
  });
} else {
  // Crear nuevo
  await mem_save({
    topic_key: `notion-docs/${docId}`,
    content: newContent,
  });
}
```

## Métricas de cache

### Estadísticas por sesión

```typescript
const sessionStats = {
  documents_read_from_cache: 0,
  documents_reread_from_notion: 0,
  api_calls: 0,
  tokens_saved: 0,
};

// Al leer documento
if (source === 'cache') {
  sessionStats.documents_read_from_cache++;
  sessionStats.tokens_saved += estimated_tokens;
} else {
  sessionStats.documents_reread_from_notion++;
}

// Al final de la sesión
await mem_save({
  title: `Session Stats: US-${usId}`,
  type: 'config',
  topic_key: `session-stats/${usId}`,
  content: JSON.stringify(sessionStats),
});
```

## Limitaciones

### Tamaño de observaciones

Engram tiene un límite práctico de ~50KB por observación. Documentos muy grandes
pueden requerir chunking.

### Búsqueda FTS5

Engram usa FTS5 para búsqueda. Tags y keywords deben estar en el contenido para
ser buscables.

### Sincronización manual

No hay mecanismo automático de detección de cambios. El usuario debe ejecutar
`/sync-notion-docs` periódicamente o la skill valida frescura en cada ejecución.
