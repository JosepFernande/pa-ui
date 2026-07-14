import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';
const createRule = ESLintUtils.RuleCreator.withoutDocs;
export const rule = createRule({
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow union literal types on @Input() color properties. Color must be typed as string.',
        },
        messages: {
            colorNotString: '@Input() color must be typed as `string`, not a union of string literals.',
        },
        schema: [],
    },
    name: 'no-color-literal-union',
    defaultOptions: [],
    create(context) {
        /**
         * Check if a type node is a union of string literals (not plain `string`).
         * Returns true if the type is a union type containing at least one string literal.
         */
        function isLiteralUnionType(typeNode) {
            // Direct union type: 'primary' | 'secondary'
            if (typeNode.type === AST_NODE_TYPES.TSUnionType) {
                return typeNode.types.some((t) => t.type === AST_NODE_TYPES.TSLiteralType);
            }
            // Single literal type: 'primary' (no union, but still a literal)
            if (typeNode.type === AST_NODE_TYPES.TSLiteralType) {
                return true;
            }
            return false;
        }
        /**
         * Check decorator-based @Input() color: 'union' | 'literal'
         */
        function checkDecoratorInput(node) {
            if (node.key.type !== AST_NODE_TYPES.Identifier)
                return;
            if (node.key.name !== 'color')
                return;
            node.decorators?.forEach((decorator) => {
                const expr = decorator.expression;
                if (expr.type === AST_NODE_TYPES.CallExpression &&
                    expr.callee.type === AST_NODE_TYPES.Identifier &&
                    expr.callee.name === 'Input') {
                    if (node.typeAnnotation?.typeAnnotation) {
                        const typeNode = node.typeAnnotation.typeAnnotation;
                        if (isLiteralUnionType(typeNode)) {
                            context.report({
                                node: decorator,
                                messageId: 'colorNotString',
                            });
                        }
                    }
                }
            });
        }
        /**
         * Check signal-based input: readonly color = input<'primary' | 'secondary'>('primary')
         */
        function checkSignalInput(node) {
            if (node.key.type !== AST_NODE_TYPES.Identifier)
                return;
            if (node.key.name !== 'color')
                return;
            if (node.value?.type === AST_NODE_TYPES.CallExpression &&
                node.value.callee.type === AST_NODE_TYPES.Identifier &&
                node.value.callee.name === 'input') {
                if (node.value.typeArguments?.params?.length) {
                    const typeNode = node.value.typeArguments.params[0];
                    if (isLiteralUnionType(typeNode)) {
                        context.report({
                            node,
                            messageId: 'colorNotString',
                        });
                    }
                }
            }
        }
        return {
            PropertyDefinition(node) {
                checkDecoratorInput(node);
                checkSignalInput(node);
            },
        };
    },
});
