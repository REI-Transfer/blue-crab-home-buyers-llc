/**
 * lib/config.ts — Single server-side env var read point.
 * Import this ONLY in server components (layout.tsx, page.tsx, API routes).
 * Never import in "use client" components — pass values as props instead.
 */
const config = {
  // Brand
  companyName:     process.env.COMPANY_NAME     ?? "Your Home Buyers",
  phoneDisplay:    process.env.PHONE_DISPLAY     ?? "(800) 000-0000",
  phoneHref:       process.env.PHONE_HREF        ?? "8000000000",
  accentColor:     process.env.ACCENT_COLOR      ?? "#2563eb",
  headerBgColor:   process.env.HEADER_BG_COLOR   ?? "#ffffff",
  logoUrl:         process.env.LOGO_URL          ?? "",

  // Owner / personalization
  ownerName:       process.env.OWNER_NAME        ?? "",
  headshotUrl:     process.env.HEADSHOT_URL      ?? "",
  foundersCaption: process.env.FOUNDERS_CAPTION  ?? "",

  // Landing layout (Grumpy Hare style, same as Rivoir). Defaults are Blue Crab's own files
  // in /public/images, so the page needs no new settings; each can be overridden from Vercel.
  // Both Herbert images are cut-outs of his real photos (FOUNDERS_PHOTO_URL / HEADSHOT_URL),
  // background removed only. Never generated people.
  headerLogoUrl:   process.env.HEADER_LOGO_URL   || "/images/logo-trimmed.webp",  // LOGO_URL trimmed, white -> transparent
  ownerCutoutUrl:  process.env.OWNER_CUTOUT_URL  || "/images/herbert-hero.webp",  // cut-out of FOUNDERS_PHOTO_URL
  teamPhotoUrl:    process.env.TEAM_PHOTO_URL    || "/images/herbert-team.webp",  // cut-out of HEADSHOT_URL
  heroBgUrl:       process.env.HERO_BG_URL       || "/images/hero-house.webp",    // webp of the advertorial's adv-home-exterior.jpg
  teamBgUrl:       process.env.TEAM_BG_URL       || "/images/team-bg.webp",       // webp of the advertorial's adv-empty-rooms.jpg

  // Hero
  headline:        process.env.HEADLINE          ?? "Sell Your House Fast For Cash",
  headlineAccent:  process.env.HEADLINE_ACCENT   ?? "",
  subheadline:     process.env.SUBHEADLINE       ?? "No fees. No repairs. Cash offer in 24 hours.",

  // Service areas — JSON array of {id, centerLat, centerLng, radiusMiles}. Must be
  // valid circle objects or "[]". NEVER a state-name array like ["Wisconsin"].
  serviceAreas:    process.env.SERVICE_AREAS     ?? "[]",
  // Market name for advertorial copy ("Wisconsin"); empty renders "the areas we serve".
  marketName:      process.env.MARKET_NAME       ?? "",
  smsKeyword:      process.env.SMS_KEYWORD       ?? "OFFER",

  // Trust indicators
  stat1Value:      process.env.STAT_1_VALUE      ?? "1,000+",
  stat1Label:      process.env.STAT_1_LABEL      ?? "Homes Purchased",
  stat2Value:      process.env.STAT_2_VALUE      ?? "10+",
  stat2Label:      process.env.STAT_2_LABEL      ?? "Years in Business",
  stat3Value:      process.env.STAT_3_VALUE      ?? "24 Hrs",
  stat3Label:      process.env.STAT_3_LABEL      ?? "Cash Offer",

  // SEO
  // `||` (not `??`): Blue Crab's META_TITLE / META_DESCRIPTION are set but EMPTY, which
  // left the browser tab with no title.
  metaTitle:       process.env.META_TITLE        || "Blue Crab Home Buyers | Sell Your House Fast For Cash",
  metaDescription: process.env.META_DESCRIPTION  || "Get a fair written cash offer for your house in 24 hours. No repairs, no showings, no fees.",

  // Footer
  // `||`: both are set but EMPTY on Blue Crab, which made the footer links point nowhere.
  privacyPolicyUrl: process.env.PRIVACY_POLICY_URL || "/privacy",
  termsUrl:         process.env.TERMS_URL           || "/terms",

  // Survey disqualification — comma-separated property type IDs to hard-disqualify
  disqualifiedPropertyTypes: process.env.DISQUALIFIED_PROPERTY_TYPES ?? "mobile-home,land,other",

  // Webhook (server-side only — never exposed to browser)
  webhookUrl:      process.env.WEBHOOK_URL ?? "",

  // Style flag — when IBUYKC_STYLE === "true" (default for new clients via the
  // env-schema default), render the iBuyKC style: white page, accent only on
  // buttons, dark text, enlarged logo, flexible owner/team photo. The ~17
  // projects deploying rei-survey-template@main have no IBUYKC_STYLE env → falsy
  // → byte-identical legacy style.
  useIbuykcStyle:  process.env.IBUYKC_STYLE === "true",

  // Motivation list flag — when MOTIVATION_V2 === "true" (default for new clients
  // via the env-schema default), both forms (v1 homepage + /v3) render William's
  // v2 reason-for-selling list, including the "No reason / seeing what my house is
  // worth" hard-disqualifier. Existing rei-survey-template@main projects without
  // this env → falsy → byte-identical legacy reason list, no disqualifier.
  motivationV2:    process.env.MOTIVATION_V2 === "true",
} as const

export default config
export type Config = typeof config