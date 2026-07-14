---
name: notion-user-stories
description: "Trigger: historia de usuario, US-XX, revisar historia, crear historia, alinear historia, Notion user story. Crear y revisar historias de usuario alineadas con documentación de Notion usando cache híbrido inteligente."
license: Apache-2.0
metadata:
  author: jfernandezo
  version: "1.0"
---

## Activation Contract

Esta skill se ejecuta automáticamente cuando:
- El usuario menciona una historia de usuario (US-XX, ID, URL de Notion)
- Solicita crear, revisar, analizar o alinear una historia
- Proporciona un link de Notion de una historia

**NO** se ejecuta para:
- Consultas generales sobre arquitectura (usa otras skills)
- Implementación directa de componentes (usa sdd-apply)

## Hard Rules

1. **Estrategia híbrida obligatoria**: Siempre usar cache de Engram con validación de frescura vía timestamps de Notion.
2. **Índice liviano**: Mantener índice de documentos en Engram (topic_key: `notion-docs/index`) con metadata mínima.
3. **Contenido cacheado**: Almacenar contenido completo por documento (topic_key: `notion-docs/{doc-id}`) con `last_edited_time`.
4. **Validación selectiva**: Solo validar frescura de documentos relevantes para la historia actual (no todos los 18 documentos).
5. **Re-lectura incremental**: Solo re-leer de Notion documentos cuyo `last_edited_time` cambió.
6. **Primera ejecución**: Si el índice no existe en Engram, ejecutar `/sync-notion-docs` automáticamente.

## Estrategia Híbrida Inteligente

### Flujo de ejecución

```
1. Parsear input del usuario:
   - ¿Es una URL de Notion? → Extraer page_id
   - ¿Es un ID? → Usar directamente
   - ¿Es "US-XX"? → Buscar en database de User Stories
   - ¿Es "crear nueva"? → Modo creación

2. Leer historia desde Notion (1 API call):
   - retrieve-a-page o retrieve-page-markdown
   - Extraer: título, criterios, notas, etc.

3. Determinar tema de la historia:
   - Analizar palabras clave del contenido
   - Identificar conceptos: "tokens", "Theme Engine", "CSS", "publicación", etc.

4. Cargar índice desde Engram (local, 0 API calls):
   - mem_search(query: "notion-docs/index", project: "pa-ui")
   - Obtener lista de documentos con tags y last_edited_time

5. Filtrar documentos relevantes (local):
   - Match entre keywords de la historia y tags de documentos
   - Seleccionar 3-5 documentos más relevantes

6. Validar frescura (3-5 API calls):
   - Para cada documento relevante: retrieve-a-page (solo metadata)
   - Comparar last_edited_time: Engram vs Notion
   - Si cambió → marcar para re-lectura

7. Sincronizar documentos obsoletos (0-3 API calls):
   - Para documentos marcados: retrieve-page-markdown
   - Actualizar cache en Engram con nuevo contenido y timestamp

8. Analizar/crear historia:
   - Leer contenido de documentos relevantes (desde cache)
   - Comparar historia contra documentación
   - Identificar gaps de alineación

9. Actualizar historia en Notion (si es necesario):
   - patch-page con criterios actualizados
   - Mantener coherencia con documentación

10. Guardar learnings en Engram:
    - mem_save con decisiones tomadas
    - topic_key: "user-story/{us-id}/analysis"
```

### Estimación de costos

| Escenario | API calls | Tokens | Tiempo |
|---|---|---|---|
| Todo fresco (90% casos) | 4-6 | ~2000-3000 | 10-15s |
| Con cambios (10% casos) | 6-9 | ~3000-5000 | 15-25s |
| Primera ejecución (sin cache) | 18+ | ~6000-8000 | 30-60s |

**Ahorro vs. leer siempre:** 60-80% menos tokens

## Execution Steps

### Modo: Revisar/Analizar historia existente

1. **Leer historia** desde Notion
2. **Validar cache** de documentos relevantes
3. **Comparar** historia contra documentación
4. **Identificar gaps**:
   - Criterios faltantes
   - Conceptos mal interpretados
   - Requisitos arquitectónicos omitidos
