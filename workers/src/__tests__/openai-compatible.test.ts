import { describe, expect, it, vi } from "vitest";
import { OpenAICompatibleQuizGenerator } from "../ai/openai-compatible-generator";
import { QuizGenerationError, type GenerationRequest } from "../ai/types";

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

const request = {
  sourceText: "Fractions worksheet content.",
  curriculumCode: "CBC",
  gradeBand: "G5",
  questionCount: 3,
  difficulty: "MEDIUM" as const,
};

function jsonResponse(body: unknown, init: { ok?: boolean; status?: number } = {}): Response {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

function completion(content: string, usage?: { prompt_tokens: number; completion_tokens: number }) {
  return { choices: [{ message: { content } }], usage };
}

function generatorWith(fetchImpl: typeof fetch) {
  return new OpenAICompatibleQuizGenerator({
    baseUrl: "http://localhost:11434/v1",
    apiKey: "test-key",
    model: "llama3.1:8b",
    fetchImpl,
  });
}

describe("OpenAICompatibleQuizGenerator", () => {
  it("posts to /chat/completions with the model and JSON mode", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(completion(JSON.stringify(validQuiz))));
    await generatorWith(fetchImpl as unknown as typeof fetch).generate(request);

    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("http://localhost:11434/v1/chat/completions");
    const body = JSON.parse(init.body as string);
    expect(body.model).toBe("llama3.1:8b");
    expect(body.response_format).toEqual({ type: "json_object" });
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer test-key");
  });

  it("returns a schema-valid quiz and real usage when reported", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse(
        completion(JSON.stringify(validQuiz), { prompt_tokens: 120, completion_tokens: 80 }),
      ),
    );

    const result = await generatorWith(fetchImpl as unknown as typeof fetch).generate(request);

    expect(result.quiz.questions).toHaveLength(3);
    expect(result.usage).toEqual({ inputTokens: 120, outputTokens: 80, totalTokens: 200 });
    expect(result.provider).toBe("openai-compatible");
    expect(result.model).toBe("llama3.1:8b");
  });

  it("estimates tokens when the server reports no usage", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(completion(JSON.stringify(validQuiz))));
    const result = await generatorWith(fetchImpl as unknown as typeof fetch).generate(request);
    expect(result.usage.totalTokens).toBeGreaterThan(0);
  });

  it("strips markdown code fences around the JSON", async () => {
    const fenced = "```json\n" + JSON.stringify(validQuiz) + "\n```";
    const fetchImpl = vi.fn(async () => jsonResponse(completion(fenced)));
    const result = await generatorWith(fetchImpl as unknown as typeof fetch).generate(request);
    expect(result.quiz.questions).toHaveLength(3);
  });

  it("raises QuizGenerationError on a non-2xx response", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ error: "nope" }, { ok: false, status: 500 }));
    await expect(generatorWith(fetchImpl as unknown as typeof fetch).generate(request)).rejects.toThrow(
      QuizGenerationError,
    );
  });

  it("raises when the content is not valid JSON", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(completion("not json at all")));
    await expect(generatorWith(fetchImpl as unknown as typeof fetch).generate(request)).rejects.toThrow(
      /not valid JSON/,
    );
  });

  it("rejects provider output that fails the shared schema", async () => {
    const broken = { ...validQuiz, questions: [{ ...validQuiz.questions[0], correctAnswer: "42" }] };
    const fetchImpl = vi.fn(async () => jsonResponse(completion(JSON.stringify(broken))));
    await expect(generatorWith(fetchImpl as unknown as typeof fetch).generate(request)).rejects.toThrow(
      /failed quizPayloadSchema/,
    );
  });

  it("requires a base URL and a model", () => {
    expect(
      () => new OpenAICompatibleQuizGenerator({ baseUrl: "", model: "llama3.1:8b" }),
    ).toThrow(/base URL/);
    expect(
      () => new OpenAICompatibleQuizGenerator({ baseUrl: "http://x/v1", model: "" }),
    ).toThrow(/model/);
  });
});
