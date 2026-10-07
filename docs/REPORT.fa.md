# گزارش کامل پروژه — بیس Next.js (مونوریپو Turborepo + Bun)

این سند همه‌ی کارهایی را که انجام شده توضیح می‌دهد: چه چیزی ساخته شد، کجاست، چرا این‌طور ساخته
شد، چطور اجرا و توسعه داده می‌شود، و هشدارهایی که باید از قبل بدانید. داک‌های فنی (`AGENTS.md`،
`docs/*.md`، skillها) عمداً انگلیسی‌اند، چون ایجنت‌های هوش مصنوعی با دستورالعمل انگلیسی دقیق‌تر کار
می‌کنند؛ اگر نسخه‌ی فارسی آن‌ها را هم خواستید بگویید.

---

## ۱. اجرای سریع

```bash
bun run setup        # بررسی ابزارها، نصب پکیج‌ها، ساخت .env.local، نصب مرورگر Playwright
bun run dev          # http://localhost:3000  — ورود نمایشی: admin / admin123
bun run check        # lint + format + typecheck + تست‌های واحد (همان چیزی که قبل از push اجرا می‌شود)
bun run build        # بیلد production (با کش توربو)
bun run test:e2e     # بیلد + تست‌های Playwright روی نسخه‌ی production (API با MSW شبیه‌سازی می‌شود)
bun run docker:up    # استک production: اپ ادمین + Redis با docker compose
```

پیش‌نیازها: Node ≥ 24 (فایل `.nvmrc`)، Bun نسخه‌ی 1.4.2، و Docker (اختیاری؛ برای Redis و compose).
در حالت توسعه Redis اجباری نیست: محدودیت نرخ ورود در صورت قطعی Redis «fail open» می‌شود و
`/api/health` وضعیت `redis: "down"` را نشان می‌دهد.

---

## ۲. ساختار کلی

```
apps/admin/                 اپ Next.js 16 (پنل ادمین مرجع)
packages/http/              کلاس HttpClient (axios داخلش): خروجی فقط دیتا یا ApiError
packages/query/             لایه‌ی React Query: createMakeQuery، makeMutation، invalidation
packages/table/             جدول headless: قرارداد URL با nuqs، useTableState، تایپ‌ها
packages/hooks/             هوک‌های عمومی React (debounce، interval، local storage…)
packages/redis/             کمکی‌های Redis فقط-سرور: کلاینت، remember، rateLimit
packages/ui/                دیزاین سیستم: کامپوننت‌های shadcn (base-nova + RTL)، توکن‌های Tailwind 4، cn()
packages/oxlint-plugin/     قوانین اختصاصی لینتر پروژه (project/*) + ۳۸ تست
packages/typescript-config/ تنظیمات مشترک tsconfig
scripts/                    setup، doctor، clean، هوک git، هوک Claude، ساخت آیکن PWA
docs/                       معماری، تصمیم‌ها، عملیات، و همین گزارش
.claude/                    تنظیمات Claude Code: هوک‌ها، قوانین مسیرمحور، skillها، ساب‌ایجنت‌ها
AGENTS.md / CLAUDE.md       قوانین مشترک برای انسان و هوش مصنوعی
```

ساختار داخل اپ (`apps/admin/src`):

```
app/            فقط روتینگ: صفحه‌ها و layoutهای نازک، روت‌هندلرهای BFF، manifest/robots/sitemap
components/     ویوهای عمومی (data-table، feedback، layout، providers)
config/         ثابت‌ها: routes، query-keys، api-endpoints، cache-tags، navigation، site
features/<x>/   هر فیچر: schemas → api (service + queries) → hooks (منطق) → components (ویو) → server
hooks/          هوک‌های عمومی
i18n/           next-intl: روتینگ، ناوبری (Link/useRouter)، پیکربندی درخواست
lib/            http (کلاس HttpClient + ApiError)، query (makeQuery/makeMutation)، table، seo
mocks/          API ساختگی با MSW + Faker
server/         فقط سرور: کوکی/سشن، پاسخ‌های BFF، کلاینت upstream، Redis
env.ts          همه‌ی envها در یک فایل با اعتبارسنجی zod (آبجکت‌های server و client)
proxy.ts        (جایگزین middleware در Next 16) روتینگ زبان + گارد ورود
```

---

## ۳. چک‌لیست نیازمندی‌ها (همه‌ی موارد پرامپت اول و پیام‌های بعدی)

