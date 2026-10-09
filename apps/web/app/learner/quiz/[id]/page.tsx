import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@whb/ui";
import { requireAuthenticatedSession } from "@/lib/dashboard-data";
import { getLearnerQuiz } from "@/lib/library-data";
import { QuizRunner } from "@/components/quiz/quiz-runner";

export const dynamic = "force-dynamic";

export default async function LearnerQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireAuthenticatedSession();
  const quiz = await getLearnerQuiz(user.id, id);

  if (!quiz || quiz.questions.length === 0) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-md min-h-dvh px-margin-mobile pt-unit-8 pb-unit-16">
      <Link
        href="/learner"
        className="inline-flex items-center gap-unit-1 text-label-md text-secondary hover:text-primary transition-colors mb-unit-6"
      >
        <Icon name="arrow_back" size={18} />
        Back to your board
      </Link>
      <QuizRunner assessmentId={quiz.id} title={quiz.title} questions={quiz.questions} />
    </div>
  );
}
