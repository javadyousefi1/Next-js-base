---
name: add-translation
description: Add or change user-facing text in apps/admin for both locales (English and Persian/RTL) with ICU messages. Use whenever UI text is added or changed.
---

# Add translations

1. Pick the namespace of the screen (`Users`, `Settings`…) or a shared one (`Common`,
   `DataTable`). Keys are camelCase; nest by section (`Users.empty.title`).
2. Add the key to **both** `apps/admin/messages/en.json` and `messages/fa.json`, same path.
3. Variables and plurals use ICU: `"total": "{total, plural, =0 {No users} one {# user} other {# users}}"`
   — Persian usually needs only `=0` and `other`.
4. Use it: Server Components `const t = await getTranslations("Users")`; client components
   `const t = useTranslations("Users")`. Dates/numbers: `useFormatter()` / `getFormatter()`.
5. Persian quality: natural wording, zero-width non-joiner where required (`نمی‌شود`), keep
   Latin product names as-is. Check the screen in `/fa` (RTL): spacing must use logical classes.
6. Verify key parity: `bun -e "const a=require('./apps/admin/messages/en.json'),b=require('./apps/admin/messages/fa.json');const k=(o,p='')=>Object.entries(o).flatMap(([x,v])=>typeof v==='object'?k(v,p+x+'.'):[p+x]);const A=k(a),B=k(b);console.log(A.filter(x=>!B.includes(x)),B.filter(x=>!A.includes(x)))"`
   must print two empty arrays.
