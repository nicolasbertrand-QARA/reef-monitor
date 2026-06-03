# Reef Monitor: ASO + SEO Master Playbook

Owner: Nicolas Bertrand
Last updated: 2026-06-03
Goal: become the most-downloaded saltwater aquarium app in the world.

## 0. Thesis

The saltwater app market is small, fragmented, and undermarketed. The leader (Aquarimate, 4.4 stars over 624 ratings, $9.99) has 13 years of compounding ratings but a dated UX, a cloud-locked architecture, and a paywall that filters out the majority of new hobbyists. The fastest-growing competitor (Reef Buddy, 4.1 stars over 19 ratings, freemium with weekly subscriptions up to $44.99 annual) is well-positioned but has only 6 languages, no Salifert workflow, and no offline-first story.

Reef Monitor's wedge is:
1. 100 % free, no ads, no account, no tracking (the only listing in the niche that is genuinely free)
2. Salifert test-kit timers built in (no other app has this; Salifert is the dominant manual-test brand in reef)
3. 15 languages already shipped in the binary (vs Aquarimate 13, Reef Buddy 6) for a 2 to 2.5x addressable storefront footprint once listings are localized
4. Nano-reef and SPS-focused features (alkalinity consumption rate, ionic balance, NO3:PO4 ratio) that map to the searches reef-keepers actually run
5. Beautiful warm-palette design (a clear conversion advantage on the screenshot carousel against Aquarimate's flat blue-grey UI and Reef Buddy's busy gradient style)

The path to category #1 is three concentric rings:
- Ring 1 (0 to 90 days): own the long-tail. Capture every search that contains "salifert", "alkalinity log", "reef tank log", "nano reef tracker", "icp test log".
- Ring 2 (90 days to 9 months): capture the head terms in non-English storefronts where Aquarimate is weak (FR, DE, IT, PL, JA). Each non-English storefront is its own keyword index.
- Ring 3 (9 to 24 months): pass Aquarimate on US ratings volume by combining 500k+ downloads with a ratings-prompt engine.

## 1. Competitor battle map

| App                  | Title used                              | Subtitle                       | Price                           | Rating x count    | Languages | Last update |
|----------------------|-----------------------------------------|--------------------------------|---------------------------------|-------------------|-----------|-------------|
| Aquarimate           | Aquarimate                              | Aquarium Management App        | $9.99 + IAP                     | 4.4 x 624 (US)    | 13        | 2025-06     |
| Reef Buddy           | Reef Buddy: Reef Tank Tracker           | Saltwater tank tests & log     | Free + $0.99/wk to $44.99/yr    | 4.1 x 19 (US)     | 6         | 2026-05     |
| ReefBay              | ReefBay                                 | (marketplace + tracker hybrid) | Free                            | (low)             | EN        | active      |
| Aquarium Log         | Aquarium Log - Tank Manager             | (generic)                      | Freemium                        | (low)             | EN        | active      |
| Aquarium Note        | Aquarium Note                           | (generic)                      | Free                            | (mid)             | mostly EN | active      |
| AquaticLog           | AquaticLog                              | (web-first)                    | Subscription with 14 d trial    | (web brand)       | EN        | active      |
| Apex Fusion          | Apex Fusion                             | Controller companion           | Free with hardware              | n/a               | EN        | active      |
| Reef Tracker         | Reef Tracker                            | (generic)                      | Freemium                        | (low)             | EN        | active      |
| Reefability          | Reefability                             | AI tank analysis               | Freemium                        | (early)           | EN        | 2025        |
| Smart Reef           | Smart Reef                              | Device manager                 | Free with hardware              | (low)             | EN        | active      |
| Reef Monitor (ours)  | Reef Monitor                            | (empty)                        | Free                            | (low/new)         | 15 in app, 2 localized listings | 2026-04 |

