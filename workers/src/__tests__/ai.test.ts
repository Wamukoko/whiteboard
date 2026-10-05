import { describe, expect, it, vi } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import { AnthropicQuizGenerator } from "../ai/anthropic-generator";
import { QuizGenerationError, type GenerationResult, type QuizGenerator } from "../ai/types";
import { generateQuizFromDocument } from "../ai";
import { QUIZ_TOOL_NAME, buildSystemPrompt } from "../ai/prompt";

const API_KEY = "test-key";

function toolMessage(input: unknown, usage = { input_tokens: 100, output_tokens: 50 }) {
  return {
    content: [{ type: "tool_use" as const, id: "t1", name: QUIZ_TOOL_NAME, input }],
    stop_reason: "tool_use" as const,
    usage,
  };
}

function fakeClient(create: (params: unknown) => unknown): Anthropic {
  return { messages: { create: vi.fn(create) } } as unknown as Anthropic;
}

const validQuiz = {
  metadata: { title: "Fractions Practice", curriculumCode: "CBC", gradeBand: "G5" },
  questions: [
    {
      id: "q1",
      type: "MULTIPLE_CHOICE" as const,
      prompt: "What is 1/2 + 1/2?",
      options: ["1", "2", "1/4"],
      correctAnswer: "1",
      difficulty: "EASY" as const,
      topic: "Fractions",
    },
    {
      id: "q2",
      type: "TRUE_FALSE" as const,
      prompt: "1/2 is greater than 1/4.",
      options: ["True", "False"] as ["True", "False"],
      correctAnswer: "True" as const,
      difficulty: "EASY" as const,
      topic: "Fractions",
    },
    {
      id: "q3",
      type: "SHORT_ANSWER" as const,
      prompt: "Name a whole number.",
      correctAnswer: "3",
      difficulty: "MEDIUM" as const,
      topic: "Numbers",
    },
  ],
};

const baseRequest = {
  sourceText: "Fractions worksheet content.",
  curriculumCode: "CBC",
  gradeBand: "G5",
  questionCount: 3,
  difficulty: "MEDIUM" as const,
};

