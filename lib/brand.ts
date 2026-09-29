/**
 * lib/brand.ts — serializable brand object for the landing components (same shape idea as
 * Rivoir's). buildBrand() is server-only: it reads lib/config and hands plain values to the
 * client components, which import ONLY the `Brand` type from here.
 */
import config from "./config"

export interface Brand {
  /** Legal name ("Blue Crab Home Buyers, LLC"): footer, TCPA consent. */
  companyName: string
  /** Reader-friendly name for body copy ("Blue Crab Home Buyers"). BRAND_NAME overrides it. */
  displayName: string
  phoneDisplay: string
  phoneHref: string
  logoUrl: string
  ownerName: string
  /** Short line in the owner's own words (FOUNDERS_CAPTION). */
  foundersCaption: string
  ownerCutoutUrl: string
  teamPhotoUrl: string
  heroBgUrl: string
  teamBgUrl: string
  headline: string
  headlineAccent: string
  subheadline: string
  marketName: string
  stat1Value: string
  stat1Label: string
  stat2Value: string
  stat2Label: string
  stat3Value: string
  stat3Label: string
  // Threaded to the two-step survey card (these settings are server-only).
  serviceAreas: Array<{ id: string; centerLat: number; centerLng: number; radiusMiles: number }>
  disqualifiedPropertyTypes: string[]
}

function displayNameFrom(legal: string): string {
  if (process.env.BRAND_NAME) return process.env.BRAND_NAME
  const noSuffix = legal.replace(/,?\s+(LLC|L\.L\.C\.|INC\.?|CORP\.?)$/i, "").trim()
  if (noSuffix !== noSuffix.toUpperCase()) return noSuffix
  return noSuffix.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase())
}

/** Server-only. */
export function buildBrand(): Brand {
  let serviceAreas: Brand["serviceAreas"] = []
  try { serviceAreas = JSON.parse(config.serviceAreas) } catch {}
  return {
    companyName: config.companyName,
    displayName: displayNameFrom(config.companyName),
    phoneDisplay: config.phoneDisplay,
    phoneHref: config.phoneHref,
    logoUrl: config.headerLogoUrl,
    ownerName: config.ownerName,
    foundersCaption: config.foundersCaption,
    ownerCutoutUrl: config.ownerCutoutUrl,
    teamPhotoUrl: config.teamPhotoUrl,
    heroBgUrl: config.heroBgUrl,
    teamBgUrl: config.teamBgUrl,
    headline: config.headline,
    headlineAccent: config.headlineAccent,
    subheadline: config.subheadline,
    marketName: config.marketName,
    stat1Value: config.stat1Value,
    stat1Label: config.stat1Label,
    stat2Value: config.stat2Value,
    stat2Label: config.stat2Label,
    stat3Value: config.stat3Value,
    stat3Label: config.stat3Label,
    serviceAreas,
    disqualifiedPropertyTypes: config.disqualifiedPropertyTypes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  }
}

/** The market phrase for copy, e.g. "Metro Atlanta"; "your area" when MARKET_NAME is empty. */
export function marketPhrase(brand: Brand): string {
  return brand.marketName ? brand.marketName : "your area"
}