| #   | خواسته                                                          | وضعیت | کجا / چطور                                                                                                                                  |
| --- | --------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | مونوریپو Turborepo (ورسل)                                       | ✅    | `turbo.json`، workspaceهای `apps/*` و `packages/*`                                                                                          |
| 2   | همه‌ی پکیج‌ها آخرین نسخه                                        | ✅    | نسخه‌ها دقیق pin شده‌اند (جدول بخش ۴) — آخرین نسخه در زمان ساخت                                                                             |
| 3   | به‌جای ESLint، Oxlint و Oxformatter                             | ✅    | `oxlint.config.ts` (type-aware)، `.oxfmtrc.json` (مرتب‌سازی import و کلاس‌های Tailwind)                                                     |
| 4   | Husky                                                           | ✅    | `.husky/pre-commit`، `commit-msg`، `pre-push`                                                                                               |
| 5   | متن کامیت ولیدیت شود و فرمت داشته باشد                          | ✅    | commitlint + Conventional Commits + لیست scopeها (`commitlint.config.ts`)                                                                   |
| 6   | روی main قبل از push بیلد چک شود                                | ✅    | `scripts/git/pre-push.sh`: برای main بیلد production + تست e2e                                                                              |
| 7   | قبل از push تست‌ها اجرا شوند                                    | ✅    | همان هوک: همیشه `bun run check` (lint + format + typecheck + تست‌ها)                                                                        |
| 8   | axios + React Query                                             | ✅    | `lib/http` (کلاینت مرورگر → BFF) و `server/http` (سرور → API اصلی)، هر دو نمونه‌ای از کلاس `HttpClient` در پکیج `@repo/http`                |
| 9   | کوئری‌ها و میوتیشن‌ها wrap شده باشند                            | ✅    | `makeQuery` و `makeMutation` در پکیج `@repo/query`؛ استفاده‌ی مستقیم از `useQuery` با لینت ممنوع است                                        |
| 10  | `makeQuery` با کلیدهای مرتبط که با تغییرشان آپدیت شود           | ✅    | `relatedKeys` + invalidation زنجیره‌ای و امن در برابر حلقه (`lib/query/invalidate.ts` + تست)                                                |
| 11  | ورودی/خروجی makeQuery و makeMutation با zod ولیدیت شود          | ✅    | `params`/`variables` قبل از درخواست و `response` قبل از رسیدن به کش parse می‌شوند؛ خطاها `VALIDATION` و `INVALID_RESPONSE`                  |
| 12  | کلی هوک کاستوم مفید                                             | ✅    | ۱۲ هوک عمومی در پکیج `@repo/hooks` + `useAppRouter` در اپ (بخش ۵)                                                                           |
| 13  | هوک مدیریت سرچ/فیلتر/صفحه‌بندی جدول با separation of concerns   | ✅    | `useTableState` در `@repo/table` (وضعیت URL + اکشن‌ها) + کامپوننت‌های ساده؛ ستون‌ها و فیلترها آرایه‌ی ساده‌اند (بدون کتابخانه‌ی جدول)       |
| 14  | دیزاین سیستم shadcn                                             | ✅    | `packages/ui` با CLI رسمی shadcn، استایل base-nova، پشتیبانی RTL، ۳۳ کامپوننت                                                               |
| 15  | فول TypeScript                                                  | ✅    | TypeScript 7 (کامپایلر native) با strict و `noUncheckedIndexedAccess`                                                                       |
| 16  | Tailwind                                                        | ✅    | Tailwind CSS 4.3                                                                                                                            |
| 17  | فونت Roboto                                                     | ✅    | `next/font/local` (فایل‌ها داخل ریپو)؛ برای متن فارسی Vazirmatn (هشدار ۵)                                                                   |
| 18  | بیس Playwright داخل اپ نکست                                     | ✅    | `apps/admin/playwright.config.ts` + ۱۵ تست در `e2e/` (همه سبز)                                                                              |
| 19  | منطق در همه‌جا از دیزاین جدا باشد                               | ✅    | الگوی hook/view + قانون لینت `project/no-logic-in-views`                                                                                    |
| 20  | داک، skill و agent از روی صحبت‌های من، برای یکی شدن دست‌خط      | ✅    | `AGENTS.md`، `CLAUDE.md`، `.claude/rules`، ۹ skill، ۳ ساب‌ایجنت، هوک فرمت/لینت خودکار                                                       |
| 21  | بهترین قوانین لینتر                                             | ✅    | دسته‌های correctness/suspicious/perf، قوانین type-aware، و ۷ قانون اختصاصی پروژه                                                            |
| 22  | کلیدهای React Query فقط از ثابت‌ها                              | ✅    | `QUERY_KEYS`/`MUTATION_KEYS` + قانون `project/no-inline-query-keys`                                                                         |
| 23  | همه‌ی روت‌ها، Link و navigate از ثابت‌ها                        | ✅    | `ROUTES` + قانون `project/no-hardcoded-routes` + ممنوعیت `next/link` و ناوبری `next/navigation`                                             |
| 24  | در کامپوننت منطق نوشته نشود                                     | ✅    | قانون لینت؛ هوک‌ها مدل آماده‌ی رندر برمی‌گردانند                                                                                            |
| 25  | هرجا لازم است سرور یا کلاینت بودن کد چک شود                     | ✅    | `import "server-only"` اجباری + قانون `no-server-import-in-client` + `isServer` در کوئری‌کلاینت                                             |
| 26  | envها با پکیج مربوطه چک شوند و کمبود کلید خطا بدهد              | ✅    | `@t3-oss/env-nextjs` + zod؛ در بیلد و هنگام بوت؛ کمبود کلید = توقف با پیام واضح (تست شد)                                                    |
| 27  | Redis با اتصال تمیز                                             | ✅    | `server/redis`: یک اتصال برای هر پروسه، reconnect با backoff، prefix کلیدها، rate limit، cache-aside                                        |
| 28  | درخواست‌ها و توکن‌ها سمت سرور با کوکی httpOnly و از طریق پروکسی | ✅    | BFF: `/api/auth/*` و `/api/proxy/*`؛ refresh خودکار توکن؛ توکن هیچ‌وقت به JS مرورگر نمی‌رسد (در e2e تست شد)                                 |
| 29  | حداقل قابلیت‌های PWA                                            | ✅    | manifest، آیکن‌ها (maskable)، service worker، صفحه‌ی آفلاین، دکمه‌ی نصب، بنر آفلاین                                                         |
| 30  | تنظیمات ضروری `next.config`                                     | ✅    | standalone، React Compiler، typedRoutes، cacheComponents، هدرهای امنیتی/CSP، تصاویر AVIF/WebP، هدرهای sw.js                                 |
| 31  | کشینگ در سطح نکست                                               | ✅    | Cache Components + `'use cache'` + `cacheLife` + `cacheTag` + `updateTag` (داشبورد)                                                         |
| 32  | لودر بین صفحه‌ها (Next.js top loader)                           | ✅    | `nextjs-toploader` + `useAppRouter` برای ناوبری برنامه‌ای                                                                                   |
| 33  | تنظیمات SEO و ایندکس شدن                                        | ✅    | metadata، canonical، hreflang، robots، sitemap؛ ایندکس با `NEXT_PUBLIC_SITE_INDEXABLE`                                                      |
| 34  | استایل شرطی فقط با `cn`                                         | ✅    | قانون `project/cn-for-conditional-classes` + ممنوعیت clsx/tailwind-merge                                                                    |
| 35  | چندزبانه                                                        | ✅    | next-intl با انگلیسی و فارسی (RTL کامل)، URLهای `/en` و `/fa`                                                                               |
| 36  | دارک مود و لایت مود                                             | ✅    | next-themes (روشن/تیره/سیستم)                                                                                                               |
| 37  | اسکریپت‌های ضروری در پوشه‌ی scripts                             | ✅    | setup، doctor، clean، pre-push، post-edit (هوک Claude)، generate-icons                                                                      |
| 38  | استفاده از Bun در صورت سرعت بیشتر                               | ✅    | پکیج‌منیجر، اجرای اسکریپت‌ها و تست واحد با Bun؛ ران‌تایم production روی Node (هشدار ۷)                                                      |
| 39  | Dockerfile و docker-compose آماده‌ی production                  | ✅    | `apps/admin/Dockerfile` (چندمرحله‌ای، non-root، healthcheck) + `docker-compose.yml` (اپ + Redis)                                            |
| 40  | کش بیلد توربو درست و کامل فعال                                  | ✅    | inputs/outputs دقیق، strict env، هش کل ریپو برای lint؛ اجرای دوباره از کش                                                                   |
| 41  | برای پکیج‌ها داک خوانده شود، چیزی از خود درنیاید                | ✅    | APIها از سورس و تایپ پکیج‌های نصب‌شده و داک‌های همراه Next و Turbo تأیید شدند (هشدار ۱۵)                                                    |
| 42  | پنل ادمین با shadcn که همه‌چیز را نشان دهد                      | ✅    | ورود، داشبورد (آمار کش‌شده)، جدول کاربران، تنظیمات (تم، زبان، نصب اپ)                                                                       |
| 43  | ساختار مورد تأیید Claude (مهم‌ترین بخش)                         | ✅    | ساختار رسمی: `CLAUDE.md` با `@AGENTS.md`، `.claude/settings.json` (هوک + دسترسی‌ها)، `rules` با `paths`، `skills/*/SKILL.md`، `agents/*.md` |
| 44  | اگر چیزی اشتباه است قبلش گفته شود                               | ✅    | بند اول «Working agreement» در `AGENTS.md` و `CLAUDE.md` + بخش هشدارهای همین گزارش                                                          |
| 45  | کد خیلی پیچیده و عجیب نباشد                                     | ✅    | Redis cache handler و API ساختگی جداگانه حذف شدند؛ الگوها کوتاه و یکنواخت‌اند                                                               |
| 46  | دیتای فیک با MSW و Faker                                        | ✅    | `src/mocks` (Faker با seed ثابت ⇐ دیتای قطعی برای تست‌ها)                                                                                   |
| 47  | داک نهایی که همه‌چیز را توضیح دهد                               | ✅    | همین فایل + `docs/`                                                                                                                         |

---

## ۴. نسخه‌ی پکیج‌های اصلی (pin دقیق)

