"use client"

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, ChevronDown, Leaf, Sprout, LayoutDashboard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      message: "",
    };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:8000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        setSubmitError("Failed to send message. Please try again.");
      }
    } catch (error) {
      setSubmitError("Network error. Please check your connection.");
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-green-100 via-green-50 to-white py-24 md:py-32">
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
              <span className="text-sm font-semibold tracking-wide uppercase">Get In Touch</span>
            </div>
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-gray-900 md:text-6xl">
              Contact Us
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Have questions or need help with your crops? Reach out to our team and we'll get back to you as soon as possible.
            </p>
          </div>
        </section>

        {/* Decorative Divider */}
        <div className="relative h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>

        {/* Main Contact Section */}
        <section className="relative py-20 bg-gradient-to-b from-white to-green-50">
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
                      <CardTitle className="text-2xl text-gray-900">Send us a Message</CardTitle>
                    </div>
                    <p className="text-gray-600">Fill out the form below and we'll respond within 24 hours</p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Name Field */}
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                            errors.name ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Your name"
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle size={14} />
                            {errors.name}
                          </p>
                        )}
                      </div>

                      {/* Email Field */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                            errors.email ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="your.email@example.com"
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle size={14} />
                            {errors.email}
                          </p>
                        )}
                      </div>

                      {/* Message Field */}
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                          Message
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows={6}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none ${
                            errors.message ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Tell us how we can help you..."
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
                        disabled={isSubmitting}
                        className="w-full gap-2 py-6 text-base bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send size={18} />
                            Send Message
                          </>
                        )}
                      </Button>

                      {/* Success Message */}
                      {submitSuccess && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
                          <CheckCircle2 size={20} />
                          <span>Message sent successfully! We'll get back to you soon.</span>
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
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Get in Touch</h2>
                  <p className="text-gray-600">Choose your preferred way to reach us</p>
                </div>
                
                <Card className="bg-white border-2 border-green-100 shadow-lg rounded-xl hover:shadow-xl hover:border-green-200 transition-all duration-300 group">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="rounded-xl bg-green-100 p-4 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                      <Mail size={28} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2 text-lg">Email</h3>
                      <a href="mailto:support@smartcropadvisor.com" className="text-green-600 hover:text-green-700 font-medium">
                        support@smartcropadvisor.com
                      </a>
                      <p className="text-sm text-gray-500 mt-1">We'll respond within 24 hours</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-2 border-green-100 shadow-lg rounded-xl hover:shadow-xl hover:border-green-200 transition-all duration-300 group">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="rounded-xl bg-green-100 p-4 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                      <Phone size={28} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2 text-lg">Phone</h3>
                      <a href="tel:+919876543210" className="text-green-600 hover:text-green-700 font-medium text-lg">
                        +91 9876543210
                      </a>
                      <p className="text-sm text-gray-500 mt-1">Mon-Fri, 9AM-6PM IST</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-2 border-green-100 shadow-lg rounded-xl hover:shadow-xl hover:border-green-200 transition-all duration-300 group">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="rounded-xl bg-green-100 p-4 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                      <MapPin size={28} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2 text-lg">Location</h3>
                      <p className="text-gray-700 font-medium">Kolkata, India</p>
                      <p className="text-sm text-gray-500 mt-1">Visit us at our office</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Info Card */}
                <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0 shadow-lg rounded-xl text-white">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <CheckCircle2 size={24} className="flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-lg mb-2">Quick Response Guaranteed</h3>
                        <p className="text-green-50 text-sm leading-relaxed">
                          Our dedicated support team is committed to helping farmers succeed. Get expert advice on crop management, soil health, and agricultural best practices.
                        </p>
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
        <section className="relative py-20 bg-gradient-to-b from-green-50 to-white overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-10 left-10 w-64 h-64 bg-green-200 rounded-full blur-3xl opacity-20"></div>
          
          <div className="container relative mx-auto max-w-4xl px-4">
            <div className="text-center mb-12">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-green-700">
                <AlertCircle size={20} />
                <span className="text-sm font-semibold tracking-wide uppercase">FAQ</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-gray-600">Find answers to common questions about our service</p>
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
        <section className="relative bg-gradient-to-r from-green-600 via-green-700 to-green-600 py-20 overflow-hidden">
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
              Start Optimizing Your Crop Health Today
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-xl text-green-50">
              Join thousands of farmers using AI-powered insights to grow smarter, healthier crops with data-driven recommendations.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" variant="secondary" className="gap-2 px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300">
                  <LayoutDashboard size={20} /> Go to Dashboard
                </Button>
              </Link>
              <Link href="/">
                <Button size="lg" variant="outline" className="gap-2 px-8 py-6 text-lg border-2 border-white bg-white text-green-700 hover:bg-green-50 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <ArrowRight size={20} /> Get Recommendations
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
