"use client"

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useAuthModalContext } from "@/components/AuthModalProvider";
import { Mail, MapPin, Send, CheckCircle2, AlertCircle, ChevronDown, Leaf, Sprout, LayoutDashboard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

const ContactPage = () => {
  const { data: session } = useSession();
  const { setIsAuthModalOpen } = useAuthModalContext();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    message: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const validateForm = () => {
    const newErrors = { name: "", message: "" };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = t("contact.name_required");
      isValid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = t("contact.message_required");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!session) {
      setIsAuthModalOpen(true);
      return;
    }

    setSubmitError("");
    setSubmitSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: session?.user?.email || "",
          message: formData.message,
        }),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setFormData({ name: "", message: "" });
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        setSubmitError(t("contact.error_sending"));
      }
    } catch (error) {
      setSubmitError(t("contact.error_network"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const faqs = [
    {
      question: "How accurate are the crop recommendations?",
      answer: "Our recommendations are based on real-time soil and weather data combined with machine learning algorithms trained on extensive agricultural datasets, ensuring high accuracy and reliability.",
    },
    {
      question: "How often is the data updated?",
      answer: "Environmental data including weather conditions and soil metrics are updated every 30 minutes to provide you with the most current information for decision-making.",
    },
    {
      question: "Do I need special sensors or equipment?",
      answer: "No special equipment is required. Our system works using your location data and integrates with weather and soil APIs to provide comprehensive analysis without additional hardware.",
    },
    {
      question: "Is my data secure and private?",
      answer: "Yes, we take data security seriously. All information is encrypted and securely stored in our database. We never share your personal data with third parties.",
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Fixed Background Layer */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-[-2]"
        style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&q=80')" }}
      />
      <main className="relative flex-grow z-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 md:py-32 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-64 h-64 bg-green-200 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-green-300 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/3 text-green-600 opacity-10">
              <Leaf size={120} />
            </div>
            <div className="absolute bottom-20 right-1/4 text-green-500 opacity-10">
              <Sprout size={100} />
            </div>
          </div>
          
          <div className="container relative mx-auto max-w-6xl px-4 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-white shadow-md">
              <Mail size={20} />
              <span className="text-sm font-semibold tracking-wide uppercase">{t("contact.get_in_touch_badge")}</span>
            </div>
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-gray-900 md:text-6xl">
              {t("contact.title")}
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              {t("contact.subtitle")}
            </p>
          </div>
        </section>

        {/* Decorative Divider */}
        <div className="relative h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>

        {/* Main Contact Section */}
        <section className="relative py-20 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-y border-white/20">
          {/* Background Accent */}
          <div className="absolute top-20 right-10 w-72 h-72 bg-green-100 rounded-full blur-3xl opacity-30"></div>
          
          <div className="container relative mx-auto max-w-6xl px-4">
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Contact Form */}
              <div>
                <Card className="bg-white border-2 border-green-100 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  {/* Green Top Accent Bar */}
                  <div className="h-2 bg-gradient-to-r from-green-500 via-green-600 to-green-700"></div>
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Send className="text-green-600" size={24} />
                      </div>
                      <CardTitle className="text-2xl text-gray-900">{t("contact.send_message_title")}</CardTitle>
                    </div>
                    <p className="text-gray-600">{t("contact.form_subtitle")}</p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Name Field */}
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          {t("contact.name_label")}
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 ${
                            errors.name ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder={t("contact.name_placeholder")}
                          style={{
                            '--tw-placeholder-opacity': '1',
                          } as React.CSSProperties}
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle size={14} />
                            {errors.name}
                          </p>
                        )}
                      </div>

                      {/* Message Field */}
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                          {t("contact.message_label")}
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows={6}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none text-gray-900 ${
                            errors.message ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder={t("contact.message_placeholder")}
                          style={{
                            '--tw-placeholder-opacity': '1',
                          } as React.CSSProperties}
                        />
                        {errors.message && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle size={14} />
                            {errors.message}
                          </p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={isSubmitting || !session}
                        className={`w-full gap-2 py-6 text-base shadow-md hover:shadow-lg transition-all duration-200 ${
                          !session
                            ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed text-gray-600"
                            : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            {t("contact.sending")}
                          </>
                        ) : !session ? (
                          <>
                            <Send size={18} />
                            {t("contact.sign_in_to_send")}
                          </>
                        ) : (
                          <>
                            <Send size={18} />
                            {t("contact.send_message")}
                          </>
                        )}
                      </Button>

                      {/* Success Message */}
                      {submitSuccess && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
                          <CheckCircle2 size={20} />
                          <span>{t("contact.success_message")}</span>
                        </div>
                      )}

                      {/* Error Message */}
                      {submitError && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
                          <AlertCircle size={20} />
                          <span>{submitError}</span>
                        </div>
                      )}
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Info */}
              <div className="space-y-6">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">{t("contact.contact_info_title")}</h2>
                  <p className="text-gray-600">{t("contact.contact_info_subtitle")}</p>
                </div>
                
                <Card className="bg-white border-2 border-green-100 shadow-lg rounded-xl hover:shadow-xl hover:border-green-200 transition-all duration-300 group">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="rounded-xl bg-green-100 p-4 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                      <Mail size={28} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2 text-lg">{t("contact.email_label")}</h3>
                      <a href="mailto:noreplycropstation@gmail.com" className="text-green-600 hover:text-green-700 font-medium">
                        noreplycropstation@gmail.com
                      </a>
                      <p className="text-sm text-gray-500 mt-1">{t("contact.email_response_time")}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-2 border-green-100 shadow-lg rounded-xl hover:shadow-xl hover:border-green-200 transition-all duration-300 group">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="rounded-xl bg-green-100 p-4 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                      <MapPin size={28} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2 text-lg">{t("contact.location_label")}</h3>
                      <p className="text-gray-700 font-medium">Kolkata, India</p>
                      <p className="text-sm text-gray-500 mt-1">{t("contact.office_note")}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Info Card */}
                <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0 shadow-lg rounded-xl text-white">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <CheckCircle2 size={24} className="flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-lg mb-2">{t("contact.quick_response")}</h3>
                        <p className="text-green-50 text-sm leading-relaxed">{t("contact.quick_response_desc")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Decorative Divider */}
        <div className="relative h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>

        {/* FAQ Section */}
        <section className="relative py-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-10 left-10 w-64 h-64 bg-green-200 rounded-full blur-3xl opacity-20"></div>
          
          <div className="container relative mx-auto max-w-4xl px-4">
            <div className="text-center mb-12">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-green-700">
                <AlertCircle size={20} />
                <span className="text-sm font-semibold tracking-wide uppercase">{t("contact.faq_badge")}</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{t("contact.faq_title")}</h2>
              <p className="text-lg text-gray-600">{t("contact.faq_subtitle")}</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="bg-white border-2 border-green-100 shadow-md rounded-xl hover:border-green-300 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-0">
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-green-50 transition-colors rounded-xl"
                    >
                      <span className="font-bold text-gray-900 pr-4">{faq.question}</span>
                      <ChevronDown
                        size={24}
                        className={`text-green-600 flex-shrink-0 transition-transform duration-300 ${
                          openFaq === index ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        openFaq === index ? "max-h-96" : "max-h-0"
                      }`}
                    >
                      <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-green-100 pt-4">{faq.answer}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20 overflow-hidden bg-green-900/80 backdrop-blur-md border-t border-white/10">
          {/* Decorative Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-20 text-white">
              <Leaf size={100} />
            </div>
            <div className="absolute bottom-10 right-20 text-white">
              <Sprout size={120} />
            </div>
          </div>
          
          <div className="container relative mx-auto max-w-4xl px-4 text-center">
            <Leaf className="mx-auto mb-6 text-white" size={48} />
            <h2 className="mb-4 text-4xl font-extrabold text-white md:text-5xl">
              {t("contact.cta_title")}
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-xl text-green-50">
              {t("contact.cta_desc")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/crops">
                <Button size="lg" className="gap-2 px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 text-green-700 border-2 border-white bg-white hover:bg-green-50">
                  <LayoutDashboard size={20} /> {t("contact.go_to_dashboard")}
                </Button>
              </Link>
              <Link href="/">
                <Button size="lg" variant="outline" className="gap-2 px-8 py-6 text-lg border-2 border-white bg-white text-green-700 hover:bg-green-50 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <ArrowRight size={20} /> {t("contact.get_recommendations")}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ContactPage;
