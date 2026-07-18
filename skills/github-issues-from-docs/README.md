# GitHub Issues from Docs Skill

Skill para crear y revisar issues de GitHub, alineados automáticamente con la
documentación técnica del proyecto (cacheada desde Notion) usando una estrategia
de cache híbrido inteligente.

Notion actúa **exclusivamente como fuente de documentación de solo lectura**
(arquitectura, theming, CSS, testing, release, etc.). La creación y
actualización de work items (antes "historias de usuario") ocurre siempre en
GitHub Issues vía `gh` CLI, para integrarse de forma nativa con PRs.

## Características

- **Cache híbrido inteligente**: Combina cache local en Engram con validación de
  frescura vía timestamps de Notion
- **Ahorro de tokens**: 60-80% menos tokens vs. leer siempre desde Notion
- **Sincronización incremental**: Solo re-lee documentos que cambiaron
- **Tagging automático**: Genera keywords por documento para matching rápido con
  issues
- **Alineación automática**: Detecta gaps entre issues de GitHub y documentación
- **Notion read-only**: nunca se escribe en Notion; toda la escritura ocurre vía
  `gh issue create` / `gh issue edit` / `gh issue comment`

## Uso

### Revisar issue existente

```
revisar US-11
revisar issue #42
alinear issue #42 con documentación
```

**Flujo:**

1. Lee el issue desde GitHub:
   `gh issue view <number> --json title,body,labels,comments`
2. Determina temas relevantes (tokens, Theme Engine, colores, etc.)
3. Carga índice de documentación desde Engram (local)
4. Valida frescura de documentos relevantes (3-5 API calls a Notion)
5. Si algún documento cambió, re-lee solo ese documento
6. Compara el issue contra la documentación
7. Identifica gaps de alineación
8. Propone cambios y, si el usuario aprueba, actualiza el issue con
   `gh issue edit` / `gh issue comment`

### Crear nuevo issue

```
crear issue para componente Avatar
```

**Flujo:**

1. Recopila requisitos del usuario
2. Carga documentos relevantes desde cache
3. Genera el body del issue alineado con documentación (formato
   Como/Quiero/Para + criterios de aceptación, o la plantilla de
   `.github/ISSUE_TEMPLATE` si existe)
4. Crea el issue con `gh issue create --title ... --body ... --label ...`
5. Guarda learnings en Engram

### Sincronizar documentos de referencia

```
/sync-notion-docs              # Sincronización completa (primera vez)
/sync-notion-docs --incremental # Solo documentos que cambiaron
/sync-notion-docs --force      # Forzar re-lectura de todos
```

## Estrategia híbrida

### Cómo funciona

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuario: "revisar US-11" / "revisar issue #42"            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Leer issue desde GitHub (gh issue view)                  │
│    - Extraer: título, body, labels, comentarios              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Determinar tema: "Theme Engine, tokens, colores"         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Cargar índice desde Engram (local, 0 API calls)          │
│    - mem_search("notion-docs/index")                        │
│    - Obtener: ~18 documentos con tags y last_edited_time    │
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
│ 6. Validar frescura (3-5 API calls a Notion)                │
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
│ 8. Analizar issue                                            │
│    - Leer contenido de documentos relevantes (desde cache)  │
│    - Comparar contra documentación                           │
│    - Identificar gaps                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. Actualizar en GitHub (si es necesario)                    │
│    - gh issue edit / gh issue comment con criterios          │
│      actualizados                                            │
└─────────────────────────────────────────────────────────────┘
```

### Estimación de costos

| Escenario                     | API calls a Notion | Tokens     | Tiempo |
| ----------------------------- | ------------------ | ---------- | ------ |
| Todo fresco (90% casos)       | 4-6                | ~2000-3000 | 10-15s |
| Con cambios (10% casos)       | 6-9                | ~3000-5000 | 15-25s |
| Primera ejecución (sin cache) | 18+                | ~6000-8000 | 30-60s |

**Ahorro vs. leer siempre:** 60-80% menos tokens

Nota: la creación/edición del issue en GitHub vía `gh` no consume API calls de
Notion; el costo anterior se refiere solo a la lectura de documentación de
referencia.

## Estructura de archivos

```
skills/github-issues-from-docs/
├── SKILL.md                              # Skill principal
├── README.md                             # Este archivo
├── assets/
│   ├── document-index-template.json     # Template del índice
│   ├── tagging-strategy.md              # Estrategia de tagging
│   ├── initialization-script.md         # Script de inicialización
│   └── usage-examples.md                # Ejemplos de flujo completo
└── references/
    ├── notion-api-patterns.md           # Patrones de API de Notion (solo lectura)
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

