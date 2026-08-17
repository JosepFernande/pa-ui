import { AST_NODE_TYPES } from '@typescript-eslint/utils';
const RXJS_STATE_IMPORTS = new Set([
    'BehaviorSubject',
    'Subject',
    'Observable',
    'Subscription',
]);
export const rule = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Discourage RxJS imports (BehaviorSubject, Subject, Observable, Subscription) for local component state. Prefer Angular signal/computed instead.',
            url: '',
        },
        messages: {
            noRxjsLocalState: 'Avoid `{{ importedName }}` from `rxjs` for local component state. Prefer Angular `signal`/`computed` instead. RxJS remains acceptable for real async streams (HTTP requests, DOM/router events), not for simple component state.',
        },
        schema: [],
    },
    defaultOptions: [],
    create(context) {
        const filename = context.filename;
        if (!filename.endsWith('.component.ts')) {
            return {};
        }
        return {
            ImportDeclaration(node) {
                if (node.source.value !== 'rxjs')
                    return;
                node.specifiers.forEach((specifier) => {
                    if (specifier.type !== AST_NODE_TYPES.ImportSpecifier)
                        return;
                    const importedName = specifier.imported.type === AST_NODE_TYPES.Identifier
                        ? specifier.imported.name
                        : specifier.imported.value;
                    if (RXJS_STATE_IMPORTS.has(importedName)) {
                        context.report({
                            node: specifier,
                            messageId: 'noRxjsLocalState',
                            data: { importedName },
                        });
                    }
                });
            },
        };
    },
};
