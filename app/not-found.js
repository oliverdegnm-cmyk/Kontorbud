import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { CATS } from "@/lib/categories";

export default function NotFound() {
  const popular = CATS.slice(0, 6);

  return (
    <div style={{ marginTop: 60, marginBottom: 80, textAlign: "center", maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: "#F1EBFF",
          color: "#7C3AED",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
        }}
      >
        <FileQuestion size={28} />
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Siden blev ikke fundet</h1>
      <p style={{ fontSize: 14, color: "#5B6478", lineHeight: 1.65, marginBottom: 28 }}>
        Linket virker ikke, eller siden findes ikke længere. Prøv en af mulighederne nedenfor.
      </p>

      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 40 }}>
        <Link
          href="/"
          style={{ display: "inline-block", fontSize: 13.5, fontWeight: 700, padding: "11px 22px", borderRadius: 999, background: "#7C3AED", color: "#fff" }}
        >
          Til forsiden
        </Link>
        <Link
          href="/opgaver"
          style={{ display: "inline-block", fontSize: 13.5, fontWeight: 700, padding: "11px 22px", borderRadius: 999, border: "1.5px solid #E4E8F0", color: "#14213D" }}
        >
          Se åbne opgaver
        </Link>
      </div>

      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 14 }}>Eller se en kategori</div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
        {popular.map((c) => (
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
  );
}
