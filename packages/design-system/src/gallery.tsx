import * as React from "react";
import { ScrollView, View } from "react-native";

import { AmountField } from "./components/amount-field";
import { Amount, HiddenAmountsProvider } from "./components/amount";
import { BigFigure } from "./components/big-figure";
import { BudgetRow } from "./components/budget-row";
import { Button } from "./components/button";
import { AssistantMessage, ChatBubble, ChatComposer } from "./components/chat";
import { CheckRow, Checkbox } from "./components/checkbox";
import { ChoiceCard, ChoiceGroup } from "./components/choice-card";
import { DraftCard } from "./components/draft-card";
import { Icon, iconNames } from "./components/icon";
import { IconButton } from "./components/icon-button";
import { InfoNote } from "./components/info-note";
import { Input } from "./components/input";
import { KeyValueRow, SplitStat } from "./components/key-value-row";
import { LabeledDivider } from "./components/labeled-divider";
import { ListRow } from "./components/list-row";
import { MonthSwitcher } from "./components/month-switcher";
import { NoticeBar } from "./components/notice-bar";
import { PaceChart } from "./components/pace-chart";
import { ProgressBar } from "./components/progress-bar";
import { ReviewCard } from "./components/review-card";
import { ScreenHeader } from "./components/screen-header";
import { SectionHeader } from "./components/section-header";
import { SelectRow } from "./components/select-row";
import { StatBox } from "./components/stat-box";
import { StatusRow } from "./components/status-row";
import { StepList } from "./components/step-list";
import { Stepper } from "./components/stepper";
import { PENNY_TABS, TabBar } from "./components/tab-bar";
import { Text } from "./components/text";
import { TextField } from "./components/text-field";
import { UnderlineTabs } from "./components/underline-tabs";
import { Wordmark } from "./components/wordmark";
import { accentOptions, colors } from "./lib/theme";

const noop = () => {};

/** Example spending for the pace chart: 18 days of a ₹40,000 month, ending at ₹21,580. */
const SPENT_BY_DAY = [
  50, 120, 210, 250, 450, 510, 560, 730, 760, 830, 1050, 1080, 1180, 1300, 1510, 1600, 1730, 2158,
].map((v) => v * 1000);

/**
 * Every component with example data, for checking the design system on a device.
 * The figures are examples, not anyone's money. Mounted by the app's dev-only gallery route.
 */
