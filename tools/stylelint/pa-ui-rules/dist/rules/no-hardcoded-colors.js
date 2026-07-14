/**
 * Complete list of CSS named colors from CSS Color Level 4.
 * These are all valid CSS color keywords that represent hardcoded colors.
 */
const NAMED_COLORS = new Set([
    'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure',
    'beige', 'bisque', 'black', 'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood',
    'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk',
    'crimson', 'cyan',
    'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkgrey',
    'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred',
    'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray', 'darkslategrey',
    'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dimgrey',
    'dodgerblue',
    'firebrick', 'floralwhite', 'forestgreen', 'fuchsia',
    'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'greenyellow', 'grey',
    'honeydew', 'hotpink',
    'indianred', 'indigo', 'ivory',
    'khaki',
    'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral',
    'lightcyan', 'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey',
    'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray',
    'lightslategrey', 'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'linen',
    'magenta', 'maroon', 'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple',
    'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise',
    'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin',
    'navajowhite', 'navy',
    'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid',
    'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip',
    'peachpuff', 'peru', 'pink', 'plum', 'powderblue', 'purple',
    'rebeccapurple', 'red', 'rosybrown', 'royalblue',
    'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna', 'silver',
    'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow', 'springgreen', 'steelblue',
    'tan', 'teal', 'thistle', 'tomato', 'turquoise',
    'violet',
    'wheat', 'white', 'whitesmoke',
    'yellow', 'yellowgreen',
]);
/** CSS value keywords that are NOT hardcoded colors. */
const ALLOWED_KEYWORDS = new Set([
    'currentcolor', 'transparent', 'inherit', 'initial', 'unset', 'revert', 'revert-layer',
]);
/**
 * Checks if a CSS value part is a hardcoded color.
 * Strips trailing punctuation (parentheses, semicolons) before checking.
 */
function isHardcodedColor(value) {
    const trimmed = value.trim().replace(/[,:;)]+$/, '').toLowerCase();
    if (!trimmed)
        return false;
    // var() references are always allowed
    if (trimmed.startsWith('var('))
        return false;
    // Allowed keywords
    if (ALLOWED_KEYWORDS.has(trimmed))
        return false;
    // Hex colors: #rgb, #rrggbb, #rgba, #rrggbbaa
    if (/^#[0-9a-f]{3,8}$/i.test(trimmed))
        return true;
    // rgb/rgba/hsl/hsla functions
    if (/^(rgb|rgba|hsl|hsla)\(/i.test(trimmed))
        return true;
    // Named colors
    if (NAMED_COLORS.has(trimmed))
        return true;
    return false;
}
/**
 * PostCSS plugin function for stylelint rule `pa-ui/no-hardcoded-colors`.
 *
 * Reports hardcoded color values: hex, rgb/rgba, hsl/hsla, and named CSS colors.
 * Token references via `var(--*)` are allowed. `transparent` and `currentColor` are allowed.
 *
 * Report-only — no auto-fix.
 */
export function ruleFunction(root, result) {
    root.walkDecls((node) => {
        const { prop, value: rawValue } = node;
        const value = rawValue.trim();
        // Check if the property is color-related
        const isColorProp = /^(color|background(-color)?|border(-(top|right|bottom|left))?-color|outline(-color)?|caret-color|text-decoration-color|accent-color|fill|stroke|text-emphasis-color|column-rule-color|scrollbar-color)$/.test(prop);
        if (!isColorProp) {
            // Also check border/outline/background/box-shadow/text-shadow shorthands
            const isShorthand = /^(border(-(top|right|bottom|left))?|outline|background|box-shadow|text-shadow)$/.test(prop);
            if (!isShorthand)
                return;
        }
        // If the entire value is wrapped in var() (token reference with possible fallback), skip
        if (value.startsWith('var('))
            return;
        // Split value by spaces and commas to find individual color references
        // This handles things like: `1px solid red`, `#333 url(...)`, etc.
        const parts = value.split(/[, ]+/).filter(Boolean);
        for (const part of parts) {
            const cleaned = part.trim();
            if (isHardcodedColor(cleaned)) {
                result.warn(`Hardcoded color "${cleaned}" is not allowed. Use a CSS custom property (token) instead. (pa-ui/no-hardcoded-colors)`, { node, word: cleaned });
                // Report only once per declaration
                break;
            }
        }
    });
}
