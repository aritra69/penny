import { describe, expect, it } from "vitest";

import {
  initialOnboardingState,
  numberedSteps,
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
  it("numbers the five setup steps on the own-key plan", () => {
    expect(stepCounter("key", "own-key")).toBe("1 / 5");
    expect(stepCounter("apps", "own-key")).toBe("2 / 5");
    expect(stepCounter("permissions", "own-key")).toBe("3 / 5");
    expect(stepCounter("accounts", "own-key")).toBe("4 / 5");
    expect(stepCounter("import", "own-key")).toBe("5 / 5");
  });

  it("drops the key step on the subscription plan", () => {
    expect(numberedSteps("subscription")).toEqual(["apps", "permissions", "accounts", "import"]);
    expect(stepCounter("key", "subscription")).toBeUndefined();
    expect(stepCounter("apps", "subscription")).toBe("1 / 4");
    expect(stepCounter("import", "subscription")).toBe("4 / 4");
  });

  it("leaves the screens between them unnumbered", () => {
    expect(stepCounter("privacy", "own-key")).toBeUndefined();
    expect(stepCounter("key-ok", "own-key")).toBeUndefined();
    expect(stepCounter("budgets", "subscription")).toBeUndefined();
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
      plan: "own-key",
      paidPlan: "own-key",
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
  };

  it("returns to the saved step", () => {
    expect(resumeStep({ ...ownKey, keyCheck, step: "accounts" })).toBe("accounts");
    expect(resumeStep({ ...ownKey, keyCheck, step: "key-ok" })).toBe("key-ok");
    expect(resumeStep({ ...ownKey, step: "steps" })).toBe("steps");
    expect(resumeStep({ ...agreed, step: "gender" })).toBe("gender");
    expect(resumeStep({ ...agreed, step: "plan" })).toBe("plan");
  });

  it("goes back to the promise until it is agreed", () => {
    expect(resumeStep({ ...initialOnboardingState, step: "apps" })).toBe("privacy");
  });

  it("goes back to the plan until one is picked and paid for", () => {
    expect(resumeStep({ ...agreed, step: "steps" })).toBe("plan");
    expect(resumeStep({ ...agreed, plan: "subscription", step: "apps" })).toBe("plan");
    expect(resumeStep({ ...ownKey, plan: "subscription", step: "apps" })).toBe("plan");
    expect(resumeStep({ ...agreed, keyCheck, step: "import" })).toBe("plan");
  });

  it("goes back to the key step when the own-key plan has no working key", () => {
    expect(resumeStep({ ...ownKey, step: "key-ok" })).toBe("key");
    expect(resumeStep({ ...ownKey, step: "import" })).toBe("key");
  });

  it("needs no key on the subscription plan, and never reopens the key screens", () => {
    expect(resumeStep({ ...subscription, step: "import" })).toBe("import");
    expect(resumeStep({ ...subscription, step: "key" })).toBe("steps");
    expect(resumeStep({ ...subscription, keyCheck, step: "key-ok" })).toBe("steps");
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
