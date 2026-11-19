import * as Crypto from "expo-crypto";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

import { OnboardingScreen, StepIntro } from "@/components/onboarding/onboarding-screen";
import { device, type FoundAccount } from "@/lib/device";
import { stepCounter, toggleId, type AccountChoices } from "@/lib/onboarding/state";
import { useOnboarding } from "@/lib/onboarding/store";
import { useOnboardingStep } from "@/lib/onboarding/use-step";
import { Button, formatMoney, Icon, SelectRow, Text, TextField } from "@repo/design-system";

/** The line under an account: its last balance, or what kind of thing it is. */
function describe(account: FoundAccount): string {
  if (account.kind === "upi") {
    return account.unsure ? "UPI ID · not sure this is yours" : "UPI ID";
  }
  if (account.kind === "card") return "Paying its bill is a transfer";
  if (account.lastBalance) {
    const { amount, currency } = account.lastBalance;
    return `Last balance ${formatMoney(amount, currency)}`;
  }
  return "Bank account";
}

export default function AccountsScreen() {
  const { back } = useOnboardingStep("accounts", "permissions");
  const router = useRouter();
  const { state, update } = useOnboarding();
  const [found, setFound] = useState<FoundAccount[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    let mounted = true;
    device.findAccounts().then((accounts) => {
      if (mounted) setFound(accounts);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Until the user changes something, every account Penny is sure about is theirs.
  const choices: AccountChoices = state.accounts ?? {
    mine: (found ?? []).filter((account) => !account.unsure).map((account) => account.id),
    added: [],
  };

  const toggle = (id: string) => (selected: boolean) =>
    update({ accounts: { ...choices, mine: toggleId(choices.mine, id, selected) } });

  const removeAdded = (id: string) =>
    update({ accounts: { ...choices, added: choices.added.filter((a) => a.id !== id) } });

  function add() {
    const label = draft.trim();
    if (!label) return;
    update({
      accounts: { ...choices, added: [...choices.added, { id: Crypto.randomUUID(), label }] },
    });
    setDraft("");
    setAdding(false);
  }

  function next() {
    update({ accounts: choices });
    router.push("/import");
  }

  return (
    <OnboardingScreen
      leading="back"
      onLeadingPress={back}
      counter={stepCounter("accounts", state.plan)}
      footer={
        <Button size="lg" disabled={!found} onPress={next}>
          <Text>Next</Text>
        </Button>
      }
    >
      <StepIntro title="Are these all yours?">
        Money moving between them is a transfer, not spending or income.
      </StepIntro>

      {found ? (
        <View className="px-gutter pt-7">
          <View role="group" aria-label="Accounts found">
            {found.map((account) => (
              <SelectRow
                key={account.id}
                title={account.label}
                subtitle={describe(account)}
                selected={choices.mine.includes(account.id)}
                onSelectedChange={toggle(account.id)}
              />
            ))}
            {choices.added.map((account) => (
              <SelectRow
                key={account.id}
                title={account.label}
                subtitle="Added by you · tap to remove"
                selected
                onSelectedChange={() => removeAdded(account.id)}
              />
            ))}
          </View>

          {adding ? (
            <View className="gap-3 pt-4">
              <TextField
                label="Account or UPI ID"
                hint="For example ICICI savings ••4321 or name@okicici"
                value={draft}
                onChangeText={setDraft}
                autoFocus
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={add}
              />
              <View className="flex-row gap-2.5">
                <Button variant="outline" className="flex-1" onPress={() => setAdding(false)}>
                  <Text>Cancel</Text>
                </Button>
                <Button className="flex-1" disabled={!draft.trim()} onPress={add}>
                  <Text>Add</Text>
                </Button>
              </View>
            </View>
          ) : (
            <Pressable
              role="button"
              onPress={() => setAdding(true)}
              className="min-h-14 flex-row items-center gap-2.5 active:opacity-60"
            >
              <Icon name="plus" size={20} />
              <Text className="font-sans-semibold text-label">Add one Penny missed</Text>
            </Pressable>
          )}
        </View>
      ) : null}
    </OnboardingScreen>
  );
}
