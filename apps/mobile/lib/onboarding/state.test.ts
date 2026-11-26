import { describe, expect, it } from "vitest";

import {
  initialOnboardingState,
  NUMBERED_STEPS,
  parseOnboardingState,
  resumeStep,
  stepCounter,
  toggleId,
  type OnboardingState,
} from "@/lib/onboarding/state";

const agreed: OnboardingState = {
  ...initialOnboardingState,
  privacyAgreedAt: "2026-11-19T10:00:00.000Z",
};

describe("stepCounter", () => {
  it("numbers the five setup steps, starting with the paywall", () => {
    expect(NUMBERED_STEPS).toEqual(["plan", "apps", "permissions", "accounts", "import"]);
    expect(stepCounter("plan")).toBe("1 / 5");
    expect(stepCounter("apps")).toBe("2 / 5");
    expect(stepCounter("permissions")).toBe("3 / 5");
    expect(stepCounter("accounts")).toBe("4 / 5");
    expect(stepCounter("import")).toBe("5 / 5");
  });

  it("counts the own-key branch as step 1", () => {
    expect(stepCounter("plan-own-key")).toBe("1 / 5");
    expect(stepCounter("key")).toBe("1 / 5");
  });

  it("leaves the screens between them unnumbered", () => {
    expect(stepCounter("privacy")).toBeUndefined();
    expect(stepCounter("steps")).toBeUndefined();
    expect(stepCounter("plan-started")).toBeUndefined();
    expect(stepCounter("key-ok")).toBeUndefined();
    expect(stepCounter("budgets")).toBeUndefined();
  });
});

describe("parseOnboardingState", () => {
  it("starts fresh when nothing is saved", () => {
    expect(parseOnboardingState(null)).toEqual(initialOnboardingState);
    expect(parseOnboardingState("")).toEqual(initialOnboardingState);
  });

  it("starts fresh on corrupt or unknown data", () => {
    expect(parseOnboardingState("{not json")).toEqual(initialOnboardingState);
    expect(parseOnboardingState("[]")).toEqual(initialOnboardingState);
    expect(parseOnboardingState(JSON.stringify({ version: 2, step: "apps" }))).toEqual(
      initialOnboardingState,
    );
  });

  it("round-trips a full state", () => {
    const state: OnboardingState = {
      version: 1,
      step: "budgets",
      completed: false,
      privacyAgreedAt: "2026-11-19T10:00:00.000Z",
      gender: "female",
      plan: "subscription",
      paidPlan: "subscription",
      trialStartedAt: "2026-11-23T12:35:00.000Z",
      trialEndsAt: "2026-12-23T12:35:00.000Z",
      keyCheck: { model: "gpt-test", latencyMs: 812 },
      sources: ["hdfc", "sms"],
      accounts: { mine: ["hdfc-1234"], added: [{ id: "a1", label: "ICICI ••4321" }] },
      importChoice: "background",
      budgets: { status: "set", currency: "INR", amounts: { food: 800000 } },
    };
    expect(parseOnboardingState(JSON.stringify(state))).toEqual(state);
  });

  it("drops fields of the wrong shape and keeps the rest", () => {
    const parsed = parseOnboardingState(
      JSON.stringify({
        version: 1,
        step: "nowhere",
        completed: "yes",
        privacyAgreedAt: "2026-11-19T10:00:00.000Z",
        gender: "other",
        plan: "free",
        trialStartedAt: "2026-11-23T12:35:00.000Z",
        trialEndsAt: "soon",
        keyCheck: { model: 3 },
        sources: ["hdfc", 4],
        accounts: { mine: ["x"], added: [{ id: "a" }, { id: "b", label: "B" }] },
        importChoice: "maybe",
        budgets: { status: "set", currency: "INR", amounts: { food: 80.5, fuel: 300000 } },
      }),
    );
    expect(parsed.step).toBe("privacy");
    expect(parsed.completed).toBe(false);
    expect(parsed.privacyAgreedAt).toBe("2026-11-19T10:00:00.000Z");
    expect(parsed.gender).toBeNull();
    expect(parsed.plan).toBeNull();
    expect(parsed.trialStartedAt).toBeNull();
    expect(parsed.trialEndsAt).toBeNull();
    expect(parsed.keyCheck).toBeNull();
    expect(parsed.sources).toBeNull();
    expect(parsed.accounts).toEqual({ mine: ["x"], added: [{ id: "b", label: "B" }] });
    expect(parsed.importChoice).toBeNull();
    expect(parsed.budgets).toEqual({ status: "set", currency: "INR", amounts: { fuel: 300000 } });
  });
});

