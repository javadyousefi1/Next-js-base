/**
 * Writes `.claude/codemap.md`: one line per export of the apps and packages —
 *   name · kind · path:line · first sentence of its doc comment
 * so Claude finds where something lives (by name or by concept) with one grep instead of
 * searching the code and opening files. Parsed with oxc-parser (real syntax, fast).
 * Runs at session start (SessionStart hook) and with `bun run codemap`; the file is gitignored.
 */
import { parseSync } from "oxc-parser";

const OUTPUT = ".claude/codemap.md";
const SOURCES = new Bun.Glob("{apps,packages}/*/{src,e2e}/**/*.{ts,tsx}");
const SKIP = /(\.test\.|\.spec\.|\.d\.ts$|\/node_modules\/)/;

type Node = { type: string; start: number; id?: { name?: string } | null; [key: string]: unknown };

const KINDS: Record<string, string> = {
  FunctionDeclaration: "function",
  ClassDeclaration: "class",
  VariableDeclaration: "const",
  TSTypeAliasDeclaration: "type",
  TSInterfaceDeclaration: "interface",
  TSEnumDeclaration: "enum",
};

/** First sentence of the JSDoc block that ends right before `start`, if any. */
function docBefore(
  source: string,
  comments: { type: string; value: string; end: number }[],
  start: number,
) {
  const comment = comments.findLast((c) => c.end <= start);
  if (!comment || comment.type !== "Block" || !comment.value.startsWith("*")) return "";
  if (source.slice(comment.end, start).trim() !== "") return "";
  const text = comment.value
    .split("\n")
    .map((line) => line.replace(/^\s*\*?\s?/, "").trim())
    .filter((line) => line && !line.startsWith("@"))
    .join(" ");
  const sentence = text.split(/(?<=\.)\s/)[0] ?? "";
  return sentence.length > 120 ? `${sentence.slice(0, 117)}…` : sentence;
}

/** Top-level declarations by name: `export { a, b }` points at where `a` and `b` are declared. */
function declarationsByName(body: Node[]) {
  const byName = new Map<string, { node: Node; declaration: Node }>();
  for (const node of body) {
    const declaration = (node.type.startsWith("Export") ? node.declaration : node) as Node | null;
    if (!declaration) continue;
    const declarators = (declaration.declarations as { id?: { name?: string } }[] | undefined) ?? [
      declaration,
    ];
    for (const { id } of declarators) if (id?.name) byName.set(id.name, { node, declaration });
  }
  return byName;
}

function kindOf(declaration: Node | undefined, file: string, name: string): string {
  const kind = (declaration && KINDS[declaration.type]) ?? "export";
  const looksLikeComponent = file.endsWith(".tsx") && /^[A-Z]/.test(name);
  return looksLikeComponent && (kind === "function" || kind === "const") ? "component" : kind;
}

const files = (await Array.fromAsync(SOURCES.scan({ dot: false })))
  .filter((f) => !SKIP.test(f))
  .sort();
const lines: string[] = [];
const started = performance.now();

for (const file of files) {
  const source = await Bun.file(file).text();
  const { program, module, comments } = parseSync(file, source);
  const statements = new Map((program.body as Node[]).map((node) => [node.start, node]));
  const declared = declarationsByName(program.body as Node[]);
  const lineOf = (offset: number) => source.slice(0, offset).split("\n").length;

  for (const statement of module.staticExports) {
    const node = statements.get(statement.start);
    for (const entry of statement.entries) {
      const local = entry.localName.name ?? undefined;
      const isDefault = entry.exportName.kind === "Default";
      const ownDeclaration = isDefault ? (node?.declaration as Node | undefined) : undefined;
      const target = local && !entry.moduleRequest ? declared.get(local) : undefined;
      const declaration = ownDeclaration ?? target?.declaration;
      const name = isDefault
        ? `default ${declaration?.id?.name ?? ""}`.trim()
        : (entry.exportName.name ?? "*");
      const kind = entry.moduleRequest
        ? `re-export from ${entry.moduleRequest.value}`
        : isDefault
          ? "default"
          : kindOf(declaration, file, name);
      const at = target?.node.start ?? statement.start;
      const doc = docBefore(source, comments, at);
      lines.push(`${name} · ${kind} · ${file}:${lineOf(at)}${doc ? ` · ${doc}` : ""}`);
    }
  }
}

const header = [
  "# Code map (generated — do not edit; `bun run codemap`)",
  "",
  "`name · kind · path:line · doc` — grep this file by name or by concept to find where code lives.",
  "",
];
await Bun.write(OUTPUT, `${header.join("\n")}${lines.join("\n")}\n`);
console.log(
  `codemap: ${lines.length} exports from ${files.length} files in ${Math.round(performance.now() - started)} ms → ${OUTPUT}`,
);
