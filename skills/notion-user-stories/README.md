# Notion User Stories Skill

Skill para crear y revisar historias de usuario de Notion, alineadas automáticamente con la documentación técnica del proyecto usando una estrategia de cache híbrido inteligente.

## Características

- **Cache híbrido inteligente**: Combina cache local en Engram con validación de frescura vía timestamps de Notion
- **Ahorro de tokens**: 60-80% menos tokens vs. leer siempre desde Notion
- **Sincronización incremental**: Solo re-lee documentos que cambiaron
- **Tagging automático**: Genera keywords por documento para matching rápido con historias
- **Alineación automática**: Detecta gaps entre historias y documentación

## Uso

### Revisar historia existente

```
revisar US-11
analizar https://app.notion.com/p/Theme-Engine-extensible-basado-en-tokens-38380bf97f948182b0d2ea54d03720be
```

**Flujo:**
1. Lee la historia desde Notion
2. Determina temas relevantes (tokens, Theme Engine, colores)
3. Carga índice desde Engram (local)
4. Valida frescura de documentos relevantes (3-5 API calls)
5. Si algún documento cambió, re-lee solo ese documento
6. Compara historia contra documentación
7. Identifica gaps de alineación
8. Propone cambios y actualiza en Notion

### Crear nueva historia

```
crear historia de usuario para componente Avatar
```

**Flujo:**
1. Recopila requisitos del usuario
2. Carga documentos relevantes desde cache
3. Genera historia alineada con documentación
4. Crea en Notion
5. Guarda learnings en Engram

### Sincronizar documentos

```
/sync-notion-docs              # Sincronización completa (primera vez)
/sync-notion-docs --incremental # Solo documentos que cambiaron
/sync-notion-docs --force      # Forzar re-lectura de todos
```

## Estrategia híbrida

### Cómo funciona

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuario: "revisar US-11"                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Leer historia desde Notion (1 API call)                  │
│    - retrieve-a-page                                        │
│    - Extraer: título, criterios, notas                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Determinar tema: "Theme Engine, tokens, colores"         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Cargar índice desde Engram (local, 0 API calls)          │
│    - mem_search("notion-docs/index")                        │
│    - Obtener: 18 documentos con tags y last_edited_time    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Filtrar documentos relevantes (local, 0 API calls)       │
│    - Match keywords vs tags                                 │
│    - Seleccionar top 3-5 documentos                         │
│    - Ejemplo: "Theming Deep-Dive", "CSS Strategy",          │
│      "Architecture & Foundation"                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Validar frescura (3-5 API calls)                         │
│    - Para cada documento: retrieve-a-page (solo metadata)   │
│    - Comparar last_edited_time: Engram vs Notion            │
│    - Si cambió → marcar para re-lectura                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Sincronizar documentos obsoletos (0-3 API calls)         │
│    - Solo re-leer documentos marcados                       │
│    - retrieve-page-markdown                                 │
│    - Actualizar cache en Engram                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. Analizar historia                                        │
│    - Leer contenido de documentos relevantes (desde cache)  │
│    - Comparar contra documentación                          │
│    - Identificar gaps                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. Actualizar en Notion (si es necesario)                   │
│    - patch-page con criterios actualizados                  │
└─────────────────────────────────────────────────────────────┘
```

### Estimación de costos

| Escenario | API calls | Tokens | Tiempo |
|---|---|---|---|
| Todo fresco (90% casos) | 4-6 | ~2000-3000 | 10-15s |
| Con cambios (10% casos) | 6-9 | ~3000-5000 | 15-25s |
| Primera ejecución | 18+ | ~6000-8000 | 30-60s |

**Ahorro vs. leer siempre:** 60-80% menos tokens

## Estructura de archivos

```
skills/notion-user-stories/
├── SKILL.md                              # Skill principal
├── README.md                             # Este archivo
├── assets/
│   ├── document-index-template.json     # Template del índice
│   ├── tagging-strategy.md              # Estrategia de tagging
│   └── initialization-script.md         # Script de inicialización
└── references/
    ├── notion-api-patterns.md           # Patrones de API de Notion
    └── engram-cache-patterns.md         # Patrones de cache en Engram