describe("AnthropicQuizGenerator", () => {
  it("returns a schema-valid quiz and reports real token usage", async () => {
    const client = fakeClient(() => toolMessage(validQuiz, { input_tokens: 120, output_tokens: 80 }));
    const generator = new AnthropicQuizGenerator({ apiKey: API_KEY, model: "claude-sonnet-5", client });

    const result = await generator.generate(baseRequest);

    expect(result.quiz.questions).toHaveLength(3);
    expect(result.usage).toEqual({ inputTokens: 120, outputTokens: 80, totalTokens: 200 });
    expect(result.provider).toBe("anthropic");
    expect(result.model).toBe("claude-sonnet-5");
  });

  it("forces the quiz tool call so output shape is constrained", async () => {
    const create = vi.fn((_params: unknown) => toolMessage(validQuiz));
    const generator = new AnthropicQuizGenerator({
      apiKey: API_KEY,
      model: "claude-sonnet-5",
      client: fakeClient(create),
    });

    await generator.generate(baseRequest);

    const params = create.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(params.tool_choice).toEqual({
      type: "tool",
      name: QUIZ_TOOL_NAME,
      disable_parallel_tool_use: true,
    });
    const tools = params.tools as Array<{ name: string; input_schema: { type: string } }>;
    expect(tools[0]?.name).toBe(QUIZ_TOOL_NAME);
    expect(tools[0]?.input_schema.type).toBe("object");
  });

  it("rejects provider output that fails the shared schema", async () => {
    // Correct answer absent from options: the exact class of defect the parent
    // review gate exists to catch, so it must never reach persistence.
    const broken = {
      ...validQuiz,
      questions: [{ ...validQuiz.questions[0], correctAnswer: "42" }, validQuiz.questions[1], validQuiz.questions[2]],
    };
    const generator = new AnthropicQuizGenerator({
      apiKey: API_KEY,
      model: "claude-sonnet-5",
      client: fakeClient(() => toolMessage(broken)),
    });

    await expect(generator.generate(baseRequest)).rejects.toThrow(QuizGenerationError);
    await expect(generator.generate(baseRequest)).rejects.toThrow(/must be one of the provided options/);
  });

  it("rejects a quiz below the minimum question count", async () => {
    const tooFew = { ...validQuiz, questions: [validQuiz.questions[0]] };
    const generator = new AnthropicQuizGenerator({
      apiKey: API_KEY,
      model: "claude-sonnet-5",
      client: fakeClient(() => toolMessage(tooFew)),
    });

    await expect(generator.generate(baseRequest)).rejects.toThrow(/at least 3 questions/);
  });

  it("raises when the provider returns no tool call", async () => {
    const generator = new AnthropicQuizGenerator({
      apiKey: API_KEY,
      model: "claude-sonnet-5",
      client: fakeClient(() => ({
        content: [{ type: "text", text: "sorry" }],
        stop_reason: "end_turn",
        usage: { input_tokens: 10, output_tokens: 5 },
      })),
    });

    await expect(generator.generate(baseRequest)).rejects.toThrow(/no emit_quiz tool call/);
  });

  it("wraps transport failures in QuizGenerationError", async () => {
    const generator = new AnthropicQuizGenerator({
      apiKey: API_KEY,
      model: "claude-sonnet-5",
      client: fakeClient(() => {
        throw new Error("529 overloaded_error");
      }),
    });

    await expect(generator.generate(baseRequest)).rejects.toThrow(QuizGenerationError);
    await expect(generator.generate(baseRequest)).rejects.toThrow(/529 overloaded_error/);
  });

  it("refuses an unsupported model", () => {
    expect(() => new AnthropicQuizGenerator({ apiKey: API_KEY, model: "gpt-9" })).toThrow(
      /Unsupported model/,
    );
    expect(() => new AnthropicQuizGenerator({ apiKey: API_KEY, model: "" })).toThrow(
      /Unsupported model/,
    );
  });
});

function stubGenerator(
  partials: Partial<GenerationResult>[],
  calls: string[] = [],
): QuizGenerator {
  return {
    provider: "stub",
    model: "stub-model",
    async generate(request) {
      calls.push(request.sourceText);
      const partial = partials[calls.length - 1] ?? {};
      return {
        quiz: {
          metadata: { title: "Stub", curriculumCode: "CBC" },
          questions: validQuiz.questions,
        },
        usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
        provider: "stub",
        model: "stub-model",
        ...partial,
      };
    },
  };
}

