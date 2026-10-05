import { z } from "zod";

/**
 * Structured quiz contract (Phase 2).
 *
 * This is the boundary between AI output and everything downstream. The worker
 * validates provider output against `quizPayloadSchema` before persisting it;
 * the web app validates it again on read. Nothing renders a quiz that has not
 * passed this schema, which is what makes "generated quizzes always parse to
 * valid schema" an enforced invariant rather than a hope.
 */

export const QUESTION_TYPES = [
  "MULTIPLE_CHOICE",
  "TRUE_FALSE",
  "SHORT_ANSWER",
] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const QUESTION_DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;
export type QuestionDifficulty = (typeof QUESTION_DIFFICULTIES)[number];

/** Bounds generation cost and UI paging. Mirrors DEFAULT_FAMILY_CAPS. */
export const MIN_QUIZ_QUESTIONS = 3;
export const MAX_QUIZ_QUESTIONS = 25;

const baseQuestionFields = {
  id: z.string().min(1, "Question id is required"),
  prompt: z.string().min(1, "Question prompt is required").max(2000),
  explanation: z.string().max(2000).optional(),
  difficulty: z.enum(QUESTION_DIFFICULTIES),
  topic: z.string().min(1, "Topic is required").max(200),
};

const multipleChoiceQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal("MULTIPLE_CHOICE"),
  options: z
    .array(z.string().min(1).max(500))
    .min(2, "Multiple choice needs at least two options")
    .max(6, "Multiple choice allows at most six options"),
  correctAnswer: z.string().min(1, "Correct answer is required"),
});

const trueFalseQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal("TRUE_FALSE"),
  options: z.tuple([z.literal("True"), z.literal("False")]),
  correctAnswer: z.enum(["True", "False"]),
});

const shortAnswerQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal("SHORT_ANSWER"),
  correctAnswer: z.string().min(1, "Correct answer is required").max(500),
});

export const quizQuestionSchema = z.discriminatedUnion("type", [
  multipleChoiceQuestionSchema,
  trueFalseQuestionSchema,
  shortAnswerQuestionSchema,
]);

export type QuizQuestion = z.infer<typeof quizQuestionSchema>;

export const quizMetadataSchema = z.object({
  title: z.string().min(1, "Quiz title is required").max(200),
  curriculumCode: z.string().min(1).max(40),
  gradeBand: z.string().min(1).max(40).optional(),
  subject: z.string().min(1).max(120).optional(),
});

export type QuizMetadata = z.infer<typeof quizMetadataSchema>;

export const quizPayloadSchema = z
  .object({
    metadata: quizMetadataSchema,
    questions: z
      .array(quizQuestionSchema)
      .min(MIN_QUIZ_QUESTIONS, `A quiz needs at least ${MIN_QUIZ_QUESTIONS} questions`)
      .max(MAX_QUIZ_QUESTIONS, `A quiz allows at most ${MAX_QUIZ_QUESTIONS} questions`),
  })
  .superRefine((quiz, ctx) => {
    const seen = new Set<string>();
    quiz.questions.forEach((question, index) => {
      if (seen.has(question.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["questions", index, "id"],
          message: `Duplicate question id "${question.id}"`,
        });
      }
      seen.add(question.id);

      if (question.type === "MULTIPLE_CHOICE") {
        if (!question.options.includes(question.correctAnswer)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["questions", index, "correctAnswer"],
            message: "Correct answer must be one of the provided options",
          });
        }
        const unique = new Set(question.options);
        if (unique.size !== question.options.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["questions", index, "options"],
            message: "Options must be unique",
          });
        }
      }
    });
  });

export type QuizPayload = z.infer<typeof quizPayloadSchema>;

/**
 * Grade a learner's answers. Scoring is deliberately server-side and pure so it
 * can be unit tested and re-run for review without trusting the client.
 */
export function gradeQuiz(
  questions: readonly QuizQuestion[],
  answers: Readonly<Record<string, string>>,
): { score: number; maxScore: number; correctCount: number } {
  let correctCount = 0;
  for (const question of questions) {
    const given = answers[question.id];
    if (given === undefined) continue;
    if (normalizeAnswer(given) === normalizeAnswer(question.correctAnswer)) {
      correctCount += 1;
    }
  }
  return {
    score: correctCount,
    maxScore: questions.length,
    correctCount,
  };
}

/** Case/whitespace-insensitive comparison so grading is not defeated by typing. */
function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}