```

## Estructura del cache en Engram

### Índice de documentos

```json
{
  "parent_page_id": "35f80bf9-7f94-80d7-83ff-e06cb99a1505",
  "last_synced": "2026-07-14T00:40:00.000Z",
  "documents": [
    {
      "id": "35f80bf9-7f94-814a-96d6-ccb90055e545",
      "title": "Architecture & Foundation",
      "last_edited": "2026-06-19T19:44:00.000Z",
      "tags": ["arquitectura", "tokens", "standalone", "signals"]
    }
  ]
}
```

### Contenido por documento

```json
{
  "id": "35f80bf9-7f94-814a-96d6-ccb90055e545",
  "title": "Architecture & Foundation",
  "last_edited": "2026-06-19T19:44:00.000Z",
  "cached_at": "2026-07-14T00:40:00.000Z",
  "content": "# Project Vision\n...",
  "tags": ["arquitectura", "tokens", "standalone"]
}
```

## Comandos

| Comando | Descripción |
|---|---|
| `revisar US-XX` | Revisar historia existente |
| `analizar <url>` | Analizar historia por URL de Notion |
| `crear historia` | Crear nueva historia de usuario |
| `/sync-notion-docs` | Sincronizar todos los documentos |
| `/sync-notion-docs --incremental` | Solo documentos que cambiaron |
| `/sync-notion-docs --force` | Forzar re-lectura completa |

## Decisiones de diseño

### ¿Por qué cache híbrido y no solo cache?

- **Cache puro**: Rápido pero datos pueden quedar obsoletos
- **Leer siempre**: Datos frescos pero alto costo de tokens
- **Híbrido**: Datos frescos + bajo costo (validación selectiva)

### ¿Por qué validar solo documentos relevantes?

- Validar los 18 documentos = 18 API calls innecesarios
- Una historia típicamente relate a 3-5 documentos
- Ahorro: 70-80% de API calls

### ¿Por qué tags y no búsqueda full-text?

- Tags permiten matching semántico rápido
- Búsqueda full-text en Engram es lenta para 18 documentos
- Tags se generan automáticamente del contenido

## Limitaciones

- **Primera ejecución lenta**: Debe sincronizar los 18 documentos (~60s)
- **Depende de API de Notion**: Rate limits pueden afectar performance
- **Tags no perfectos**: Matching basado en keywords puede tener falsos positivos/negativos
- **Cache manual**: No hay detección automática de cambios (requiere validación)

## Mantenimiento

### Ejecutar semanalmente

```
/sync-notion-docs --incremental
```

### Ejecutar después de cambios masivos

```
/sync-notion-docs --force
```

### Monitorear uso de API

- Notion: 3 requests/second, 20 burst
- Engram: Sin límites documentados
- Recomendación: No más de 10 requests en paralelo

## Métricas

### Estadísticas de cache

La skill reporta al final de cada sesión:
- Documentos leídos desde cache
- Documentos re-leídos desde Notion
- API calls totales
- Tokens ahorrados vs. leer siempre

### Ejemplo

```
Sesión: Revisar US-11
- Documentos consultados: 3
- Leídos desde cache: 2
- Re-leídos desde Notion: 1
- API calls totales: 5
- Tokens ahorrados: ~2500 (45%)
```

## Troubleshooting

### "Índice no encontrado"

**Solución:** Ejecutar `/sync-notion-docs` para crear el índice inicial.

### "Documento obsoleto"

**Solución:** Normal, la skill re-lee automáticamente. Si ocurre muy seguido, ejecutar `/sync-notion-docs --incremental` más frecuentemente.

### "Rate limit exceeded"

**Solución:** Esperar 1-2 minutos y reintentar. La skill tiene retry automático con exponential backoff.

### "Tags no relevantes"

**Solución:** Los tags se generan automáticamente. Si el matching es pobre, revisar `assets/tagging-strategy.md` y ajustar el diccionario de keywords.

## Futuras mejoras

- [ ] Detección automática de cambios (webhook de Notion)
- [ ] Tags generados por LLM (más precisos)
- [ ] Cache distribuido (compartir entre sesiones de equipo)
- [ ] Métricas de calidad de matching (precisión, cobertura)
- [ ] Integración con SDD (Spec-Driven Development)

## Licencia

Apache-2.0

## Autor

jfernandezo

## Versión

1.0
