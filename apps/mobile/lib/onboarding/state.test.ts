import { describe, expect, it } from "vitest";

import {
  initialOnboardingState,
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
  it("numbers the five setup steps", () => {
    expect(stepCounter("key")).toBe("1 / 5");
    expect(stepCounter("apps")).toBe("2 / 5");
    expect(stepCounter("permissions")).toBe("3 / 5");
    expect(stepCounter("accounts")).toBe("4 / 5");
    expect(stepCounter("import")).toBe("5 / 5");
  });

  it("leaves the screens between them unnumbered", () => {
    expect(stepCounter("privacy")).toBeUndefined();
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
    expect(parsed.keyCheck).toBeNull();
    expect(parsed.sources).toBeNull();
    expect(parsed.accounts).toEqual({ mine: ["x"], added: [{ id: "b", label: "B" }] });
    expect(parsed.importChoice).toBeNull();
    expect(parsed.budgets).toEqual({ status: "set", currency: "INR", amounts: { fuel: 300000 } });
  });
});

describe("resumeStep", () => {
  it("returns to the saved step", () => {
    const keyCheck = { model: "gpt-test", latencyMs: 800 };
    expect(resumeStep({ ...agreed, keyCheck, step: "accounts" })).toBe("accounts");
    expect(resumeStep({ ...agreed, keyCheck, step: "key-ok" })).toBe("key-ok");
    expect(resumeStep({ ...agreed, step: "steps" })).toBe("steps");
  });

  it("goes back to the promise until it is agreed", () => {
    expect(resumeStep({ ...initialOnboardingState, step: "apps" })).toBe("privacy");
  });

  it("goes back to the key step when there is no working key", () => {
    expect(resumeStep({ ...agreed, step: "key-ok" })).toBe("key");
    expect(resumeStep({ ...agreed, step: "import" })).toBe("key");
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
