import stylelint from 'stylelint';
import { ruleFunction as prefixSelector } from './rules/prefix-selector.js';
import { ruleFunction as noHardcodedColors } from './rules/no-hardcoded-colors.js';
import { ruleFunction as noHardcodedSpacingRadius } from './rules/no-hardcoded-spacing-radius.js';
import { ruleFunction as noNgDeepHostContext } from './rules/no-ng-deep-host-context.js';
import { ruleFunction as noImportantOutsideHost } from './rules/no-important-outside-host.js';
const { utils } = stylelint;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeRule(ruleName, fn) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (primaryOption, secondaryOption) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (root, result) => {
            const validOptions = utils.validateOptions(result, ruleName, {
                actual: primaryOption,
                possible: [true],
            }, {
                actual: secondaryOption,
                possible: () => true,
                optional: true,
            });
            if (!validOptions)
                return;
            fn(root, result, secondaryOption);
        };
    };
}
const { createPlugin } = stylelint;
export default [
    // @ts-expect-error -- stylelint v17 type expects Rule shape but createPlugin accepts any function
    createPlugin('halo-ui/prefix-selector', makeRule('halo-ui/prefix-selector', prefixSelector)),
    // @ts-expect-error -- stylelint v17 type expects Rule shape but createPlugin accepts any function
    createPlugin('halo-ui/no-hardcoded-colors', makeRule('halo-ui/no-hardcoded-colors', noHardcodedColors)),
    // @ts-expect-error -- stylelint v17 type expects Rule shape but createPlugin accepts any function
    createPlugin('halo-ui/no-hardcoded-spacing-radius', makeRule('halo-ui/no-hardcoded-spacing-radius', noHardcodedSpacingRadius)),
    // @ts-expect-error -- stylelint v17 type expects Rule shape but createPlugin accepts any function
    createPlugin('halo-ui/no-ng-deep-host-context', makeRule('halo-ui/no-ng-deep-host-context', noNgDeepHostContext)),
    // @ts-expect-error -- stylelint v17 type expects Rule shape but createPlugin accepts any function
    createPlugin('halo-ui/no-important-outside-host', makeRule('halo-ui/no-important-outside-host', noImportantOutsideHost)),
];
