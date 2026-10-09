import { describe, expect, it } from "vitest";
import {
  DEFAULT_AI_PROVIDER_ID,
  DEFAULT_GENERATION_MODEL,
  PROVIDERS,
  defaultModelForProvider,
  findProvider,
  isModelAllowed,
  modelsForProvider,
} from "../providers";
import { GENERATION_MODELS, requestQuizGenerationSchema } from "../learning";

describe("provider registry", () => {
  it("registers unique provider ids", () => {
    const ids = PROVIDERS.map((provider) => provider.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain(DEFAULT_AI_PROVIDER_ID);
  });

  it("gives every provider a default model", () => {
    for (const provider of PROVIDERS) {
      expect(defaultModelForProvider(provider.id)).toBeTruthy();
    }
  });

  it("resolves the Anthropic default model", () => {
    expect(defaultModelForProvider("anthropic")).toBe(DEFAULT_GENERATION_MODEL);
    expect(GENERATION_MODELS).toContain(DEFAULT_GENERATION_MODEL);
  });

  it("returns an empty list for an unknown provider", () => {
    expect(findProvider("nope")).toBeUndefined();
    expect(modelsForProvider("nope")).toEqual([]);
  });

  it("only allows registered models for a closed provider", () => {
    expect(isModelAllowed("anthropic", "claude-sonnet-5")).toBe(true);
    expect(isModelAllowed("anthropic", "gpt-9")).toBe(false);
    expect(isModelAllowed("anthropic", "")).toBe(false);
  });

  it("accepts arbitrary non-empty models for an OpenAI-compatible provider", () => {
    expect(isModelAllowed("openai-compatible", "llama3.1:8b")).toBe(true);
    expect(isModelAllowed("openai-compatible", "some/custom-model")).toBe(true);
    expect(isModelAllowed("openai-compatible", "  ")).toBe(false);
  });
});

describe("requestQuizGenerationSchema provider/model", () => {
  const base = { sourceMaterialId: "m1", learnerId: "l1" };

  it("defaults to the default provider and its model", () => {
    const res = requestQuizGenerationSchema.safeParse(base);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.provider).toBe(DEFAULT_AI_PROVIDER_ID);
      expect(res.data.model).toBe(DEFAULT_GENERATION_MODEL);
    }
  });

  it("rejects an unknown provider", () => {
    expect(
      requestQuizGenerationSchema.safeParse({ ...base, provider: "gemini" }).success,
    ).toBe(false);
  });

  it("rejects a model that does not belong to a closed provider", () => {
    expect(
      requestQuizGenerationSchema.safeParse({ ...base, provider: "anthropic", model: "gpt-9" })
        .success,
    ).toBe(false);
  });

  it("accepts an arbitrary model for an OpenAI-compatible provider", () => {
    const res = requestQuizGenerationSchema.safeParse({
      ...base,
      provider: "openai-compatible",
      model: "some/custom-model",
    });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.model).toBe("some/custom-model");
  });

  it("fills the provider's default model when only the provider is given", () => {
    const res = requestQuizGenerationSchema.safeParse({
      ...base,
      provider: "openai-compatible",
    });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.model).toBe(defaultModelForProvider("openai-compatible"));
  });
});
