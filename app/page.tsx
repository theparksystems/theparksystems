const analystPicks = [
  {
    market: "Crude Oil",
    call: "Hold",
    tone: "hold",
    note: "Wait for a cleaner demand and inventory signal before adding exposure.",
  },
  {
    market: "Silver",
    call: "Buy",
    tone: "buy",
    note: "Active upside pick with priority on disciplined entries.",
  },
  {
    market: "Real Estate",
    call: "Sell",
    tone: "sell",
    note: "Reduce exposure while rates, liquidity, and demand remain pressured.",
  },
];

export default function Home() {
  return (
    <main className="appShell">
      <section className="phoneScreen" aria-labelledby="page-title">
        <header className="appHeader">
          <div>
            <p className="eyebrow">The Park Systems</p>
            <h1 id="page-title">Analyst Picks</h1>
          </div>
          <span className="liveBadge">Today</span>
        </header>

        <div className="pickStack" aria-label="Current analyst picks">
          {analystPicks.map((pick) => (
            <article className={`pickCard ${pick.tone}`} key={pick.market}>
              <div>
                <h2>{pick.market}</h2>
                <p>{pick.note}</p>
              </div>
              <strong>{pick.call}</strong>
            </article>
          ))}
        </div>

        <footer className="appFooter">
          <span>Manual analyst slate</span>
          <span>Installable mobile view</span>
        </footer>
      </section>
    </main>
  );
}
