"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { marketPhrase, type Brand } from "@/lib/brand";
import { OrangeCta } from "./cta";

/*
 * Comparison + FAQ, restyled from Rivoir's components/v2 sales-letter and FAQ sections.
 * Only claims Blue Crab's own page already makes: "no repairs, no showings, no fees",
 * "a fair written cash offer in 24 hours, on your timeline", "we buy houses in any
 * condition", "no obligation". Rivoir's "we pay closing costs", "as fast as 7 days" and
 * "our number is final" are left out: Blue Crab's footer says every offer is subject to
 * inspection and due diligence.
 */

const valueProps = [
  { title: "No Repairs Needed", body: "Sell exactly as-is. Leaky roof, dated kitchen, tenant damage: we buy houses in any condition. You fix nothing and clean nothing." },
  { title: "No Fees, No Showings", body: "No agent commissions and no fees to sell to us. No open houses and no strangers walking through your home." },
  { title: "Close On Your Timeline", body: "Need to close quickly? Need time to sort out your next move? You pick the closing date that works for you." },
  { title: "A Written Offer In 24 Hours", body: "Fill out the form and we get you a fair, written cash offer within 24 hours. It's free, and there's no obligation." },
];

const rows: Array<[string, string, string]> = [
  ["Repairs", "None. Sell as-is.", "Often needed before listing"],
  ["Showings", "None", "Open houses and showings"],
  ["Fees & Commissions", "No fees", "Agent commission, typically 5% to 6%"],
  ["Closing Date", "You choose it", "Depends on finding a buyer"],
  ["Payment", "Cash. No waiting on a buyer's loan.", "Buyer's loan can fall through"],
];

export function CompareSection({ brand }: { brand: Brand }) {
  return (
    <section className="bg-[color:var(--bc-mist)] py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-5 md:px-6">
        <h2 className="font-display text-center text-5xl leading-none text-[color:var(--bc-navy)] md:text-6xl">
          A Simple, Honest Way To Sell Your House
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-[#3b4a5c] md:text-lg">
          {brand.displayName} buys houses directly from homeowners in {marketPhrase(brand)}. No listing, no showings,
          no repairs. Just a fair cash offer and a closing date you choose.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {valueProps.map((v) => (
            <div key={v.title} className="rounded-xl border border-[#d6dee8] border-l-4 border-l-[color:var(--bc-blue)] bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold text-[color:var(--bc-navy)] md:text-xl">{v.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-[#3b4a5c]">{v.body}</p>
            </div>
          ))}
        </div>

        <h3 className="font-display mt-14 text-center text-4xl leading-none text-[color:var(--bc-navy)] md:text-5xl">
          Us vs. A Traditional Listing
        </h3>
        <div className="mt-6 overflow-hidden rounded-xl border border-[#d6dee8] bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm md:text-base">
            <thead>
              <tr className="border-b border-[#d6dee8]">
                <th className="px-3 py-3 md:px-4" />
                <th className="bg-[color:var(--bc-navy)] px-3 py-3 font-bold text-white md:px-4">{brand.displayName}</th>
                <th className="px-3 py-3 font-semibold text-[#5A6B7D] md:px-4">Traditional Listing</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([feature, us, them]) => (
                <tr key={feature} className="border-b border-[#e7edf3] last:border-0">
                  <td className="px-3 py-3 font-semibold text-[color:var(--bc-navy)] md:px-4">{feature}</td>
                  <td className="bg-[#1d283b]/[0.06] px-3 py-3 font-medium text-[color:var(--bc-navy)] md:px-4">{us}</td>
                  <td className="px-3 py-3 text-[#5A6B7D] md:px-4">{them}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 text-center">
          <OrangeCta />
          <p className="mt-3 text-sm italic text-[#5A6B7D]">It takes about two minutes.</p>
        </div>
      </div>
    </section>
  );
}

function buildFaqs(brand: Brand) {
  const company = brand.displayName;
  const market = marketPhrase(brand);
  return [
    {
      q: "How does the cash offer process work?",
      a: `Enter your address and answer a few quick questions. ${company} reviews your property details and follows up with a fair, written cash offer within 24 hours. There's no cost and no obligation.`,
    },
    {
      q: "Do I need to make any repairs before selling?",
      a: "No. We buy houses in any condition. You don't need to fix, clean, or stage anything.",
    },
    {
      q: "Are there any fees or commissions?",
      a: "No. There are no agent commissions and no fees to sell your house to us.",
    },
    {
      q: "When can we close?",
      a: "On your timeline. Tell us the date that works for you, sooner or later, and we plan around it.",
    },
    {
      q: "Is there any obligation to accept the offer?",
      a: "None at all. Getting an offer is free. Review it on your own time and accept only if it's the right fit for you.",
    },
    {
      q: "What areas do you buy in?",
      a: `We buy houses in ${market}. Enter your address to get started.`,
    },
  ];
}

export function FaqSection({ brand }: { brand: Brand }) {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = buildFaqs(brand);
  return (
    <section id="faq" className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-5 md:px-6">
        <h2 className="font-display text-center text-5xl leading-none text-[color:var(--bc-navy)] md:text-6xl">Common Questions</h2>
        <p className="mb-10 mt-3 text-center text-lg text-[#5A6B7D]">Straight answers. No runaround.</p>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={f.q} className="overflow-hidden rounded-xl border border-[#d6dee8] bg-white">
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                className="flex w-full items-center justify-between px-5 py-4 text-left md:px-6 md:py-5"
              >
                <span className="pr-4 text-lg font-semibold text-[color:var(--bc-navy)]">{f.q}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-[#5A6B7D] transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && <p className="px-5 pb-5 text-base leading-relaxed text-[#3b4a5c] md:px-6">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
