import { describe, expect, it } from "vitest";
import {
  AI_GENERATED_MARKER,
  gradeQuiz,
  quizPayloadSchema,
  quizQuestionSchema,
  MAX_QUIZ_QUESTIONS,
  MIN_QUIZ_QUESTIONS,
} from "../quiz";
import {
  materialMetadataSchema,
  requestQuizGenerationSchema,
  reviewGeneratedContentSchema,
  submitAttemptSchema,
} from "../learning";

const multipleChoice = {
  id: "q1",
  type: "MULTIPLE_CHOICE" as const,
  prompt: "What is 2 + 2?",
  options: ["3", "4", "5"],
  correctAnswer: "4",
  difficulty: "EASY" as const,
  topic: "Addition",
};

const trueFalse = {
  id: "q2",
  type: "TRUE_FALSE" as const,
  prompt: "Water boils at 100C at sea level.",
  options: ["True", "False"] as ["True", "False"],
  correctAnswer: "True" as const,
  difficulty: "EASY" as const,
  topic: "States of matter",
};

const shortAnswer = {
  id: "q3",
  type: "SHORT_ANSWER" as const,
  prompt: "Name the capital of Kenya.",
  correctAnswer: "Nairobi",
  difficulty: "MEDIUM" as const,
  topic: "Geography",
};

const validPayload = {
  metadata: {
    title: "Grade 5 Mathematics Practice",
    curriculumCode: "CBC",
    gradeBand: "G5",
    subject: "Mathematics",
  },
  questions: [multipleChoice, trueFalse, shortAnswer],
};

describe("quizQuestionSchema", () => {
  it("accepts each supported question type", () => {
    expect(quizQuestionSchema.safeParse(multipleChoice).success).toBe(true);
    expect(quizQuestionSchema.safeParse(trueFalse).success).toBe(true);
    expect(quizQuestionSchema.safeParse(shortAnswer).success).toBe(true);
  });

  it("rejects a multiple-choice question with a single option", () => {
    const res = quizQuestionSchema.safeParse({ ...multipleChoice, options: ["4"] });
    expect(res.success).toBe(false);
  });

  it("rejects a true/false question whose options are not the canonical pair", () => {
    const res = quizQuestionSchema.safeParse({
      ...trueFalse,
      options: ["Yes", "No"],
      correctAnswer: "Yes",
    });
    expect(res.success).toBe(false);
  });

  it("rejects an unknown question type", () => {
    const res = quizQuestionSchema.safeParse({ ...multipleChoice, type: "ESSAY" });
    expect(res.success).toBe(false);
  });
});

