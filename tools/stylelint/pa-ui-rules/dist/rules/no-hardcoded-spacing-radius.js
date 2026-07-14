/**
 * CSS properties that control spacing and border-radius.
 * These must use tokens (CSS custom properties), not hardcoded px/rem/em values.
 */
const SPACING_RADIUS_PROPS = new Set([
    'margin',
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'padding',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'gap',
    'row-gap',
    'column-gap',
    'border-radius',
    'border-top-left-radius',
    'border-top-right-radius',
    'border-bottom-right-radius',
    'border-bottom-left-radius',
    'width',
    'min-width',
    'max-width',
    'height',
    'min-height',
    'max-height',
]);
/**
 * PostCSS plugin function for stylelint rule `pa-ui/no-hardcoded-spacing-radius`.
 *
 * Reports hardcoded spacing (px, rem, em) in margin, padding, gap,
 * border-radius, width, and height properties.
 * Zero values are allowed. Token references via `var(--*)` are allowed.
 *
 * Report-only — no auto-fix.
 */
export function ruleFunction(root, result) {
    root.walkDecls((node) => {
        const { prop, value: rawValue } = node;
        const value = rawValue.trim();
        // Only check spacing/radius properties
        if (!SPACING_RADIUS_PROPS.has(prop) && !prop.startsWith('padding-') && !prop.startsWith('margin-')) {
            return;
        }
        // If the entire value is wrapped in var() (token reference), skip
        if (value.startsWith('var('))
            return;
        // Split multi-value shorthands (e.g., `4px 8px`, `4px 8px 12px 16px`)
        const parts = value.split(/\s+/).filter(Boolean);
        for (const part of parts) {
            const trimmed = part.trim().replace(/[,;)]+$/, '');
            // Allow zero values (unit independent)
            if (trimmed === '0')
                continue;
            // Allow var() references
            if (trimmed.startsWith('var('))
                continue;
            // Check if the value has px, rem, or em units
            if (/^-?\d+\.?\d*(px|rem|em)$/.test(trimmed)) {
                result.warn(`Hardcoded spacing/radius "${trimmed}" is not allowed. Use a CSS custom property (token) instead. (pa-ui/no-hardcoded-spacing-radius)`, { node, word: trimmed });
                // Report only once per declaration
                break;
            }
        }
    });
}
