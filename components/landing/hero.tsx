"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { SurveyCard } from "@/components/survey/survey-card";
import { AddressAutocomplete } from "@/components/survey/address-autocomplete";
import { marketPhrase, type Brand } from "@/lib/brand";

/** Name line shown over Herbert's photo (hero desktop + phone, team band). */
export function OwnerCaption({ brand, dark = false, className = "" }: { brand: Brand; dark?: boolean; className?: string }) {
  if (!brand.ownerName) return null;
  return (
    <div
      className={`rounded-lg px-3 py-2 text-center leading-snug shadow-md ${
        dark ? "bg-black/55 text-white backdrop-blur-sm" : "bg-white/90 text-[color:var(--bc-navy)] backdrop-blur-sm"
      } ${className}`}
    >
      <p className="text-sm font-bold">{brand.ownerName}</p>
      <p className={`mt-0.5 text-xs ${dark ? "text-white/80" : "text-[#3b4a5c]"}`}>{brand.displayName}</p>
    </div>
  );
}

/** Headline with the "Fast..." tail in the logo blue (the reference colours the promise).
 *  HEADLINE_ACCENT, when set, takes over as the coloured part. */
function Headline({ brand }: { brand: Brand }) {
  if (brand.headlineAccent.trim()) {
    return (
      <>
        {brand.headline} <span className="text-[color:var(--bc-blue)]">{brand.headlineAccent}</span>
      </>
    );
  }
  const i = brand.headline.search(/\bFast\b/);
  if (i <= 0) return <>{brand.headline}</>;
  return (
    <>
      {brand.headline.slice(0, i)}
      <span className="text-[color:var(--bc-blue)]">{brand.headline.slice(i)}</span>
    </>
  );
}

/**
 * Hero: house background, centered headline, Herbert cut-out bottom-left (desktop), white
 * form card on the right. The address box is the survey's own first step; once an address is
 * picked, the two-step survey takes over at the legal-owner question.
 */
export function Hero({ brand }: { brand: Brand }) {
  const [showSurvey, setShowSurvey] = useState(false);
  const [initialAddress, setInitialAddress] = useState("");
  const [addressVerified, setAddressVerified] = useState(false);
  const [outsideAreaError, setOutsideAreaError] = useState(false);
  const [addressDetails, setAddressDetails] = useState<{ city?: string; state?: string; county?: string }>({});

  const ownerAlt = brand.ownerName ? `${brand.ownerName}, ${brand.displayName}` : brand.displayName;
  const subheadline = brand.subheadline.trim() || "Get a fair, no-obligation cash offer. No repairs, no fees. Close on your timeline.";

  return (
    <section id="hero" className="relative overflow-hidden bg-[color:var(--bc-mist)]">
      {brand.heroBgUrl && (
        <img
          src={brand.heroBgUrl}
          alt=""
          aria-hidden
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-[center_60%]"
        />
      )}
      {/* Light wash so navy text stays legible over the photo */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/75 to-white/45" />

      <div className="relative mx-auto max-w-6xl px-4 pt-8 md:px-6 md:pt-10 lg:pt-8">
        <h1 className="font-display mx-auto max-w-5xl text-center text-[2.5rem] leading-[1.02] text-[color:var(--bc-navy)] sm:text-5xl lg:text-[3.6rem]">
          <Headline brand={brand} />
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-center text-base font-medium text-[#1f2f45] sm:text-lg md:text-xl">
          {subheadline}
        </p>

        <div className="mt-6 grid items-end gap-4 lg:mt-6 lg:grid-cols-[1fr_540px] lg:gap-8">
          {/* Herbert cut-out, desktop. The caption sits 24px above the hero's bottom edge. */}
          <div className="relative hidden h-full min-h-[460px] lg:block">
            {brand.ownerCutoutUrl && (
              <img
                src={brand.ownerCutoutUrl}
                alt={ownerAlt}
                className="absolute bottom-0 left-4 h-[450px] w-auto max-w-full object-contain object-bottom drop-shadow-xl"
              />
            )}
            <OwnerCaption brand={brand} className="absolute bottom-6 left-0 min-w-[220px]" />
          </div>

          {/* Form card */}
          <div id="offer-form" className="relative z-10 w-full scroll-mt-24 pb-6 lg:pb-12">
            {!showSurvey ? (
              <div className="mx-auto w-full max-w-[540px] rounded-2xl border-4 border-white/70 bg-white p-5 shadow-2xl md:p-7">
                <h2 className="font-display text-center text-[1.9rem] leading-none text-[color:var(--bc-navy)] md:text-4xl">
                  Get Your No-Obligation Offer Today
                </h2>
                <p className="mt-2 text-center text-sm text-[#5A6B7D] md:text-base">
                  Enter your property address to start.
                </p>
                <div className="mt-4 flex flex-col gap-3 [&_input]:h-14 [&_input]:text-lg">
                  <AddressAutocomplete
                    value={initialAddress}
                    onChange={(address) => { setInitialAddress(address); setAddressVerified(false); setOutsideAreaError(false); }}
                    onSelect={(address, details) => {
                      setInitialAddress(address);
                      setAddressDetails({ city: details.city, state: details.state, county: details.county });
                      setAddressVerified(true);
                      setOutsideAreaError(false);
                      setShowSurvey(true);
                    }}
                    onOutOfArea={() => { setAddressVerified(false); setOutsideAreaError(true); }}
                    serviceAreas={brand.serviceAreas}
                    placeholder="Enter your property address..."
                  />
                  <button
                    type="button"
                    onClick={() => { if (addressVerified) setShowSurvey(true); }}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--bc-orange)] text-xl font-bold text-white shadow-lg transition-colors hover:bg-[color:var(--bc-orange-hover)]"
                  >
                    Get My Free Cash Offer
                    <ArrowRight className="h-6 w-6" />
                  </button>
                  {outsideAreaError && (
                    <p className="text-center text-sm font-medium" style={{ color: "#dc2626" }}>
                      Sorry, that address is outside our current buying area. Please enter a property in {marketPhrase(brand)}.
                    </p>
                  )}
                  <p className="text-center text-sm text-[#5A6B7D]">
                    Takes about 2 minutes. No obligation.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mx-auto w-full max-w-2xl">
                <SurveyCard
                  phoneDisplay={brand.phoneDisplay}
                  phoneHref={brand.phoneHref}
                  serviceAreas={brand.serviceAreas}
                  disqualifiedPropertyTypes={brand.disqualifiedPropertyTypes}
                  companyName={brand.companyName}
                  initialAddress={initialAddress}
                  initialStep={2}
                  initialAddressDetails={addressDetails}
                />
              </div>
            )}
          </div>
        </div>

        {/* Herbert cut-out, phone/tablet: under the form, with his name over its lower edge */}
        {brand.ownerCutoutUrl && (
          <div className="relative mt-2 flex justify-center lg:hidden">
            <img src={brand.ownerCutoutUrl} alt={ownerAlt} className="block h-[280px] w-auto object-contain object-bottom" />
            <OwnerCaption brand={brand} className="absolute bottom-6 left-1/2 w-[80%] max-w-[260px] -translate-x-1/2" />
          </div>
        )}
      </div>
    </section>
  );
}
