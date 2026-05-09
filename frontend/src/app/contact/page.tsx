"use client"

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useAuthModalContext } from "@/components/AuthModalProvider";
import {
  Mail, MapPin, Send, CheckCircle2, AlertCircle,
  ChevronDown, Leaf, MessageSquare, HelpCircle, Clock, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/LanguageProvider";

/* ─── Hero ─── */
const Hero = () => {
  const { t } = useLanguage()
  return (
    <section
      className="relative overflow-hidden py-24 md:py-32"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[6px]" />
      <div className="container relative z-10 mx-auto max-w-5xl px-4 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-2 text-white">
          <Mail size={20} />
          <span className="text-base font-semibold tracking-wide uppercase">{t("contact.get_in_touch_badge")}</span>
        </div>
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-white md:text-6xl drop-shadow-lg">
          {t("contact.title")}
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-white/80 drop-shadow">
          {t("contact.subtitle")}
        </p>
      </div>
    </section>
  )
}

/* ─── Contact Form + Info ─── */
const ContactSection = () => {
  const { data: session } = useSession();
  const { setIsAuthModalOpen } = useAuthModalContext();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({ name: session?.user?.name || "", message: "" });
  const [errors, setErrors] = useState({ name: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const validate = () => {
    const e = { name: "", message: "" };
    let ok = true;
    if (!formData.name.trim()) { e.name = t("contact.name_required"); ok = false; }
    if (!formData.message.trim()) { e.message = t("contact.message_required"); ok = false; }
    setErrors(e);
    return ok;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!session) { setIsAuthModalOpen(true); return; }
    setSubmitError(""); setSubmitSuccess(false);
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, email: session?.user?.email || "", message: formData.message }),
      });
      if (res.ok) {
        setSubmitSuccess(true);
        setFormData({ name: "", message: "" });
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        setSubmitError(t("contact.error_sending"));
      }
    } catch {
      setSubmitError(t("contact.error_network"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name as keyof typeof errors]) setErrors(p => ({ ...p, [name]: "" }));
  };

  const infoCards = [
    { icon: Mail,   title: t("contact.email_label"),    primary: "noreplycropstation@gmail.com", sub: t("contact.email_response_time"), href: "mailto:noreplycropstation@gmail.com" },
    { icon: MapPin, title: t("contact.location_label"), primary: "Kolkata, India",               sub: t("contact.office_note") },
    { icon: Clock,  title: t("contact.quick_response"), primary: "Within 24 hours",              sub: t("contact.quick_response_desc") },
    { icon: Shield, title: "Data Security",             primary: "100% Encrypted",               sub: "Your data is always private and never shared with third parties." },
  ]

  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Section header */}
        <div className="mb-14 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/15 text-sm px-4 py-1.5 font-semibold">
            <MessageSquare size={15} className="mr-1.5" />{t("contact.send_message_title")}
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">{t("contact.contact_info_title")}</h2>
          <p className="mt-3 text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">{t("contact.contact_info_subtitle")}</p>
        </div>

        <div className="grid gap-10 lg:grid-cols-2 items-start">
          {/* ── Form card ── */}
          <div className="rounded-2xl bg-gray-50 dark:bg-gray-800 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary"><Send size={22} /></div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{t("contact.send_message_title")}</h3>
                <p className="text-base text-gray-500 dark:text-gray-400">{t("contact.form_subtitle")}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-base font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                  {t("contact.name_label")}
                </label>
                <input
                  type="text" id="name" name="name"
                  value={formData.name} onChange={handleChange}
                  placeholder={t("contact.name_placeholder")}
                  className={`w-full px-4 py-3 rounded-lg border text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${errors.name ? "border-red-500" : "border-gray-200 dark:border-gray-600"}`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={14} />{errors.name}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-base font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                  {t("contact.message_label")}
                </label>
                <textarea
                  id="message" name="message"
                  value={formData.message} onChange={handleChange}
                  rows={6} placeholder={t("contact.message_placeholder")}
                  className={`w-full px-4 py-3 rounded-lg border text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none ${errors.message ? "border-red-500" : "border-gray-200 dark:border-gray-600"}`}
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={14} />{errors.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
                onClick={!session ? () => setIsAuthModalOpen(true) : undefined}
              >
                {isSubmitting
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{t("contact.sending")}</>
                  : !session
                  ? <><Send size={16} />{t("contact.sign_in_to_send")}</>
                  : <><Send size={16} />{t("contact.send_message")}</>
                }
              </Button>

              {submitSuccess && (
                <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center gap-2 text-green-800 dark:text-green-300 text-base">
                  <CheckCircle2 size={18} />{t("contact.success_message")}
                </div>
              )}
              {submitError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-center gap-2 text-red-800 dark:text-red-300 text-base">
                  <AlertCircle size={18} />{submitError}
                </div>
              )}
            </form>
          </div>

          {/* ── Info cards ── */}
          <div className="flex flex-col gap-4">
            {infoCards.map(({ icon: Icon, title, primary, sub, href }) => (
              <div key={title} className="rounded-2xl bg-gray-50 dark:bg-gray-800 shadow-sm p-6 flex items-center gap-5">
                <div className="rounded-xl bg-primary/10 p-3 text-primary shrink-0"><Icon size={24} /></div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-0.5">{title}</h3>
                  {href
                    ? <a href={href} className="text-primary hover:underline text-base font-medium break-all">{primary}</a>
                    : <p className="text-base font-semibold text-gray-900 dark:text-white">{primary}</p>
                  }
                  <p className="text-base text-gray-500 dark:text-gray-400 mt-1">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── FAQ ─── */
const faqs = [
  { question: "How accurate are the crop recommendations?", answer: "Our recommendations are based on real-time soil and weather data combined with machine learning algorithms trained on extensive agricultural datasets, ensuring high accuracy and reliability." },
  { question: "How often is the data updated?", answer: "Environmental data including weather conditions and soil metrics are updated every 30 minutes to provide you with the most current information for decision-making." },
  { question: "Do I need special sensors or equipment?", answer: "No special equipment is required. Our system works using your location data and integrates with weather and soil APIs to provide comprehensive analysis without additional hardware." },
  { question: "Is my data secure and private?", answer: "Yes, we take data security seriously. All information is encrypted and securely stored. We never share your personal data with third parties." },
]

const FAQ = () => {
  const { t } = useLanguage()
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-14 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/15 text-sm px-4 py-1.5 font-semibold">
            <HelpCircle size={15} className="mr-1.5" />{t("contact.faq_badge")}
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">{t("contact.faq_title")}</h2>
          <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">{t("contact.faq_subtitle")}</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span className="font-semibold text-gray-900 dark:text-white pr-4 text-base">{faq.question}</span>
                <ChevronDown
                  size={20}
                  className={`text-primary shrink-0 transition-transform duration-300 ${open === i ? "rotate-180" : ""}`}
                />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${open === i ? "max-h-60" : "max-h-0"}`}>
                <p className="px-6 pb-6 text-base text-gray-500 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-4">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Footer CTA ─── */
const FooterCTA = () => {
  const { t } = useLanguage()
  return (
    <section
      className="relative py-20"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[6px]" />
      <div className="relative z-10 container mx-auto max-w-3xl px-4 text-center">
        <Leaf className="mx-auto mb-6 text-green-400" size={40} />
        <h2 className="mb-4 text-4xl font-bold text-white drop-shadow-lg">{t("contact.cta_title")}</h2>
        <p className="mx-auto max-w-xl text-lg text-white/80">{t("contact.cta_desc")}</p>
      </div>
    </section>
  )
}

/* ─── Page ─── */
export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <Hero />
        <ContactSection />
        <FAQ />
        <FooterCTA />
      </main>
    </div>
  );
}
