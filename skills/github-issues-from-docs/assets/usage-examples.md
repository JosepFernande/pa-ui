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

[3/9] Cargando índice desde .wiki-cache/index.json...
  → Read(.wiki-cache/index.json)
  → Índice encontrado: 17 páginas
  → Última sincronización: 2026-07-29T00:40:00.000Z (HEAD a1b2c3d)

[4/9] Filtrando páginas relevantes...
  → Match de keywords vs tags:
    - "Theming-Deep-Dive" → score: 0.8 (tags: theme-engine, providePaTheme, colores)
    - "CSS-Strategy-and-View-Encapsulation" → score: 0.6 (tags: tokens, theme-engine)
    - "Architecture-and-Foundation" → score: 0.5 (tags: tokens, arquitectura)
  → Páginas seleccionadas: 3

[5/9] Validando frescura (HEAD SHA)...
  → git -C .wiki-cache/pa-ui.wiki pull --ff-only
  → git -C .wiki-cache/pa-ui.wiki rev-parse HEAD → a1b2c3d
  → Comparación: HEAD actual == last_synced_head_sha cacheado
  → Resultado: todo fresco, 0 páginas obsoletas (1 sola comparación de string)

[6/9] Cargando contenido desde cache...
  → Leyendo el campo `content` de cada página en .wiki-cache/index.json
  → 3 páginas cargadas desde el índice local (0 lecturas de archivo adicionales)

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
  ✓ Páginas consultadas: 3 (todas desde cache)
  ✓ Operaciones git: 2 (pull + rev-parse, para validar frescura)
  ✓ Tokens usados: ~2000
  ✓ Tokens ahorrados vs. leer siempre: ~3500 (~64%)
  ✓ Gaps encontrados: 5
  ✓ Criterios agregados: 11
```

## Ejemplo 2: Revisar issue con página de referencia obsoleta

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

[3/9] Cargando índice desde .wiki-cache/index.json...
  → Índice encontrado: 17 páginas (last_synced_head_sha: a1b2c3d)

[4/9] Filtrando páginas relevantes...
  → Páginas seleccionadas: 4
    - "CSS-Strategy-and-View-Encapsulation" (tags: stylelint, eslint, custom-rules)
    - "Architecture-and-Foundation" (tags: arquitectura)
    - "CI-CD-Pipeline" (tags: ci, pre-commit)
    - "Contribution-PR-Code-Review-Guidelines" (tags: code-review)

[5/9] Validando frescura (HEAD SHA)...
  → git -C .wiki-cache/pa-ui.wiki pull --ff-only
  → git -C .wiki-cache/pa-ui.wiki rev-parse HEAD → f9e8d7c (cambió)
  → HEAD actual != last_synced_head_sha cacheado (a1b2c3d)
  → git -C .wiki-cache/pa-ui.wiki diff --name-only a1b2c3d f9e8d7c -- '*.md'
    → CSS-Strategy-and-View-Encapsulation.md
  → Resultado: 1 página obsoleta (de las 4 relevantes)

[6/9] Sincronizando página obsoleta...
  → Read(.wiki-cache/pa-ui.wiki/CSS-Strategy-and-View-Encapsulation.md)
  → Contenido actualizado: 15000 caracteres
  → git log -1 --format=%H -- CSS-Strategy-and-View-Encapsulation.md → f9e8d7c
  → Actualizando la entrada de esa página en .wiki-cache/index.json (merge
    parcial, sin tocar las otras 16 páginas)...
  → Cache actualizado

[7/9] Cargando contenido...
  → 4 páginas cargadas (1 desde el clone local recién actualizado, 3 desde
    .wiki-cache/index.json)

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
  ✓ Páginas consultadas: 4 (3 desde cache, 1 re-leída del clone local)
  ✓ Operaciones git: 4 (pull + rev-parse + diff + log -1 de la página re-leída)
  ✓ Tokens usados: ~3200
  ✓ Tokens ahorrados vs. leer siempre: ~2800 (~47%)
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

[2/5] Cargando páginas relevantes...
  → Keywords: "Avatar", "componente", "imagen", "tamaños", "colores"
  → Páginas seleccionadas: 3
    - "Architecture-and-Foundation" (componentes, tokens)
    - "CSS-Strategy-and-View-Encapsulation" (BEM, ViewEncapsulation, tokens)
    - "Theming-Deep-Dive" (colores dinámicos)
  → HEAD sin cambios respecto al último sync, todas frescas, cargadas desde cache

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

[5/5] Guardando learnings (opcional, best-effort)...
  → Engram disponible: mem_save con decisión de diseño
  → topic_key: "github-issue/15/analysis"
  → (si Engram no estuviera disponible, este paso se omite sin bloquear el
    resultado: el issue #15 ya fue creado exitosamente en el paso 4/5)

[Resumen]
  ✓ Issue #15 creado exitosamente en GitHub
  ✓ Alineado con: Architecture-and-Foundation, CSS-Strategy-and-View-Encapsulation, Theming-Deep-Dive
  ✓ Páginas consultadas: 3 (todas desde cache)
  ✓ Operaciones git: 1 (rev-parse para confirmar que el HEAD no cambió)
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
[Skill] Índice de documentación no encontrado en .wiki-cache/index.json. Ejecutando sincronización inicial...

[SYNC] Sincronizando páginas de referencia del Wiki...
  → .wiki-cache/pa-ui.wiki no existe, clonando...
  → git clone https://github.com/JosepFernande/pa-ui.wiki.git .wiki-cache/pa-ui.wiki
  → 17 páginas encontradas (excluyendo Home.md y páginas especiales con
    prefijo _, como _Sidebar.md y _Footer.md)

  [1/17] Architecture-and-Foundation.md...
    → Read(.wiki-cache/pa-ui.wiki/Architecture-and-Foundation.md)... 12500 caracteres
    → Generando tags... 8 tags

  [2/17] CSS-Strategy-and-View-Encapsulation.md...
    → Read(...)... 15000 caracteres
    → Generando tags... 10 tags

  ... (15 páginas más) ...

  [17/17] AI-Code-Review-with-gga.md...
    → Read(...)... 3000 caracteres
    → Generando tags... 5 tags

  → git rev-parse HEAD → a1b2c3d
  → Write(.wiki-cache/index.json) con las 17 páginas y last_synced_head_sha: a1b2c3d...
  → Sincronización completada: 17 páginas, 120 tags generados

[Skill] Continuando con revisión del issue #4...

[1/9] Leyendo issue desde GitHub...
  → gh issue view 4 --json title,body,labels,comments
  → Título: "Crear componente Button con variantes"

[2/9] Determinando tema...
  → Keywords: "Button", "variantes", "tamaños", "colores"

[3/9] Cargando índice desde .wiki-cache/index.json...
  → Índice encontrado: 17 páginas

[4/9] Filtrando páginas relevantes...
  → Páginas seleccionadas: 3

[5/9] Validando frescura (HEAD SHA)...
  → Todas frescas (acaban de ser sincronizadas en este mismo paso)

[6/9] Cargando contenido desde cache...
  → 3 páginas cargadas desde .wiki-cache/index.json

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
  ✓ Sincronización inicial de documentación: 17 páginas (primera vez, incluye 1 clone)
  ✓ Páginas consultadas: 3 (todas desde cache tras el sync)
  ✓ Operaciones git: 1 clone + 17 lecturas de archivo (sincronización), 0 adicionales para la revisión
  ✓ Tokens usados: ~8000 (sincronización) + ~2000 (revisión) = ~10000
  ✓ Tokens ahorrados en futuras ejecuciones: ~98% en el chequeo de frescura
  ✓ Gaps encontrados: 5
  ✓ Criterios actualizados: 5 → 10
```

