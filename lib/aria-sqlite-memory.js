import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const VECTOR_SIZE = 64;
const DB_PATH =
  process.env.ARIA_MEMORY_DB ||
  path.join(process.cwd(), "data", "aria-memory.sqlite");

const THRESHOLDS = {
  SHORT_MAX: 0.25,
  MID_MAX: 0.65,
  DECAY_MIN: 0.05,
};

const DECAY_CONFIG = {
  short: { interval: 75, rate: 0.1 },
  mid: { interval: 200, rate: 0.05 },
  long: { interval: 1000, rate: 0.01 },
};

const STOPWORDS = new Set([
  "a",
  "about",
  "after",
  "again",
  "all",
  "also",
  "am",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "because",
  "been",
  "before",
  "being",
  "between",
  "but",
  "by",
  "can",
  "could",
  "did",
  "do",
  "does",
  "down",
  "during",
  "for",
  "from",
  "get",
  "got",
  "had",
  "has",
  "have",
  "he",
  "her",
  "here",
  "him",
  "how",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "just",
  "like",
  "may",
  "me",
  "more",
  "most",
  "must",
  "my",
  "no",
  "not",
  "now",
  "of",
  "off",
  "on",
  "or",
  "our",
  "out",
  "over",
  "really",
  "same",
  "she",
  "should",
  "so",
  "some",
  "that",
  "the",
  "their",
  "them",
  "then",
  "there",
  "these",
  "they",
  "thing",
  "this",
  "those",
  "through",
  "to",
  "too",
  "under",
  "up",
  "very",
  "was",
  "we",
  "were",
  "what",
  "when",
  "where",
  "which",
  "while",
  "who",
  "why",
  "will",
  "with",
  "would",
  "you",
  "your",
]);

const MARKET_TERMS = [
  "apr",
  "basic",
  "buyers",
  "buy",
  "cash",
  "college",
  "consumer",
  "covid",
  "credit",
  "crude",
  "debt",
  "demand",
  "estate",
  "essentials",
  "hold",
  "homes",
  "inventory",
  "liquidity",
  "memory",
  "oil",
  "pullback",
  "rates",
  "real",
  "sell",
  "silver",
  "sqlite",
  "strength",
];

const baseInsights = [
  {
    id: "base-crude-hold",
    text: "Crude Oil is a HOLD. Hold current exposure while waiting for stronger demand and inventory confirmation.",
    entities: ["crude", "oil", "hold", "demand", "inventory"],
  },
  {
    id: "base-silver-buy",
    text: "Silver is a BUY. Buy signal active. Watch liquidity and pullback entries.",
    entities: ["silver", "buy", "liquidity", "pullback", "entries"],
  },
  {
    id: "base-real-estate-sell",
    text: "Real Estate is a SELL. Sell into strength while rates, liquidity, and demand remain pressured.",
    entities: ["real", "estate", "sell", "rates", "liquidity", "demand"],
  },
  {
    id: "base-real-estate-debt",
    text: "The real estate call centers on consumer liquidity, debt pressure, high APR credit balances, and fewer young buyers able to afford basic essentials.",
    entities: ["real", "estate", "debt", "apr", "buyers", "essentials"],
  },
  {
    id: "base-sqlite-memory",
    text: "ARIA uses deployment-local SQLite memory for conversation correlations. No Supabase service is used by this memory layer.",
    entities: ["aria", "sqlite", "memory", "correlations", "local"],
  },
].map((item) => ({
  ...item,
  embedding: embed(`${item.text} ${item.entities.join(" ")}`),
}));

let database;

