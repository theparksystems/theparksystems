"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";

type PickTone = "hold" | "buy" | "sell";

type AnalystPick = {
  id: string;
  market: string;
  call: string;
  tone: PickTone;
  note: string;
  breakdown: string[];
};

type Retrieval = {
  id: string;
  type: "article" | "message" | "correlation";
  text: string;
  score: number;
  entities: string[];
  reason: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "parks";
  text: string;
  answer?: string;
  retrievals?: Retrieval[];
  correlations?: Retrieval[];
  responsePrompt?: string;
};

type MemoryResponse = {
  ok: boolean;
  answer?: string;
  message?: string;
  retrievals?: Retrieval[];
  correlations?: Retrieval[];
  responsePrompt?: string;
  stats?: {
    database: string;
    correlations: number;
    phrases: number;
  };
};

const analystPicks: AnalystPick[] = [
  {
    id: "crude-oil",
    market: "Crude Oil",
    call: "Hold",
    tone: "hold",
    note: "Hold current exposure while waiting for stronger demand and inventory confirmation.",
    breakdown: [
      "Analyst note pending. Current slate view is HOLD while demand and inventory confirmation remain incomplete.",
      "Updated July 15, 2026. This is market commentary, not personalized financial advice.",
    ],
  },
  {
    id: "silver",
    market: "Silver",
    call: "Buy",
    tone: "buy",
    note: "Buy signal active. Watch liquidity and pullback entries.",
    breakdown: [
      "Analyst note pending. Current slate view is BUY while liquidity and pullback entries remain the active watch points.",
      "Updated July 15, 2026. This is market commentary, not personalized financial advice.",
    ],
  },
  {
    id: "real-estate",
    market: "Real Estate",
    call: "Sell",
    tone: "sell",
    note: "Sell into strength while rates, liquidity, and demand remain pressured.",
    breakdown: [
      "In order to predict any market you must first understand the audience and financials contributing to it. The audience is obvious: it is you. Now how much money do you have? Not how much can you pull together in an emergency. How much liquid cash do you have available to you right now?",
      "I am willing to bet it is significantly less than you think.",
      "The current national debt is currently rising 7.5%+ since last year.",
      "The average American's credit debt spiked significantly during COVID and, while it has let up, it has not been repaid. This has triggered a 21% APR.",
      "I could throw more numbers at it, but it does not matter. The question is: all that debt that got lifted and passed to the consumer during COVID is just racking up interest. Bills are not being paid, colleges are avoided, and high-career choices are ignored.",
      "The only question needed to make this decision is: how many people will be purchasing homes in their early 20s when they cannot afford basic essentials?",
    ],
  },
];

const sessionKey = "parks-memory-session-id";
const chatKeyPrefix = "parks-chat-history:";
const autoScrollThreshold = 96;
const defaultMessages: ChatMessage[] = [
  {
    id: "intro",
    role: "parks",
    text: "Ask why a rating is active. ARIA retrieves matching slate evidence and local SQLite PARKS conversation memory.",
  },
];

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getStoredSessionId() {
  if (typeof window === "undefined") {
    return "server";
  }

  try {
    const existing = window.localStorage.getItem(sessionKey);
    if (existing) {
      return existing;
    }

    const next = createId("session");
    window.localStorage.setItem(sessionKey, next);
    return next;
  } catch {
    return createId("session");
  }
}

