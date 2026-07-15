import Link from "next/link";

const contactEmail = "theparksystems22@gmail.com";

export const metadata = {
  title: "Contact | The Park Systems",
  description: "Contact The Park Systems about ARIA analyst picks.",
};

export default function ContactPage() {
  return (
    <main className="contactPage">
      <nav className="siteHeader" aria-label="Contact navigation">
        <Link className="brandMark" href="/">
          <span>P</span>
          <strong>The Park Systems</strong>
        </Link>
        <div className="siteNav">
          <Link href="/">Slate</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </nav>

      <section className="section contactShell">
        <div>
          <p className="kicker">CONTACT</p>
          <h1>Contact The Park Systems</h1>
          <p className="lede">
            ARIA analyst picks, PARKS browser-local memory, and public site
            inquiries.
          </p>
        </div>

        <aside className="statusPanel contactPanel" aria-label="Contact details">
          <div className="panelHeader">
            <span>CONTACT METHOD</span>
            <strong>EMAIL</strong>
          </div>
          <Link className="button primary contactButton" href={`mailto:${contactEmail}`}>
            Contact: {contactEmail}
          </Link>
        </aside>
      </section>
    </main>
  );
}
