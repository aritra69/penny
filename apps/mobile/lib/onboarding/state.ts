/**
 * Onboarding progress and the choices made along the way. Plain data: saved on the phone as JSON
 * by `store.tsx`, so setup can stop and pick up at the same screen.
 */

/** Screens after sign-in, in order. Each name is also its route (`/key`, `/apps`, …). */
export const ONBOARDING_STEPS = [
  "privacy",
  "gender",
  "plan",
  "steps",
  "key",
  "key-ok",
  "apps",
  "permissions",
  "sms-ok",
  "accounts",
  "import",
  "budgets",
  "done",
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

/**
 * How the user pays. "subscription": Penny does the sorting, nothing to connect.
 * "own-key": the user connects their own OpenAI key and pays OpenAI directly.
 */
export type Plan = "subscription" | "own-key";

const ALL_NUMBERED: OnboardingStep[] = ["key", "apps", "permissions", "accounts", "import"];

/** The numbered setup steps for a plan. Only the own-key plan has the key step. */
export function numberedSteps(plan: Plan | null): OnboardingStep[] {
  return plan === "subscription" ? ALL_NUMBERED.filter((step) => step !== "key") : ALL_NUMBERED;
}

/** "2 / 5" on a numbered step, undefined on the screens between them. */
export function stepCounter(step: OnboardingStep, plan: Plan | null): string | undefined {
  const steps = numberedSteps(plan);
  const index = steps.indexOf(step);
  return index === -1 ? undefined : `${index + 1} / ${steps.length}`;
}

/** What the test call to OpenAI found. The key itself lives in the Keychain, never here. */
export type KeyCheck = { model: string; latencyMs: number };

export type AccountChoices = {
  /** Ids of the found accounts the user confirmed as theirs. */
  mine: string[];
  /** Accounts the user typed in because Penny missed them. Always theirs. */
  added: { id: string; label: string }[];
};

export type BudgetChoices =
  { status: "set"; currency: string; amounts: Record<string, number> } | { status: "later" };

export type Gender = "female" | "male";

export type OnboardingState = {
  version: 1;
  /** The screen the user was last on. */
  step: OnboardingStep;
  completed: boolean;
  /** ISO 8601 UTC time the user agreed to the privacy promise and terms. */
  privacyAgreedAt: string | null;
  /** Which of the two figures the user picked. null until they have. */
  gender: Gender | null;
  plan: Plan | null;
  /** The plan the user has paid for. Setup goes past the plan screen only when it matches `plan`. */
  paidPlan: Plan | null;
  keyCheck: KeyCheck | null;
  /** Ids of the apps (and "sms") Penny may read. null until the user has seen the list. */
  sources: string[] | null;
  accounts: AccountChoices | null;
  /** "background": read the last 6 months · "skipped": start from today. */
  importChoice: "background" | "skipped" | null;
  /** Category budgets in minor units, or "later". */
  budgets: BudgetChoices | null;
};

export const initialOnboardingState: OnboardingState = {
  version: 1,
  step: "privacy",
  completed: false,
  privacyAgreedAt: null,
  gender: null,
  plan: null,
  paidPlan: null,
  keyCheck: null,
  sources: null,
  accounts: null,
  importChoice: null,
  budgets: null,
};

const isStep = (value: unknown): value is OnboardingStep =>
  typeof value === "string" && (ONBOARDING_STEPS as readonly string[]).includes(value);

const isPlan = (value: unknown): value is Plan => value === "subscription" || value === "own-key";

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((v) => typeof v === "string");

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function parseKeyCheck(value: unknown): KeyCheck | null {
  if (!isRecord(value)) return null;
  const { model, latencyMs } = value;
  if (typeof model !== "string" || typeof latencyMs !== "number") return null;
  return { model, latencyMs };
}

function parseAccounts(value: unknown): AccountChoices | null {
  if (!isRecord(value) || !isStringArray(value.mine) || !Array.isArray(value.added)) return null;
  const added = value.added.filter(
    (a): a is { id: string; label: string } =>
      isRecord(a) && typeof a.id === "string" && typeof a.label === "string",
  );
  return { mine: value.mine, added: added.map(({ id, label }) => ({ id, label })) };
}

function parseBudgets(value: unknown): BudgetChoices | null {
  if (!isRecord(value)) return null;
  if (value.status === "later") return { status: "later" };
  if (value.status !== "set" || typeof value.currency !== "string" || !isRecord(value.amounts)) {
    return null;
  }
  const amounts: Record<string, number> = {};
  for (const [id, amount] of Object.entries(value.amounts)) {
    if (typeof amount === "number" && Number.isInteger(amount)) amounts[id] = amount;
  }
  return { status: "set", currency: value.currency, amounts };
}

/**
 * Reads saved state back, tolerating anything: a missing, corrupt or older value starts setup
 * again rather than crashing the app.
 */
export function parseOnboardingState(raw: string | null | undefined): OnboardingState {
  if (!raw) return initialOnboardingState;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return initialOnboardingState;
  }
  if (!isRecord(data) || data.version !== 1) return initialOnboardingState;
  return {
    version: 1,
    step: isStep(data.step) ? data.step : "privacy",
    completed: data.completed === true,
    privacyAgreedAt: typeof data.privacyAgreedAt === "string" ? data.privacyAgreedAt : null,
    gender: data.gender === "female" || data.gender === "male" ? data.gender : null,
    plan: isPlan(data.plan) ? data.plan : null,
    paidPlan: isPlan(data.paidPlan) ? data.paidPlan : null,
    keyCheck: parseKeyCheck(data.keyCheck),
    sources: isStringArray(data.sources) ? data.sources : null,
    accounts: parseAccounts(data.accounts),
    importChoice:
      data.importChoice === "background" || data.importChoice === "skipped"
        ? data.importChoice
        : null,
    budgets: parseBudgets(data.budgets),
  };
}

/**
 * Where to reopen setup. Normally the saved step, pulled back when what that screen relies on
 * isn't there: nothing past the promise without agreeing to it, nothing past the plan until
 * one is paid for, and on the own-key plan nothing past the key step without a working key.
 */
export function resumeStep(state: OnboardingState): OnboardingStep {
  if (!state.privacyAgreedAt) return "privacy";
  const index = ONBOARDING_STEPS.indexOf(state.step);
  const after = (step: OnboardingStep) => index > ONBOARDING_STEPS.indexOf(step);
  if ((!state.plan || state.paidPlan !== state.plan) && after("plan")) return "plan";
  if (state.plan === "own-key" && !state.keyCheck && after("key")) return "key";
  // The key screens don't exist on the subscription plan.
  if (state.plan === "subscription" && (state.step === "key" || state.step === "key-ok")) {
    return "steps";
  }
  return state.step;
}

/** Adds or removes an id, keeping the order of first selection. */
export function toggleId(ids: readonly string[], id: string, selected: boolean): string[] {
  const without = ids.filter((existing) => existing !== id);
  return selected ? [...without, id] : without;
}
