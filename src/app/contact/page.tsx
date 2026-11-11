"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { COUNTRY_CODES, detectUserCountry } from "@/utils/countryCodes";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  Copy, 
  Check, 
  ShieldCheck, 
  UserCheck, 
  Globe2, 
  Headphones, 
  Award,
  MessageCircle,
  X,
  AlertCircle
} from "lucide-react";

import { 
  contactService, 
  ContactPageSettings, 
  SupportTeamMember 
} from "@/services/contactService";
import { ScrollReveal, ScrollRevealGroup, ScrollRevealItem } from "@/components/common/ScrollReveal";

// Fallback initial values for instant SEO & server render
const INITIAL_SETTINGS: ContactPageSettings = {
  headquartersTitle: "Dhaka Headquarters",
  headquartersAddress: "Level 6, Navana Tower, Gulshan-1, Dhaka-1212, Bangladesh.",
  headquartersNote: "Direct access via Gulshan Circle 1",
  officeHoursTitle: "Office Hours & Counseling",
  officeHoursSchedule: "Saturday – Thursday: 10:00 AM – 7:00 PM",
  officeHoursNote: "Friday: Closed (Hotline & WhatsApp Active)",
};

const INITIAL_TEAM: SupportTeamMember[] = [
  {
    id: "ceo",
    name: "Arafat Hossain",
    role: "Founder & Chief Executive Officer",
    badge: "EXECUTIVE",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    department: "Executive Strategy & University Alliances",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    avatarAlt: "Arafat Hossain - Founder & CEO",
    phone: "+880 1712-345678",
    whatsapp: "https://wa.me/8801712345678?text=Hello%20Arafat%2C%20I%20would%20like%20to%20discuss%20higher%20study%20admissions.",
    facebook: "https://facebook.com/riseabroad",
    email: "ceo@riseabroad.com",
    order: 1,
    isActive: true,
  },
  {
    id: "head-admissions",
    name: "Dr. Tariqul Islam",
    role: "Head of Global Admissions",
    badge: "ADMISSIONS",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    department: "Direct University Offers & Partner Relations",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    avatarAlt: "Dr. Tariqul Islam - Head of Global Admissions",
    phone: "+880 1823-456789",
    whatsapp: "https://wa.me/8801823456789?text=Hello%20Admissions%20Team%2C%20I%20need%20assistance%20with%20my%20university%20offer.",
    facebook: "https://facebook.com/riseabroad",
    email: "admissions@riseabroad.com",
    order: 2,
    isActive: true,
  },
  {
    id: "lead-counselor",
    name: "Nusrat Jahan",
    role: "Lead Visa & Scholarship Counselor",
    badge: "VISA DESK",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    department: "Embassy Interviews, SOP Review & Visas",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    avatarAlt: "Nusrat Jahan - Lead Visa & Scholarship Counselor",
    phone: "+880 1934-567890",
    whatsapp: "https://wa.me/8801934567890?text=Hello%20Nusrat%2C%20I%20have%20questions%20about%20my%20visa%20interview.",
    facebook: "https://facebook.com/riseabroad",
    email: "counseling@riseabroad.com",
    order: 3,
    isActive: true,
  },
  {
    id: "hotline",
    name: "24/7 Student Hotline & Support",
    role: "Customer Care & Help Center",
    badge: "24/7 HOTLINE",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    department: "Instant Student Support & Document Guidance",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
    avatarAlt: "24/7 Student Hotline & Support Desk",
    phone: "+880 9612-000000",
    whatsapp: "https://wa.me/8801712345678?text=Hello%20Rise%20Abroad%20Support%2C%20I%20need%20urgent%20help.",
    facebook: "https://facebook.com/riseabroad",
    email: "support@riseabroad.com",
    order: 4,
    isActive: true,
  },
];

