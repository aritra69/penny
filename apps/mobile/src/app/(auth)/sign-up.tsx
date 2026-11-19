import { Link } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, type TextInputInstance } from "react-native";

import { AuthScreen, FormError, OrDivider } from "@/components/auth/auth-screen";
import { FormField } from "@/components/auth/form-field";
import { GoogleButton } from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { authClient } from "@/lib/auth-client";
import {
  hasErrors,
  MIN_PASSWORD_LENGTH,
  validateSignUp,
  type FieldErrors,
  type SignUpFields,
} from "@/lib/auth-validation";

export default function SignUpScreen() {
  const [fields, setFields] = useState<SignUpFields>({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors<SignUpFields>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);

  const set = (key: keyof SignUpFields) => (value: string) =>
    setFields((f) => ({ ...f, [key]: value }));

  async function submit() {
    const found = validateSignUp(fields);
    setErrors(found);
    setFormError(null);
    if (hasErrors(found)) return;

    setSubmitting(true);
    try {
      const { error } = await authClient.signUp.email({
        name: fields.name.trim(),
        email: fields.email.trim(),
        password: fields.password,
      });
      // The API signs new users straight in, so success swaps to the app.
      if (error) setFormError(error.message ?? "Couldn't create your account. Try again.");
    } catch {
      setFormError("Couldn't reach Penny. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScreen
      title="Create your account"
      subtitle="Track your money with Penny. Your data stays yours."
      footer={
        <>
          <Text variant="muted">Already have an account? </Text>
          <Link href="/sign-in" replace>
            <Text className="text-sm font-medium text-primary underline">Sign in</Text>
          </Link>
        </>
      }
    >
      <FormField
        label="Name"
        value={fields.name}
        onChangeText={set("name")}
        error={errors.name}
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
        submitBehavior="submit"
      />
      <FormField
        ref={emailRef}
        label="Email"
        value={fields.email}
        onChangeText={set("email")}
        error={errors.email}
        placeholder="you@example.com"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        submitBehavior="submit"
      />
      <FormField
        ref={passwordRef}
        label="Password"
        value={fields.password}
        onChangeText={set("password")}
        error={errors.password}
        placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={submit}
      />
      <FormError message={formError} />
      <Button size="lg" disabled={submitting} onPress={submit}>
        {submitting ? <ActivityIndicator size="small" /> : null}
        <Text>Create account</Text>
      </Button>
      <OrDivider />
      <GoogleButton disabled={submitting} onError={setFormError} />
    </AuthScreen>
  );
}
