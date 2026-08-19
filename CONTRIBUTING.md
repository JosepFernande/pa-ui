# Cómo contribuir a pa-ui

¡Gracias por tu interés en contribuir! Este documento cubre el flujo de
desarrollo, el proceso de PR, las convenciones de changesets y el proceso de
release.

## Configuración de desarrollo

```bash
# Instalar dependencias
npm ci

# Compilar todas las librerías
npx nx run-many -t build

# Correr todos los tests
npx nx run-many -t test

# Correr linting (ESLint) en todos los proyectos
npx nx run-many -t lint

# Correr stylelint (CSS/SCSS) en todos los proyectos
npm run lint:css

# Correr los tests de una sola librería
npx nx test core
npx nx test button
npx nx test input
npx nx test pa-ui   # paquete umbrella @pa-ui/angular
```

### Comandos nx útiles

| Comando                        | Descripción                         |
| ------------------------------ | ----------------------------------- |
| `npx nx graph`                 | Visualizar el grafo de dependencias |
| `npx nx reset`                 | Limpiar la caché de Nx              |
| `npx nx build <project>`       | Compilar un solo proyecto           |
| `npx nx test <project>`        | Testear un solo proyecto            |
| `npx nx lint <project>`        | Lintear un solo proyecto            |
| `npx nx run-many -t build`     | Compilar todos los proyectos        |
| `npx nx run-many -t test`      | Testear todos los proyectos         |
| `npx nx run-many -t lint`      | Lintear todos los proyectos         |
| `npx nx run-many -t stylelint` | Stylelint en todos los proyectos    |

## Estrategia de ramas

- **Ramas de feature**: `feat/<descripción>` o `fix/<descripción>`
- **Rama base**: `main`
- Mantené las ramas enfocadas en un solo cambio o feature
- Hacé rebase sobre `main` antes de abrir un PR

## Proceso de PR