### Análisis de issues (Engram)

```json
{
  "issue_number": 42,
  "title": "Theme Engine extensible basado en tokens",
  "analyzed_at": "2026-07-17T00:35:00.000Z",
  "documents_consulted": ["35f80bf9-7f94-814a-96d6-ccb90055e545"],
  "gaps_found": ["Falta algoritmo de derivación HSL"],
  "topic_key": "github-issue/42/analysis"
}
```

## Comandos

| Comando                              | Descripción                                    |
| ------------------------------------ | ---------------------------------------------- |
| `revisar US-XX` / `revisar issue #N` | Revisar issue existente                        |
| `alinear issue #N con documentación` | Analizar issue por número                      |
| `crear issue`                        | Crear nuevo issue de GitHub                    |
| `/sync-notion-docs`                  | Sincronizar todos los documentos de referencia |
| `/sync-notion-docs --incremental`    | Solo documentos que cambiaron                  |
| `/sync-notion-docs --force`          | Forzar re-lectura completa                     |

## Decisiones de diseño

### ¿Por qué GitHub Issues y no Notion?

- Los issues de GitHub se integran de forma nativa con PRs, commits y CI/CD
- `gh` CLI permite crear/editar/comentar issues sin salir del flujo de
  desarrollo
- Notion queda reservado a documentación de referencia estable (arquitectura,
  theming, CSS, etc.), que cambia con mucha menor frecuencia que los work items

### ¿Por qué cache híbrido y no solo cache?

- **Cache puro**: Rápido pero datos pueden quedar obsoletos
- **Leer siempre**: Datos frescos pero alto costo de tokens
- **Híbrido**: Datos frescos + bajo costo (validación selectiva)

### ¿Por qué validar solo documentos relevantes?

- Validar los ~18 documentos = ~18 API calls innecesarios
- Un issue típicamente se relaciona con 3-5 documentos
- Ahorro: 70-80% de API calls

### ¿Por qué tags y no búsqueda full-text?

- Tags permiten matching semántico rápido
- Búsqueda full-text en Engram es lenta para ~18 documentos
- Tags se generan automáticamente del contenido

## Limitaciones

- **Primera ejecución lenta**: Debe sincronizar los ~18 documentos (~60s)
- **Depende de API de Notion**: Rate limits pueden afectar performance de la
  sincronización de docs
- **Tags no perfectos**: Matching basado en keywords puede tener falsos
  positivos/negativos
- **Cache manual**: No hay detección automática de cambios (requiere validación)

## Mantenimiento

### Ejecutar semanalmente

```
/sync-notion-docs --incremental
```

### Ejecutar después de cambios masivos en la documentación

```
/sync-notion-docs --force
```

### Monitorear uso de API

- Notion: 3 requests/second, 20 burst
- Engram: Sin límites documentados
- GitHub (`gh` CLI): sujeto a rate limits de la API de GitHub
- Recomendación: No más de 10 requests en paralelo

## Métricas

### Estadísticas de cache

La skill reporta al final de cada sesión:

- Documentos de referencia leídos desde cache
- Documentos re-leídos desde Notion
- API calls totales a Notion
- Tokens ahorrados vs. leer siempre

### Ejemplo

```
Sesión: Revisar issue #11 (US-11)
- Documentos consultados: 3
- Leídos desde cache: 2
- Re-leídos desde Notion: 1
- API calls a Notion: 5
- Tokens ahorrados: ~2500 (45%)
- Resultado: gh issue edit #11 actualizado
```

## Troubleshooting

### "Índice no encontrado"

**Solución:** Ejecutar `/sync-notion-docs` para crear el índice inicial.

### "Documento obsoleto"

**Solución:** Normal, la skill re-lee automáticamente. Si ocurre muy seguido,
ejecutar `/sync-notion-docs --incremental` más frecuentemente.

### "Rate limit exceeded"

**Solución:** Esperar 1-2 minutos y reintentar. La skill tiene retry automático
con exponential backoff.

### "Tags no relevantes"

**Solución:** Los tags se generan automáticamente. Si el matching es pobre,
revisar `assets/tagging-strategy.md` y ajustar el diccionario de keywords.

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

2.0
