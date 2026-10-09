import Link from "next/link";
import { Button, Icon } from "@whb/ui";
import type { FamilyOverview } from "@/lib/dashboard-data";
import { requireAuthenticatedSession } from "@/lib/dashboard-data";
import { getFamilyOverview } from "@/lib/dashboard-data";
import { ChildCard } from "@/components/child-card";
import { Brand } from "@/components/brand";
import { ParentSidebar } from "@/components/parent-sidebar";

export const dynamic = "force-dynamic";

export default async function ParentDashboard() {
  const user = await requireAuthenticatedSession();
  const overview: FamilyOverview = await getFamilyOverview(user.id);

  return (
    <div className="lg:flex max-w-shell mx-auto min-h-dvh">
      <ParentSidebar activeId="overview" tagline={overview.familyName} />

      <div className="flex-1 px-margin-mobile md:px-margin-tablet lg:px-margin-desktop">
        <div className="lg:hidden pt-unit-6">
          <Brand size="md" href="/parent" />
        </div>

        <header className="flex flex-col md:flex-row md:items-end justify-between gap-unit-6 pb-unit-8 pt-unit-6 lg:pt-unit-8">
          <div className="flex flex-col max-w-2xl">
            <div className="flex items-center gap-unit-2 text-label-sm text-secondary mb-unit-2">
              <Icon name="family_restroom" size={16} />
              <span>Family Academic Portfolio</span>
              <span className="text-outline-variant">/</span>
              <span className="text-on-surface font-semibold">{overview.familyName}</span>
            </div>
            <h1 className="font-display text-headline-lg text-on-surface tracking-tight leading-tight">
              Family Learning Overview
            </h1>
            <p className="text-body-md text-on-surface-variant mt-unit-2">
              {overview.learners.length
                ? `${overview.learners.length} active learner${overview.learners.length > 1 ? "s" : ""} on Kenyan CBC & Cambridge tracks.`
                : "Set up your first child to open the learning board."}
            </p>
          </div>
          <div className="flex items-center gap-unit-3 flex-wrap self-start md:self-end">
            <div className="inline-flex items-center gap-unit-2 bg-surface-container-lowest px-unit-3 py-unit-2 rounded-lg shadow-card">
              <Icon name="date_range" size={18} className="text-secondary" />
              <span className="text-label-sm text-on-surface">Term 3 · 2026</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container ml-unit-1"></span>
            </div>
            <Button variant="primary-container" icon="person_add">
              <Link href="/onboarding">Add child</Link>
            </Button>
          </div>
        </header>

        {overview.learners.length === 0 ? (
          <section className="bg-surface-container-lowest rounded-xl p-unit-12 text-center flex flex-col items-center gap-unit-4 shadow-card">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-primary">
              <Icon name="family_restroom" size={32} />
            </div>
            <div className="flex flex-col gap-unit-1 max-w-sm">
              <h2 className="font-display text-headline-sm text-on-surface">
                Add your first learner
              </h2>
              <p className="text-body-sm text-on-surface-variant">
                Create a child profile, pick a CBC grade band or Cambridge stream, and a
                mastery board grows from their first practice round.
              </p>
            </div>
            <Button size="lg" icon="arrow_forward" iconFill>
              <Link href="/onboarding">Set up your first child</Link>
            </Button>
          </section>
        ) : (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter-desktop mb-unit-12">
            {overview.learners.map((child) => (
              <ChildCard key={child.id} child={child} />
            ))}
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-start">
          <div className="lg:col-span-7 flex flex-col bg-surface-container-lowest rounded-xl p-unit-6 shadow-card">
            <div className="flex items-center justify-between pb-unit-4">
              <div>
                <h3 className="font-display text-headline-sm text-on-surface">
                  Upcoming Commitments
                </h3>
                <p className="text-label-sm text-secondary">Next 48 hours across the family</p>
              </div>
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-1 text-label-sm text-outline-variant disabled:cursor-not-allowed"
                title="Live classes arrive in Phase 4"
              >
                <Icon name="sync" size={16} />
                Sync to Google Calendar
              </button>
            </div>
            <div className="rounded-lg bg-surface-container-low/50 p-unit-8 flex flex-col items-center gap-unit-2 text-center">
              <Icon name="event_available" size={24} className="text-outline" />
              <p className="text-body-sm text-on-surface-variant">
                Scheduled classes and deadlines will appear here.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-gutter-desktop">
            <div className="bg-surface-container-lowest rounded-xl p-unit-6 shadow-card">
              <div className="flex items-center gap-unit-2 mb-unit-3">
                <Icon name="auto_awesome" size={18} className="text-calm-teal" />
                <span className="text-label-sm text-calm-teal font-semibold">
                  Verified Opportunity Matches
                </span>
              </div>
              <h3 className="font-display text-headline-sm text-on-surface leading-snug mb-unit-2">
                Opportunities find your family when you qualify
              </h3>
              <p className="text-body-sm text-on-surface-variant mb-unit-4 leading-relaxed">
                Scholarship and education opportunities are matched on eligibility you can
                see and question — never gatekept, always opt-in.
              </p>
              <button
                type="button"
                disabled
                className="w-full flex items-center justify-between px-unit-4 py-unit-3 rounded-lg bg-surface-container-high text-on-surface text-label-md transition-colors disabled:cursor-not-allowed"
              >
                <span>Scholarship hub (Phase 3)</span>
                <Icon name="arrow_forward" size={18} />
              </button>
            </div>
          </div>
        </div>

        <footer className="mt-unit-12 pt-unit-6 pb-unit-10 flex flex-col md:flex-row items-center justify-between gap-unit-4 text-secondary">
          <div className="flex items-center gap-unit-3">
            <Icon name="help_center" size={18} className="text-outline-variant" />
            <p className="text-body-sm text-on-surface-variant">
              Questions about CBC evaluation or Cambridge marks? Your academic advisor
              is available via chat.
            </p>
          </div>
          <div className="font-display text-headline-sm text-outline-variant italic select-none">
            Ask. Learn. Become.
          </div>
        </footer>
      </div>
    </div>
  );
}