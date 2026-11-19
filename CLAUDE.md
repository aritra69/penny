# Penny

Open-source personal finance app (working name). Android-first Expo app, a Bun API, and Next.js web/docs apps, in one Turborepo monorepo.

@AGENTS.md

## Layout

| Path                                                   | What                                                 | Stack                                                                                              |
| ------------------------------------------------------ | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `apps/mobile`                                          | The app                                              | Expo SDK 58, React Native 0.88, NativeWind 4 (Tailwind v3), React Native Reusables (shadcn for RN) |
| `apps/api`                                             | Auth + CRUD backend (`/api/auth/*`, `/transactions`) | Bun.serve routes, Drizzle ORM, SQLite (`bun:sqlite`)                                               |
| `apps/web`, `apps/docs`                                | Web apps (still the create-turbo starters)           | Next.js 16                                                                                         |
| `packages/design-system`                               | Penny's design system: tokens, components, motion    | React Native, NativeWind preset, Moti (Framer Motion's API on Reanimated), react-native-svg        |
| `packages/ui`                                          | Shared React components for web/docs                 | React                                                                                              |
| `packages/eslint-config`, `packages/typescript-config` | Shared configs for web/docs/ui                       | —                                                                                                  |

Before working in `apps/mobile`, read `apps/mobile/AGENTS.md` (Expo's own rules: use `expo install` for deps, never hand-edit `ios/`/`android/`, check versioned Expo docs instead of memory).

## Commands

Package manager is **bun** only. The root `package.json` sets `devEngines`, so any `npm`/`npx` command run inside the repo fails with `EBADDEVENGINES` — use `bun`/`bunx`.

From the root (Turborepo runs each workspace's script):

```bash
bun run dev           # all dev servers (Expo, API on :4000, web :3000, docs :3001)
bun run test          # Vitest (mobile, design-system) + bun test (api)
bun run lint
bun run check-types
bun run build
bun run format        # Prettier, whole repo (format:check to verify)
```

Scope to one workspace with `bunx turbo run <task> --filter=<name>` (`mobile`, `api`, `web`, `docs`, `@repo/design-system`, `@repo/ui`).

Per app:

- **mobile**: `bunx expo install <pkg>` to add deps · `bun run lint` (runs `eslint . --max-warnings 0`; `expo lint` is broken here) · `bunx expo-doctor`
- **api**: `bun run db:generate` after editing `src/schema.ts` (migrations in `drizzle/` apply on server start) · `bun run db:studio` · copy `.env.example` to `.env` before `bun run dev`

Run tests, lint and typecheck before calling work done.

## Formatting, linting, hooks, CI

- **Prettier**: root `.prettierrc` (print width 100) for the repo, plus `apps/mobile/.prettierrc` and `packages/design-system/.prettierrc`, which add Tailwind class sorting. Generated files are listed in `.prettierignore`.
- **ESLint**: every workspace's `lint` fails on any warning.
  - **mobile** and **design-system**: Expo's config (`eslint-config-expo`) with Prettier.
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
- **Mobile styling**: NativeWind `className` with Penny's token classes (`bg-background`, `text-foreground`, `text-body`, `font-display`, `border-1.5`, …), not raw colours. Merge classes with `cn()` from `@repo/design-system`: it's configured for Penny's custom class names, so plain `tailwind-merge` would drop them. App code imports with the `@/` alias; the package uses relative imports.
- **Animation**: Moti, through the wrappers exported by the design system (`MotiView`, `AnimatedPressable`, …) so `className` works, with transitions from `useMotion()`, which turns animation off when the system setting asks.
- **UI components** live in `packages/design-system/src/components` and are exported from its `src/index.ts`. The Reusables CLI (`add`) fails in this repo because it shells out to npm. Instead, fetch `https://reactnativereusables.com/r/nativewind/<name>.json`, write each file's `content` into that folder, rewrite `@/registry/nativewind/` imports to relative ones, `bunx expo install` its `dependencies` in `apps/mobile`, and list them as `peerDependencies` of the package.
- **Tests**:
  - **mobile**, **design-system**: Vitest, for plain TS logic only (`*.test.ts` next to the code). Anything importing `react-native` can't run under Vitest.
  - **api**: `bun test` (Vitest can't load `bun:sqlite`). It starts a real server on port 0 against an in-memory DB.

## Don't "fix" these — they're load-bearing

- `bunfig.toml` uses `linker = "hoisted"`. NativeWind/Metro/Babel can't resolve their deps with bun's isolated installs.
- The root dev-dependency `typescript@~6.0.3` exists only to control hoisting. typescript-eslint (used by both ESLint setups) doesn't support TS 7, and resolves the hoisted root copy. web/docs/api/ui keep their own TS 7.0.2 for `tsc`. Raise the root pin only once typescript-eslint supports TS 7.
- Nothing may pull Babel 8 into the root `node_modules`. Expo's Babel plugins require Babel 7; the shared ESLint config used to bring in Babel 8, which is why it no longer uses the Babel parser.
- **React must be the same version in every workspace** (currently 19.3.0, Expo SDK 58's). A second copy builds fine but crashes the app at runtime. When upgrading Expo, bump `react`, `react-dom` and `@types/react*` in web, docs and ui too, then check `bunx expo-doctor` (from `apps/mobile`) for duplicates.
- `apps/mobile/vitest.config.mts` is `.mts` because the package is CommonJS (its Babel/Metro configs need that).

## Auth

- **Better Auth** on the API (`apps/api/src/auth.ts`), mounted at `/api/auth/*`: email + password and Google. Every `/transactions` route needs a session and only sees the caller's rows (`userId`).
- Its tables live in `apps/api/src/auth-schema.ts`, generated by `bunx auth@latest generate`. The CLI loads config under Node, so point it at a throwaway config that doesn't import `db.ts` (`bun:sqlite`). Then `bun run db:generate`.
- `BETTER_AUTH_API_KEY` turns on Better Auth Infrastructure (`dash()` + `sentinel()`), which sends auth events to Better Auth's cloud. Tests never set it.
- **Mobile** uses Expo Router (routes in `apps/mobile/src/app`; components and `lib/` stay at the root). `lib/auth-client.ts` keeps the session in SecureStore; the root layout swaps between the `(auth)` and `(app)` groups with `Stack.Protected`. Call the API with `authHeaders()`.
- Google in development: Google only accepts `localhost` or HTTPS redirect URIs, so use `adb reverse tcp:4000 tcp:4000` and `EXPO_PUBLIC_API_URL=http://localhost:4000`.

## Product guardrails

- The app is read-only over the user's money: it never moves money or initiates payments.
- Financial data stays on the device. Bank OTPs are dropped on-device and never stored or sent anywhere.
- AI features may draft entries, but the user always confirms before anything is saved.
