# Script de Inicialización: Sincronización de Documentos de Notion

## Propósito

Este script se ejecuta automáticamente la primera vez que se usa la skill `notion-user-stories` o manualmente con el comando `/sync-notion-docs`.

## Flujo de ejecución

### Paso 1: Verificar si el índice ya existe

```typescript
const indexSearch = await mem_search({
  query: "notion-docs/index",
  project: "pa-ui"
});

if (indexSearch && indexSearch.length > 0) {
  console.log("Índice ya existe en Engram. Usar /sync-notion-docs para forzar actualización.");
  return;
}
```

### Paso 2: Obtener lista de documentos de Notion

```typescript
const blocks = await notion_API-get-block-children({
  block_id: "35f80bf9-7f94-80d7-83ff-e06cb99a1505" // Documentacion page
});

const documents = [];

for (const block of blocks.results) {
  if (block.type === 'child_page') {
    documents.push({
      id: block.id,
      title: block.child_page.title
    });
  }
}
```

### Paso 3: Para cada documento, leer metadata y contenido

```typescript
for (const doc of documents) {
  // 3a. Obtener metadata
  const metadata = await notion_API-retrieve-a-page({ page_id: doc.id });
  
  // 3b. Obtener contenido completo
  const markdown = await notion_API-retrieve-page-markdown({ page_id: doc.id });
  
  // 3c. Generar tags automáticos
  const tags = generateTags(markdown, metadata.title);
  
  // 3d. Guardar contenido en Engram
  await mem_save({
    title: `Notion Doc: ${metadata.title}`,
    type: "architecture",
    project: "pa-ui",
    topic_key: `notion-docs/${doc.id}`,
    content: JSON.stringify({
      id: doc.id,
      title: metadata.title,
      last_edited: metadata.last_edited_time,
      cached_at: new Date().toISOString(),
      content: markdown,
      markdown_length: markdown.length,
      tags: tags
    }),
    capture_prompt: false
  });
  
  // 3e. Agregar al índice
  doc.last_edited = metadata.last_edited_time;
  doc.tags = tags;
}
```

### Paso 4: Guardar índice en Engram

```typescript
await mem_save({
  title: "Notion Documentation Index",
  type: "config",
  project: "pa-ui",
  topic_key: "notion-docs/index",
  content: JSON.stringify({
    parent_page_id: "35f80bf9-7f94-80d7-83ff-e06cb99a1505",
    parent_page_title: "Documentacion",
    last_synced: new Date().toISOString(),
    documents: documents
  }),
  capture_prompt: false
});
```

### Paso 5: Reportar resultados

```typescript
console.log(`Sincronización completada:`);
console.log(`- Documentos sincronizados: ${documents.length}`);
console.log(`- Última sincronización: ${new Date().toISOString()}`);
console.log(`- Tags generados: ${documents.reduce((sum, doc) => sum + doc.tags.length, 0)}`);
```

## Algoritmo de generación de tags

```typescript
function generateTags(content: string, title: string): string[] {
  const tags = new Set<string>();
  
  // 1. Tags basados en título
  const titleLower = title.toLowerCase();
  if (titleLower.includes('architecture')) tags.add('arquitectura');
  if (titleLower.includes('css')) tags.add('css');
  if (titleLower.includes('theme')) tags.add('theme-engine');
  if (titleLower.includes('test')) tags.add('testing');
  if (titleLower.includes('version')) tags.add('versioning');
  if (titleLower.includes('release')) tags.add('release');
  if (titleLower.includes('ci/cd')) tags.add('ci');
  
  // 2. Tags basados en contenido
  const contentLower = content.toLowerCase();
  
  // Conceptos técnicos
  if (contentLower.includes('token')) tags.add('tokens');
  if (contentLower.includes('signal')) tags.add('signals');
  if (contentLower.includes('standalone')) tags.add('standalone');
  if (contentLower.includes('css variables') || contentLower.includes('custom properties')) tags.add('css-variables');
  if (contentLower.includes('viewencapsulation')) tags.add('view-encapsulation');
  
  // APIs
  if (contentLower.includes('providepatheme')) tags.add('providePaTheme');
  if (contentLower.includes('themeservice')) tags.add('ThemeService');
  if (contentLower.includes('controlvalueaccessor')) tags.add('cva');
  
  // Herramientas
  if (contentLower.includes('nx')) tags.add('nx');
  if (contentLower.includes('changeset')) tags.add('changesets');
  if (contentLower.includes('storybook')) tags.add('storybook');
  if (contentLower.includes('stylelint')) tags.add('stylelint');
  if (contentLower.includes('eslint')) tags.add('eslint');
  
  // Componentes
  if (contentLower.includes('button')) tags.add('button');
  if (contentLower.includes('input')) tags.add('input');
  if (contentLower.includes('badge')) tags.add('badge');
  
  // Procesos
  if (contentLower.includes('pre-commit')) tags.add('pre-commit');
  if (contentLower.includes('trusted publishing') || contentLower.includes('oidc')) tags.add('trusted-publishing');
  if (contentLower.includes('ssr') || contentLower.includes('server-side')) tags.add('ssr');
  
  // 3. Limitar a 15 tags
  return Array.from(tags).slice(0, 15);
}
```

## Comando: `/sync-notion-docs`

### Uso

```
/sync-notion-docs              # Sincronización completa
/sync-notion-docs --force      # Forzar re-lectura de todos los documentos
/sync-notion-docs --incremental # Solo documentos que cambiaron
```

### Implementación

```typescript
async function syncNotionDocs(options: { force?: boolean; incremental?: boolean }) {
  if (options.incremental) {
    // Solo validar documentos que cambiaron
    return await syncChangedDocs();
  }
  
  if (options.force) {
    // Forzar re-lectura de todos los documentos
    return await syncAllDocs({ force: true });
  }
  
  // Sincronización completa (primera vez)
  return await syncAllDocs({ force: false });
}
```

## Manejo de errores

### Error: Página no encontrada

```typescript
try {
  const markdown = await notion_API-retrieve-page-markdown({ page_id: doc.id });
} catch (error) {
  if (error.code === 'object_not_found') {
    console.warn(`Página ${doc.id} no encontrada. Saltando.`);
    return null;
  }
  throw error;
}
```

### Error: Rate limiting

```typescript
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.code === 'rate_limited' && i < maxRetries - 1) {
        await sleep(1000 * (i + 1)); // Exponential backoff
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

### Error: Engram no disponible

```typescript
try {
  await mem_save({ ... });
} catch (error) {
  console.error('Error guardando en Engram:', error);
  console.warn('Continuando sin cache. La próxima ejecución será más lenta.');
}
```

## Métricas de performance

| Operación | Tiempo estimado | API calls |
|---|---|---|
| Sincronización completa (18 docs) | 60-90s | 36 (18 metadata + 18 content) |
| Sincronización incremental (3 docs cambiados) | 15-25s | 6-9 |
| Validación de frescura (5 docs) | 5-10s | 5 |

## Recomendaciones

1. **Ejecutar `/sync-notion-docs` semanalmente** para mantener el cache fresco
2. **Ejecutar después de cambios masivos** en la documentación de Notion
3. **No ejecutar en cada sesión** (la validación de frescura es suficiente)
4. **Monitorear uso de API de Notion** para evitar rate limiting