export function DesignSystemGallery() {
  const [hidden, setHidden] = React.useState(false);
  const [tab, setTab] = React.useState<"budgets" | "categories" | "merchants">("budgets");
  const [activeTab, setActiveTab] = React.useState("home");
  const [checked, setChecked] = React.useState(true);
  const [apps, setApps] = React.useState({ hdfc: true, cred: false });
  const [funding, setFunding] = React.useState<"link" | "hand">("link");
  const [budget, setBudget] = React.useState(8000);
  const [email, setEmail] = React.useState("you@example.com");
  const [message, setMessage] = React.useState("");
  const [apiKey, setApiKey] = React.useState("");
  const [batteryFixed, setBatteryFixed] = React.useState(false);

  return (
    <HiddenAmountsProvider hidden={hidden}>
      <View className="flex-1 bg-background">
        <ScrollView contentContainerClassName="pb-12">
          <ScreenHeader
            leading="back"
            onLeadingPress={noop}
            trailing={
              <IconButton
                icon="eye"
                label={hidden ? "Show amounts" : "Hide amounts"}
                onPress={() => setHidden((h) => !h)}
              />
            }
          />
          <View className="gap-2 px-gutter pt-4">
            <Text variant="title">Penny design system</Text>
            <Text>Every component with example figures. Tap the eye to hide amounts.</Text>
          </View>

          <Section title="Colour">
            <View className="flex-row flex-wrap gap-3">
              {Object.entries({ ...colors, ...accentOptions }).map(([name, hex]) => (
                <View key={name} className="w-[30%] gap-1">
                  <View
                    className="h-12 border border-foreground"
                    style={{ backgroundColor: hex }}
                  />
                  <Text variant="caption-strong">{name}</Text>
                  <Text variant="small">{hex}</Text>
                </View>
              ))}
            </View>
          </Section>

          <Section title="Type">
            <Text variant="figure-xl">₹14,222</Text>
            <Text variant="figure-lg">₹8,000</Text>
            <Text variant="figure-md">− ₹1,850</Text>
            <Text variant="title">2 transactions need a look</Text>
            <Text variant="heading">Goals</Text>
            <Text variant="headline">New goal</Text>
            <Text variant="body-lg">Here’s what I read from the screenshot.</Text>
            <Text variant="strong">Swiggy</Text>
            <Text>₹1,185 a day for 12 days</Text>
            <Text variant="label">Left to spend in November</Text>
            <Text variant="caption">Food · today</Text>
            <Text variant="small">61% of ₹3L</Text>
            <Text variant="micro">even pace</Text>
          </Section>

          <Section title="Wordmark">
            <Wordmark />
            <View className="items-start bg-primary p-4">
              <Wordmark size={28} tone="dark" />
            </View>
          </Section>

          <Section title="Icons">
            <View className="flex-row flex-wrap gap-4">
              {iconNames.map((name) => (
                <View key={name} className="w-16 items-center gap-1">
                  <Icon name={name} size={26} />
                  <Text variant="micro" numberOfLines={1}>
                    {name}
                  </Text>
                </View>
              ))}
            </View>
          </Section>

          <Section title="Buttons">
            <Button size="lg" onPress={noop}>
              <Text>Log in</Text>
            </Button>
            <Button variant="outline" size="lg" onPress={noop}>
              <Icon name="google" size={22} />
              <Text>Continue with Google</Text>
            </Button>
            <View className="flex-row gap-2.5">
              <Button className="flex-1" onPress={noop}>
                <Text>Confirm</Text>
              </Button>
              <Button variant="outline" className="flex-1" onPress={noop}>
                <Text>Edit</Text>
              </Button>
            </View>
            <Button variant="link" size="sm" className="self-center" onPress={noop}>
              <Text>Discard</Text>
            </Button>
            <Button disabled onPress={noop}>
              <Text>Disabled</Text>
            </Button>
            <View className="flex-row gap-2">
              <IconButton icon="bell" label="Notifications" dot />
              <IconButton icon="plus" label="Add" variant="outline" />
              <IconButton icon="send" label="Send" variant="solid" />
            </View>
            <View className="bg-primary p-4">
              <Button variant="inverse" size="lg" onPress={noop}>
                <Text>Start</Text>
              </Button>
            </View>
          </Section>

          <Section title="Navigation" bleed>
            <MonthSwitcher
              label="November 2026"
              onPrevious={noop}
              onNext={noop}
              canGoNext={false}
            />
            <ScreenHeader
              leading="close"
              onLeadingPress={noop}
              title="Food & dining budget"
              subtitle="Every month from November"
            />
            <ScreenHeader leading="back" onLeadingPress={noop} step="2 / 5" />
            <UnderlineTabs
              label="View"
              className="mx-gutter mt-4"
              value={tab}
              onChange={setTab}
              options={[
                { value: "budgets", label: "Budgets" },
                { value: "categories", label: "Categories" },
                { value: "merchants", label: "Merchants" },
              ]}
            />
            <View className="mt-6">
              <TabBar items={PENNY_TABS} activeKey={activeTab} onSelect={setActiveTab} />
            </View>
          </Section>

          <Section title="Feedback" bleed>
            <NoticeBar message="2 transactions need a look" onPress={noop} />
            <View className="gap-4 px-gutter pt-4">
              <InfoNote title="No duplicate found.">
                Checked HDFC and SBI from 14 to 16 Nov for ₹1,850 or Blue Tokai.
              </InfoNote>
              <View className="gap-2">
                <View className="flex-row justify-between">
                  <Text variant="strong" className="font-sans-bold">
                    Reading May to Nov
                  </Text>
                  <Text variant="strong" className="font-sans-bold">
                    72%
                  </Text>
                </View>
                <ProgressBar value={0.72} label="Import progress" />
              </View>
            </View>
          </Section>

          <Section title="Figures and charts">
            <BigFigure
              label="Left to spend in November"
              caption="₹1,185 a day for 12 days"
              className="px-0 pt-0"
            >
              <Amount minor={1_422_200} currency="INR" variant="figure-xl" />
            </BigFigure>
            <View className="gap-3.5 border-t-1.5 border-foreground pt-5">
              <View className="flex-row items-baseline justify-between">
                <Text className="font-sans-bold text-body-lg">On pace to finish ₹2,800 under</Text>
                <Text variant="caption">of ₹40,000</Text>
              </View>
              <PaceChart
                daysInMonth={30}
                spentByDay={SPENT_BY_DAY}
                budgetMinor={4_000_000}
                currency="INR"
                summary="Example: ₹21,580 spent by the 18th against an even pace to a ₹40,000 budget."
              />
            </View>
            <SplitStat
              items={[
                { label: "Each month", value: "≈ ₹8,600" },
                { label: "For", value: "7 months" },
              ]}
            />
          </Section>

          <Section title="Boxes and rows">
            <SectionHeader title="Goals" action={{ label: "All goals", onPress: noop }} />
            <View className="flex-row gap-3.5">
              <StatBox label="Emergency fund" caption="61% of ₹3L" onPress={noop}>
                <Amount minor={18_240_000} currency="INR" variant="figure" />
              </StatBox>
              <StatBox label="Bills to go" caption="Next: Airtel, Fri" onPress={noop}>
                <Amount minor={419_800} currency="INR" variant="figure" />
              </StatBox>
            </View>
            <SectionHeader
              title="Recent"
              action={{ label: "See all", onPress: noop }}
              className="pt-4"
            />
            <View>
              <ListRow
                title="Swiggy"
                subtitle="Food · today"
                trailing={<Amount minor={-38_600} currency="INR" className="font-sans-bold" />}
              />
              <ListRow
                title="Amazon refund"
                subtitle="Shopping · yesterday"
                trailing={
                  <Amount minor={89_900} currency="INR" sign="always" className="font-sans-bold" />
                }
              />
              <ListRow
                title="Not counted as spending"
                subtitle="Own-account transfers, SIPs"
                leading="transfer"
                trailing={<Amount minor={2_200_000} currency="INR" className="font-sans-bold" />}
                onPress={noop}
              />
            </View>
            <View>
              <BudgetRow
                name="Food & dining"
                spentMinor={624_000}
                budgetMinor={800_000}
                currency="INR"
                pace={0.6}
                status="Ahead of pace · ₹1,760 left"
                onPress={noop}
              />
              <BudgetRow
                name="Travel"
                spentMinor={345_000}
                budgetMinor={300_000}
                currency="INR"
                pace={0.6}
                status="₹450 over budget"
                onPress={noop}
              />
            </View>
          </Section>

          <Section title="Forms">
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              action={{ icon: "clear-circle", label: "Clear email", onPress: () => setEmail("") }}
            />
            <TextField label="Name" value="New laptop" hint="Shown on the goal box." />
            <TextField
              label="Password"
              value="short"
              secureTextEntry
              error="Use at least 8 characters."
            />
            <AmountField
              label="Amount"
              value={`₹${budget.toLocaleString("en-IN")}`}
              hint="Changes in steps of ₹500. Your usual month is ₹7,300."
              stepper={{
                step: "₹500",
                onDecrease: () => setBudget((b) => Math.max(0, b - 500)),
                onIncrease: () => setBudget((b) => b + 500),
              }}
            />
            <View className="flex-row items-center justify-between">
              <Text variant="strong">Food & dining</Text>
              <Stepper
                decreaseLabel="Less for Food & dining"
                increaseLabel="More for Food & dining"
                onDecrease={noop}
                onIncrease={noop}
              />
            </View>
            <View className="flex-row items-center justify-between">
              <Text variant="strong">Groceries</Text>
              <Stepper
                value={`₹${budget.toLocaleString("en-IN")}`}
                decreaseLabel="Less for Groceries"
                increaseLabel="More for Groceries"
                onDecrease={() => setBudget((b) => Math.max(500, b - 500))}
                onIncrease={() => setBudget((b) => b + 500)}
                canDecrease={budget > 500}
              />
            </View>
            <Input
              variant="code"
              aria-label="OpenAI API key"
              placeholder="sk-..."
              value={apiKey}
              onChangeText={setApiKey}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View className="flex-row items-center gap-3">
              <Checkbox
                checked={checked}
                onCheckedChange={setChecked}
                label="Standalone checkbox"
              />
              <Text>Standalone checkbox</Text>
            </View>
            <CheckRow checked={checked} onCheckedChange={setChecked} label="Apply to every month" />
            <View role="group" aria-label="Apps found on this phone">
              <SelectRow
                title="HDFC Bank"
                subtitle="Bank"
                selected={apps.hdfc}
                onSelectedChange={(v) => setApps((a) => ({ ...a, hdfc: v }))}
              />
              <SelectRow
                title="CRED"
                subtitle="Mostly offers"
                selected={apps.cred}
                onSelectedChange={(v) => setApps((a) => ({ ...a, cred: v }))}
              />
            </View>
            <ChoiceGroup label="Funding" layout="grid">
              <ChoiceCard
                title="Link investments"
                description="Value moves with the market"
                selected={funding === "link"}
                onSelect={() => setFunding("link")}
              />
              <ChoiceCard
                title="Track by hand"
                description="You add money as you save"
                selected={funding === "hand"}
                onSelect={() => setFunding("hand")}
              />
            </ChoiceGroup>
            <ChoiceGroup label="How to save">
              <ChoiceCard
                variant="row"
                title="Link an investment"
                description="Flexi Cap has ₹96,000 not in any goal"
                selected={funding === "link"}
                onSelect={() => setFunding("link")}
              />
              <ChoiceCard
                variant="row"
                title="Track by hand"
                description="You add money as you save"
                selected={funding === "hand"}
                onSelect={() => setFunding("hand")}
              />
            </ChoiceGroup>
            <LabeledDivider label="or with email" />
          </Section>

          <Section title="Ask Penny">
            <ChatBubble>I paid this but it’s not in Penny</ChatBubble>
            <AssistantMessage text="Here’s what I read from the screenshot. It isn’t in your transactions yet, so I’ve made a draft. Nothing is saved until you confirm.">
              <DraftCard
                title="Draft transaction"
                confirmLabel="Confirm"
                onConfirm={noop}
                onEdit={noop}
                onDiscard={noop}
              >
                <Text variant="caption">Paid to Blue Tokai Coffee</Text>
                <Amount minor={-185_000} currency="INR" variant="figure-md" />
                <View className="pt-1">
                  <KeyValueRow label="Category" value="Food & dining" onPress={noop} />
                  <KeyValueRow label="When" value="Sun 15 Nov, 1:20 pm" onPress={noop} />
                  <KeyValueRow label="From" value="HDFC ••1234 · UPI" onPress={noop} />
                </View>
                <InfoNote title="No duplicate found." className="mt-1">
                  Likely missed because the bank SMS never arrived.
                </InfoNote>
              </DraftCard>
            </AssistantMessage>
            <ChatComposer
              value={message}
              onChangeText={setMessage}
              onSend={() => setMessage("")}
              onAttach={noop}
            />
          </Section>

          <Section title="Review">
            <ReviewCard
              title="Rahul S."
              amount={<Amount minor={120_000} currency="INR" sign="always" variant="figure" />}
              meta="Yesterday, 10:41 pm · SBI UPI"
              question="Did Rahul pay you back, or is this income?"
              answers={[
                { label: "Paid me back", onPress: noop },
                { label: "Income", onPress: noop },
              ]}
              footnote="Penny’s guess is on the left. Paid-back money lowers what you spent on dinner."
            />
            <ReviewCard
              title="paytm-98765432@ptys"
              amount={<Amount minor={-249_900} currency="INR" variant="figure" />}
              meta="17 Nov, 7:12 pm · HDFC UPI"
              question="Penny couldn’t tell who this was. Probably shopping."
              onOpen={noop}
            />
          </Section>

          <Section title="Status rows">
            <View>
              <StatusRow title="Notification access" subtitle="Allowed" done />
              <StatusRow
                divider
                title="Battery: Unrestricted"
                subtitle={batteryFixed ? "Allowed" : "So Android doesn't put Penny to sleep"}
                done={batteryFixed}
                action={{ label: "Fix", onPress: () => setBatteryFixed(true) }}
              />
            </View>
          </Section>

          <Section title="Onboarding steps" bleed>
            <View className="bg-primary px-gutter py-8">
              <StepList
                tone="dark"
                steps={[
                  { title: "Connect your OpenAI key", description: "Penny sorts messages with it" },
                  {
                    title: "Pick the apps to read",
                    description: "Banks, UPI and investments only",
                  },
                  { title: "Allow alerts and SMS", description: "Two Android switches" },
                ]}
              />
            </View>
          </Section>
        </ScrollView>
      </View>
    </HiddenAmountsProvider>
  );
}

function Section({
  title,
  children,
  bleed,
}: {
  title: string;
  children: React.ReactNode;
  /** Full-width content that handles its own side padding. */
  bleed?: boolean;
}) {
  return (
    <View className="pt-10">
      <Text variant="heading" className="mx-gutter border-b-1.5 border-foreground pb-2">
        {title}
      </Text>
      <View className={bleed ? "gap-0 pt-4" : "gap-4 px-gutter pt-4"}>{children}</View>
    </View>
  );
}
