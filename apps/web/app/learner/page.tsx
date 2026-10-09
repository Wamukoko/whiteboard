import Link from "next/link";
import { Badge, BottomNav, Icon, ProgressBar } from "@whb/ui";
import { requireAuthenticatedSession } from "@/lib/dashboard-data";
import { getLearnerView } from "@/lib/dashboard-data";
import { getLearnerAssessments } from "@/lib/library-data";
import { ChildSwitcher } from "@/components/child-switcher";

export const dynamic = "force-dynamic";

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: "stylus_note", href: "/learner" },
  { id: "learn", label: "Learn", icon: "auto_stories", href: "/learner" },
  { id: "classes", label: "Classes", icon: "meeting_room", href: "/learner" },
  { id: "me", label: "Me", icon: "account_circle", href: "/learner" },
];

function greetingAt(date: Date): { word: string; icon: string } {
  const eat = new Intl.DateTimeFormat("en-KE", {
    timeZone: "Africa/Nairobi",
    hour: "numeric",
    hour12: false,
  }).format(date);
  const hour = Number.parseInt(eat, 10);
  if (hour < 5) return { word: "Good night", icon: "nightlight" };
  if (hour < 12) return { word: "Good morning", icon: "wb_sunny" };
  if (hour < 17) return { word: "Good afternoon", icon: "light_mode" };
  return { word: "Good evening", icon: "nightlight" };
}

