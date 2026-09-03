import "./globals.css";
import { NameProvider } from "@/lib/NameContext";
import TopBar from "@/components/TopBar";
import NameGate from "@/components/NameGate";

export const metadata = {
  title: "Kontorbud — Byd ind på kontoropgaver",
  description: "Opret kontoropgaver og modtag bud fra kvalificerede hjælpere.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="da">
      <body>
        <NameProvider>
          <TopBar />
          <NameGate>
            <main style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 80px" }}>{children}</main>
          </NameGate>
        </NameProvider>
      </body>
    </html>
  );
}
