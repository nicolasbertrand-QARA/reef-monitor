# Reef Monitor: screenshot and App Preview video redesign brief

## Why this is the second-highest-leverage change

App Store screenshots drive conversion rate (CVR). Doubling CVR is equivalent to doubling installs at constant impressions. Apple's research on the App Store carousel and our independent ASO experience indicate:

- Users decide to install (or scroll past) in under 1.5 seconds.
- The first 3 screenshots are the only ones visible in search results. They are also the only ones autoplayed in the carousel before requiring a swipe.
- App Preview videos (autoplay muted) lift CVR by 20 to 40 % when present (none of Reef Monitor's competitors ship one as of June 2026).
- Captions baked into the screenshot art are indexed for App Store search (since iOS 17).

The current Reef Monitor screenshots have three problems:

1. **The bottom ~45 % of every screenshot is empty background with a tiny slogan**. Above the fold in the carousel cuts off mid-phone; the slogan is below the fold and invisible at thumbnail scale.
2. **The headline ("Tous vos paramètres en un coup d'œil") sits below the phone mockup**. In the search-result thumbnail (~140 px tall), the headline is below the visible area entirely.
3. **French only across both 6.5" and 6.7"**. Apple serves the listing's language to the user's storefront; en-US users see French screenshots which depresses CVR severely.

There is also no App Preview video. That is the single largest free lift available.

## The new screenshot system

### Layout principles

- The headline goes in the **top 33 %** of the image, large enough to read at ~150 px height.
- The benefit caption goes immediately under the headline in 30 to 50 % of the height.
- The phone mockup occupies the **bottom 50 %** with the most visually striking screen content visible at the top edge of the mockup (so users see the screen before they see the home indicator).
- No empty bottom band.
- Each screenshot has a status pill (e.g. "Free", "Offline", "No account") in a corner for trust at a glance.

### 10-screenshot carousel order

The first three are the only ones visible in search results. Optimize them ruthlessly.

1. **HOOK** (visible in search)
   - Headline: "Track your reef. Beat the drift."
   - Caption: "100 % free  ·  Offline  ·  No account"
   - Visual: a low-opacity reef photo silhouette behind a slightly tilted phone showing the dashboard with all-green statuses
   - This is the screenshot that decides if the user even looks at #2.

2. **PARAMETERS** (visible in search)
   - Headline: "15 reef parameters. One screen."
   - Caption: "Water chemistry. Nutrients. Mini trends on every card."
   - Visual: dashboard screen, slightly larger than the hook, with visible parameter cards (temperature, salinity, pH, alkalinity, calcium, magnesium, nitrate, phosphate).
   - This is the "does it cover what I need" sell.

3. **SALIFERT TIMERS** (visible in search)
   - Headline: "Built-in Salifert kit timers."
   - Caption: "30s shake. 3min wait. Haptic ping. No more squinting."
   - Visual: ParamInput screen with the countdown timer prominent.
   - This is the "this app gets me" sell. Salifert users will install immediately.

4. **TRENDS**
   - Headline: "Spot alk drift before your SPS does."
   - Caption: "Alkalinity consumption rate. dKH per day. Trend zones. Threshold lines."
   - Visual: Trends screen with the consumption rate prominent.

5. **MULTI-TANK**
   - Headline: "Every tank, one app."
   - Caption: "Multi-tank with one-tap switching."
   - Visual: dashboard with the tank switcher dropdown open.

6. **DOSING**
   - Headline: "See what your Kalk really does."
   - Caption: "Doses and water changes overlaid on trends."
   - Visual: Trends screen with dosing markers visible on the chart.

7. **PRIVACY**
   - Headline: "Your data stays on your device."
   - Caption: "100 % offline. No account. No tracking. Ever."
   - Visual: a simple lock icon over a faded screenshot, with the offline pill.

8. **LANGUAGES**
   - Headline: "Speaks your language. Literally."
   - Caption: "15 languages out of the box."
   - Visual: language carousel of flag icons.

9. **CSV EXPORT**
   - Headline: "Your data, exportable."
   - Caption: "CSV export and import. No lock-in."
   - Visual: settings screen highlighting the export button.

10. **CLOSER**
    - Headline: "Free. Forever."
    - Caption: "No paywall. No ads. No subscription. Built by a reef keeper."
    - Visual: app icon centered with the CTA "Download Reef Monitor".

### Caption keyword loading

App Store search now indexes text rendered in screenshots (since iOS 17). Bake these keywords into captions:

- "Salifert timer" (screenshot 3)
- "alkalinity consumption rate" (screenshot 4)
- "nano reef" / "SPS" (screenshot 5 caption variant)
- "reef tank trends" (screenshot 4 alternate)
- "offline reef app" (screenshot 7)

Avoid stuffing. One target keyword per caption is enough.

## App Preview video (the biggest single CVR lift)

App Preview is the autoplay-muted video that replaces the first screenshot when present. Specs:
- Format: H.264 .mov or .mp4
- Resolution: 1080x1920 (portrait)
- Length: 15 to 30 seconds
- Frame rate: 30 fps
- Codec: H.264 high profile
- Audio: optional (most users autoplay muted; still record sparse ambient audio for the minority who unmute)

Apple allows up to 3 App Previews per device size per locale. Localize per language; do NOT machine-translate the audio.

### 30-second storyboard (en-US, master)

| t       | Visual                                                    | Caption (burned-in)                | Audio (optional)        |
|---------|-----------------------------------------------------------|------------------------------------|-------------------------|
| 0 to 2  | App icon scales from center over a soft reef-tank photo background | "Reef Monitor"                  | ambient water sound     |
| 2 to 5  | Cut to dashboard. Parameter cards animate in left to right | "15 parameters, one tap each"    | tap sounds, subtle      |
| 5 to 9  | User taps the nitrate card. Modal opens. Salifert timer starts. | "Salifert timers built in"    | timer tick (low)        |
| 9 to 14 | Cut to trends screen. Chart line draws on. Consumption rate appears. | "Catch alk drift before your SPS does" | none |
| 14 to 18 | Compare-mode stacked sparklines fade in.                 | "Compare any parameters"           | none                    |
| 18 to 22 | Tank switcher opens. User taps tank #2.                  | "Multiple tanks. One app."         | tap                     |
| 22 to 26 | Settings screen. Language carousel cycles 5 flags.        | "15 languages. Fully offline."     | none                    |
| 26 to 30 | App icon. Tagline.                                       | "Free. No ads. No tracking."       | gentle close            |

### Localized versions (week 2 to 4)

Re-cut with localized captions for: fr-FR, de-DE, ja-JP first (highest-leverage). Then es-ES, it-IT, nl-NL, pt-BR, pl-PL.

The screen recordings themselves stay in EN for v1: the captions do the heavy lifting. (Recording 15 sets of screen footage is not cost-effective in v1; revisit once installs justify it.)

## Implementation in `scripts/generate-screenshots.mjs`

The current SVG-based generator is the right architecture. It needs three changes:

1. **Locale loop**: iterate over `['en-US', 'en-GB', 'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'nl-NL', 'pt-BR', 'pl-PL', 'ja-JP']` and produce one set per locale into `appstore/screenshots/<locale>/`.
2. **Headline-first layout**: invert the y-axis budget. Headline at y=180, caption at y=280, phone mockup centered between y=400 and y=2500.
3. **Status pill**: top-right corner of every screenshot. "Free", "Offline", "No account" rotated per screenshot.
4. **Reef photo background**: add a `<image>` element with an opacity of 0.08 to 0.12, sized to fit the full screenshot. Use a royalty-free reef photo, or commission a $50 one from a reefer photographer.

Sketch of the layout change (header):

```svg
<!-- Background reef photo at low opacity -->
<image x="0" y="0" width="${W}" height="${H}" href="reef-bg.jpg" opacity="0.10" preserveAspectRatio="xMidYMid slice"/>

<!-- Status pill top-right -->
<rect x="${W - 280}" y="80" width="240" height="56" rx="28" fill="${GREEN_BG}"/>
<text x="${W - 160}" y="115" font-family="Manrope" font-size="22" fill="${GREEN}" font-weight="700" text-anchor="middle">100% FREE</text>

<!-- Headline -->
<text x="${W/2}" y="280" font-family="Manrope" font-size="84" fill="${TEXT}" font-weight="800" text-anchor="middle">Track your reef.</text>
<text x="${W/2}" y="380" font-family="Manrope" font-size="84" fill="${ACCENT}" font-weight="800" text-anchor="middle">Beat the drift.</text>

<!-- Caption -->
<text x="${W/2}" y="460" font-family="Manrope" font-size="34" fill="${TEXT2}" text-anchor="middle">Free · Offline · No account</text>

<!-- Phone mockup starts at y=600 -->
```

## Asset checklist

- 6.5" (1242x2688) set in EN: 10 screenshots
- 6.7" (1290x2796) set in EN: 10 screenshots
- 6.5" set in FR: 10 screenshots
- 6.7" set in FR: 10 screenshots
- (repeat for DE, ES, IT, NL, PT-BR, PL, JA)
- App Preview video EN (30s, 1080x1920 H.264)
- App Preview video FR
- App Preview video DE
- App Preview video JA
- 1024x1024 marketing icon for App Store Connect (already done)
- 2 alternate icons for Product Page Optimization A/B test (future)

## Effort estimate

- Refactor screenshot generator (1 locale loop + new layout): 4 hours
- Source one royalty-free reef photo: 30 min
- Regenerate 10 sets x 2 device sizes x 10 locales = 200 PNGs: automated, 5 min run
- Storyboard and record App Preview video EN: 4 hours
- Localize App Preview captions to 4 locales: 1 hour
- ASC upload of 200 PNGs and 4 videos: 1 hour

Total: about 11 hours of focused work for an estimated 30 to 60 % CVR lift across the entire listing.

End of brief.
