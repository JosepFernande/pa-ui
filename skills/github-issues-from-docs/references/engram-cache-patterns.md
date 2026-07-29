# Patrones de Cache en Engram

## Estrategia híbrida

### Principios

1. **Índice liviano**: Metadata mínima en Engram para búsqueda rápida
2. **Contenido cacheado**: Páginas completas con SHA de commit para validación
3. **Frescura garantizada**: Comparar el HEAD SHA del clone local del Wiki antes
   de usar cache
4. **Sincronización incremental**: Solo re-leer páginas que cambiaron (vía
   `git diff --name-only`)

## Estructura de topic_keys

### Índice de páginas

```
topic_key: "wiki-docs/index"
title: "Wiki Documentation Index"
type: "config"
```

**Contenido:**

```json
{
  "repo": "https://github.com/JosepFernande/pa-ui.wiki.git",
  "local_clone_path": ".wiki-cache/pa-ui.wiki",
  "last_synced_head_sha": "a1b2c3d4e5f6...",
  "last_synced_at": "2026-07-29T00:40:00.000Z",
  "documents": [
    {
      "page": "Architecture-and-Foundation",
      "file": "Architecture-and-Foundation.md",
      "last_commit_sha": "a1b2c3d4e5f6...",
      "tags": ["arquitectura", "tokens", "standalone"]
    }
  ]
}
```

### Contenido por página

```
topic_key: "wiki-docs/{page-slug}"
title: "Wiki Doc: {page}"
type: "architecture" | "pattern" | "config"
```

**Contenido:**

```json
{
  "page": "Architecture-and-Foundation",
  "file": "Architecture-and-Foundation.md",
  "last_commit_sha": "a1b2c3d4e5f6...",
  "cached_at": "2026-07-29T00:40:00.000Z",
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
  "analyzed_at": "2026-07-29T00:35:00.000Z",
  "documents_consulted": [
    "Architecture-and-Foundation",
    "CSS-Strategy-and-View-Encapsulation",
    "Theming-Deep-Dive"
  ],
  "gaps_found": [
    "Falta estructura de archivos específica",
    "Falta algoritmo de derivación HSL"
  ],
  "issue_updated_via": "gh issue edit",
  "cache_stats": {
    "documents_read_from_cache": 2,
    "documents_reread_from_wiki": 1,
    "git_operations": 4
  }
}
```

Nota: este topic_key solo guarda el resultado del análisis en Engram; nunca
implica un `git push` al repo del Wiki. La actualización real del work item
ocurre en GitHub vía `gh issue edit` / `gh issue comment`.

## Patrones de lectura

### Cargar índice

```typescript
// Buscar índice en Engram
const indexResult = await mem_search({
  query: 'wiki-docs/index',
  project: 'pa-ui',
});

if (!indexResult || indexResult.length === 0) {
  // Índice no existe, ejecutar sincronización
  await syncWikiDocs();
  return await mem_search({ query: 'wiki-docs/index', project: 'pa-ui' });
}

const index = await mem_get_observation({ id: indexResult[0].id });
return JSON.parse(index.content);
```

### Validar frescura

```typescript
async function ensureWikiClone() {
  const exists = await pathExists('.wiki-cache/pa-ui.wiki');
  if (!exists) {
    await bash(
      'git clone https://github.com/JosepFernande/pa-ui.wiki.git .wiki-cache/pa-ui.wiki',
    );
  } else {
    await bash('git -C .wiki-cache/pa-ui.wiki pull --ff-only');
  }
}

async function getCurrentHeadSha(): Promise<string> {
  return (await bash('git -C .wiki-cache/pa-ui.wiki rev-parse HEAD')).trim();
}

async function validateFreshness(cachedHeadSha: string) {
  await ensureWikiClone();
  const currentHeadSha = await getCurrentHeadSha();

  // 1 sola comparación de string reemplaza 1 llamada de API por página
  if (currentHeadSha !== cachedHeadSha) {
    return { fresh: false, currentHeadSha };
  }

  return { fresh: true };
}
```

### Leer página (con cache)

```typescript
async function getDocumentContent(page: string, cachedHeadSha: string) {
  // 1. Buscar en Engram
  const cached = await mem_search({
    query: `wiki-docs/${page}`,
    project: 'pa-ui',
  });

  const freshness = await validateFreshness(cachedHeadSha);

  if (cached && cached.length > 0 && freshness.fresh) {
    // 2a. Cache válido, usar contenido cacheado
    const observation = await mem_get_observation({ id: cached[0].id });
    const doc = JSON.parse(observation.content);
    return { content: doc.content, source: 'cache' };
  }

  // 2b. HEAD cambió: determinar si esta página específica cambió antes de
  // re-leerla (evita re-lecturas innecesarias de páginas que no cambiaron)
  const changedFiles = await bash(
    `git -C .wiki-cache/pa-ui.wiki diff --name-only ${cachedHeadSha} ${freshness.currentHeadSha} -- '*.md'`,
  );

  if (cached && cached.length > 0 && !changedFiles.includes(`${page}.md`)) {
    // La página no está en el diff: sigue fresca aunque el HEAD global cambió
    const observation = await mem_get_observation({ id: cached[0].id });
    const doc = JSON.parse(observation.content);
    return { content: doc.content, source: 'cache' };
  }

  // 3. La página cambió, re-leer del clone local
  const content = await Read({
    file_path: `.wiki-cache/pa-ui.wiki/${page}.md`,
  });
  const lastCommitSha = (
    await bash(
      `git -C .wiki-cache/pa-ui.wiki log -1 --format=%H -- "${page}.md"`,
    )
  ).trim();

  // 4. Actualizar cache
  await saveDocumentToEngram(page, lastCommitSha, content);

  return { content, source: 'wiki' };
}
```

