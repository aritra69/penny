import { Redirect } from "expo-router";

import { resumeStep } from "@/lib/onboarding/state";
import { useOnboarding } from "@/lib/onboarding/store";

/** "You can stop and come back": reopen setup on the screen the user left. */
export default function ResumeOnboarding() {
  const { state } = useOnboarding();
  return <Redirect href={`/${resumeStep(state)}`} />;
}
