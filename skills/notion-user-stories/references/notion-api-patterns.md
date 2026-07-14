# Patrones de API de Notion

## Endpoints usados por la skill

### 1. retrieve-a-page (metadata only)

**Uso:** Validar frescura de documentos sin leer contenido completo.

```typescript
notion_API-retrieve-a-page({
  page_id: "35f80bf9-7f94-814a-96d6-ccb90055e545"
})
```

**Retorna:**
- `id`, `title`, `last_edited_time`, `created_time`
- NO retorna contenido del body

**Costo:** ~100-200 tokens por call
**Tiempo:** ~1-2 segundos

### 2. retrieve-page-markdown (contenido completo)

**Uso:** Leer contenido completo de documentos obsoletos.

```typescript
notion_API-retrieve-page-markdown({
  page_id: "35f80bf9-7f94-814a-96d6-ccb90055e545"
})
```

**Retorna:**
- Contenido completo en formato markdown
- Metadata básica

**Costo:** ~2000-5000 tokens por call (depende del tamaño)
**Tiempo:** ~2-5 segundos

### 3. get-block-children (para páginas con bloques)

**Uso:** Alternativa cuando retrieve-page-markdown retorna vacío.

```typescript
notion_API-get-block-children({
  block_id: "35f80bf9-7f94-814a-96d6-ccb90055e545",
  page_size: 100
})
```

**Retorna:**
- Lista de bloques (párrafos, headings, code blocks, etc.)
- Requiere iteración si `has_more: true`

**Costo:** ~500-1000 tokens por call
**Tiempo:** ~1-3 segundos

### 4. query-data-source (buscar en database)

**Uso:** Buscar historias de usuario por ID o título.

```typescript
notion_API-query-data-source({
  data_source_id: "e257d327-5599-48c3-86d5-7c758f4e1a6e",
  filter: {
    property: "ID",
    unique_id: { equals: 11 }
  }
})
```

**Retorna:**
- Lista de páginas que matchean el filtro
- Propiedades de cada página (título, criterios, notas, etc.)

**Costo:** ~500-1000 tokens por call
**Tiempo:** ~2-3 segundos

### 5. post-search (búsqueda global)

**Uso:** Buscar páginas por título cuando no se conoce el database.

```typescript
notion_API-post-search({
  query: "US-11",
  filter: { property: "object", value: "page" }
})
```

**Retorna:**
- Lista de páginas que matchean la búsqueda
- Metadata básica

**Costo:** ~300-800 tokens por call
**Tiempo:** ~2-4 segundos

### 6. patch-page (actualizar historia)

**Uso:** Actualizar criterios de una historia después del análisis.

```typescript
notion_API-patch-page({
  page_id: "38380bf9-7f94-8182-b0d2-ea54d03720be",
  properties: {
    "Criterios de Aceptación": {
      rich_text: [{ text: { content: "- Nuevo criterio 1\n- Nuevo criterio 2" } }]
    }
  }
})
```

**Retorna:**
- Página actualizada
- Timestamp de modificación

**Costo:** ~200-400 tokens por call
**Tiempo:** ~1-2 segundos

## Patrones de manejo de errores

### Rate limiting

Notion tiene límites de rate. Si recibes error 429:

```typescript
// Esperar y reintentar
if (error.code === 'rate_limited') {
  await sleep(1000); // 1 segundo
  return retry();
}
```

### Páginas vacías

Algunas páginas retornan markdown vacío. Fallback:

```typescript
const markdown = await retrievePageMarkdown(page_id);
if (!markdown || markdown.length === 0) {
  const blocks = await getBlockChildren(page_id);
  return parseBlocksToMarkdown(blocks);
}
```

### Database no accesible

Si query-data-source retorna 404:

```typescript
// Fallback a post-search
const results = await postSearch({ query: "US-11" });
return results.find(r => r.properties.ID?.unique_id?.prefix === "US");
```

## Optimización de costos

### Batch requests

Cuando necesitas validar múltiples documentos:

```typescript
// MAL: Secuencial (lento)
for (const doc of documents) {
  await retrievePage(doc.id);
}

// BIEN: Paralelo (rápido)
await Promise.all(documents.map(doc => retrievePage(doc.id)));
```

### Cache de resultados

Evitar re-leer el mismo documento en una sesión:

```typescript
const sessionCache = new Map();

async function getDocument(id) {
  if (sessionCache.has(id)) {
    return sessionCache.get(id);
  }
  const doc = await retrievePageMarkdown(id);
  sessionCache.set(id, doc);
  return doc;
}
```

### Minimizar campos

Solo pedir los campos que necesitas:

```typescript
// MAL: Pide todo
const page = await retrievePage(page_id);

// BIEN: Solo metadata para validación
const { id, last_edited_time, title } = await retrievePage(page_id);
```

## Métricas de performance

| Operación | Tokens típicos | Tiempo | API calls |
|---|---|---|---|
| Validar 1 documento | ~150 | 1-2s | 1 |
| Leer 1 documento completo | ~3000 | 2-5s | 1 |
| Buscar historia por ID | ~600 | 2-3s | 1 |
| Actualizar historia | ~300 | 1-2s | 1 |
| Sincronizar 18 documentos | ~50000 | 60-90s | 18 |

## Rate limits de Notion

- **Average:** 3 requests per second per integration
- **Burst:** 20 requests per second
- **Daily:** No hay límite diario documentado

**Recomendación:** No hacer más de 10 requests en paralelo para evitar rate limiting.
