import Link from "next/link";

const loops = [
  {
    id: "LACI_RECON LOOP",
    label: "Recon",
    state: "ACTIVE",
    cadence: "100ms",
    stages: ["IDLE", "CRAWLING", "ENRICHING", "PUBLISHING", "IDLE"],
    output: "EVENT STREAM -> SCOUT_INTAKE",
  },
  {
    id: "LACI_QUANT LOOP",
    label: "Quant",
    state: "ACTIVE",
    cadence: "100ms",
    stages: ["QUEUE", "IDLE", "ANALYZING", "REPRIORITIZING", "REPORTING"],
    output: "METRIC CONSUMPTION -> PRIORITY RECALL -> QUEUE UPDATE",
  },
  {
    id: "LACI_OPS LOOP",
    label: "Ops",
    state: "ACTIVE",
    cadence: "100ms",
    stages: ["IDLE", "AUDITING", "TUNING", "ALERTING", "CONFIG_CHANGES"],
    output: "RULE UPDATES -> THRESHOLD ADJUST -> ALERT DISPATCH",
  },
];

export default function Home() {
  return (
    <main>
      <section className="hero" id="top">
        <nav className="topbar" aria-label="Primary navigation">
          <Link className="brand" href="#top" aria-label="PARKSystems home">
            <span>P</span>
            <strong>PARKSystems Corporation</strong>
          </Link>
          <div className="navlinks">
            <Link href="#model">COO Loop</Link>
            <Link href="#about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </nav>

        <div className="heroGrid">
          <div className="heroCopy">
            <p className="kicker">GLOBAL INTELLIGENCE AGENCY</p>
            <h1>AI-operated intelligence command loop.</h1>
            <p className="lede">
              PARKSystems Corporation replaces core operating employees with an
              AI COO agent loop for recon, quant, and operations control.
            </p>
            <div className="actions">
              <Link className="button primary" href="#model">
                View operating loop
              </Link>
              <Link className="button secondary" href="/contact">
                Contact
              </Link>
            </div>
          </div>

          <aside className="statusPanel" aria-label="Company details">
            <div className="panelHeader">
              <span>COO LOOP</span>
              <strong>ACTIVE</strong>
            </div>
            <dl className="metrics">
              <div>
                <dt>Entity</dt>
                <dd>PARKSystems Corporation</dd>
              </div>
              <div>
                <dt>Descriptor</dt>
                <dd>Global Intelligence Agency</dd>
              </div>
              <div>
                <dt>Operating Core</dt>
                <dd>AI Agents</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section className="section loopSection" id="model">
        <div className="sectionHeader">
          <div>
            <p className="kicker">CURRENT COMPANY COO AGENT LOOP</p>
            <h2>LACI research and quant loops</h2>
          </div>
          <span className="schemaTag">SCHEMATIC v1.0</span>
        </div>

        <div className="loopGrid" aria-label="AI COO operating loops">
          {loops.map((loop) => (
            <article className="loopCard" key={loop.id}>
              <div className="loopCardHeader">
                <p>[ {loop.id} ]</p>
                <span>
                  TICK • {loop.cadence} • STATE: {loop.state}
                </span>
              </div>

              <div className="stateFlow">
                {loop.stages.map((stage) => (
                  <div className="stateNode" key={`${loop.id}-${stage}`}>
                    [ {stage} ]
                  </div>
                ))}
              </div>

              <p className="loopOutput">OUTPUT: {loop.output}</p>
            </article>
          ))}
        </div>

        <div className="legend">
          <span>[ ] = STATE</span>
          <span>{"->"} = DATA FLOW</span>
          <span>TICK = 100ms LOOP CYCLE</span>
          <span>COORDINATED VIA SCOUT_INTAKE / QUEUE / CONFIG</span>
        </div>
      </section>

      <section className="section intro" id="about">
        <div>
          <p className="kicker">ABOUT US</p>
          <h2>PARKSystems Corporation</h2>
        </div>
        <p>Global Intelligence Agency.</p>
      </section>

      <footer>
        <span>PARKSystems Corporation</span>
        <Link href="/contact">Contact</Link>
      </footer>
    </main>
  );
}