| حوزه         | پکیج‌ها                                                                                                                |
| ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| فریم‌ورک     | next 16.3.8، react / react-dom 19.3.0، babel-plugin-react-compiler 1.0.0                                               |
| زبان و ابزار | typescript 7.0.2، turbo 2.11.6، bun 1.4.2                                                                              |
| کیفیت کد     | oxlint 1.86.0، oxlint-tsgolint 7.0.2003، oxfmt 0.71.0، husky 9.1.7، lint-staged 17.6.0، commitlint 21.2.3              |
| UI           | shadcn 4.21.1، @base-ui/react 1.8.0، tailwindcss 4.3.3، lucide-react 1.49.0، next-themes 0.4.6، sonner 2.0.8، cn 0.4.0 |
| دیتا         | @tanstack/react-query 5.104.0، axios 1.20.0، zod 4.6.5، nuqs 2.10.1، react-hook-form 7.89.0                            |
| زیرساخت      | next-intl 4.14.8، redis 6.3.0، @t3-oss/env-nextjs 0.13.11، nextjs-toploader 3.9.17                                     |
| تست و ماک    | @playwright/test 1.63.0، msw 3.0.1، @faker-js/faker 10.6.0                                                             |

به‌روزرسانی: `bun outdated` و سپس `bun update --latest`، و بعد حتماً `bun run check` و
`bun run test:e2e`.

---

## ۵. جزئیات پیاده‌سازی

### ۵.۱ لایه‌ی دیتا: `makeQuery` و `makeMutation`

```ts
// fetcher فقط یک‌بار نوشته می‌شود و هم در مرورگر و هم روی سرور کار می‌کند
export const fetchUsersList: QueryFetcher<UsersListParams> = (params, { http, signal }) =>
  http.get(API_ENDPOINTS.users.list, { params: toBackendListQuery(params), signal });

export const usersListQuery = makeQuery({
  key: QUERY_KEYS.users.list, // فقط از ثابت‌ها؛ لیبل خطاها هم از همین کلید ساخته می‌شود
  params: usersListParamsSchema, // ورودی قبل از درخواست parse می‌شود
  response: usersListResponse, // از users.backend.ts: شکل بک‌اند چک و به مدل اپ تبدیل می‌شود
  fetcher: fetchUsersList,
  relatedKeys: [], // با invalidate شدن این کلیدها، این کوئری هم رفرش می‌شود
  staleTime: 30_000,
});
```

- ورودی نامعتبر ⇐ `ApiError` با کد `VALIDATION` (درخواست اصلاً ارسال نمی‌شود).
- پاسخ با شکل غیرمنتظره ⇐ `INVALID_RESPONSE` (در حالت توسعه درخت خطای zod لاگ می‌شود).
- هیچ لیبل متنی دستی وجود ندارد: لیبل خطا از ثابت کلید ساخته می‌شود (`users.list`، `auth.login`).
- `http` تزریق می‌شود: در مرورگر `apiClient` است (⇐ `/api/proxy`) و در prefetch سرور، کلاینت
  upstream با توکن همان کاربر. چون پروکسی مسیرها را یک‌به‌یک منتقل می‌کند، یک fetcher برای هر
  دو طرف کافی است.
- `makeMutation` با `variables` (همان اسکیمای فرم)، `response` و `invalidates`؛ بعد از موفقیت،
  کلیدهای `invalidates` و هر کوئری‌ای که آن‌ها را در `relatedKeys` دارد (به‌صورت زنجیره‌ای) رفرش
  می‌شوند و میوتیشن تا پایان این کار pending می‌ماند.
- خطاها همیشه `ApiError` با `code` هستند؛ خطاهای 4xx دوباره تلاش نمی‌شوند؛ خطای رفرش‌های
  پس‌زمینه toast می‌شود و خطای بار اول داخل خود ویو نمایش داده می‌شود.
- فراخوانی‌های فقط-سرور (مثل آمار داشبورد) اسکیما را به خود کلاینت می‌دهند:
  `upstream.get(API_ENDPOINTS.stats, { schema: dashboardStatsResponse })`. پاسخ داخل کلاینت با zod چک
  می‌شود و لیبل خطا از ثابت endpoint ساخته می‌شود (`GET /stats`). جزئیات در بخش ۱۳.

### ۵.۲ پیش‌بارگذاری سمت سرور (hydration) در یک خط

```tsx
<PrefetchBoundary
  queries={[usersListQuery.with(loadUsersSearchParams(searchParams))]}
  fallback={<DataTableSkeleton />}
>
  <UsersTable />
</PrefetchBoundary>
```

`PrefetchBoundary` خودش Suspense دارد، کوکی را می‌خواند، همان fetcher کوئری را با توکن کاربر روی
upstream اجرا می‌کند و کش را dehydrate می‌کند. برای هر `makeQuery` فقط `xQuery.with(params)` لازم
است. اگر سشن نباشد یا توکن منقضی شده باشد، prefetch انجام نمی‌شود و کلاینت از طریق BFF می‌گیرد.

### ۵.۳ احراز هویت (BFF)

- ورود: مرورگر ⇐ `POST /api/auth/login` ⇐ API اصلی ⇐ کوکی‌های `access_token` و `refresh_token`
  (httpOnly، Secure در production، SameSite=Lax).
- هر درخواست (از جمله کاربر جاری از `/auth/me`): مرورگر ⇐ `/api/proxy/<path>` ⇐ BFF توکن را از
  کوکی برمی‌دارد و Bearer می‌فرستد. اگر 401 شد، یک‌بار با refresh token تمدید می‌کند، دوباره تلاش
  می‌کند و کوکی‌های جدید را ست می‌کند. اگر تمدید هم شکست بخورد، کوکی‌ها پاک می‌شوند و کاربر با
  `callbackUrl` به صفحه‌ی ورود می‌رود.
- endpointهای صادرکننده‌ی توکن (`/auth/login` و `/auth/refresh`) در پروکسی مسدودند (404)، تا توکن
  خام هیچ‌وقت به جاوااسکریپت مرورگر نرسد.
- `callbackUrl` در برابر open redirect محافظت شده است. ورود با Redis محدود می‌شود (۵ بار در
  دقیقه برای هر IP).

### ۵.۴ جدول‌ها: یک الگو برای همه‌ی صفحه‌ها (React ساده، بدون کتابخانه‌ی جدول)

صفحه‌بندی، مرتب‌سازی و فیلتر روی API انجام می‌شود و UI فقط صفحه‌ی فعلی را نمایش می‌دهد. برای همین
کتابخانه‌ی جدول لازم نیست:

| تکه                      | کارش                                                                                                                          |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `users.search-params.ts` | قرارداد URL با پارسرهای nuqs (`filterParams.select/multiSelect/text`)؛ هم صفحه‌ی سرور و هم هوک از آن می‌خوانند                |
| `useTableState(parsers)` | وضعیت URL + اکشن‌ها (`setSearch`، `setFilter`، `toggleFilterOption`، `toggleSort`، `setPage`، `resetFilters`، `clearFilters`) |
| `useUsersTable`          | وضعیت URL ⇐ کوئری ⇐ `TableController` (کنترل‌ها + ردیف‌ها + حالت‌ها)                                                          |
| `columns` و `filters`    | دو آرایه‌ی ساده: `{ id, header, cell, sortable }` و کانفیگ فیلتر `{ type, id, title, options }`                               |
| `DataTableProvider`      | context جدول (`@repo/table/data-table-context`)؛ تولبار، جدول، صفحه‌بندی و drawer فیلتر بدون prop از آن می‌خوانند             |

```tsx
<DataTableProvider
  table={table}
  columns={columns}
  filters={filters}
  searchPlaceholder={t("searchPlaceholder")}
>
  <DataTableToolbar />
  <DataTable />
  <DataTablePagination />
</DataTableProvider>
```

