# Estrategia de Tagging Automático

## Propósito

Definir cómo generar tags/keywords para cada documento de referencia de Notion,
permitiendo matching rápido con issues de GitHub sin leer el contenido completo.

## Reglas de Tagging

### 1. Tags por tipo de documento

| Tipo de documento | Tags obligatorios                               |
| ----------------- | ----------------------------------------------- |
| Arquitectura      | `arquitectura`, `fundamentos`, `principios`     |
| Estrategia CSS    | `css`, `estilos`, `encapsulamiento`             |
| Theming           | `theme`, `colores`, `tokens`, `personalización` |
| Testing           | `testing`, `pruebas`, `cobertura`               |
| Forms             | `forms`, `formularios`, `cva`                   |
| CI/CD             | `ci`, `cd`, `pipeline`, `automatización`        |
| Release           | `release`, `publicación`, `npm`, `versionado`   |
| Performance       | `performance`, `optimización`, `bundle`         |
| Documentación     | `documentación`, `storybook`, `ejemplos`        |

### 2. Tags por contenido específico

Extraer tags del contenido analizando:

**Conceptos técnicos:**

- `tokens` → si menciona "design tokens", "semantic tokens", "component tokens"
- `signals` → si menciona "Angular Signals", "signal()", "computed()"
- `standalone` → si menciona "standalone components", "no NgModules"
- `css-variables` → si menciona "CSS custom properties", "var(--\*)"
- `view-encapsulation` → si menciona "ViewEncapsulation.None", "ShadowDom"

**APIs y patrones:**

- `providePaTheme` → si define esta función
- `ThemeService` → si expone este servicio
- `ControlValueAccessor` → si implementa CVA
- `ChangeDetectionStrategy.OnPush` → si requiere OnPush

**Herramientas:**

- `nx` → si usa Nx workspace
- `changesets` → si usa changesets para versionado
- `storybook` → si integra Storybook
- `stylelint` → si configura Stylelint
- `eslint` → si configura ESLint

**Componentes:**

- `button` → si documenta componente Button
- `input` → si documenta componente Input
- `badge` → si documenta componente Badge
- `dialog` → si documenta componente Dialog

**Procesos:**

- `pre-commit` → si configura hooks de pre-commit
- `branch-protection` → si define reglas de protección de ramas
- `trusted-publishing` → si usa OIDC para npm
- `ssr` → si soporta Server-Side Rendering

### 3. Algoritmo de extracción

```
1. Leer contenido del documento
2. Tokenizar y normalizar (lowercase, remover puntuación)
3. Buscar coincidencias con diccionario de tags conocidos
4. Contar frecuencia de cada tag
5. Seleccionar top 10 tags por frecuencia
6. Agregar tags obligatorios según tipo de documento
7. Validar: mínimo 5 tags, máximo 15 tags por documento
```

### 4. Matching con issues

Cuando un issue de GitHub menciona conceptos:

```
1. Extraer keywords del título/body del issue
2. Normalizar (lowercase, stemming básico)
3. Para cada documento en el índice:
   - Calcular score = cantidad de keywords que matchean con tags
   - Normalizar por total de tags del documento
4. Ordenar documentos por score descendente
5. Seleccionar top 3-5 documentos más relevantes
```

**Ejemplo:**

Issue US-11 menciona: "Theme Engine", "providePaTheme", "colores personalizados"

Keywords extraídas: `theme-engine`, `providePaTheme`, `colores`

Match con documentos:

- "Theming Deep-Dive" → tags: [`theme-engine`, `providePaTheme`, `colores`,
  `HSL`, `SSR`] → score: 3/5 = 0.6
- "CSS Strategy" → tags: [`theme-engine`, `tokens`, `colores`] → score: 2/3 =
  0.67
- "Architecture & Foundation" → tags: [`tokens`, `arquitectura`] → score: 1/2 =
  0.5

Documentos seleccionados: Theming Deep-Dive, CSS Strategy, Architecture &
Foundation

### 5. Actualización de tags

Tags se regeneran cuando:

- Documento se sincroniza por primera vez
- Documento cambia (timestamp diferente)
- Usuario ejecuta `/sync-notion-docs --reindex`

Tags NO se regeneran en:

- Validación de frescura (solo compara timestamps)
- Lectura desde cache (usa tags existentes)

### 6. Diccionario de tags conocidos

Mantener en `assets/known-tags.json`:

```json
{
  "technical": [
    "tokens",
    "signals",
    "standalone",
    "css-variables",
    "view-encapsulation",
    "onpush",
    "change-detection"
  ],
  "apis": [
    "providePaTheme",
    "ThemeService",
    "ControlValueAccessor",
    "providePaComponents"
  ],
  "tools": [
    "nx",
    "changesets",
    "storybook",
    "stylelint",
    "eslint",
    "jest",
    "husky"
  ],
  "components": [
    "button",
    "input",
    "badge",
    "dialog",
    "tooltip",
    "dropdown",
    "avatar",
    "spinner"
  ],
  "processes": [
    "pre-commit",
    "branch-protection",
    "trusted-publishing",
    "ssr",
    "tree-shaking"
  ],
  "concepts": [
    "theme-engine",
    "bem",
    "accessibility",
    "aria",
    "keyboard-navigation",
    "focus-management"
  ]
}
```

## Métricas de calidad

- **Precisión**: % de documentos relevantes que fueron seleccionados
- **Cobertura**: % de conceptos del issue que fueron matcheados
- **Falsos positivos**: % de documentos seleccionados que no eran relevantes

**Objetivo:** >80% precisión, >70% cobertura, <20% falsos positivos
