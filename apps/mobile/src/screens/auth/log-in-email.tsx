import { AuthStep } from "@/components/auth/auth-step";
import { checkEmail } from "@/lib/auth-validation";
import { useAppNavigation } from "@/src/navigation/types";

export default function LogInEmailScreen() {
  const navigation = useAppNavigation();
  return (
    <AuthStep
      step={1}
      steps={2}
      title="What's your email?"
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
      onDone={(email) => navigation.push("log-in-password", { email: email.trim() })}
    />
  );
}
