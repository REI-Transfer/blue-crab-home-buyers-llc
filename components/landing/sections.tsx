"use client";

import { Home, Wrench, CalendarCheck, DollarSign, Phone } from "lucide-react";
import { marketPhrase, type Brand } from "@/lib/brand";
import { OrangeCta, openOfferModal } from "./cta";
import { OwnerCaption } from "./hero";

/* ---------- Stats band: white cards overlapping the bottom of the hero ---------- */
export function StatsBand({ brand }: { brand: Brand }) {
  // Only what Blue Crab's own settings say. STAT_*_VALUE are empty on purpose (no invented
  // numbers), so a card shows its label as the headline; a value shows only when one is set.
  const icons = [Wrench, CalendarCheck, DollarSign];
  const stats = [
    { value: brand.stat1Value, label: brand.stat1Label },
    { value: brand.stat2Value, label: brand.stat2Label },
    { value: brand.stat3Value, label: brand.stat3Label },
  ]
    .map((s, i) => ({ ...s, icon: icons[i] }))
    .filter((s) => s.label.trim());
  if (!stats.length) return null;

  return (
    // Phones: even navy padding above/below, no overlap (Herbert's photo sits right above).
    // md+: the cards overlap the bottom of the hero like the reference.
    <section className="relative bg-[color:var(--bc-navy)] py-4 md:pt-0 md:pb-16">
      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-3 px-4 md:-mt-20 md:grid-cols-3 md:gap-6 md:px-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-4 rounded-xl bg-white px-5 py-4 shadow-xl md:flex-col md:justify-center md:gap-0 md:px-4 md:py-8 md:text-center"
          >
            <s.icon className="h-7 w-7 shrink-0 text-[color:var(--bc-blue)] md:mb-3 md:h-8 md:w-8" />
            {s.value.trim() ? (
              <div>
                <div className="font-display text-4xl leading-none text-[color:var(--bc-navy)] md:text-6xl">{s.value}</div>
                <div className="mt-2 text-xs font-bold uppercase tracking-wide text-[color:var(--bc-navy)] md:text-sm">{s.label}</div>
              </div>
            ) : (
              <div className="font-display text-[1.7rem] leading-[1.05] text-[color:var(--bc-navy)] md:text-4xl">{s.label}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- "We Buy Houses In Metro Atlanta" ---------- */
export function WeBuySection({ brand }: { brand: Brand }) {
  const market = marketPhrase(brand);
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-5 text-center md:px-6">
        <h2 className="font-display text-5xl leading-none text-[color:var(--bc-navy)] md:text-7xl">
          We Buy Houses In {market}
        </h2>
        <p className="font-display mx-auto mt-5 max-w-3xl text-xl leading-snug text-[color:var(--bc-navy)] md:text-2xl">
          Sell your house in {market} to us and skip the entire listing process. No fees, no commissions,
          no repairs to make. Getting an offer is 100% free.
        </p>
        <p className="mx-auto mt-6 max-w-3xl text-left text-base leading-relaxed text-[#3b4a5c] md:text-center md:text-lg">
          {brand.displayName} buys houses directly from homeowners for cash, as-is. No showings, no open houses, and
          no waiting on a buyer&apos;s bank to approve a loan. Tell us about the house, get a fair cash offer, and
          pick the closing date that works for you.
        </p>
        <div className="mt-8">
          <OrangeCta />
        </div>
      </div>
    </section>
  );
}

/* ---------- "TRUSTED" team band: Herbert's real photo over a room ---------- */
export function TeamBand({ brand }: { brand: Brand }) {
  const market = marketPhrase(brand);
  const photo = brand.teamPhotoUrl || brand.ownerCutoutUrl;
  const ownerAlt = brand.ownerName ? `${brand.ownerName}, ${brand.displayName}` : brand.displayName;
  return (
    <section className="relative overflow-hidden bg-[#1b1d21]">
      {brand.teamBgUrl && (
        <img src={brand.teamBgUrl} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/60 to-[#1d283b]/90" />

      <div className="relative mx-auto grid max-w-6xl items-end gap-4 px-5 md:px-6 lg:grid-cols-[440px_1fr] lg:gap-12">
        {photo && (
          <div className="relative order-2 flex justify-center lg:order-1 lg:justify-start">
            <img src={photo} alt={ownerAlt} loading="lazy" className="block h-[300px] w-auto object-contain object-bottom md:h-[460px]" />
            <OwnerCaption
              brand={brand}
              dark
              className="absolute bottom-3 left-1/2 w-[92%] max-w-[340px] -translate-x-1/2 lg:bottom-5"
            />
          </div>
        )}
        <div className="relative order-1 pt-12 lg:order-2 lg:py-16">
          <span
            aria-hidden
            className="font-display pointer-events-none block select-none text-[5.5rem] leading-[0.85] text-white/10 md:text-[9rem] lg:text-[11rem]"
          >
            Trusted
          </span>
          <h2 className="font-display relative -mt-10 text-4xl leading-[1.05] text-white md:-mt-16 md:text-5xl lg:-mt-20">
            {brand.displayName} Buys Houses In {market} For A Fair Cash Price
          </h2>
          <p className="relative mt-5 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
            We are {brand.displayName}
            {brand.ownerName ? `, led by ${brand.ownerName}` : ""}. We&apos;ll do our best to bring you the highest
            cash offer we can make for your house, as-is. Just fill out the form and we&apos;ll get your no-obligation
            cash offer started.
          </p>
          {brand.foundersCaption && (
            <p className="relative mt-4 max-w-xl border-l-4 border-[color:var(--bc-orange)] pl-4 text-lg font-semibold italic text-white">
              &ldquo;{brand.foundersCaption}&rdquo;
              {brand.ownerName && <span className="mt-1 block text-sm font-normal not-italic text-white/75">{brand.ownerName}</span>}
            </p>
          )}
          <div className="relative mt-7">
            <OrangeCta />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 3-step process ---------- */
const steps = [
  {
    title: "Fill Out The Form To Get Started",
    body: "Share some information about your property. It takes about two minutes and there is no obligation.",
  },
  {
    title: "Pick A Date",
    body: "We set a time to see the house, then make you a fair, no-obligation cash offer for it in its current condition.",
  },
  {
    title: "Pick A Closing Date",
    body: "If the offer works for you, you choose when to close. Quickly if you need to, or on a schedule that suits you.",
  },
];

export function ProcessSection() {
  return (
    <section className="bg-[color:var(--bc-mist)] py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5 md:px-6">
        <h2 className="font-display text-center text-5xl leading-none text-[color:var(--bc-navy)] md:text-6xl">
          Discover A Smarter Way To Sell Your House
        </h2>
        <p className="mt-3 text-center text-lg text-[#3b4a5c]">Skip the stress with our simple 3-step process.</p>

        <div className="mt-14 grid gap-12 md:grid-cols-3 md:gap-8">
          {steps.map((s, i) => (
            <div key={s.title} className="relative rounded-xl border-2 border-[color:var(--bc-navy)] bg-white px-6 pb-7 pt-10 shadow-sm">
              <div className="font-display absolute -top-6 left-6 flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--bc-navy)] text-3xl text-white ring-4 ring-[color:var(--bc-mist)]">
                {i + 1}
              </div>
              <h3 className="font-display text-2xl leading-tight text-[color:var(--bc-navy)]">{s.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-[#3b4a5c]">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <OrangeCta />
        </div>
      </div>
    </section>
  );
}

/* ---------- "No Matter The Situation" ---------- */
const situations = [
  "Avoiding Foreclosure",
  "Expensive Repairs",
  "Fed Up Being A Landlord",
  "Selling An Inherited House",
  "Loss Of Income",
  "Moving To Assisted Living",
  "Job Relocation",
  "Whatever Other Reasons You May Have",
];

export function SituationsSection() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-5 md:px-6">
        <h2 className="font-display text-center text-5xl leading-none text-[color:var(--bc-navy)] md:text-6xl">
          We Can Buy Your House No Matter The Situation!
        </h2>
        <p className="mx-auto mt-5 max-w-3xl text-center text-base leading-relaxed text-[#3b4a5c] md:text-lg">
          Your reasons for selling are your business. What we care about is solving your problem by buying your house
          for cash with as little hassle as possible, whatever brought you here.
        </p>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 md:gap-4">
          {situations.map((s) => (
            <li key={s} className="flex items-center gap-3 rounded-lg border border-[#d6dee8] bg-white px-4 py-3.5 shadow-sm">
              <Home className="h-5 w-5 shrink-0 text-[color:var(--bc-blue)]" />
              <span className="font-semibold text-[color:var(--bc-navy)]">{s}</span>
            </li>
          ))}
        </ul>
        <div className="mt-10 text-center">
          <OrangeCta />
        </div>
      </div>
    </section>
  );
}

/* ---------- Final CTA ---------- */
export function FinalCta() {
  return (
    <section className="bg-[color:var(--bc-mist)] py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-5 text-center md:px-6">
        <h2 className="font-display text-5xl leading-none text-[color:var(--bc-navy)] md:text-6xl">
          Sell Your House Fast With Confidence!
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#3b4a5c] md:text-lg">
          No pressure and no obligation. Just a fair cash offer and a closing date you choose. Fill out the form to get
          started.
        </p>
        <div className="mt-8">
          <OrangeCta label="Get My Free Cash Offer" />
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
export function SiteFooter({ brand }: { brand: Brand }) {
  const market = marketPhrase(brand);
  return (
    <footer className="bg-[color:var(--bc-navy)] text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3 md:px-6">
        <div>
          {brand.logoUrl ? (
            <div className="inline-block rounded-lg bg-white px-3 py-2">
              <img src={brand.logoUrl} alt={brand.companyName} loading="lazy" className="block h-12 w-auto max-w-[180px] object-contain" />
            </div>
          ) : (
            <span className="font-display text-3xl">{brand.displayName}</span>
          )}
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
            Buying houses for cash in {market}. Fair offers, no repairs, no fees.
          </p>
        </div>

        <div>
          <h3 className="font-display text-2xl">Contact Details</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href={`tel:${brand.phoneHref}`} className="flex items-center gap-2 text-white/80 hover:text-white">
                <Phone className="h-4 w-4" /> {brand.phoneDisplay}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-2xl">Important Links</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li><button type="button" onClick={openOfferModal} className="text-white/80 hover:text-white">Get Cash Offer</button></li>
            <li><a href="#faq" className="text-white/80 hover:text-white">FAQ</a></li>
            <li><a href="/privacy" className="text-white/80 hover:text-white">Privacy Policy</a></li>
            <li><a href="/terms" className="text-white/80 hover:text-white">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">
        <p>© {new Date().getFullYear()} {brand.companyName}. All rights reserved.</p>
        {/* Kept word for word from the previous footer. */}
        <p className="mx-auto mt-2 max-w-2xl px-5">
          {brand.companyName} is not a licensed real estate agent or broker. We are a cash home buying company. All
          offers are subject to property inspection and due diligence.
        </p>
      </div>
    </footer>
  );
}
