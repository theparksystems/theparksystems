export type AriaRetrieval = {
  id: string;
  type: "article" | "message" | "correlation";
  text: string;
  score: number;
  entities: string[];
  reason: string;
};

export type AriaMemoryStats = {
  database: "sqlite";
  correlations: number;
  phrases: number;
};

export function askSqliteMemory(
  sessionId: string,
  text: string,
): {
  answer: string;
  retrievals: AriaRetrieval[];
  correlations: AriaRetrieval[];
  responsePrompt: string;
  stats: AriaMemoryStats;
};

export function clearSqliteMemory(sessionId: string): {
  ok: boolean;
  stats: AriaMemoryStats;
};

export function getSqliteMemoryStats(sessionId: string): AriaMemoryStats;
