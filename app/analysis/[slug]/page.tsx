import Link from "next/link";
import { notFound } from "next/navigation";
import { posts } from "../../content";

type AnalysisPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: AnalysisPageProps) {
  const { slug } = await params;
  const post = posts.find((entry) => entry.slug === slug);

  if (!post) {
    return {
      title: "Note not found | PARKSystems",
    };
  }

  return {
    title: `${post.title} | PARKSystems`,
    description: post.summary,
  };
}

export default async function AnalysisPage({ params }: AnalysisPageProps) {
  const { slug } = await params;
  const post = posts.find((entry) => entry.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="articleShell">
      <nav className="topbar articleNav" aria-label="Article navigation">
        <Link className="brand" href="/">
          <span>P</span>
          <strong>PARKSystems</strong>
        </Link>
        <Link className="textLink" href="/#updates">
          Back to feed
        </Link>
      </nav>

      <article className="article">
        <div className="postMeta">
          <span>{post.date}</span>
          <span>{post.domain}</span>
        </div>
        <h1>{post.title}</h1>
        <p className="articleSummary">{post.summary}</p>
        <div className="articleBody">
          {post.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
    </main>
  );
}
