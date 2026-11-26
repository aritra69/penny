import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { OnboardingStep } from "@/lib/onboarding/state";

/** Every screen in the app. Onboarding screens are named after their step (`key`, `apps`, …). */
export type RootStackParamList = {
  "sign-in": undefined;
  "sign-up": undefined;
  // Creating an account with email, one field per screen; each step carries what's been typed.
  "sign-up-name": undefined;
  "sign-up-email": { name: string };
  "sign-up-password": { name: string; email: string };
  home: undefined;
  "design-system": undefined;
} & { [Step in OnboardingStep]: undefined };

export type RouteName = keyof RootStackParamList;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

/** The root stack's navigation object, typed with Penny's routes. */
export const useAppNavigation = () =>
  useNavigation<NativeStackNavigationProp<RootStackParamList>>();
