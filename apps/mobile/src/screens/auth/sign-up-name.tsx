import { SignUpStep } from "@/components/auth/sign-up-step";
import { checkName } from "@/lib/auth-validation";
import { useAppNavigation } from "@/src/navigation/types";

export default function SignUpNameScreen() {
  const navigation = useAppNavigation();
  return (
    <SignUpStep
      step={1}
      title="What should we call you?"
      field={{ label: "Name", autoComplete: "name", textContentType: "name" }}
      action="Next"
      check={checkName}
      onDone={(name) => navigation.push("sign-up-email", { name: name.trim() })}
    />
  );
}
