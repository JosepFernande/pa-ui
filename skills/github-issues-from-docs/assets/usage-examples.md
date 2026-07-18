# Ejemplos de Uso

## Ejemplo 1: Revisar issue existente (caso común - todo fresco)

### Input del usuario

```
revisar US-11
```

### Flujo de ejecución

```
[Skill] Iniciando revisión de US-11 (issue #11)...

[1/9] Leyendo issue desde GitHub...
  → gh issue view 11 --json title,body,labels,comments
  → Título: "Theme Engine extensible basado en tokens"
  → Criterios: 11 criterios encontrados en el body

[2/9] Determinando tema del issue...
  → Keywords extraídas: "Theme Engine", "providePaTheme", "colores", "tokens"
  → Tema: Theming, tokens, colores personalizados

[3/9] Cargando índice desde Engram...
  → mem_search("notion-docs/index")
  → Índice encontrado: 17 documentos
  → Última sincronización: 2026-07-14T00:40:00.000Z

[4/9] Filtrando documentos relevantes...
  → Match de keywords vs tags:
    - "Theming Deep-Dive" → score: 0.8 (tags: theme-engine, providePaTheme, colores)
    - "CSS Strategy" → score: 0.6 (tags: tokens, theme-engine)
    - "Architecture & Foundation" → score: 0.5 (tags: tokens, arquitectura)
  → Documentos seleccionados: 3

[5/9] Validando frescura de documentos...
  → retrieve-a-page para cada documento (solo metadata)
  → "Theming Deep-Dive": last_edited igual → FRESCO
  → "CSS Strategy": last_edited igual → FRESCO
  → "Architecture & Foundation": last_edited igual → FRESCO
  → Resultado: 0 documentos obsoletos

[6/9] Cargando contenido desde cache...
  → mem_get_observation para cada documento
  → 3 documentos cargados desde Engram (0 API calls adicionales a Notion)

[7/9] Analizando issue contra documentación...
  → Comparando criterios del issue #11 vs documentación:
    ✓ Theme Engine centralizado en core/theme
    ✓ providePaTheme() expuesto
    ✓ Default theme funcional
    ✗ Falta: estructura de archivos específica (theme-engine.ts, theme-provider.ts, etc.)
    ✗ Falta: algoritmo de derivación HSL (hover +8%, active -8%, contrast WCAG)
    ✗ Falta: ThemeService runtime API (applyTheme, overrideColor, reset)
    ✗ Falta: SSR safety (TransferState)
    ✗ Falta: normalización de nombres de colores ([a-z0-9-])
  → Gaps encontrados: 5

[8/9] Generando propuesta de cambios...
  → Criterios actuales: 11
  → Criterios propuestos: 22
  → Cambios: agregar estructura de archivos, algoritmo HSL, ThemeService, SSR, normalización

[9/9] Actualizando issue en GitHub...
  → gh issue edit 11 --body "<body actualizado con 22 criterios>"
  → Actualización exitosa

[Resumen]
  ✓ Issue #11 (US-11) revisado y actualizado en GitHub
  ✓ Documentos consultados: 3 (todos desde cache)
  ✓ API calls a Notion: 3 (solo validaciones de frescura)
  ✓ Tokens usados: ~2500
  ✓ Tokens ahorrados vs. leer siempre: ~3500 (58%)
  ✓ Gaps encontrados: 5
  ✓ Criterios agregados: 11
```

## Ejemplo 2: Revisar issue con documento de referencia obsoleto

### Input del usuario

```
revisar issue #8
```

### Flujo de ejecución

