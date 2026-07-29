# GitHub Issues from Docs Skill

Skill para crear y revisar issues de GitHub, alineados automáticamente con la
documentación técnica del proyecto (cacheada desde el GitHub Wiki) usando una
estrategia de cache híbrido inteligente.

El GitHub Wiki (`https://github.com/JosepFernande/pa-ui.wiki.git`) actúa
**exclusivamente como fuente de documentación de solo lectura** (arquitectura,
theming, CSS, testing, release, etc.). La creación y actualización de work items
(antes "historias de usuario") ocurre siempre en GitHub Issues vía `gh` CLI,
para integrarse de forma nativa con PRs.

## Características

- **Cache híbrido inteligente**: Combina cache local en Engram con validación de
  frescura vía el HEAD SHA del repo git del Wiki
- **Ahorro de tokens**: 60-80% menos tokens vs. leer siempre desde el clone del
  Wiki, y prácticamente 0 tokens en el chequeo de frescura cuando nada cambió
- **Sincronización incremental**: Solo re-lee páginas que cambiaron (vía
  `git diff --name-only` entre el SHA cacheado y el HEAD actual)
- **Tagging automático**: Genera keywords por página para matching rápido con
  issues
- **Alineación automática**: Detecta gaps entre issues de GitHub y documentación
- **Wiki read-only**: nunca se hace `git push` al repo del Wiki; toda la
  escritura ocurre vía `gh issue create` / `gh issue edit` / `gh issue comment`

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
4. Asegura el clone local del Wiki (`git clone` o `git pull --ff-only`) y
   compara el HEAD actual contra `last_synced_head_sha` (1 comparación de
   string, no una llamada por página)
5. Si el HEAD cambió, usa `git diff --name-only` para saber qué páginas `.md`
   cambiaron y re-lee solo esas
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
2. Carga páginas relevantes desde cache
3. Genera el body del issue alineado con documentación (formato
   Como/Quiero/Para + criterios de aceptación, o la plantilla de
   `.github/ISSUE_TEMPLATE` si existe)
4. Crea el issue con `gh issue create --title ... --body ... --label ...`
5. Guarda learnings en Engram

### Sincronizar documentos de referencia

```
/sync-wiki-docs              # Sincronización completa (primera vez)
/sync-wiki-docs --incremental # Solo páginas que cambiaron
/sync-wiki-docs --force      # Forzar re-lectura de todas
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
│ 4. Cargar índice desde Engram (local, 0 operaciones git)    │
│    - mem_search("wiki-docs/index")                          │
│    - Obtener: ~17 páginas con tags y last_commit_sha        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Filtrar páginas relevantes (local, 0 operaciones git)    │
│    - Match keywords vs tags                                 │
│    - Seleccionar top 3-5 páginas                             │
│    - Ejemplo: "Theming-Deep-Dive", "CSS-Strategy-and-View-  │
│      Encapsulation", "Architecture-and-Foundation"           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Validar frescura (1 operación git: comparar HEAD SHA)    │
│    - Asegurar clone: git clone o git pull --ff-only          │
│    - git rev-parse HEAD vs last_synced_head_sha cacheado    │
│    - Si son iguales → todo fresco, 0 lecturas de archivo    │
│    - Si difieren → git diff --name-only <old> <new> -- '*.md'│
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Sincronizar páginas obsoletas (0-N lecturas de archivo)   │
│    - Solo re-leer las páginas listadas en el diff            │
│    - Read tool sobre el archivo .md en el clone local         │
│    - Actualizar cache en Engram                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. Analizar issue                                            │
│    - Leer contenido de páginas relevantes (desde cache)      │
│    - Comparar contra documentación                           │
│    - Identificar gaps                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. Actualizar en GitHub (si es necesario)                    │
│    - gh issue edit / gh issue comment con criterios          │
│      actualizados                                            │
└─────────────────────────────────────────────────────────────┘
```

### Estimación de costos

| Escenario                     | Operaciones git             | Tokens     | Tiempo |
| ----------------------------- | --------------------------- | ---------- | ------ |
| Todo fresco (90% casos)       | 2 (pull + rev-parse)        | ~20-50     | 2-5s   |
| Con cambios (10% casos)       | 3 (pull + rev-parse + diff) | ~2000-3000 | 10-15s |
| Primera ejecución (sin cache) | 1 clone + N lecturas        | ~6000-8000 | 20-40s |

