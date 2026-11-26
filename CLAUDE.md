# Penny

Open-source personal finance app (working name). Android-first React Native app, a Bun API, and Next.js web/docs apps, in one Turborepo monorepo.

@AGENTS.md

## Layout

| Path                                                   | What                                                 | Stack                                                                                                                               |
| ------------------------------------------------------ | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `apps/mobile`                                          | The app                                              | React Native 0.88 (React Native CLI, no Expo), React Navigation, NativeWind 4 (Tailwind v3), React Native Reusables (shadcn for RN) |
| `apps/api`                                             | Auth + CRUD backend (`/api/auth/*`, `/transactions`) | Bun.serve routes, Drizzle ORM, Postgres (Docker in development), AES-256-GCM field encryption                                       |
| `apps/web`, `apps/docs`                                | Web apps (still the create-turbo starters)           | Next.js 16                                                                                                                          |
| `packages/design-system`                               | Penny's design system: tokens, components, motion    | React Native, NativeWind preset, Moti (Framer Motion's API on Reanimated), react-native-svg                                         |
| `packages/eslint-config`, `packages/typescript-config` | Shared configs for web/docs/api                      | —                                                                                                                                   |

Before working in `apps/mobile`, read `apps/mobile/AGENTS.md` (commands, the checked-in `android/`/`ios/` projects, navigation, env).

## Commands

Package manager is **bun** only. The root `package.json` sets `devEngines`, so any `npm`/`npx` command run inside the repo fails with `EBADDEVENGINES` — use `bun`/`bunx`.