describe("resumeStep", () => {
  const keyCheck = { model: "gpt-test", latencyMs: 800 };
  const ownKey: OnboardingState = { ...agreed, plan: "own-key", paidPlan: "own-key" };
  const subscription: OnboardingState = {
    ...agreed,
    plan: "subscription",
    paidPlan: "subscription",
    trialStartedAt: "2026-11-23T12:35:00.000Z",
    trialEndsAt: "2026-12-23T12:35:00.000Z",
  };

  it("returns to the saved step", () => {
    expect(resumeStep({ ...agreed, step: "gender" })).toBe("gender");
    expect(resumeStep({ ...agreed, step: "steps" })).toBe("steps");
    expect(resumeStep({ ...agreed, step: "plan" })).toBe("plan");
    expect(resumeStep({ ...subscription, step: "plan-started" })).toBe("plan-started");
    expect(resumeStep({ ...subscription, step: "accounts" })).toBe("accounts");
    expect(resumeStep({ ...ownKey, step: "plan-own-key" })).toBe("plan-own-key");
    expect(resumeStep({ ...ownKey, step: "key" })).toBe("key");
    expect(resumeStep({ ...ownKey, keyCheck, step: "key-ok" })).toBe("key-ok");
    expect(resumeStep({ ...ownKey, keyCheck, step: "accounts" })).toBe("accounts");
  });

  it("goes back to the promise until it is agreed", () => {
    expect(resumeStep({ ...initialOnboardingState, step: "apps" })).toBe("privacy");
  });

  it("goes back to the paywall until a plan is bought", () => {
    expect(resumeStep({ ...agreed, step: "plan-started" })).toBe("plan");
    expect(resumeStep({ ...agreed, step: "apps" })).toBe("plan");
    expect(resumeStep({ ...agreed, plan: "subscription", step: "apps" })).toBe("plan");
    expect(resumeStep({ ...agreed, keyCheck, step: "import" })).toBe("plan");
    expect(resumeStep({ ...agreed, step: "plan-own-key" })).toBe("plan");
  });

  it("keeps the own-key plan on the ₹999 screen until it is paid", () => {
    const chosen: OnboardingState = { ...agreed, plan: "own-key" };
    expect(resumeStep({ ...chosen, step: "plan-own-key" })).toBe("plan-own-key");
    expect(resumeStep({ ...chosen, step: "key" })).toBe("plan-own-key");
    expect(resumeStep({ ...chosen, keyCheck, step: "apps" })).toBe("plan-own-key");
    // Bought Plus, then switched to the own key without paying for it.
    expect(resumeStep({ ...subscription, plan: "own-key", step: "key" })).toBe("plan-own-key");
  });

  it("goes back to the key step when the own-key plan has no working key", () => {
    expect(resumeStep({ ...ownKey, step: "key-ok" })).toBe("key");
    expect(resumeStep({ ...ownKey, step: "import" })).toBe("key");
  });

  it("never reopens the other branch's screens", () => {
    expect(resumeStep({ ...subscription, step: "plan-own-key" })).toBe("apps");
    expect(resumeStep({ ...subscription, step: "key" })).toBe("apps");
    expect(resumeStep({ ...subscription, keyCheck, step: "key-ok" })).toBe("apps");
    expect(resumeStep({ ...ownKey, keyCheck, step: "plan-started" })).toBe("plan-own-key");
  });

  it("needs no key or trial dates on a restored Plus purchase", () => {
    const restored: OnboardingState = { ...agreed, plan: "subscription", paidPlan: "subscription" };
    expect(resumeStep({ ...restored, step: "import" })).toBe("import");
  });
});

describe("toggleId", () => {
  it("adds, removes and never duplicates", () => {
    expect(toggleId(["a"], "b", true)).toEqual(["a", "b"]);
    expect(toggleId(["a", "b"], "a", false)).toEqual(["b"]);
    expect(toggleId(["a", "b"], "a", true)).toEqual(["b", "a"]);
    expect(toggleId([], "a", false)).toEqual([]);
  });
});
