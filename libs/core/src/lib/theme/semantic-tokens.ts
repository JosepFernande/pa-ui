/**
 * Pure adapter that aliases `deriveTokens()`'s `--pa-color-*` output to the
 * DOM-facing semantic layer `--pa-{name}[-hover|-active|-contrast]`
 * (Requirement: Semantic-Only DOM Write Adapter). Zero `@angular/*` imports
 * and `TestBed`-free (Requirement: Explicit Non-Requirements). Does not
 * wrap, mutate, or re-derive anything from `deriveTokens`/`color-derivation`
 * — it is a one-to-one key rename, same value.
 */
import type { ThemeCssVariables } from './theme.tokens';

/**
 * Maps every `--pa-color-{rest}` key to `--pa-{rest}` with the identical
 * value. Any key that does not start with `--pa-color-` passes through
 * unchanged (defensive/malformed-input case) — this function drops nothing.
 */
export function toSemanticCssVariables(vars: ThemeCssVariables): ThemeCssVariables {
  const result: ThemeCssVariables = {};

  for (const [key, value] of Object.entries(vars)) {
    result[key.replace(/^--pa-color-/, '--pa-')] = value;
  }

  return result;
}
