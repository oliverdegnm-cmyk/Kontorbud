export default function manifest() {
  return {
    name: "AIbud - Byd ind på AI-opgaver",
    short_name: "AIbud",
    description: "Danmarks platform for AI-opgaver. Opret opgaver, byd, og få klaret det, der skal klares.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#7C3AED",
    orientation: "portrait",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
