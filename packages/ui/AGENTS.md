# packages/ui — AGENTS.md

Design system shared by every app: shadcn/ui components (style `base-nova` = Base UI primitives),
Tailwind CSS 4 tokens (`src/styles/globals.css`), `cn()` and UI hooks. Repository rules:
[`../../AGENTS.md`](../../AGENTS.md).

- **Add components with the CLI only** (keeps them updatable):
  `cd packages/ui && bunx shadcn@latest add <component>` — `components.json` sets the style,
  aliases (`@repo/ui/...`) and `rtl: true` (the CLI rewrites classes to logical `ms-*`/`ps-*`).
- Generated files in `src/components/` are vendor code: change them only to fix a real bug, and
  say so in the commit. Compose/extend them in the app instead.
- Import paths: `@repo/ui/components/<name>`, `@repo/ui/lib/utils` (`cn`), `@repo/ui/hooks/<name>`.
- Theme tokens live in `src/styles/globals.css` (`:root` + `.dark`, oklch). Apps import it through
  `@repo/ui/globals.css`; never redefine tokens in an app.
- Base UI API differs from Radix: composition uses the `render` prop (not `asChild`), Select uses
  `items` + `value`/`onValueChange`, ToggleGroup values are arrays.
