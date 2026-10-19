import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

/**
 * The sample app is the living example of every workspace package (AGENTS.md §6). This check
 * fails when something new has no example:
 *   1. every package (tooling aside) is listed in `apps/sample/src/config/examples.ts`, i.e. it has
 *      an example page;
 *   2. every public module (a file behind an `exports` path such as `./components/*`) is imported
 *      by the sample app — directly, or by another used module of the same package;
 *   3. every value exported by a package index (`"."`) is imported by the sample app.
 * Runs with `bun run check` (turbo task `//#check:examples`).
 */
import { parseSync } from "oxc-parser";

const APP_SOURCES = new Bun.Glob("apps/sample/src/**/*.{ts,tsx}");
const EXAMPLES_CONFIG = "apps/sample/src/config/examples.ts";
/** Tooling packages: used by the build, not by app code. */
const TOOLING = new Set(["oxlint-plugin", "typescript-config"]);
const SKIP = /\.(test|spec)\.tsx?$|\.d\.ts$/;
/** Index exports that only serve the package itself (or its tests): no example needed. */
const PLUMBING: Record<string, string[]> = {
  "@repo/http": ["codeFromStatus", "parseResponse"],
  // `invalidateKeys` is the non-hook form of `useInvalidate` (shown in the data example).
  "@repo/query": [
    "collectAffectedQueries",
    "invalidateKeys",
    "labelFromKey",
    "makeQueryClient",
    "parseInput",
  ],
};

type ImportEntry = { importName: { kind: string; name?: string | null }; isType: boolean };
type ExportEntry = {
  exportName: { name?: string | null };
  moduleRequest?: { value: string } | null;
  isType: boolean;
};

async function parse(file: string) {
  const { module } = parseSync(file, await Bun.file(file).text());
  return {
    imports: module.staticImports.map((item) => ({
      from: item.moduleRequest.value,
      names: (item.entries as ImportEntry[])
        .filter((entry) => !entry.isType)
        .map((entry) => (entry.importName.kind === "Name" ? entry.importName.name : "*")),
    })),
    exports: module.staticExports.flatMap((item) => item.entries as ExportEntry[]),
  };
}

/** Public modules of a package: `specifier → file`, from its `exports` (index excluded). */
function publicModules(name: string, exports: Record<string, string>) {
  const modules = new Map<string, string>();
  for (const [key, target] of Object.entries(exports)) {
    if (key === "." || !/\.tsx?$/.test(target)) continue;
    const file = path.join("packages", name, target);
    if (!key.includes("*")) {
      modules.set(`@repo/${name}${key.slice(1)}`, file);
      continue;
    }
    const [dirPart, extension] = [path.dirname(file), path.extname(target)];
    for (const entry of readdirSync(dirPart)) {
      const base = entry.slice(0, -extension.length);
      if (!entry.endsWith(extension) || SKIP.test(entry) || base === "index") continue;
      modules.set(`@repo/${name}${key.slice(1).replace("*", base)}`, path.join(dirPart, entry));
    }
  }
  return modules;
}

/** `apps/sample/src/lib/query/index.ts` → `@/lib/query` (how app files import it). */
function appSpecifier(file: string) {
  return `@/${path.relative("apps/sample/src", file)}`.replace(/(\/index)?\.tsx?$/, "");
}

const problems: string[] = [];
const appImports = new Map<string, Set<string>>();
/** App barrels re-exporting a package (`export * from "@repo/query"`): barrel → package. */
const barrels = new Map<string, string>();
for await (const file of APP_SOURCES.scan()) {
  if (SKIP.test(file)) continue;
  const { imports, exports } = await parse(file);
  for (const { from, names } of imports) {
    const set = appImports.get(from) ?? new Set<string>();
    for (const imported of names) set.add(imported ?? "*");
    appImports.set(from, set);
  }
  const reExport = exports.find((entry) => entry.moduleRequest?.value.startsWith("@repo/"));
  if (reExport?.moduleRequest) barrels.set(appSpecifier(file), reExport.moduleRequest.value);
}
for (const [barrel, target] of barrels) {
  const set = appImports.get(target) ?? new Set<string>();
  for (const imported of appImports.get(barrel) ?? []) set.add(imported);
  appImports.set(target, set);
}
const examplesConfig = await Bun.file(EXAMPLES_CONFIG).text();

for (const name of readdirSync("packages").sort()) {
  if (TOOLING.has(name) || !existsSync(`packages/${name}/package.json`)) continue;
  const pkg = `@repo/${name}`;
  const { exports } = (await Bun.file(`packages/${name}/package.json`).json()) as {
    exports: Record<string, string>;
  };

  if (!examplesConfig.includes(`"${pkg}"`)) {
    problems.push(`${pkg}: no example page lists it in ${EXAMPLES_CONFIG}`);
  }

  // 3. Index exports: every value must be imported by the app (from the index or its module).
  const indexTarget = exports["."];
  const reExported = new Set<string>();
  if (indexTarget) {
    const indexFile = path.join("packages", name, indexTarget);
    const imported = new Set(
      [...appImports].filter(([from]) => from.startsWith(pkg)).flatMap(([, names]) => [...names]),
    );
    for (const entry of (await parse(indexFile)).exports) {
      const source = entry.moduleRequest?.value;
      if (source) reExported.add(path.join(path.dirname(indexFile), source));
      const exported = entry.exportName.name;
      const plumbing = PLUMBING[pkg]?.includes(exported ?? "");
      if (!entry.isType && exported && !plumbing && !imported.has(exported)) {
        problems.push(`${pkg}: \`${exported}\` is never used by the sample app`);
      }
    }
  }

  // 2. Public modules: used by the app, or by a used module of the same package.
  const modules = publicModules(name, exports);
  const byFile = new Map([...modules].map(([specifier, file]) => [file, specifier]));
  const used = new Set([...modules.keys()].filter((specifier) => appImports.has(specifier)));
  const queue = [...used];
  while (queue.length > 0) {
    const file = modules.get(queue.pop() ?? "");
    if (!file) continue;
    for (const { from } of (await parse(file)).imports) {
      const target = from.startsWith(".")
        ? byFile.get(
            [".ts", ".tsx"]
              .map((ext) => path.join(path.dirname(file), from) + ext)
              .find(existsSync) ?? "",
          )
        : modules.has(from)
          ? from
          : undefined;
      if (target && !used.has(target)) {
        used.add(target);
        queue.push(target);
      }
    }
  }
  for (const [specifier, file] of modules) {
    if (!used.has(specifier) && !reExported.has(file.replace(/\.tsx?$/, ""))) {
      problems.push(`${specifier}: never imported by the sample app`);
    }
  }
}

if (problems.length > 0) {
  console.error(
    `Missing examples — show each one in an apps/sample example page (AGENTS.md §6):\n  ${problems.join("\n  ")}`,
  );
  process.exit(1);
}
console.log("check-examples: every package, module and index export has an example");