export function askSqliteMemory(sessionId, text) {
  const normalizedSessionId = normalizeSessionId(sessionId);
  const cleanText = normalizeText(text);

  if (!cleanText) {
    const retrievals = [];
    const correlations = [];
    return {
      answer: buildHumanAnswer(cleanText, retrievals, correlations),
      retrievals,
      correlations,
      responsePrompt: buildResponsePrompt(cleanText, retrievals, correlations),
      stats: getStats(normalizedSessionId),
    };
  }

  const db = getDatabase();
  const messageIndex = incrementMessageIndex(db, normalizedSessionId);
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO chat_messages
      (id, session_id, role, content, created_at, message_index)
      VALUES (?, ?, 'user', ?, ?, ?)`,
  ).run(crypto.randomUUID(), normalizedSessionId, cleanText, now, messageIndex);

  const tokensBySentence = splitSentences(cleanText).map(tokenizeSentence);
  for (const tokens of tokensBySentence) {
    correlateSentence(db, normalizedSessionId, cleanText, tokens, messageIndex, now);
  }

  applyDecay(db, normalizedSessionId, messageIndex, now);
  promotePhrases(db, normalizedSessionId, messageIndex, now);

  const context = retrieveContext(db, normalizedSessionId, cleanText, messageIndex);

  return {
    answer: buildHumanAnswer(cleanText, context.retrievals, context.correlations),
    retrievals: context.retrievals,
    correlations: context.correlations,
    responsePrompt: buildResponsePrompt(
      cleanText,
      context.retrievals,
      context.correlations,
    ),
    stats: getStats(normalizedSessionId),
  };
}

export function clearSqliteMemory(sessionId) {
  const normalizedSessionId = normalizeSessionId(sessionId);
  const db = getDatabase();

  const tables = [
    "chat_messages",
    "chat_purgatory",
    "chat_correlations",
    "chat_phrases",
    "chat_decay",
    "chat_message_counter",
  ];

  for (const table of tables) {
    db.prepare(`DELETE FROM ${table} WHERE session_id = ?`).run(normalizedSessionId);
  }

  return { ok: true, stats: getStats(normalizedSessionId) };
}

export function getSqliteMemoryStats(sessionId) {
  return getStats(normalizeSessionId(sessionId));
}

function getDatabase() {
  if (database) {
    return database;
  }

  mkdirSync(path.dirname(DB_PATH), { recursive: true });
  database = new DatabaseSync(DB_PATH);
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec("PRAGMA foreign_keys = ON;");
  database.exec("PRAGMA busy_timeout = 3000;");
  database.exec(schemaSql);
  seedContradictions(database);
  return database;
}

function incrementMessageIndex(db, sessionId) {
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO chat_message_counter (session_id, current_index, last_updated)
     VALUES (?, 0, ?)
     ON CONFLICT(session_id) DO NOTHING`,
  ).run(sessionId, now);
  db.prepare(
    `UPDATE chat_message_counter
     SET current_index = current_index + 1, last_updated = ?
     WHERE session_id = ?`,
  ).run(now, sessionId);

  return db
    .prepare(
      `SELECT current_index AS currentIndex
       FROM chat_message_counter
       WHERE session_id = ?`,
    )
    .get(sessionId).currentIndex;
}

