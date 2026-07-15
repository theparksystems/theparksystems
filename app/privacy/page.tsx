import Link from "next/link";

export const metadata = {
  title: "Privacy | The Park Systems",
  description: "Privacy details for ARIA analyst picks and PARKS local memory.",
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
          ARIA uses PARKS browser-local memory for chat retrieval. Conversation
          text is stored on your device in browser storage and IndexedDB for the
          current local session. It is not sent to a Park Systems chat server by
          this retrieval layer.
        </p>
        <p>
          The site uses Google Analytics to measure page usage. Google Analytics
          may collect page views, device/browser information, approximate
          location, referral information, and interaction events according to
          Google&apos;s own processing terms.
        </p>
        <p>
          You can clear ARIA conversation memory with the in-app Clear Session
          control or by clearing this site&apos;s browser data.
        </p>
        <p>
          Do not enter sensitive personal, financial, medical, legal, account,
          password, or payment information into ARIA.
        </p>
      </section>
    </main>
  );
}
