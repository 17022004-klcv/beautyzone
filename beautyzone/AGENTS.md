<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# BeautyZone

Next.js 16.3.4 (App Router) + React 19.2.8, salon management + POS, Spanish UI, Prisma 5.22 + local PostgreSQL, Tailwind v4. Package manager is **pnpm** 11.20.0; never npm/yarn. `README.md` is untouched create-next-app boilerplate — ignore it.

## Verify your change

Order: `pnpm exec tsc --noEmit` → `pnpm build`. Both pass today. There is **no typecheck script, no test runner, no CI, no husky/lint-staged** — nothing enforces anything, so this is the only gate.

**`pnpm lint` is already red on a clean tree**: 60 errors + 12 warnings (36 `@typescript-eslint/no-explicit-any`, 21 react-hooks "cascading renders", 11 `no-unused-vars`, 1 `set-state-in-effect`, 1 `exhaustive-deps`). This baseline is not yours to fix — just don't add to it. Never `eslint --fix` the repo to "clean up".

## Commands

- `pnpm dev` / `build` / `start` / `lint` (bare `eslint`, ESLint 9 flat config `eslint.config.mjs`, `eslint-config-next` core-web-vitals + typescript, no custom rules) / `db:generate` (`prisma generate`).
- Schema change: `pnpm exec prisma migrate dev --name <slug>` then `pnpm db:generate`. **Never `pnpm db:migrate`** — it is hardcoded to `--name init_beautyzone`.
- Seed: `pnpm exec prisma db seed` → `prisma/seed.ts` upserts only the 4 roles (1 Admin, 2 Cliente, 3 Estilista, 4 Recepcionista, **title case**). It shells out to `pnpm dlx ts-node` and **ts-node is not a dependency** — first run needs network.
- Needs a running local Postgres. `.env` holds `DATABASE_URL` + `SESSION_SECRET`; `.env*` is gitignored and there is **no `.env.example`**.
- `pnpm-workspace.yaml` has no `packages:` key — single-package repo; the file only pins pnpm `allowBuilds` for Prisma engines.
- **Git root is one level up** (`C:/xampp/htdocs/beautyzone`); the app is the `beautyzone/` subfolder, so git paths are prefixed `beautyzone/`. Commits are Spanish with conventional prefixes (`feat: admin`, `fix: import en formulario de servicio`).

## The tree is mid-refactor — do not reset it

`prisma/schema.prisma` has +114 **uncommitted** lines (`Bitacora`, `CierreAdministrativo`, `GastoCierre`, `DenominacionCierreAdmin`, `Usuario.passwordAdmin`), and the two migrations that back them — `20260928011938_arqueo_admin_cierre` and `20260928124718_bitacora_auditoria` — are **untracked**; only 4 migrations are committed. The entire bitácora + admin-cierre feature is WIP. Never `git checkout`/`reset`/`clean` here, and don't assume `git status` cleanliness means the DB is in sync.

## Architecture

- Route groups in `src/app/`: `(admin)`, `(auth)`, `(client)`, `(kiosco)`. `(recepcionist)/` and `(stylist)/` are **empty, untracked** dirs — no page behind `/recepcion` or `/estilista`. Groups are path-invisible, so admin screens sit at top level: `/home`, `/users`, `/pos-admin`, `/services-admin`, `/products-admin`, `/schedule-admin`, `/attendance`, `/arqueo`, `/auditoria`, `/profile-admin`. Client site: `/`, `/services`, `/products`, `/schedule`, `/profile`. Auth: `/login`, `/register`, `/forgot-password`. Kiosk: `/kiosco`.
- **`.service.ts` does NOT mean "Prisma".** This is the biggest trap in the repo. `src/app/services/` holds three different kinds of module:
  - **Server/Prisma** (import `db` from `@/src/lib/db`): `agenda`, `auth`, `bitacora`, `cierreAdmin`, `dashboard`, `producto`, `servicio`, `usuario` (`.service.ts`).
  - **Browser `fetch` clients wearing a server name** (no Prisma; only import from a `"use client"` file): `adminPassword`, `arqueo`, `asistencia`, `caja`, `perfil`, `pos` (`.service.ts`).
  - **Explicitly named browser twins** of a server service, exporting the **same identifier**: `bitacora.client.ts` / `cierreAdmin.client.ts`. Import the one you need; `"use client"` components must never reach the `.service.ts` version.
  - `export.service.ts` is a client-only formatter over `window.XLSX`/`window.jspdf` (no DB, no fetch).
  - Style within a file varies too: `static` classes (`UsuarioService`, `ServicioService`, `ProductoService`, `BitacoraService`, `CierreAdminService`…) vs plain exported functions (`auth`, `agenda`, `dashboard`, `adminPassword`) vs object literals (`pos.service.ts` → `POSService`, `cierreAdmin.service.ts` → `CierreAdminService`). Match the file you're editing.
