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
  type: "base" | "memory";
  text: string;
  score: number;
  entities: string[];
  reason: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "parks";
  text: string;
  retrievals?: Retrieval[];
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
const defaultMessages: ChatMessage[] = [
  {
    id: "intro",
    role: "parks",
    text: "Ask why a rating is active. ARIA retrieves matching slate evidence and your local PARKS conversation memory.",
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
  const [view, setView] = useState<"slate" | "chat">("slate");
  const [selectedId, setSelectedId] = useState(analystPicks[0].id);
  const [sessionId, setSessionId] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Starting local memory");
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(defaultMessages);
  const workerRef = useRef<Worker | null>(null);

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

    const worker = new Worker("/parks-memory-worker.js");
    workerRef.current = worker;

    worker.onerror = () => {
      setIsThinking(false);
      setStatus("Local memory unavailable");
      setMessages((current) => [
        ...current,
        {
          id: createId("parks"),
          role: "parks",
          text: "ARIA could not start local memory in this browser. You can still read the analyst slate and breakdowns.",
        },
      ]);
    };

    worker.onmessage = (event: MessageEvent) => {
      const message = event.data;

      if (message.type === "ready") {
        setStatus("Local memory ready");
      }

      if (message.type === "answer") {
        setIsThinking(false);
        setMessages((current) => [
          ...current,
          {
            id: createId("parks"),
            role: "parks",
            text: "ARIA found the strongest local context for this question.",
            retrievals: message.retrievals,
          },
        ]);
      }

      if (message.type === "cleared") {
        setMessages([
          {
            id: "intro",
            role: "parks",
            text: "Conversation cleared. Ask ARIA to rebuild memory from here.",
          },
        ]);
      }

      if (message.type === "error") {
        setIsThinking(false);
        setStatus("Local memory limited");
        setMessages((current) => [
          ...current,
          {
            id: createId("parks"),
            role: "parks",
            text: message.message || "ARIA could not access local memory in this browser.",
          },
        ]);
      }
    };

    worker.postMessage({ type: "init", sessionId: nextSessionId });

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
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

  function askParks(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = query.trim();
    if (!text || !workerRef.current || isThinking) {
      return;
    }

    setView("chat");
    setIsThinking(true);
    setMessages((current) => [
      ...current,
      {
        id: createId("user"),
        role: "user",
        text,
      },
    ]);
    workerRef.current.postMessage({ type: "ask", sessionId, text });
    setQuery("");
  }

  function clearSession() {
    try {
      window.localStorage.removeItem(`${chatKeyPrefix}${sessionId}`);
    } catch {
      setStatus("Local memory limited");
    }
    workerRef.current?.postMessage({ type: "clear", sessionId });
  }

  return (
    <main className="appShell">
      <section className="phoneScreen" aria-labelledby="page-title">
        {view === "slate" ? (
          <>
            <header className="appHeader">
              <p className="eyebrow">PARKS Model // LACI</p>
              <span className="liveBadge">Today</span>
            </header>

            <h1 id="page-title">Buy / Sell / Hold</h1>

            <section className="memoryHero" aria-labelledby="memory-title">
              <div className="botMark" aria-hidden="true">
                <span />
              </div>
              <div className="memoryCopy">
                <h2 id="memory-title">PARKS</h2>
                <p>
                  Conversational memory stays in your browser. No API is used
                  for chat retrieval. Site analytics may collect page usage.
                </p>
                <span>{status}</span>
              </div>
              <form className="memoryForm" onSubmit={askParks}>
                <label className="srOnly" htmlFor="parks-query">
                  Talk to PARKS
                </label>
                <textarea
                  id="parks-query"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Ask why crude is a HOLD..."
                  rows={3}
                  value={query}
                />
                <button className="talkButton" disabled={isThinking} type="submit">
                  {isThinking ? "Searching" : "Talk to PARKS"} <span>&gt;</span>
                </button>
              </form>
            </section>

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
                ARIA chat retrieval stores conversation memory in this browser.
                Google Analytics is used for site usage measurement.
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
              <button onClick={() => setView("slate")} type="button">
                &lt; Main
              </button>
              <div>
                <p className="eyebrow">ARIA</p>
                <h1 id="chat-title">ARIA - PARKS conversational model</h1>
              </div>
            </header>

            <section className="chatPanel oneChatPanel" aria-live="polite">
              <div className="chatHead">
                <span>1v1 Local Chat</span>
                <button onClick={clearSession} type="button">
                  Clear Session
                </button>
              </div>
              <div className="chatLog oneChatLog">
                {messages.map((message) => (
                  <article className={`chatMessage ${message.role}`} key={message.id}>
                    <p>{message.text}</p>
                    {message.retrievals ? (
                      <div className="retrievalList">
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
                  </article>
                ))}
                {isThinking ? (
                  <article className="chatMessage parks">
                    <p>ARIA is searching local PARKS memory...</p>
                  </article>
                ) : null}
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
