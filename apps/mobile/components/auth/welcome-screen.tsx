import { Link } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, useWindowDimensions, View, type TextInputInstance } from "react-native";

import { GoogleButton } from "@/components/auth/google-button";
import { IllustrationSlot, OnboardingScreen } from "@/components/onboarding/onboarding-screen";
import { authClient } from "@/lib/auth-client";
import {
  hasErrors,
  MIN_PASSWORD_LENGTH,
  validateSignIn,
  validateSignUp,
  type FieldErrors,
  type SignUpFields,
} from "@/lib/auth-validation";
import { Button, colors, LabeledDivider, Text, TextField } from "@repo/design-system";

/** The picture above the headline. Swap the file here to change it. */
const HERO = require("@/assets/illustrations/hero-street.webp");
/** The design's height, and the most of a short screen it may take so the form stays in view. */
const HERO_HEIGHT = 220;
const HERO_MAX_SHARE = 0.26;

type WelcomeScreenProps = {
  /** "sign-in": log in to an account · "sign-up": create one. Same screen, one more field. */
  mode: "sign-in" | "sign-up";
};

/** Welcome and sign in: the first screen after the splash. */
export function WelcomeScreen({ mode }: WelcomeScreenProps) {
  const signUp = mode === "sign-up";
  const [fields, setFields] = useState<SignUpFields>({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors<SignUpFields>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);
  const { height: screenHeight } = useWindowDimensions();
  const heroHeight = Math.min(HERO_HEIGHT, Math.round(screenHeight * HERO_MAX_SHARE));

  const set = (key: keyof SignUpFields) => (value: string) =>
    setFields((f) => ({ ...f, [key]: value }));

  async function submit() {
    const found = signUp ? validateSignUp(fields) : validateSignIn(fields);
    setErrors(found);
    setFormError(null);
    setNotice(null);
    if (hasErrors(found)) return;

    setSubmitting(true);
    try {
      const email = fields.email.trim();
      const { error } = signUp
        ? await authClient.signUp.email({
            name: fields.name.trim(),
            email,
            password: fields.password,
          })
        : await authClient.signIn.email({ email, password: fields.password });
      // On success the root layout sees the new session and moves on to setup or Home.
      if (error) {
        setFormError(
          error.message ??
            (signUp ? "Couldn't create your account. Try again." : "Couldn't log in. Try again."),
        );
      }
    } catch {
      setFormError("Couldn't reach Penny. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <OnboardingScreen
      footer={
        <>
          {formError ? (
            <Text role="alert" variant="caption" className="pb-2 text-destructive">
              {formError}
            </Text>
          ) : null}
          <Button size="lg" disabled={submitting} onPress={submit}>
            {submitting ? <ActivityIndicator size="small" color={colors.paper} /> : null}
            <Text>{signUp ? "Create account" : "Log in"}</Text>
          </Button>
        </>
      }
    >
      <IllustrationSlot source={HERO} height={heroHeight} className="mt-5" />
      <View className="gap-2.5 px-gutter pt-6">
        <Text variant="title">Know where your money goes, without typing a thing.</Text>
        <Text>
          Penny reads your bank SMS and payment alerts and keeps everything on this phone.
        </Text>
      </View>

      <View className="gap-[22px] px-gutter pt-7">
        <GoogleButton disabled={submitting} onError={setFormError} />
        <LabeledDivider label="or with email" />
        {signUp ? (
          <TextField
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
        ) : null}
        <TextField
          ref={emailRef}
          label="Email"
          value={fields.email}
          onChangeText={set("email")}
          error={errors.email}
          placeholder="you@example.com"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          submitBehavior="submit"
          action={
            fields.email
              ? { icon: "clear-circle", label: "Clear email", onPress: () => set("email")("") }
              : undefined
          }
        />
        <View>
          <TextField
            ref={passwordRef}
            label="Password"
            value={fields.password}
            onChangeText={set("password")}
            error={errors.password}
            hint={signUp ? `At least ${MIN_PASSWORD_LENGTH} characters` : undefined}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete={signUp ? "new-password" : "current-password"}
            textContentType={signUp ? "newPassword" : "password"}
            returnKeyType="go"
            onSubmitEditing={submit}
            action={{
              icon: "eye",
              label: showPassword ? "Hide password" : "Show password",
              onPress: () => setShowPassword((shown) => !shown),
            }}
          />
          <View className="flex-row items-center justify-between pt-2">
            <Link href={signUp ? "/sign-in" : "/sign-up"} replace asChild>
              <Button variant="link" size="sm" className="px-0">
                <Text className="text-caption">
                  {signUp ? "Have an account? Log in" : "New here? Create account"}
                </Text>
              </Button>
            </Link>
            {signUp ? null : (
              <Button
                variant="link"
                size="sm"
                className="px-0"
                onPress={() => setNotice("Password reset isn't available on this server yet.")}
              >
                <Text className="text-caption">Forgot password?</Text>
              </Button>
            )}
          </View>
          {notice ? (
            <Text role="alert" variant="caption" className="pt-1">
              {notice}
            </Text>
          ) : null}
        </View>
      </View>
    </OnboardingScreen>
  );
}
