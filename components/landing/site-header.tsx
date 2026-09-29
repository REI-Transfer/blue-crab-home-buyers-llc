"use client";

import { Phone } from "lucide-react";
import type { Brand } from "@/lib/brand";
import { OrangeCta } from "./cta";

export function SiteHeader({ brand }: { brand: Brand }) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#E2E8F0] bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 md:px-6">
        <a href="#hero" className="min-w-0 shrink">
          {brand.logoUrl ? (
            // The logo file is pre-trimmed and transparent (public/images/logo-trimmed.webp), so it
            // is shown whole: never crop it.
            <img
              src={brand.logoUrl}
              alt={brand.companyName}
              className="block h-12 w-auto max-w-[150px] object-contain md:h-[72px] md:max-w-[220px]"
            />
          ) : (
            <span className="font-display text-2xl text-[color:var(--bc-navy)]">{brand.companyName}</span>
          )}
        </a>

        <div className="flex items-center gap-3 md:gap-6">
          <a
            href={`tel:${brand.phoneHref}`}
            aria-label={`Call ${brand.phoneDisplay}`}
            className="flex items-center gap-2 font-semibold text-[color:var(--bc-navy)] hover:text-[color:var(--bc-blue)]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--bc-mist)]">
              <Phone className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline">{brand.phoneDisplay}</span>
          </a>
          <OrangeCta label="Get Cash Offer" size="sm" />
        </div>
      </div>
    </header>
  );
}