- Data flow is client → `/api/*/route.ts` → service. **There is no server-side data fetching**: 48 of 61 `.tsx` files start with `"use client"`, every route builds as `○ (Static)`, and page state is inlined (e.g. `(admin)/users/page.tsx` is 611 lines of inline `useState`).
- `tsconfig` maps `@/*` to the **project root** (`"./*"`), not `src/`. Import `@/src/lib/db`, `@/src/app/services/...` — `@/lib/db` will not resolve.
- Hooks are colocated, not in a shared dir: `src/app/hooks/useOpcionesAgenda.ts` and `usePOSShortcuts.ts` (imported as `@/src/app/hooks/...`), plus `useUsuarioPage.tsx` next to the users page — which exports `useUsuariosPage` and has **zero importers** (dead code, not the pattern).
- Shared DTOs live in `src/app/types/`. Shared money math: `src/lib/cajaTotales.ts` (`calcularTotales`, `redondear2`, `hoyComoDateISO`, `esHoy`) and `src/lib/cajaDenominaciones.ts`. Shared field/date rules live in `src/lib/validaciones.ts` (`validarTelefono` 0000-0000, `validarDui` 00000000-0, `validarFechaHoraCita` — no backward booking) — each returns `null` when valid or the Spanish error message, so a form and its write route can share one rule. Server actions: `src/app/handlers/*.handler.ts` (`"use server"`).
- Prisma models are Spanish-named on snake_case tables via `@@map`, with raw FK columns (`idrol`, `idcliente`, `idusuario`, `idadmin`). Enum-ish fields are plain `String` + uppercase constants in `//` comments — **no Prisma enums, so typos compile fine**: `cita.estado` PENDIENTE/CONFIRMADA/EN_PROCESO/FINALIZADA/CANCELADA, `metodoPago` EFECTIVO/TARJETA/TRANSFERENCIA, `CajaTurno.estado` ABIERTA/CERRADA, `CierreAdministrativo.estado` PENDIENTE/REALIZADO, `Bitacora.resultado` EXITO/FALLO. `CierreAdministrativo` has `@@unique([fecha])` — one per day.
- Prisma is classic 5.22.0 (`prisma-client-js`), pinned in `pnpm-lock.yaml`. Don't reintroduce Prisma Next / `@prisma/composer`; `.agents/` and friends still hold a stale skill from when it was tried.

## Mandatory conventions

- **Every write route logs to the bitácora.** All 22 route files with POST/PUT/DELETE plus `handlers/auth.handler.ts` call `BitacoraService.registrar({...})` — 30 call sites. A new write route without one is incomplete. `accion` is an **uppercase past-tense** verb: `CREO`, `ACTUALIZO`, `ELIMINO`, `DESACTIVO`, `REGISTRO`, `AGENDO`, `ABRIO_CAJA`, `CERRO_CAJA`, `ARQUEO`, `CORRIGIO_ARQUEO`, `REGISTRO_VENTA`, `GUARDO_CIERRE_ADMIN`, `AGREGO_GASTO`, `ELIMINO_GASTO`, `SUBIO_ARCHIVO`, `FALLO_AUTORIZACION`, `INICIO_SESION`, `CIERRE_SESION`. `entidad` is the model name (`Usuario`, `Rol`, `Cita`, `Venta`, `CajaTurno`, `Arqueo`, `CierreAdmin`, `Gasto`, `Archivo`, `Auth`…). Spread `...contextoDesdeRequest(request, "/api/ruta")` to fill method/ruta/ip/userAgent; pass `usuario:` explicitly when the real actor is the admin who typed a password, not the browser session. `registrar` **never throws** — it swallows errors so a failed audit entry can't kill a sale.
- **A new `accion` verb also needs a label.** Add it to `ETIQUETAS_ACCION` (`src/app/(admin)/auditoria/page.tsx:31`) and its entity to `COLOR_ENTIDAD` in the same file, or the audit screen shows a raw lowercase string / default chip.
- The `bitacora` table is append-only: `/api/bitacora` exports **only `GET`**, and no route edits or deletes entries.
- **Sensitive writes re-validate the admin password server-side.** The client check (`adminPassword.service.ts` → `/api/admin/verificar-password`) is a UI barrier only; `/api/arqueo`, `/api/cierre-admin` and its `gastos/` routes each call `UsuarioService.verificarPasswordAdmin(password)` again. It returns `{ok:false, motivo:"sinConfigurar"|"incorrecta"}` — "sinConfigurar" means no active Admin has `passwordAdmin` set — and accepts **any** active Admin, compared against the plain-text column.
- `Decimal` columns (`precio`, `porcentajeComision`, `monto*`, `total*`, `diferencia`) serialize as **strings** through `NextResponse.json()`. Wrap at the consumer: `Number(p.precio).toFixed(2)` (`export.service.ts`, `api/arqueo/route.ts`, `cierreAdmin.service.ts`).

