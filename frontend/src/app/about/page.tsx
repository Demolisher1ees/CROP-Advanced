"use client"

import {
  Leaf, Sun, Droplets, MapPin, Cpu, CloudSun, BarChart3,
  Sprout, Zap, Globe, Server, LayoutDashboard, Target,
  Eye, Users, CheckCircle2, ArrowRight, Brain, Database,
  Code2, Layers, Workflow
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { useAuthModalContext } from "@/components/AuthModalProvider";
import { useSession } from "next-auth/react";

/* ─── Hero ─── */
const Hero = () => {
  const { setIsAuthModalOpen, triggerNavGlow } = useAuthModalContext()
  const { data: session } = useSession()

  const handleGetStarted = () => {
    if (!session) {
      triggerNavGlow()
    } else {
      window.location.href = '/'
    }
  }

  const handleGetRecs = () => {
    if (!session) {
      triggerNavGlow()
    } else {
      window.location.href = '/'
    }
  }

  return (
  <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-green-100 to-green-50 py-24 md:py-32">
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-10 left-10 text-primary"><Leaf size={120} /></div>
      <div className="absolute bottom-10 right-10 text-green-600"><Sprout size={100} /></div>
      <div className="absolute top-1/2 right-1/4 text-green-700"><Sun size={80} /></div>
    </div>
    <div className="container relative mx-auto max-w-5xl px-4 text-center">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary">
        <Leaf size={20} />
        <span className="text-sm font-semibold tracking-wide uppercase">FarmIQ</span>
      </div>
      <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground md:text-6xl">
        AI-Powered Real-Time<br />
        <span className="text-primary">Crop Intelligence</span>
      </h1>
      <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
        Optimize crop health and boost productivity with real-time soil and weather analysis powered by machine learning — actionable insights delivered to your fingertips.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button onClick={handleGetStarted}>
          <Button size="lg" className="gap-2">
            <LayoutDashboard size={18} /> Go to Home
          </Button>
        </button>
        <button onClick={handleGetRecs}>
          <Button size="lg" variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/5">
            <Sprout size={18} /> Get Recommendations
          </Button>
        </button>
      </div>
    </div>
  </section>
  )
}

/* ─── Project Overview ─── */
const Overview = () => (
  <section className="py-20 bg-background">
    <div className="container mx-auto max-w-6xl px-4">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/15">About the Platform</Badge>
          <h2 className="mb-6 text-3xl font-bold text-foreground">What is FarmIQ?</h2>
          <p className="mb-4 text-muted-foreground leading-relaxed">
            FarmIQ is an intelligent agricultural platform that bridges the gap between farmers and modern technology. Many farmers lack access to real-time, data-driven insights about soil conditions and weather patterns that directly impact crop health.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Our platform solves this by combining real-time environmental data with machine learning to deliver personalized crop care recommendations — from irrigation schedules to fertilization plans — helping farmers make smarter, faster decisions.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { icon: BarChart3, title: "Real-Time Analysis", desc: "Live soil & weather monitoring" },
            { icon: Brain, title: "AI-Driven Insights", desc: "ML-powered recommendations" },
            { icon: MapPin, title: "Location-Based", desc: "Geo-specific crop advice" },
            { icon: Zap, title: "Instant Results", desc: "Actionable data in seconds" },
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="border-border/60 bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="rounded-lg bg-primary/10 p-2 text-primary"><Icon size={20} /></div>
                <div>
                  <p className="font-semibold text-card-foreground">{title}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  </section>
);

/* ─── How It Works ─── */
const steps = [
  { icon: MapPin, title: "Detect Location", desc: "Automatically detects the user's geographic location using geolocation APIs." },
  { icon: CloudSun, title: "Fetch Weather Data", desc: "Retrieves real-time weather conditions including temperature, humidity, and rainfall." },
  { icon: Droplets, title: "Fetch Soil Data", desc: "Collects live soil health data such as pH, moisture, and nutrient levels." },
  { icon: Cpu, title: "ML Analysis", desc: "Processes all data through a trained RandomForest model for intelligent analysis." },
  { icon: Sprout, title: "Get Recommendations", desc: "Delivers personalized crop care suggestions: irrigation, fertilization, shading, and more." },
];

const HowItWorks = () => (
  <section className="bg-secondary/40 py-20">
    <div className="container mx-auto max-w-5xl px-4">
      <div className="mb-14 text-center">
        <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/15">Process</Badge>
        <h2 className="text-3xl font-bold text-foreground">How It Works</h2>
      </div>
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 hidden w-0.5 bg-border md:block" />
        <div className="space-y-8">
          {steps.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="relative flex items-start gap-6 md:pl-16">
              <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shadow-md md:absolute md:left-0">
                {i + 1}
              </div>
              <Card className="flex-1 border-border/60 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary"><Icon size={22} /></div>
                  <div>
                    <h3 className="font-semibold text-card-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

/* ─── Features Grid ─── */
const features = [
  { icon: BarChart3, title: "Real-Time Monitoring", desc: "Continuously track crop and environmental conditions with live data feeds." },
  { icon: Brain, title: "AI Recommendations", desc: "Receive intelligent, data-backed crop care suggestions powered by machine learning." },
  { icon: CloudSun, title: "Weather Integration", desc: "Live weather data ensures your crop plans adapt to current conditions." },
  { icon: Droplets, title: "Soil Health Analysis", desc: "Deep soil insights including pH, moisture, and nutrient composition." },
  { icon: Sprout, title: "Crop Care Suggestions", desc: "Actionable advice on irrigation, fertilization, shading, and pest control." },
  { icon: Globe, title: "Location Intelligence", desc: "Geo-specific recommendations tailored to your region's conditions." },
  { icon: Server, title: "Scalable Backend", desc: "Fast, reliable FastAPI backend built for performance at any scale." },
  { icon: LayoutDashboard, title: "User-Friendly Dashboard", desc: "Clean, intuitive interface designed for farmers and professionals alike." },
];

const Features = () => (
  <section className="py-20 bg-background">
    <div className="container mx-auto max-w-6xl px-4">
      <div className="mb-14 text-center">
        <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/15">Features</Badge>
        <h2 className="text-3xl font-bold text-foreground">Everything You Need</h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, desc }) => (
          <Card key={title} className="group border-border/60 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all">
            <CardHeader className="pb-2">
              <div className="mb-2 inline-flex rounded-xl bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Icon size={24} />
              </div>
              <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

/* ─── Tech Stack ─── */
const techCategories = [
  { title: "Frontend", icon: Code2, techs: ["Next.js", "React", "TypeScript", "TailwindCSS"] },
  { title: "Backend", icon: Server, techs: ["Python", "FastAPI"] },
  { title: "Machine Learning", icon: Brain, techs: ["Scikit-learn", "RandomForest"] },
  { title: "APIs & Data", icon: Database, techs: ["Weather API", "Soil Data API"] },
  { title: "Architecture", icon: Layers, techs: ["REST API", "Real-time Processing"] },
];

const TechStack = () => (
  <section className="bg-secondary/40 py-20">
    <div className="container mx-auto max-w-5xl px-4">
      <div className="mb-14 text-center">
        <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/15">Technology</Badge>
        <h2 className="text-3xl font-bold text-foreground">Built With Modern Tech</h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {techCategories.map(({ title, icon: Icon, techs }) => (
          <Card key={title} className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary"><Icon size={20} /></div>
                <CardTitle className="text-lg">{title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {techs.map((t) => (
                <Badge key={t} variant="secondary" className="text-secondary-foreground">{t}</Badge>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

/* ─── Mission & Vision ─── */
const MissionVision = () => (
  <section className="py-20 bg-background">
    <div className="container mx-auto max-w-5xl px-4">
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="border-primary/20 shadow-md">
          <CardHeader>
            <div className="mb-2 inline-flex rounded-xl bg-primary/10 p-3 text-primary"><Target size={24} /></div>
            <CardTitle className="text-2xl">Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Help farmers and agricultural users make smarter crop care decisions using AI and real-time environmental data — empowering sustainable farming practices and improving yields worldwide.
            </p>
          </CardContent>
        </Card>
        <Card className="border-primary/20 shadow-md">
          <CardHeader>
            <div className="mb-2 inline-flex rounded-xl bg-primary/10 p-3 text-primary"><Eye size={24} /></div>
            <CardTitle className="text-2xl">Our Vision</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Build an intelligent agricultural ecosystem that improves productivity, sustainability, and efficiency — making modern technology accessible to every farmer through intuitive, data-driven tools.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
);

/* ─── Team ─── */
const team = [
  { name: "Srinjoy Paul", role: "Frontend & Backend Developer", initials: "SP", desc: "Develops full-stack solutions for agricultural platforms." },
  { name: "Eeshan Ghosh", role: "Backend & ML Developer", initials: "EG", desc: "Builds ML models and backend systems for crop intelligence." },
];

const Team = () => (
  <section className="bg-secondary/40 py-20">
    <div className="container mx-auto max-w-5xl px-4">
      <div className="mb-14 text-center">
        <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/15">Team</Badge>
        <h2 className="text-3xl font-bold text-foreground">Meet the Team</h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 justify-center max-w-2xl mx-auto">
        {team.map(({ name, role, initials, desc }) => (
          <Card key={name} className="text-center border-border/60 shadow-sm hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Avatar className="mx-auto mb-4 h-20 w-20">
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">{initials}</AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-card-foreground">{name}</h3>
              <p className="text-sm font-medium text-primary">{role}</p>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

/* ─── Why Choose ─── */
const reasons = [
  "Real-time intelligent recommendations",
  "AI-powered decision making",
  "Accurate environmental analysis",
  "Fast and reliable system",
  "Modern and scalable architecture",
  "Designed for farmers, by technologists",
];

const WhyChoose = () => (
  <section className="py-20 bg-background">
    <div className="container mx-auto max-w-4xl px-4">
      <div className="mb-14 text-center">
        <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/15">Why Us</Badge>
        <h2 className="text-3xl font-bold text-foreground">Why Choose FarmIQ?</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {reasons.map((r) => (
          <div key={r} className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-4 shadow-sm">
            <CheckCircle2 className="shrink-0 text-primary" size={22} />
            <span className="font-medium text-card-foreground">{r}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── Footer CTA ─── */
const FooterCTA = () => {
  return (
  <section className="bg-primary py-20">
    <div className="container mx-auto max-w-3xl px-4 text-center">
      <Leaf className="mx-auto mb-6 text-primary-foreground" size={40} />
      <h2 className="mb-4 text-3xl font-bold text-primary-foreground">Start Optimizing Your Crop Health Today</h2>
      <p className="mx-auto mb-8 max-w-xl text-primary-foreground/80">
        Join thousands of farmers using AI-powered insights to grow smarter, healthier crops.
      </p>

    </div>
  </section>
  )
}

/* ─── Main About Page ─── */
export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Overview />
        <HowItWorks />
        <Features />
        <TechStack />
        <MissionVision />
        <Team />
        <WhyChoose />
        <FooterCTA />
      </main>
    </div>
  );
}