function parseStoredMessages(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as ChatMessage[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export default function Home() {
  const [view, setView] = useState<"home" | "predictions" | "chat">("home");
  const [selectedId, setSelectedId] = useState(analystPicks[0].id);
  const [sessionId, setSessionId] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("SQLite memory ready");
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(defaultMessages);
  const chatLogRef = useRef<HTMLDivElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const shouldStickToBottomRef = useRef(true);

  const selectedPick =
    analystPicks.find((pick) => pick.id === selectedId) ?? analystPicks[0];

  useEffect(() => {
    const nextSessionId = getStoredSessionId();
    setSessionId(nextSessionId);

    try {
      const storedMessages = parseStoredMessages(
        window.localStorage.getItem(`${chatKeyPrefix}${nextSessionId}`),
      );
      if (storedMessages) {
        setMessages(storedMessages);
      }
    } catch {
      setStatus("Local memory unavailable");
    }

    setStatus("SQLite memory ready");
  }, []);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    try {
      window.localStorage.setItem(
        `${chatKeyPrefix}${sessionId}`,
        JSON.stringify(messages),
      );
    } catch {
      setStatus("Local memory limited");
    }
  }, [messages, sessionId]);

  useEffect(() => {
    if (view !== "chat" || !shouldStickToBottomRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      chatEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 80);

    return () => window.clearTimeout(timeoutId);
  }, [isThinking, messages, view]);

  function updateAutoScrollLock() {
    const log = chatLogRef.current;
    if (!log) {
      return;
    }

    const distanceFromBottom = log.scrollHeight - log.scrollTop - log.clientHeight;
    shouldStickToBottomRef.current = distanceFromBottom < autoScrollThreshold;
  }

  async function callMemory(payload: {
    type: "ask" | "clear" | "stats";
    text?: string;
  }) {
    const response = await fetch("/api/aria-memory", {
      body: JSON.stringify({ ...payload, sessionId }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const data = (await response.json()) as MemoryResponse;

    if (!response.ok || !data.ok) {
      throw new Error(data.message || "ARIA SQLite memory is unavailable.");
    }

    return data;
  }

  async function askParks(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = query.trim();
    if (!text || !sessionId || isThinking) {
      return;
    }

    setView("chat");
    shouldStickToBottomRef.current = true;
    setIsThinking(true);
    setMessages((current) => [
      ...current,
      {
        id: createId("user"),
        role: "user",
        text,
      },
    ]);
    setQuery("");

    try {
      const result = await callMemory({ type: "ask", text });
      setMessages((current) => [
        ...current,
        {
          id: createId("parks"),
          role: "parks",
          text:
            result.answer ||
            "ARIA does not have enough matching context to answer that cleanly yet.",
          answer: result.answer,
          retrievals: result.retrievals || [],
          correlations: result.correlations || [],
          responsePrompt: result.responsePrompt,
        },
      ]);
      setStatus("SQLite memory ready");
    } catch (error) {
      setStatus("SQLite memory limited");
      setMessages((current) => [
        ...current,
        {
          id: createId("parks"),
          role: "parks",
          text:
            error instanceof Error
              ? error.message
              : "ARIA could not access SQLite memory.",
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  }

  async function clearSession() {
    try {
      window.localStorage.removeItem(`${chatKeyPrefix}${sessionId}`);
    } catch {
      setStatus("SQLite memory limited");
    }

    try {
      await callMemory({ type: "clear" });
      setStatus("SQLite memory ready");
    } catch {
      setStatus("SQLite memory limited");
    }

    shouldStickToBottomRef.current = true;
    setMessages([
      {
        id: "intro",
        role: "parks",
        text: "Conversation cleared. Ask ARIA to rebuild SQLite memory from here.",
      },
    ]);
  }

  return (
    <main className="appShell">
      <section
        className={`phoneScreen ${view === "chat" ? "chatScreen" : ""}`}
        aria-labelledby={view === "chat" ? "chat-title" : "page-title"}
      >
        {view === "home" ? (
          <>
            <header className="appHeader">
              <p className="eyebrow">ARIA // PARKS</p>
              <span className="liveBadge">Today</span>
            </header>

            <h1 className="ariaLandingTitle" id="page-title">
              ARIA
            </h1>

            <section className="memoryHero" aria-labelledby="memory-title">
              <div className="botMark" aria-hidden="true">
                <span />
              </div>
              <div className="memoryCopy">
                <h2 id="memory-title">ARIA - A PARKS conversational model</h2>
                <p>
                  Conversational memory writes to deployment-local SQLite. No
                  Supabase is used for chat retrieval. Site analytics may
                  collect page usage.
                </p>
                <span>{status}</span>
              </div>
              <form className="memoryForm" onSubmit={askParks}>
                <label className="srOnly" htmlFor="parks-query">
                  Talk to ARIA
                </label>
                <textarea
                  id="parks-query"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Ask why crude is a HOLD..."
                  rows={3}
                  value={query}
                />
                <button className="talkButton" disabled={isThinking} type="submit">
                  {isThinking ? "Searching" : "Talk to ARIA"} <span>&gt;</span>
                </button>
              </form>
            </section>

            <button
              className="quantLink"
              onClick={() => setView("predictions")}
              type="button"
            >
              <span>PARKS Quant predictions</span>
              <strong>Buy / Sell / Hold</strong>
            </button>

            <section className="disclosurePanel" aria-label="Important disclosures">
              <p>
                Market commentary only. This is not investment, legal, tax, or
                financial advice and is not an offer to buy or sell securities,
                commodities, real estate, or any financial product.
              </p>
              <p>
                ARIA chat retrieval stores local SQLite correlations for this
                deployment. Google Analytics is used for site usage measurement.
              </p>
            </section>

            <footer className="appFooter">
              <span>The Park Systems</span>
              <nav aria-label="Legal links">
                <Link href="/privacy">Privacy</Link>
                <Link href="/terms">Terms</Link>
                <Link href="/contact">Contact</Link>
              </nav>
            </footer>
          </>
        ) : view === "predictions" ? (
          <>
            <header className="chatNav">
              <button onClick={() => setView("home")} type="button">
                &lt; Main
              </button>
              <div>
                <p className="eyebrow">PARKS Quant</p>
                <h1 id="page-title">PARKS Quant predictions</h1>
              </div>
            </header>

            <h2 className="predictionsTitle">Buy / Sell / Hold</h2>

            <div className="pickStack" aria-label="Current analyst picks">
              {analystPicks.map((pick) => (
                <button
                  aria-pressed={selectedPick.id === pick.id}
                  className={`pickCard ${pick.tone} ${
                    selectedPick.id === pick.id ? "selected" : ""
                  }`}
                  key={pick.market}
                  onClick={() => setSelectedId(pick.id)}
                  type="button"
                >
                  <div>
                    <h2>{pick.market}</h2>
                    <p>{pick.note}</p>
                  </div>
                  <strong>{pick.call}</strong>
                </button>
              ))}
            </div>

            <div className="panelTabs" role="tablist" aria-label="PARKS panels">
              <button aria-selected="true" role="tab" type="button">
                Analysis Breakdown
              </button>
            </div>

            <section
              className={`analysisBreakdown ${selectedPick.tone}`}
              aria-live="polite"
              aria-labelledby="analysis-title"
            >
              <div className="breakdownHeader">
                <div>
                  <p className="eyebrow">Analysis Breakdown</p>
                  <h2 id="analysis-title">{selectedPick.market}</h2>
                </div>
                <strong>{selectedPick.call}</strong>
              </div>
              <div className="breakdownBody">
                {selectedPick.breakdown.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>

            <section className="disclosurePanel" aria-label="Important disclosures">
              <p>
                Market commentary only. This is not investment, legal, tax, or
                financial advice and is not an offer to buy or sell securities,
                commodities, real estate, or any financial product.
              </p>
              <p>
                ARIA chat retrieval stores local SQLite correlations for this
                deployment. Google Analytics is used for site usage measurement.
              </p>
            </section>

            <footer className="appFooter">
              <span>The Park Systems</span>
              <nav aria-label="Legal links">
                <Link href="/privacy">Privacy</Link>
                <Link href="/terms">Terms</Link>
                <Link href="/contact">Contact</Link>
              </nav>
            </footer>
          </>
        ) : (
          <section className="oneChatView" aria-labelledby="chat-title">
            <header className="chatNav">
              <button onClick={() => setView("home")} type="button">
                &lt; Main
              </button>
              <div>
                <p className="eyebrow">ARIA</p>
                <h1 id="chat-title">ARIA - PARKS conversational model</h1>
              </div>
            </header>

            <section className="chatPanel oneChatPanel" aria-live="polite">
              <div className="chatHead">
                <span>1v1 SQLite Chat</span>
                <button onClick={clearSession} type="button">
                  Clear Session
                </button>
              </div>
              <div
                className="chatLog oneChatLog"
                onScroll={updateAutoScrollLock}
                ref={chatLogRef}
              >
                {messages.map((message) => (
                  <article className={`chatMessage ${message.role}`} key={message.id}>
                    <p>{message.text}</p>
                    {message.retrievals?.length ? (
                      <div className="retrievalList">
                        <span className="retrievalLabel">Top References</span>
                        {message.retrievals.map((retrieval) => (
                          <div className="retrievalCard" key={retrieval.id}>
                            <div>
                              <span>{retrieval.type}</span>
                              <strong>{Math.round(retrieval.score * 100)}%</strong>
                            </div>
                            <p>{retrieval.text}</p>
                            <small>{retrieval.reason}</small>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {message.correlations?.length ? (
                      <div className="retrievalList">
                        <span className="retrievalLabel">Correlated Memory</span>
                        {message.correlations.map((retrieval) => (
                          <div className="retrievalCard correlation" key={retrieval.id}>
                            <div>
                              <span>{retrieval.type}</span>
                              <strong>{Math.round(retrieval.score * 100)}%</strong>
                            </div>
                            <p>{retrieval.text}</p>
                            <small>{retrieval.reason}</small>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {message.responsePrompt ? (
                      <details className="responsePromptBox">
                        <summary>Response prompt</summary>
                        <pre className="responsePrompt">{message.responsePrompt}</pre>
                      </details>
                    ) : null}
                  </article>
                ))}
                {isThinking ? (
                  <article className="chatMessage parks">
                    <p>ARIA is searching local SQLite PARKS memory...</p>
                  </article>
                ) : null}
                <div className="chatEnd" ref={chatEndRef} />
              </div>
            </section>

            <form className="chatComposer" onSubmit={askParks}>
              <label className="srOnly" htmlFor="aria-query">
                Message ARIA
              </label>
              <textarea
                id="aria-query"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ask ARIA about the slate..."
                rows={2}
                value={query}
              />
              <button disabled={isThinking} type="submit">
                Send
              </button>
            </form>
          </section>
        )}
      </section>
    </main>
  );
}
