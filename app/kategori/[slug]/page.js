import Link from "next/link";
import { pool, ensureSchema } from "@/lib/db";
import { categoryBySlug, CATS } from "@/lib/categories";
import { CatIcon } from "@/lib/icons";
import { formatBudgetDisplay } from "@/lib/fees";
import { ChevronRight } from "lucide-react";

export async function generateStaticParams() {
  return CATS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }) {
  const cat = categoryBySlug(params.slug);
  if (!cat) return { title: "Kategori - Kontorbud" };
  return {
    title: `${cat.name} - find hjælpere på Kontorbud`,
    description: `Se åbne opgaver inden for ${cat.name.toLowerCase()}, eller opret din egen opgave og få bud fra dygtige danske hjælpere.`,
    alternates: { canonical: `https://kontorbud.dk/kategori/${cat.slug}` },
  };
}

export default async function CategoryPage({ params }) {
  const cat = categoryBySlug(params.slug);
  if (!cat) {
    return (
      <div style={{ marginTop: 40, textAlign: "center", color: "#5B6478" }}>
        Kategorien blev ikke fundet. <Link href="/opgaver" style={{ color: "#2A55E5", fontWeight: 700 }}>Se alle opgaver</Link>
      </div>
    );
  }

  let tasks = [];
  try {
    await ensureSchema();
    const { rows } = await pool.query(
      "SELECT id, title, budget, deadline, area FROM tasks WHERE category = $1 AND status = 'open' ORDER BY created_at DESC LIMIT 20",
      [cat.name]
    );
    tasks = rows;
  } catch (err) {
    // siden virker stadig fint uden listen, hvis databasen ikke kan nås
  }

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Kontorbud", item: "https://kontorbud.dk/" },
      { "@type": "ListItem", position: 2, name: "Opgaver", item: "https://kontorbud.dk/opgaver" },
      { "@type": "ListItem", position: 3, name: cat.name, item: `https://kontorbud.dk/kategori/${cat.slug}` },
    ],
  };

  return (
    <div style={{ marginTop: 24, marginBottom: 60 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <div style={{ fontSize: 12.5, color: "#5B6478", marginBottom: 16 }}>
        <Link href="/">Kontorbud</Link> <ChevronRight size={11} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
        <Link href="/opgaver">Opgaver</Link> <ChevronRight size={11} style={{ display: "inline", verticalAlign: "middle" }} /> {cat.name}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
        <div style={{ width: 46, height: 46, borderRadius: 14, background: "#EEF2FF", color: "#2A55E5", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>
          <CatIcon name={cat.icon} size={22} />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>{cat.name}</h1>
      </div>
      <p style={{ fontSize: 14.5, color: "#5B6478", lineHeight: 1.65, maxWidth: 600, marginBottom: 28 }}>
        Find hjælp til {cat.name.toLowerCase()} fra dygtige danske hjælpere, eller byd selv på opgaver inden for feltet. Betaling holdes sikkert af platformen, indtil opgaven er udført til din tilfredshed.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 32, flexWrap: "wrap" }}>
        <Link
          href={`/opret?category=${encodeURIComponent(cat.name)}`}
          style={{ display: "inline-block", fontSize: 13.5, fontWeight: 700, padding: "11px 22px", borderRadius: 999, background: "#2A55E5", color: "#fff" }}
        >
          Opret en opgave i {cat.name}
        </Link>
        <Link
          href={`/opgaver?category=${encodeURIComponent(cat.name)}`}
          style={{ display: "inline-block", fontSize: 13.5, fontWeight: 700, padding: "11px 22px", borderRadius: 999, border: "1.5px solid #E4E8F0", color: "#14213D" }}
        >
          Se alle med filtre og kort →
        </Link>
      </div>

      <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 16 }}>
        {tasks.length > 0 ? `Åbne opgaver i ${cat.name}` : `Ingen åbne opgaver i ${cat.name} lige nu`}
      </h2>

      {tasks.length === 0 ? (
        <p style={{ fontSize: 13.5, color: "#5B6478" }}>
          Vær den første til at{" "}
          <Link href={`/opret?category=${encodeURIComponent(cat.name)}`} style={{ color: "#2A55E5", fontWeight: 700 }}>
            oprette en opgave
          </Link>{" "}
          i denne kategori.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tasks.map((t) => (
            <Link
              key={t.id}
              href={`/opgave/${t.id}`}
              style={{ display: "flex", alignItems: "center", gap: 16, background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 16, padding: "16px 18px" }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700 }}>{t.title}</div>
                <div style={{ fontSize: 12.5, color: "#5B6478" }}>
                  Frist: {t.deadline}
                  {t.area ? ` · 📍 ${t.area}` : ""}
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, flex: "0 0 auto" }}>{formatBudgetDisplay(t.budget)}</div>
              <ChevronRight size={18} color="#5B6478" />
            </Link>
          ))}
        </div>
      )}

      <div style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>Andre kategorier</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {CATS.filter((c) => c.slug !== cat.slug).map((c) => (
            <Link
              key={c.slug}
              href={`/kategori/${c.slug}`}
              style={{ fontSize: 12.5, fontWeight: 600, padding: "8px 14px", borderRadius: 999, background: "#F5F7FB", color: "#14213D" }}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
