import Link from "next/link";
import type { CSSProperties } from "react";

const valueProps = [
  {
    callsign: "R-01",
    title: "Autonomous Recon",
    description: "Crawls, enriches, and routes fresh attack surface.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 12h5l2-7 4 14 2-7h5" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  {
    callsign: "Q-02",
    title: "Tick-Based Execution",
    description: "Priority queue > human triage. Every 100ms.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        <path d="M7.8 7.8 5 5M16.2 16.2 19 19M16.2 7.8 19 5M7.8 16.2 5 19" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    callsign: "O-03",
    title: "Commander Override",
    description: "Humans set thresholds. Agents execute the loop.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 5h16v10H7l-3 3V5Z" />
        <path d="M8 9h8M8 12h5" />
      </svg>
    ),
  },
];

const loopColumns = [
  {
    title: "SCOUT",
    nodes: ["SCAN", "CRAWL", "ENRICH", "INTAKE"],
  },
  {
    title: "STRIKE",
    nodes: ["QUEUE", "ANALYZE", "PRIORITIZE", "REPORT"],
  },
  {
    title: "EXTRACT",
    nodes: ["AUDIT", "TUNE", "ALERT", "REDEPLOY"],
  },
];

const proofLogos = ["HackerOne", "Bugcrowd", "Intigriti"];

export default function Home() {
  return (
    <main className="opsShell">
      <header className="siteHeader">
        <Link className="brandMark" href="/" aria-label="The Park Systems home">
          <span>TPS</span>
          <strong>The Park Systems</strong>
        </Link>
        <nav className="siteNav" aria-label="Primary navigation">
          <Link href="#ops">Ops</Link>
          <Link href="#demo">Demo</Link>
          <Link href="#proof">Proof</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </header>

      <section className="terminalHero" id="top">
        <div className="heroTerminal">
          <div className="terminalBar" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <p className="eyebrow">BOUNTY CELL OPERATIONS // LIVE COMMAND</p>
          <h1>
            You don&apos;t manage hackers.
            <span>You deploy systems.</span>
          </h1>
          <p className="typeLine" aria-label="Scout. Strike. Extract.">
            <span>SCOUT. STRIKE. EXTRACT.</span>
          </p>
          <p className="heroCopy">
            Autonomous teams that hunt 24/7. Recon loops find surface area,
            quant loops rank targets, ops loops retune the cell.
          </p>
          <div className="heroActions">
            <Link className="commandButton" href="/contact">
              Deploy Your Squad
            </Link>
            <Link className="ghostButton" href="#demo">
              Watch the loop
            </Link>
          </div>
        </div>

        <aside className="missionPanel" aria-label="Mission telemetry">
          <div className="panelRow">
            <span>STATUS</span>
            <strong>ARMED</strong>
          </div>
          <div className="panelRow">
            <span>CADENCE</span>
            <strong>100MS</strong>
          </div>
          <div className="panelRow">
            <span>MODE</span>
            <strong>AUTONOMOUS</strong>
          </div>
          <div className="panelFeed">
            <p>&gt; scout_intake hydrated</p>
            <p>&gt; priority queue recalculated</p>
            <p>&gt; config thresholds adjusted</p>
          </div>
        </aside>
      </section>

      <section className="sectionBlock" id="ops">
        <div className="sectionLabel">
          <span>01</span>
          <p>Operating model</p>
        </div>
        <div className="valueGrid">
          {valueProps.map((item) => (
            <article className="valueCard" key={item.title}>
              <div className="callSign">
                {item.icon}
                <span>{item.callsign}</span>
              </div>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sectionBlock demoBlock" id="demo">
        <div className="sectionLabel">
          <span>02</span>
          <p>Live demo</p>
        </div>
        <div className="demoFrame" aria-label="Animated autonomy loops">
          <div className="scanLine" />
          <div className="loopColumns">
            {loopColumns.map((column) => (
              <div className="loopColumn" key={column.title}>
                <h2>{column.title}</h2>
                {column.nodes.map((node, index) => (
                  <div
                    className="loopNode"
                    key={node}
                    style={{ "--node-index": index } as CSSProperties}
                  >
                    [ {node} ]
                  </div>
                ))}
              </div>
            ))}
          </div>
          <p className="demoCaption">Actual production traffic.</p>
        </div>
      </section>

      <section className="proofBlock" id="proof">
        <div>
          <p className="eyebrow">EXTRACTION LEDGER</p>
          <h2>$2.3M+ bounties extracted</h2>
        </div>
        <div className="logoRail" aria-label="Bug bounty platform logos">
          {proofLogos.map((logo) => (
            <span key={logo}>{logo}</span>
          ))}
        </div>
      </section>

      <section className="ctaBlock">
        <p className="eyebrow">COMMANDER ACCESS</p>
        <h2>Deploy Your Squad</h2>
        <p>Results feed back. The loop gets smarter.</p>
        <Link className="commandButton" href="/contact">
          Deploy Your Squad
        </Link>
      </section>

      <footer className="opsFooter">
        <span>The Park Systems</span>
        <Link href="/contact">Contact</Link>
        <span className="statusPing">STATUS: LIVE</span>
      </footer>
    </main>
  );
}
