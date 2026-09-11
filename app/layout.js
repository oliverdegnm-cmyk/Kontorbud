import "./globals.css";
import { NameProvider } from "@/lib/NameContext";
import TopBar from "@/components/TopBar";
import CookieBanner from "@/components/CookieBanner";
import { Analytics } from "@vercel/analytics/react";
import { safeJsonLd } from "@/lib/safeJsonLd";

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
  // Kortet ("summary_large_image") vises kun rigtigt, hvis Twitter/X finder et
  // billede - det leverer app/opengraph-image.js automatisk til både Open
  // Graph og Twitter, så alle sider får et delt preview-billede uden at vi
  // selv skal sætte "images" her.
  twitter: {
    card: "summary_large_image",
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }} />
        <NameProvider>
          <TopBar />
          <main style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 80px" }}>{children}</main>
          <CookieBanner />
        </NameProvider>
        <Analytics />
      </body>
    </html>
  );
}