export default function ContactPage() {
  // Live dynamic settings and team state from DB
  const [settings, setSettings] = useState<ContactPageSettings>(INITIAL_SETTINGS);
  const [team, setTeam] = useState<SupportTeamMember[]>(INITIAL_TEAM);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  // Smart Country Code & Phone Number state
  const [selectedShort, setSelectedShort] = useState("BD");
  const [countryCode, setCountryCode] = useState("+880");
  const [phone, setPhone] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Copy Tracker for Phone and Email (keyed by `memberId-phone` or `memberId-email`)
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Auto-detect visitor country code based on system timezone & Fetch Live CMS data from DB
  useEffect(() => {
    document.title = "Contact | Rise Abroad Education";
    const detected = detectUserCountry();
    if (detected) {
      setSelectedShort(detected.short);
      setCountryCode(detected.code);
    }

    // Fetch dynamic contact data from API
    const loadCmsData = async () => {
      try {
        const [fetchedSettings, fetchedTeam] = await Promise.all([
          contactService.getSettings(),
          contactService.getTeamMembers(false),
        ]);
        if (fetchedSettings) setSettings(fetchedSettings);
        if (fetchedTeam && fetchedTeam.length > 0) setTeam(fetchedTeam);
      } catch (err) {
        console.warn("Contact CMS loaded default fallback:", err);
      }
    };

    loadCmsData();
  }, []);

  const activeCountry =
    COUNTRY_CODES.find((c) => c.short === selectedShort) ||
    COUNTRY_CODES.find((c) => c.code === countryCode) ||
    COUNTRY_CODES[7]; // Default BD

  const handlePhoneChange = (inputVal: string) => {
    let cleaned = inputVal.replace(/[^\d+]/g, "");

    // Check if user pasted/typed with +code
    if (cleaned.startsWith("+")) {
      const foundCountry = COUNTRY_CODES.find((c) => cleaned.startsWith(c.code));
      if (foundCountry) {
        setSelectedShort(foundCountry.short);
        setCountryCode(foundCountry.code);
        cleaned = cleaned.slice(foundCountry.code.length);
      } else {
        cleaned = cleaned.replace(/^\+/, "");
      }
    } else if (cleaned.startsWith("880") && cleaned.length > 10) {
      cleaned = cleaned.slice(3);
      setSelectedShort("BD");
      setCountryCode("+880");
    }

    // Keep all numeric digits (allows typing 0 without blocking)
    cleaned = cleaned.replace(/\D/g, "");

    const conf = COUNTRY_CODES.find((c) => c.short === selectedShort) || COUNTRY_CODES.find((c) => c.code === countryCode);
    const max = conf?.maxLength || 12;
    if (cleaned.length > max) {
      cleaned = cleaned.slice(0, max);
    }

    setPhone(cleaned);
  };

  const formatPreview = () => {
    if (!phone) return null;
    const raw = phone.startsWith("0") ? phone.slice(1) : phone;
    if (!raw) return `${countryCode} (0)`;
    if (countryCode === "+880") {
      if (raw.length <= 4) return `+880 ${raw}`;
      return `+880 ${raw.slice(0, 4)}-${raw.slice(4)}`;
    }
    return `${countryCode} ${raw}`;
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const cleanNumber = phone.startsWith("0") ? phone.slice(1) : phone;
    const finalContactNo = cleanNumber ? `${countryCode}${cleanNumber}` : "";

    try {
      await contactService.sendInquiry({
        name: formData.name,
        email: formData.email,
        phone: finalContactNo,
        subject: formData.subject,
        message: formData.message,
        country: selectedShort === "BD" ? "Bangladesh" : selectedShort,
      });

      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
      setPhone("");

      // Auto-hide the floating toast notification after 6 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 6000);
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        "Could not send your message. Please check your network and try again.";
      setSubmitError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-7 px-4 sm:px-6 lg:px-8 relative">
      {/* Floating Top-Right Toast Notification (Screenshot 1 position - Zero form height shift) */}
      {submitted && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-auto p-4 rounded-2xl bg-slate-900/95 border border-emerald-500/50 text-emerald-400 text-sm flex items-start gap-3 shadow-2xl shadow-emerald-950/60 backdrop-blur-xl animate-in fade-in slide-in-from-top-3 duration-300">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
          <div className="flex-1 pr-2">
            <h4 className="font-bold text-white text-sm">Message Sent Successfully!</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Thank you for contacting Rise Abroad Education. Our counseling team has received your inquiry and will reach out to you promptly.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {submitError && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-auto p-4 rounded-2xl bg-slate-900/95 border border-rose-500/50 text-rose-400 text-sm flex items-start gap-3 shadow-2xl shadow-rose-950/60 backdrop-blur-xl animate-in fade-in slide-in-from-top-3 duration-300">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1 pr-2">
            <h4 className="font-bold text-white text-sm">Submission Error</h4>
            <p className="text-xs text-rose-300 mt-1 leading-relaxed">
              {submitError}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSubmitError(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* ========================================================
            TOP SECTION: 2-Column Layout
            Left: Title, Intro & Location/Office Hours Cards
            Right: Interactive Contact Form
           ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: Title, Intro text & Location Cards */}
          <ScrollReveal direction="up" yOffset={28} duration={0.5} className="lg:col-span-5 space-y-5">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                <Globe2 className="w-3.5 h-3.5" />
                <span>Connect With Admissions & Leadership</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug sm:leading-relaxed">
                We Are Here to{" "}
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                  Guide Your Journey
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pt-0.5">
                Have questions about university admissions, visa applications, scholarships, or document assessments? Reach out to our expert leadership, visit our offices, or send us a message directly.
              </p>
            </div>

            {/* Location, Office Hours & Key Assurances */}
            <div className="space-y-3 pt-1">
              {/* Dhaka Headquarters */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/30 transition-all flex items-start gap-3.5 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {settings.headquartersTitle || "Dhaka Headquarters"}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {settings.headquartersAddress || "Level 6, Navana Tower, Gulshan-1, Dhaka-1212, Bangladesh."}
                  </p>
                  {settings.headquartersNote && (
                    <span className="inline-block mt-1.5 text-[11px] font-medium text-blue-400/90">
                      {settings.headquartersNote}
                    </span>
                  )}
                </div>
              </div>

              {/* Office Hours */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/30 transition-all flex items-start gap-3.5 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {settings.officeHoursTitle || "Office Hours & Counseling"}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    <strong className="text-slate-200">{settings.officeHoursSchedule || "Saturday – Thursday: 10:00 AM – 7:00 PM"}</strong>
                    {settings.officeHoursNote && (
                      <>
                        <br />
                        <span className="text-amber-400/90">{settings.officeHoursNote}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Trust Badges Bar */}
              <div className="grid grid-cols-2 gap-3 pt-0.5">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-2.5 text-xs text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-[11px] font-medium">Free Initial Assessment</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-2.5 text-xs text-slate-300">
                  <Headphones className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="text-[11px] font-medium">Fast Counselor Response</span>
                </div>
              </div>

              {/* Quick Jump Link to Leadership Desk Below */}
              <div className="pt-1">
                <a
                  href="#leadership-team"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm group cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span>Meet Our Leadership & Support Team</span>
                  <span className="text-indigo-400 group-hover:translate-y-0.5 transition-transform text-xs">↓</span>
                </a>
              </div>
            </div>
          </ScrollReveal>

          {/* RIGHT COLUMN: Interactive Contact Form */}
          <ScrollReveal direction="up" yOffset={32} delay={0.12} duration={0.55} className="lg:col-span-7">
            <div className="glass-panel bg-slate-900/70 border border-slate-800/90 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-1 mb-5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-400" />
                  <span>Send Us a Message</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Leave your details and higher study query below. Our admissions desk will get in touch with you promptly.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Full Name & Email (2 Columns on tablet/desktop) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="yourname@gmail.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Upgraded Phone Number with Global A-Z Country Picker & Smart Live Preview */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      Phone / WhatsApp Number <span className="text-rose-400">*</span>
                    </label>
                    {phone ? (
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 font-semibold animate-in fade-in duration-200">
                        <span>Preview:</span>
                        <strong>{formatPreview()}</strong>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">
                        e.g. 017... or 17...
                      </span>
                    )}
                  </div>

                  <div className="flex rounded-xl overflow-hidden border border-slate-800 bg-slate-950 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/40 transition-all">
                    {/* Country Selector (A-Z Global List) */}
                    <select
                      value={selectedShort}
                      onChange={(e) => {
                        const found = COUNTRY_CODES.find((c) => c.short === e.target.value);
                        if (found) {
                          setSelectedShort(found.short);
                          setCountryCode(found.code);
                          if (found.code === "+880" && phone.startsWith("0")) {
                            setPhone(phone.slice(1));
                          }
                        }
                      }}
                      className="bg-slate-900 border-r border-slate-800 text-xs text-slate-200 px-3 py-2.5 focus:outline-none cursor-pointer hover:bg-slate-800/80 transition-colors shrink-0 font-medium max-w-[155px]"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option
                          key={`${c.short}-${c.code}`}
                          value={c.short}
                          className="bg-slate-900 text-slate-100 py-1 font-sans"
                        >
                          {c.country} ({c.code})
                        </option>
                      ))}
                    </select>

                    {/* Phone Input */}
                    <div className="relative flex-1 min-w-0">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder={activeCountry.placeholder}
                        className="w-full bg-transparent pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Subject / Purpose of Message */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Subject / Topic <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Higher Study Inquiry, Visa Guidance, or General Counseling"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Detailed Message */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Your Message <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Write your message or question here. Feel free to describe what program, country, or assistance you are seeking..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-10 text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 cursor-pointer justify-center gap-2 mt-1"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? "Sending Message..." : "Submit Your Message"}</span>
                </Button>
              </form>
            </div>
          </ScrollReveal>
        </div>

        {/* ========================================================
            BOTTOM SECTION: Leadership & Support Desk
            4 Profile Cards neatly organized in a 2x2 Responsive Grid
           ======================================================== */}
        <div id="leadership-team" className="space-y-6 pt-8 border-t border-slate-800/80 scroll-mt-20">
          <ScrollReveal direction="up" yOffset={24} duration={0.5} className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Direct Leadership & Support Desk</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Our Leadership & Support Desk
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Direct contact with executive management, lead admissions counselors & dedicated WhatsApp support desk.
            </p>
          </ScrollReveal>

          {/* 2x2 Grid of Profile Cards with Staggered Scroll Reveal */}
          <ScrollRevealGroup staggerDelay={0.12} className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {team.map((member) => {
              const isPhoneCopied = copiedKey === `${member.id}-phone`;
              const isEmailCopied = copiedKey === `${member.id}-email`;

              return (
                <ScrollRevealItem
                  key={member.id}
                  yOffset={32}
                  className="glass-panel bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/40 rounded-2xl p-5 shadow-xl transition-all duration-200 group relative overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Avatar, Name, Role & Badges */}
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 ring-2 ring-blue-500/30 group-hover:ring-blue-400/60 transition-all shadow-md">
                          <img
                            src={member.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                            alt={member.avatarAlt || `${member.name} - ${member.role}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        {/* Live Online Green Indicator */}
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-950 rounded-full" />
                      </div>

                      {/* Info & Badge */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                            {member.name}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase border ${member.badgeColor}`}
                          >
                            {member.badge}
                          </span>
                        </div>

                        <p className="text-xs text-indigo-300 font-medium mt-0.5 truncate">
                          {member.role}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {member.department}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Details & Action Buttons */}
                  <div className="mt-4 pt-3.5 border-t border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    {/* Contact Pills: Phone & Email with Copy */}
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      {/* Phone pill */}
                      {member.phone && (
                        <div className="inline-flex items-center gap-1.5 bg-slate-950/70 border border-slate-800/80 rounded-xl px-2.5 py-1.5 hover:border-slate-700 transition-colors">
                          <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="font-mono text-xs text-slate-200">{member.phone}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(`${member.id}-phone`, member.phone)}
                            title="Copy phone number"
                            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                          >
                            {isPhoneCopied ? (
                              <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-400">
                                <Check className="w-3.5 h-3.5" />
                                <span>Copied!</span>
                              </span>
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}

                      {/* Email pill */}
                      {member.email && (
                        <div className="inline-flex items-center gap-1.5 bg-slate-950/70 border border-slate-800/80 rounded-xl px-2.5 py-1.5 hover:border-slate-700 transition-colors">
                          <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <a
                            href={`mailto:${member.email}`}
                            title={`Send email to ${member.name}`}
                            className="text-xs text-slate-300 hover:text-white transition-colors truncate max-w-[150px] sm:max-w-[180px]"
                          >
                            {member.email}
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCopy(`${member.id}-email`, member.email)}
                            title="Copy email address"
                            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                          >
                            {isEmailCopied ? (
                              <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-400">
                                <Check className="w-3.5 h-3.5" />
                                <span>Copied!</span>
                              </span>
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* WhatsApp & Facebook Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                      {/* WhatsApp Button */}
                      {member.whatsapp && (
                        <a
                          href={member.whatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M17.507 14.307l-.009.075c-.238.169-.476.338-.713.506-.237.168-.475.337-.712.505-.181.129-.387.166-.604.113-.393-.098-.795-.236-1.196-.407-.803-.342-1.583-.812-2.316-1.391-.733-.578-1.385-1.258-1.93-2.016-.273-.379-.508-.78-.696-1.197-.105-.232-.083-.448.066-.642.122-.159.252-.311.383-.464.13-.153.261-.305.392-.458.172-.2.203-.432.093-.658-.109-.226-.525-1.267-.719-1.734-.194-.467-.394-.474-.633-.483l-.539-.022c-.247 0-.485.092-.663.256-.358.33-.637.74-.821 1.206-.277.7-.291 1.488-.041 2.278.375 1.185 1.096 2.298 2.083 3.208.988.91 2.208 1.579 3.523 1.93 1.314.35 2.585.347 3.659-.009.537-.178 1.004-.499 1.348-.927.172-.213.253-.48.228-.755-.05-.547-.327-1.18-.753-1.455zM12 2C6.477 2 2 6.477 2 12c0 1.892.525 3.662 1.438 5.176L2.1 22l4.981-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                          </svg>
                          <span>WhatsApp</span>
                        </a>
                      )}

                      {/* Facebook Button */}
                      {member.facebook && (
                        <a
                          href={member.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-400 text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                          </svg>
                          <span>Facebook</span>
                        </a>
                      )}
                    </div>
                  </div>
                </ScrollRevealItem>
              );
            })}
          </ScrollRevealGroup>
        </div>

      </div>
    </div>
  );
}
