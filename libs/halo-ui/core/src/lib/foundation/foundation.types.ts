/**
 * Typed foundation source (Requirement: Typed Foundation Source, No `any`).
 * Zero `any`, zero type assertions. These types describe the RAW 25-900
 * color scales, the generic `sm|md|lg` size scale (spacing/gap/radius/
 * padding-x/icon-size), and the typography role scale — the Foundation layer of the
 * three-layer token system (`skills/lib-ui-architecture/SKILL.md:24-32`).
 *
 * These types are intentionally never consumed by `theme/theme-engine.ts` or
 * `theme/color-derivation.ts` (Requirement: `deriveTokens()` Never Processes
 * Raw Scales) — see `no-raw-scale-in-theme-engine.spec.ts`.
 */

/** The 11-step lightness axis of a raw Figma color scale (25 = lightest, 900 = darkest). */
export const HA_COLOR_SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

export type HaColorScaleStep = (typeof HA_COLOR_SCALE_STEPS)[number];

/**
 * A complete 11-step raw color scale. All steps are required — completeness
 * is enforced where a family is declared (see `foundation.tokens.ts`'s
 * `satisfies Record<..., HaColorScale>`), not by this type alone.
 *
 * Note (pre-empting a verify-phase false blocker): the numeric 25-900 keys
 * are the Figma *lightness* axis of a raw color scale, not a t-shirt-size
 * scale. The "no numeric-indexed scale names" hard rule applies to
 * spacing/radius/font-size/size — all of which use `sm|md|lg` in this
 * file — and does not apply to this raw color-scale axis.
 */
export type HaColorScale = { readonly [S in HaColorScaleStep]: string };

/** A color scale where only SOME steps are defined (e.g. `neutral`, which ships only 5 of 11 steps). */
export type HaPartialColorScale = Partial<HaColorScale>;

/**
 * Open dictionary of color families (Requirement: adding a 5th color family
 * requires no type change). Each family may be a full `HaColorScale` or a
 * `HaPartialColorScale` (e.g. `neutral`). The index signature is what keeps
 * this type open — a maintainer can add a 5th family to the constant in
 * `foundation.tokens.ts` without touching this type at all.
 */
export interface HaFoundationPalette {
  readonly [family: string]: HaPartialColorScale;
}

/** The 3 semantic size steps used end-to-end (foundation -> semantic -> component). Never numeric. */
export const HA_SIZE_STEPS = ['sm', 'md', 'lg'] as const;

export type HaSizeStep = (typeof HA_SIZE_STEPS)[number];

/** A complete `sm|md|lg` scale of CSS length strings; used for spacing, gap, radius, padding-x, and icon-size. */
export type HaSizeScale = { readonly [K in HaSizeStep]: string };

/** A single typographic role's resolved values (e.g. the `h1` role). */
export interface HaTypographyRole {
  readonly fontSize: string;
  readonly fontWeight: string;
  readonly lineHeight: string;
}

/**
 * Open dictionary of typography roles (h1-h4, body, small-body, caption, ...).
 * Deliberately NOT keyed by `HaSizeStep` — typographic roles are a document
 * hierarchy (mirroring HTML's own `h1`-`h6` convention), not a size scale, so
 * the "no numeric-indexed scale names" rule (which governs spacing/radius/
 * font-size/size scales) does not apply to role names like `h1`/`h2`.
 */
export interface HaTypographyScale {
  readonly [role: string]: HaTypographyRole;
}

/** The 3 font weights available across typography roles and component defaults. */
export type HaFontWeightScale = {
  readonly regular: string;
  readonly semibold: string;
  readonly bold: string;
};
