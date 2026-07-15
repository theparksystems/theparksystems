const DB_NAME = "parks-memory";
const DB_VERSION = 1;
const STORE_NAME = "memory";
const VECTOR_SIZE = 64;

let db = null;

const stopwords = new Set([
  "about",
  "after",
  "again",
  "also",
  "because",
  "been",
  "before",
  "being",
  "between",
  "could",
  "does",
  "from",
  "have",
  "into",
  "just",
  "more",
  "that",
  "their",
  "them",
  "then",
  "there",
  "this",
  "what",
  "when",
  "where",
  "while",
  "with",
  "would",
  "your",
]);

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
    id: "base-browser-privacy",
    text: "PARKS memory runs in the browser. No prompt is sent to a server by this retrieval layer, and session memory is stored locally in IndexedDB.",
    entities: ["parks", "memory", "browser", "indexeddb", "local"],
  },
].map((item) => ({
  ...item,
  embedding: embed(`${item.text} ${item.entities.join(" ")}`),
  timestamp: Date.now(),
}));

self.onmessage = async (event) => {
  const message = event.data;

  if (message.type === "init") {
    db = await openDatabase();
    self.postMessage({ type: "ready" });
  }

  if (message.type === "ask") {
    db = db || (await openDatabase());
    const answer = await retrieve(message.sessionId, message.text);
    await storeMemory(message.sessionId, message.text);
    self.postMessage({ type: "answer", retrievals: answer });
  }

  if (message.type === "clear") {
    db = db || (await openDatabase());
    await clearMemory(message.sessionId);
    self.postMessage({ type: "cleared" });
  }
};

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const nextDb = request.result;
      if (!nextDb.objectStoreNames.contains(STORE_NAME)) {
        const store = nextDb.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("session_id", "session_id");
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function withStore(mode, callback) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = callback(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function storeMemory(sessionId, text) {
  const entities = extractEntities(text);
  const record = {
    session_id: sessionId,
    text,
    entities,
    embedding: embed(`${text} ${entities.join(" ")}`),
    timestamp: Date.now(),
  };

  await withStore("readwrite", (store) => store.add(record));
}

async function clearMemory(sessionId) {
  const records = await getMemory(sessionId);
  await Promise.all(
    records.map((record) =>
      withStore("readwrite", (store) => store.delete(record.id)),
    ),
  );
}

function getMemory(sessionId) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("session_id");
    const request = index.getAll(sessionId);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function retrieve(sessionId, text) {
  const queryEntities = extractEntities(text);
  const queryEmbedding = embed(`${text} ${queryEntities.join(" ")}`);
  const memory = await getMemory(sessionId);
  const now = Date.now();

  const scoredBase = baseInsights.map((item) =>
    scoreItem(item, queryEmbedding, queryEntities, now, "base"),
  );
  const scoredMemory = memory.map((item) =>
    scoreItem(item, queryEmbedding, queryEntities, now, "memory"),
  );

  return [
    ...scoredBase.sort((a, b) => b.score - a.score).slice(0, 3),
    ...scoredMemory.sort((a, b) => b.score - a.score).slice(0, 3),
  ];
}

function scoreItem(item, queryEmbedding, queryEntities, now, type) {
  const cosineScore = cosine(queryEmbedding, item.embedding);
  const overlap = entityOverlap(queryEntities, item.entities);
  const ageMinutes = Math.max(0, (now - item.timestamp) / 60000);
  const recency = type === "base" ? 0.5 : Math.max(0, 1 - ageMinutes / 1440);
  const score = 0.5 * cosineScore + 0.3 * overlap + 0.2 * recency;
  const matched = queryEntities.filter((entity) => item.entities.includes(entity));

  return {
    id: `${type}-${item.id || item.timestamp}`,
    type,
    text: item.text,
    score: Math.max(0, Math.min(1, score)),
    entities: item.entities,
    reason: matched.length
      ? `Matched ${matched.slice(0, 4).join(", ")} with local ${type} context.`
      : `Matched by semantic proximity and ${type === "memory" ? "recency" : "base slate"} weighting.`,
  };
}

function extractEntities(text) {
  const normalized = text.toLowerCase();
  const entities = new Set();

  [
    "crude oil",
    "oil",
    "silver",
    "real estate",
    "estate",
    "hold",
    "buy",
    "sell",
    "rates",
    "liquidity",
    "debt",
    "apr",
    "inventory",
    "demand",
    "buyers",
    "browser",
    "memory",
  ].forEach((phrase) => {
    if (normalized.includes(phrase)) {
      phrase.split(" ").forEach((part) => entities.add(part));
    }
  });

  normalized
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopwords.has(word))
    .forEach((word) => entities.add(word));

  return Array.from(entities).slice(0, 18);
}

function embed(text) {
  const vector = Array(VECTOR_SIZE).fill(0);
  const terms = extractTerms(text);

  terms.forEach((term) => {
    const index = hash(term) % VECTOR_SIZE;
    vector[index] += 1 / Math.sqrt(term.length);
  });

  return normalize(vector);
}

function extractTerms(text) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopwords.has(word));

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
  if (!length) {
    return vector;
  }
  return vector.map((value) => value / length);
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