- فیلتر جدید یعنی یک خط `filterParams.<type>(…)` در `search-params` به‌علاوه‌ی یک آیتم در آرایه‌ی
  `filters` با همان id و همان `type` (به‌علاوه‌ی فیلدش در params schema و پارامتر بک‌اند در `*.backend.ts`).
- id ستون‌ها همان فیلد مرتب‌سازی API است.

### ۵.۴.۱ هوک‌های عمومی (`@repo/hooks`)

در پکیج `@repo/hooks`: `use-debounced-value`، `use-debounced-callback`، `use-debounced-input`، `use-local-storage` (با
اعتبارسنجی zod و همگام بین تب‌ها)، `use-media-query`، `use-is-client`، `use-disclosure`،
`use-copy-to-clipboard`، `use-interval`، `use-event-listener`، `use-latest`، `use-previous`،
`use-isomorphic-layout-effect`. در خود اپ (`src/hooks`) فقط `use-app-router` (روتر زبان‌دار + top
loader) مانده و در `packages/ui`: `use-mobile`. هوک جدول در `@repo/table/use-table-state` است.

### ۵.۵ کشینگ

| لایه            | چه چیزی                                                                                     | ابطال                                                    |
| --------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Next.js         | `'use cache'` + `cacheLife('minutes')` + `cacheTag` برای آمار داشبورد                       | `updateTag` در Server Action (دکمه‌ی «به‌روزرسانی آمار») |
| پوسته‌ی استاتیک | Partial Prerendering همه‌ی صفحات                                                            | بیلد دوباره                                              |
| React Query     | کش کلاینت با کلیدهای سلسله‌مراتبی                                                           | `invalidates` / `relatedKeys`                            |
| Redis           | `remember(getRedis(), …)` از `@repo/redis` (cache-aside با zod)، شمارنده‌های `rateLimit`    | TTL                                                      |
| HTTP / SW       | فایل‌های `/_next/static` immutable، آیکن‌ها ۷ روز، `sw.js` بدون کش، پاسخ‌های BFF `no-store` | هش فایل‌ها                                               |
| Turborepo       | خروجی تسک‌ها بر اساس هش ورودی و env                                                         | خودکار                                                   |

### ۵.۶ PWA و SEO

- PWA: `app/manifest.ts`، آیکن‌های ساخته‌شده از SVG (`bun run icons`)، `public/sw.js` (صفحه‌ی آفلاین
  برای هر زبان و کش فایل‌های استاتیک؛ هرگز API یا auth را کش نمی‌کند)، کارت نصب اپ در تنظیمات
  (اندروید/کروم و راهنمای iOS)، بنر حالت آفلاین.
- SEO: عنوان و توضیح هر صفحه از فایل ترجمه، canonical و hreflang برای هر زبان، Open Graph،
  `robots.txt` و `sitemap.xml`. به‌صورت پیش‌فرض `noindex` است (برای پنل ادمین و محیط‌های preview
  امن‌ترین حالت)؛ برای سایت عمومی `NEXT_PUBLIC_SITE_INDEXABLE=true` بگذارید.

### ۵.۷ ابزارهای کیفیت کد

- Oxlint با پلاگین‌های typescript، react، nextjs، jsx-a11y، import، promise، unicorn و node، به‌علاوه‌ی
  قوانین type-aware مثل `no-floating-promises` و `no-misused-promises`. این قوانین در همین پروژه چند
  باگ واقعی را پیدا کردند که رفع شدند.
- قوانین اختصاصی (`packages/oxlint-plugin`):
  - `no-inline-query-keys`
  - `no-hardcoded-routes`
  - `cn-for-conditional-classes`
  - `no-logic-in-views`
  - `no-server-import-in-client`
  - `require-server-only`
  - `no-process-env`
- Oxfmt: فرمت یکسان، مرتب‌سازی importها و کلاس‌های Tailwind (حتی داخل `cn()`).
- هوک‌ها:
  - pre-commit: lint و format فقط روی فایل‌های stage شده
  - commit-msg: commitlint
  - pre-push: check، و برای main بیلد + e2e

### ۵.۸ ساختار هوش مصنوعی (Claude Code)

- `CLAUDE.md` ⇐ `@AGENTS.md`: یک منبع واحد برای قوانین، تا هر ایجنتی (Claude، Codex، Cursor) همان
  دست‌خط را رعایت کند.
- `.claude/settings.json`:
  - بعد از هر ویرایش Claude، فایل خودکار فرمت و لینت می‌شود و خطاهای لینت به خود Claude برمی‌گردد
    تا همان لحظه درستشان کند.
  - دستورهای بررسی (check، lint، test و…) بدون سؤال اجازه دارند.
  - خواندن فایل‌های `.env` واقعی، force push و `--no-verify` ممنوع است.
- `.claude/rules/*.md`: قوانین مسیرمحور (views، hooks، data-fetching، server، i18n، env، testing) که
  فقط هنگام کار روی فایل‌های مربوط بارگذاری می‌شوند.
- Skillها (دستورالعمل گام‌به‌گام برای کارهای تکراری):
  - `add-feature`، `add-page`، `add-query`، `add-mutation`
  - `add-env-var`، `add-translation`، `add-ui-component`
  - `write-e2e-test`، `commit`
- ساب‌ایجنت‌ها:
  - `code-reviewer`: بررسی diff بر اساس قوانین
  - `architecture-guard`: بررسی لایه‌بندی، مرز سرور/کلاینت و امنیت BFF
  - `test-writer`: نوشتن و اجرای تست

---

## ۶. آنچه اجرا و تأیید شد

- `bun run check`: lint با صفر خطا و صفر هشدار، فرمت، typecheck همه‌ی پکیج‌ها، تست‌های واحد، و
  ۳۷ تست قوانین لینت. همه سبز.
- `next build`: موفق، بدون خطای prerender.
- تست‌های e2e: ۱۵ از ۱۵ سبز:
  - ریدایرکت ورود، اعتبارسنجی فرم، خطای رمز اشتباه، ورود و خروج، و httpOnly بودن کوکی
  - جستجو، فیلتر، مرتب‌سازی، صفحه‌بندی و لینک اشتراکی جدول
  - RTL و تغییر زبان، و دارک مود
  - robots، hreflang، manifest و هدرهای service worker
- تست دستی سرور production: ورود، refresh، پروکسی، رندر سمت سرور صفحه‌ی کاربران (مرتب‌شده از روی
  URL)، و داشبورد فارسی با اعداد فارسی.
- Docker:
  - مراحل Dockerfile (prune ⇐ نصب frozen ⇐ بیلد ⇐ runner) بیرون از Docker تکرار شدند و موفق بودند.
  - سرور standalone (۷۱ مگابایت) بالا آمد و ورود و صفحه‌ها کار کردند.
  - با env ناقص، بلافاصله با خطای واضح متوقف شد.
- هوک‌های git و هوک Claude هم واقعاً اجرا و تست شدند (کامیت‌ها و pushهای همین پروژه از آن‌ها
  عبور کرده‌اند).

---

## ۷. هشدارها و نکاتی که باید بدانید

1. **TypeScript 7 (native):** خیلی سریع‌تر است و Next 16.3 از آن پشتیبانی می‌کند، ولی API جاوااسکریپتی
   TypeScript را ندارد. در نتیجه پلاگین ادیتور Next کار نمی‌کند. در VS Code افزونه‌ی TypeScript
   Native Preview را نصب کنید.
