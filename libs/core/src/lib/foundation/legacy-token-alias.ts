import type { ThemeCssVariables } from '../theme/theme.tokens';

const HA_PREFIX = '--ha-';
const PA_PREFIX = '--pa-';

/**
 * Temporary CSS alias adapter for the pa-ui -> halo-ui rebrand (issue #139,
 * Requirement: Temporary CSS Alias). Applied at the two output boundaries
 * that emit `--ha-*` custom properties (`foundation-css.ts`'s
 * `toFoundationCssVariables()` and `theme.service.ts`'s `writeToDom`).
 *
 * For every `--ha-{name}` entry, emits `--pa-{name}: <original value>` and
 * rewrites `--ha-{name}: var(--pa-{name})` — the "legacy-first chain"
 * (design decision/legacy-alias-direction). This keeps BOTH directions
 * alive for one minor version:
 *  - a consumer reading `var(--pa-x)` still resolves to the real value;
 *  - a consumer overriding `--pa-x` at `:root`/`html` flows into `--ha-x`
 *    through the `var()` indirection.
 *
 * Non-`--ha-*` keys pass through unchanged. Idempotent: applying this
 * twice never re-derives a legacy value from an already-rewritten
 * `var(--pa-*)` reference, so it can never produce a self-referential
 * `var()` cycle.
 */
export function withLegacyAliases(vars: ThemeCssVariables): ThemeCssVariables {
  const result: ThemeCssVariables = {};

  for (const [key, value] of Object.entries(vars)) {
    if (!key.startsWith(HA_PREFIX)) {
      result[key] = value;
      continue;
    }

    const legacyKey = PA_PREFIX + key.slice(HA_PREFIX.length);
    const aliasedValue = `var(${legacyKey})`;

    if (value === aliasedValue) {
      // Already aliased (idempotent re-application) — keep the existing
      // legacy value if present in this same pass, never re-derive it from
      // the var() reference (which would clobber the real value).
      result[key] = value;
      if (legacyKey in vars) {
        result[legacyKey] = vars[legacyKey];
      }
      continue;
    }

    result[legacyKey] = value;
    result[key] = aliasedValue;
  }

  return result;
}
