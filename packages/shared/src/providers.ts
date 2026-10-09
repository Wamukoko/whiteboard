import { z } from "zod";

/**
 * Provider + model registry (ADR-004).
 *
 * The generation pipeline depends on the `QuizGenerator` interface, but *which*
 * provider and model to use must be data, not code. Before this registry the
 * available models lived in a hardcoded Zod enum and the worker factory assumed
 * Anthropic, so adding an open-source model meant editing the shared contract,
 * the worker factory and the job handler together.
 *
 * This file is the single source of truth for:
 *   - which providers exist and how to reach them (kind, base URL, key env var),
 * - which models each provider exposes (and which is the default),
 *   and is consumed by the API request schema (validation) and the worker
 *   factory (construction), so both cannot drift.
 *
 * Providers come in two kinds:
 *   - "anthropic": the first-party SDK, models fixed to the vendor's catalogue.
 *   - "openai-compatible": anything that speaks `POST {baseUrl}/chat/completions`
 *     — Ollama, vLLM, LM Studio, llama.cpp server, plus aggregators such as
 *     OpenRouter, Groq or Together. These accept arbitrary model ids because
 *     the running server decides what it has pulled/loaded.
 */

export const PROVIDER_KINDS = ["anthropic", "openai-compatible"] as const;
export type ProviderKind = (typeof PROVIDER_KINDS)[number];

export interface ModelDefinition {
  /** Wire id sent to the provider, e.g. "claude-sonnet-5" or "llama3.1:8b". */
  id: string;
  /** Human label for selectors and docs. */
  label: string;
  /** Approximate context window in tokens (used for chunk budgeting). */
  contextWindow: number;
  /** The model used when a request omits one for this provider. */
  isDefault?: boolean;
}

export interface ProviderDefinition {
  /** Stable id used in API payloads, job data and env (AI_PROVIDER). */
  id: string;
  kind: ProviderKind;
  label: string;
  /** When true, any non-empty model id is accepted (self-hosted/aggregators). */
  allowArbitraryModels: boolean;
  /** Env var holding this provider's credential; empty string means none needed. */
  apiKeyEnv: string;
  /** OpenAI-compatible providers only: default server base URL. */
  defaultBaseUrl?: string;
  models: readonly ModelDefinition[];
}

/** The default model used when nothing else is configured. */
export const DEFAULT_GENERATION_MODEL = "claude-sonnet-5";

/** The provider used when a request and the environment both omit one. */
export const DEFAULT_AI_PROVIDER = "anthropic";

export const PROVIDERS: readonly ProviderDefinition[] = [
  {
    id: "anthropic",
    kind: "anthropic",
    label: "Anthropic Claude",
    allowArbitraryModels: false,
    apiKeyEnv: "ANTHROPIC_API_KEY",
    models: [
      {
        id: "claude-sonnet-5",
        label: "Claude Sonnet 5",
        contextWindow: 200_000,
        isDefault: true,
      },
      { id: "claude-haiku-4-5", label: "Claude Haiku 4.5", contextWindow: 200_000 },
    ],
  },
  {
    id: "openai-compatible",
    kind: "openai-compatible",
    label: "Open-source / OpenAI-compatible",
    allowArbitraryModels: true,
    apiKeyEnv: "OPENAI_COMPATIBLE_API_KEY",
    defaultBaseUrl: "http://localhost:11434/v1",
    models: [
      {
        id: "llama3.1:8b",
        label: "Llama 3.1 8B (Ollama)",
        contextWindow: 128_000,
        isDefault: true,
      },
      { id: "qwen2.5:7b", label: "Qwen 2.5 7B (Ollama)", contextWindow: 32_768 },
      { id: "mistral:7b", label: "Mistral 7B (Ollama)", contextWindow: 32_768 },
    ],
  },
];

/** Provider ids usable in API payloads and `z.enum(...)`. */
export const PROVIDER_IDS = PROVIDERS.map((provider) => provider.id) as [string, ...string[]];

/** The default provider id (Anthropic until a deployment overrides it). */
export const DEFAULT_AI_PROVIDER_ID = PROVIDERS.find((p) => p.id === "anthropic")?.id ?? PROVIDERS[0]!.id;

export function findProvider(providerId: string): ProviderDefinition | undefined {
  return PROVIDERS.find((provider) => provider.id === providerId);
}

export function modelsForProvider(providerId: string): readonly ModelDefinition[] {
  return findProvider(providerId)?.models ?? [];
}

/** The model a provider falls back to when the request omits one. */
export function defaultModelForProvider(providerId: string): string {
  const provider = findProvider(providerId);
  if (!provider) return DEFAULT_GENERATION_MODEL;
  return (
    provider.models.find((model) => model.isDefault)?.id ??
    provider.models[0]?.id ??
    DEFAULT_GENERATION_MODEL
  );
}

/**
 * Whether a provider accepts a given model id. Open-source / aggregator
 * providers set `allowArbitraryModels` because the server, not this registry,
 * owns its model list; a blank id is never valid.
 */
export function isModelAllowed(providerId: string, model: string): boolean {
  const provider = findProvider(providerId);
  if (!provider) return false;
  if (model.trim().length === 0) return false;
  if (provider.allowArbitraryModels) return true;
  return provider.models.some((candidate) => candidate.id === model);
}