2. **Oxlint:** پلاگین‌های JS آن هنوز آلفا هستند (تابع semver نیستند) و لینت type-aware به
   `oxlint-tsgolint` وابسته است. Oxfmt هم هنوز نسخه‌ی 0.x است. نسخه‌ها pin شده‌اند، پس قبل از ارتقا
   تست بگیرید.
3. **«آخرین نسخه»** ثابت نمی‌ماند: نسخه‌ها در زمان ساخت آخرین بودند و دقیق pin شدند تا بیلدها
   تکرارپذیر بمانند. ارتقا را آگاهانه انجام دهید (بخش ۴).
4. **API ساختگی:** پیش‌فرض‌های `.env.example` و docker-compose با MSW کار می‌کنند تا پروژه بدون
   بک‌اند اجرا شود. برای production مقدار `API_MOCKING=disabled` و `API_BASE_URL` واقعی را بگذارید.
   قرارداد API شبیه DummyJSON است و فقط فایل‌های `*.backend.ts` آن را می‌شناسند (بخش ۱۶).
5. **فونت فارسی:** Roboto (طبق خواسته) حروف فارسی ندارد. برای همین متن فارسی با Vazirmatn نمایش
   داده می‌شود تا به فونت تصادفی سیستم نیفتد.
6. **«منطق در کامپوننت ممنوع»** برای ویوهای اپ اجباری است. کامپوننت‌های پایه‌ی shadcn در `packages/ui`
   کد vendor هستند و state داخلی UI خودشان را دارند (استثنا).
7. **Bun:** برای نصب، اسکریپت‌ها و تست واحد از Bun استفاده شد چون سریع‌تر است. اما سرور production
   نکست روی Node اجرا می‌شود، چون این حالت رسمی و پایدار Next.js است.
8. **PWA:** به‌جای Serwist/next-pwa یک service worker ساده نوشته شد، چون روت‌هندلر Serwist با Cache
   Components ناسازگار است. فقط صفحه‌ی آفلاین و فایل‌های استاتیک کش می‌شوند.
9. **CSP:** به‌خاطر حفظ رندر استاتیک، از nonce استفاده نشده و `unsafe-inline` برای اسکریپت‌ها مجاز
   است. nonce همه‌ی صفحات را داینامیک می‌کند. بقیه‌ی محدودیت‌ها (منبع‌های خارجی، frame، object)
   فعال‌اند.
10. **گارد `proxy.ts`** فقط وجود کوکی را چک می‌کند (خوش‌بینانه و سریع). مجوز واقعی همیشه با API اصلی
    است.
11. **کش `'use cache'`** به‌صورت پیش‌فرض در حافظه‌ی هر instance است. اگر چند instance اجرا کردید،
    `cacheHandlers` (مثلاً روی Redis) را تنظیم کنید. این بخش برای ساده ماندن کد عمداً اضافه نشد.
12. **Redis fail-open است:** اگر Redis قطع باشد، rate limit و کش غیرفعال می‌شوند (و لاگ می‌شوند)، ولی
    ورود از کار نمی‌افتد.
13. **Docker در این محیط:** بیلد واقعی ایمیج داخل این sandbox کامل نشد. دو دلیل داشت: Docker Hub
    محدودیت نرخ (429) داد، و کانتینرها به گواهی TLS پروکسی این محیط اعتماد نداشتند. برای همین همه‌ی
    مراحل Dockerfile بیرون از Docker تکرار و تست شدند. روی سیستم خودتان یک‌بار
    `docker compose up --build` را اجرا کنید.
14. **`experimental.useOffline`** یک قابلیت آزمایشی Next.js است (بنر آفلاین). اگر فقط API پایدار
    می‌خواهید، فلگ و بنر را حذف کنید.
15. **دسترسی به سایت‌های مستندات** (nextjs.org، oxc.rs، ui.shadcn.com) از این محیط مسدود بود. برای
    همین APIها از سورس و تایپ پکیج‌های نصب‌شده، داک‌های همراه Next و Turbo داخل `node_modules`،
    و مخزن‌های رسمی در GitHub تأیید شدند، نه از حافظه.
16. **بلوک خودکار AGENTS.md:** Turbo در `AGENTS.md` یک بلوک راهنمای ایجنت (`turborepo-agent-rules`)
    اضافه می‌کند. آن را نگه دارید؛ اگر حذف شود دوباره اضافه می‌شود.
17. **React Compiler و react-hook-form:** هوک فرم ورود با `"use no memo"` از کامپایلر مستثنا شده است،
    چون RHF state قابل‌تغییر دارد.

---

## ۸. توسعه‌ی پروژه از اینجا

- **فیچر جدید:** از Claude بخواهید با skill `add-feature` بسازد، یا دستی از `features/users` الگو بگیرید.
- **صفحه‌ی جدید:** `ROUTES` ⇐ `page.tsx` نازک ⇐ `navigation.ts` ⇐ `breadcrumbs.ts` ⇐ ترجمه‌ها (skill `add-page`).
- **endpoint جدید:**
  1. اسکیمای zod
  2. `API_ENDPOINTS`
  3. `QUERY_KEYS`
  4. service
  5. `makeQuery`
  6. هندلر MSW

  (skill `add-query`)

- **متغیر env جدید:** `src/env.ts` ⇐ `.env.example` ⇐ `turbo.json` ⇐ docker-compose (skill
  `add-env-var`).
- **قبل از کامیت:** `bun run check`. پیام کامیت به شکل `feat(admin): ...` باشد.
- **بک‌اند واقعی:** `API_MOCKING=disabled` و `API_BASE_URL` را تنظیم کنید و اسکیماهای پاسخ را با
  API واقعی تطبیق دهید. خطاهای `INVALID_RESPONSE` دقیقاً نشان می‌دهند کجا قرارداد فرق دارد.

---

## ۹. اصلاحات بعد از بازبینی شما

| خواسته                                   | قبل                                                                | بعد                                                                                                                                                                   |
| ---------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| لیبل از ثابت + parse داخل upstream       | `upstream.get` + `parseResponse(schema, data, "dashboard.stats")`  | `upstreamGet(API_ENDPOINTS.stats, dashboardStatsSchema)`؛ لیبل از ثابت endpoint ساخته می‌شود. `name` از `makeQuery`/`makeMutation` حذف شد و لیبل از کلید ساخته می‌شود |
| فیلتر جدول قابل استفاده در همه‌ی صفحه‌ها | `UsersToolbar` اختصاصی + هوک اختصاصی                               | ابتدا یک لایه‌ی عمومی پیچیده بود؛ در بازبینی بعدی ساده شد (بخش ۱۰)                                                                                                    |
| hydration بدون کد اضافه                  | فایل `users.prefetch.ts` با fetcher دوم سمت سرور، توکن و dehydrate | `<PrefetchBoundary queries={[xQuery.with(params)]}>`؛ همان fetcher با `http` تزریقی                                                                                   |

دو مورد مرتبط هم در همین بازبینی پیدا و درست شد:

- **امنیت:** پروکسی عمومی، `auth/login` و `auth/refresh` را هم منتقل می‌کرد. یعنی کاربر لاگین‌شده
  می‌توانست توکن خام را در بدنه‌ی JSON بگیرد. حالا این مسیرها مسدودند (با تست دستی تأیید شد، حتی
  با حروف بزرگ و اسلش انتهایی).
- **یکپارچگی:** کوئری کاربر جاری حالا هم از پروکسی (`/auth/me`) می‌آید، پس با همان الگو قابل prefetch
  است. روت جداگانه‌ی `/api/auth/session` حذف شد.

