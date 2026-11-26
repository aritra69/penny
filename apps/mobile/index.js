// Must run first: gives Hermes `crypto.getRandomValues`, which UUIDs and Better Auth need.
import "react-native-get-random-values";
// Before anything else loads React Native components (see the file).
import "./lib/library-warnings";
import "@repo/design-system/global.css";

import { AppRegistry } from "react-native";

import { name as appName } from "./app.json";
import { CAPTURE_SYNC_TASK, captureSyncTask } from "./lib/capture/sync";
import App from "./src/app";

AppRegistry.registerComponent(appName, () => App);
// Sends captured bank and payment alerts to the API, even with the app closed (Android).
AppRegistry.registerHeadlessTask(CAPTURE_SYNC_TASK, () => captureSyncTask);