1. Creá una rama desde `main`
2. Hacé tus cambios siguiendo las
   [convenciones de código](#convenciones-de-código)
3. Agregá o actualizá tests para tus cambios
4. Creá un changeset si tu cambio afecta un paquete publicable (ver más abajo)
5. Abrí un PR contra `main`
6. Asegurate de que el CI pase. El job `summary` bloquea el merge si alguno de
   estos falla: `lint` (ESLint), `stylelint`, `test`, `build` o `audit` (chequeo
   de bundle/entry points sobre el output de `build`). El job `gga-review`
   (revisión automatizada con IA) corre en paralelo pero es informativo, no
   bloqueante.
7. Pedí revisión a un mantenedor

Además del CI de PR, existe otro workflow que no forma parte del checklist de un
PR individual:

- **`smoke.yml`**: corre solo en push a `main` (post-merge). Es un build-only
  liviano — no repite lint/test/audit porque branch protection ya los validó en
  el PR.

### Convenciones de commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/). Todo
mensaje de commit debe seguir este patrón:

```
<tipo>(<scope>): <descripción>
```

**Tipos** (validados por `commitlint.config.js`): `feat`, `fix`, `docs`,
`style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Scopes sugeridos**: `core`, `button`, `input`, `angular`, `showcase`, `repo`,
`ci`

Ejemplos:

```
feat(button): add loading state with spinner
fix(core): resolve token inheritance for nested themes
chore(repo): update nx to latest version
```

> Nota: los mensajes de commit, títulos/descripciones de PR e issues, y los
> comentarios de PR/issue se escriben en español neutro/profesional en este
> repo. El código, identificadores, comentarios de código y tests se mantienen
> en inglés — ver [convenciones de código](#convenciones-de-código).

## Flujo de changesets

Usamos [Changesets](https://github.com/changesets/changesets) para manejar
versionado y changelogs.

### Cuándo se requiere un changeset

Se requiere un changeset siempre que tu PR modifique un **paquete publicable**
(`@pa-ui/core`, `@pa-ui/button`, `@pa-ui/input`, `@pa-ui/angular`). Esto
incluye:

- Agregar nuevas features o componentes
- Cambiar o remover APIs públicas
- Bug fixes que afectan el comportamiento del consumidor
- Actualizaciones de dependencias que cambian los rangos de peer dependencies

Un changeset **no** es necesario para:

- Refactors internos que no cambian la API pública
- Cambios solo de tests
- Actualizaciones de documentación (salvo que merezcan una entrada de changelog)
- Cambios en la app showcase

### Cómo crear un changeset

```bash
npx changeset
```

La CLI te va a pedir:

1. Seleccionar qué paquetes están afectados (espacio para seleccionar, enter
   para confirmar)
2. Elegir un **tipo de bump** para cada uno:
   - `major` — cambios que rompen compatibilidad
   - `minor` — nuevas features (compatibles hacia atrás)
   - `patch` — bug fixes (compatibles hacia atrás)
3. Escribir un resumen del cambio

Esto crea un archivo `.md` en `.changeset/` con un nombre aleatorio único.
Commiteá ese archivo junto con tus cambios.

Los cuatro paquetes publicables están configurados como `fixed` en
`.changeset/config.json`: siempre se versionan juntos con el mismo número,
aunque el changeset solo mencione a uno de ellos.

### Tipos de bump

| Tipo      | Cuándo usarlo                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------------ |
| **major** | Cambios de API que rompen compatibilidad, features removidas, selectores/inputs/outputs de componentes modificados |
| **minor** | Nuevos componentes, nuevas features, nuevos inputs/outputs (compatibles hacia atrás)                               |
| **patch** | Bug fixes, mejoras de performance, bumps de dependencias (sin cambio de API)                                       |

## Proceso de release

Los releases se automatizan vía GitHub Actions
(`.github/workflows/release.yml`), pero publicar un changeset toma **dos merges
a `main`**, no uno:

1. Mergear un PR con changesets a `main` dispara el workflow `release.yml`.
2. Corre `changeset version` (bumpea versiones, actualiza changelogs) y abre un
   PR automático **"chore(release): version packages"**. Ese PR debe ser
   revisado y mergeado como cualquier otro — no se mergea solo.
3. Mergear ese PR de version-packages dispara el workflow otra vez. Esta vez no
   hay nada nuevo para versionar, así que corre:
   - `npm audit --omit=dev --audit-level=critical` sobre las dependencias de
     producción (**no bloqueante** — es advisory, se sube como artifact)
   - `npm run validate:packages` (**bloqueante** — falla el release si el
     `package.json` de algún paquete en `dist/` perdió su entry point
     `main`/`exports["."]`/`typings`, o si el workflow dejó de publicar desde
     `dist/<lib>`)
   - `changeset publish`, que crea el tag git y publica el GitHub Release

Si no ves una publicación después de mergear tu PR con changesets, revisá si se
abrió el PR de version-packages y si ya fue mergeado — ese segundo merge es el
que efectivamente publica a npm.

### Estado actual: release estable (fuera de modo prerelease)

El repo salió del modo prerelease de Changesets (`changeset pre exit`) y ya no
usa `.changeset/pre.json`. Los cuatro paquetes (`@pa-ui/core`, `@pa-ui/button`,
`@pa-ui/input`, `@pa-ui/angular`) tienen releases estables reales y se instalan
sin ningún tag especial:

```bash
npm install @pa-ui/core
```

`release.yml` conserva lógica condicional para el caso en que el repo vuelva a
entrar en modo `pre` en el futuro (dist-tag `alpha`, marcar el GitHub Release
como prerelease). Mientras `.changeset/pre.json` no exista, esas ramas del
workflow no se ejecutan y no aplican.

## Convenciones de código

`AGENTS.md` es un **índice de skills**, no un documento de convenciones en sí
mismo. Para las reglas completas, consultá:

- [`skills/pa-ui-architecture/SKILL.md`](skills/pa-ui-architecture/SKILL.md) —
  arquitectura, tokens, theming
- [`skills/pa-ui-coding-standards/SKILL.md`](skills/pa-ui-coding-standards/SKILL.md)
  — estructura de archivos, inputs/outputs, signals, CSS
- [`skills/pa-ui-testing/SKILL.md`](skills/pa-ui-testing/SKILL.md) — patrones de
  testing, a11y, coverage

Puntos clave:

- **Solo standalone components** — sin NgModules
- **Signals primero** — usá Angular Signals para estado local, no RxJS
- **Tokens primero** — sin colores, spacing o radios hardcodeados
- **CSS variables primero** — preferí custom properties nativas sobre SCSS
- **CDK sobre custom** — usá Angular CDK para overlays, focus, a11y
- **Prefijo `pa-`** — todos los selectores de componentes usan el prefijo `pa-`

## ¿Preguntas?

Abrí un issue o iniciá una discusión — ¡con gusto te ayudamos!