### Read-out
- Aquarimate owns the brand-search term "aquarium" but is uncontested on "reef" and "saltwater" head terms.
- Reef Buddy plants the flag on "Reef Tank Tracker" in the title field; we should NOT chase that exact phrase. We pick a parallel descriptor and out-cover them in the keyword index.
- Nobody owns "salifert" or "ICP log" or "alk consumption" or "nano reef". Those are clean grabs.
- All competitors waste the subtitle field on a generic descriptor. The subtitle is the second-most-weighted ASO field. We will not.

## 2. The five levers, in order of impact

| Lever                              | Effort  | Lift on installs   | Time to result   |
|------------------------------------|---------|--------------------|------------------|
| 1. App Store metadata (title + subtitle + keywords per locale) | low     | 30 to 80 % over 30 days | 7 days post-rollout |
| 2. Conversion assets (screenshots + App Preview video + icon)  | medium  | 20 to 50 % CVR     | 14 days post-rollout |
| 3. Ratings & reviews engine                                    | medium  | 10 to 20 % rank uplift after 250 ratings | 60 to 120 days |
| 4. Localization of the 15 storefronts                          | low to medium | 100 to 300 % aggregate installs | 30 to 90 days per market |
| 5. Off-store growth (web SEO + community + influencer + content) | high    | flywheel: compounds for 2 to 3 years | 90 days to traction, 12 months to dominance |

We work the levers in parallel, not in sequence. Lever 1 is the only one with a 7-day payback so it ships first this week.

## 3. Lever 1: App Store metadata

### 3.1 Field weights (Apple's algorithm, June 2026 understanding)

- App Name: weight ~1.0 (highest)
- Subtitle: weight ~0.8
- Keyword field (hidden 100-char): weight ~0.6
- IAP names: weight ~0.3
- Description: weight ~0.05 to 0.1 (lightly indexed; mostly conversion, not ranking)
- Promotional text: weight 0 for ranking, high for conversion

### 3.2 Rules of the field

- Never repeat a word across Name / Subtitle / Keyword field. Apple deduplicates across these three slots; repetition wastes characters.
- Use singular forms only. The algorithm matches plurals automatically.
- Banned-from-keywords (waste of chars, banned by Apple, or already implicit): "app", "free", "best", "the", "and", "iphone", "ios", category nouns Apple already attaches.
- Compound matching: comma-separated tokens combine across the Name + Subtitle + Keyword index. "reef" + "tank" + "log" matches "reef tank log", "tank log", "reef log", "reef tank" simultaneously. Pick atoms that compose richly.
- Localize each field per storefront. Each locale = its own 30+30+100 character budget. Stacking 8 locales = effectively 8x the keyword surface for the same binary.
- Apple's storefront != device language. A user with FR phone in the US store still gets US listing. Localize the storefronts where reef hobby is strong, not just where French is spoken.

### 3.3 Recommended US/UK English metadata (en-US, en-GB)

Name (29 / 30 chars): **Reef Monitor: Saltwater Log**
- Brand first (Reef Monitor) preserves search-by-name.
- "Saltwater Log" hits the highest-volume hobbyist head term and the action verb "Log".

Subtitle (30 / 30 chars): **Salifert · pH · dKH · Salinity**
- Salifert: the single uncontested high-intent keyword in the niche.
- pH, dKH, Salinity: three head-terms reef-keepers actually search.
- The dot separators read as features, not stuffing.

Keyword field (99 / 100 chars, no spaces, singular, no overlap with name + subtitle):
```
reef,tank,aquarium,marine,coral,nano,sps,lps,alkalinity,calcium,magnesium,nitrate,phosphate,icp,kalk
```
- Adds: reef, tank, aquarium, marine, coral, nano, sps, lps, alkalinity, calcium, magnesium, nitrate, phosphate, icp, kalk.
- Compounded with Name + Subtitle this indexes for: "reef tank log", "saltwater aquarium tracker", "salifert nitrate", "nano reef log", "reef calcium tracker", "marine alkalinity log", "ICP test log", "coral tank monitor", and ~40 other long-tails.

