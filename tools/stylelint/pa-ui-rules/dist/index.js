import stylelint from 'stylelint';
import { ruleFunction as paPrefixSelector } from './rules/pa-prefix-selector.js';
import { ruleFunction as noHardcodedColors } from './rules/no-hardcoded-colors.js';
import { ruleFunction as noHardcodedSpacingRadius } from './rules/no-hardcoded-spacing-radius.js';
import { ruleFunction as noNgDeepHostContext } from './rules/no-ng-deep-host-context.js';
import { ruleFunction as noImportantOutsideHost } from './rules/no-important-outside-host.js';
const { utils } = stylelint;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeRule(ruleName, fn) {
    return (primaryOption) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (root, result) => {
            const validOptions = utils.validateOptions(result, ruleName, {
                actual: primaryOption,
                possible: [true],
            });
            if (!validOptions)
                return;
            fn(root, result);
        };
    };
}
const { createPlugin } = stylelint;
export default [
    // @ts-expect-error -- stylelint v17 type expects Rule shape but createPlugin accepts any function
    createPlugin('pa-ui/pa-prefix-selector', makeRule('pa-ui/pa-prefix-selector', paPrefixSelector)),
    // @ts-expect-error -- stylelint v17 type expects Rule shape but createPlugin accepts any function
    createPlugin('pa-ui/no-hardcoded-colors', makeRule('pa-ui/no-hardcoded-colors', noHardcodedColors)),
    // @ts-expect-error -- stylelint v17 type expects Rule shape but createPlugin accepts any function
    createPlugin('pa-ui/no-hardcoded-spacing-radius', makeRule('pa-ui/no-hardcoded-spacing-radius', noHardcodedSpacingRadius)),
    // @ts-expect-error -- stylelint v17 type expects Rule shape but createPlugin accepts any function
    createPlugin('pa-ui/no-ng-deep-host-context', makeRule('pa-ui/no-ng-deep-host-context', noNgDeepHostContext)),
    // @ts-expect-error -- stylelint v17 type expects Rule shape but createPlugin accepts any function
    createPlugin('pa-ui/no-important-outside-host', makeRule('pa-ui/no-important-outside-host', noImportantOutsideHost)),
];
