# packages/ui — AGENTS.md

Design system shared by every app: shadcn/ui components (style `base-nova` = Base UI primitives),
Tailwind CSS 4 tokens (`src/styles/globals.css`), `cn()` and UI hooks. Repository rules:
[`../../AGENTS.md`](../../AGENTS.md).

- **Add components with the CLI only** (keeps them updatable):
  `cd packages/ui && bunx shadcn@latest add <component>` — `components.json` sets the style,
  aliases (`@repo/ui/...`) and `rtl: true` (the CLI rewrites classes to logical `ms-*`/`ps-*`).
- Generated files in `src/components/` are vendor code: change them only to fix a real bug, and
  say so in the commit. Compose/extend them in the app instead. Every component is shown in the
  sample app's UI gallery (`apps/sample/src/features/examples/components/ui-*-tab.tsx`).
- Import paths: `@repo/ui/components/<name>`, `@repo/ui/lib/utils` (`cn`), `@repo/ui/hooks/<name>`.
- Theme tokens live in `src/styles/globals.css` (`:root` + `.dark`, oklch). Apps import it through
  `@repo/ui/globals.css`; never redefine tokens in an app.
- Base UI API differs from Radix: composition uses the `render` prop (not `asChild`), Select uses
  `items` + `value`/`onValueChange`, ToggleGroup values are arrays.
- Own modules (not from the CLI): **modal** — `lib/modal.ts` (`modal.confirm/alert/prompt/open`,
  promise-based, a store; unit-tested), `components/modal-host.tsx` (`<ModalHost labels>` renders
  them, mount once), `hooks/use-modal-close.ts` (`close(value)` inside `modal.open` content).
  `popover.tsx` follows base-nova by hand (the registry was unreachable); `--success`/`--warning`
  tokens serve the modal variants.
- Own components (not from the CLI): `jalali-calendar`, `jalali-date-picker`,
  `jalali-date-range-picker` on `@repo/jalali` (values `{ year, month, day }`). Their rules live
  in `lib/jalali-calendar.ts` (unit-tested: `bun test`), state in `hooks/use-jalali-*`; the
  components only render. Labels are props — the app passes translations.
- Chat components `message`, `bubble`, `marker` follow the shadcn chat registry (base-nova) by
  hand: the registry was unreachable, so they were copied from the shadcn-ui/ui source with the
  nova styles inlined and RTL logical classes. Usage: `.claude/skills/shadcn/rules/chat.md`.
- Own component `file-dropzone` (drag-and-drop / click picker, no dependency): rules in
  `lib/file-validation.ts` (`validateFiles`, `formatBytes`; unit-tested), state in
  `hooks/use-file-dropzone.ts`. Every visible string is a `labels` prop; fixed min-height, no layout shift.
