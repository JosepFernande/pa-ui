# pa-ui

> Librería de componentes Angular 19 accesible y basada en tokens, con una
> arquitectura de variables CSS de 3 capas.

[![npm version](https://img.shields.io/npm/v/pa-ui)](https://www.npmjs.com/package/@pa-ui/angular)
[![license](https://img.shields.io/github/license/JosepFernande/pa-ui)](./LICENSE)
[![build](https://img.shields.io/github/actions/workflow/status/JosepFernande/pa-ui/ci.yml?label=build)](https://github.com/JosepFernande/pa-ui/actions)

---

## Inicio rápido — en menos de 5 minutos

### 1. Instalar

```bash
npm install @pa-ui/angular @angular/cdk
```

### 2. Configurar el Theme Engine

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { providePaTheme } from '@pa-ui/core';

export const appConfig: ApplicationConfig = {
  providers: [
    providePaTheme(), // tema por defecto — funciona sin configuración adicional
  ],
};
```

### 3. Importar el CSS de Foundation

Además de `providePaTheme()`, hace falta un import explícito de CSS — trae los
valores por defecto estáticos de las capas Foundation/Semantic/Component
(spacing, radius, tipografía, tamaños de íconos, defaults de tokens de
componente) que hacen que los componentes se rendericen completamente
estilizados sin configuración adicional:

```css
/* styles.css (o cualquier hoja de estilos global) */
@import '@pa-ui/core/theme.css';
```

Olvidar este import no rompe la app — los componentes quedan sin estilo, usando
las custom properties `--pa-*` sin resolver, hasta que se agregue. Ver
[CSS Strategy](./docs/css-strategy.md) para el detalle completo de las capas y
la estrategia de distribución.

### 4. Usar un componente

Cada componente en `libs/` tiene su propia implementación y ejemplos de uso
documentados. Consultá el [catálogo de componentes](./docs/components.md) para
encontrar el paquete que necesitás y cómo usarlo.

Eso es todo. No hay NgModules ni configuración adicional — solo los pasos de
arriba.

---

## Puntos clave de la arquitectura

| Principio                        | Qué significa                                                                                   |
| -------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Solo standalone**              | Todo componente es `standalone: true`. Nunca NgModules.                                         |
| **Signals primero**              | Estado reactivo vía Angular Signals. RxJS reservado para streams y eventos async.               |
| **Sistema de tokens de 3 capas** | Foundation → Semantic → Component. Cero valores hardcodeados en el CSS de componentes.          |
| **Variables CSS**                | Theming vía custom properties nativas de CSS. Sin mixins de SCSS, sin frameworks de utilidades. |
| **Accesibilidad con CDK**        | `FocusMonitor`, `FocusTrap`, `Overlay` — Angular CDK se encarga de la parte difícil.            |
| **Tree-shakable**                | `sideEffects: false` en cada paquete. Importá solo lo que uses.                                 |
| **ViewEncapsulation.None**       | Personalización completa de CSS desde tu app. Sobreescribí cualquier token en cualquier scope.  |

### Arquitectura de tokens en 3 capas

```
Foundation           Semantic              Component
─────────            ─────────             ─────────
--blue-500      →    --pa-primary     →    --pa-button-bg
--gray-100      →    --pa-surface     →    --pa-button-color
--radius-2      →    --pa-border      →    --pa-button-radius
--spacing-4     →    --pa-text        →    --pa-button-padding-md
```

Los componentes consumen **únicamente** tokens semánticos y de componente. Los
tokens de Foundation están prohibidos dentro del CSS de un componente. Esta
separación permite rebrandear toda la librería cambiando los mapeos semánticos,
sin tocar un solo componente.

---

## Theme Engine

El Theme Engine (`providePaTheme()`) es el único punto de entrada para toda
personalización visual.

### Tema por defecto (sin configuración)

```typescript
import { providePaTheme } from '@pa-ui/core';

export const appConfig: ApplicationConfig = {
  providers: [providePaTheme()],
};
```

### Colores personalizados

Registrá colores específicos del dominio. El engine deriva automáticamente las
variantes de hover, active y contraste.

```typescript
providePaTheme({
  colors: {
    primary: { 500: '#0066cc' },
    secondary: { 500: '#6c757d' },
    treasury: { 500: '#0d6efd' },
    danger: { 500: '#dc3545' },
  },
});
```

Después usalos en cualquier componente:

```html
<button pa-button color="treasury">Acción de tesorería</button>
<button pa-button variant="outline" color="danger">Eliminar</button>
```

### Tema exacto (sin defaults)

Usá `extendDefaults: false` cuando quieras control total — solo se registran tus
colores.

```typescript
providePaTheme({
  extendDefaults: false,
  colors: {
    primary: { 500: '#1a1a2e' },
    secondary: { 500: '#16213e' },
    accent: { 500: '#e94560' },
  },
});
```

---

## Personalización

### Sobreescribir tokens de CSS

Cada propiedad visual es una custom property de CSS. Sobreescribila en cualquier
scope:

```css
/* Global — afecta a todos los botones */
:root {
  --pa-button-radius: 8px;
  --pa-button-font-weight: 600;
}

/* Con scope — afecta solo a los botones dentro de .admin-panel */
.admin-panel {
  --pa-button-bg: var(--pa-treasury);
  --pa-button-hover-bg: color-mix(in srgb, var(--pa-treasury) 85%, black);
}
```

### Agregar colores personalizados sin modificar componentes

El input `color` de cada componente es un `string` (registrado en el tema),
nunca un enum cerrado. Registrá un color nuevo en el tema y funciona en todos
lados:

```typescript
providePaTheme({
  colors: {
    accounting: { 500: '#28a745' },
  },
});
```

```html
<button pa-button color="accounting">Aprobar</button>
```

Sin cambios en el componente. Sin variantes nuevas. El Theme Engine deriva
automáticamente los estados de hover, active y disabled.

> Ver [CSS Strategy](./docs/css-strategy.md) para la referencia completa de
> tokens y patrones de sobreescritura.

---

## Accesibilidad

Todo componente de pa-ui está construido con la accesibilidad como prioridad:

- **Navegación por teclado** — Todos los elementos interactivos son alcanzables
  y operables por teclado. `FocusMonitor` de CDK rastrea el origen del foco para
  mostrar el anillo de foco solo a usuarios de teclado.
- **Atributos ARIA** — Se aplican automáticamente `role`, `aria-disabled`,
  `aria-busy` y otros estados ARIA correctos.
- **Manejo de foco** — Los componentes usan `FocusTrap` de CDK para overlays y
  modales. El foco nunca se pierde durante cambios de estado.
- **Soporte de lectores de pantalla** — Los estados de carga usan texto
  visualmente oculto (patrón `sr-only`) para que los lectores de pantalla
  anuncien los cambios de estado.
- **`prefers-reduced-motion`** — Las animaciones respetan la preferencia de
  movimiento del usuario.

> Ver el doc de [Testing Strategy](./docs/testing-strategy.md) para el checklist
> completo de accesibilidad y el enfoque de testing.

---

## Estructura del proyecto

```
pa-ui/
├── libs/
│   ├── button/          # @pa-ui/button — componente PaButton
│   ├── input/           # @pa-ui/input — componente PaInput
│   ├── select/          # @pa-ui/select — componente PaSelect
│   ├── core/            # @pa-ui/core — Theme Engine (providePaTheme) + capa Foundation
│   └── pa-ui/           # @pa-ui/angular — paquete umbrella (re-exporta el resto)
├── apps/
│   └── showcase/        # App de demo con ejemplos en vivo
└── skills/              # Skills de agentes de IA para hacer cumplir la arquitectura
```

> Ver [Componentes](./docs/components.md) para el catálogo completo, cada uno
> enlazado a su carpeta en `libs/`.

---

## Documentación

`docs/` en este repo es la fuente de verdad para arquitectura, testing y
procesos, y la única garantizada disponible para cualquiera (o cualquier agente
de IA) que clone el repo sin acceso a red. La
[wiki del proyecto](https://github.com/JosepFernande/pa-ui/wiki) se mantiene
como espejo histórico de acá en adelante; los cambios nuevos de documentación
entran primero en `docs/`.

| Recurso                                                                          | Descripción                                                        |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [Componentes](./docs/components.md)                                              | Catálogo de componentes, cada uno enlazado a su carpeta en `libs/` |
| [Architecture & Foundation](./docs/architecture-and-foundation.md)               | Las 6 reglas duras, el sistema de tokens y los decision gates      |
| [Theming Deep-Dive](./docs/theming-deep-dive.md)                                 | Referencia técnica completa del Theme Engine                       |
| [ControlValueAccessor (CVA)](./docs/control-value-accessor-cva.md)               | Cómo se integran los componentes con los forms de Angular          |
| [Testing Strategy](./docs/testing-strategy.md)                                   | Niveles de testing, cobertura y checklist de accesibilidad         |
| [Showcase](./docs/showcase.md)                                                   | App playground de componentes en `apps/showcase/`                  |
| [CI/CD Pipeline](./docs/ci-cd-pipeline.md)                                       | Workflows de GitHub Actions                                        |
| [Release and Publishing](./docs/release-and-publishing.md)                       | Publicación en npm, Trusted Publishing                             |
| [Contribution & PR Guidelines](./docs/contribution-pr-code-review-guidelines.md) | Cómo contribuir y qué se revisa en un PR                           |
| [CSS Strategy](./docs/css-strategy.md)                                           | Referencia de tokens y patrones de sobreescritura                  |
| [Showcase App](./apps/showcase/)                                                 | Playground de componentes en vivo                                  |
| [Contributing](./CONTRIBUTING.md)                                                | Cómo contribuir, guías de PR y proceso de code review              |

---

## Desarrollo

```bash
# Instalar dependencias
npm install

# Compilar todas las librerías
nx run-many -t build

# Correr los tests
nx run-many -t test

# Lint
nx run-many -t lint
nx run lint:css

# Chequeo de formato
npm run format:check
```

### Showcase

```bash
# Levantar el servidor de desarrollo
npx nx serve showcase

# Compilarlo
npx nx build showcase
```

Ver [docs/showcase.md](./docs/showcase.md) para saber cómo agregar una ruta para
un componente nuevo.

---

## Licencia

MIT &copy; [JosepFernande](https://github.com/JosepFernande)
