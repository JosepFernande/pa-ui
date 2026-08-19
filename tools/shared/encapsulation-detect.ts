import ts from 'typescript';

/**
 * Checks whether a TypeScript source file declares `ViewEncapsulation.None`
 * inside its `@Component` decorator.
 *
 * Uses the TypeScript Compiler API instead of regex so multiline decorators
 * and nested object literals (e.g. `host: { ... }`) are parsed correctly.
 */
export function getEncapsulationStatus(tsContent: string): 'None' | 'missing' | 'wrong' {
  const sourceFile = ts.createSourceFile(
    '__audit__.ts',
    tsContent,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  let result: 'None' | 'missing' | 'wrong' = 'missing';

  function visit(node: ts.Node): void {
    if (!ts.isDecorator(node)) {
      ts.forEachChild(node, visit);
      return;
    }

    const expr = node.expression;
    if (!ts.isCallExpression(expr)) {
      return;
    }

    if (expr.expression.getText(sourceFile) !== 'Component') {
      return;
    }

    const arg = expr.arguments[0];
    if (!arg || !ts.isObjectLiteralExpression(arg)) {
      result = 'missing';
      return;
    }

    const encProp = arg.properties.find(
      (p): p is ts.PropertyAssignment =>
        ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === 'encapsulation',
    );

    if (!encProp) {
      result = 'missing';
      return;
    }

    const value = encProp.initializer;
    if (
      ts.isPropertyAccessExpression(value) &&
      ts.isIdentifier(value.expression) &&
      value.expression.text === 'ViewEncapsulation' &&
      value.name.text === 'None'
    ) {
      result = 'None';
    } else {
      result = 'wrong';
    }
  }

  ts.forEachChild(sourceFile, visit);
  return result;
}
