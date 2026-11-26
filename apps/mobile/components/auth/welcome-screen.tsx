import { useRef, useState } from "react";
import { ActivityIndicator, View, type TextInputInstance } from "react-native";

import { GoogleButton } from "@/components/auth/google-button";
import { IllustrationSlot, OnboardingScreen } from "@/components/onboarding/onboarding-screen";
import { authClient } from "@/lib/auth/client";
import {
  hasErrors,
  validateSignIn,
  type FieldErrors,
  type SignInFields,
} from "@/lib/auth-validation";
import { useAppNavigation } from "@/src/navigation/types";
import { Button, colors, LabeledDivider, Text, TextField } from "@repo/design-system";

/** The picture above the headline, one per mode. Swap a file here to change it. */
const HERO = {
  "sign-in": require("@/assets/illustrations/hero-login.png"),
  "sign-up": require("@/assets/illustrations/hero-signup.png"),
};
/** The design's height. On a shorter screen the picture gets only the room the form leaves. */
const HERO_HEIGHT = 240;
/** Below this the picture would be a sliver, so it's left out. */
const HERO_MIN_HEIGHT = 96;

type WelcomeScreenProps = {
  /**
   * "sign-in": log in with Google or email and password.
   * "sign-up": choose Google or email; email goes on to one screen per field (sign-up-name, …).
   */
  mode: "sign-in" | "sign-up";
};

/** Welcome: the first screen after the splash, for logging in or creating an account. */
export function WelcomeScreen({ mode }: WelcomeScreenProps) {
  const signUp = mode === "sign-up";
  const navigation = useAppNavigation();
  const [fields, setFields] = useState<SignInFields>({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors<SignInFields>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);
  // The room above the headline once the form is laid out; the picture fits itself into it.
  const [heroSpace, setHeroSpace] = useState(0);
  const heroHeight = Math.min(HERO_HEIGHT, heroSpace);

  const set = (key: keyof SignInFields) => (value: string) =>
    setFields((f) => ({ ...f, [key]: value }));

  async function submit() {
    const found = validateSignIn(fields);
    setErrors(found);
    setFormError(null);
    setNotice(null);
    if (hasErrors(found)) return;

    setSubmitting(true);
    try {
      const { error } = await authClient.signIn.email({
        email: fields.email.trim(),
        password: fields.password,
      });
      // On success the root navigator sees the new session and moves on to setup or Home.
      if (error) setFormError(error.message ?? "Couldn't log in. Try again.");
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
          {signUp ? (
            <Button size="lg" onPress={() => navigation.push("sign-up-name")}>
              <Text>Sign up with email</Text>
            </Button>
          ) : (
            <Button size="lg" disabled={submitting} onPress={submit}>
              {submitting ? <ActivityIndicator size="small" color={colors.paper} /> : null}
              <Text>Log in</Text>
            </Button>
          )}
          <Button
            variant="link"
            size="sm"
            className="self-center"
            onPress={() => navigation.replace(signUp ? "sign-in" : "sign-up")}
          >
            <Text className="text-caption">
              {signUp ? "Have an account? Log in" : "New here? Create account"}
            </Text>
          </Button>
        </>
      }
    >
      {/* Takes whatever height the form doesn't need, so the whole screen fits without scrolling;
          the picture sits in the middle of it when there is room to spare. */}
      <View
        className="flex-1 justify-center pt-4"
        onLayout={(event) => setHeroSpace(Math.round(event.nativeEvent.layout.height) - 16)}
      >
        {heroHeight >= HERO_MIN_HEIGHT ? (
          <IllustrationSlot source={HERO[mode]} height={heroHeight} />
        ) : null}
      </View>
      <Text variant="title" className="px-gutter pt-5">
        Know where your money goes.
      </Text>

      <View className="gap-4 px-gutter pt-5">
        <GoogleButton disabled={submitting} onError={setFormError} />
        {signUp ? null : (
          <>
            <LabeledDivider label="or" />
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
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={submit}
                action={{
                  icon: "eye",
                  label: showPassword ? "Hide password" : "Show password",
                  onPress: () => setShowPassword((shown) => !shown),
                }}
              />
              <Button
                variant="link"
                size="sm"
                className="self-end px-0"
                onPress={() => setNotice("Password reset isn't available on this server yet.")}
              >
                <Text className="text-caption">Forgot password?</Text>
              </Button>
              {notice ? (
                <Text role="alert" variant="caption">
                  {notice}
                </Text>
              ) : null}
            </View>
          </>
        )}
      </View>
    </OnboardingScreen>
  );
}
