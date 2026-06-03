# Reef Monitor: App Store Connect change list

This is the exact, field-by-field list of changes to apply in App Store Connect (https://appstoreconnect.apple.com) to ship the ASO playbook.

All changes here are metadata-only and DO NOT require a binary resubmission (except for the App Preview video, which does require a new submission). Metadata changes are typically live within a few hours.

## 1. App Information (per app, not per version)

Path: My Apps > Reef Monitor > App Information.

### Bundle ID
- No change. Still `com.nicolasbertrand.reefmonitor`.

### Primary Category
- **Change to: Utilities**
- Rationale: matches Aquarimate and Reef Buddy. Strongest category for parameter-tracking utilities. Avoids "Lifestyle" trap that splits hobby intent into too many subcategories.

### Secondary Category
- **Change to: Health & Fitness**
- Rationale: reaches users browsing health-tracking apps; aligns with "tracker" intent searches.

### Content Rights
- Confirm: "Does your app contain, show, or access third-party content?" → No (we do not).

### Age Rating
- Confirm: 4+. No changes.

### App Store information URL (general developer site)
- **Change to: `https://nicolasbertrand-qara.github.io/reef-monitor/`** (the new landing page).

### Privacy Policy URL
- **Change to: `https://nicolasbertrand-qara.github.io/reef-monitor/privacy.html`** (the privacy policy was moved off the index page).
- Verify the page resolves before saving. Test in a private browser window.

### Subscription Group / In-App Purchases
- Confirm: none. Keep clean.

## 2. App Privacy

Path: My Apps > Reef Monitor > App Privacy.

This must be re-confirmed annually. Confirm the current declaration is:
- "Data Not Collected"
- For every category: not collected, not linked, not used for tracking.

If anything is currently flagged as collected, fix it. The "100% offline, no data collection" claim is core to our positioning; an inconsistency here is grounds for review rejection AND loses the privacy USP.

## 3. iOS App > 1.4.0 (or next version)

Path: My Apps > Reef Monitor > iOS App > [version].

### Default localization
- **Change to: English (US)** if not already.
- Default localization fills in any locale we have not customized. Make sure it is the best-optimized one.

### Name
- **Change to (en-US default and any non-customized locales)**:
  ```
  Reef Monitor: Saltwater Log
  ```
- 27 chars. Validation: paste into ASC, confirm no error.

### Subtitle
- **Change to**:
  ```
  Salifert · pH · dKH · Salinity
  ```
- 30 chars. The `·` is a U+00B7 middle dot, allowed by ASC.

### Promotional Text (170 chars max)
- **Change to**:
  ```
  Built by a reef keeper, for reef keepers. Salifert timers, alk consumption rate, NO3:PO4 ratio, 15 languages. 100% offline. No ads, no account, no tracking.
  ```
- This field updates without re-review. Use it for time-bound messaging later (e.g. "v1.5 just shipped with ICP import").

### Description
- **Replace with the contents of**: `appstore/listings/en-US.md` (the "Description" code block).

### Keywords (100 chars max, hidden)
- **Change to**:
  ```
  reef,tank,aquarium,marine,coral,nano,sps,lps,alkalinity,calcium,magnesium,nitrate,phosphate,icp,kalk
  ```
- 99 chars. No spaces. Singular forms. No words from Name or Subtitle.

### Support URL
- **Change to**: `https://nicolasbertrand-qara.github.io/reef-monitor/`
- Apple accepts the landing page as a valid support URL (it links to the contact email in the footer).

### Marketing URL (optional)
- **Change to**: `https://nicolasbertrand-qara.github.io/reef-monitor/`

### What's New in This Version (release notes, 4000 chars max)
- **Replace with the contents of**: `appstore/listings/en-US.md` (the "Release notes" code block).

### Screenshots
- **Required**: at minimum a 6.7" iPhone set (1290x2796) and a 6.5" set (1242x2688).
- **Recommended**: also iPad 12.9" set, even if the binary does not support iPad. ASC will allow you to upload an iPhone screenshot in iPad slot if iPad is not enabled.
- Apple permits 3 to 10 screenshots per device size. Upload all 10 per the new screenshot brief (`docs/screenshot-brief.md`).

### App Previews (video)
- **Add 1 to 3 App Preview videos per device size, per locale**.
- Specs: 1080x1920 H.264, up to 30 seconds.
- See `docs/screenshot-brief.md` section "App Preview video" for the storyboard.

### Routing App Coverage File
- Skip. Not applicable.

## 4. Localizations (one per market)

In ASC, scroll to the "Localizations" panel inside the version detail. For each of the 10 storefronts to add, click "Add Language" and fill in:
- Name, Subtitle, Promotional Text, Description, Keywords, Support URL, Marketing URL, What's New, Screenshots, App Previews.

The values for each market are in:
- `appstore/listings/en-US.md`
- `appstore/listings/en-GB.md`
- `appstore/listings/fr-FR.md`
- `appstore/listings/de-DE.md`
- `appstore/listings/es-ES.md`
- `appstore/listings/it-IT.md`
- `appstore/listings/nl-NL.md`
- `appstore/listings/pt-BR.md`
- `appstore/listings/pl-PL.md`
- `appstore/listings/ja-JP.md`

For each locale's Privacy URL and Support URL, use the same English-language URL (we have not yet shipped localized landing pages; that is a M2 task).

## 5. In-App Events (post-rollout)

Path: My Apps > Reef Monitor > In-App Events.

Create at least one running In-App Event after the metadata changes go live. Examples:
- "Free, always" (evergreen, badge "Promo" or "Quest", short description: "100% free, offline, no account.")
- "30-day reef logging challenge" (recurring monthly, badge "Challenge")

Each event is shown in the App Store search results, on the Today tab, and on the product page. Drives 5 to 15 % extra installs per event.

## 6. Custom Product Pages

Path: My Apps > Reef Monitor > [version] > Custom Product Pages.

Create variants for the high-leverage acquisition channels:
- `reef-monitor-salifert` (hero screenshot 3, captioned "Salifert timers"). Use this URL when posting to Salifert users on Reef2Reef.
- `reef-monitor-nano` (hero screenshot 5, captioned "Built for nano reef"). Use when posting on Nano-Reef.com.
- `reef-monitor-sps` (hero screenshot 4, captioned "Alkalinity consumption rate"). Use for SPS-focused content.

Each custom URL is tagged for attribution: you can see in ASC Analytics which custom page each install came from. This is the cheapest paid-acquisition-style attribution available without running Apple Search Ads.

## 7. Apple Search Ads (optional, defer until conversion >= 5%)

Path: ads.apple.com.

Do NOT start Apple Search Ads until the listing converts at >= 5 % (per the ASO playbook section 11 "Anti-patterns"). Once that threshold is hit:
- Start with a $50/day budget on the en-US storefront.
- Target keywords: salifert, reef tank log, nano reef tracker, ICP test log, alkalinity tracker.
- Avoid bidding on "aquarium" (Aquarimate has $-loaded the auction).
- Monitor cost per install (CPI). Pause keywords with CPI > $1.50.

## 8. App Analytics (track these metrics)

Path: My Apps > Reef Monitor > App Analytics.

Set up weekly review of:
- Impressions
- Conversion rate (impressions to installs)
- Installs by storefront
- Search impressions by keyword (via Apple Search Ads insights if running, or via a third-party ASO tool otherwise)
- Crashes (target: 0)

Compare CVR before and after each change. Roll back any change that drops CVR by more than 10 % after 7 days.

## 9. Order of operations (do not skip this)

To minimize risk:

1. **Day 1**: change Name + Subtitle + Promotional Text + Description + Keywords for **en-US only**. Save. This is reversible if anything breaks.
2. **Day 1**: update Privacy Policy URL to point to the new `privacy.html`. Save.
3. **Day 2 to 3**: monitor en-US installs and CVR. Apple takes up to 24 hours to index new metadata.
4. **Day 4**: if CVR holds or improves, roll out the same fields to en-GB.
5. **Day 5 to 7**: roll out fr-FR (using `appstore/listings/fr-FR.md`).
6. **Week 2**: de-DE, nl-NL.
7. **Week 3**: es-ES, it-IT, pt-BR, pl-PL.
8. **Week 4**: ja-JP (after getting the native review from a Japanese reefer).
9. **Week 5+**: upload new screenshots and App Preview videos as they are produced.

If at any step CVR drops > 10 %, pause, A/B-test, do not proceed.

## 10. App ID placeholder

The landing page (`docs/index.html`) and press kit (`docs/press.html`) reference an App Store ID of `id6753145061`. This is a placeholder.

**Action required**: replace with your real App Store ID. To find it:
1. In ASC, go to My Apps > Reef Monitor > App Information.
2. The "Apple ID" field shows the numeric ID.
3. Search and replace `id6753145061` in `docs/index.html`, `docs/press.html`, and `docs/sitemap.xml` if present.

End of change list.