export default async function LearnerDashboard({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const { child: childId } = await searchParams;
  const user = await requireAuthenticatedSession();
  const { familyName, child, allLearners } = await getLearnerView(
    user.id,
    childId,
  );
  const assessments = child ? await getLearnerAssessments(user.id, child.id) : [];

  const greeting = greetingAt(new Date());

  return (
    <div className="mx-auto max-w-md min-h-dvh pb-unit-24">
      <header className="px-margin-mobile pt-unit-8 flex flex-col gap-unit-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-unit-2 text-tertiary-container">
            <Icon name={greeting.icon} size={20} filled />
            <span className="text-label-sm font-medium text-secondary">
              {familyName} Board
            </span>
          </div>
          <ChildSwitcher
            options={allLearners.map((l) => ({
              value: l.id,
              label: l.fullName.split(" ")[0] ?? l.fullName,
            }))}
          />
        </div>
        <div>
          <h1 className="font-display text-display-md-mobile text-primary tracking-tight">
            {greeting.word},{" "}
            {child ? child.fullName.split(" ")[0] : "there"}
          </h1>
          <p className="text-body-md text-on-surface-variant mt-0.5">
            {child
              ? child.curriculumLabel !== "—"
                ? `${child.curriculumLabel} · what will you learn today?`
                : "What will you learn today?"
              : "Add a child from the parent dashboard to start."}
          </p>
        </div>
      </header>

      {child ? (
        <main className="px-margin-mobile flex flex-col gap-unit-6 mt-unit-6">
          <section className="bg-surface-container-lowest rounded-xl p-unit-4 shadow-card flex items-center gap-unit-3">
            <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary-container shrink-0">
              <Icon name="local_fire_department" size={20} filled />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-unit-1">
                <span className="text-label-md text-on-surface">
                  {child.streakDays}-day learning streak
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
                <Badge tone="tertiary">Active</Badge>
              </div>
              <p className="text-body-sm text-on-surface-variant truncate">
                Streaks begin with the first practice round.
              </p>
            </div>
            <div className="shrink-0 flex -space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-tertiary-container"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-secondary-container"></span>
            </div>
          </section>

          <section className="flex flex-col gap-unit-3">
            <div className="flex items-center justify-between px-unit-1">
              <div className="flex items-center gap-unit-2">
                <Icon name="draw" size={20} className="text-primary" />
                <h2 className="font-display text-headline-sm text-primary">
                  Curriculum Mastery
                </h2>
              </div>
              <span className="text-label-sm text-primary hover:underline flex items-center">
                All subjects
              </span>
            </div>

            {child.subjects.length ? (
              <div className="flex flex-col gap-unit-3">
                {child.subjects.map((subject) => (
                  <div
                    key={subject.name}
                    className="bg-surface-container-lowest rounded-xl p-unit-4 shadow-card flex flex-col gap-unit-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col">
                        <span className="text-label-sm text-secondary">
                          CBC Core · Practice Units
                        </span>
                        <span className="font-display text-headline-sm text-on-surface">
                          {subject.name}
                        </span>
                      </div>
                      <span className="text-label-md bg-surface-container-high px-unit-2 py-0.5 rounded">
                        {subject.mastery}%
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <ProgressBar value={subject.mastery} tone="primary" />
                      <div className="flex justify-between items-center text-on-surface-variant">
                        <span className="text-body-sm">Practice rounds open this</span>
                        <span className="text-label-sm text-secondary">0 units yet</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-surface-container-lowest rounded-xl p-unit-6 shadow-card text-center flex flex-col items-center gap-unit-3">
                <Icon name="draw" size={28} className="text-outline" />
                <p className="text-body-sm text-on-surface-variant max-w-[260px]">
                  Subject mastery appears after your parent uploads a worksheet
                  and you finish a practice round.
                </p>
              </div>
            )}
          </section>

          <section className="bg-surface-container-low rounded-xl p-unit-4 shadow-card flex flex-col gap-unit-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-unit-2">
                <div className="w-7 h-7 rounded bg-secondary-container flex items-center justify-center text-primary">
                  <Icon name="quiz" size={18} />
                </div>
                <span className="text-label-sm text-secondary">Quick Check</span>
              </div>
              <span className="font-mono text-code-sm text-on-surface-variant">
                {assessments.length} {assessments.length === 1 ? "quiz" : "quizzes"}
              </span>
            </div>
            {assessments.length ? (
              <div className="flex flex-col gap-unit-2">
                {assessments.map((assessment) => (
                  <Link
                    key={assessment.id}
                    href={`/learner/quiz/${assessment.id}`}
                    className="flex items-center gap-unit-3 rounded-lg bg-surface-container-lowest p-unit-3 shadow-card hover:shadow-card-float transition-shadow"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary-fixed/60 flex items-center justify-center text-on-primary-fixed-variant shrink-0">
                      <Icon name="play_arrow" size={20} filled />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-label-md text-on-surface truncate">
                        {assessment.title}
                      </span>
                      <span className="text-label-sm text-secondary">
                        {assessment.questionCount} questions
                        {assessment.lastScore !== null && assessment.lastMax !== null
                          ? ` · last ${assessment.lastScore}/${assessment.lastMax}`
                          : ""}
                      </span>
                    </div>
                    <Icon name="chevron_right" size={20} className="text-outline shrink-0" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-unit-1">
                <h3 className="font-display text-headline-sm text-on-surface">
                  Your first quiz is one upload away
                </h3>
                <p className="text-body-sm text-on-surface-variant">
                  A parent reviews every AI-generated quiz before it reaches your
                  board. Nothing unscreened ever lands here.
                </p>
              </div>
            )}
          </section>

          <section className="bg-surface-container-lowest rounded-xl p-unit-6 shadow-card flex flex-col gap-unit-4 text-center items-center">
            <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-primary">
              <Icon name="document_scanner" size={28} />
            </div>
            <div className="flex flex-col gap-unit-1 max-w-[280px]">
              <h3 className="font-display text-headline-sm text-on-surface">
                Need practice on another topic?
              </h3>
              <p className="text-body-sm text-on-surface-variant">
                Upload any textbook page or handwritten worksheet and
                WhiteBoard turns it into interactive exercises.
              </p>
            </div>
            <Link
              href="/parent"
              className="w-full bg-surface-container hover:bg-surface-container-high text-primary text-label-md py-unit-3 px-unit-4 rounded flex items-center justify-center gap-unit-2 transition-colors active:scale-[0.99]"
            >
              <Icon name="upload_file" size={20} />
              Ask a parent to upload
            </Link>
          </section>

          <footer className="pt-unit-2 pb-unit-4 flex flex-col items-center justify-center text-center gap-unit-1">
            <p className="font-display text-headline-sm italic text-secondary text-[1.125rem]">
              “Ask. Learn. Become.”
            </p>
            <span className="text-label-sm text-on-surface-variant/60">
              Academic Board · WhiteBoard
            </span>
          </footer>
        </main>
      ) : (
        <main className="px-margin-mobile mt-unit-6">
          <div className="bg-surface-container-lowest rounded-xl p-unit-8 text-center flex flex-col items-center gap-unit-3 shadow-card">
            <Icon name="family_restroom" size={28} className="text-outline" />
            <p className="text-body-sm text-on-surface-variant">
              No learner profiles yet. Head to the parent dashboard to add your
              first child.
            </p>
            <Link
              href="/parent"
              className="bg-primary text-on-primary text-label-md px-unit-4 py-unit-2 rounded shadow-btn"
            >
              Open parent dashboard
            </Link>
          </div>
        </main>
      )}

      <BottomNav items={NAV_ITEMS} activeId="home" />
    </div>
  );
}