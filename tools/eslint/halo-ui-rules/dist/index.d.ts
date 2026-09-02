declare const plugin: {
    meta: {
        name: string;
        version: string;
    };
    rules: {
        'require-view-encapsulation-none': import("@typescript-eslint/utils/ts-eslint").RuleModule<"missingViewEncapsulationNone" | "wrongViewEncapsulation", [], unknown, import("@typescript-eslint/utils/ts-eslint").RuleListener>;
        'no-color-literal-union': import("@typescript-eslint/utils/ts-eslint").RuleModule<"colorNotString", [], unknown, import("@typescript-eslint/utils/ts-eslint").RuleListener>;
        'max-component-lines': import("@typescript-eslint/utils/ts-eslint").RuleModule<"componentFileTooLong", [], unknown, import("@typescript-eslint/utils/ts-eslint").RuleListener>;
        'no-rxjs-local-state': import("@typescript-eslint/utils/ts-eslint").RuleModule<"noRxjsLocalState", [], unknown, import("@typescript-eslint/utils/ts-eslint").RuleListener>;
    };
};
export default plugin;
