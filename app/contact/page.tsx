import Link from "next/link";

const contactEmail = "theparksystems22@gmail.com";

export const metadata = {
  title: "Contact | PARKSystems Corporation",
  description: "Contact PARKSystems Corporation.",
};

export default function ContactPage() {
  return (
    <main className="contactPage">
      <nav className="topbar" aria-label="Contact navigation">
        <Link className="brand" href="/">
          <span>P</span>
          <strong>PARKSystems Corporation</strong>
        </Link>
        <div className="navlinks">
          <Link href="/">Landing</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </nav>

      <section className="section contactShell">
        <div>
          <p className="kicker">CONTACT</p>
          <h1>Contact PARKSystems Corporation</h1>
          <p className="lede">Global Intelligence Agency.</p>
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
