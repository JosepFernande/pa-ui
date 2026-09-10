/**
 * `HaButtonTokens` and its matching `HA_BUTTON_TOKENS` CSS-variable-name
 * registry now live in `@halolib-ui/angular/core` (`component-token-shapes.ts`)
 * so `core` can build `HaTheme.components.button` and walk a consumer's
 * Button overrides against this exact registry without importing FROM
 * `@halolib-ui/angular/button` — `button` already depends on `core`
 * (`button.tokens.spec.ts` imports `HA_COMPONENT_TOKEN_DEFAULTS` from it), so
 * the reverse import would be an entry-point cycle.
 *
 * Re-exported here verbatim so this file — and therefore
 * `libs/halo-ui/button/src/index.ts`'s existing
 * `export { HA_BUTTON_TOKENS } from './lib/button.tokens';` /
 * `export type { HaButtonTokens } from './lib/button.tokens';` — keeps
 * working with zero further changes.
 */
export { HA_BUTTON_TOKENS } from '@halolib-ui/angular/core';
export type { HaButtonTokens } from '@halolib-ui/angular/core';
