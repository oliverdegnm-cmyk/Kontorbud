import Link from "next/link";
import { POSTS } from "@/lib/blogPosts";
import { ChevronRight, Calendar } from "lucide-react";

export const metadata = {
  title: "Blog - Kontorbud",
  description: "Gode råd og praktisk viden om bogføring, kundeservice, oversættelse, AI og andre kontoropgaver.",
  alternates: { canonical: "https://kontorbud.dk/blog" },
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" });
}

export default function BlogIndexPage() {
  const sorted = [...POSTS].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  return (
    <div style={{ marginTop: 24, marginBottom: 60 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Blog</h1>
      <p style={{ fontSize: 14.5, color: "#5B6478", marginBottom: 32, maxWidth: 600 }}>
        Gode råd og praktisk viden om bogføring, kundeservice, oversættelse, AI og de andre opgavetyper, I finder på Kontorbud.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {sorted.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            style={{ display: "block", background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 18, padding: "22px 24px" }}
          >
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#2A55E5", marginBottom: 8 }}>{post.category}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 6px" }}>{post.title}</h2>
                <p style={{ fontSize: 13.5, color: "#5B6478", lineHeight: 1.55, margin: "0 0 8px" }}>{post.description}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#9AA2B1" }}>
                  <Calendar size={12} /> {formatDate(post.publishedAt)}
                </div>
              </div>
              <ChevronRight size={18} color="#5B6478" style={{ flex: "0 0 auto" }} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