function correlateSentence(db, sessionId, messageText, tokens, messageIndex, now) {
  if (tokens.length < 2) {
    return;
  }

  for (const token of tokens) {
    db.prepare(
      `INSERT INTO chat_purgatory
        (id, session_id, word, pos, simple_pos, sentence, sentence_index, message_index, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      crypto.randomUUID(),
      sessionId,
      token.word,
      token.pos,
      token.simplePOS,
      messageText,
      token.index,
      messageIndex,
      now,
    );
  }

  for (let leftIndex = 0; leftIndex < tokens.length; leftIndex += 1) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < Math.min(tokens.length, leftIndex + 5);
      rightIndex += 1
    ) {
      upsertCorrelation(
        db,
        sessionId,
        tokens[leftIndex],
        tokens[rightIndex],
        messageText,
        messageIndex,
        now,
      );
    }
  }
}

function upsertCorrelation(db, sessionId, left, right, messageText, messageIndex, now) {
  const patternKey = generatePatternKey(left.word, right.word);
  const existing = db
    .prepare(
      `SELECT *
       FROM chat_correlations
       WHERE session_id = ? AND pattern_key = ?`,
    )
    .get(sessionId, patternKey);
  const { score, categoryRel } = calculateInitialScore({
    pos1: left.simplePOS,
    pos2: right.simplePOS,
    wordDistance: Math.abs(right.index - left.index),
    messageDistance: existing ? messageIndex - existing.last_seen_message_index : null,
  });

  if (existing) {
    const reinforcedScore = Math.min(
      1,
      existing.score_latest + (1 - existing.score_latest) * 0.15,
    );
    const nextScore = Math.max(reinforcedScore, score);
    const nextTier = getTierForScore(nextScore);

    db.prepare(
      `UPDATE chat_correlations
       SET score_latest = ?,
           reinforcement_count = reinforcement_count + 1,
           tier = ?,
           joined_sentence = ?,
           last_seen_message_index = ?,
           messages_since_last_decay = 0,
           updated_at = ?
       WHERE session_id = ? AND pattern_key = ?`,
    ).run(
      nextScore,
      nextTier,
      messageText,
      messageIndex,
      now,
      sessionId,
      patternKey,
    );
    return;
  }

  db.prepare(
    `INSERT INTO chat_correlations
      (id, session_id, pattern_key, word1, word2, pos1, pos2, category_rel,
       joined_sentence, score_initial, score_latest, reinforcement_count, tier,
       last_seen_message_index, messages_since_last_decay, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, 0, ?, ?)`,
  ).run(
    crypto.randomUUID(),
    sessionId,
    patternKey,
    left.word,
    right.word,
    left.simplePOS,
    right.simplePOS,
    categoryRel,
    messageText,
    score,
    score,
    getTierForScore(score),
    messageIndex,
    now,
    now,
  );
}

function applyDecay(db, sessionId, messageIndex, now) {
  const rows = db
    .prepare(
      `SELECT *
       FROM chat_correlations
       WHERE session_id = ?`,
    )
    .all(sessionId);

  for (const row of rows) {
    const config = DECAY_CONFIG[row.tier] || DECAY_CONFIG.short;
    const age = Math.max(0, messageIndex - row.last_seen_message_index);

    if (age < config.interval) {
      continue;
    }

    const nextScore = Math.max(0, row.score_latest * (1 - config.rate));

    if (nextScore < THRESHOLDS.DECAY_MIN) {
      db.prepare(
        `INSERT INTO chat_decay
          (id, session_id, pattern_key, word1, word2, pos1, pos2, category_rel,
           score_final, reinforcement_count, decayed_from, decayed_at, messages_in_decay)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(session_id, pattern_key) DO UPDATE SET
           score_final = excluded.score_final,
           reinforcement_count = excluded.reinforcement_count,
           decayed_from = excluded.decayed_from,
           decayed_at = excluded.decayed_at,
           messages_in_decay = excluded.messages_in_decay`,
      ).run(
        row.id,
        sessionId,
        row.pattern_key,
        row.word1,
        row.word2,
        row.pos1,
        row.pos2,
        row.category_rel,
        nextScore,
        row.reinforcement_count,
        row.tier,
        now,
        age,
      );
      db.prepare(
        `DELETE FROM chat_correlations
         WHERE session_id = ? AND pattern_key = ?`,
      ).run(sessionId, row.pattern_key);
      continue;
    }

    db.prepare(
      `UPDATE chat_correlations
       SET score_latest = ?,
           tier = ?,
           messages_since_last_decay = ?,
           updated_at = ?
       WHERE session_id = ? AND pattern_key = ?`,
    ).run(nextScore, getTierForScore(nextScore), age, now, sessionId, row.pattern_key);
  }
}

function promotePhrases(db, sessionId, messageIndex, now) {
  const rows = db
    .prepare(
      `SELECT *
       FROM chat_correlations
       WHERE session_id = ?
       ORDER BY score_latest DESC
       LIMIT 40`,
    )
    .all(sessionId);
  const phrases = new Map();

  for (const left of rows) {
    for (const right of rows) {
      if (left.id === right.id) {
        continue;
      }

      const shared = [left.word1, left.word2].find(
        (word) => word === right.word1 || word === right.word2,
      );

      if (!shared) {
        continue;
      }

      const words = Array.from(
        new Set([left.word1, left.word2, right.word1, right.word2]),
      );

      if (words.length !== 3) {
        continue;
      }

      const phraseKey = words.slice().sort().join("_");
      if (!phrases.has(phraseKey)) {
        phrases.set(phraseKey, { words, correlations: [left, right] });
      }
    }
  }

  for (const [phraseKey, phrase] of phrases) {
    const score =
      phrase.correlations.reduce((sum, item) => sum + item.score_latest, 0) /
      phrase.correlations.length;
    const strongest = phrase.correlations.reduce((best, item) =>
      item.score_latest > best.score_latest ? item : best,
    );

    db.prepare(
      `INSERT INTO chat_phrases
        (id, session_id, phrase_key, words_json, pos_tags_json, source_correlations_json,
         score_combined, reinforcement_count, tier, last_seen_message_index, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
       ON CONFLICT(session_id, phrase_key) DO UPDATE SET
         score_combined = max(chat_phrases.score_combined, excluded.score_combined),
         reinforcement_count = chat_phrases.reinforcement_count + 1,
         tier = excluded.tier,
         last_seen_message_index = excluded.last_seen_message_index,
         updated_at = excluded.updated_at`,
    ).run(
      crypto.randomUUID(),
      sessionId,
      phraseKey,
      JSON.stringify(phrase.words),
      JSON.stringify(phrase.words.map((word) => inferPOS(word))),
      JSON.stringify(phrase.correlations.map((item) => item.id)),
      score,
      strongest.tier,
      messageIndex,
      now,
      now,
    );
  }
}

function retrieveContext(db, sessionId, text, messageIndex) {
  const queryEntities = extractEntities(text);
  const queryEmbedding = embed(`${text} ${queryEntities.join(" ")}`);
  const isMemoryQuestion = queryEntities.some((entity) =>
    ["aria", "sqlite", "memory", "supabase", "correlations"].includes(entity),
  );
  const base = baseInsights
    .map((item) => scoreBaseInsight(item, queryEmbedding, queryEntities))
    .filter((item) => isMemoryQuestion || item.id !== "base-sqlite-memory")
    .sort((a, b) => b.score - a.score);

  const messages = db
    .prepare(
      `SELECT *
       FROM chat_messages
       WHERE session_id = ? AND message_index < ?
       ORDER BY message_index DESC
       LIMIT 40`,
    )
    .all(sessionId, messageIndex)
    .map((item) => scorePreviousMessage(item, queryEmbedding, queryEntities, messageIndex));

  const correlations = db
    .prepare(
      `SELECT *
       FROM chat_correlations
       WHERE session_id = ?
       ORDER BY score_latest DESC, reinforcement_count DESC
       LIMIT 24`,
    )
    .all(sessionId)
    .map((item) => scoreCorrelation(item, queryEntities));

  const phrases = db
    .prepare(
      `SELECT *
       FROM chat_phrases
       WHERE session_id = ?
       ORDER BY score_combined DESC, reinforcement_count DESC
       LIMIT 12`,
    )
    .all(sessionId)
    .map((item) => scorePhrase(item, queryEntities));

  const relevantBase = base.filter((item) => item.matchWeight > 0);
  const relevantMessages = messages.filter((item) => item.matchWeight > 0);
  const topReferences = [...relevantBase, ...relevantMessages]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const topCorrelations = [...correlations, ...phrases]
    .filter((item) => item.matchWeight > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return {
    retrievals: topReferences,
    correlations: topCorrelations,
  };
}

function scoreBaseInsight(item, queryEmbedding, queryEntities) {
  const cosineScore = cosine(queryEmbedding, item.embedding);
  const overlap = entityOverlap(queryEntities, item.entities);
  const score = 0.6 * cosineScore + 0.4 * overlap;
  const matched = queryEntities.filter((entity) => item.entities.includes(entity));

  return {
    id: item.id,
    type: "article",
    text: item.text,
    score: clampScore(score),
    entities: item.entities,
    matchWeight: overlap,
    reason: matched.length
      ? `Matched ${matched.slice(0, 4).join(", ")} against the analyst slate.`
      : "Matched by slate semantic proximity.",
  };
}

function scorePreviousMessage(item, queryEmbedding, queryEntities, messageIndex) {
  const entities = extractEntities(item.content);
  const embedding = embed(`${item.content} ${entities.join(" ")}`);
  const cosineScore = cosine(queryEmbedding, embedding);
  const overlap = entityOverlap(queryEntities, entities);
  const age = Math.max(1, messageIndex - item.message_index);
  const recency = Math.max(0, 1 - age / 25);
  const score = 0.5 * cosineScore + 0.3 * overlap + 0.2 * recency;
  const matched = queryEntities.filter((entity) => entities.includes(entity));

  return {
    id: `message-${item.id}`,
    type: "message",
    text: item.content,
    score: clampScore(score),
    entities,
    matchWeight: overlap,
    reason: matched.length
      ? `Matched ${matched.slice(0, 4).join(", ")} against prior SQLite chat memory.`
      : "Matched by prior-message semantic proximity and recency.",
  };
}

function scoreCorrelation(item, queryEntities) {
  const entities = [item.word1, item.word2].filter(Boolean);
  const overlap = entityOverlap(queryEntities, entities);
  const score = clampScore(0.7 * item.score_latest + 0.3 * overlap);
  const matched = queryEntities.filter((entity) => entities.includes(entity));

  return {
    id: `memory-${item.id}`,
    type: "correlation",
    text: `Correlation: ${item.word1} + ${item.word2}. ${item.joined_sentence}`,
    score,
    entities,
    matchWeight: overlap,
    reason: matched.length
      ? `Matched ${matched.slice(0, 4).join(", ")} with SQLite ${item.tier} memory.`
      : `Ranked by SQLite ${item.tier} correlation strength and reinforcement.`,
  };
}

function scorePhrase(item, queryEntities) {
  const words = JSON.parse(item.words_json || "[]");
  const overlap = entityOverlap(queryEntities, words);
  const score = clampScore(0.7 * item.score_combined + 0.3 * overlap);
  const matched = queryEntities.filter((entity) => words.includes(entity));

  return {
    id: `memory-${item.id}`,
    type: "correlation",
    text: `Phrase memory: ${words.join(" + ")}.`,
    score,
    entities: words,
    matchWeight: overlap,
    reason: matched.length
      ? `Matched ${matched.slice(0, 4).join(", ")} with a promoted SQLite phrase.`
      : "Ranked by promoted SQLite phrase strength.",
  };
}

function buildResponsePrompt(question, retrievals, correlations) {
  const referenceLines = retrievals.length
    ? retrievals
        .map(
          (item, index) =>
            `${index + 1}. [${item.type.toUpperCase()} ${Math.round(
              item.score * 100,
            )}%] ${item.text}`,
        )
        .join("\n")
    : "No matching articles or prior messages were retrieved.";
  const correlationLines = correlations.length
    ? correlations
        .map(
          (item, index) =>
            `${index + 1}. [CORRELATION ${Math.round(item.score * 100)}%] ${
              item.text
            }`,
        )
        .join("\n")
    : "No SQLite correlations are active yet.";

  return [
    "Reprompt for ARIA:",
    `Answer the user's question with direct reference to the retrieved articles/messages and the SQLite correlated memory. Do not treat a single article as the full answer when other retrieved context is present.`,
    "",
    `User question: ${question || "(empty question)"}`,
    "",
    "Top retrieved articles/messages:",
    referenceLines,
    "",
    "Correlated SQLite memory to reference:",
    correlationLines,
    "",
    "Response intention: synthesize the top references first, then use the correlated memory as supporting context. Keep the answer concise and label any uncertainty.",
  ].join("\n");
}

function buildHumanAnswer(question, retrievals, correlations) {
  const normalized = question.toLowerCase();
  const articleTexts = retrievals
    .filter((item) => item.type === "article")
    .map((item) => item.text);
  const messageTexts = retrievals
    .filter((item) => item.type === "message")
    .map((item) => item.text);
  const correlationTerms = Array.from(
    new Set(
      correlations
        .flatMap((item) => item.entities)
        .filter((entity) => !entity.includes("+") && !["short", "mid", "long"].includes(entity)),
    ),
  ).slice(0, 6);
  const memoryClause = messageTexts.length
    ? ` Your prior context also points at: ${messageTexts[0]}`
    : "";
  const correlationClause = correlationTerms.length
    ? ` The SQLite correlations reinforcing that read are ${correlationTerms.join(", ")}.`
    : "";

  if (normalized.includes("real estate") || normalized.includes("estate")) {
    return cleanAnswer([
      "ARIA reads real estate as a SELL because the slate is pointing to pressure in rates, liquidity, and demand rather than a clean buyer setup.",
      "The strongest supporting context is consumer debt pressure, high APR credit balances, and fewer young buyers able to afford basic essentials.",
      `${memoryClause}${correlationClause}`,
      "So the practical answer is: sell into strength unless the liquidity and demand picture materially improves.",
    ]);
  }

  if (normalized.includes("crude") || normalized.includes("oil")) {
    return cleanAnswer([
      "ARIA reads crude oil as a HOLD because the slate is not showing enough confirmation to press either direction.",
      "The key references are current exposure, demand confirmation, and inventory confirmation.",
      `${memoryClause}${correlationClause}`,
      "So the practical answer is: keep exposure steady and wait for stronger demand or inventory evidence before changing the call.",
    ]);
  }

  if (normalized.includes("silver")) {
    return cleanAnswer([
      "ARIA reads silver as a BUY because the active slate signal is positive, but it still wants disciplined entries.",
      "The top reference is liquidity plus pullback entries, which means the call is not blind chasing.",
      `${memoryClause}${correlationClause}`,
      "So the practical answer is: the buy signal is active, but better entries matter.",
    ]);
  }

  if (articleTexts.length || messageTexts.length) {
    const firstReference = articleTexts[0] || messageTexts[0];
    const secondReference = articleTexts[1] || messageTexts[1];
    return cleanAnswer([
      `ARIA would answer this by starting with the strongest retrieved reference: ${firstReference}`,
      secondReference ? `It would then cross-check that against: ${secondReference}` : "",
      `${memoryClause}${correlationClause}`,
      "The answer should stay tied to those references rather than inventing a broader market call.",
    ]);
  }

  return "ARIA does not have enough matching slate or memory context to answer that cleanly yet. Ask about crude oil, silver, real estate, or build more conversation memory first.";
}

function cleanAnswer(parts) {
  return parts
    .filter((part) => part && part.trim())
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function getStats(sessionId) {
  const db = getDatabase();
  const correlationCount = db
    .prepare(
      `SELECT count(*) AS count
       FROM chat_correlations
       WHERE session_id = ?`,
    )
    .get(sessionId).count;
  const phraseCount = db
    .prepare(
      `SELECT count(*) AS count
       FROM chat_phrases
       WHERE session_id = ?`,
    )
    .get(sessionId).count;

  return {
    database: "sqlite",
    correlations: correlationCount,
    phrases: phraseCount,
  };
}

function calculateInitialScore({ pos1, pos2, wordDistance, messageDistance }) {
  const categoryResult = scoreCategoryRelation(pos1, pos2);
  const sentenceScore = 2.5;
  const temporalScore = scoreTemporal(wordDistance);
  const messageScore = scoreMessageDistance(messageDistance);
  const rawScore = messageScore + categoryResult.score + sentenceScore + temporalScore;

  return {
    score: clampScore(rawScore / 10),
    categoryRel: categoryResult.relation,
  };
}

function scoreMessageDistance(distance) {
  if (distance === null || distance === undefined) {
    return 2.5;
  }
  if (distance === 0) {
    return 2.5;
  }
  if (distance === 1) {
    return 2;
  }
  if (distance <= 3) {
    return 1;
  }
  if (distance <= 6) {
    return 0.5;
  }
  return 0;
}

function scoreCategoryRelation(pos1, pos2) {
  if (pos1 === "noun" && pos2 === "noun") {
    return { score: 2.5, relation: "noun+noun" };
  }
  if (
    (pos1 === "adj" && pos2 === "noun") ||
    (pos1 === "noun" && pos2 === "adj")
  ) {
    return { score: 2, relation: "adj+noun" };
  }
  if (
    (pos1 === "verb" && pos2 === "noun") ||
    (pos1 === "noun" && pos2 === "verb")
  ) {
    return { score: 1.5, relation: "verb+noun" };
  }
  if (pos1 === pos2) {
    return { score: 1, relation: `${pos1}+${pos2}` };
  }
  return { score: 0.5, relation: `${pos1}+${pos2}` };
}

function scoreTemporal(distance) {
  if (distance <= 1) {
    return 2;
  }
  if (distance <= 3) {
    return 1;
  }
  return 0.5;
}

function getTierForScore(score) {
  if (score >= THRESHOLDS.MID_MAX) {
    return "long";
  }
  if (score >= THRESHOLDS.SHORT_MAX) {
    return "mid";
  }
  return "short";
}

function splitSentences(text) {
  return text
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function tokenizeSentence(sentence) {
  return sentence
    .toLowerCase()
    .replace(/[^\w\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter((word) => word.length > 2 && !STOPWORDS.has(word) && !/^\d+$/.test(word))
    .map((word, index) => ({
      word,
      pos: inferPOS(word).toUpperCase(),
      simplePOS: inferPOS(word),
      index,
    }));
}

function inferPOS(word) {
  if (/^\d/.test(word)) {
    return "number";
  }
  if (word.endsWith("ing") || word.endsWith("ed")) {
    return "verb";
  }
  if (
    word.endsWith("ive") ||
    word.endsWith("al") ||
    word.endsWith("ous") ||
    word.endsWith("ic") ||
    ["active", "current", "stronger", "pressured", "basic", "local"].includes(word)
  ) {
    return "adj";
  }
  if (word.endsWith("ly")) {
    return "adv";
  }
  return "noun";
}

function extractEntities(text) {
  const normalized = text.toLowerCase();
  const entities = new Set();

  for (const phrase of ["crude oil", "real estate", ...MARKET_TERMS]) {
    if (normalized.includes(phrase)) {
      phrase.split(" ").forEach((part) => entities.add(part));
    }
  }

  tokenizeSentence(normalized).forEach((token) => entities.add(token.word));
  return Array.from(entities).slice(0, 24);
}

function embed(text) {
  const vector = Array(VECTOR_SIZE).fill(0);
  const terms = extractTerms(text);

  for (const term of terms) {
    vector[hash(term) % VECTOR_SIZE] += 1 / Math.sqrt(term.length);
  }

  return normalize(vector);
}

function extractTerms(text) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));
  const bigrams = [];

  for (let index = 0; index < words.length - 1; index += 1) {
    bigrams.push(`${words[index]}_${words[index + 1]}`);
  }

  return [...words, ...bigrams];
}

function hash(value) {
  let hashValue = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hashValue ^= value.charCodeAt(index);
    hashValue = Math.imul(hashValue, 16777619);
  }
  return Math.abs(hashValue);
}

function normalize(vector) {
  const length = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  return length ? vector.map((value) => value / length) : vector;
}

function cosine(left, right) {
  return left.reduce((sum, value, index) => sum + value * right[index], 0);
}

function entityOverlap(left, right) {
  if (!left.length || !right.length) {
    return 0;
  }

  const rightSet = new Set(right);
  const matches = left.filter((entity) => rightSet.has(entity)).length;
  return matches / Math.max(left.length, right.length);
}

function generatePatternKey(word1, word2) {
  return [word1.toLowerCase(), word2.toLowerCase()].sort().join("_");
}

function clampScore(value) {
  return Math.max(0, Math.min(1, value));
}

function normalizeText(text) {
  return String(text || "").replace(/\s+/g, " ").trim().slice(0, 1200);
}

function normalizeSessionId(sessionId) {
  return String(sessionId || "default")
    .replace(/[^a-zA-Z0-9:_-]/g, "")
    .slice(0, 96);
}

function seedContradictions(db) {
  const contradictions = [
    ["open", "closed", "state"],
    ["active", "inactive", "state"],
    ["running", "stopped", "state"],
    ["true", "false", "boolean"],
    ["yes", "no", "boolean"],
    ["up", "down", "direction"],
    ["rising", "falling", "direction"],
    ["increase", "decrease", "change"],
    ["growing", "shrinking", "change"],
    ["secure", "breached", "safety"],
    ["working", "broken", "condition"],
    ["online", "offline", "connection"],
    ["started", "ended", "timeline"],
  ];

  for (const [patternA, patternB, category] of contradictions) {
    db.prepare(
      `INSERT INTO chat_contradictions
        (id, pattern_a, pattern_b, category, created_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(pattern_a, pattern_b) DO NOTHING`,
    ).run(crypto.randomUUID(), patternA, patternB, category, new Date().toISOString());
  }
}

const schemaSql = `
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  message_index INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_purgatory (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  word TEXT NOT NULL,
  pos TEXT NOT NULL,
  simple_pos TEXT NOT NULL,
  sentence TEXT NOT NULL,
  sentence_index INTEGER NOT NULL,
  message_index INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_correlations (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  pattern_key TEXT NOT NULL,
  word1 TEXT NOT NULL,
  word2 TEXT NOT NULL,
  pos1 TEXT NOT NULL,
  pos2 TEXT NOT NULL,
  category_rel TEXT NOT NULL,
  joined_sentence TEXT,
  score_initial REAL NOT NULL DEFAULT 0,
  score_latest REAL NOT NULL DEFAULT 0,
  reinforcement_count INTEGER NOT NULL DEFAULT 1,
  tier TEXT NOT NULL DEFAULT 'short' CHECK (tier IN ('short', 'mid', 'long')),
  last_seen_message_index INTEGER NOT NULL,
  messages_since_last_decay INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(session_id, pattern_key)
);

CREATE TABLE IF NOT EXISTS chat_phrases (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  phrase_key TEXT NOT NULL,
  words_json TEXT NOT NULL,
  pos_tags_json TEXT NOT NULL,
  source_correlations_json TEXT NOT NULL,
  score_combined REAL NOT NULL DEFAULT 0,
  reinforcement_count INTEGER NOT NULL DEFAULT 1,
  tier TEXT NOT NULL DEFAULT 'short' CHECK (tier IN ('short', 'mid', 'long')),
  last_seen_message_index INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(session_id, phrase_key)
);

CREATE TABLE IF NOT EXISTS chat_decay (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  pattern_key TEXT NOT NULL,
  word1 TEXT NOT NULL,
  word2 TEXT NOT NULL,
  pos1 TEXT,
  pos2 TEXT,
  category_rel TEXT,
  score_final REAL NOT NULL,
  reinforcement_count INTEGER NOT NULL DEFAULT 0,
  decayed_from TEXT NOT NULL,
  decayed_at TEXT NOT NULL,
  messages_in_decay INTEGER NOT NULL DEFAULT 0,
  UNIQUE(session_id, pattern_key)
);

CREATE TABLE IF NOT EXISTS chat_message_counter (
  session_id TEXT PRIMARY KEY,
  current_index INTEGER NOT NULL DEFAULT 0,
  last_updated TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_contradictions (
  id TEXT PRIMARY KEY,
  pattern_a TEXT NOT NULL,
  pattern_b TEXT NOT NULL,
  category TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(pattern_a, pattern_b)
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id, message_index);
CREATE INDEX IF NOT EXISTS idx_chat_purgatory_session_word ON chat_purgatory(session_id, word);
CREATE INDEX IF NOT EXISTS idx_chat_correlations_session_pattern ON chat_correlations(session_id, pattern_key);
CREATE INDEX IF NOT EXISTS idx_chat_correlations_session_tier ON chat_correlations(session_id, tier, score_latest);
CREATE INDEX IF NOT EXISTS idx_chat_correlations_session_words ON chat_correlations(session_id, word1, word2);
CREATE INDEX IF NOT EXISTS idx_chat_phrases_session_key ON chat_phrases(session_id, phrase_key);
CREATE INDEX IF NOT EXISTS idx_chat_phrases_session_tier ON chat_phrases(session_id, tier);
CREATE INDEX IF NOT EXISTS idx_chat_decay_session_pattern ON chat_decay(session_id, pattern_key);
`;