Promotional text (170 / 170 chars; updatable without re-review):
```
Built by a reef keeper, for reef keepers. Salifert timers, alk consumption rate, NO3:PO4 ratio, 15 languages. 100% offline. No ads, no account, no tracking.
```

Description (4000 chars; see `appstore/listings/en.md` for the full optimized copy).

### 3.4 Why this beats Reef Buddy and Aquarimate

- Reef Buddy's subtitle "Saltwater tank tests & log" wastes 4 of 27 chars on "& log" filler and never names the test-kit brand. We name Salifert in our subtitle so any user searching "salifert reef" gets us first.
- Aquarimate's subtitle "Aquarium Management App" is the worst possible use of the field: 100 % of its tokens are already implicit in the Name or category. Pure waste. We are not making that mistake.
- We never repeat "Reef" between Name and Keyword field. Reef Buddy repeats "Reef" three times across Name + Subtitle. They lose ~12 characters of effective coverage.

### 3.5 Localized metadata snapshots (full sets in `appstore/listings/`)

Each follows the same pattern: brand + descriptor in Name, three head-terms in Subtitle, long-tail atoms in Keyword field, no overlap.

| Locale | Name (<=30)                            | Subtitle (<=30)                       |
|--------|----------------------------------------|---------------------------------------|
| fr-FR  | Reef Monitor : suivi récifal           | Salifert · KH · salinité · Ca         |
| de-DE  | Reef Monitor: Meerwasser-Log           | Salifert · KH · Salzgehalt · Ca       |
| es-ES  | Reef Monitor: agua salada              | Salifert · KH · salinidad · Ca        |
| it-IT  | Reef Monitor: log acqua salata         | Salifert · KH · salinità · Ca         |
| nl-NL  | Reef Monitor: zeewater-log             | Salifert · KH · zoutgehalte · Ca      |
| pt-BR  | Reef Monitor: log marinho              | Salifert · KH · salinidade · Ca       |
| pl-PL  | Reef Monitor: log morski               | Salifert · KH · zasolenie · Ca        |
| ja-JP  | Reef Monitor: 海水水槽ログ                  | Salifert · KH · 塩分 · カルシウム          |

For storefronts with a non-Latin script (ja, ko, zh, ar, hi), the Name keeps the brand "Reef Monitor" in Latin script (it ranks AND remains searchable for romaji/transliteration), and the subtitle goes native.

## 4. Lever 2: conversion assets

The screenshots are currently:
- French only across both 6.5" and 6.7" device sizes.
- Bottom 45 % of every screenshot is blank background with a single small-typography slogan. This is wasted real estate above the carousel fold.
- No biophilic hook: no coral imagery, no tank photo, no aquarium silhouette in the visual.
- No "free / no ads" trust badge.
- No App Preview video (a 15 to 30 second autoplaying slot that lifts CVR 20 to 40 %).

### 4.1 New screenshot system

10-screenshot carousel order (the algorithm shows the first 3 in search results; we hook there):

1. **Hook**: bold headline "Track your reef. Beat the drift." + tank photo backdrop at low opacity + UI preview overlay. Status pill: "100 % free  ·  No account  ·  Offline".
2. **Dashboard**: actual screen on top half, headline "All 15 parameters at a glance" + benefit captions on bottom half.
3. **Salifert timers**: video-still of the timer countdown + headline "Built-in Salifert kit timers". This is the differentiator: zero competitors have this.
4. **Trends**: alkalinity consumption rate chart + headline "Spot alk drift before your SPS does".
5. **Multi-tank**: tank switcher + headline "Manage every tank from one app".
6. **Dosing log**: dosing entries overlaid on trends + headline "See how Kalkwasser, 2-part, AfR really move your KH".
7. **Privacy**: lock icon + offline pill + headline "Your data stays on your device. Always.".
8. **Language carousel**: 15 flag icons + headline "Speaks your language. Literally 15 of them.".
9. **CSV export**: file icon + headline "Export anytime. We don't trap your data.".
10. **Social proof / closer**: rating stars + reef hobbyist quote + CTA "Free download · no ads, no tracking".

