"use server";

export type Plan = "subscription" | "own-key" | "undecided";
export type TracksWith = "nothing" | "spreadsheet" | "another-app" | "bank-app" | "paper";

export type JoinState =
  | { status: "idle" }
  | { status: "done"; position: number; code: string }
  | { status: "error"; message: string; email: string; plan: Plan };

const PLANS: Plan[] = ["subscription", "own-key", "undecided"];

const apiUrl = () => process.env.PENNY_API_URL ?? "http://localhost:4000";

const post = (path: string, body: unknown) =>
  fetch(`${apiUrl()}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

/** Adds an email to the waitlist, with the plan the person says they'd pay for. */
export async function joinWaitlist(_previous: JoinState, form: FormData): Promise<JoinState> {
  const email = String(form.get("email") ?? "").trim();
  const raw = String(form.get("plan") ?? "");
  const plan: Plan = PLANS.includes(raw as Plan) ? (raw as Plan) : "undecided";
  const ref = String(form.get("ref") ?? "") || undefined;

  if (!email) return { status: "error", message: "Enter your email address.", email, plan };

  try {
    const res = await post("/waitlist", { email, plan, ref });
    if (res.status === 422) {
      return {
        status: "error",
        message: "That email address doesn't look right. Check it and try again.",
        email,
        plan,
      };
    }
    if (!res.ok) throw new Error(`waitlist answered ${res.status}`);
    const { position, code } = (await res.json()) as { position: number; code: string };
    return { status: "done", position, code };
  } catch (err) {
    console.error(err);
    return {
      status: "error",
      message: "Couldn't save that just now. Try again in a minute.",
      email,
      plan,
    };
  }
}

/** Saves the answer to "What do you use to track money today?". Failing quietly is fine. */
export async function answerQuestion(code: string, answer: TracksWith): Promise<void> {
  try {
    await post("/waitlist/answer", { code, answer });
  } catch (err) {
    console.error(err);
  }
}