**Ahorro vs. el mecanismo anterior:** el chequeo de frescura pasa de O(N)
llamadas a la API (~150 tokens por página, ~2550 tokens totales para 17 páginas)
a O(1) — una sola comparación de string entre el HEAD cacheado y el HEAD actual
(~20-30 tokens), sin importar cuántas páginas tenga el Wiki. El costo de releer
el contenido de una página que sí cambió no cambia (proporcional al tamaño del
archivo); lo que se elimina es el costo de _detectar_ qué cambió.

Nota: la creación/edición del issue en GitHub vía `gh` no consume operaciones
del clone del Wiki; el costo anterior se refiere solo a la lectura de
documentación de referencia. Tampoco hay rate limiting que gestionar: no hay
llamadas por página, solo un `git pull` de red por ejecución.

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
    ├── wiki-git-patterns.md             # Patrones de git sobre el Wiki (solo lectura)
    └── engram-cache-patterns.md         # Patrones de cache en Engram
```

El clone local del Wiki vive en `.wiki-cache/pa-ui.wiki` (raíz del repo,
ignorado por git).

## Estructura del cache en Engram

### Índice de páginas

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
      "tags": ["arquitectura", "tokens", "standalone", "signals"]
    }
  ]
}
```

### Contenido por página

```json
{
  "page": "Architecture-and-Foundation",
  "file": "Architecture-and-Foundation.md",
  "last_commit_sha": "a1b2c3d4e5f6...",
  "cached_at": "2026-07-29T00:40:00.000Z",
  "content": "# Project Vision\n...",
  "tags": ["arquitectura", "tokens", "standalone"]
}
```

### Análisis de issues (Engram)

```json
{
  "issue_number": 42,
  "title": "Theme Engine extensible basado en tokens",
  "analyzed_at": "2026-07-29T00:35:00.000Z",
  "documents_consulted": [
    "Theming-Deep-Dive",
    "CSS-Strategy-and-View-Encapsulation"
  ],
  "gaps_found": ["Falta algoritmo de derivación HSL"],
  "topic_key": "github-issue/42/analysis"
}
```

## Comandos

| Comando                              | Descripción                                 |
| ------------------------------------ | ------------------------------------------- |
| `revisar US-XX` / `revisar issue #N` | Revisar issue existente                     |
| `alinear issue #N con documentación` | Analizar issue por número                   |
| `crear issue`                        | Crear nuevo issue de GitHub                 |
| `/sync-wiki-docs`                    | Sincronizar todas las páginas de referencia |
| `/sync-wiki-docs --incremental`      | Solo páginas que cambiaron                  |
| `/sync-wiki-docs --force`            | Forzar re-lectura completa                  |

## Decisiones de diseño

### ¿Por qué GitHub Issues para los work items?

- Los issues de GitHub se integran de forma nativa con PRs, commits y CI/CD
- `gh` CLI permite crear/editar/comentar issues sin salir del flujo de
  desarrollo
- La documentación de referencia estable (arquitectura, theming, CSS, etc.), que
  cambia con mucha menor frecuencia que los work items, vive en el Wiki

### ¿Por qué la documentación de referencia vive en GitHub Wiki?

Nota histórica: esta documentación vivía antes en Notion. Ese sistema perdió su
único rol activo en el flujo de trabajo cuando las 2 databases de historias de
usuario que quedaban se migraron 100% a GitHub Issues, así que las 17 páginas de
documentación de referencia se migraron también, al GitHub Wiki del propio repo
(`pa-ui.wiki.git`). El Wiki se versiona con git como el resto del proyecto y no
depende de una API externa de terceros.

### ¿Por qué cache híbrido y no solo cache?

- **Cache puro**: Rápido pero datos pueden quedar obsoletos
- **Leer siempre**: Datos frescos pero alto costo de tokens
- **Híbrido**: Datos frescos + bajo costo (validación selectiva vía HEAD SHA)

### ¿Por qué validar solo páginas relevantes?

