import Link from "next/link";

const contactEmail = "theparksystems22@gmail.com";

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
            <Link href="#about">About</Link>
            <Link href="#services">What We Do</Link>
            <Link href="#contact">Contact</Link>
          </div>
        </nav>

        <div className="heroGrid">
          <div className="heroCopy">
            <p className="kicker">PARKSYSTEMS CORPORATION</p>
            <h1>PARKSystems Corporation</h1>
            <p className="lede">Global Intelligence Agency.</p>
            <div className="actions">
              <Link className="button primary" href={`mailto:${contactEmail}`}>
                Contact: {contactEmail}
              </Link>
            </div>
          </div>

          <aside className="statusPanel" aria-label="Company details">
            <div className="panelHeader">
              <span>LEGAL NAME</span>
              <strong>ACTIVE</strong>
            </div>
            <dl className="metrics">
              <div>
                <dt>Entity</dt>
                <dd>PARKSystems Corporation</dd>
              </div>
              <div>
                <dt>Description</dt>
                <dd>Global Intelligence Agency</dd>
              </div>
              <div>
                <dt>Contact</dt>
                <dd>{contactEmail}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section className="section intro" id="about">
        <div>
          <p className="kicker">ABOUT US</p>
          <h2>PARKSystems Corporation</h2>
        </div>
        <p>Global Intelligence Agency.</p>
      </section>

      <section className="section intro" id="services">
        <div>
          <p className="kicker">WHAT WE DO</p>
          <h2>Global Intelligence Agency</h2>
        </div>
        <p>PARKSystems Corporation operates as a Global Intelligence Agency.</p>
      </section>

      <section className="section intro" id="contact">
        <div>
          <p className="kicker">CONTACT</p>
          <h2>Contact PARKSystems Corporation</h2>
        </div>
        <p>
          <Link className="textLink contactLink" href={`mailto:${contactEmail}`}>
            Contact: {contactEmail}
          </Link>
        </p>
      </section>

      <footer>
        <span>PARKSystems Corporation</span>
        <Link href={`mailto:${contactEmail}`}>Contact: {contactEmail}</Link>
      </footer>
    </main>
  );
}