## Ejemplo 5: Comando de sincronización

### Input del usuario

```
/sync-wiki-docs --incremental
```

### Flujo de ejecución

```
[Skill] Iniciando sincronización incremental...

[1/3] Cargando índice desde .wiki-cache/index.json...
  → Índice encontrado: 17 páginas
  → Última sincronización: 2026-07-29T00:40:00.000Z (HEAD a1b2c3d)

[2/3] Validando frescura (HEAD SHA)...
  → git -C .wiki-cache/pa-ui.wiki pull --ff-only
  → git -C .wiki-cache/pa-ui.wiki rev-parse HEAD → f9e8d7c
  → HEAD actual != last_synced_head_sha cacheado
  → git -C .wiki-cache/pa-ui.wiki diff --name-only a1b2c3d f9e8d7c -- '*.md'
    → Versioning-and-Breaking-Changes.md
  → Resultado: 1 página obsoleta (de 17), detectada en una sola operación diff

[3/3] Sincronizando página obsoleta...
  → [1/1] Versioning-and-Breaking-Changes.md...
    → Read(.wiki-cache/pa-ui.wiki/Versioning-and-Breaking-Changes.md)... 8500 caracteres
    → Generando tags... 7 tags
    → git log -1 --format=%H -- Versioning-and-Breaking-Changes.md → f9e8d7c
    → Actualizando la entrada de esa página en .wiki-cache/index.json...
    → Actualizando índice (last_synced_head_sha: f9e8d7c)...

[Resumen]
  ✓ Sincronización incremental completada
  ✓ Páginas en el índice: 17
  ✓ Páginas actualizadas: 1
  ✓ Operaciones git: 4 (pull + rev-parse + diff + log -1 de la página cambiada)
  ✓ Tiempo total: ~8 segundos
```

## Comparación de escenarios

| Escenario                             | Operaciones git       | Tokens | Tiempo | Cache hit rate |
| ------------------------------------- | --------------------- | ------ | ------ | -------------- |
| Revisar issue (todo fresco)           | 2 (pull + rev-parse)  | ~2000  | 5-10s  | 100%           |
| Revisar issue (1 página obsoleta)     | 4 (+ diff + log -1)   | ~3200  | 10-15s | 75%            |
| Crear nuevo issue                     | 0-1                   | ~1800  | 3-8s   | 100%           |
| Primera ejecución (sin cache)         | 1 clone + 17 lecturas | ~10000 | 20-40s | 0% → 100%      |
| Sincronización incremental (1 cambio) | 4                     | ~4000  | ~8s    | 94%            |
| Sincronización completa (forzada)     | 1 pull + 17 lecturas  | ~8000  | 20-40s | 0% → 100%      |

**Ahorro dominante:** el chequeo de frescura pasa de O(N) llamadas a una API
externa (~150 tokens por página, ~2550 tokens para 17 páginas) a O(1) — una sola
comparación de HEAD SHA (~20-30 tokens) — sin importar cuántas páginas tenga el
Wiki. Ninguna de estas operaciones escribe en el repo del Wiki — la
creación/actualización de issues ocurre exclusivamente vía `gh` CLI.
