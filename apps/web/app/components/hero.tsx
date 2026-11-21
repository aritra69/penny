"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  answerQuestion,
  joinWaitlist,
  type JoinState,
  type Plan,
  type TracksWith,
} from "../actions";
import { HOME_ROWS, HomeScreen, Phone, type Row } from "./screens";
import styles from "./hero.module.css";

const PLANS: { value: Plan; label: string }[] = [
  { value: "subscription", label: "$1.99 a month" },
  { value: "own-key", label: "$14.99 once, own OpenAI key" },
  { value: "undecided", label: "Not sure yet" },
];

const ANSWERS: { value: TracksWith; label: string }[] = [
  { value: "nothing", label: "Nothing" },
  { value: "spreadsheet", label: "A spreadsheet" },
  { value: "another-app", label: "Another app" },
  { value: "bank-app", label: "My bank's app" },
  { value: "paper", label: "Notes or paper" },
];

const STEPS = [
  { title: "Your bank texts you.", body: "The alert you'd normally swipe away." },
  {
    title: "Penny reads it on the phone.",
    body: "Amount, shop, card. One-time codes are dropped.",
  },
  { title: "It's in your budget.", body: "You typed nothing." },
];

const BEFORE = 128240; // cents
const AFTER = 124022;
const NEW_ROW: Row = {
  id: "grocer",
  merchant: "Greenleaf Market",
  sub: "Groceries · Card 4417",
  amount: "−$42.18",
};

const money = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Plays the demo once when the phone is on screen: a bank text arrives and becomes a row. */
function useDemo(target: React.RefObject<HTMLElement | null>) {
  const [stage, setStage] = useState(0);
  const [cents, setCents] = useState(BEFORE);
  const [done, setDone] = useState(false);
  const timers = useRef<number[]>([]);

  const finish = useCallback(() => {
    setStage(3);
    setCents(AFTER);
    setDone(true);
  }, []);

  const play = useCallback(() => {
    timers.current.forEach(clearTimeout);
    setStage(0);
    setCents(BEFORE);
    setDone(false);
    timers.current = [800, 2200, 3800].map((at, i) =>
      window.setTimeout(() => {
        setStage(i + 1);
        if (i === 2) {
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / 650);
            setCents(Math.round(BEFORE - (BEFORE - AFTER) * (1 - Math.pow(1 - t, 3))));
            if (t < 1) requestAnimationFrame(tick);
            else setDone(true);
          };
          requestAnimationFrame(tick);
        }
      }, at),
    );
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = window.setTimeout(finish, 0);
      return () => clearTimeout(id);
    }
    const el = target.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          observer.disconnect();
          play();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    const pending = timers.current;
    return () => {
      observer.disconnect();
      pending.forEach(clearTimeout);
    };
  }, [target, finish, play]);

  return { stage, cents, done, play };
}

/** A highlighter-swept choice: one radio in a row of them. */
function Chip({
  name,
  value,
  label,
  checked,
  onChange,
}: {
  name: string;
  value: string;
  label: string;
  checked?: boolean;
  onChange?: () => void;
}) {
  return (
    <label className={styles.chip}>
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={onChange ? undefined : checked}
        checked={onChange ? checked : undefined}
        onChange={onChange}
        className={styles.chipInput}
      />
      <span className={styles.chipLabel}>{label}</span>
    </label>
  );
}

