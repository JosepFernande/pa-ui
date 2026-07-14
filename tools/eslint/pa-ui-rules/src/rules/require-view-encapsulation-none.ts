import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator.withoutDocs;

export const rule = createRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require @Component decorators to have encapsulation: ViewEncapsulation.None',
    },
    messages: {
      missingViewEncapsulationNone:
        '@Component must have encapsulation: ViewEncapsulation.None.',
      wrongViewEncapsulation:
        '@Component encapsulation must be ViewEncapsulation.None. Found: {{ found }}.',
    },
    schema: [],
  },
  name: 'require-view-encapsulation-none',
  defaultOptions: [],
  create(context) {
    return {
      Decorator(node: TSESTree.Decorator) {
        const expression = node.expression;

        // Must be a CallExpression like @Component({...})
        if (expression.type !== AST_NODE_TYPES.CallExpression) {
          return;
        }

        const callee = expression.callee;

        // Check if the decorator is @Component
        if (callee.type !== AST_NODE_TYPES.Identifier) {
          return;
        }

        if (callee.name !== 'Component') {
          return;
        }

        // Get the first argument (the configuration object)
        const args = expression.arguments;
        if (args.length === 0) {
          context.report({
            node,
            messageId: 'missingViewEncapsulationNone',
          });
          return;
        }

        const configArg = args[0];
        if (configArg.type !== AST_NODE_TYPES.ObjectExpression) {
          return;
        }

        // Look for `encapsulation` property
        const encapsulationProp = configArg.properties.find(
          (prop): prop is TSESTree.Property =>
            prop.type === AST_NODE_TYPES.Property &&
            prop.key.type === AST_NODE_TYPES.Identifier &&
            prop.key.name === 'encapsulation',
        );

        if (!encapsulationProp) {
          context.report({
            node,
            messageId: 'missingViewEncapsulationNone',
          });
          return;
        }

        // Check if the value is `ViewEncapsulation.None`
        const value = encapsulationProp.value;
        const isViewEncapsulationNone =
          value.type === AST_NODE_TYPES.MemberExpression &&
          value.object.type === AST_NODE_TYPES.Identifier &&
          value.object.name === 'ViewEncapsulation' &&
          value.property.type === AST_NODE_TYPES.Identifier &&
          value.property.name === 'None';

        if (!isViewEncapsulationNone) {
          // Extract the encapsulation value for the error message
          let found = 'unknown';
          if (
            value.type === AST_NODE_TYPES.MemberExpression &&
            value.object.type === AST_NODE_TYPES.Identifier &&
            value.property.type === AST_NODE_TYPES.Identifier
          ) {
            found = `${value.object.name}.${value.property.name}`;
          }

          context.report({
            node,
            messageId: 'wrongViewEncapsulation',
            data: { found },
          });
        }
      },
    };
  },
});