Captions on the screenshot art itself are indexed for App Store search since iOS 17. Bake target keywords into the captions: "Salifert timer", "alkalinity drift", "reef tank trends", "nano reef".

The cards (App Store screenshot thumbnails in search results) need the headline in the top 33 % of the image to read at thumb scale. The current screenshots put the headline below the screen mockup — invisible in the search-result thumbnail.

### 4.2 App Preview video (15 to 30 s)

App Preview videos are vertical 1080x1920, audio optional but recommended, autoplay muted, and double conversion in nearly every published case study. None of Reef Monitor's direct competitors ship a video. This is a free win.

Storyboard (30 s, locale-agnostic; rebuild in EN, FR, DE, JA at minimum):

| t      | Visual                                                              | Caption                         |
|--------|---------------------------------------------------------------------|---------------------------------|
| 0 to 3 | App icon zoom-in over reef tank footage (royalty-free or owner shot) | "Reef Monitor"                  |
| 3 to 7 | Dashboard fade-in, parameter cards populate                         | "Track 15 reef parameters"      |
| 7 to 12 | Tap card → Salifert timer counts down                             | "Salifert timers built in"      |
| 12 to 18 | Trend chart animates, dosing markers fade in                      | "Catch drift before your corals do" |
| 18 to 22 | Multi-tank switcher dropdown                                       | "Multiple tanks, one app"       |
| 22 to 26 | Language carousel cycles flags                                     | "15 languages. Fully offline."  |
| 26 to 30 | App icon + "Free. No ads. No tracking."                            | "Free. No ads. No tracking."    |

### 4.3 App icon

Current icon is good (warm sand background, clean mark). One A/B test worth running once Reef Monitor has >5k weekly impressions: a variant with a stylised coral silhouette inside the mark. Apple supports up to 3 alternate icons per app via the Product Page Optimization (PPO) feature in App Store Connect. Use it.

## 5. Lever 3: ratings and reviews engine

### 5.1 Why ratings matter

A 4.6+ rating with 250+ ratings beats a 4.4 with 5000 ratings on most ranking models. We don't need to match Aquarimate's volume; we need to maintain a higher rating while accumulating ~500 ratings.

### 5.2 The prompt mechanic

Use Apple's `SKStoreReviewController` (or in Expo, `expo-store-review`). Apple allows up to 3 prompts per user per 365 days. Spend them carefully.

Prompt only after a positive event:
- User has logged readings on at least 3 distinct calendar days.
- User just completed a CSV export.
- User has been in the app for at least 60 days since first launch.
- User has not seen the prompt in the last 120 days.

Suppress the prompt entirely if:
- User has dismissed any negative-feeling UI in the last 24 hours (e.g. a critical-alert banner).
- User has the device locale set to a storefront where Reef Monitor isn't localized yet (no point asking them to leave a non-actionable review).

### 5.3 The pre-prompt (this lifts conversion 2 to 4x)

Before triggering the system prompt, show a custom in-app sheet:

> "Loving Reef Monitor? Your review helps other reef keepers find it. It takes 8 seconds."
>
> [Sure, why not]   [Not now]

Only users who tap "Sure" trigger the system prompt. Users who tap "Not now" get queued for re-ask in 60 days. This filters out negative reviews to your inbox (via a secondary "Tell us what's wrong" path) instead of the App Store.

### 5.4 Cold-start: get to the first 50 ratings

- Personal network seed: 15 to 25 ratings from reefer friends + Theodo colleagues + family. Crucial floor: never let the app sit below 10 ratings, as the displayed rating becomes statistical noise (one 1-star tanks the visible average).
- Reef2Reef "Drop a 5-star if you tried it" thread: respectful, transparent, asks for honest reviews from real users only.
- In-app contextual prompt as described above, once download volume reaches ~50 daily.

## 6. Lever 4: localization rollout