```
[Skill] Iniciando revisión del issue #8...

[1/9] Leyendo issue desde GitHub...
  → gh issue view 8 --json title,body,labels,comments
  → Título: "Configurar ESLint y Prettier para DX consistente"

[2/9] Determinando tema...
  → Keywords: "ESLint", "Prettier", "Stylelint", "custom rules"
  → Tema: Tooling, linting, validación de código

[3/9] Cargando índice desde Engram...
  → Índice encontrado: 17 documentos

[4/9] Filtrando documentos relevantes...
  → Documentos seleccionados: 4
    - "CSS Strategy" (tags: stylelint, eslint, custom-rules)
    - "Architecture & Foundation" (tags: arquitectura)
    - "CI/CD Pipeline" (tags: ci, pre-commit)
    - "Contribution Guidelines" (tags: code-review)

[5/9] Validando frescura...
  → "CSS Strategy": last_edited DIFERENTE → OBSOLETO
    - Engram: 2026-06-19T15:28:00.000Z
    - Notion: 2026-07-13T10:15:00.000Z
  → "Architecture & Foundation": FRESCO
  → "CI/CD Pipeline": FRESCO
  → "Contribution Guidelines": FRESCO
  → Resultado: 1 documento obsoleto

[6/9] Sincronizando documento obsoleto...
  → retrieve-page-markdown("CSS Strategy")
  → Contenido actualizado: 15000 caracteres
  → Guardando en Engram...
  → Cache actualizado

[7/9] Cargando contenido...
  → 4 documentos cargados (1 desde Notion, 3 desde cache)

[8/9] Analizando issue...
  → Gaps encontrados:
    ✗ Falta: Stylelint con custom rules
    ✗ Falta: ESLint custom rules (ViewEncapsulation.None, color string, 400 líneas)
    ✗ Falta: Periodic audit script
    ✗ Falta: CI falla build si reglas fallan
  → Gaps encontrados: 4

[9/9] Actualizando issue...
  → gh issue edit 8 --body "<body actualizado con 9 criterios>"
  → Actualización exitosa

[Resumen]
  ✓ Issue #8 revisado y actualizado en GitHub
  ✓ Documentos consultados: 4 (3 desde cache, 1 re-leído)
  ✓ API calls a Notion: 5 (4 validaciones + 1 re-lectura)
  ✓ Tokens usados: ~3200
  ✓ Tokens ahorrados vs. leer siempre: ~2800 (47%)
  ✓ Gaps encontrados: 4
  ✓ Criterios agregados: 9
```

## Ejemplo 3: Crear nuevo issue

### Input del usuario

```
crear issue para componente Avatar
```

### Flujo de ejecución

```
[Skill] Iniciando creación de issue para Avatar...

[1/5] Recopilando requisitos...
  → Usuario: "componente Avatar con imagen, iniciales, tamaños y colores dinámicos"

[2/5] Cargando documentos relevantes...
  → Keywords: "Avatar", "componente", "imagen", "tamaños", "colores"
  → Documentos seleccionados: 3
    - "Architecture & Foundation" (componentes, tokens)
    - "CSS Strategy" (BEM, ViewEncapsulation, tokens)
    - "Theming Deep-Dive" (colores dinámicos)
  → Todos frescos, cargados desde cache

[3/5] Generando body del issue alineado con documentación...
  → Analizando patrones de issues previos (Button, Badge)
  → Generando criterios basados en arquitectura:
    - Input color (string, abierto — Theme Engine)
    - Input size (sm | md | lg)
    - Input src (URL de imagen)
    - Input initials (fallback cuando no hay imagen)
    - ViewEncapsulation.None
    - Clases CSS con prefijo pa- (BEM)
    - Solo tokens CSS
    - Compatible con providePaTheme()
    - Signals + OnPush
    - Tipado sin any
    - Archivo bajo 400 líneas

[4/5] Creando issue en GitHub...
  → gh issue create --title "Crear componente Avatar" --label "component,enhancement" --body "..."
  → Como: "developer que usa la librería"
  → Quiero: "un componente Avatar con soporte para imagen, iniciales, tamaños y colores dinámicos vía Theme Engine"
  → Para: "mostrar avatares de usuarios de forma consistente sin CSS custom"
  → Criterios: 11 criterios
  → Creación exitosa: issue #15

[5/5] Guardando learnings...
  → mem_save con decisión de diseño
  → topic_key: "github-issue/15/analysis"

[Resumen]
  ✓ Issue #15 creado exitosamente en GitHub
  ✓ Alineado con: Architecture Foundation, CSS Strategy, Theming Deep-Dive
  ✓ Documentos consultados: 3 (todos desde cache)
  ✓ API calls a Notion: 0 (documentación 100% desde cache)
  ✓ Tokens usados: ~1800
  ✓ Criterios generados: 11
```

## Ejemplo 4: Primera ejecución (sin cache de documentación)

### Input del usuario

```
revisar US-4
```

### Flujo de ejecución (primera vez)