- Re-leer las ~17 páginas completas en cada ejecución sería derrochador
- Un issue típicamente se relaciona con 3-5 páginas
- El chequeo de frescura ya es O(1) gracias al HEAD SHA; la selección de páginas
  relevantes ahorra, además, las lecturas de contenido innecesarias

### ¿Por qué tags y no búsqueda full-text?

- Tags permiten matching semántico rápido
- Búsqueda full-text en Engram es lenta para ~17 páginas
- Tags se generan automáticamente del contenido

## Limitaciones

- **Primera ejecución lenta**: Debe clonar el Wiki y leer las ~17 páginas
  (~20-40s)
- **Depende de disponibilidad del repo git del Wiki**: si `pa-ui.wiki.git` no
  existe (repo nuevo sin ninguna página creada aún) o el `git pull` falla, la
  sincronización no puede completarse
- **Tags no perfectos**: Matching basado en keywords puede tener falsos
  positivos/negativos
- **Cache manual**: No hay detección automática de cambios remotos entre
  ejecuciones (requiere `git pull` + comparación de HEAD en cada corrida)

## Mantenimiento

### Ejecutar semanalmente

```
/sync-wiki-docs --incremental
```

### Ejecutar después de cambios masivos en la documentación

```
/sync-wiki-docs --force
```

### Monitorear el clone local

- No hay rate limiting que gestionar (no hay llamadas por página, solo
  `git pull` de red)
- GitHub (`gh` CLI): sujeto a rate limits de la API de GitHub para issues
- Recomendación: correr `git -C .wiki-cache/pa-ui.wiki pull --ff-only` antes de
  cualquier lectura, para no operar sobre un clone desactualizado

## Métricas

### Estadísticas de cache

La skill reporta al final de cada sesión:

- Páginas de referencia leídas desde cache
- Páginas re-leídas desde el clone del Wiki
- Operaciones git totales (clone/pull/rev-parse/diff)
- Tokens ahorrados vs. leer siempre

### Ejemplo

```
Sesión: Revisar issue #11 (US-11)
- Páginas consultadas: 3
- Leídas desde cache: 3
- Re-leídas del Wiki: 0
- Operaciones git: 2 (pull + rev-parse)
- Tokens ahorrados: ~2500 (~98% del chequeo de frescura)
- Resultado: gh issue edit #11 actualizado
```

## Troubleshooting

### "Índice no encontrado"

**Solución:** Ejecutar `/sync-wiki-docs` para crear el índice inicial.

### "Página obsoleta"

**Solución:** Normal, la skill re-lee automáticamente la página listada en
`git diff --name-only`. Si ocurre muy seguido, ejecutar
`/sync-wiki-docs --incremental` más frecuentemente.

### "git pull falla (non-fast-forward)"

**Solución:** El clone local diverge del remoto (edición manual dentro de
`.wiki-cache/pa-ui.wiki`, lo cual no debería ocurrir ya que la skill nunca
escribe ahí). Borrar el directorio y volver a clonar:
`rm -rf .wiki-cache/pa-ui.wiki && git clone https://github.com/JosepFernande/pa-ui.wiki.git .wiki-cache/pa-ui.wiki`.

### "Repo del Wiki no encontrado (clone falla)"

**Solución:** Ver `references/wiki-git-patterns.md`. Un repo de Wiki de GitHub
no existe hasta que se crea al menos una página manualmente desde la UI; en
`pa-ui` el Wiki ya está poblado (17 páginas + `Home.md` + `_Sidebar.md`), así
que este caso solo debería reaparecer si el Wiki se recrea desde cero.

### "Tags no relevantes"

**Solución:** Los tags se generan automáticamente. Si el matching es pobre,
revisar `assets/tagging-strategy.md` y ajustar el diccionario de keywords.

## Futuras mejoras

- [ ] Detección automática de cambios (webhook de GitHub sobre el Wiki)
- [ ] Tags generados por LLM (más precisos)
- [ ] Cache distribuido (compartir entre sesiones de equipo)
- [ ] Métricas de calidad de matching (precisión, cobertura)
- [ ] Integración con SDD (Spec-Driven Development)

## Licencia

Apache-2.0

## Autor

jfernandezo

## Versión

3.0
