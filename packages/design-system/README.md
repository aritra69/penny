# @repo/design-system

Penny's design system: tokens, a Tailwind preset for NativeWind, and React Native components, animated with Moti. Everything visual in the app comes from here.

The source is the **Penny · Screens** design canvas (29 screens: Home, Spending, Goals, Review, Bills, Net worth, Ask Penny, onboarding). Values here are copied from it, not approximated.

## Using it

```tsx
import { Amount, BigFigure, Button, Text, useMotion } from "@repo/design-system";
```

- Import from `@repo/design-system` only. The one other entry point is `@repo/design-system/gallery` (dev screen).
- The app's `metro.config.js` compiles `@repo/design-system/global.css`, its `tailwind.config.js` uses `@repo/design-system/tailwind-preset` and scans this package's `src`, and it bundles the fonts natively (Inter 400/500/600/700, Inter Tight 700/800, in `apps/mobile/assets/fonts`, family names matching their file names).
- Open **Home → "Open the design system gallery"** in a dev build to see every component with example data.

## Principles

1. **Ink on paper.** Black on white. All text is black, including secondary lines; hierarchy comes from size, weight and the display face, never from grey.
2. **Borders, not shadows.** Boxes are drawn with black rules: 1px for rows, 1.5 for boxes and secondary buttons, 2.5 for what's selected, inputs and chart lines. No shadows, no elevation.
3. **Square.** Radius is 0 everywhere. The only round things are dots.
4. **One accent, used sparingly.** The highlighter (`highlight`, #E8F542) marks _now_ and _chosen_: the active tab dot, today's column on the pace chart, a selected row. Never for text, buttons or decoration.
5. **Money is the headline.** Figures are set in Inter Tight ExtraBold. Every amount goes through `<Amount>` so signs, grouping and hiding stay consistent.
6. **Nothing saves without the user.** Anything the AI prepares arrives as a `DraftCard` with Confirm, Edit and Discard.

## Tokens

### Colour

| Token              | Value   | Use                                                           |
| ------------------ | ------- | ------------------------------------------------------------- |
| `background`       | #FFFFFF | Paper: every screen and box                                   |
| `foreground`       | #000000 | Ink: all text, rules, icons, primary fills                    |
| `primary`          | #000000 | Primary buttons, the notice bar, the tab bar, user bubbles    |
| `muted`            | #F2F2F2 | Info notes, pressed rows, image placeholders                  |
| `muted-foreground` | #6B6B6B | Placeholders and disabled hints only (5.3:1 on paper)         |
| `highlight`        | #E8F542 | The accent (see principle 4). Ink on it, never white.         |
| `line-muted`       | #D4D4D4 | Skeleton bars                                                 |
| `faint`            | #A3A3A3 | Dashed "add" outlines, disabled borders. Not for text.        |
| `destructive`      | #B91C1C | Form errors only. An addition: the screens have no error red. |

Classes: `bg-background`, `text-foreground`, `border-foreground`, `bg-highlight`, … Hex mirrors for SVG and animation: `colors` in `src/lib/theme.ts`. The canvas also explored marigold, vermilion and cobalt accents (`accentOptions`); highlighter is the chosen default.

Penny has no dark mode. The app pins itself to light mode natively (`AppCompatDelegate.MODE_NIGHT_NO` on Android, `UIUserInterfaceStyle` Light on iOS), and `global.css` defines light tokens only. Don't add `dark:` classes.

### Type

On Android each weight is its own font file, so pair a size class with a family class: `text-body font-sans-semibold`. Or use `<Text variant="…">`, which does both.

| Variant             | Face / size / line             | Use                                           |
| ------------------- | ------------------------------ | --------------------------------------------- |
| `figure-xl`         | Inter Tight 800 · 48/50 · −1   | The screen's one number (left to spend)       |
| `figure-lg`         | Inter Tight 800 · 44/50 · −1   | Amount inputs                                 |
| `figure-md`         | Inter Tight 800 · 34/40 · −0.5 | Draft card amount                             |
| `title`             | Inter Tight 800 · 28/34 · −0.5 | Screen titles                                 |
| `heading`, `figure` | Inter Tight 800 · 22/28        | Section titles; box and card figures          |
| `headline`          | Inter 700 · 17/22              | Sheet titles, step names                      |
| `body-lg`           | Inter 400 · 16/24              | Ask Penny replies, big button labels          |
| `body`              | Inter 400 · 15/22              | Default                                       |
| `strong`            | Inter 600 · 15/22              | Row titles, questions                         |
| `label`             | Inter 700 · 14/20              | Figure labels, links                          |
| `caption`           | Inter 400 · 13/19              | Row sublines, field labels (`caption-strong`) |
| `small`             | Inter 400 · 12/17              | Box sublines, footnotes                       |
| `micro`             | Inter 400 · 11/15              | Chart labels, the chat disclaimer             |

### Space, size, borders

- Screen gutter `px-gutter` (20). Header icon buttons sit 12 from the edge.
- Tap targets: 44 minimum (`h-touch w-touch`); buttons 48 (`default`) or 56 (`lg`); rows 60–64.
- Gaps: 14 between boxes, 10 between paired buttons, 24–32 between sections.
- Borders: `border` (1), `border-1.5`, `border-2.5`, `border-3` (active tab bar).

### Motion

Moti, through `MotiView`, `MotiText` and `AnimatedPressable` from this package (they accept `className`). Take transitions from `useMotion()`, which returns instant transitions when the user turned animations off.

| Preset   | What                      | Used by                                      |
| -------- | ------------------------- | -------------------------------------------- |
| `press`  | 90ms timing               | Button and box press scale (0.97–0.98)       |
| `enter`  | 240ms ease-out, 12dp rise | Chat bubbles, draft cards, notice bar        |
| `select` | Spring, no visible bounce | Tab dot, checkmarks, choice marks, underline |
| `fill`   | 650ms ease-out            | Progress fills, the pace line drawing in     |

Motion confirms what happened; nothing loops, bounces for show or delays reading.

## Components

| Component                                        | Screens                                   | Notes                                                                                                             |
| ------------------------------------------------ | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `Text`                                           | all                                       | Variants above; legacy `h1`–`h4`, `muted` map onto them                                                           |
| `Icon`                                           | all                                       | 39 line icons copied from the canvas; `iconNames` lists them                                                      |
| `Wordmark`                                       | splash                                    | "penny" with a square full stop; light or dark                                                                    |
| `Button`                                         | all                                       | `default` (grey when disabled, fills with ink when enabled), `outline`, `inverse`, `ghost`, `link`, `destructive` |
| `IconButton`                                     | headers, steppers, composer               | `ghost`, `outline`, `solid`; `label` required; optional `dot`                                                     |
| `ScreenHeader`                                   | every pushed screen and sheet             | back or close, title, step counter, actions                                                                       |
| `TabBar`, `PENNY_TABS`                           | main screens                              | Black bar, highlighter dot on the current tab                                                                     |
| `UnderlineTabs`                                  | Spending                                  | Switches views of the same data                                                                                   |
| `MonthSwitcher`                                  | Spending                                  |                                                                                                                   |
| `NoticeBar`                                      | Home                                      | One per screen, for what needs the user now                                                                       |
| `InfoNote`                                       | drafts, details                           | Explains what Penny checked                                                                                       |
| `ProgressBar`                                    | import, budgets, goals                    | Optional pace tick                                                                                                |
| `Amount`, `HiddenAmountsProvider`                | all money                                 | Real minus, lakh grouping for INR, compact "₹3L", hide mode                                                       |
| `BigFigure`                                      | Home, Spending, Net worth                 |                                                                                                                   |
| `PaceChart`                                      | Home, Spending                            | Spent line draws in; today column in highlighter                                                                  |
| `SectionHeader`                                  | Home, Review, Goals                       | Title with a dotted link or a note                                                                                |
| `StatBox`                                        | Home, Goals                               | Bordered box with a corner illustration                                                                           |
| `ListRow`                                        | Home, Review, Spending, settings          | Flat row between rules                                                                                            |
| `KeyValueRow`, `SplitStat`                       | drafts, details                           |                                                                                                                   |
| `BudgetRow`                                      | Spending, onboarding budgets              | Over budget = full bar + bold status, no red                                                                      |
| `StepList`                                       | onboarding steps                          | Dark or light                                                                                                     |
| `Timeline`                                       | free month paywall                        | Dated steps down a rule: solid after what is done, dotted after what is to come                                   |
| `TextField`, `Input`, `Label`                    | sign-in, new goal, API key                | Underlined, value set large; label always above. `code` for a pasted key                                          |
| `AmountField`, `Stepper`                         | edit budget, new goal, onboarding budgets | `Stepper` takes a `value` to show between − and +                                                                 |
| `Checkbox`, `CheckRow`                           | edit budget, privacy                      |                                                                                                                   |
| `SelectRow`                                      | onboarding apps and accounts              | Highlighter fill when picked                                                                                      |
| `StatusRow`                                      | onboarding permissions                    | Reports a switch: highlighter and tick when on, a small button when not                                           |
| `Mark`                                           | plan, trial ending                        | A short label on highlighter for _now_: "Free trial", "2 days left"                                               |
| `ChoiceGroup`, `ChoiceCard`, `PictureChoice`     | new goal, goal draft, review item         | Radio group; 2.5 border + black mark when chosen                                                                  |
| `LabeledDivider`                                 | sign-in                                   | "or with email"                                                                                                   |
| `ChatBubble`, `AssistantMessage`, `ChatComposer` | Ask Penny                                 |                                                                                                                   |
| `DraftCard`                                      | Ask Penny drafts                          | The only way AI output gets saved                                                                                 |
| `ReviewCard`                                     | Review inbox                              | Penny's guess gets the primary button                                                                             |

### Not built yet

- **Bills calendar** (month grid with due-day dots) and **bill rows** from Bills / Bill detail.
- **Detail charts** on Category, Goal detail, Holding and Net worth (bar and value-over-time charts).
- **Illustrations.** The hero, goal and box pictures live in the design canvas; `StatBox` and `PictureChoice` take an image source once they're added to `apps/mobile/assets`.
- **App icon** in Penny's style.

## Writing

- Plain words from the user's side: "2 transactions need a look", "Bills to go", "Not counted as spending".
- Say what Penny did and why: "No duplicate found. Checked HDFC and SBI from 14 to 16 Nov."
- Buttons say what happens: "Confirm", "Create goal", "Keep reading in the background". The quiet way out is a dotted link: "Discard", "Skip, start from today".
- Money: `− ₹386` (real minus and a space), `+ ₹899` only where direction matters, `₹3L` / `₹40k` only in tight boxes.
- No emoji, no exclamation marks.
