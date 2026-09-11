import LoginClient from "./LoginClient";

export const metadata = {
  title: "Log ind - AIbud",
  description: "Log ind på AIbud, eller opret en gratis konto.",
  alternates: { canonical: "https://aibud.dk/login" },
};

export default function Page() {
  return <LoginClient />;
}
