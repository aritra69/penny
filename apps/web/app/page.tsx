import type { Plan } from "./actions";
import { Hero } from "./components/hero";
import { DraftScreen, Phone, ReviewScreen } from "./components/screens";
import styles from "./page.module.css";

const GITHUB = "https://github.com/aritra69/penny";

const isPlan = (v: unknown): v is Plan =>
  v === "subscription" || v === "own-key" || v === "undecided";

/** A Stripe Payment Link turns the founding-member section on. */
const founding = () => {
  const url = process.env.FOUNDING_CHECKOUT_URL;
  const ok = url && /^https:\/\//.test(url);
  return ok ? { url, refundBy: process.env.FOUNDING_REFUND_BY || null } : null;
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string | string[]; ref?: string | string[] }>;
}) {
  const { plan, ref } = await searchParams;
  const offer = founding();

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.wordmark} aria-label="Penny">
            penny
            <span className={styles.wordmarkDot} aria-hidden />
          </span>
          <a href={GITHUB} className={styles.headerLink}>
            Open source on GitHub
          </a>
        </div>
      </header>

      <main>
        <Hero
          defaultPlan={isPlan(plan) ? plan : undefined}
          refCode={typeof ref === "string" && /^[a-z0-9]{6,16}$/.test(ref) ? ref : undefined}
          foundingOpen={Boolean(offer)}
        />

        <section className={styles.film} aria-labelledby="film-title">
          <div className={styles.filmCopy}>
            <h2 id="film-title" className={styles.filmTitle}>
              The whole idea in 24 seconds.
            </h2>
            <p className={styles.filmBody}>
              Sound on. Captions are there if you&apos;d rather not.
            </p>
          </div>
          <video
            className={styles.video}
            controls
            playsInline
            preload="none"
            poster="/video/penny-24s.jpg"
            width={1920}
            height={1080}
          >
            <source src="/video/penny-24s.mp4" type="video/mp4" />
            <track
              kind="captions"
              src="/video/penny-24s.en.vtt"
              srcLang="en"
              label="English"
              default
            />
          </video>
        </section>

        <section className={styles.band} aria-labelledby="trust-title">
          <div className={styles.bandInner}>
            <h2 id="trust-title" className={styles.h2}>
              Penny can look. It can&apos;t touch.
            </h2>
            <div className={styles.trust}>
              <figure className={styles.shot}>
                <Phone label="Penny's Review screen. Sample data.">
                  <ReviewScreen />
                </Phone>
                <figcaption className={styles.caption}>
                  <strong>It shows its working.</strong>
                  When Penny guesses, you see the message it read.
                </figcaption>
              </figure>
              <figure className={styles.shot}>
                <Phone label="Penny drafting a savings goal. Sample data.">
                  <DraftScreen />
                </Phone>
                <figcaption className={styles.caption}>
                  <strong>You confirm everything.</strong>
                  AI can draft a goal or an entry. Nothing saves until you tap Confirm.
                </figcaption>
              </figure>
              <ul className={styles.promises}>
                <li>
                  <strong>
                    <mark className={styles.highlight}>Your data stays on your phone.</mark>
                  </strong>
                  No Penny server ever sees your transactions.
                </li>
                <li>
                  <strong>Read-only.</strong>
                  It can&apos;t send money or pay a bill. Ever.
                </li>
                <li>
                  <strong>One-time codes are dropped first.</strong>
                  On the phone, before anything else. Never stored or sent.
                </li>
                <li>
                  <span>
                    To sort a message, Penny sends only its text to OpenAI. The code is public under
                    MIT: <a href={GITHUB}>check it on GitHub</a>.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {offer ? (
          <section id="founding" className={styles.founding} aria-labelledby="founding-title">
            <div className={styles.foundingCopy}>
              <h2 id="founding-title" className={styles.foundingTitle}>
                Pay once. Get Penny first.
              </h2>
              <p className={styles.foundingLede}>
                Founding members fund the last stretch of building Penny. You skip the waitlist and
                never pay again.
              </p>
              <ul className={styles.perks}>
                <li>
                  <strong>First builds go to you,</strong> before the waitlist.
                </li>
                <li>
                  <strong>No subscription.</strong> You use your own OpenAI key, a fraction of a
                  cent per message.
                </li>
                <li>
                  <strong>Full refund</strong> any time before launch
                  {offer.refundBy
                    ? `, or automatically if Penny isn't on Google Play by ${offer.refundBy}`
                    : ""}
                  .
                </li>
              </ul>
            </div>
            <div className={styles.checkout}>
              <p className={styles.checkoutName}>Founding member</p>
              <p className={styles.price}>
                $14.99<span className={styles.priceEvery}> once</span>
              </p>
              <a href={offer.url} className={styles.pay}>
                Become a founding member
              </a>
              <p className={styles.note}>
                This pays for Penny itself. Penny never touches your bank money.
              </p>
              <p className={styles.fine}>Card payment through Stripe.</p>
            </div>
          </section>
        ) : null}
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.wordmarkSmall}>
            penny
            <span className={styles.wordmarkDot} aria-hidden />
          </span>
          <span>Open source under MIT. Penny is a working name.</span>
          <a href={GITHUB}>GitHub</a>
        </div>
      </footer>
    </>
  );
}
