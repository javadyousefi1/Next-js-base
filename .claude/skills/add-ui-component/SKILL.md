---
name: add-ui-component
description: Add a shadcn/ui component to the shared design system (packages/ui) with the shadcn CLI (base-nova style, Base UI, RTL). Use when a screen needs a UI primitive that packages/ui does not have yet.
---

# Add a UI component

1. Check `packages/ui/src/components/` first — reuse beats adding.
2. Install with the CLI from the package (keeps style, aliases and RTL transforms):

   ```bash
   cd packages/ui && bunx shadcn@latest add <component>
   ```

   `components.json` already sets `style: base-nova`, `rtl: true` and the `@repo/ui/*` aliases.
   If the CLI adds dependencies, pin them to exact versions in `packages/ui/package.json`.

3. Hooks the component needs go to `packages/ui/src/hooks/` (move them if the CLI put them in the
   app).
4. Import in apps as `@repo/ui/components/<component>`.
5. Base UI ≠ Radix: use `render={<Link href={…} />}` instead of `asChild`; Select takes
   `items`/`value`/`onValueChange`; ToggleGroup values are arrays. Read the component file.
6. App-specific variants or compositions go in the app (`src/components/`), not in the generated
   file. Edit generated files only to fix bugs, and say so in the commit.
7. Verify: `bun run typecheck`, `bun run lint`, check light/dark and `/fa` (RTL).
