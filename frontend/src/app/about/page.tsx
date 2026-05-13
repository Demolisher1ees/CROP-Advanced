"use client"

import { useRouter } from "next/navigation";
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
import Link from "next/link";
import { useAuthModalContext } from "@/components/AuthModalProvider";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/components/LanguageProvider";

/* ─── Hero ─── */
const Hero = () => {
  const { triggerNavGlow } = useAuthModalContext()
  const { data: session } = useSession()
  const { t } = useLanguage()
  const router = useRouter()

  const handleGetStarted = () => {
    if (!session) { triggerNavGlow() } else { router.push('/crops') }
  }
  const handleGetRecs = () => {
    if (!session) { triggerNavGlow() } else { router.push('/') }
  }

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
      {/* Same blurred overlay as home page */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[6px]" />
      <div className="container relative z-10 mx-auto max-w-5xl px-4 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-2 text-white">
          <Leaf size={20} />
          <span className="text-sm font-semibold tracking-wide uppercase">{t("about.hero_tag")}</span>
        </div>
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-white md:text-6xl drop-shadow-lg">
          {t("about.hero_title_part1")}<br />
          <span className="text-green-400">{t("about.hero_title_highlight")}</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-white/80 drop-shadow">
          {t("about.hero_desc")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button onClick={handleGetStarted}>
            <Button size="lg" className="gap-2 bg-green-600 hover:bg-green-700 text-white border-0">
              <LayoutDashboard size={18} /> {t("about.go_to_dashboard")}
            </Button>
          </button>
          <button onClick={handleGetRecs}>
            <Button size="lg" variant="outline" className="gap-2 border-white/60 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm">
              <Sprout size={18} /> {t("about.get_recommendations")}
            </Button>
          </button>
        </div>
      </div>
    </section>
  )
}

/* ─── Project Overview ─── */
const Overview = () => {
  const { t } = useLanguage()
  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/15">{t("about.platform_badge")}</Badge>
            <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">{t("about.what_is_farmiq")}</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-300 leading-relaxed">{t("about.farmiq_desc1")}</p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{t("about.farmiq_desc2")}</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { icon: BarChart3, key: "o1" },
              { icon: Brain, key: "o2" },
              { icon: MapPin, key: "o3" },
              { icon: Zap, key: "o4" },
            ].map(({ icon: Icon, key }) => (
              <Card key={key} className="border-gray-200 dark:border-gray-700/30 bg-gray-50 dark:bg-gray-800/80 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary"><Icon size={20} /></div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{t(`about.overview_list.${key}.title`)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-300">{t(`about.overview_list.${key}.desc`)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── How It Works ─── */
const steps = [
  { icon: MapPin, key: "s1" },
  { icon: CloudSun, key: "s2" },
  { icon: Droplets, key: "s3" },
  { icon: Cpu, key: "s4" },
  { icon: Sprout, key: "s5" },
];

const HowItWorks = () => {
  const { t } = useLanguage()
  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-20">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-14 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/15">{t("about.process_badge")}</Badge>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t("about.how_it_works")}</h2>
        </div>
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 hidden w-0.5 bg-border md:block" />
          <div className="space-y-8">
            {steps.map(({ icon: Icon, key }, i) => (
              <div key={key} className="relative flex items-center gap-6 md:pl-16">
                <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shadow-md md:absolute md:left-0 md:top-1/2 md:-translate-y-1/2">
                  {i + 1}
                </div>
                <Card className="flex-1 border-gray-200 dark:border-gray-700/30 bg-white dark:bg-gray-800/80 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary"><Icon size={22} /></div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{t(`about.steps_list.${key}.title`)}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-300">{t(`about.steps_list.${key}.desc`)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Features Grid ─── */
const features = [
  { icon: BarChart3, key: "f1" },
  { icon: Brain, key: "f2" },
  { icon: CloudSun, key: "f3" },
  { icon: Droplets, key: "f4" },
  { icon: Sprout, key: "f5" },
  { icon: Globe, key: "f6" },
  { icon: Server, key: "f7" },
  { icon: LayoutDashboard, key: "f8" },
];

const Features = () => {
  const { t } = useLanguage()
  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-14 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/15">{t("about.features_badge")}</Badge>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t("about.everything_you_need")}</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, key }) => (
            <Card key={key} className="group border-gray-200 dark:border-gray-700/30 bg-gray-50 dark:bg-gray-800/80 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all">
              <CardHeader className="pb-2">
                <div className="mb-2 inline-flex rounded-xl bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon size={24} />
                </div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">{t(`about.features_list.${key}.title`)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 dark:text-gray-300">{t(`about.features_list.${key}.desc`)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Tech Stack ─── */
const techCategories = [
  { key: "t1", icon: Code2 },
  { key: "t2", icon: Server },
  { key: "t3", icon: Brain },
  { key: "t4", icon: Database },
  { key: "t5", icon: Layers },
];

const TechStack = () => {
  const { t } = useLanguage()
  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-20">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-14 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/15">{t("about.tech_badge")}</Badge>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t("about.built_with")}</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {techCategories.map(({ key, icon: Icon }) => {
            const techs = t(`about.tech_list.${key}.techs`) as unknown as string[];
            return (
            <Card key={key} className="border-gray-200 dark:border-gray-700/30 bg-white dark:bg-gray-800/80 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary"><Icon size={20} /></div>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">{t(`about.tech_list.${key}.title`)}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {Array.isArray(techs) && techs.map((tech: string) => (
                  <Badge key={tech} variant="secondary" className="text-gray-700 dark:text-gray-100 dark:bg-gray-700">{tech}</Badge>
                ))}
              </CardContent>
            </Card>
          )})}
        </div>
      </div>
    </section>
  )
}

/* ─── Mission & Vision ─── */
const MissionVision = () => {
  const { t } = useLanguage()
  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="border-gray-200 dark:border-gray-700/30 bg-gray-50 dark:bg-gray-800/80 shadow-md">
            <CardHeader>
              <div className="mb-2 inline-flex rounded-xl bg-primary/10 p-3 text-primary"><Target size={24} /></div>
              <CardTitle className="text-2xl text-gray-900 dark:text-white">{t("about.mission_title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{t("about.mission_desc")}</p>
            </CardContent>
          </Card>
          <Card className="border-gray-200 dark:border-gray-700/30 bg-gray-50 dark:bg-gray-800/80 shadow-md">
            <CardHeader>
              <div className="mb-2 inline-flex rounded-xl bg-primary/10 p-3 text-primary"><Eye size={24} /></div>
              <CardTitle className="text-2xl text-gray-900 dark:text-white">{t("about.vision_title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{t("about.vision_desc")}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

/* ─── Team ─── */
const team = [
  { name: "Srinjoy Paul", role: "Frontend & Backend Developer", initials: "SP", desc: "Develops full-stack solutions for agricultural platforms." },
  { name: "Eeshan Ghosh", role: "Backend & ML Developer", initials: "EG", desc: "Builds ML models and backend systems for crop intelligence." },
];

const Team = () => {
  const { t } = useLanguage()
  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-20">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-14 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/15">{t("about.team_badge")}</Badge>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t("about.meet_the_team")}</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 justify-center max-w-2xl mx-auto">
          {team.map(({ name, role, initials, desc }) => (
            <Card key={name} className="text-center border-gray-200 dark:border-gray-700/30 bg-white dark:bg-gray-800/80 shadow-sm hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Avatar className="mx-auto mb-4 h-20 w-20">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">{initials}</AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-gray-900 dark:text-white">{name}</h3>
                <p className="text-sm font-medium text-primary">{role}</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Why Choose ─── */
const reasons = [0, 1, 2, 3, 4, 5];

const WhyChoose = () => {
  const { t } = useLanguage()
  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-14 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/15">{t("about.why_us_badge")}</Badge>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t("about.why_choose")}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {reasons.map((r) => (
            <div key={r} className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700/30 bg-gray-50 dark:bg-gray-800/80 p-4 shadow-sm">
              <CheckCircle2 className="shrink-0 text-primary" size={22} />
              <span className="font-medium text-gray-900 dark:text-white">{t(`about.reasons_list.${r}`)}</span>
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
        <h2 className="mb-4 text-3xl font-bold text-white drop-shadow-lg">{t("about.cta_title")}</h2>
        <p className="mx-auto max-w-xl text-white/80">{t("about.cta_desc")}</p>
      </div>
    </section>
  )
}

/* ─── Main About Page ─── */
export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
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