> `upstreamGet` این بخش بعداً با کلاس `HttpClient` جایگزین شد: `upstream.get(url, { schema })` (بخش ۱۳).

---

## ۱۰. ساده‌سازی جدول‌ها (بازبینی دوم)

> این نسخه بعداً در بازبینی سوم (بخش ۱۱) با پیاده‌سازی دستی و بدون کتابخانه جایگزین شد.

نسخه‌ی قبلی (`defineDataTable` ⇐ `useDataTableState` ⇐ `useQueryTable` ⇐ `DataTableView`) لایه‌های
تودرتو داشت: لیبل‌ها، وضعیت URL و مدل جدول در یک زنجیره قاطی شده بودند. حق با شما بود. بعد از
بررسی الگوهای مرجع (راهنمای data-table شادسی‌ان و پروژه‌ی tablecn که همین ترکیب shadcn + TanStack
Table v9 + nuqs را دارد) دوباره نوشته شد:

- حذف شد: `defineDataTable`، `useDataTableState`، `useQueryTable`، `DataTableView` و فایل
  تایپ‌های مدل.
- `useDataTable` حالا هوکی کنترل‌شده است (`state` + `onStateChange`) که چیزی از URL، کوئری یا ترجمه
  نمی‌داند.
- کامپوننت‌ها فقط `table` می‌گیرند و فیلترها روی `meta` ستون‌ها تعریف می‌شوند.
- تایپ meta ستون‌ها با `metaHelper` رسمی TanStack v9 تعریف شد.

یک باگ واقعی هم پیدا و رفع شد: در خروج از حساب، پاک کردن کش باعث درخواست دوباره‌ی `/auth/me` و
خطای 401 می‌شد. همین گاهی ریدایرکت «سشن منقضی شد» را جلو می‌انداخت. حالا خروج با بارگذاری کامل
صفحه انجام می‌شود، که هر داده‌ای از کاربر قبلی را هم از حافظه پاک می‌کند. تست‌های e2e هر کدام سه
بار اجرا شدند (۴۵ از ۴۵ سبز).

---

## ۱۱. حذف TanStack Table (بازبینی سوم)

طبق خواسته‌ی شما کتابخانه‌ی `@tanstack/react-table` کامل حذف شد و منطق جدول دستی نوشته شد. برای
جدول‌های سمت سرور این کتابخانه فقط یک لایه‌ی اضافه بود.

| حالا                                                                    | فایل                                   |
| ----------------------------------------------------------------------- | -------------------------------------- |
| وضعیت URL + اکشن‌ها                                                     | `lib/table/use-table-state.ts`         |
| تایپ‌های ساده (`TableController`، `DataTableColumn`، `DataTableFilter`) | `lib/table/types.ts`                   |
| جدول با `<table>` ساده و هدرهای قابل مرتب‌سازی                          | `components/data-table/data-table.tsx` |
| تولبار، فیلتر select و صفحه‌بندی                                        | `components/data-table/*`              |

بده‌بستان: اگر بعداً قابلیت‌های سمت کلاینت مثل جابه‌جایی یا تغییر عرض ستون یا virtualization لازم
شد، باید خودمان بسازیم یا آن موقع کتابخانه را برگردانیم.

تست‌های e2e هر کدام سه بار اجرا شدند (۴۵ از ۴۵ سبز).

---

## ۱۲. یک فایل برای env

طبق خواسته‌ی شما `src/env/server.ts` و `src/env/client.ts` در یک فایل ادغام شدند: `src/env.ts`. این
همان الگوی مستند `@t3-oss/env-nextjs` است: یک `createEnv` با آبجکت `server` (سکرت‌ها و تنظیمات سرور)،
آبجکت `client` (`NEXT_PUBLIC_*`) و `shared` (`NODE_ENV`). همه‌جا فقط `import { env } from "@/env"`
نوشته می‌شود.

- **امنیت:** Next.js فقط `NEXT_PUBLIC_*` را داخل باندل می‌گذارد. اگر کد مرورگر متغیر سرور را بخواند،
  t3-env خطا می‌دهد. برای همین مسیر `@/env/server` از قانون lint مرز سرور/کلاینت حذف شد.
- `isSecureCookie` به `src/server/auth/cookies.ts` منتقل شد. فایل env نباید در سطح ماژول متغیر سرور
  بخواند، وگرنه import آن در مرورگر خطا می‌دهد.
- **بده‌بستان:** در بیلد Docker (`SKIP_ENV_VALIDATION=1`) حالا چک `NEXT_PUBLIC_*` هم رد می‌شود و به
  شروع کانتینر منتقل می‌شود (مقدار این متغیرها در Dockerfile پیش‌فرض دارد). `bun run build` معمولی
  همچنان همه را چک می‌کند.

یک باگ قدیمی هم پیدا و رفع شد. اگر موقع شروع سرور متغیری کم بود، Next.js خطا را فقط لاگ می‌کرد؛
سرور روشن می‌ماند و به همه‌ی درخواست‌ها 500 می‌داد، در حالی که مستندات می‌گفت کانتینر متوقف می‌شود.
حالا `instrumentation.ts` در این حالت با کد 1 خارج می‌شود (تست شد: بدون `REDIS_URL` خطای zod چاپ
می‌شود و پروسه با کد 1 بسته می‌شود). تست‌های e2e هر کدام دو بار اجرا شدند (۳۰ از ۳۰ سبز).

---

## ۱۳. کلاس `HttpClient`: همه‌ی درخواست‌ها از یک نمونه‌ی خودمان رد می‌شوند

طبق خواسته‌ی شما، axios حالا داخل یک کلاس است (`src/lib/http/http-client.ts`). هر درخواست، پاسخ و
خطا از یک نمونه‌ی همین کلاس رد می‌شود و بعد از برگشتن درخواست فقط ساختار خود برنامه بیرون می‌آید:

- **موفق:** خود `data`. اگر درخواست `schema` داشته باشد، همان‌جا با zod parse می‌شود و تایپش از
  اسکیما می‌آید.
- **ناموفق:** همیشه `ApiError` (شبکه، timeout، 4xx/5xx، پاسخ نامعتبر). هیچ‌وقت `AxiosError` یا
  `AxiosResponse` بیرون نمی‌آید.

```ts
// سرور: اسکیما به خود upstream پاس داده می‌شود، یک خط
return upstream.get(API_ENDPOINTS.stats, { schema: dashboardStatsResponse });

// fetcher (مرورگر و سرور): یک خط، makeQuery پاسخ را با `response` خودش چک می‌کند
export const fetchUsersList: QueryFetcher<UsersListParams> = (params, { http, signal }) =>
  http.get(API_ENDPOINTS.users.list, { params: toBackendListQuery(params), signal });
```

| نمونه                        | کجا                       | مقصد                                      |
| ---------------------------- | ------------------------- | ----------------------------------------- |
| `apiClient` / `bffClient`    | `lib/http/client.ts`      | مرورگر → BFF (401 ⇐ رویداد «سشن تمام شد») |
| `upstream` / `upstreamFor()` | `server/http/upstream.ts` | سرور → API اصلی                           |

- `upstreamGet` / `upstreamPost` (بخش ۹) حذف شدند. حالا `upstream.get/post/put/patch/delete` اسکیما
  را در `options` می‌گیرند و پاسخ داخل خود کلاس parse می‌شود، نه با یک خط جدا بعد از درخواست.