From the root (Turborepo runs each workspace's script):

```bash
bun run db:up         # Postgres in Docker (docker-compose.yml); db:down stops it
bun run dev           # all dev servers (Metro, API on :4000, web :3000, docs :3001)
bun run test          # Vitest (mobile, design-system) + bun test (api)
bun run lint
bun run check-types
bun run build
bun run format        # Prettier, whole repo (format:check to verify)
```

Scope to one workspace with `bunx turbo run <task> --filter=<name>` (`mobile`, `api`, `web`, `docs`, `@repo/design-system`).

Per app:

- **mobile**: `bun add <pkg>` to add deps (then rebuild if it has native code) · `bun run android` to build and run · `bun run lint` (`eslint . --max-warnings 0`)
- **api**: `bun run db:generate` after editing `src/schema.ts` (migrations in `drizzle/` apply on server start) · `bun run db:studio` · scripts run with `--env-file=../../.env`

Run tests, lint and typecheck before calling work done.

## Environment

One `.env` at the repo root (copy `.env.example`, gitignored) holds every app's variables; apps have no env files of their own. **api** scripts run with `bun --env-file=../../.env`; **web** loads it in `next.config.js` via `@next/env`; **mobile** loads it in `babel.config.js` (`process.loadEnvFile`), which inlines the `RN_PUBLIC_*` variables it lists (declare new ones there and in `env.d.ts`), so restart Metro with `--reset-cache` after changing one. The API needs `DATABASE_URL` (defaults to the Docker Postgres) and `DATA_ENCRYPTION_KEY` (no default; losing it makes stored data unreadable). Add new variables to `.env.example`, and to the `build` task's `env` in `turbo.json` if they change a build.

## Formatting, linting, hooks, CI

- **Prettier**: root `.prettierrc` (print width 100) for the repo, plus `apps/mobile/.prettierrc` and `packages/design-system/.prettierrc`, which add Tailwind class sorting. Generated files are listed in `.prettierignore`.
- **ESLint**: every workspace's `lint` fails on any warning.
  - **mobile** and **design-system**: React Native's flat config (`@react-native/eslint-config/flat`, minus its Flow rules) with Prettier.
  - **Everything else**: `@repo/eslint-config`, built on typescript-eslint and not type-aware. The rules require `import type` for type-only imports, and allow unused variables only when prefixed with `_`. ESLint 10 only lints `.ts`/`.tsx` because typescript-eslint's config lists them.
- **Git hooks (Husky)**: `bun install` runs `prepare`, which installs them.
  - **pre-commit**: lint-staged runs `eslint --fix` and Prettier on staged files. Each workspace has its own `.lintstagedrc.json`, run from that folder. Root files only get Prettier (`lint-staged.config.mjs`, which skips symlinks like `.claude/skills/*` because Prettier errors on them).
  - **commit-msg**: commitlint enforces Conventional Commits, e.g. `feat(mobile): add home screen` or `fix(api): reject empty patch`. Types are `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, …
  - **pre-push**: runs `lint`, `check-types` and `test` (cached by Turborepo).
- **CI**: `.github/workflows/ci.yml` runs `format:check`, then `turbo run lint check-types test build` on pushes to `main` and on PRs. Keep its `bun-version` in sync with `devEngines`.

## Conventions

- **Money**: integers in minor units (paise/cents), negative = money out, with an ISO 4217 `currency`. Never floats.
- **Dates**: ISO 8601, stored in UTC.
- **IDs**: UUIDs (`crypto.randomUUID()`).
- **Design system**: everything visual lives in `packages/design-system` (`@repo/design-system`); read its `README.md` before building UI. Tokens are CSS variables in its `global.css` (Metro compiles it via `require.resolve`), the type scale and token classes in `tailwind-preset.js`, hex mirrors for SVG/animation in `src/lib/theme.ts`. Apps import components, `cn()`, `formatMoney()` and `useMotion()` from `@repo/design-system`, never deep paths.
- **Light mode only**: no dark tokens, no `dark:` classes. Android forces light in `MainApplication.kt` (`MODE_NIGHT_NO`), iOS with `UIUserInterfaceStyle` Light in `Info.plist`.
- **Mobile styling**: NativeWind `className` with Penny's token classes (`bg-background`, `text-foreground`, `text-body`, `font-display`, `border-1.5`, …), not raw colours. Merge classes with `cn()` from `@repo/design-system`: it's configured for Penny's custom class names, so plain `tailwind-merge` would drop them. App code imports with the `@/` alias; the package uses relative imports.
- **Animation**: Moti, through the wrappers exported by the design system (`MotiView`, `AnimatedPressable`, …) so `className` works, with transitions from `useMotion()`, which turns animation off when the system setting asks.
- **UI components** live in `packages/design-system/src/components` and are exported from its `src/index.ts`. The Reusables CLI (`add`) fails in this repo because it shells out to npm. Instead, fetch `https://reactnativereusables.com/r/nativewind/<name>.json`, write each file's `content` into that folder, rewrite `@/registry/nativewind/` imports to relative ones, `bun add` its `dependencies` in `apps/mobile`, and list them as `peerDependencies` of the package.
- **Tests**:
  - **mobile**, **design-system**: Vitest, for plain TS logic only (`*.test.ts` next to the code). Anything importing `react-native` can't run under Vitest.
  - **api**: `bun test`. It starts a real server on port 0 against PGlite (Postgres in memory, `src/test-db.ts`), so tests need no Docker.

## Don't "fix" these — they're load-bearing

- `bunfig.toml` uses `linker = "hoisted"`. NativeWind/Metro/Babel can't resolve their deps with bun's isolated installs, and the Gradle/CocoaPods files resolve `react-native` from the root `node_modules` through Node.
- The root dev-dependency `typescript@~6.0.3` exists only to control hoisting. typescript-eslint (used by both ESLint setups) doesn't support TS 7, and resolves the hoisted root copy. web/docs/api keep their own TS 7.0.2 for `tsc`. Raise the root pin only once typescript-eslint supports TS 7.
- Nothing may pull Babel 8 into the root `node_modules`. React Native's and NativeWind's Babel plugins require Babel 7; the shared ESLint config used to bring in Babel 8, which is why it no longer uses the Babel parser.
- **React must be the same version in every workspace** (currently 19.3.0, React Native 0.88's). A second copy builds fine but crashes the app at runtime. When upgrading React Native, bump `react`, `react-dom` and `@types/react*` in web and docs too, and check there is one `react` in `node_modules`.
- `apps/mobile/vitest.config.mts` is `.mts` because the package is CommonJS (its Babel/Metro configs need that).
- `apps/mobile/metro.config.js` resolves a few `expo-*` names to an empty module. `@better-auth/infra`'s native client imports them optionally inside try/catch, and Metro fails the build on any import it can't resolve.
- The fonts in `apps/mobile/assets/fonts` have their internal names rewritten to match their file names, so one `fontFamily` works on Android and iOS. Keep that when replacing them.

## Auth

- **Better Auth** on the API (`apps/api/src/auth.ts`), mounted at `/api/auth/*`: email + password and Google. Every `/transactions` route needs a session and only sees the caller's rows (`userId`).
- Its tables live in `apps/api/src/auth-schema.ts`, generated by `bunx auth@latest generate`. The CLI loads config under Node, so point it at a throwaway config that doesn't import `db.ts` (Bun's `SQL` client). With `generateId: "uuid"` on Postgres, IDs are `uuid` columns the database fills in. Then `bun run db:generate`.
- `BETTER_AUTH_API_KEY` turns on Better Auth Infrastructure (`dash()` + `sentinel()`), which sends auth events to Better Auth's cloud. Tests never set it.
- **Mobile** uses React Navigation (`src/navigation/root-navigator.tsx`, screens in `src/screens`; components and `lib/` stay at the app root). `lib/auth/client.ts` uses a small Better Auth plugin (`lib/auth/native-client.ts`) that keeps the session cookie in the Keychain and sends `Origin: penny://`, which the API trusts; the root navigator registers only the signed-out, setup or signed-in screens. Call the API with `authHeaders()`.
- Google on mobile is native (`@react-native-google-signin/google-signin`): the app gets an ID token for the API's web client ID (`GOOGLE_CLIENT_ID`) and posts it to `signIn.social`. It needs an Android OAuth client in Google Cloud for `com.penny.mobile` with the signing key's SHA-1.

## Product guardrails

- The app is read-only over the user's money: it never moves money or initiates payments.
- Financial data is stored on Penny's server, in Postgres. Amounts, merchants, categories and notes are encrypted by `apps/api/src/vault.ts` before they are written; new tables with financial data do the same. The server holds the key (`DATA_ENCRYPTION_KEY`), so copy says "stored encrypted", never "stays on your phone" or "Penny can't read it".
- Bank OTPs are dropped on-device and never stored or sent anywhere.
- Bank and payment-app messages that Penny is sure about are saved on their own; anything it isn't sure about goes to the Review inbox for the user to answer.
- Entries the user starts through AI (Ask Penny, a shared screenshot, a goal from a sentence) are drafts until the user confirms them.
