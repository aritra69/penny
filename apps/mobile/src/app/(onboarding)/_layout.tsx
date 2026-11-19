import { Stack } from "expo-router";

/** Setup opens on `resume`, which sends the user to the screen they left. */
export const unstable_settings = { anchor: "resume" };

export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
