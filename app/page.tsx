import Link from "next/link";

const commodityCalls = [
  {
    commodity: "OIL",
    action: "HOLD",
    className: "hold",
    thesis: "LACI is holding current oil exposure while waiting for stronger confirmation.",
    horizon: "7-30D",
    confidence: "WATCH",
  },
  {
    commodity: "NAT GAS",
    action: "NULL",
    className: "null",
    thesis: "No active LACI recommendation loaded.",
    horizon: "--",
    confidence: "--",
  },
  {
    commodity: "COPPER",
    action: "NULL",
    className: "null",
    thesis: "No active LACI recommendation loaded.",
    horizon: "--",
    confidence: "--",
  },
  {
    commodity: "GOLD",
    action: "NULL",
    className: "null",
    thesis: "No active LACI recommendation loaded.",
    horizon: "--",
    confidence: "--",
  },
  {
    commodity: "SILVER",
    action: "NULL",
    className: "null",
    thesis: "No active LACI recommendation loaded.",
    horizon: "--",
    confidence: "--",
  },
  {
    commodity: "WHEAT",
    action: "NULL",
    className: "null",
    thesis: "No active LACI recommendation loaded.",
    horizon: "--",
    confidence: "--",
  },
  {
    commodity: "CORN",
    action: "NULL",
    className: "null",
    thesis: "No active LACI recommendation loaded.",
    horizon: "--",
    confidence: "--",
  },
];

const offerTiers = [
  ["$49", "quick signal read"],
  ["$99", "custom 24-hour brief"],
  ["$250", "decision memo"],
];

const audiences = [
  "Energy, logistics, shipping, and supply-chain operators.",
  "Small funds, traders, founders, and operators with exposure.",
  "Teams deciding whether to buy, hedge, delay, or accelerate.",
];

export default function Home() {
  const [primaryCall, ...secondaryCalls] = commodityCalls;

  return (
    <main className="pageShell" id="top">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="The Park Systems home">
          <span className="brandMark">TPS</span>
          <strong>THE PARK SYSTEMS</strong>
        </Link>
        <nav className="navLinks" aria-label="Primary navigation">
          <Link href="#ops">Ops</Link>
          <Link href="#contact">Offer</Link>
          <Link href="#proof">Proof</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </header>

      <section className="heroGrid" id="ops">
        <div className="heroCard">
          <div className="windowDots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <p className="eyebrow">BOUNTY CELL OPERATIONS // LIVE COMMAND</p>
          <h1>
            <span>YOU DON&apos;T</span>
            <span>MANAGE HACKERS.</span>
            <span className="outline">YOU DEPLOY</span>
            <span className="outline">SYSTEMS.</span>
          </h1>
          <p className="tagline">SCOUT. STRIKE. EXTRACT.</p>
          <p className="summary">
            Autonomous teams that hunt 24/7. Recon loops find surface area,
            quant loops rank targets, ops loops retune the cell.
          </p>
          <div className="heroActions">
            <Link className="button primary" href="/contact">
              Deploy Your Squad
            </Link>
            <Link className="button secondary" href="#contact">
              Request Market Brief
            </Link>
          </div>
        </div>

        <aside className="analysisPanel" aria-labelledby="analysis-title">
          <div className="panelHead">
            <div>
              <p className="panelKicker">LACI COMMODITY CALL</p>
              <h2 id="analysis-title">Buy / Sell / Hold</h2>
            </div>
            <span>OIL WATCH</span>
          </div>

          <div className={`primaryCall ${primaryCall.className}`}>
            <div className="callHeader">
              <span>{primaryCall.commodity}</span>
              <strong>{primaryCall.action}</strong>
            </div>
            <p>{primaryCall.thesis}</p>
            <dl>
              <div>
                <dt>HORIZON</dt>
                <dd>{primaryCall.horizon}</dd>
              </div>
              <div>
                <dt>CONFIDENCE</dt>
                <dd>{primaryCall.confidence}</dd>
              </div>
              <div>
                <dt>SOURCE</dt>
                <dd>C:\laci</dd>
              </div>
            </dl>
          </div>

          <div className="callLegend" aria-label="Call color legend">
            <span className="buy">BUY</span>
            <span className="hold">HOLD</span>
            <span className="sell">SELL</span>
          </div>

          <div className="secondaryCalls" aria-label="Secondary commodity calls">
            {secondaryCalls.map((call) => (
              <article className={`callRow ${call.className}`} key={call.commodity}>
                <div>
                  <span>{call.commodity}</span>
                  <p>{call.thesis}</p>
                </div>
                <strong>{call.action}</strong>
              </article>
            ))}
          </div>

          <div className="analysisSubheader">
            <span>REPORT CONTEXT</span>
            <p>
              LACI report queue will replace these calls as commodities are
              reviewed and posted.
            </p>
          </div>

          <dl className="metricGrid compact">
            <div>
              <dt>REFRESH</dt>
              <dd>Manual</dd>
            </div>
            <div>
              <dt>MODE</dt>
              <dd>Analyst reviewed</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="funnelSection" id="contact">
        <div className="funnelCopy">
          <p className="panelKicker">MARKET BRIEF FUNNEL</p>
          <h2>Custom Market Risk Briefs</h2>
          <p>
            Public samples are built in LACI first. Custom 24-hour briefs can
            be generated from the same market/news signal pipeline for a
            specific business, position, or decision window.
          </p>
        </div>
        <div className="funnelCard">
          <div className="funnelPrice">$99 starter brief</div>
          <p>Focused market analysis, prediction, confidence, and action notes.</p>
          <div className="offerTiers">
            {offerTiers.map(([price, label]) => (
              <div key={price}>
                <strong>{price}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <ul className="audienceList">
            {audiences.map((audience) => (
              <li key={audience}>{audience}</li>
            ))}
          </ul>
          <p className="contactInstruction">
            Send your market, exposure, region, and decision window.
          </p>
          <Link className="button primary" href="/contact">
            Request Custom Brief
          </Link>
        </div>
      </section>

      <section className="proofBlock" id="proof">
        <p className="eyebrow">PREDICTION LEDGER</p>
        <h2>Dated reports. Auditable calls. Repeatable outbound.</h2>
        <p>
          The public site is the proof surface. LACI remains the research,
          review, posting, and outreach command center.
        </p>
      </section>
    </main>
  );
}