### Guardar página en Engram

```typescript
async function saveDocumentToEngram(
  page: string,
  lastCommitSha: string,
  content: string,
) {
  await mem_save({
    title: `Wiki Doc: ${page}`,
    type: 'architecture',
    project: 'pa-ui',
    topic_key: `wiki-docs/${page}`,
    content: JSON.stringify({
      page,
      file: `${page}.md`,
      last_commit_sha: lastCommitSha,
      cached_at: new Date().toISOString(),
      content,
      markdown_length: content.length,
    }),
    capture_prompt: false,
  });
}
```

## Patrones de sincronización

### Sincronización completa

```typescript
async function syncWikiDocs() {
  // 1. Asegurar el clone local
  await ensureWikiClone();

  // 2. Listar páginas (excluyendo Home.md y _Sidebar.md)
  const files = await listMarkdownFiles('.wiki-cache/pa-ui.wiki', {
    exclude: ['Home.md', '_Sidebar.md'],
  });

  const documents = [];

  // 3. Para cada página, leer contenido y generar tags
  for (const file of files) {
    const page = file.replace(/\.md$/, '');
    const content = await Read({ file_path: `.wiki-cache/pa-ui.wiki/${file}` });
    const lastCommitSha = (
      await bash(
        `git -C .wiki-cache/pa-ui.wiki log -1 --format=%H -- "${file}"`,
      )
    ).trim();
    const tags = generateTags(content, page);

    // 4. Guardar contenido en Engram
    await saveDocumentToEngram(page, lastCommitSha, content);

    // 5. Agregar al índice
    documents.push({ page, file, last_commit_sha: lastCommitSha, tags });
  }

  // 6. Actualizar índice en Engram
  const headSha = await getCurrentHeadSha();
  await mem_save({
    title: 'Wiki Documentation Index',
    type: 'config',
    project: 'pa-ui',
    topic_key: 'wiki-docs/index',
    content: JSON.stringify({
      repo: 'https://github.com/JosepFernande/pa-ui.wiki.git',
      local_clone_path: '.wiki-cache/pa-ui.wiki',
      last_synced_head_sha: headSha,
      last_synced_at: new Date().toISOString(),
      documents,
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

  // 2. Asegurar el clone y comparar HEAD (1 sola comparación, no N)
  await ensureWikiClone();
  const currentHeadSha = await getCurrentHeadSha();

  if (currentHeadSha === index.last_synced_head_sha) {
    return { changed: 0 }; // todo fresco, costo ~0
  }

  // 3. Listar exactamente qué páginas .md cambiaron
  const changedFiles = (
    await bash(
      `git -C .wiki-cache/pa-ui.wiki diff --name-only ${index.last_synced_head_sha} ${currentHeadSha} -- '*.md'`,
    )
  )
    .split('\n')
    .filter(Boolean);

  let changedCount = 0;

  // 4. Re-leer solo esas páginas
  for (const doc of index.documents) {
    if (!changedFiles.includes(doc.file)) continue;

    const content = await Read({
      file_path: `.wiki-cache/pa-ui.wiki/${doc.file}`,
    });
    const lastCommitSha = (
      await bash(
        `git -C .wiki-cache/pa-ui.wiki log -1 --format=%H -- "${doc.file}"`,
      )
    ).trim();

    await saveDocumentToEngram(doc.page, lastCommitSha, content);

    doc.last_commit_sha = lastCommitSha;
    doc.tags = generateTags(content, doc.page);
    changedCount++;
  }

  // 5. Guardar índice actualizado con el nuevo HEAD
  index.last_synced_head_sha = currentHeadSha;
  index.last_synced_at = new Date().toISOString();
  await saveIndexToEngram(index);

  return { changed: changedCount };
}
```

## Optimización de tokens

### Minimizar contenido en Engram

Engram tiene límites de tamaño. Para páginas muy grandes:

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
      topic_key: `wiki-docs/${page}/chunk-${i}`,
      content: chunks[i],
    });
  }
}
```

### Evitar duplicados

```typescript
// Antes de guardar, verificar si ya existe
const existing = await mem_search({
  query: `wiki-docs/${page}`,
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
    topic_key: `wiki-docs/${page}`,
    content: newContent,
  });
}
```

## Métricas de cache

### Estadísticas por sesión

```typescript
const sessionStats = {
  documents_read_from_cache: 0,
  documents_reread_from_wiki: 0,
  git_operations: 0,
  tokens_saved: 0,
};

// Al leer página
if (source === 'cache') {
  sessionStats.documents_read_from_cache++;
  sessionStats.tokens_saved += estimated_tokens;
} else {
  sessionStats.documents_reread_from_wiki++;
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

Engram tiene un límite práctico de ~50KB por observación. Páginas muy grandes
pueden requerir chunking.

### Búsqueda FTS5

Engram usa FTS5 para búsqueda. Tags y keywords deben estar en el contenido para
ser buscables.

### Sincronización manual

No hay mecanismo automático de detección de cambios remotos. El usuario debe
ejecutar `/sync-wiki-docs` periódicamente, o la skill asegura el clone
(`git pull --ff-only`) y compara el HEAD SHA en cada ejecución.
