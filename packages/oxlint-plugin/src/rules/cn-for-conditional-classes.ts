import { defineRule } from "@oxlint/plugins";

const CLASS_ATTRIBUTES = new Set(["className", "class"]);
const CONDITIONAL_TYPES = new Set([
  "ConditionalExpression",
  "LogicalExpression",
  "BinaryExpression",
  "TemplateLiteral",
]);

/** Conditional / composed class names must go through `cn()` (merges Tailwind conflicts). */
export const cnForConditionalClasses = defineRule({
  meta: {
    type: "suggestion",
    docs: { description: "Require cn() for conditional or composed className values." },
    messages: {
      useCn:
        'Compose class names with cn() from "@repo/ui/lib/utils", e.g. className={cn("base", isActive && "active")}.',
    },
    schema: [],
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name.type !== "JSXIdentifier" || !CLASS_ATTRIBUTES.has(node.name.name)) return;
        if (node.value?.type !== "JSXExpressionContainer") return;
        const { expression } = node.value;
        const isPlainTemplate =
          expression.type === "TemplateLiteral" && expression.expressions.length === 0;
        if (CONDITIONAL_TYPES.has(expression.type) && !isPlainTemplate) {
          context.report({ node, messageId: "useCn" });
        }
      },
    };
  },
});
