"use client";

import { useEffect, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { SurveyCard } from "@/components/survey/survey-card";
import type { Brand } from "@/lib/brand";

/** Every CTA opens the form in a pop-up (William 2026-09-28, same pattern as Sellers Choice
 *  and Rivoir). The survey starts with its own address step and service-area check, so it is
 *  safe to open with no address. */
export function openOfferModal() {
  window.dispatchEvent(new Event("open-offer-modal"));
}

export function OfferModal({ brand }: { brand: Brand }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("open-offer-modal", onOpen);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("open-offer-modal", onOpen); window.removeEventListener("keydown", onKey); };
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Get your cash offer"
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm md:items-center"
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      <div className="relative my-8 w-full max-w-2xl">
        <button
          type="button"
          aria-label="Close"
          onClick={() => setOpen(false)}
          className="absolute -top-11 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[color:var(--bc-navy)] shadow hover:bg-white"
        >
          <X className="h-5 w-5" />
        </button>
        <SurveyCard
          phoneDisplay={brand.phoneDisplay}
          phoneHref={brand.phoneHref}
          serviceAreas={brand.serviceAreas}
          disqualifiedPropertyTypes={brand.disqualifiedPropertyTypes}
          companyName={brand.companyName}
        />
      </div>
    </div>
  );
}

export function OrangeCta({
  label = "Get My Cash Offer Now",
  className = "",
  size = "lg",
}: {
  label?: string;
  className?: string;
  size?: "sm" | "lg";
}) {
  const sizing =
    size === "sm"
      ? "px-4 py-2.5 text-sm md:px-5 md:text-base"
      : "px-8 py-4 text-lg md:px-10 md:text-xl";
  return (
    <button
      type="button"
      onClick={openOfferModal}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[color:var(--bc-orange)] font-bold text-white shadow-md transition-colors hover:bg-[color:var(--bc-orange-hover)] ${sizing} ${className}`}
    >
      {label}
      {size === "lg" && <ArrowRight className="h-5 w-5" />}
    </button>
  );
}