5. **Proponer cambios** al usuario
6. **Actualizar en Notion** si el usuario aprueba

### Modo: Crear nueva historia

1. **Recopilar requisitos** del usuario
2. **Validar cache** de documentos relevantes
3. **Generar historia** alineada con documentación:
   - Formato: Como... / Quiero... / Para...
   - Criterios de aceptación detallados
   - Notas con dependencias y non-goals
4. **Crear en Notion** (post-page o insertar en database)
5. **Guardar en Engram** para referencia futura

### Comando: `/sync-notion-docs`

Fuerza sincronización completa de todos los documentos:

```
1. Listar todos los documentos bajo Documentacion page
2. Para cada documento:
   - retrieve-page-markdown
   - Extraer metadata (id, title, last_edited_time)
   - Generar tags automáticos (keywords del contenido)
   - Guardar en Engram (topic_key: "notion-docs/{doc-id}")
3. Actualizar índice (topic_key: "notion-docs/index")
4. Reportar: X documentos sincronizados, Y tags generados
```

**Uso:** Ejecutar manualmente cuando se agregan documentos nuevos o se sospecha que el cache está obsoleto.

## Estructura del Índice en Engram

### Índice de documentos (topic_key: `notion-docs/index`)

```json
{
  "parent_page_id": "35f80bf9-7f94-80d7-83ff-e06cb99a1505",
  "last_synced": "2026-07-14T00:40:00.000Z",
  "documents": [
    {
      "id": "35f80bf9-7f94-814a-96d6-ccb90055e545",
      "title": "Architecture & Foundation",
      "last_edited": "2026-06-19T19:44:00.000Z",
      "tags": ["arquitectura", "tokens", "standalone", "signals", "css-variables", "cdk", "apis-consistentes"]
    },
    {
      "id": "35f80bf9-7f94-8149-80a0-ede8a524fad9",
      "title": "CSS Strategy & View Encapsulation",
      "last_edited": "2026-06-19T15:28:00.000Z",
      "tags": ["css", "view-encapsulation", "bem", "tokens", "theme-engine", "stylelint", "eslint"]
    },
    {
      "id": "38480bf9-7f94-812c-a909-e1d7f457e8df",
      "title": "Theming Deep-Dive",
      "last_edited": "2026-06-19T18:47:00.000Z",
      "tags": ["theme-engine", "providePaTheme", "ThemeService", "colores", "HSL", "SSR", "multi-tema"]
    }
  ]
}
```

### Contenido por documento (topic_key: `notion-docs/{doc-id}`)

```json
{
  "id": "35f80bf9-7f94-814a-96d6-ccb90055e545",
  "title": "Architecture & Foundation",
  "last_edited": "2026-06-19T19:44:00.000Z",
  "cached_at": "2026-07-14T00:40:00.000Z",
  "content": "# Project Vision\nBuild an Angular component library...",
  "markdown_length": 12500
}
```

## Decision Gates

| Situación | Acción |
|---|---|
| Índice no existe en Engram | Ejecutar `/sync-notion-docs` automáticamente |
| Documento obsoleto (timestamp cambió) | Re-leer de Notion y actualizar cache |
| Documento fresco (timestamp igual) | Usar cache de Engram |
| Historia menciona concepto no indexado | Buscar en todos los documentos (fallback) |
| Usuario pide "revisar todo" | Modo auditoría completa (leer todos los docs) |
| Error de API de Notion | Reportar error, no fallar silenciosamente |

## Output Contract

Retornar:
- **Resumen de análisis**: Gaps encontrados, documentos consultados
- **Cambios propuestos**: Lista de criterios a actualizar
- **Confirmación de actualización**: Historia actualizada en Notion (si aplica)
- **Estadísticas de cache**: Documentos leídos desde cache vs. re-leídos
- **Learnings guardados**: mem_save con decisiones tomadas

## References

- `assets/document-index-template.json` — Template del índice de documentos
- `assets/tagging-strategy.md` — Estrategia de tagging automático
- `references/notion-api-patterns.md` — Patrones de uso de API de Notion
- `references/engram-cache-patterns.md` — Patrones de cache en Engram
