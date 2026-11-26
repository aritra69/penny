import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AuthStep } from "@/components/auth/auth-step";
import { checkEmail } from "@/lib/auth-validation";
import type { RootStackParamList } from "@/src/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "sign-up-email">;

export default function SignUpEmailScreen({ navigation, route }: Props) {
  return (
    <AuthStep
      step={2}
      steps={3}
      title="What's your email?"
      line="You'll log in with it."
      field={{
        label: "Email",
        placeholder: "you@example.com",
        autoCapitalize: "none",
        autoCorrect: false,
        autoComplete: "email",
        keyboardType: "email-address",
        textContentType: "emailAddress",
      }}
      action="Next"
      check={checkEmail}
      onDone={(email) =>
        navigation.push("sign-up-password", { name: route.params.name, email: email.trim() })
      }
    />
  );
}