## Gotchas

- **Nothing is actually authenticated.** `middleware.ts` matches only `/reservas/:path*` and `/admin/:path*` — neither directory exists — and compares a `user_role` cookie nothing ever sets. `(admin)/layout.tsx` is a client component with no guard. The only real session is `src/lib/sesion.ts`: HMAC-SHA256-signed HttpOnly cookie `bz_sesion` (12 h, `sameSite: "lax"`, secret from `SESSION_SECRET` with a public dev fallback), set in `handleLogin` and read only by `bitacora.service.ts` to attribute entries. **Treat every endpoint as unauthenticated.**
- **Role casing is broken three ways.** DB and seed store title case (`"Admin"`, `"Cliente"`); the login switch (`(auth)/login/page.tsx:28-42`) matches `case "Admin"` but uppercase `"ESTILISTA"`/`"RECEPCIONISTA"`/`"CLIENTE"`, so those roles fall to `default` → `/homefdgfx`, a 404. `middleware.ts` and `ClientNavbar.tsx` compare uppercase `"ADMIN"`. Don't build on any of it without fixing casing end to end.
- **Passwords are plain text** — `handleLogin` does `user.password !== password`; no hashing lib installed. `UsuarioService.crearUsuario` defaults blank passwords to `"123456"`. Also `findUserByEmail` passes the correo through unnormalized, so login email matching is case-**sensitive** against the DB (`correoLimpio` is audit-only). Don't add hashing without migrating stored values first.
- **Two library sources.** Most browser libs load from CDN `<Script>`/`<link>` tags in `src/app/layout.tsx`, not npm: jQuery, DataTables, Chart.js, SweetAlert2 (`window.Swal`), flatpickr, jsPDF + autoTable, XLSX, Cleave, simplebar, driver.js, Popper, tippy, Dropzone, animate.css. But **`lucide-react`, `qrcode.react`, and `html5-qrcode` are real npm deps** — import them normally. Reach for the CDN globals through `src/lib/exportUtils.ts` (`exportToExcel`/`exportToPDF`) and `src/lib/pdfTemplate.ts` (`generatePDFWithTemplate`); they no-op if the script hasn't loaded, so they must stay inside `"use client"` files. `pos.service.ts` reads `process.env.NEXT_PUBLIC_API_URL` with a `/api` fallback.
- Tailwind v4 (`@import "tailwindcss"`, no `tailwind.config.js`). Palette is 12 `--sys-color-*` variables in `globals.css`; components also hardcode hex values, so match surrounding code rather than inventing tokens. Fonts: Cormorant Garamond (`--font-cormorant`, `font-serif`) and Plus Jakarta Sans (`--font-jakarta`) via `next/font` — `globals.css` re-declares both names in a plain `:root` block (not `@theme`), overriding the injected values.
- Uploads go to `public/uploads` on disk via `src/app/api/upload/route.ts` (fs, no Cloudinary) even though `next.config.ts` whitelists `res.cloudinary.com`. Filenames get only a `Date.now()` prefix and whitespace→`_`; no size, MIME, or path-traversal validation.
- Dead code, not conventions: `src/lib/sweetalert.ts` (`showAlert`/`showConfirm`, zero importers), `(admin)/users/useUsuarioPage.tsx`. Duplicate logic to avoid copying: `src/app/api/caja/cierre/route.ts:10` redefines `calcularTotales` instead of importing it.
- `.agents/`, `.claude/`, `.cursor/`, `.devin/` are gitignored leftovers from the removed Prisma Next CLI — ignore them. `CLAUDE.md` is just `@AGENTS.md`.
