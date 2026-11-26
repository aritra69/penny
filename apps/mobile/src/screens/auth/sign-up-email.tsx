import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { SignUpStep } from "@/components/auth/sign-up-step";
import { checkEmail } from "@/lib/auth-validation";
import type { RootStackParamList } from "@/src/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "sign-up-email">;

export default function SignUpEmailScreen({ navigation, route }: Props) {
  return (
    <SignUpStep
      step={2}
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
