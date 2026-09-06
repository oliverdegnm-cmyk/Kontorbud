import "./globals.css";
import { NameProvider } from "@/lib/NameContext";
import TopBar from "@/components/TopBar";
import CookieBanner from "@/components/CookieBanner";

export const metadata = {
  metadataBase: new URL("https://kontorbud.dk"),
  title: {
    default: "Kontorbud - Byd ind på kontoropgaver",
    template: "%s",
  },
  description: "Opret kontoropgaver og modtag bud fra kvalificerede hjælpere.",
  openGraph: {
    siteName: "Kontorbud",
    locale: "da_DK",
    type: "website",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kontorbud",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport = {
  themeColor: "#2A55E5",
};

export default function RootLayout({ children }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Kontorbud",
        url: "https://kontorbud.dk",
        logo: "https://kontorbud.dk/icon-512.png",
      },
      {
        "@type": "WebSite",
        name: "Kontorbud",
        url: "https://kontorbud.dk",
        inLanguage: "da-DK",
      },
    ],
  };

  return (
    <html lang="da">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <NameProvider>
          <TopBar />
          <main style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 80px" }}>{children}</main>
          <CookieBanner />
        </NameProvider>
      </body>
    </html>
  );
}