- پروکسی BFF با `upstream.request(method, url, …)` وضعیت و دیتا را با هم می‌گیرد و منتقل می‌کند.
- `makeQuery` و `makeMutation` مثل قبل ورودی و خروجی را با zod چک می‌کنند (خواسته‌ی قبلی شما). برای
  همین fetcherها اسکیما را دوباره به `http` نمی‌دهند تا اسکیما دو جا نوشته نشود.
- تایپ‌ها با overload: بدون `schema` نتیجه `unknown` است و با `schema` همان خروجی اسکیما. پس هیچ
  دیتایی بدون parse شدن، «معتبر» تایپ نمی‌شود و داخل کلاس هیچ cast‌ی نیست.
- قانون lint: `new HttpClient(...)` فقط در `lib/http` و `server/http` مجاز است (import تایپ آزاد است).
  پس کسی نمی‌تواند کلاینتی بسازد که مستقیم و بدون BFF به API اصلی برود.
- تست واحد جدید (`http-client.test.ts`) کلاس را با یک سرور HTTP واقعی محلی امتحان می‌کند: parse با
  اسکیما، دیتای خام، status، `INVALID_RESPONSE`، تبدیل خطای HTTP به `ApiError`، رسیدن خطای 401 به
  `onError`، و timeout و قطعی شبکه.
- تست e2e جدید: اگر وسط کار کوکی‌ها از بین بروند، اولین درخواست بعدی 401 می‌گیرد و کاربر به صفحه‌ی
  ورود (با `callbackUrl`) برمی‌گردد.
- باگ قدیمی پروکسی (پیدا شده در بازبینی کد): اگر API اصلی 204 بدون بدنه برمی‌گرداند (مثلاً برای
  DELETE)، `Response.json` خطا می‌داد و مرورگر 502 می‌گرفت. حالا `bffJson` برای 204/205/304 پاسخ
  بدون بدنه می‌فرستد.

---

## ۱۴. کدهای عمومی به پکیج‌های مونوریپو منتقل شدند

طبق خواسته‌ی شما، هر چیزی که به این پروژه وابسته نیست و هر اپ دیگری هم می‌تواند استفاده کند، از
`apps/admin` به پکیج‌های Turborepo رفت. پکیج‌ها از نوع Just-in-Time هستند (طبق مستندات نصب‌شده‌ی
Turborepo): `exports` مستقیم به سورس TypeScript اشاره می‌کند و Next.js با `transpilePackages`
کامپایلشان می‌کند. پس مرحله‌ی build جدا ندارند.

| پکیج          | محتوا                                                                                     |
| ------------- | ----------------------------------------------------------------------------------------- |
| `@repo/http`  | `HttpClient`، `ApiError` و `toApiError`، `parseResponse` (+ تست با سرور HTTP واقعی)       |
| `@repo/query` | `createMakeQuery`، `makeMutation`، invalidation زنجیره‌ای، `QueryClient`، `useInvalidate` |
| `@repo/table` | قرارداد URL جدول (`tableSearchParams`)، `useTableState`، تایپ‌ها                          |
| `@repo/hooks` | ۱۲ هوک عمومی (debounce، interval، local storage، media query…)                            |
| `@repo/redis` | `createRedisClient`، `remember`، `rateLimit` (فقط سرور)                                   |

**قانون پکیج‌ها:** هیچ پکیجی از `apps/*` import نمی‌کند و env، روت‌ها و ترجمه‌ها را نمی‌خواند. اپ
آن‌ها را به خودش وصل می‌کند:

- `apiClient`/`bffClient` (در `src/lib/http`) و `upstream` (در `src/server/http`) نمونه‌های
  `HttpClient` اپ هستند.
- `makeQuery = createMakeQuery(apiClient)` در `src/lib/query`؛ import فیچرها از `@/lib/query`
  عوض نشد.
- `getRedis()` در `src/server/redis` با env اپ؛ helperها کلاینت را صریح می‌گیرند:
  `rateLimit(getRedis(), key, opts)`.

**چه چیزی عمداً در اپ ماند:** env، config، i18n، SEO، فیچرها، BFF و احراز هویت، `PrefetchBoundary`
(کوکی همین اپ را می‌خواند)، `use-app-router` (روتر i18n + top loader)، toast خطاها، و کامپوننت‌های
data-table و feedback. این کامپوننت‌ها ترجمه‌های همین اپ را نشان می‌دهند. منطقشان (`useTableState`)
در `@repo/table` است. اگر اپ دوم هم همین UI را خواست، می‌شود با گرفتن متن‌ها از props منتقلشان کرد.

**بررسی‌ها:**

- `bun run check` در همه‌ی ۸ workspace سبز بود (typecheck، lint، و تست‌های http، query، admin و
  قوانین lint).
- بیلد production موفق بود و e2e ۱۶ از ۱۶ سبز شد.
- `turbo prune admin --docker` همه‌ی پکیج‌های جدید را برداشت و `bun install --frozen-lockfile` روی
  خروجی‌اش موفق بود (همان مسیر Dockerfile).
- لینت هم پوشش داده شد: `new HttpClient` فقط در `lib/http`/`server/http`، import پکیج
  `@repo/redis` از فایل `"use client"` خطاست، و فایل‌های redis باید `server-only` داشته باشند.
- scopeهای کامیت `http`، `query`، `table`، `hooks` و `redis` اضافه شدند.

---

## ۱۵. تقسیم کار بین مدل‌ها برای صرفه‌جویی در توکن

- **`CLAUDE.md` (بخش Model routing):** جلسه‌ی اصلی روی Opus است و تصمیم می‌گیرد. خواندن کد با
  ساب‌ایجنت `explorer` (Haiku) است، کدنویسی طبق پلن Opus با `implementer` (Sonnet)، و ریویوی آخر با
  `code-reviewer` (Opus). تسک‌های کوچک (یکی دو فایل مشخص) مستقیم انجام می‌شوند، چون هر ساب‌ایجنت از صفر
  شروع می‌کند و برای کار کوچک گران‌تر تمام می‌شود.
- **`AGENTS.md` §0:** «بپرس، نگرد» (اگر محدوده‌ی کار مشخص نیست، اول سؤال کوتاه بپرس) و «تغییر سنگین را
  اول بگو» (تغییر فلو، API پکیج، ساختار پوشه‌ها، وابستگی‌ها یا فایل‌های زیاد).
- **مدل ساب‌ایجنت‌ها در frontmatter ثابت شد:** `explorer` = haiku، `implementer` و `test-writer` = sonnet،
  `code-reviewer` و `architecture-guard` = opus. مدل جلسه‌ی اصلی را خودتان با `/model opus` انتخاب کنید.

---

## ۱۶. مستقل شدن فرانت از بک‌اند

هدف: با عوض شدن بک‌اند‌دولوپر یا بک‌اند (همه JWT)، کد ویوها، هوک‌ها، جدول، کوکی‌ها و BFF عوض نشود.

- **مدل خود اپ (domain):** `schemas/*.schema.ts` فقط تایپ‌های خود اپ را دارد (`User`، `UsersList =
{ items, total }`، `DashboardStats`، `SessionUser`، `TokenPair` با `expiresInSeconds`).
- **فقط یک فایل در هر فیچر بک‌اند را می‌شناسد:** `api/<x>.backend.ts`. پارامترهای اپ را به پارامترهای
  بک‌اند تبدیل می‌کند و جواب بک‌اند را با zod چک و به مدل اپ تبدیل می‌کند (`z.ZodType<Domain>` وقتی
  شکل‌ها یکی است، `.transform()` وقتی فرق دارد). برای auth همین فایل بدنه‌ی login/refresh، فیلدهای
  توکن، کاربر `/me` و هدر `Authorization` را دارد.
