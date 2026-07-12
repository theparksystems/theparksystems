import Link from "next/link";
import { divisions, operatingNotes, posts, signalTags } from "./content";

export default function Home() {
  const featured = posts[0];

  return (
    <main>
      <section className="hero" id="top">
        <nav className="topbar" aria-label="Primary navigation">
          <Link className="brand" href="#top" aria-label="PARKSystems home">
            <span>P</span>
            <strong>PARKSystems</strong>
          </Link>
          <div className="navlinks">
            <Link href="#laci">LACI</Link>
            <Link href="#updates">Updates</Link>
            <Link href="#network">Network</Link>
            <Link href="mailto:principal@parksystemscorporation.com">Contact</Link>
          </div>
        </nav>

        <div className="heroGrid">
          <div className="heroCopy">
            <p className="kicker">PSC-002 // BUILD 2026.07 // PUBLIC SIGNAL</p>
            <h1>PARKSystems Corporation</h1>
            <p className="lede">
              Sovereign systems for complex orchestration. Local-first
              intelligence, operational memory, and public field notes from the
              stack.
            </p>
            <div className="actions">
              <Link className="button primary" href="#updates">
                Read the feed
              </Link>
              <Link className="button secondary" href="#laci">
                View the stack
              </Link>
            </div>
          </div>

          <aside className="statusPanel" aria-label="System status">
            <div className="panelHeader">
              <span>PUBLIC NODE</span>
              <strong>ONLINE</strong>
            </div>
            <dl className="metrics">
              <div>
                <dt>Post mode</dt>
                <dd>Manual</dd>
              </div>
              <div>
                <dt>Source</dt>
                <dd>C:\laci</dd>
              </div>
              <div>
                <dt>Stack</dt>
                <dd>Static</dd>
              </div>
              <div>
                <dt>Deploy</dt>
                <dd>Railway</dd>
              </div>
            </dl>
            <div className="signalStrip" aria-label="Covered signal types">
              {signalTags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="section intro" id="laci">
        <div>
          <p className="kicker">LACI // LOCAL AUTONOMOUS CONTEXT INTERFACE</p>
          <h2>The private system writes. The public site publishes.</h2>
        </div>
        <p>
          LACI remains an internal operating surface. This site is the public
          edge: selected analysis, build notes, research drops, and corporate
          signals pasted in when they are ready to leave the private workspace.
        </p>
      </section>

      <section className="section feed" id="updates">
        <div className="sectionHeader">
          <div>
            <p className="kicker">PUBLIC FEED</p>
            <h2>Latest transmissions</h2>
          </div>
          <Link className="textLink" href={`/analysis/${featured.slug}`}>
            Featured note
          </Link>
        </div>

        <div className="postGrid">
          {posts.map((post) => (
            <article className="postCard" key={post.slug}>
              <div className="postMeta">
                <span>{post.date}</span>
                <span>{post.domain}</span>
              </div>
              <h3>{post.title}</h3>
              <p>{post.summary}</p>
              <Link href={`/analysis/${post.slug}`}>Read note</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section network" id="network">
        <div className="sectionHeader">
          <div>
            <p className="kicker">OPERATING NETWORK</p>
            <h2>Divisions in public view</h2>
          </div>
        </div>

        <div className="divisionGrid">
          {divisions.map((division) => (
            <article className="divisionCard" key={division.name}>
              <span>{division.code}</span>
              <h3>{division.name}</h3>
              <p>{division.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section notes">
        <div>
          <p className="kicker">PUBLICATION RULES</p>
          <h2>Quiet infrastructure. Clear output.</h2>
        </div>
        <div className="noteList">
          {operatingNotes.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </div>
      </section>

      <footer>
        <span>PARKSystems Corporation</span>
        <span>Built for Information Sovereignty</span>
        <Link href="https://parksystemscorporation.com">Original site</Link>
      </footer>
    </main>
  );
}
