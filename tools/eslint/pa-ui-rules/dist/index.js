import { rule as requireViewEncapsulationNone } from './rules/require-view-encapsulation-none.js';
import { rule as noColorLiteralUnion } from './rules/no-color-literal-union.js';
import { rule as maxComponentLines } from './rules/max-component-lines.js';
import { rule as noRxjsLocalState } from './rules/no-rxjs-local-state.js';
const plugin = {
    meta: {
        name: '@pa-ui/eslint-plugin',
        version: '1.0.0',
    },
    rules: {
        'require-view-encapsulation-none': requireViewEncapsulationNone,
        'no-color-literal-union': noColorLiteralUnion,
        'max-component-lines': maxComponentLines,
        'no-rxjs-local-state': noRxjsLocalState,
    },
};
export default plugin;
