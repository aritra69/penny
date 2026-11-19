import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { OnboardingScreen, StepIntro } from "@/components/onboarding/onboarding-screen";
import { stepCounter } from "@/lib/onboarding/state";
import { useOnboarding } from "@/lib/onboarding/store";
import { useOnboardingStep } from "@/lib/onboarding/use-step";
import { checkOpenAIKey, looksLikeOpenAIKey } from "@/lib/openai";
import { saveOpenAIKey } from "@/lib/openai-key";
import { Button, colors, Icon, Input, Text } from "@repo/design-system";

const KEYS_URL = "https://platform.openai.com/api-keys";

export default function OpenAIKeyScreen() {
  const { back } = useOnboardingStep("key", "steps");
  const router = useRouter();
  const { update } = useOnboarding();
  // The key lives in this field until it is checked, then only in SecureStore.
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  function change(value: string) {
    setKey(value);
    setError(null);
  }

  async function paste() {
    const text = await Clipboard.getStringAsync().catch(() => "");
    if (text.trim()) change(text.trim());
  }

  async function check() {
    setChecking(true);
    setError(null);
    try {
      const result = await checkOpenAIKey(key, {
        preferredModel: process.env.EXPO_PUBLIC_OPENAI_MODEL || undefined,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      await saveOpenAIKey(key);
      update({ keyCheck: { model: result.model, latencyMs: result.latencyMs } });
      setKey("");
      router.push("/key-ok");
    } catch {
      setError("Couldn't save the key on this phone. Try again.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <OnboardingScreen
      leading="back"
      onLeadingPress={back}
      counter={stepCounter("key")}
      footer={
        <View className="gap-3.5">
          <View className="flex-row items-start gap-2.5">
            <Icon name="lock" size={18} />
            <Text variant="caption" className="flex-1">
              Stored encrypted on this phone. Never logged, never backed up.
            </Text>
          </View>
          <Button size="lg" disabled={checking || !looksLikeOpenAIKey(key)} onPress={check}>
            {checking ? <ActivityIndicator size="small" color={colors.paper} /> : null}
            <Text>Check key</Text>
          </Button>
        </View>
      }
    >
      <StepIntro title="What's your OpenAI key?">
        Penny uses your own key to sort each message. You pay OpenAI directly, under a paisa per
        message.
      </StepIntro>

      <View className="gap-3 px-gutter pt-12">
        <View className="flex-row items-center gap-2 border-b-2.5 border-foreground">
          <Input
            variant="code"
            aria-label="OpenAI API key"
            aria-invalid={!!error}
            className="flex-1 border-b-0"
            placeholder="sk-..."
            value={key}
            onChangeText={change}
            editable={!checking}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            spellCheck={false}
            returnKeyType="done"
          />
          <Button variant="outline" size="sm" className="min-h-9 px-3" onPress={paste}>
            <Text className="font-sans-bold">Paste</Text>
          </Button>
        </View>
        {error ? (
          <Text role="alert" variant="caption" className="text-destructive">
            {error}
          </Text>
        ) : null}
        <Button
          variant="link"
          size="sm"
          className="self-start px-0"
          onPress={() => WebBrowser.openBrowserAsync(KEYS_URL)}
        >
          <Text>Where do I get a key?</Text>
        </Button>
      </View>
    </OnboardingScreen>
  );
}
