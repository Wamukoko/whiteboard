import Link from "next/link";
import { Button, Card, Icon } from "@whb/ui";
import { Brand } from "@/components/brand";

const ROLE_FEATURES = [
  {
    icon: "auto_stories",
    tone: "text-spark-coral",
    surface: "bg-spark-coral/10",
    title: "Learners",
    body: "Streak-friendly practice, curriculum mastery rings, and quizzes turned into games — tuned for a phone in your pocket.",
  },
  {
    icon: "family_restroom",
    tone: "text-calm-teal",
    surface: "bg-calm-teal/10",
    title: "Parents & families",
    body: "One dashboard for every child, on every curriculum. See progress, review AI-generated practice, and never miss a deadline.",
  },
  {
    icon: "co_present",
    tone: "text-primary",
    surface: "bg-primary-fixed/50",
    title: "Schools & educators",
    body: "Live whiteboards, cohort mastery telemetry, and rosters that respect institutional boundaries.",
  },
  {
    icon: "volunteer_activism",
    tone: "text-trust-gold",
    surface: "bg-trust-gold/10",
    title: "Scholarship providers",
    body: "Verified opportunities reach the right learners — with eligibility surfaced transparently, never gatekept.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Create your family",
    body: "Sign up and add each child — CBC, Cambridge, or both at once.",
  },
  {
    n: "02",
    title: "Learn from what you have",
    body: "Upload a worksheet and get a parent-reviewed, curriculum-aware practice quiz. No extra textbooks needed.",
  },
  {
    n: "03",
    title: "Grow with your data",
    body: "Mastery rings, streaks, and live classes keep momentum. Scholarships find your family when you qualify.",
  },
];

export const metadata = {
  title: "WhiteBoard — Ask. Learn. Become.",
};

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-surface">
      <header className="mx-auto max-w-shell px-margin-mobile md:px-margin-tablet lg:px-margin-desktop pt-unit-6">
        <nav className="flex items-center justify-between">
          <Brand />
          <div className="flex items-center gap-unit-2">
            <Button variant="ghost" className="hidden sm:inline-flex">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="md">
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-shell px-margin-mobile md:px-margin-tablet lg:px-margin-desktop pt-unit-24 pb-unit-12 text-center">
          <div className="inline-flex items-center gap-unit-2 rounded-full bg-surface-container-low px-unit-4 py-unit-1 text-label-sm text-secondary mb-unit-8">
            <span className="w-2 h-2 rounded-full bg-grow-green"></span>
            Built for Kenyan families, CBC & Cambridge
          </div>
          <h1 className="font-display text-display-md-mobile md:text-display-md text-primary tracking-tight max-w-3xl mx-auto">
            Ask. Learn. Become.
          </h1>
          <p className="text-body-md md:text-title-lg text-on-surface-variant max-w-xl mx-auto mt-unit-6">
            WhiteBoard turns any worksheet into a practice journey, keeps every
            child on track across curricula, and opens verified opportunities —
            light enough to run on the connections families already have.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-unit-3 mt-unit-10">
            <Button size="lg" fullWidth className="sm:w-auto">
              <Link href="/signup" className="inline-flex items-center gap-unit-2">
                Start learning free
                <Icon name="arrow_forward" size={18} />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" fullWidth className="sm:w-auto">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
          <p className="text-label-sm text-on-surface-variant/70 mt-unit-4">
            No card required · Works on 3G · Parental review on every AI exercise
          </p>
        </section>

        <section className="mx-auto max-w-shell px-margin-mobile md:px-margin-tablet lg:px-margin-desktop pb-unit-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-unit-4 md:gap-gutter-desktop">
            {ROLE_FEATURES.map((f) => (
              <Card key={f.title} hover className="flex flex-col gap-unit-3">
                <div className={`w-11 h-11 rounded-lg ${f.surface} flex items-center justify-center ${f.tone}`}>
                  <Icon name={f.icon} size={22} />
                </div>
                <h2 className="font-display text-headline-sm text-on-surface">{f.title}</h2>
                <p className="text-body-sm text-on-surface-variant">{f.body}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-surface-container-low border-y border-outline-variant/40 py-unit-24">
          <div className="mx-auto max-w-shell px-margin-mobile md:px-margin-tablet lg:px-margin-desktop">
            <h2 className="font-display text-headline-lg text-on-surface text-center">
              How WhiteBoard works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-unit-8 mt-unit-12">
              {STEPS.map((step) => (
                <div key={step.n} className="flex flex-col gap-unit-3">
                  <span className="font-mono text-code-sm text-signal">{step.n}</span>
                  <h3 className="font-display text-headline-sm text-on-surface">{step.title}</h3>
                  <p className="text-body-sm text-on-surface-variant">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-shell px-margin-mobile md:px-margin-tablet lg:px-margin-desktop py-unit-12 flex flex-col md:flex-row items-center justify-between gap-unit-4 text-secondary">
        <div className="flex items-center gap-unit-2 text-label-sm">
          <Icon name="help_center" size={18} />
          Questions about CBC evaluation or Cambridge marks? Your academic advisor is a tap away.
        </div>
        <div className="font-display text-headline-sm italic text-outline-variant">
          Ask. Learn. Become.
        </div>
      </footer>
    </div>
  );
}