import { SiteHeader } from "@/components/landing/site-header"
import { Hero } from "@/components/landing/hero"
import {
  StatsBand,
  WeBuySection,
  TeamBand,
  ProcessSection,
  SituationsSection,
  FinalCta,
  SiteFooter,
} from "@/components/landing/sections"
import { CompareSection, FaqSection } from "@/components/landing/compare-faq"
import { OfferModal } from "@/components/landing/cta"
import { buildBrand } from "@/lib/brand"

// Layout modeled on homebuyer.grumpyhare.com, ported from Rivoir (offer.rivoirsolutions.com,
// REI-Transfer/rivoir-solution-llc #18). Every CTA opens the two-step form in a pop-up
// (OfferModal); the hero card starts the same form in place.
export default function HomePage() {
  const brand = buildBrand()
  return (
    <main className="v2-light bc-landing min-h-screen bg-white">
      <style
        dangerouslySetInnerHTML={{
          __html: `
/* Scope the shadcn design tokens to LIGHT values on this page (the template's :root
   defaults are dark). --accent / --primary inherit Blue Crab's navy from the layout. */
.v2-light {
  --background: #FFFFFF; --foreground: #0F1D2F;
  --card: #FFFFFF; --card-foreground: #0F1D2F;
  --popover: #FFFFFF; --popover-foreground: #0F1D2F;
  --secondary: #F5F7FA; --secondary-foreground: #0F1D2F;
  --muted: #F5F7FA; --muted-foreground: #5A6B7D;
  --destructive: #DC2626; --destructive-foreground: #FFFFFF;
  --border: #E2E8F0; --input: #FFFFFF; --ring: #1d283b;
  background-color: #FFFFFF; color: #0F1D2F;
}
`,
        }}
      />
      <SiteHeader brand={brand} />
      <Hero brand={brand} />
      <StatsBand brand={brand} />
      <WeBuySection brand={brand} />
      <TeamBand brand={brand} />
      <ProcessSection />
      <SituationsSection />
      <CompareSection brand={brand} />
      <FaqSection brand={brand} />
      <FinalCta />
      <SiteFooter brand={brand} />
      <OfferModal brand={brand} />
    </main>
  )
}