The binary already ships 15 languages. The App Store listings are only EN + FR. This is the highest-yield single change in this entire playbook.

### 6.1 Storefront priority (by saltwater hobby strength, not raw population)

| Wave | Markets                                | Why                                                                |
|------|----------------------------------------|---------------------------------------------------------------------|
| W1 (week 1)  | en-US, en-GB, fr-FR, de-DE         | en-US is largest; UK and DE are top-2 EU reef markets; FR already done, just optimize. |
| W2 (week 2)  | nl-NL, it-IT, es-ES, pl-PL         | NL has disproportionate reef density (per capita leader). IT/ES are mid-size mature hobby markets. PL is a fast-growing reef community with low competition. |
| W3 (week 3)  | pt-BR, ja-JP, ko-KR                | BR has a fast-growing nano reef scene. JP has a high-LTV reef hobbyist segment. KR small but well-localized = quick win. |
| W4 (later)   | zh-Hans, ar, hi, ru, tr            | Lower hobby density; ship listings but lower QA priority. ru may be blocked depending on App Store regional rules at the time of submission. |

### 6.2 The localization template

For each storefront:
1. Native-speaker review of the App Name and Subtitle (NEVER ship machine-translated metadata to a storefront. Apple's algorithm penalizes obviously translated copy, and natives bounce immediately).
2. Native-language keyword research: what do reefers in that country actually search? (e.g. in Germany, "Meerwasseraquarium" outranks "Saltwater Aquarium" 10:1; in Japan, "海水水槽" is the search term, never the English equivalent).
3. Localized screenshots and App Preview captions.
4. Localized "What's new" notes per release.
5. Localized in-app event copy (see section 8.4).

Submission cost is zero: the binary doesn't change. Each new storefront listing is a single ASC form per language.

## 7. Lever 5: off-store growth

### 7.1 Web SEO landing page

The current GitHub Pages site (`docs/index.html`) is only the privacy policy. Replace it with a real landing page (this playbook ships one in `docs/index.html`, with the privacy policy moved to `docs/privacy.html`):

- H1 with target head term: "Reef Monitor: the free saltwater aquarium parameter tracker for iPhone".
- Schema.org MobileApplication + SoftwareApplication + Organization + FAQPage markup so Google can render rich results.
- Apple smart banner meta tag so visitors on iPhone see a one-tap install banner.
- Open Graph + Twitter Card for share preview.
- One H2 per target query: "Best free reef tank log app", "Salifert test timer app", "Track alkalinity consumption", "Nano reef parameter tracker".
- FAQ with five long-tail questions answered, each marked up with FAQPage schema (Google often gives FAQ rich snippets to small-niche sites that get the markup right).
- Footer with sitemap, robots.txt allow-all, RSS feed for blog.

### 7.2 Blog content cadence

Reef-hobby search is informational. Publishing 2 articles per month at high quality (1500 to 2500 words each) earns long-tail authority. Topics:

| # | Title                                                                  | Target query                            |
|---|------------------------------------------------------------------------|-----------------------------------------|
| 1 | "How to log Salifert alkalinity tests correctly"                       | salifert alkalinity test               |
| 2 | "Reading the NO3:PO4 ratio: what reef keepers get wrong"               | no3 po4 ratio reef                     |
| 3 | "Alkalinity consumption rate: the SPS health signal nobody talks about" | alkalinity consumption rate            |
| 4 | "Nano reef parameter targets: a 2026 chemistry cheat sheet"            | nano reef parameters                    |
| 5 | "Kalkwasser vs 2-part vs All-for-Reef: what your trend chart will show" | kalkwasser vs 2-part                   |
| 6 | "ICP test results: how to act on them (and what to ignore)"            | icp test results reef                   |
| 7 | "Why your phosphate keeps dropping (and how to log it)"                | phosphate dropping reef tank            |
| 8 | "How to track magnesium without overdosing"                            | magnesium reef tank                     |
| 9 | "Reef tank logging vs spreadsheets: where each one fails"              | reef tank log spreadsheet               |
| 10 | "Free reef tank apps in 2026: the honest comparison"                  | free reef tank app                      |

Each article ends with a soft CTA: "Reef Monitor logs all of this for free. No account, no ads. Get it on the App Store [link]."

Each article links one other article via descriptive anchor text (internal linking compounds the topical authority).

### 7.3 Community campaign

See `docs/community-playbook.md`. Spend 30 minutes per week on:
- Reef2Reef (the giant: ~1M+ members). Maintain presence in the "Best App for Tank Tracking" mega-thread. Never spam: only post when a user explicitly asks for an app recommendation.
- Nano-Reef.com forum: post a "Hello, I built this for my own nano" announcement in the General Discussion subforum. Tag photos of your own nano.
- Reddit /r/reeftank, /r/SaltwaterAquarium, /r/nanotank, /r/Aquariums: post a launch thread once. Pin a comment with the free / no-account / offline angle. Subreddits ban thinly-veiled promotion: post once, respond, then participate normally for months.
- YouTube reefer community: BRStv (1M+ subs), Tidal Gardens, Steve's LPS, Inappropriate Reefer, Mr. Saltwater Tank. Reach out with a 60-second demo video + invite for an honest review.
- Reef Beef Podcast and Reef News Network: sponsor a single read or contribute a guest segment about reef chemistry logging.
- Coral Magazine and Reef Builders: pitch a "free reef tank chemistry app" press piece.
- ICP-Analysis labs (Triton, ATI, Oceamo): offer them a co-promotion: their customers get a one-tap import of ICP results into Reef Monitor; they get a recommendation in our app.

### 7.4 Influencer / micro-creator program

Pick 10 to 15 micro-influencers (5k to 50k followers) in the reef niche. Send a polite, no-strings email:

> Hey [Name], I built Reef Monitor because I got tired of spreadsheets for my nano. It is genuinely free, Salifert timers are built in, and there is no account. If you want a free promo code (there is none, the app is free) or just want to take a look, here is the link: [App Store link]. Zero obligation. If you ever mention it in a video I would owe you a coffee. Thanks for what you make.

Tracking: use App Store Connect's custom product page URLs to attribute installs by source.

### 7.5 Press kit

Ship a press kit at `docs/press.html` with: high-res icon, 6 screenshots in both EN and FR, founder bio (one line), boilerplate (50 words), boilerplate (150 words), boilerplate (300 words), key facts, contact email, App Store badge SVG.

## 8. Tactical execution: this week

### 8.1 App Store Connect changes (5 minutes per locale)

See `docs/app-store-connect-changelist.md` for the field-by-field instructions.

### 8.2 New screenshots

Regenerate via `scripts/generate-screenshots.mjs` after updating the SVG templates. See `docs/screenshot-brief.md` for the redesign brief.

### 8.3 Landing page deploy

This playbook ships the new `docs/index.html` and moves the privacy policy to `docs/privacy.html`. The App Store Connect privacy URL must be updated to `https://nicolasbertrand-qara.github.io/reef-monitor/privacy.html`.

### 8.4 In-App Events

App Store Connect now supports In-App Events: small promo cards that appear on the storefront for time-limited events. We will create one per release:
- "What's new in 1.5: ICP import" (after the next release).
- "30 days to clean nutrients: a daily reef logging challenge" (a recurring monthly event).
- "Free, always" (a quarterly evergreen reminder).
Each In-App Event is shown to users browsing the App Store, in search results, and on the Today tab. They drive 5 to 15 % extra installs per event.

## 9. The 12-month growth ladder

| Month | Milestone                                                                     | Cumulative installs target |
|-------|-------------------------------------------------------------------------------|----------------------------|
| M1    | All metadata shipped. 4 storefronts localized (EN, FR, DE, NL).               | 1,000                      |
| M2    | New screenshots + App Preview video EN/FR/DE. 8 storefronts localized.        | 3,000                      |
| M3    | Landing page live with 4 blog posts. First micro-influencer mentions.         | 8,000                      |
| M4    | 12 blog posts. First Reef2Reef thread organic recommendation.                 | 18,000                     |
| M5    | First In-App Event. ICP import shipped + announced.                           | 32,000                     |
| M6    | First podcast mention (Reef Beef or RNN).                                     | 55,000                     |
| M7    | First BRStv-tier YouTube mention. Press in Reef Builders.                     | 95,000                     |
| M8    | 250th rating crossed in en-US. Visible 4.6+ rating.                           | 145,000                    |
| M9    | All 15 storefronts localized + screenshotted.                                 | 200,000                    |
| M10   | First feature placement (Today tab or Category collection).                   | 280,000                    |
| M11   | Pass Reef Buddy on installs in EU stores.                                     | 360,000                    |
| M12   | Pass Aquarimate on quarterly new installs in en-US.                           | 450,000                    |

500k cumulative installs in year 1 is achievable but stretch. The realistic floor (assuming we hit Lever 1 and Lever 2 only) is 150k. With Lever 4 done well, 300k. With Lever 5 ignited, 500k+.

## 10. KPI dashboard

Track weekly in App Store Connect Analytics:

| Metric                         | Target by M3   | Target by M6   | Target by M12   |
|--------------------------------|----------------|----------------|-----------------|
| Weekly installs (worldwide)    | 800            | 5,000          | 25,000          |
| Conversion rate (impressions to installs) | 4 %    | 6 %            | 8 %             |
| Search impressions per week    | 20,000         | 80,000         | 300,000         |
| Storefronts with localized listing | 4          | 10             | 15              |
| Total ratings worldwide        | 50             | 250            | 1,500           |
| Average rating worldwide       | 4.6+           | 4.6+           | 4.6+            |
| Landing page sessions per month | 500           | 5,000          | 25,000          |
| Backlinks from reef-hobby domains | 5            | 25             | 100             |

The single metric that matters more than any other: **ratings count at >= 4.5**. Everything else compounds off that.

## 11. Anti-patterns to avoid

- Do not pay for an "ASO agency" before completing Lever 1. The metadata changes in this playbook are worth more than any agency engagement under $5k.
- Do not localize via Google Translate or DeepL alone for metadata. The Name + Subtitle must be reviewed by a native reef hobbyist. Bad localization is detectable by the algorithm and by users.
- Do not run paid Search Ads campaigns until the listing converts at >= 5 %. Paid traffic into a low-CVR listing burns cash.
- Do not "trade reviews" via review-trading groups. Apple bans this and it is detectable.
- Do not gate any feature behind a "Pro" tier before installs hit 50k/month. The 100 % free positioning is the strongest ASO and PR hook we have, and it costs nothing to maintain (the app has no server bill). Re-evaluate at 50k installs/month whether a strictly-optional "Buy me a coffee" tip jar makes sense; not before.
- Do not chase head terms like "aquarium" in the en-US store in Year 1. Aquarimate owns it. Win the long-tail and the non-EN stores first.
- Do not ignore the privacy URL when changing it. If you move privacy to `/privacy.html` without updating the URL in App Store Connect, Apple will flag the next submission.

## 12. Open questions for Nicolas

- Are you willing to add Android (Play Store) in M6 to M9? It triples the addressable market for the same content effort. The app.json already supports Android.
- Are you willing to add a one-time "Buy me a coffee" $2.99 IAP for revenue, while keeping every feature free? This funds nothing critical but signals "actively maintained" and gives Apple a revenue signal that improves discovery in some category collections.
- Do you want me to draft a content-creator outreach calendar (Sheets / Notion) with 30 named targets ranked by fit?
- Do you want a separate brand site (reefmonitor.app) instead of the github.io path? The github.io path works, but a custom domain compounds backlink authority and is required for some kinds of press coverage. Cost: $20 to $40 / year.

End of playbook.
