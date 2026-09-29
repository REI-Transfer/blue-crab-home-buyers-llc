"use client"

import { useState, useRef, useEffect, type ReactNode } from "react"
import { Home, ArrowRight, ArrowLeft, ArrowDown, Check, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { captureTrackingData, getIPAddress, readGfSid } from "@/lib/tracking"
import { Input } from "@/components/ui/input"
import { AddressAutocomplete, type AddressDetails, type ServiceArea } from "./address-autocomplete"

interface SurveyData {
  address: string
  propertyType: string
  isLegalOwner: string
  ownershipLength: string
  listedOnMarket: string
  timeline: string
  condition: string
  reason: string
  firstName: string
  lastName: string
  name: string
  email: string
  phone: string
}

const PROPERTY_TYPE_OPTIONS = [
  { id: "single-family", label: "Single Family Home" },
  { id: "multi-family", label: "Multi-Family (Duplex, Triplex, etc.)" },
  { id: "condo-townhouse", label: "Condo / Townhouse" },
  { id: "mobile-home", label: "Mobile / Manufactured Home" },
  { id: "land", label: "Vacant Land / Lot" },
  { id: "other", label: "Other" },
]

const LEGAL_OWNER_OPTIONS = [
  { id: "yes-owner", label: "Yes, I am the legal homeowner" },
  { id: "yes-family", label: "Yes, I am a family member with the legal right to sell" },
  { id: "no", label: "No, I am not" },
]

const OWNERSHIP_LENGTH_OPTIONS = [
  { id: "1-3-years", label: "Within the last 3 years" },
  { id: "3-5-years", label: "3 to 5 years ago" },
  { id: "5-10-years", label: "5 to 10 years ago" },
  { id: "10-plus-years", label: "More than 10 years ago" },
  { id: "inherited", label: "I recently inherited it" },
]

// "No, never" and "Yes, but expired or cancelled" proceed; only "Yes, active now"
// and "Not sure" hard-disqualify (see handleOptionSelect / disqualifyReasonFor).
// "not-listed" is kept as the id for "No, never" so isQualifiedForMeta's
// okListed === 'not-listed' gate is unchanged.
const LISTED_OPTIONS = [
  { id: "not-listed", label: "No, never" },
  { id: "listed-active", label: "Yes, active now" },
  { id: "listed-expired", label: "Yes, but expired or cancelled" },
  { id: "not-sure", label: "Not sure" },
]

// Blue Crab timeline step (re-added 2026-08). Ids/labels carried from Blue Crab's
// prior survey-card; SCORE_TIMELINE below scores them.
const TIMELINE_OPTIONS = [
  { id: "asap", label: "ASAP (Within 7 days)" },
  { id: "2-weeks", label: "Within 2 weeks" },
  { id: "30-days", label: "Within 30 days" },
  { id: "60-days", label: "Within 60 days" },
  { id: "flexible", label: "I'm flexible" },
]

const CONDITION_OPTIONS = [
  { id: "excellent", label: "Excellent - Move-in ready", desc: "Recently updated. Could list tomorrow with nothing to fix." },
  { id: "good", label: "Good - Minor repairs needed", desc: "Well kept, but dated kitchen, baths, or floors. Nothing broken." },
  { id: "fair", label: "Fair - Needs some work", desc: "Dated throughout, plus wear and repairs I've been putting off." },
  { id: "poor", label: "Poor - Major repairs needed", desc: "Major systems need work. Roof, HVAC, plumbing, electrical, or foundation." },
  { id: "distressed", label: "Distressed - Significant issues", desc: "Not livable as-is. Significant damage, or it's been sitting vacant." },
]

const REASON_OPTIONS = [
  { id: "foreclosure", label: "Facing foreclosure" },
  { id: "behind-payments", label: "Behind on payments" },
  { id: "inherited", label: "Inherited property" },
  { id: "divorce", label: "Divorce or separation" },
  { id: "repairs", label: "Can't afford repairs" },
  { id: "vacant", label: "Vacant property I need to sell" },
  { id: "urgent-financial", label: "Urgent financial situation not listed above" },
  { id: "life-event", label: "Personal situation not listed above" },
  { id: "none-of-above", label: "No reason / seeing what my house is worth" },
]

const VALID_AREA_CODES = new Set(["201","202","203","205","206","207","208","209","210","212","213","214","215","216","217","218","219","220","223","224","225","228","229","231","234","239","240","248","251","252","253","254","256","260","262","267","269","270","272","276","279","281","301","302","303","304","305","307","308","309","310","312","313","314","315","316","317","318","319","320","321","323","325","326","327","330","331","332","334","336","337","339","340","341","346","347","351","352","360","361","364","380","385","386","401","402","404","405","406","407","408","409","410","412","413","414","415","417","419","423","424","425","430","432","434","435","440","442","443","445","447","448","458","463","469","470","475","478","479","480","484","501","502","503","504","505","507","508","509","510","512","513","515","516","517","518","520","530","531","534","539","540","541","551","559","561","562","563","564","567","570","571","573","574","575","580","585","586","601","602","603","605","606","607","608","609","610","612","614","615","616","617","618","619","620","623","626","628","629","630","631","636","641","646","650","651","657","659","660","661","662","667","669","678","680","681","682","689","701","702","703","704","706","707","708","712","713","714","715","716","717","718","719","720","724","725","726","727","728","731","732","734","737","740","743","747","754","757","760","762","763","765","769","770","772","773","774","775","779","781","785","786","801","802","803","804","805","806","808","810","812","813","814","815","816","817","818","820","828","830","831","832","838","843","845","847","848","850","854","856","857","858","859","860","862","863","864","865","870","872","878","901","903","904","906","907","908","909","910","912","913","914","915","916","917","918","919","920","925","928","929","930","931","934","936","937","938","940","941","943","947","949","951","952","954","956","959","970","971","972","973","978","979","980","984","985","989"])

const DISPOSABLE_DOMAINS = new Set(["mailinator.com","guerrillamail.com","tempmail.com","throwaway.email","yopmail.com","sharklasers.com","guerrillamail.info","grr.la","guerrillamail.biz","guerrillamail.de","guerrillamail.net","guerrillamail.org","spam4.me","trashmail.com","trashmail.me","trashmail.net","mytemp.email","mohmal.com","tempail.com","dispostable.com","maildrop.cc","10minutemail.com","temp-mail.org","fakeinbox.com","mailnesia.com","getnada.com","emailondeck.com","33mail.com","harakirimail.com","jetable.org","meltmail.com","mailcatch.com","tempinbox.com","spamgourmet.com","mailexpire.com","incognitomail.org","getairmail.com","mailnull.com","safeemail.xyz","tempmailo.com","burnermail.io"])

const BLOCKED_WORDS = new Set(["fuck","shit","ass","damn","bitch","bastard","dick","cock","pussy","cunt","whore","slut","fag","nigger","nigga","retard","penis","vagina","anus","dildo","porn","xxx","viagra","cialis","casino","bitcoin","crypto","forex","mlm","scam","spam","test123","asdf","qwerty","aaaaaa","zzzzzz","abcdef","123456"])

// ============================================================
// LEAD SCORING + QUALIFICATION (REI Transfer playbook v1, 2026-04-27)
// Score matrix is identical across all REI Transfer clients.
// ============================================================
const SCORE_OWNERSHIP: Record<string, number> = {
  '10-plus-years': 3, '5-10-years': 1, '3-5-years': 0, '1-3-years': 0,
  // inherited: exempt from ownership hard-DQs; placeholder score 3 pending William's confirm.
  'inherited': 3,
}
const SCORE_REASON: Record<string, number> = {
  'foreclosure': 3, 'behind-payments': 3, 'urgent-financial': 3,
  'inherited': 2, 'repairs': 2, 'vacant': 2, 'divorce': 2,
  'life-event': 1,
  'none-of-above': 0,
}
const SCORE_CONDITION: Record<string, number> = {
  'poor': 1, 'distressed': 1,
  'fair': 0, 'good': 0, 'excellent': 0,
}
// Blue Crab timeline scoring (carried exactly from Blue Crab's prior survey-card).
const SCORE_TIMELINE: Record<string, number> = {
  'asap': 3, '2-weeks': 2, '30-days': 1, '60-days': 0, 'flexible': 0,
}

interface SurveyDataLike {
  propertyType: string;
  isLegalOwner: string;
  ownershipLength: string;
  listedOnMarket: string;
  timeline: string;
  condition: string;
  reason: string;
}

function calculateLeadScore(d: SurveyDataLike): number {
  return (SCORE_OWNERSHIP[d.ownershipLength] || 0)
       + (SCORE_REASON[d.reason] || 0)
       + (SCORE_CONDITION[d.condition] || 0)
       + (SCORE_TIMELINE[d.timeline] || 0)
}
function isQualifiedForMeta(d: SurveyDataLike): boolean {
  const okType = d.propertyType === 'single-family' || d.propertyType === 'multi-family'
  const okListed = d.listedOnMarket === 'not-listed'
  const okOwner = d.isLegalOwner !== 'no'
  // Reason is the intent gate (2026-06-24): "no reason / just seeing what it's
  // worth" is hard-blocked before submit, so anyone who reaches here is motivated.
  const okReason = d.reason !== 'none-of-above'
  // Excellent / move-in-ready does NOT fire a qualified Lead — it soft-DQs:
  // qualified=false -> fires LeadLowIntent and STILL posts (no block screen).
  const okCondition = d.condition !== 'excellent'
  return okType && okListed && okOwner && okReason && okCondition
}
function disqualifyReasonFor(d: SurveyDataLike): string | null {
  if (d.propertyType === 'condo-townhouse') return 'condo_townhouse'
  if (d.propertyType === 'mobile-home') return 'mobile_home'
  if (d.propertyType === 'land') return 'vacant_land'
  if (d.propertyType === 'other') return 'other_property_type'
  if (d.listedOnMarket === 'listed-active' || d.listedOnMarket === 'not-sure' || d.listedOnMarket === 'listed-expired') return 'listed_on_market'
  if (d.isLegalOwner === 'no') return 'not_legal_owner'
  if (d.condition === 'excellent') return 'excellent_condition'
  return null
}
function leadQuality(score: number): 'premium' | 'standard' | 'low' {
  if (score >= 6) return 'premium'
  if (score >= 3) return 'standard'
  return 'low'
}

function formatPhoneNumber(value: string): string {
  let digits = value.replace(/\D/g, "")
  if (digits.startsWith("1")) digits = digits.slice(1)
  if (digits.length > 10) digits = digits.slice(0, 10)
  if (digits.length === 0) return ""
  if (digits.length <= 3) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
}

function validatePhone(phone: string): { valid: boolean; msg: string } {
  const digits = phone.replace(/\D/g, "").replace(/^1/, "")
  if (digits.length !== 10) return { valid: false, msg: "Please enter a valid 10-digit US phone number." }
  const area = digits.slice(0, 3)
  if (!VALID_AREA_CODES.has(area)) return { valid: false, msg: `Area code (${area}) doesn't appear to be valid.` }
  if (/^(\d)\1{9}$/.test(digits)) return { valid: false, msg: "Please enter a real phone number." }
  if (["1234567890", "0123456789", "9876543210"].includes(digits)) return { valid: false, msg: "Please enter a real phone number." }
  const exchange = digits.slice(3, 6)
  if (exchange === "555") return { valid: false, msg: "Please enter a real phone number, not a 555 number." }
  if (exchange.startsWith("0") || exchange.startsWith("1")) return { valid: false, msg: "That doesn't look like a valid phone number." }
  return { valid: true, msg: "" }
}

function validateEmail(email: string): { valid: boolean; msg: string } {
  if (!email || email.trim() === "") return { valid: false, msg: "Email is required." }
  const e = email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return { valid: false, msg: "Please enter a valid email address." }
  const domain = e.split("@")[1]
  if (DISPOSABLE_DOMAINS.has(domain)) return { valid: false, msg: "Please use a real email address, not a temporary one." }
  const fakePatterns = ["test@test", "fake@fake", "asdf@asdf", "noemail@", "spam@", "junk@", "nobody@nobody", "aaa@aaa", "abc@abc", "example@example"]
  for (const pattern of fakePatterns) {
    if (e.startsWith(pattern)) return { valid: false, msg: "Please enter your real email address." }
  }
  const emailParts = e.replace("@", " ").replace(/\./g, " ").split(/\s+/)
  for (const part of emailParts) {
    if (BLOCKED_WORDS.has(part)) return { valid: false, msg: "Please enter a valid email address." }
  }
  return { valid: true, msg: "" }
}

function validateName(name: string): { valid: boolean; msg: string } {
  const trimmed = name.trim()
  if (!trimmed) return { valid: false, msg: "Name is required." }
  if (trimmed.length < 2) return { valid: false, msg: "Please enter your full name." }
  const words = trimmed.toLowerCase().split(/\s+/)
  for (const word of words) {
    if (BLOCKED_WORDS.has(word)) return { valid: false, msg: "Please enter your real name." }
  }
  if (/(.)\1{4,}/.test(trimmed)) return { valid: false, msg: "Please enter your real name." }
  if (/^\d+$/.test(trimmed)) return { valid: false, msg: "Please enter your real name, not a number." }
  return { valid: true, msg: "" }
}

// ─── Two-step flow (standard lead contract, 2026-09-18; port of Bobby's card, bobby-buys-homes#2) ───
// Stage 1 (no progress bar, one question per screen):
//   1 address → 2 legal owner → 3 listed on market → 4 contact details + TCPA consent
//   Contact submit POSTs lead_stage='early' to /api/submit. NO pixel event of any kind at
//   stage 1 (William 2026-09-24), and the route does not forward it to GoFunnel.
//   Stage-1 hard DQs (out of area, not owner, listed) stop BEFORE contact details: nothing sent.
// Stage 2 (progress bar): Blue Crab's remaining questions, in its original order. The last
//   answer submits lead_stage='complete' + stage1_event_id with the SAME scoring, Lead vs
//   LeadLowIntent event, payload and /thank-you redirect the one-step form used.
//   Stage-2 hard DQs (property type, owned under 3 or 3-5 years, no reason to sell) POST
//   lead_stage='disqualified' so the n8n partial follow-up labels them instead of treating
//   them as unfinished.
// Blue Crab specifics kept from the one-step card: listing DQ on anything but "No, never";
// condo/townhouse always DQ; owned 1-3 and 3-5 years hard DQ ("inherited" passes);
// "Excellent" condition is a SOFT DQ (PR #5): it still submits, fires LeadLowIntent, not Lead;
// condition descriptions; timeline step + timeline scoring; "No reason" hard DQ with Blue
// Crab's own screen; area-code phone check.
const STAGE1_STEPS = 4 // 1=address, 2=owner, 3=listed, 4=contact
type Stage2Field = "propertyType" | "ownershipLength" | "condition" | "timeline" | "reason"
// Blue Crab's one-step order (address, type, owner, ownership, listed, condition, timeline,
// reason, contact) minus the questions that moved to Stage 1.
const STAGE2_FIELDS: Stage2Field[] = ["propertyType", "ownershipLength", "condition", "timeline", "reason"]

// Cap how long the seller waits on the early POST. The request is not aborted (the page
// does not navigate); the seller just moves on to Stage 2. A slow or failed early POST
// never blocks the survey.
const EARLY_POST_MAX_WAIT_MS = 4000

const SOURCE = "Blue Crab Home Buyers, LLC - Survey"
const CONTENT_NAME = "Blue Crab Home Buyers Survey"

type FbqFn = (...args: unknown[]) => void

interface SurveyCardProps {
  phoneDisplay?: string
  phoneHref?: string
  serviceAreas?: ServiceArea[]
  disqualifiedPropertyTypes?: string[]
  // Accepted for compatibility with existing callers; Blue Crab's reason list is fixed.
  motivationV2?: boolean
  // Seed props (landing hero and advertorial pop-up). initialStep 2..9 means "address
  // already captured": Stage 1 starts at the legal-owner question. Owner and listed are
  // never skipped, because they are hard disqualifiers.
  initialAddress?: string
  initialStep?: number
  // City / state / county of a seeded address (from the landing hero's own address box).
  initialAddressDetails?: { city?: string; state?: string; county?: string }
  // Legal name shown in the TCPA consent text.
  companyName?: string
}

export function SurveyCard({
  phoneDisplay = "(800) 000-0000",
  phoneHref = "8000000000",
  serviceAreas = [],
  disqualifiedPropertyTypes = ["mobile-home", "land", "other"],
  motivationV2 = false, // eslint-disable-line @typescript-eslint/no-unused-vars
  initialAddress,
  initialStep,
  initialAddressDetails,
  companyName = "Blue Crab Home Buyers, LLC",
}: SurveyCardProps = {}) {
  const seededPastAddress = !!initialAddress && !!initialStep && initialStep >= 2 && initialStep <= 9
  const [stage, setStage] = useState<1 | 2>(1)
  const [stage1Step, setStage1Step] = useState(seededPastAddress ? 2 : 1)
  const [stage2Step, setStage2Step] = useState(1) // 1..STAGE2_FIELDS.length
  const totalStage2Steps = STAGE2_FIELDS.length

  const [surveyData, setSurveyData] = useState<SurveyData>({
    address: initialAddress || "",
    propertyType: "",
    isLegalOwner: "",
    ownershipLength: "",
    listedOnMarket: "",
    timeline: "",
    condition: "",
    reason: "",
    firstName: "",
    lastName: "",
    name: "",
    email: "",
    phone: "",
  })
  const [tcpaConsent, setTcpaConsent] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isDisqualified, setIsDisqualified] = useState(false)
  const [disqualifyReason, setDisqualifyReason] = useState("")
  const [addressVerified, setAddressVerified] = useState(seededPastAddress)
  const [addressOutOfArea, setAddressOutOfArea] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})
  const formStartTime = useRef<number>(Date.now())
  const trackingRef = useRef(captureTrackingData())
  const addressDetailsRef = useRef<{ city?: string; state?: string; county?: string }>(initialAddressDetails || {})
  const stage1EventIdRef = useRef<string>("")
  const completeSentRef = useRef(false)
  // Set as soon as a hard-DQ answer is clicked, so a quick second click can't advance
  // (or submit) during the 300ms before the block screen appears.
  const dqPendingRef = useRef(false)
  useEffect(() => {
    getIPAddress().then((ip) => { trackingRef.current.ip = ip })
  }, [])
  const [honeypot, setHoneypot] = useState("")

  const disqualify = (reason: string) => {
    dqPendingRef.current = true
    setTimeout(() => { setDisqualifyReason(reason); setIsDisqualified(true) }, 300)
  }

  const fullNameOf = (d: SurveyData) => `${d.firstName.trim()} ${d.lastName.trim()}`.trim()

  // ============================================================
  // STAGE 1
  // ============================================================

  // Address Continue: out-of-area addresses get the disqualify screen (SERVICE_AREAS gate,
  // evaluated in AddressAutocomplete; inert while SERVICE_AREAS is []).
  const handleAddressContinue = () => {
    if (addressOutOfArea) {
      setDisqualifyReason("outOfArea")
      setIsDisqualified(true)
      return
    }
    if (surveyData.address.trim().length > 0 && addressVerified) setStage1Step(2)
  }

  const handleAddressSelect = (address: string, details: AddressDetails) => {
    addressDetailsRef.current = { city: details.city, state: details.state, county: details.county }
    setSurveyData((prev) => ({ ...prev, address }))
    setAddressVerified(true)
    setAddressOutOfArea(false)
    setTimeout(() => { setStage1Step(2) }, 300)
  }

  const handleOwnerSelect = (value: string) => {
    setSurveyData({ ...surveyData, isLegalOwner: value })
    if (value === "no") { disqualify("notOwner"); return }
    setTimeout(() => { if (!dqPendingRef.current) setStage1Step(3) }, 300)
  }

  // Blue Crab: "Yes, active now", "Not sure" and "Yes, but expired or cancelled" all
  // hard-disqualify. Only "No, never" (not-listed) passes.
  const handleListedSelect = (value: string) => {
    setSurveyData({ ...surveyData, listedOnMarket: value })
    if (["listed-active", "not-sure", "listed-expired"].includes(value)) { disqualify("listed"); return }
    setTimeout(() => { if (!dqPendingRef.current) setStage1Step(4) }, 300)
  }

  const handleStage1Back = () => {
    if (stage1Step > 1) setStage1Step(stage1Step - 1)
  }

  // Contact submit: validate → anti-bot → early POST (no pixel event) → Stage 2
  const handleContactSubmit = async () => {
    const errors: { [key: string]: string } = {}
    const firstCheck = validateName(surveyData.firstName)
    if (!firstCheck.valid) errors.firstName = firstCheck.msg
    const lastCheck = validateName(surveyData.lastName)
    if (!lastCheck.valid) errors.lastName = lastCheck.msg
    const emailCheck = validateEmail(surveyData.email)
    if (!emailCheck.valid) errors.email = emailCheck.msg
    const phoneCheck = validatePhone(surveyData.phone)
    if (!phoneCheck.valid) errors.phone = phoneCheck.msg
    if (!tcpaConsent) errors.tcpaConsent = "Please check the box to continue."

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }
    setValidationErrors({})

    // Anti-bot: too-fast submit or honeypot tripped → fake success, nothing sent
    if (Date.now() - formStartTime.current < 3000) { setIsSubmitted(true); return }
    if (honeypot) { setIsSubmitted(true); return }

    setIsSubmitting(true)
    const earlyEventId = "eho_early_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10)
    stage1EventIdRef.current = earlyEventId

    try {
      const payload = {
        lead_stage: "early",
        firstName: surveyData.firstName.trim(),
        lastName: surveyData.lastName.trim(),
        name: fullNameOf(surveyData),
        email: surveyData.email,
        phone: surveyData.phone,
        address: surveyData.address,
        ...addressDetailsRef.current,
        isLegalOwner: surveyData.isLegalOwner,
        listedOnMarket: surveyData.listedOnMarket,
        tcpa_consent: tcpaConsent,
        source: `${SOURCE} (Stage 1)`,
        submittedAt: new Date().toISOString(),
        // A label on the server payload only (no browser event): keeps any downstream
        // "Lead" route from matching the partial.
        meta_event_id: earlyEventId,
        meta_event_name: "LeadEarly",
        meta_value: 0,
        gf_sid: readGfSid(),
        ...trackingRef.current,
      }
      const post = fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => undefined)
      await Promise.race([post, new Promise((resolve) => setTimeout(resolve, EARLY_POST_MAX_WAIT_MS))])
    } catch {
      // a failed partial never blocks the seller
    }

    setIsSubmitting(false)
    setStage(2)
    setStage2Step(1)
  }

  // ============================================================
  // STAGE 2
  // ============================================================

  // Final submit: scoring, qualification, event naming, payload and redirect unchanged from
  // the one-step form; lead_stage + stage1_event_id (+ tcpa_consent) are added.
  const submitComplete = async (finalData: SurveyData) => {
    if (completeSentRef.current || dqPendingRef.current) return
    if (Date.now() - formStartTime.current < 3000) { setIsSubmitted(true); return }
    if (honeypot) { setIsSubmitted(true); return }

    completeSentRef.current = true
    setIsSubmitting(true)

    // REI Transfer playbook: lead scoring + conditional Meta event firing.
    const qualified = isQualifiedForMeta(finalData)
    const score = calculateLeadScore(finalData)
    const quality = leadQuality(score)
    const dqReason = qualified ? null : disqualifyReasonFor(finalData)
    // Stable event id for browser + CAPI dedup
    const eventId = "eho_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10)

    try {
      // Meta pixel: fires ONCE, here, on the finished survey. Lead only when qualified,
      // value-bid by score; otherwise LeadLowIntent (e.g. Excellent condition soft DQ).
      if (typeof window !== "undefined" && (window as { fbq?: FbqFn }).fbq) {
        const fbq = (window as unknown as { fbq: FbqFn }).fbq
        if (qualified) {
          fbq("track", "Lead", {
            value: score * 25,
            currency: "USD",
            content_name: CONTENT_NAME,
            content_category: "real_estate",
            lead_score: score,
            lead_quality: quality,
          }, { eventID: eventId })
        } else {
          fbq("trackCustom", "LeadLowIntent", {
            content_name: CONTENT_NAME,
            content_category: "real_estate",
            disqualify_reason: dqReason,
            lead_score: score,
          }, { eventID: eventId })
        }
      }

      const payload = {
        lead_stage: "complete",
        ...finalData,
        firstName: finalData.firstName.trim(),
        lastName: finalData.lastName.trim(),
        name: fullNameOf(finalData),
        ...addressDetailsRef.current,
        ...trackingRef.current,
        tcpa_consent: tcpaConsent,
        source: SOURCE,
        submittedAt: new Date().toISOString(),
        // Scoring + Meta coordination (additive — n8n ignores unknown keys)
        qualified,
        lead_score: score,
        lead_quality: quality,
        disqualify_reason: dqReason,
        meta_event_id: eventId,
        meta_event_name: qualified ? "Lead" : "LeadLowIntent",
        meta_value: qualified ? score * 25 : 0,
        stage1_event_id: stage1EventIdRef.current,
        gf_sid: readGfSid(),
      }
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) console.error("Submit failed:", res.status)
    } catch (e) {
      console.error("Submit error:", e)
    }

    window.location.href = "/thank-you"
  }

  // Stage-2 hard disqualifiers (Blue Crab). The returned key is both the block screen and
  // the disqualify_reason the n8n labels read (propertyType / noEquity / shortOwnership / noReason).
  const stage2DisqualifyReason = (field: Stage2Field, value: string): string | null => {
    if (field === "propertyType" && (disqualifiedPropertyTypes.includes(value) || value === "condo-townhouse")) return "propertyType"
    if (field === "ownershipLength" && value === "1-3-years") return "noEquity"
    if (field === "ownershipLength" && value === "3-5-years") return "shortOwnership"
    // NOTE: "excellent" condition is a SOFT DQ (no block). It flows through, fails
    // isQualifiedForMeta → fires LeadLowIntent, and STILL posts as complete.
    if (field === "reason" && value === "none-of-above") return "noReason"
    return null
  }

  // Stage-2 hard DQ: tell n8n this seller was disqualified, so its 15-minute partial
  // follow-up labels them as disqualified. No pixel event; the route does not forward it
  // to GoFunnel.
  const sendDisqualified = (reason: string, answers: SurveyData) => {
    try {
      void fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_stage: "disqualified",
          firstName: answers.firstName.trim(),
          lastName: answers.lastName.trim(),
          name: fullNameOf(answers),
          email: answers.email,
          phone: answers.phone,
          address: answers.address,
          ...addressDetailsRef.current,
          isLegalOwner: answers.isLegalOwner,
          listedOnMarket: answers.listedOnMarket,
          propertyType: answers.propertyType,
          ownershipLength: answers.ownershipLength,
          condition: answers.condition,
          timeline: answers.timeline,
          reason: answers.reason,
          qualified: false,
          disqualify_reason: reason,
          tcpa_consent: tcpaConsent,
          source: `${SOURCE} (Stage 2 disqualified)`,
          submittedAt: new Date().toISOString(),
          stage1_event_id: stage1EventIdRef.current,
          gf_sid: readGfSid(),
          ...trackingRef.current,
        }),
      }).catch(() => undefined)
    } catch {
      // never block the disqualify screen
    }
  }

  const handleStage2OptionSelect = (field: Stage2Field, value: string) => {
    const next = { ...surveyData, [field]: value }
    setSurveyData(next)

    const dq = stage2DisqualifyReason(field, value)
    if (dq) { sendDisqualified(dq, next); disqualify(dq); return }

    setTimeout(() => {
      if (dqPendingRef.current) return
      if (stage2Step < totalStage2Steps) setStage2Step(stage2Step + 1)
      else void submitComplete(next)
    }, 300)
  }

  // Back stops at the first Stage-2 question: the early lead is already sent.
  const handleStage2Back = () => {
    if (stage2Step > 1) setStage2Step(stage2Step - 1)
  }

  // ============================================================
  // RENDER HELPERS
  // ============================================================
  const renderOptionButton = (
    option: { id: string; label: string; desc?: string },
    selectedValue: string,
    onClick: () => void
  ) => (
    <button
      key={option.id}
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border px-4 py-3 md:px-5 md:py-4 text-left text-base md:text-lg font-medium transition-all ${
        selectedValue === option.id
          ? "border-[#1d283b] bg-[#1d283b]/10 text-[#0F1D2F]"
          : "border-[#E2E8F0] bg-white text-[#0F1D2F] hover:border-[#1d283b]/50 hover:bg-[#F5F7FA]"
      }`}
    >
      {option.desc ? (
        <>
          <span className="block">{option.label}</span>
          <span className="mt-0.5 block text-sm font-normal text-[#5A6B7D]">{option.desc}</span>
        </>
      ) : (
        option.label
      )}
    </button>
  )

  const renderQuestion = (title: string, subtitle: string, options: ReactNode, grid = false) => (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl md:text-2xl font-semibold text-[#0F1D2F]">{title}</h2>
        <p className="mt-1 text-base text-[#5A6B7D]">{subtitle}</p>
      </div>
      <div className={grid ? "grid grid-cols-1 gap-2 sm:grid-cols-2" : "flex flex-col gap-2"}>{options}</div>
    </div>
  )

  const backButton = (onClick: () => void, disabled: boolean) => (
    <Button
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      className="text-[#5A6B7D] hover:text-[#0F1D2F] hover:bg-[#F5F7FA] text-base disabled:opacity-0"
    >
      <ArrowLeft className="mr-2 h-5 w-5" />
      Back
    </Button>
  )

  const spinner = (
    <span className="flex items-center gap-2">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      Submitting...
    </span>
  )

  const cardClass = "w-full max-w-2xl rounded-2xl border border-[#E2E8F0] bg-white p-4 md:p-6 shadow-lg"

  if (isDisqualified) {
    const disqualifyMessages: Record<string, { title: string; message: string; detail: string }> = {
      notOwner: {
        title: "We're Unable to Assist",
        message: "Unfortunately, we can only work with individuals who have the legal right to sell the property.",
        detail: "If you believe you have legal authority to sell (such as power of attorney, executor of estate, or court-appointed representative), please contact us directly.",
      },
      listed: {
        title: "We Can't Make an Offer Right Now",
        message: "We're unable to make an offer on properties that are currently listed on the market.",
        detail: "If your listing expires or you decide to take it off the market, we'd love to help. Feel free to reach out to us at that time.",
      },
      propertyType: {
        title: "We're Unable to Assist",
        message: "Unfortunately, we're not able to make an offer on this type of property at this time.",
        detail: "We primarily purchase single-family homes and multi-family properties. If you have a different property you'd like to sell, feel free to reach out.",
      },
      outOfArea: {
        title: "Outside Our Service Area",
        message: "Unfortunately, we don't currently buy properties in that area.",
        detail: "We only serve select markets at this time. If you believe your property is within our coverage area, please try a different address or give us a call.",
      },
      noEquity: {
        title: "We're Unable to Make an Offer",
        message: "Unfortunately, properties owned for less than 3 years typically don't have enough equity for us to make a fair cash offer.",
        detail: "If your situation changes or you'd like to discuss your options, feel free to give us a call. We're always happy to help.",
      },
      noReason: {
        title: "We're Not the Right Fit",
        message: "We work with homeowners who have a specific situation that calls for a fast, as-is cash sale. Without one, you'll typically get more money listing on the open market.",
        detail: "If your situation changes, feel free to come back any time. We'd be glad to help.",
      },
      shortOwnership: {
        title: "This May Not Be the Right Fit",
        message: "Based on your answers, we may not be the best fit for your situation right now.",
        detail: "We work best with homeowners who've owned their property a bit longer. If your situation changes, feel free to come back any time. We'd be glad to help.",
      },
    }
    const msg = disqualifyMessages[disqualifyReason] || disqualifyMessages.notOwner

    return (
      <div className={cardClass}>
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-[#0F1D2F]">{msg.title}</h2>
            <p className="mt-2 text-[#5A6B7D] text-lg">{msg.message}</p>
            <p className="mt-4 text-base text-[#5A6B7D]">{msg.detail}</p>
          </div>
          <a
            href={`tel:${phoneHref}`}
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#1d283b] px-8 py-4 text-lg text-white hover:bg-[#141b28] transition-colors"
          >
            Call Us: {phoneDisplay}
          </a>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className={cardClass}>
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
            <Check className="h-8 w-8 text-green-500" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-[#0F1D2F]">Thank You, {surveyData.firstName}!</h2>
            <p className="mt-2 text-[#5A6B7D] text-lg">We&apos;ve received your information and will be in touch shortly with your cash offer.</p>
            <p className="mt-4 text-base text-[#5A6B7D]">One of our team members will call you within 24 hours to discuss your property.</p>
          </div>
        </div>
      </div>
    )
  }

  const inputClass = (field: string) =>
    `h-14 text-lg rounded-xl border-[#E2E8F0] bg-white text-[#0F1D2F] placeholder:text-[#94A3B8] focus:border-[#1d283b] focus:ring-[#1d283b]/20 ${validationErrors[field] ? "border-red-500" : ""}`

  // ============================================================
  // STAGE 1 — one question per screen, NO progress bar
  // ============================================================
  if (stage === 1) {
    return (
      <div className={cardClass}>
        <div className="flex flex-col gap-3 md:gap-5">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-[#1d283b]" />
            <span className="text-base text-[#5A6B7D]">Get your free cash offer</span>
          </div>

          {stage1Step === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-[#0F1D2F]">What&apos;s your property address?</h2>
                <p className="mt-1 text-base text-[#5A6B7D]">Start typing and select your address from the dropdown.</p>
              </div>
              <div className="flex justify-center -mb-2">
                <ArrowDown className="h-6 w-6 text-[#1d283b] animate-bounce" />
              </div>
              <AddressAutocomplete
                value={surveyData.address}
                onChange={(address) => { setSurveyData((prev) => ({ ...prev, address })); setAddressVerified(false); setAddressOutOfArea(false) }}
                onSelect={handleAddressSelect}
                onOutOfArea={(addr) => { setSurveyData((prev) => ({ ...prev, address: addr })); setAddressVerified(true); setAddressOutOfArea(true) }}
                serviceAreas={serviceAreas}
                placeholder="Start typing your address..."
              />
              <Button
                onClick={handleAddressContinue}
                disabled={!(surveyData.address.trim().length > 0 && addressVerified)}
                className="w-full h-14 bg-[#1d283b] text-white text-lg font-semibold rounded-xl hover:bg-[#141b28] disabled:opacity-40 transition-all shadow-md hover:shadow-lg"
              >
                Get My Cash Offer
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}

          {stage1Step === 2 && renderQuestion(
            "Are you the legal homeowner?",
            "This helps us understand who we'll be working with.",
            LEGAL_OWNER_OPTIONS.map((o) => renderOptionButton(o, surveyData.isLegalOwner, () => handleOwnerSelect(o.id)))
          )}

          {stage1Step === 3 && renderQuestion(
            "Is the property currently listed?",
            "Let us know if the property is currently for sale.",
            LISTED_OPTIONS.map((o) => renderOptionButton(o, surveyData.listedOnMarket, () => handleListedSelect(o.id)))
          )}

          {stage1Step === STAGE1_STEPS && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-[#0F1D2F]">Where should we send your cash offer?</h2>
                <p className="mt-1 text-base text-[#5A6B7D]">Then a few quick questions about the house.</p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      placeholder="First name"
                      autoComplete="given-name"
                      value={surveyData.firstName}
                      onChange={(e) => { setSurveyData({ ...surveyData, firstName: e.target.value }); setValidationErrors({ ...validationErrors, firstName: "" }) }}
                      className={inputClass("firstName")}
                    />
                    {validationErrors.firstName && <p className="mt-1 text-xs text-red-500">{validationErrors.firstName}</p>}
                  </div>
                  <div>
                    <Input
                      placeholder="Last name"
                      autoComplete="family-name"
                      value={surveyData.lastName}
                      onChange={(e) => { setSurveyData({ ...surveyData, lastName: e.target.value }); setValidationErrors({ ...validationErrors, lastName: "" }) }}
                      className={inputClass("lastName")}
                    />
                    {validationErrors.lastName && <p className="mt-1 text-xs text-red-500">{validationErrors.lastName}</p>}
                  </div>
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Email address"
                    autoComplete="email"
                    value={surveyData.email}
                    onChange={(e) => { setSurveyData({ ...surveyData, email: e.target.value }); setValidationErrors({ ...validationErrors, email: "" }) }}
                    className={inputClass("email")}
                  />
                  {validationErrors.email && <p className="mt-1 text-xs text-red-500">{validationErrors.email}</p>}
                </div>
                <div>
                  <Input
                    type="tel"
                    placeholder="Phone number"
                    autoComplete="tel"
                    value={surveyData.phone}
                    onChange={(e) => { setSurveyData({ ...surveyData, phone: formatPhoneNumber(e.target.value) }); setValidationErrors({ ...validationErrors, phone: "" }) }}
                    maxLength={14}
                    className={inputClass("phone")}
                  />
                  {validationErrors.phone && <p className="mt-1 text-xs text-red-500">{validationErrors.phone}</p>}
                </div>

                {/* TCPA consent, naming the company */}
                <label className={`flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
                  validationErrors.tcpaConsent ? "border-red-500" : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                }`}>
                  <input
                    type="checkbox"
                    checked={tcpaConsent}
                    onChange={(e) => {
                      setTcpaConsent(e.target.checked)
                      if (e.target.checked) setValidationErrors({ ...validationErrors, tcpaConsent: "" })
                    }}
                    className="mt-0.5 h-5 w-5 shrink-0 rounded border-gray-300 accent-[#1d283b]"
                  />
                  <span className="text-xs text-[#5A6B7D] leading-snug">
                    By checking this box, I consent to receive calls and text messages (including autodialed) from {companyName} at the phone number provided. Consent is not a condition of any service. Standard message and data rates may apply. Reply STOP to opt out.
                  </span>
                </label>
                {validationErrors.tcpaConsent && <p className="-mt-2 text-xs text-red-500">{validationErrors.tcpaConsent}</p>}

                {/* Honeypot field */}
                <input
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="absolute -left-[9999px] opacity-0 pointer-events-none"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />
              </div>
            </div>
          )}

          {/* Navigation: option screens auto-advance; the address screen has its own big
              button; the contact screen submits here. */}
          {stage1Step !== 1 && (
            <div className="flex items-center justify-between">
              {backButton(handleStage1Back, isSubmitting)}
              {stage1Step === STAGE1_STEPS && (
                <Button
                  onClick={handleContactSubmit}
                  disabled={isSubmitting || !(
                    surveyData.firstName.trim().length > 0 &&
                    surveyData.lastName.trim().length > 0 &&
                    surveyData.email.trim().length > 0 &&
                    surveyData.phone.trim().length > 0
                  )}
                  className="bg-[#1d283b] text-white text-lg px-8 py-3 hover:bg-[#141b28] disabled:opacity-50"
                >
                  {isSubmitting ? spinner : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ============================================================
  // STAGE 2 — remaining questions, progress bar SHOWN
  // ============================================================
  const field = STAGE2_FIELDS[stage2Step - 1]
  return (
    <div className={cardClass}>
      <div className="flex flex-col gap-3 md:gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-[#1d283b]" />
            <span className="text-base text-[#5A6B7D]">Step {stage2Step} of {totalStage2Steps}</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: totalStage2Steps }).map((_, i) => (
              <div key={i} className={`h-1.5 w-6 rounded-full transition-colors ${i < stage2Step ? "bg-[#1d283b]" : "bg-gray-200"}`} />
            ))}
          </div>
        </div>

        {field === "propertyType" && renderQuestion(
          "What type of property is it?",
          "Select the option that best describes your property.",
          PROPERTY_TYPE_OPTIONS.map((o) => renderOptionButton(o, surveyData.propertyType, () => handleStage2OptionSelect("propertyType", o.id)))
        )}

        {field === "ownershipLength" && renderQuestion(
          "When did you purchase the home?",
          "This helps us estimate your equity position.",
          OWNERSHIP_LENGTH_OPTIONS.map((o) => renderOptionButton(o, surveyData.ownershipLength, () => handleStage2OptionSelect("ownershipLength", o.id)))
        )}

        {field === "condition" && renderQuestion(
          "What condition is the property in?",
          "Be honest. We buy houses in any condition.",
          CONDITION_OPTIONS.map((o) => renderOptionButton(o, surveyData.condition, () => handleStage2OptionSelect("condition", o.id)))
        )}

        {field === "timeline" && renderQuestion(
          "How soon are you looking to sell?",
          "Select your ideal timeline for closing.",
          TIMELINE_OPTIONS.map((o) => renderOptionButton(o, surveyData.timeline, () => handleStage2OptionSelect("timeline", o.id)))
        )}

        {field === "reason" && renderQuestion(
          "What's your reason for selling?",
          "This helps us understand your situation better.",
          REASON_OPTIONS.map((o) => renderOptionButton(o, surveyData.reason, () => handleStage2OptionSelect("reason", o.id))),
          true
        )}

        <div className="flex items-center justify-between">
          {backButton(handleStage2Back, stage2Step === 1 || isSubmitting)}
          {isSubmitting && (
            <span className="flex items-center gap-2 text-base text-[#5A6B7D]">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[#1d283b]" />
              Submitting...
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
