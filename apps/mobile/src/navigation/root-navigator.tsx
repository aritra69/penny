import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { resumeStep } from "@/lib/onboarding/state";
import { useOnboarding } from "@/lib/onboarding/store";
import type { RootStackParamList, RouteName } from "@/src/navigation/types";
import SignInScreen from "@/src/screens/auth/sign-in";
import SignUpScreen from "@/src/screens/auth/sign-up";
import SignUpEmailScreen from "@/src/screens/auth/sign-up-email";
import SignUpNameScreen from "@/src/screens/auth/sign-up-name";
import SignUpPasswordScreen from "@/src/screens/auth/sign-up-password";
import DesignSystemScreen from "@/src/screens/design-system";
import HomeScreen from "@/src/screens/home";
import AccountsScreen from "@/src/screens/onboarding/accounts";
import AppsScreen from "@/src/screens/onboarding/apps";
import BudgetsScreen from "@/src/screens/onboarding/budgets";
import AllSetScreen from "@/src/screens/onboarding/done";
import GenderScreen from "@/src/screens/onboarding/gender";
import ImportScreen from "@/src/screens/onboarding/import";
import KeyWorksScreen from "@/src/screens/onboarding/key-ok";
import OpenAIKeyScreen from "@/src/screens/onboarding/key";
import PermissionsScreen from "@/src/screens/onboarding/permissions";
import PlanScreen from "@/src/screens/onboarding/plan";
import PrivacyScreen from "@/src/screens/onboarding/privacy";
import SmsAllowedScreen from "@/src/screens/onboarding/sms-ok";
import SetupStepsScreen from "@/src/screens/onboarding/steps";

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Three places to be, and exactly one is open at a time:
 * signed out → Welcome · signed in, setup unfinished → setup, at the step left · otherwise → Home.
 *
 * Only the open group's screens are registered, so nothing can navigate into another group. When
 * the group changes (sign-in, finishing setup, sign-out), React Navigation drops the old screens
 * and opens `initialRouteName`, which is why it follows the session and the saved setup step.
 */
export function RootNavigator({ signedIn }: { signedIn: boolean }) {
  const { state } = useOnboarding();
  const onboarded = state.completed;

  const initialRouteName: RouteName = !signedIn
    ? "sign-in"
    : onboarded
      ? "home"
      : resumeStep(state);

  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
      {!signedIn ? (
        <Stack.Group key="auth">
          <Stack.Screen name="sign-in" component={SignInScreen} />
          <Stack.Screen name="sign-up" component={SignUpScreen} />
          <Stack.Screen name="sign-up-name" component={SignUpNameScreen} />
          <Stack.Screen name="sign-up-email" component={SignUpEmailScreen} />
          <Stack.Screen name="sign-up-password" component={SignUpPasswordScreen} />
        </Stack.Group>
      ) : !onboarded ? (
        <Stack.Group key="onboarding">
          <Stack.Screen name="privacy" component={PrivacyScreen} />
          <Stack.Screen name="gender" component={GenderScreen} />
          <Stack.Screen name="plan" component={PlanScreen} />
          <Stack.Screen name="steps" component={SetupStepsScreen} />
          <Stack.Screen name="key" component={OpenAIKeyScreen} />
          <Stack.Screen name="key-ok" component={KeyWorksScreen} />
          <Stack.Screen name="apps" component={AppsScreen} />
          <Stack.Screen name="permissions" component={PermissionsScreen} />
          <Stack.Screen name="sms-ok" component={SmsAllowedScreen} />
          <Stack.Screen name="accounts" component={AccountsScreen} />
          <Stack.Screen name="import" component={ImportScreen} />
          <Stack.Screen name="budgets" component={BudgetsScreen} />
          <Stack.Screen name="done" component={AllSetScreen} />
        </Stack.Group>
      ) : (
        <Stack.Group key="app">
          <Stack.Screen name="home" component={HomeScreen} />
          {__DEV__ ? <Stack.Screen name="design-system" component={DesignSystemScreen} /> : null}
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
