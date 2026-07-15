"use client";

import { useState } from "react";

const analystPicks = [
  {
    id: "crude-oil",
    market: "Crude Oil",
    call: "Hold",
    tone: "hold",
    note: "Hold current exposure while waiting for stronger demand and inventory confirmation.",
    breakdown: ["Pending"],
  },
  {
    id: "silver",
    market: "Silver",
    call: "Buy",
    tone: "buy",
    note: "Buy signal active. Watch liquidity and pullback entries.",
    breakdown: ["Pending"],
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

export default function Home() {
  const [selectedId, setSelectedId] = useState(analystPicks[0].id);
  const selectedPick =
    analystPicks.find((pick) => pick.id === selectedId) ?? analystPicks[0];

  return (
    <main className="appShell">
      <section className="phoneScreen" aria-labelledby="page-title">
        <header className="appHeader">
          <div>
            <p className="eyebrow">LACI Analyst Picks</p>
            <h1 id="page-title">Buy / Sell / Hold</h1>
          </div>
          <span className="liveBadge">Today</span>
        </header>

        <div className="pickStack" aria-label="Current analyst picks">
          {analystPicks.map((pick) => (
            <button
              aria-expanded={selectedPick.id === pick.id}
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

        <footer className="appFooter">
          <span>The Park Systems</span>
          <span>Manual Slate</span>
        </footer>
      </section>
    </main>
  );
}
