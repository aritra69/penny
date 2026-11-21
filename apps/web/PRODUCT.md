# Product

<!-- impeccable:product-schema 1 -->

## Platform

web (this app is Penny's marketing site; the product itself is the Android app in `apps/mobile`)

## Users

People anywhere who want to see where their money goes without typing every expense in. Worldwide first; India comes later. Android first.

## Product Purpose

Penny reads bank texts and payment-app alerts on the phone, sorts each one into a transaction, and shows what's left to spend this month, budgets, bills, goals and net worth. You can ask it questions in plain words. The landing page explains this and points people to the build.

## Positioning

Read-only and encrypted: Penny never moves money, financial data is stored on Penny's servers with amounts, merchants and notes encrypted, one-time codes are dropped on the phone before anything else happens, and AI only drafts — nothing saves until the user confirms. Open source (MIT).

## Capabilities and Constraints

- In development; not on the Play Store yet. No waitlist backend exists.
- Plans (from `apps/mobile/lib/plans.ts`): subscription $1.99 a month, or your own OpenAI key for $14.99 once.
- Setup: plan, OpenAI key (own-key plan only), pick apps to read, notification access and bank SMS, confirm accounts, import the last 6 months.
- "Penny" is a working name.

## Brand Commitments

The design system in `packages/design-system`: ink on paper, black rules instead of shadows, square corners, one highlighter accent (#E8F542) for _now_ and _chosen_ only, Inter + Inter Tight ExtraBold, ink-drawn illustrations. The user asked for a site that does not look AI-generated.

## Evidence on Hand

- Illustrations: `docs/images/hero.jpg`, `apps/mobile/assets/illustrations/*.png`.
- No users, testimonials, press or download numbers exist. Never invent them. App screen previews use labelled sample data.

## Product Principles

1. Read-only over the user's money.
2. Data is stored on Penny's servers, encrypted. Never claim it stays on the phone or that Penny can't read it: the server holds the key.
3. AI drafts, the user confirms.
4. Show the source wherever Penny guesses.