- **متن خطا:** `@repo/http` خودش `message`، `error`، `detail`، `title` یا `errors[0]` را می‌خواند؛
  کدی در اپ لازم نیست.
- **چک‌لیست بک‌اند جدید:** `API_BASE_URL` ⇐ مسیرها در `config/api-endpoints.ts` ⇐ فایل‌های
  `*.backend.ts` ⇐ mock (یا `API_MOCKING=disabled`). هیچ جای دیگری عوض نمی‌شود.

---

## ۱۷. فونت فارسی در راست‌چین و تنظیم جهت اپ

- **علت مشکل فونت:** `next/font` برای Roboto یک فونت جایگزین با `local(Arial)` می‌سازد که در زنجیره‌ی
  فونت قبل از Vazirmatn می‌آمد. Arial در ویندوز و مک حروف فارسی دارد، پس فارسی با Arial نمایش داده
  می‌شد. گزینه‌ی `adjustFontFallback: false` در Turbopack (Next 16.3.8) نادیده گرفته می‌شود، پس راه
  دیگری لازم بود.
- **راه‌حل:** در `dir="rtl"` کل متن (لاتین هم) با Vazirmatn نمایش داده می‌شود و Vazirmatn اول زنجیره
  است (`--app-font` در `styles/globals.css`، زیرمجموعه‌ی `latin` به Vazirmatn اضافه شد). در چپ‌چین
  Roboto اول است. با Chromium تأیید شد: صفحه‌ی `/fa` با Vazirmatn و `/en` با Roboto رندر می‌شود.
- **تنظیم جهت:** `APP_DIRECTION` در `src/i18n/routing.ts` با سه حالت `"rtl"` (فقط فارسی)، `"ltr"` (فقط
  انگلیسی) و `"both"` (هر دو با دکمه‌ی تغییر زبان). لیست زبان‌ها، زبان پیش‌فرض و نمایش دکمه‌ی تغییر زبان
  از همین ساخته می‌شوند. حالت `"rtl"` تست شد: `/` به `/fa` می‌رود و دکمه‌ی تغییر زبان نشان داده نمی‌شود.

---

## ۱۸. بردکرامپ پنل ادمین

- **محل:** در هدر، بعد از دکمه‌ی باز و بسته کردن سایدبار و جداکننده؛ همان چیدمان بلاک‌های سایدبار shadcn.
  کامپوننت `Breadcrumb` خود shadcn از `@repo/ui` استفاده شده و فلش آن در راست‌چین برعکس می‌شود.
- **تنظیم:** فقط یک فایل، `src/config/breadcrumbs.ts`: هر مسیر ⇐ یک کلید پیام از `Nav`. مسیر
  بردکرامپ از خود URL ساخته می‌شود، پس صفحه‌ی تودرتو فقط یک خط برای خودش لازم دارد. بخش پویا با
  `[param]` نوشته می‌شود، مثل `"/users/[id]": "userDetails"`. هر صفحه باید ورودی خودش را داشته باشد (وگرنه بردکرامپ نشان داده نمی‌شود)؛ مسیرهای میانی بدون ورودی رد می‌شوند.
- **کد:** `breadcrumb-trail.ts` (منطق خالص + تست واحد) ⇐ `useBreadcrumbs` ⇐ `AppBreadcrumbs`.
  در موبایل فقط صفحه‌ی فعلی نمایش داده می‌شود.
- جداکننده‌ی عمودی هدر که قبلاً بالا می‌چسبید، وسط‌چین شد.
- skill `add-page` یک مرحله‌ی «بردکرامپ» گرفت؛ تست e2e جدید رفتن از «کاربران» به «داشبورد» را چک می‌کند.

---

## ۱۹. فونت فارسی (دوباره) و لوگوی سایدبار بسته

- **علت اصلی:** Next فونت‌های `next/font/google` را موقع dev و build از Google Fonts دانلود می‌کند. اگر
  Google در دسترس نباشد (مثلاً ترمینال بدون VPN)، dev فقط پیام «Failed to download Vazirmatn from
  Google Fonts» را چاپ می‌کند و به‌جای فونت، Arial نمایش می‌دهد؛ `next build` هم کلاً شکست می‌خورد.
  همین حالت با بستن دسترسی به Google بازسازی شد و فارسی با Arial رندر شد.
- **راه‌حل:** فونت‌ها داخل ریپو هستند (`apps/admin/src/fonts` با `next/font/local`): Vazirmatn متغیر
  (۱۱۱ KB، همه‌ی وزن‌ها؛ حروف لاتینش همان Roboto است) و Roboto لاتین متغیر (۴۳ KB)، هر دو با لایسنس
  OFL. دیگر هیچ درخواستی به Google زده نمی‌شود؛ با Google بسته، فارسی با Vazirmatn رندر شد.
- **لوگوی سایدبار:** در حالت بسته، دکمه‌ی هدر ۳۲ پیکسل است. مربع لوگو `shrink-0` نداشت و flex آن را تا
  ۱۶ پیکسل فشرده می‌کرد، و تکه‌ای از اسم اپ هم دیده می‌شد. حالا لوگو همیشه ۳۲×۳۲ است و اسم کامل
  پنهان می‌شود (در هر دو جهت تست شد).

---

## ۲۰. جدول: context، drawer فیلتر و فیلتر از روی کانفیگ

- **context:** `DataTableProvider` در `@repo/table` جدول، ستون‌ها، فیلترها و متن جستجو را نگه می‌دارد.
  `DataTableToolbar`، `DataTable` و `DataTablePagination` دیگر هیچ prop نمی‌گیرند.
- **دکمه و drawer:** انتهای تولبار دکمه‌ی «فیلترها» با badge تعداد فیلترهای فعال است و drawer (Sheet
  خود shadcn) از همان سمت باز می‌شود: در انگلیسی راست، در فارسی چپ. پایینش «پاک کردن همه» فقط
  فیلترها را پاک می‌کند و جستجو می‌ماند.
- **فیلتر از روی کانفیگ:** هر صفحه فقط کانفیگ می‌دهد؛ سه نوع `select`، `multiSelect` (چک‌باکس) و
  `text`. هر نوع یک پارسر URL هم‌نام دارد: `role: filterParams.select(USER_ROLES)` ⇐
  `{ type: "select", id: "role", … }`.
- **اعمال فوری:** هر تغییر همان لحظه جدول را به‌روز می‌کند. جستجو و فیلتر متنی ۳۰۰ میلی‌ثانیه بعد از
  توقف تایپ (یا با خروج از فیلد) اعمال می‌شوند (`useDebouncedInput` در `@repo/hooks`). پس هوک جدول دیگر
  debounce ندارد. drawer بعد از بسته شدن mount می‌ماند تا بستن با Escape تایپ نیمه‌کاره را گم نکند.
- **تست:** تست واحد برای منطق فیلترها؛ e2e فیلتر نقش از داخل drawer و پاک شدن جعبه‌ی جستجو با «پاک
  کردن فیلترها». حالت‌های مسابقه‌ای (پاک کردن بلافاصله بعد از تایپ، تایپ آهسته) در مرورگر چک شد.
- **تست ناپایدار:** تست «درخواست بدون session به لاگین برمی‌گردد» قبل از پاک کردن کوکی‌ها حالا منتظر لود
  صفحه می‌ماند.
