import type { ReactNode } from "react";
import styles from "./screens.module.css";

/** A square-cornered handset drawn in ink, like everything else in Penny. */
export function Phone({ children, label }: { children: ReactNode; label: string }) {
  return (
    <figure className={styles.phone} aria-label={label}>
      <div className={styles.speaker} aria-hidden />
      <div className={styles.screen}>
        <div className={styles.status} aria-hidden>
          <span>9:41</span>
          <span className={styles.battery} />
        </div>
        {children}
      </div>
    </figure>
  );
}

function TabBar({ active }: { active: string }) {
  const tabs = ["Home", "Spending", "Goals", "Wealth", "Ask"];
  return (
    <div className={styles.tabBar} aria-hidden>
      {tabs.map((tab) => (
        <span key={tab} className={styles.tab} data-active={tab === active || undefined}>
          <span className={styles.tabDot} />
          {tab}
        </span>
      ))}
    </div>
  );
}

function Header({ title, step }: { title: string; step?: string }) {
  return (
    <div className={styles.header}>
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
        <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
      <span className={styles.headerTitle}>{title}</span>
      <span className={styles.headerStep}>{step}</span>
    </div>
  );
}

export type Row = { id: string; merchant: string; sub: string; amount: string };

export const HOME_ROWS: Row[] = [
  { id: "transit", merchant: "City Transit", sub: "Transport · Card 4417", amount: "−$2.90" },
  { id: "salary", merchant: "Northwind Ltd", sub: "Salary · Checking", amount: "+$3,850.00" },
  { id: "stream", merchant: "Streamly", sub: "Subscriptions · Card 4417", amount: "−$11.99" },
];

/** Penny's Home tab. The hero demo drives `figure`, `rows` and `fresh`. */
export function HomeScreen({
  figure = "$1,240.22",
  rows = HOME_ROWS,
  fresh,
  overlay,
}: {
  figure?: string;
  rows?: Row[];
  fresh?: string;
  overlay?: ReactNode;
}) {
  return (
    <>
      {overlay}
      <div className={styles.topBar}>
        <span className={styles.wordmark}>
          penny
          <span className={styles.wordmarkDot} />
        </span>
        <span className={styles.month}>November</span>
      </div>
      <div className={styles.notice}>
        <span>3 transactions need a look</span>
        <span aria-hidden>→</span>
      </div>
      <div className={styles.body}>
        <p className={styles.label}>Left to spend this month</p>
        <p className={styles.figureXl}>{figure}</p>
        <p className={styles.caption}>About $124 a day for the next 10 days</p>
        <PaceChart />
        <p className={styles.sectionTitle}>Recent</p>
        <ul className={styles.rows}>
          {rows.map((row) => (
            <li key={row.id} className={styles.row} data-fresh={row.id === fresh || undefined}>
              <span className={styles.rowText}>
                <span className={styles.strong}>{row.merchant}</span>
                <span className={styles.caption}>{row.sub}</span>
              </span>
              <span className={styles.amount}>{row.amount}</span>
            </li>
          ))}
        </ul>
      </div>
      <TabBar active="Home" />
    </>
  );
}

function PaceChart() {
  // 30 days across 260 units; today is day 20. Spent is a little under plan.
  return (
    <svg className={styles.pace} viewBox="0 0 260 84" aria-hidden>
      <rect x="166" y="0" width="9" height="74" fill="var(--highlight)" />
      <line
        x1="0"
        y1="74"
        x2="260"
        y2="6"
        stroke="var(--faint)"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <polyline
        points="0,74 18,70 36,66 52,57 70,55 88,49 104,46 122,38 140,36 158,31 170,29"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="2.5"
      />
      <line x1="0" y1="74.5" x2="260" y2="74.5" stroke="var(--ink)" strokeWidth="1" />
      <text x="0" y="84" className={styles.chartLabel}>
        Nov 1
      </text>
      <text x="170" y="84" textAnchor="middle" className={styles.chartLabel}>
        Today
      </text>
      <text x="260" y="84" textAnchor="end" className={styles.chartLabel}>
        30
      </text>
    </svg>
  );
}

export function ReviewScreen() {
  return (
    <>
      <Header title="Review" step="1 / 3" />
      <div className={styles.body}>
        <p className={styles.heading}>Is this dinner out?</p>
        <div className={styles.box}>
          <p className={styles.label}>Penny&apos;s guess</p>
          <p className={styles.figure}>Restaurants</p>
          <p className={styles.small}>
            You&apos;ve paid Luca&apos;s Kitchen 4 times, always after 7 pm.
          </p>
        </div>
        <p className={styles.fieldLabel}>The message Penny read</p>
        <p className={styles.message}>
          FIRSTBANK: Card 4417 used for $58.40 at LUCAS KITCHEN on Nov 19, 8:52 PM. Not you? Call
          the number on your card.
        </p>
        <dl className={styles.kv}>
          <div>
            <dt>Amount</dt>
            <dd>−$58.40</dd>
          </div>
          <div>
            <dt>Account</dt>
            <dd>Card 4417</dd>
          </div>
        </dl>
        <div className={styles.buttons}>
          <span className={styles.button}>Yes, Restaurants</span>
          <span className={styles.buttonOutline}>Pick another category</span>
        </div>
      </div>
    </>
  );
}

export function DraftScreen() {
  return (
    <>
      <Header title="Ask Penny" />
      <div className={styles.chat}>
        <p className={styles.bubble}>Save $1,500 for a bike by June</p>
        <div className={styles.draft}>
          <div className={styles.draftTop}>
            <span className={styles.strong}>Draft goal</span>
            <span className={styles.tag}>Not saved</span>
          </div>
          <p className={styles.figureMd}>$1,500</p>
          <dl className={styles.kv}>
            <div>
              <dt>Name</dt>
              <dd>Bike</dd>
            </div>
            <div>
              <dt>By</dt>
              <dd>Jun 30, 2027</dd>
            </div>
            <div>
              <dt>Each month</dt>
              <dd>About $215</dd>
            </div>
          </dl>
          <p className={styles.note}>Nothing is saved until you confirm.</p>
          <span className={styles.button}>Confirm</span>
          <div className={styles.pair}>
            <span className={styles.buttonOutline}>Edit</span>
            <span className={styles.buttonOutline}>Discard</span>
          </div>
        </div>
      </div>
    </>
  );
}
