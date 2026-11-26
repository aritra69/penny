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
- Penny's own Android code is plain Kotlin in the app project, not a library: `com.penny.mobile.device` (the `PennyDevice` module, registered in `MainApplication.kt`, reached from JS only through `lib/native/penny-device.ts`) and `com.penny.mobile.capture` (the notification listener, the SMS receiver, the encrypted queue and the headless task that sends it). See "Message capture" below.
- Fonts live in `assets/fonts`; after changing them run `bunx react-native-asset` to copy them into both native projects.

## Navigation

- React Navigation, one native stack: `src/navigation/root-navigator.tsx`. Screens live in `src/screens/`; components and `lib/` stay at the app root.
- Route names and params are typed in `src/navigation/types.ts`. Use `useAppNavigation()` from there, not a bare `useNavigation()`.
- Only the current group's screens (signed out, setup, signed in) are registered; switching groups is done by changing the session or onboarding state, never by navigating.

## Message capture (Android)

1. `CaptureNotificationListener` (notification access) and `SmsCaptureReceiver` (`RECEIVE_SMS`) read only the sources the signed-in user picked in onboarding. `lib/capture/use-capture.ts` sends that list to native code; it's empty when signed out.
2. `Captures.receive` drops one-time codes (`OneTimeCode.kt`, kept identical to `lib/capture/one-time-code.ts` and the API's copy by a Vitest test), then adds the message to `CaptureQueue`, encrypted with an Android Keystore key.
3. It starts `CaptureSyncService`, a headless JS task (`PennyCaptureSync`, registered in `index.js`) that runs `lib/capture/sync.ts` even with the app closed. That posts each message to the API's `POST /captures` and removes it once the API has it. Anything that can't be sent yet (offline, signed out, server trouble) waits for the next message or the next time the app opens.

To try it on a debug build, sign in, allow notification access in onboarding and post a notification from adb (debug builds also read `com.android.shell`, the package adb posts as). It should show up in `GET /transactions`, or in Review:

```bash
adb shell cmd notification post -S bigtext -t "Paid Rs.249" penny-test "Rs.249.00 paid to Blue Tokai Coffee from A/c XX1234 via UPI. Ref 432198765012"
```

## Environment

`babel.config.js` loads the repo root `.env` and inlines the `RN_PUBLIC_*` variables it lists. Add a new one there and to `env.d.ts`.
