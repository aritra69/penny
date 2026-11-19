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
  validateSignIn,
  type FieldErrors,
  type SignInFields,
} from "@/lib/auth-validation";

export default function SignInScreen() {
  const [fields, setFields] = useState<SignInFields>({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors<SignInFields>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const passwordRef = useRef<TextInputInstance>(null);

  const set = (key: keyof SignInFields) => (value: string) =>
    setFields((f) => ({ ...f, [key]: value }));

  async function submit() {
    const found = validateSignIn(fields);
    setErrors(found);
    setFormError(null);
    if (hasErrors(found)) return;

    setSubmitting(true);
    try {
      const { error } = await authClient.signIn.email({
        email: fields.email.trim(),
        password: fields.password,
      });
      // On success the root layout sees the new session and shows the app.
      if (error) setFormError(error.message ?? "Couldn't sign in. Try again.");
    } catch {
      setFormError("Couldn't reach Penny. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScreen
      title="Welcome back"
      subtitle="Sign in to Penny."
      footer={
        <>
          <Text variant="muted">New here? </Text>
          <Link href="/sign-up" replace>
            <Text className="text-sm font-medium text-primary underline">Create an account</Text>
          </Link>
        </>
      }
    >
      <FormField
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
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={submit}
      />
      <FormError message={formError} />
      <Button size="lg" disabled={submitting} onPress={submit}>
        {submitting ? <ActivityIndicator size="small" /> : null}
        <Text>Sign in</Text>
      </Button>
      <OrDivider />
      <GoogleButton disabled={submitting} onError={setFormError} />
    </AuthScreen>
  );
}
