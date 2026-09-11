import LoginClient from "./LoginClient";

export const metadata = {
  title: "Log ind - Kontorbud",
  description: "Log ind på Kontorbud, eller opret en gratis konto.",
  alternates: { canonical: "https://kontorbud.dk/login" },
};

export default function Page() {
  return <LoginClient />;
}
