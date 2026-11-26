import { LogBox } from "react-native";

/**
 * Development-only warnings from libraries, not from Penny's code. Left in, their badge sits over
 * the bottom of every screen and swallows taps on the buttons there. Imported at the top of
 * index.js: two of them fire while the other modules are still loading.
 */
LogBox.ignoreLogs([
  "SafeAreaView has been deprecated", // a dependency still reads React Native's own
  "ImageBackground is deprecated", // same
  "[Sentinel] Default global identify ingestion", // until RN_PUBLIC_BETTER_AUTH_KV_URL is set
  "[Reanimated] Dependencies should only be used on the web", // Moti passes them on native
]);