describe("generateQuizFromDocument", () => {
  it("rejects empty source text", async () => {
    const generator = stubGenerator([]);
    await expect(
      generateQuizFromDocument(
        generator,
        { curriculumCode: "CBC", questionCount: 5, difficulty: "MEDIUM" },
        "   ",
      ),
    ).rejects.toThrow(/empty source text/);
  });

  it("fans out across chunks and sums token usage", async () => {
    const document = Array.from({ length: 12 }, (_, i) => `Paragraph ${i} ${"x ".repeat(200)}`).join(
      "\n\n",
    );
    const calls: string[] = [];
    const generator = stubGenerator(
      Array.from({ length: 12 }, () => ({
        usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
      })),
      calls,
    );

    const result = await generateQuizFromDocument(
      generator,
      { curriculumCode: "CBC", questionCount: 6, difficulty: "MEDIUM" },
      document,
      { maxChars: 1000, overlapChars: 100 },
    );

    expect(calls.length).toBeGreaterThan(1);
    expect(result.usage.totalTokens).toBe(150 * calls.length);
  });

  it("de-duplicates questions repeated across overlapping chunks", async () => {
    const document = Array.from({ length: 8 }, (_, i) => `Paragraph ${i} ${"x ".repeat(200)}`).join(
      "\n\n",
    );
    const generator = stubGenerator([]);

    const result = await generateQuizFromDocument(
      generator,
      { curriculumCode: "CBC", questionCount: 9, difficulty: "MEDIUM" },
      document,
      { maxChars: 1000, overlapChars: 400 },
    );

    // All three stub questions repeat verbatim in every chunk, so only one of
    // each survives the merge.
    expect(result.quiz.questions).toHaveLength(3);
    const prompts = result.quiz.questions.map((q) => q.prompt);
    expect(new Set(prompts).size).toBe(prompts.length);
  });

  it("re-indexes merged question ids so they stay unique and sequential", async () => {
    const document = Array.from({ length: 6 }, (_, i) => `Paragraph ${i} ${"x ".repeat(200)}`).join(
      "\n\n",
    );
    const calls: string[] = [];
    const generator: QuizGenerator = {
      provider: "stub",
      model: "stub-model",
      async generate(request) {
        const index = calls.push(request.sourceText) - 1;
        return {
          quiz: {
            metadata: { title: "Stub", curriculumCode: "CBC" },
            questions: [
              {
                id: `chunk-${index}-a`,
                type: "SHORT_ANSWER",
                prompt: `Unique question ${index}`,
                correctAnswer: "yes",
                difficulty: "EASY",
                topic: "T",
              },
              {
                id: `chunk-${index}-b`,
                type: "SHORT_ANSWER",
                prompt: `Another unique question ${index}`,
                correctAnswer: "yes",
                difficulty: "EASY",
                topic: "T",
              },
              {
                id: `chunk-${index}-c`,
                type: "SHORT_ANSWER",
                prompt: `Third unique question ${index}`,
                correctAnswer: "yes",
                difficulty: "EASY",
                topic: "T",
              },
            ],
          },
          usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
          provider: "stub",
          model: "stub-model",
        };
      },
    };

    const result = await generateQuizFromDocument(
      generator,
      { curriculumCode: "CBC", questionCount: 9, difficulty: "MEDIUM" },
      document,
      { maxChars: 1000, overlapChars: 100 },
    );

    expect(result.quiz.questions.map((q) => q.id)).toEqual(
      result.quiz.questions.map((_, i) => `q${i + 1}`),
    );
  });

  it("spreads the requested question count across chunks", async () => {
    const document = Array.from({ length: 8 }, (_, i) => `Paragraph ${i} ${"x ".repeat(200)}`).join(
      "\n\n",
    );
    const requested: number[] = [];
    const generator: QuizGenerator = {
      provider: "stub",
      model: "stub-model",
      async generate(request) {
        requested.push(request.questionCount);
        return {
          quiz: {
            metadata: { title: "Stub", curriculumCode: "CBC" },
            questions: validQuiz.questions,
          },
          usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
          provider: "stub",
          model: "stub-model",
        };
      },
    };

    await generateQuizFromDocument(
      generator,
      { curriculumCode: "CBC", questionCount: 12, difficulty: "MEDIUM" },
      document,
      { maxChars: 1000, overlapChars: 100 },
    );

    expect(requested.length).toBeGreaterThan(1);
    for (const count of requested) expect(count).toBeGreaterThanOrEqual(1);
    // No chunk may be asked for more than the overall target.
    for (const count of requested) expect(count).toBeLessThanOrEqual(12);
  });
});

describe("buildSystemPrompt", () => {
  it("forbids fabricating CBC structure codes", () => {
    const prompt = buildSystemPrompt({
      curriculumCode: "CBC",
      gradeBand: "G5",
      difficulty: "MEDIUM",
      questionCount: 10,
    });
    expect(prompt).toMatch(/Competency-Based Curriculum/);
    expect(prompt).toMatch(/Do not invent CBC strand/);
    expect(prompt).toMatch(/emit fewer questions rather than padding/);
  });

  it("pins the requested count and difficulty", () => {
    const prompt = buildSystemPrompt({
      curriculumCode: "CAMBRIDGE",
      gradeBand: undefined,
      subject: "Biology",
      difficulty: "HARD",
      questionCount: 7,
    });
    expect(prompt).toMatch(/exactly 7 questions/);
    expect(prompt).toMatch(/Target difficulty: HARD/);
    expect(prompt).toMatch(/Subject: Biology/);
  });
});