describe("quizPayloadSchema", () => {
  it("accepts a well-formed quiz", () => {
    const res = quizPayloadSchema.safeParse(validPayload);
    expect(res.success).toBe(true);
  });

  it("rejects a quiz below the minimum question count", () => {
    const res = quizPayloadSchema.safeParse({
      ...validPayload,
      questions: [multipleChoice],
    });
    expect(res.success).toBe(false);
  });

  it("rejects a quiz above the maximum question count", () => {
    const questions = Array.from({ length: MAX_QUIZ_QUESTIONS + 1 }, (_, i) => ({
      ...multipleChoice,
      id: `q${i}`,
    }));
    const res = quizPayloadSchema.safeParse({ ...validPayload, questions });
    expect(res.success).toBe(false);
  });

  it("accepts exactly the boundary question counts", () => {
    const min = Array.from({ length: MIN_QUIZ_QUESTIONS }, (_, i) => ({
      ...multipleChoice,
      id: `q${i}`,
    }));
    expect(quizPayloadSchema.safeParse({ ...validPayload, questions: min }).success).toBe(true);

    const max = Array.from({ length: MAX_QUIZ_QUESTIONS }, (_, i) => ({
      ...multipleChoice,
      id: `q${i}`,
    }));
    expect(quizPayloadSchema.safeParse({ ...validPayload, questions: max }).success).toBe(true);
  });

  it("rejects duplicate question ids", () => {
    const res = quizPayloadSchema.safeParse({
      ...validPayload,
      questions: [multipleChoice, { ...multipleChoice }, shortAnswer],
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues.some((i) => i.message.includes("Duplicate question id"))).toBe(
        true,
      );
    }
  });

  it("rejects a correct answer that is not among the options", () => {
    const res = quizPayloadSchema.safeParse({
      ...validPayload,
      questions: [{ ...multipleChoice, correctAnswer: "42" }, trueFalse, shortAnswer],
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(
        res.error.issues.some((i) => i.message.includes("must be one of the provided options")),
      ).toBe(true);
    }
  });

  it("rejects duplicate options", () => {
    const res = quizPayloadSchema.safeParse({
      ...validPayload,
      questions: [
        { ...multipleChoice, options: ["3", "4", "4"] },
        trueFalse,
        shortAnswer,
      ],
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues.some((i) => i.message.includes("unique"))).toBe(true);
    }
  });
});

describe("gradeQuiz", () => {
  it("scores correct answers and counts toward the maximum", () => {
    const result = gradeQuiz(
      [multipleChoice, trueFalse, shortAnswer],
      { q1: "4", q2: "True", q3: "Nairobi" },
    );
    expect(result).toEqual({ score: 3, maxScore: 3, correctCount: 3 });
  });

  it("ignores unanswered questions rather than marking them wrong", () => {
    const result = gradeQuiz([multipleChoice, trueFalse, shortAnswer], { q1: "4" });
    expect(result).toEqual({ score: 1, maxScore: 3, correctCount: 1 });
  });

  it("matches answers case- and whitespace-insensitively", () => {
    const result = gradeQuiz([shortAnswer], { q3: "  nairobi " });
    expect(result.correctCount).toBe(1);
  });

  it("scores a blank submission as zero", () => {
    const result = gradeQuiz([multipleChoice, trueFalse, shortAnswer], {});
    expect(result).toEqual({ score: 0, maxScore: 3, correctCount: 0 });
  });

  it("ignores answers for unknown question ids", () => {
    const result = gradeQuiz([multipleChoice], { q1: "4", q99: "anything" });
    expect(result).toEqual({ score: 1, maxScore: 1, correctCount: 1 });
  });
});

describe("AI-generated labelling", () => {
  it("exposes a non-empty, user-facing marker for generated content", () => {
    expect(AI_GENERATED_MARKER.trim().length).toBeGreaterThan(0);
    expect(AI_GENERATED_MARKER).toBe("AI-generated");
  });
});

describe("materialMetadataSchema", () => {
  const valid = {
    fileName: "worksheet.pdf",
    mimeType: "application/pdf",
    sizeBytes: 2048,
    storageKey: "families/f1/materials/m1.pdf",
  };

  it("accepts a supported upload", () => {
    expect(materialMetadataSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an unsupported mime type", () => {
    const res = materialMetadataSchema.safeParse({ ...valid, mimeType: "application/zip" });
    expect(res.success).toBe(false);
  });

  it("rejects a zero-byte upload", () => {
    expect(materialMetadataSchema.safeParse({ ...valid, sizeBytes: 0 }).success).toBe(false);
  });

  it("enforces the shared MAX_UPLOAD_BYTES cap", () => {
    expect(
      materialMetadataSchema.safeParse({ ...valid, sizeBytes: 15 * 1024 * 1024 + 1 }).success,
    ).toBe(false);
    expect(
      materialMetadataSchema.safeParse({ ...valid, sizeBytes: 15 * 1024 * 1024 }).success,
    ).toBe(true);
  });
});

describe("requestQuizGenerationSchema", () => {
  it("applies bounded defaults", () => {
    const res = requestQuizGenerationSchema.safeParse({
      sourceMaterialId: "m1",
      learnerId: "l1",
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.questionCount).toBe(10);
      expect(res.data.difficulty).toBe("MEDIUM");
      expect(res.data.model).toBe("claude-sonnet-5");
    }
  });

  it("rejects an out-of-range question count", () => {
    expect(
      requestQuizGenerationSchema.safeParse({
        sourceMaterialId: "m1",
        learnerId: "l1",
        questionCount: 500,
      }).success,
    ).toBe(false);
  });

  it("rejects an unrecognised model", () => {
    expect(
      requestQuizGenerationSchema.safeParse({
        sourceMaterialId: "m1",
        learnerId: "l1",
        model: "gpt-9",
      }).success,
    ).toBe(false);
  });
});

describe("reviewGeneratedContentSchema", () => {
  it("accepts approve and reject decisions", () => {
    expect(
      reviewGeneratedContentSchema.safeParse({ reviewState: "APPROVED" }).success,
    ).toBe(true);
    expect(
      reviewGeneratedContentSchema.safeParse({
        reviewState: "REJECTED",
        notes: "Off-topic for the grade band",
      }).success,
    ).toBe(true);
  });

  it("does not accept PENDING_REVIEW as a review decision", () => {
    expect(
      reviewGeneratedContentSchema.safeParse({ reviewState: "PENDING_REVIEW" }).success,
    ).toBe(false);
  });
});

describe("submitAttemptSchema", () => {
  it("accepts a map of answers", () => {
    const res = submitAttemptSchema.safeParse({ assessmentId: "a1", answers: { q1: "4" } });
    expect(res.success).toBe(true);
  });

  it("defaults to an empty answer map", () => {
    const res = submitAttemptSchema.safeParse({ assessmentId: "a1" });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.answers).toEqual({});
  });

  it("drops client-supplied score fields", () => {
    const res = submitAttemptSchema.safeParse({
      assessmentId: "a1",
      answers: {},
      score: 100,
      maxScore: 100,
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data).not.toHaveProperty("score");
      expect(res.data).not.toHaveProperty("maxScore");
    }
  });
});