```
[Skill] Iniciando revisión de US-4 (issue #4)...
[Skill] Índice de documentación no encontrado en Engram. Ejecutando sincronización inicial...

[SYNC] Sincronizando documentos de referencia de Notion...
  → Leyendo lista de documentos desde Notion...
  → 17 documentos encontrados

  [1/17] Architecture & Foundation...
    → retrieve-page-markdown... 12500 caracteres
    → Generando tags... 8 tags
    → Guardando en Engram...

  [2/17] CSS Strategy & View Encapsulation...
    → retrieve-page-markdown... 15000 caracteres
    → Generando tags... 10 tags
    → Guardando en Engram...

  ... (15 documentos más) ...

  [17/17] AI Code Review with gga...
    → retrieve-page-markdown... 3000 caracteres
    → Generando tags... 5 tags
    → Guardando en Engram...

  → Guardando índice en Engram...
  → Sincronización completada: 17 documentos, 120 tags generados

[Skill] Continuando con revisión del issue #4...

[1/9] Leyendo issue desde GitHub...
  → gh issue view 4 --json title,body,labels,comments
  → Título: "Crear componente Button con variantes"

[2/9] Determinando tema...
  → Keywords: "Button", "variantes", "tamaños", "colores"

[3/9] Cargando índice desde Engram...
  → Índice encontrado: 17 documentos

[4/9] Filtrando documentos relevantes...
  → Documentos seleccionados: 3

[5/9] Validando frescura...
  → Todos frescos (acaban de ser sincronizados)

[6/9] Cargando contenido desde cache...
  → 3 documentos cargados desde Engram

[7/9] Analizando issue...
  → Gaps encontrados:
    ✗ Confusión variante vs. color (primary es color, no variante)
    ✗ Falta input color como string abierto
    ✗ Falta ViewEncapsulation.None
    ✗ Falta BEM con prefijo pa-
    ✗ Falta compatibilidad con Theme Engine
  → Gaps encontrados: 5

[8/9] Generando propuesta...
  → Cambios en "Quiero...": separar variantes (solid/outline/ghost) de colores (Theme Engine)
  → Cambios en criterios: agregar 5 criterios arquitectónicos

[9/9] Actualizando issue...
  → gh issue edit 4 --body "<body actualizado>"
  → Actualización exitosa

[Resumen]
  ✓ Issue #4 (US-4) revisado y actualizado en GitHub
  ✓ Sincronización inicial de documentación: 17 documentos (primera vez)
  ✓ Documentos consultados: 3 (todos desde cache tras el sync)
  ✓ API calls a Notion: 34 (17×2 sincronización, 0 validaciones adicionales)
  ✓ Tokens usados: ~8500 (sincronización) + ~2000 (revisión) = ~10500
  ✓ Tokens ahorrados en futuras ejecuciones: ~60% por revisión
  ✓ Gaps encontrados: 5
  ✓ Criterios actualizados: 5 → 10
```

## Ejemplo 5: Comando de sincronización

### Input del usuario

```
/sync-notion-docs --incremental
```

### Flujo de ejecución

```
[Skill] Iniciando sincronización incremental...

[1/3] Cargando índice desde Engram...
  → Índice encontrado: 17 documentos
  → Última sincronización: 2026-07-14T00:40:00.000Z

[2/3] Validando frescura de todos los documentos...
  → retrieve-a-page para cada documento (solo metadata)
  → [1/17] Architecture & Foundation: FRESCO
  → [2/17] CSS Strategy: FRESCO
  → [3/17] Versioning & Breaking Changes: OBSOLETO
    - Engram: 2026-06-19T19:44:00.000Z
    - Notion: 2026-07-14T15:30:00.000Z
  → [4/17] Testing Strategy: FRESCO
  → ... (13 documentos más) ...
  → [17/17] AI Code Review: FRESCO

  → Resultado: 1 documento obsoleto

[3/3] Sincronizando documentos obsoletos...
  → [1/1] Versioning & Breaking Changes...
    → retrieve-page-markdown... 8500 caracteres
    → Generando tags... 7 tags
    → Actualizando cache en Engram...
    → Actualizando índice...

[Resumen]
  ✓ Sincronización incremental completada
  ✓ Documentos validados: 17
  ✓ Documentos actualizados: 1
  ✓ API calls a Notion: 18 (17 validaciones + 1 re-lectura)
  ✓ Tiempo total: ~20 segundos
```

## Comparación de escenarios

| Escenario                             | API calls a Notion | Tokens | Tiempo | Cache hit rate |
| ------------------------------------- | ------------------ | ------ | ------ | -------------- |
| Revisar issue (todo fresco)           | 3-5                | ~2500  | 10-15s | 100%           |
| Revisar issue (1 doc obsoleto)        | 5-8                | ~3200  | 15-25s | 75%            |
| Crear nuevo issue                     | 0-3                | ~1800  | 5-10s  | 100%           |
| Primera ejecución (sin cache)         | 34+                | ~10500 | 60-90s | 0% → 100%      |
| Sincronización incremental (1 cambio) | 18                 | ~4000  | 20s    | 94%            |
| Sincronización completa (forzada)     | 34                 | ~8000  | 60s    | 0% → 100%      |

**Promedio de ahorro:** 60-80% menos tokens vs. leer siempre desde Notion.
Ninguna de estas operaciones escribe en Notion — la creación/actualización de
issues ocurre exclusivamente vía `gh` CLI.
