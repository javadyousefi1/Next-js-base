# apps/shokolet — AGENTS.md

Shokolet: a single RTL Persian page where a customer builds a chocolate gift box and sees it live in
3D (React Three Fiber + GSAP). Persian only, static data, no auth/API/env. Repository rules:
[`../../AGENTS.md`](../../AGENTS.md) (views render only, hooks hold logic, `cn()`, logical RTL
classes, kebab-case files, strings in messages). Next.js docs for this exact version:
`node_modules/next/dist/docs/`.

## Folder structure (`src/`)

```
app/                          layout (html lang=fa dir=rtl, font, providers) + thin page
components/providers/         DirectionProvider (rtl) + Toaster
features/gift-builder/
  gift-builder.config.ts      THE DATA: chocolates, boxes, box colors, filler (prices, colors)
  gift-builder.state.ts       reducer + selectors (tested): items, box, color, filler, wrapped
  geometry/                   pure maths, no React: outlines, slots (capacity), filler, three shapes
  hooks/                      use-gift-builder (state) + GSAP animation hooks (box pop, wrap, motion…)
  components/                 DOM views (panel steps); components/scene/ = R3F views (render only)
  gsap.ts                     registers useGSAP once; import gsap from here
i18n/                         single-locale next-intl config (fa), no locale routing
styles/globals.css            Tailwind + brand tokens (cocoa, cream, gold), Vazirmatn
../messages/fa.json           every user-facing string
```

## Where to edit

- Prices, colors, new chocolates/boxes: `gift-builder.config.ts` (+ names in `messages/fa.json`).
  Box capacity is derived from the slot layout in `geometry/slots.ts`.
- 3D context: React context (next-intl…) does not reach inside the `<Canvas>`: pass props.

## Commands

`bun run dev` (http://localhost:3001) · `bun run build` · `bun run start` · `bun run test` ·
`bun run typecheck` (from `apps/shokolet`, or via the repo root `bun run check`).
