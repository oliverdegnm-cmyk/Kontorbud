import Link from "next/link";
import { POSTS, getPostBySlug } from "@/lib/blogPosts";
import { categoryBySlug } from "@/lib/categories";
import { ChevronRight, Calendar } from "lucide-react";
import { safeJsonLd } from "@/lib/safeJsonLd";

export async function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: "Blogindlæg - AIbud" };
  return {
    title: `${post.title} - AIbud`,
    description: post.description,
    alternates: { canonical: `https://aibud.dk/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
    },
  };
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" });
}

export default function BlogPostPage({ params }) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return (
      <div style={{ marginTop: 40, textAlign: "center", color: "#5B6478" }}>
        Indlægget blev ikke fundet. <Link href="/blog" style={{ color: "#7C3AED", fontWeight: 700 }}>Se alle indlæg</Link>
      </div>
    );
  }

  const cat = categoryBySlug(post.categorySlug);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: "AIbud" },
    publisher: { "@type": "Organization", name: "AIbud" },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "AIbud", item: "https://aibud.dk/" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://aibud.dk/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: `https://aibud.dk/blog/${post.slug}` },
    ],
  };

  return (
    <div style={{ marginTop: 24, marginBottom: 60, maxWidth: 680 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumb) }} />

      <div style={{ fontSize: 12.5, color: "#5B6478", marginBottom: 16 }}>
        <Link href="/">AIbud</Link> <ChevronRight size={11} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
        <Link href="/blog">Blog</Link>
      </div>

      <div style={{ fontSize: 11.5, fontWeight: 700, color: "#7C3AED", marginBottom: 10 }}>{post.category}</div>
      <h1 style={{ fontSize: 27, fontWeight: 800, marginBottom: 12, lineHeight: 1.3 }}>{post.title}</h1>
      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "#9AA2B1", marginBottom: 32 }}>
        <Calendar size={13} /> {formatDate(post.publishedAt)}
      </div>

      <div>
        {post.content.map((block, i) => {
          if (block.type === "h2") {
            return (
              <h2 key={i} style={{ fontSize: 18, fontWeight: 800, marginTop: 28, marginBottom: 10 }}>
                {block.text}
              </h2>
            );
          }
          if (block.type === "list") {
            return (
              <ul key={i} style={{ margin: "0 0 16px", paddingLeft: 20 }}>
                {block.items.map((item, j) => (
                  <li key={j} style={{ fontSize: 15, color: "#333", lineHeight: 1.75 }}>
                    {item}
                  </li>
                ))}
              </ul>
            );
          }
          return (
            <p key={i} style={{ fontSize: 15, color: "#333", lineHeight: 1.75, marginBottom: 16 }}>
              {block.text}
            </p>
          );
        })}
      </div>

      {cat && (
        <div style={{ background: "#F1EBFF", borderRadius: 16, padding: "22px 24px", marginTop: 36 }}>
          <div style={{ fontSize: 14.5, fontWeight: 800, marginBottom: 8 }}>Har du brug for hjælp til {cat.name.toLowerCase()}?</div>
          <p style={{ fontSize: 13.5, color: "#5B6478", lineHeight: 1.6, marginBottom: 16 }}>
            Opret en opgave, og få bud fra dygtige danske hjælpere - betaling holdes sikkert, indtil du er tilfreds.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link
              href={`/opret?category=${encodeURIComponent(cat.name)}`}
              style={{ display: "inline-block", fontSize: 13, fontWeight: 700, padding: "10px 18px", borderRadius: 999, background: "#7C3AED", color: "#fff" }}
            >
              Opret en opgave
            </Link>
            <Link
              href={`/kategori/${cat.slug}`}
              style={{ display: "inline-block", fontSize: 13, fontWeight: 700, padding: "10px 18px", borderRadius: 999, border: "1.5px solid #DCE4FB", color: "#14213D" }}
            >
              Se {cat.name.toLowerCase()} →
            </Link>
          </div>
        </div>
      )}

      <div style={{ marginTop: 40 }}>
        <Link href="/blog" style={{ fontSize: 13.5, fontWeight: 700, color: "#7C3AED" }}>
          ← Se alle blogindlæg
        </Link>
      </div>
    </div>
  );
}
