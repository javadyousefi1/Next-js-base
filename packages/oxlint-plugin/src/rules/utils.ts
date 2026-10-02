import type { ESTree } from "@oxlint/plugins";

/** `foo()` → "foo", `a.b.foo()` → "foo", anything else → null. */
export function calleeName(node: ESTree.CallExpression): string | null {
  const { callee } = node;
  if (callee.type === "Identifier") return callee.name;
  if (callee.type === "MemberExpression" && callee.property.type === "Identifier") {
    return callee.property.name;
  }
  return null;
}

/** String literal or template literal starting with `prefix`. */
export function isStringStartingWith(
  node: ESTree.Node | null | undefined,
  prefix: string,
): boolean {
  if (!node) return false;
  if (node.type === "Literal")
    return typeof node.value === "string" && node.value.startsWith(prefix);
  if (node.type === "TemplateLiteral")
    return node.quasis[0]?.value.cooked?.startsWith(prefix) ?? false;
  return false;
}

/** True when the file starts with the given directive, e.g. "use client". */
export function hasDirective(program: ESTree.Program, directive: string): boolean {
  return program.body.some(
    (statement) => statement.type === "ExpressionStatement" && statement.directive === directive,
  );
}
