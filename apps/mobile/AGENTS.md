This is a bare React Native (React Native CLI) app: no Expo. It is Android-first; iOS builds but isn't set up for release.

## Commands

Run from `apps/mobile`. Use `bun`/`bunx`: `npm` and `npx` are blocked in this repo.

```bash
bun run start               # Metro (add --reset-cache after changing an RN_PUBLIC_* value)
bun run android             # build, install and open the debug app on a device or emulator
bun run ios                 # same on the iOS simulator (run `bun run pods` first)
bun run adb:reverse         # USB device: reach Metro (8081) and the API (4000) on localhost
bun run lint                # eslint . --max-warnings 0
bun run check-types         # tsc --noEmit
bun run test                # Vitest, plain TS logic only
```

Android builds need JDK 17 (`JAVA_HOME`) and the Android SDK (`ANDROID_HOME`).

## Native code

- `android/` and `ios/` are checked in and edited by hand. They started from the React Native 0.88.1 template (`com.penny.mobile`).
- Packages are hoisted to the repo root (`bunfig.toml`), so `android/settings.gradle`, `android/app/build.gradle` and `ios/Podfile` resolve `react-native` and its tools through Node instead of `../node_modules`. Autolinking runs the CLI with `node` for the same reason, and because `npx` is blocked.
- Add libraries with `bun add <pkg>` (pick the version the library documents for React Native 0.88). Native modules autolink; run `bun run pods` for iOS, and rebuild the app (Metro alone won't pick up native code).
- Fonts live in `assets/fonts`; after changing them run `bunx react-native-asset` to copy them into both native projects.

## Navigation

- React Navigation, one native stack: `src/navigation/root-navigator.tsx`. Screens live in `src/screens/`; components and `lib/` stay at the app root.
- Route names and params are typed in `src/navigation/types.ts`. Use `useAppNavigation()` from there, not a bare `useNavigation()`.
- Only the current group's screens (signed out, setup, signed in) are registered; switching groups is done by changing the session or onboarding state, never by navigating.

## Environment

`babel.config.js` loads the repo root `.env` and inlines the `RN_PUBLIC_*` variables it lists. Add a new one there and to `env.d.ts`.
