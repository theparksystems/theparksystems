import Link from "next/link";

const marketFeed = [
  ["Sector focus", "Energy, shipping, supply-chain risk"],
  ["Signal strength", "Updated from LACI market reports"],
  ["Opportunity band", "Custom brief available"],
];

const predictionFeed = [
  ["Likely move", "Latest prediction posts here"],
  ["Risk trigger", "Needs report input"],
  ["Next action", "Hold for LACI export"],
];

const reportFeed = [
  ["Latest report", "Generated from LACI Market Analyst"],
  ["Market brief", "Posted from reviewed LACI output"],
  ["Prediction memo", "Archived with source notes"],
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

function FeedList({
  items,
  label,
}: {
  items: string[][];
  label: string;
}) {
  return (
    <ul className="analysisFeed" aria-label={label}>
      {items.map(([key, value]) => (
        <li key={key}>
          <span>{key}</span>
          <strong>{value}</strong>
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
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
              <p className="panelKicker">LIVE ANALYSIS TAB</p>
              <h2 id="analysis-title">Market Analysis</h2>
            </div>
            <span>READY</span>
          </div>

          <div className="tabList" aria-label="Analysis views">
            <span>MARKET</span>
            <span>PREDICT</span>
            <span>REPORTS</span>
          </div>

          <dl className="metricGrid">
            <div>
              <dt>SOURCE</dt>
              <dd>C:\laci reports</dd>
            </div>
            <div>
              <dt>REFRESH</dt>
              <dd>Manual</dd>
            </div>
          </dl>

          <FeedList items={marketFeed} label="Market analysis" />
          <FeedList items={predictionFeed} label="Predictions" />
          <FeedList items={reportFeed} label="Reports" />
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
