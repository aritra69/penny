# Penny

<p align="center">
  <img src="docs/images/hero.jpg" alt="Ink drawing of a person coming home and hanging a bag of groceries by the door" width="640">
</p>

An open-source personal finance app for Android (working name). Penny reads your bank SMS and payment alerts, sorts them into transactions, and shows where your money goes: what's left to spend this month, budgets, bills, goals and net worth. You can also ask it questions in plain words.

**Status:** early. Sign-in, the API and the design system are in place; the main screens are being built.

## Promises

- **Read-only.** Penny never moves money or starts a payment.
- **Your data stays on your phone.** Bank one-time codes are dropped on the device, never stored or sent anywhere.
- **You confirm everything.** AI features can draft a transaction or a goal, but nothing is saved until you press Confirm.

## What's in this repo

A Turborepo monorepo, managed with [Bun](https://bun.sh).

| Path                                                   | What                                                                                     |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `apps/mobile`                                          | The Android app: Expo SDK 58, React Native, Expo Router, NativeWind                      |
| `apps/api`                                             | Auth and data API: Bun, Better Auth (email + Google), Drizzle, SQLite                    |
| `packages/design-system`                               | Penny's look: tokens, components and motion ([README](packages/design-system/README.md)) |
| `apps/web`, `apps/docs`                                | Next.js apps, still the starter templates                                                |
| `packages/eslint-config`, `packages/typescript-config` | Shared lint and TypeScript settings                                                      |

## Getting started

You need Bun 1.4.3 and Node 24 or newer. Use `bun` and `bunx` only: `npm` and `npx` are blocked in this repo.

```bash
bun install
```

Set up the environment. One `.env` at the repo root feeds the API, the web app and the mobile app:

```bash
cp .env.example .env
```

Fill in `BETTER_AUTH_SECRET` (`openssl rand -base64 32`) and, for Google sign-in, the Google OAuth client. The comments in `.env.example` explain every value.

Start everything (Expo, the API on port 4000, and the web apps):

```bash
bun run dev
```

The app uses native modules, so run it in a development build rather than Expo Go. For Google sign-in on an Android device or emulator, forward the API port and point the app at `http://localhost:4000`:

```bash
adb reverse tcp:4000 tcp:4000
```

## Design system

Everything visual lives in `packages/design-system`: ink on paper, black borders instead of shadows, square corners, and one highlighter accent used sparingly. Screens import components from `@repo/design-system`.

In a development build, open **Home → Open the design system gallery** to see every component with example data. The [design system README](packages/design-system/README.md) covers the tokens, components and writing rules.

## Commands

Run from the repo root; Turborepo runs each workspace's script.

```bash
bun run dev           # all dev servers
bun run test          # Vitest (mobile, design system) and bun test (API)
bun run lint
bun run check-types
bun run build
bun run format        # Prettier for the whole repo
```

Scope a task to one workspace with `--filter`, for example:

```bash
bunx turbo run test --filter=@repo/design-system
```

## Contributing

- Commits follow [Conventional Commits](https://www.conventionalcommits.org), for example `feat(mobile): add home screen` or `fix(api): reject empty patch`. A commit hook checks this.
- Git hooks format and lint staged files on commit, and run lint, type checks and tests before a push.
- CI runs the format check, then lint, type checks, tests and builds on every pull request.
- Money is stored as integers in minor units (paise, cents) with an ISO 4217 currency, never as floats. Dates are ISO 8601 in UTC.

More detail on the setup, conventions and the parts not to change is in [CLAUDE.md](CLAUDE.md).

## License

[MIT](LICENSE)
