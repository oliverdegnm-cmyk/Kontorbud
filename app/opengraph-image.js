import { ImageResponse } from "next/og";

// Next.js finder automatisk denne fil og bruger den som standard-billede,
// når AIbud deles på LinkedIn, Facebook, Slack, X/Twitter osv. - for alle
// sider, der ikke selv definerer et andet billede. Genereres ved request,
// så der ikke skal vedligeholdes en billedfil manuelt.
export const runtime = "edge";
export const alt = "AIbud - Danmarks platform for AI-opgaver";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#211334",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 22,
              background: "#7C3AED",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 46,
              fontWeight: 800,
              color: "#fff",
            }}
          >
            A
          </div>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 800, color: "#fff", letterSpacing: "-1px" }}>
            AIbud
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 22, fontSize: 32, color: "#B7C0DA", textAlign: "center" }}>
          Danmarks platform for AI-opgaver
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 44 }}>
          {["Prompt-engineering", "Automatisering", "Chatbots", "AI-undervisning"].map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                fontSize: 21,
                fontWeight: 600,
                color: "#D6DCEC",
                background: "rgba(255,255,255,0.08)",
                borderRadius: 999,
                padding: "12px 22px",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
