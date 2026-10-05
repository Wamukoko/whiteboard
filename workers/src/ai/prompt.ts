import type { Anthropic } from "@anthropic-ai/sdk";

/**
 * Prompt construction for quiz generation.
 *
 * The quiz is requested as a forced tool call rather than "reply with JSON".
 * A tool call with an `input_schema` constrains the model's output shape at
 * decode time, which is far more reliable than instructing prose JSON — and it
 * removes any need to strip code fences. The result is still re-validated with
 * `quizPayloadSchema` before it is trusted.
 */

export const QUIZ_TOOL_NAME = "emit_quiz";

export const quizTool: Anthropic.Tool = {
  name: QUIZ_TOOL_NAME,
  description:
    "Emit a curriculum-aligned practice quiz grounded strictly in the supplied source material.",
  input_schema: {
    type: "object",
    properties: {
      metadata: {
        type: "object",
        properties: {
          title: { type: "string", description: "Short quiz title." },
          curriculumCode: { type: "string", description: "e.g. CBC" },
          gradeBand: {
            type: "string",
            description: "CBC grade band if the material supports one, e.g. G5.",
          },
          subject: { type: "string", description: "Subject if identifiable from the material." },
        },
        required: ["title", "curriculumCode"],
        additionalProperties: false,
      },
      questions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string", description: "Unique within the quiz, e.g. q1." },
            type: {
              type: "string",
              enum: ["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"],
            },
            prompt: { type: "string", description: "The question stem." },
            options: {
              type: "array",
              items: { type: "string" },
              description:
                "Required for MULTIPLE_CHOICE (2-6 options). Must be exactly [\"True\",\"False\"] for TRUE_FALSE. Omit for SHORT_ANSWER.",
            },
            correctAnswer: {
              type: "string",
              description:
                "For MULTIPLE_CHOICE this must be one of the options verbatim.",
            },
            explanation: {
              type: "string",
              description: "Short answer shown to the learner after submitting.",
            },
            difficulty: { type: "string", enum: ["EASY", "MEDIUM", "HARD"] },
            topic: { type: "string", description: "Topic this question assesses." },
          },
          required: ["id", "type", "prompt", "correctAnswer", "difficulty", "topic"],
          additionalProperties: false,
        },
      },
    },
    required: ["metadata", "questions"],
    additionalProperties: false,
  },
};

export function buildSystemPrompt(input: {
  curriculumCode: string;
  gradeBand?: string;
  subject?: string;
  difficulty: string;
  questionCount: number;
}): string {
  const audience = [
    input.curriculumCode === "CBC"
      ? `You are supporting the Kenyan Competency-Based Curriculum (CBC). Target audience is a learner in ${input.gradeBand ?? "the grade band indicated by the material"}.`
      : `You are supporting the ${input.curriculumCode} curriculum.`,
    input.subject ? `Subject: ${input.subject}.` : "",
    "",
    "Ground every question strictly in the source material supplied by the user.",
    "Rules you must not break:",
    "- Do not invent CBC strand, sub-strand, or sub-topic codes. Only name a grade band or topic the material actually supports.",
    "- Do not introduce outside facts. If the material is too thin for the requested question count, emit fewer questions rather than padding with invented content.",
    "- Write age-appropriate language for the stated grade band.",
    "- Every correctAnswer for a MULTIPLE_CHOICE question must be copied verbatim from that question's options.",
    "- Distractors must be plausible and clearly distinguishable from the correct answer.",
    "- Distribute the requested difficulty rather than making every question the same.",
    `- Emit exactly ${input.questionCount} questions unless the material cannot support that many.`,
    "- Vary question types; do not emit more than three TRUE_FALSE questions in one quiz.",
    "",
    `Target difficulty: ${input.difficulty}.`,
  ].filter(Boolean);

  return audience.join("\n");
}

export function buildUserPrompt(chunkText: string): string {
  return [
    "Source material follows between the markers. Treat everything between them as the only permitted source of quiz content.",
    "",
    "--- BEGIN SOURCE MATERIAL ---",
    chunkText,
    "--- END SOURCE MATERIAL ---",
  ].join("\n");
}