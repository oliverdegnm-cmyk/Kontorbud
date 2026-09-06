import "./globals.css";
import { NameProvider } from "@/lib/NameContext";
import TopBar from "@/components/TopBar";

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
  return (
    <html lang="da">
      <body>
        <NameProvider>
          <TopBar />
          <main style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 80px" }}>{children}</main>
        </NameProvider>
      </body>
    </html>
  );
}
