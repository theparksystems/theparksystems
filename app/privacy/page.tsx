import Link from "next/link";

export const metadata = {
  title: "Privacy | The Park Systems",
  description: "Privacy details for ARIA analyst picks and PARKS SQLite memory.",
};

export default function PrivacyPage() {
  return (
    <main className="legalPage">
      <nav className="legalNav" aria-label="Privacy navigation">
        <Link href="/">Back to Slate</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/contact">Contact</Link>
      </nav>

      <section className="legalShell">
        <p className="eyebrow">Privacy</p>
        <h1>Privacy Notice</h1>
        <p>
          ARIA uses PARKS deployment-local SQLite memory for chat retrieval.
          Conversation text and derived correlation records may be stored in the
          local SQLite database for this deployment. Supabase is not used by this
          memory layer.
        </p>
        <p>
          The site uses Google Analytics to measure page usage. Google Analytics
          may collect page views, device/browser information, approximate
          location, referral information, and interaction events according to
          Google&apos;s own processing terms.
        </p>
        <p>
          You can clear ARIA conversation memory with the in-app Clear Session
          control. Your browser may also keep local display history for the chat
          interface until this site&apos;s browser data is cleared.
        </p>
        <p>
          Do not enter sensitive personal, financial, medical, legal, account,
          password, or payment information into ARIA.
        </p>
      </section>
    </main>
  );
}
