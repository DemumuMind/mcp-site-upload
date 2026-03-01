export type TokenEncoding = "cl100k_base" | "o200k_base";
export type TokenModelId =
  | "gpt-4.1"
  | "gpt-4.1-mini"
  | "gpt-4o"
  | "gpt-4o-mini"
  | "o4-mini"
  | "o3";

export type TokenModelOption = {
  id: TokenModelId;
  label: string;
  encoding: TokenEncoding;
  contextWindow: number;
  details: string;
};

export type TokenEstimate = {
  tokens: number;
  words: number;
  characters: number;
  confidence: "high" | "medium";
  note: string;
  encoding: TokenEncoding;
};

type TokenizerModule = {
  countTokens: (input: string) => number;
};

export const TOKEN_MODEL_OPTIONS: TokenModelOption[] = [
  {
    id: "gpt-4.1",
    label: "GPT-4.1",
    encoding: "o200k_base",
    contextWindow: 1_000_000,
    details: "Flagship model class (o200k tokenizer family).",
  },
  {
    id: "gpt-4.1-mini",
    label: "GPT-4.1 mini",
    encoding: "o200k_base",
    contextWindow: 1_000_000,
    details: "Fast, lower-cost GPT-4.1 variant (o200k tokenizer family).",
  },
  {
    id: "gpt-4o",
    label: "GPT-4o",
    encoding: "o200k_base",
    contextWindow: 128_000,
    details: "Multimodal GPT-4o tokenizer profile.",
  },
  {
    id: "gpt-4o-mini",
    label: "GPT-4o mini",
    encoding: "o200k_base",
    contextWindow: 128_000,
    details: "Lightweight GPT-4o tokenizer profile.",
  },
  {
    id: "o4-mini",
    label: "o4-mini",
    encoding: "o200k_base",
    contextWindow: 200_000,
    details: "Reasoning family tokenizer approximation via o200k.",
  },
  {
    id: "o3",
    label: "o3",
    encoding: "o200k_base",
    contextWindow: 200_000,
    details: "Reasoning family tokenizer approximation via o200k.",
  },
];

const TOKEN_MODEL_BY_ID = new Map(TOKEN_MODEL_OPTIONS.map((model) => [model.id, model]));

const TOKENIZER_LOADERS: Record<TokenEncoding, () => Promise<TokenizerModule>> = {
  o200k_base: async () => import("gpt-tokenizer/encoding/o200k_base"),
  cl100k_base: async () => import("gpt-tokenizer/encoding/cl100k_base"),
};

const TOKENIZER_CACHE: Partial<Record<TokenEncoding, Promise<TokenizerModule>>> = {};

function countWords(input: string): number {
  const trimmed = input.trim();
  if (!trimmed) {
    return 0;
  }

  return trimmed.split(/\s+/).length;
}

function heuristicEstimate(text: string, encoding: TokenEncoding): number {
  const baseDivisor = encoding === "o200k_base" ? 3.7 : 4.1;
  return Math.max(1, Math.ceil(text.length / baseDivisor));
}

function getTokenizer(encoding: TokenEncoding): Promise<TokenizerModule> {
  if (!TOKENIZER_CACHE[encoding]) {
    TOKENIZER_CACHE[encoding] = TOKENIZER_LOADERS[encoding]();
  }

  return TOKENIZER_CACHE[encoding] as Promise<TokenizerModule>;
}

export function getTokenModelById(id: TokenModelId): TokenModelOption {
  return TOKEN_MODEL_BY_ID.get(id) ?? TOKEN_MODEL_OPTIONS[0];
}

export async function estimateTokensByModel(text: string, modelId: TokenModelId): Promise<TokenEstimate> {
  const model = getTokenModelById(modelId);
  const characters = text.length;
  const words = countWords(text);

  if (!text.trim()) {
    return {
      tokens: 0,
      words,
      characters,
      confidence: "high",
      note: "Start typing to estimate token usage.",
      encoding: model.encoding,
    };
  }

  try {
    const tokenizer = await getTokenizer(model.encoding);
    const tokens = tokenizer.countTokens(text);

    return {
      tokens,
      words,
      characters,
      confidence: "high",
      note: `Estimated with ${model.encoding} tokenizer (${model.label}).`,
      encoding: model.encoding,
    };
  } catch {
    return {
      tokens: heuristicEstimate(text, model.encoding),
      words,
      characters,
      confidence: "medium",
      note: `Tokenizer unavailable, fallback heuristic used for ${model.label}.`,
      encoding: model.encoding,
    };
  }
}
