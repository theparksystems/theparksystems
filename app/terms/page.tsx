import Link from "next/link";

export const metadata = {
  title: "Terms | The Park Systems",
  description: "Terms and risk disclosures for ARIA analyst picks.",
};

export default function TermsPage() {
  return (
    <main className="legalPage">
      <nav className="legalNav" aria-label="Terms navigation">
        <Link href="/">Back to Slate</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/contact">Contact</Link>
      </nav>

      <section className="legalShell">
        <p className="eyebrow">Terms</p>
        <h1>Terms and Disclosures</h1>
        <p>
          The Park Systems publishes ARIA analyst picks as market commentary and
          educational information only. Nothing on this site is personalized
          investment, financial, legal, tax, accounting, or real-estate advice.
        </p>
        <p>
          BUY, SELL, and HOLD labels are not instructions, recommendations, or
          offers to buy or sell securities, commodities, real estate, derivatives,
          or any other financial product.
        </p>
        <p>
          Markets involve risk, including loss of principal. You are responsible
          for your own decisions and should consult qualified professionals
          before acting on financial, legal, tax, or investment matters.
        </p>
        <p>
          ARIA is a retrieval interface backed by local slate context and
          deployment-local SQLite conversation memory. It does not generate
          guaranteed, complete, or current market advice.
        </p>
      </section>
    </main>
  );
}