function JoinForm({
  action,
  pending,
  error,
  defaultPlan,
  refCode,
}: {
  action: (form: FormData) => void;
  pending: boolean;
  error: Extract<JoinState, { status: "error" }> | null;
  defaultPlan: Plan;
  refCode?: string;
}) {
  const id = useId();
  const plan = error?.plan ?? defaultPlan;
  return (
    <form action={action} className={styles.form} noValidate>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Which would you pay for?</legend>
        <div className={styles.chips}>
          {PLANS.map((option) => (
            <Chip
              key={option.value}
              name="plan"
              value={option.value}
              label={option.label}
              checked={plan === option.value}
            />
          ))}
        </div>
      </fieldset>
      {refCode ? <input type="hidden" name="ref" value={refCode} /> : null}
      <div className={styles.field}>
        <label htmlFor={`${id}-email`} className={styles.label}>
          Email
        </label>
        <div className={styles.row}>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            required
            defaultValue={error?.email}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className={styles.input}
          />
          <button type="submit" className={styles.submit} disabled={pending}>
            {pending ? "Adding you…" : "Join the waitlist"}
          </button>
        </div>
        {error ? (
          <p id={`${id}-error`} role="alert" className={styles.error}>
            {error.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}

/** "#142", each digit rolling up into place. */
function Odometer({ value }: { value: number }) {
  const digits = `#${value.toLocaleString("en-US")}`.split("");
  return (
    <p className={styles.place} aria-label={`Number ${value}`}>
      {digits.map((char, i) => (
        <span key={i} className={styles.digitWindow} aria-hidden>
          <span className={styles.digit} style={{ animationDelay: `${120 + i * 70}ms` }}>
            {char}
          </span>
        </span>
      ))}
    </p>
  );
}

function Joined({
  position,
  code,
  foundingOpen,
}: {
  position: number;
  code: string;
  foundingOpen: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [answer, setAnswer] = useState<TracksWith | null>(null);
  const [, startTransition] = useTransition();
  const link = `${window.location.origin}/?ref=${code}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const pick = (value: TracksWith) => {
    setAnswer(value);
    startTransition(() => answerQuestion(code, value));
  };

  return (
    <div className={styles.joined}>
      <p className={styles.joinedTitle} role="status">
        <span className={styles.tick} aria-hidden>
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.5" />
          </svg>
        </span>
        You&apos;re on the list.
      </p>

      <div>
        <p className={styles.placeLabel}>Your place in line</p>
        <Odometer value={position} />
      </div>

      <div className={styles.invite}>
        <p className={styles.strong}>Each friend who joins moves you up 10 places.</p>
        <div className={styles.linkRow}>
          <input className={styles.link} value={link} readOnly aria-label="Your invite link" />
          <button
            type="button"
            className={styles.copyButton}
            onClick={copy}
            data-copied={copied || undefined}
          >
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      </div>

      <fieldset className={styles.fieldset}>
        <legend className={styles.strong}>
          One question: what do you use to track money today?
        </legend>
        <div className={styles.chips}>
          {ANSWERS.map((option) => (
            <Chip
              key={option.value}
              name="tracks-with"
              value={option.value}
              label={option.label}
              checked={answer === option.value}
              onChange={() => pick(option.value)}
            />
          ))}
        </div>
        {answer ? (
          <p className={styles.thanks}>Thanks. That helps us decide what to build first.</p>
        ) : null}
      </fieldset>

      {foundingOpen ? (
        <a href="#founding" className={styles.skip}>
          Skip the line: become a founding member →
        </a>
      ) : null}
    </div>
  );
}

export function Hero({
  defaultPlan = "subscription",
  refCode,
  foundingOpen,
}: {
  defaultPlan?: Plan;
  refCode?: string;
  foundingOpen: boolean;
}) {
  const [state, action, pending] = useActionState<JoinState, FormData>(joinWaitlist, {
    status: "idle",
  });
  const phone = useRef<HTMLDivElement>(null);
  const { stage, cents, done, play } = useDemo(phone);

  const rows = stage >= 3 ? [NEW_ROW, ...HOME_ROWS] : HOME_ROWS;
  const activeStep = stage - 1;

  const overlay =
    stage === 1 || stage === 2 ? (
      <div className={styles.notification} data-stage={stage}>
        <div className={styles.from}>
          <span className={styles.appIcon} aria-hidden />
          <span>Messages · FIRSTBANK</span>
          <span className={styles.now}>now</span>
        </div>
        <p className={styles.sms}>
          Card 4417 used for <mark className={styles.mark}>$42.18</mark> at{" "}
          <mark className={styles.mark}>GREENLEAF MARKET</mark> on Nov 20. Avail bal $2,914.07
        </p>
      </div>
    ) : null;

  return (
    <>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.copy}>
          {state.status === "done" ? (
            <Joined position={state.position} code={state.code} foundingOpen={foundingOpen} />
          ) : (
            <>
              <h1 id="hero-title" className={styles.title}>
                Every bank alert, already in your budget.
              </h1>
              <p className={styles.lede}>
                Penny is an Android app that reads the texts and alerts your bank already sends, and
                shows what&apos;s left to spend this month. Nothing to type. Nothing leaves your
                phone.
              </p>
              <JoinForm
                action={action}
                pending={pending}
                error={state.status === "error" ? state : null}
                defaultPlan={defaultPlan}
                refCode={refCode}
              />
            </>
          )}
          <p className={styles.facts}>
            <span>Read-only</span>
            <span>On your phone</span>
            <span>Open source</span>
          </p>
        </div>

        <div className={styles.phone} ref={phone}>
          <Phone label="Penny's Home screen, adding a purchase from a bank text. Sample data.">
            <HomeScreen
              figure={money(cents)}
              rows={rows}
              fresh={stage >= 3 ? NEW_ROW.id : undefined}
              overlay={overlay}
            />
          </Phone>
          <p className={styles.sample}>Sample data</p>
        </div>
      </section>

      <section className={styles.steps} aria-label="How it works">
        <ol className={styles.stepList}>
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className={styles.step}
              data-state={i === activeStep ? "now" : i < activeStep ? "done" : "next"}
            >
              <span className={styles.stepMark} aria-hidden>
                {i + 1}
              </span>
              <span>
                <span className={styles.stepTitle}>{step.title}</span>
                <span className={styles.stepBody}>{step.body}</span>
              </span>
            </li>
          ))}
        </ol>
        <button type="button" className={styles.replay} onClick={play} disabled={!done}>
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
            <path
              d="M4 12a8 8 0 1 0 2.6-5.9M4 4v5h5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          Play it again
        </button>
      </section>
    </>
  );
}
