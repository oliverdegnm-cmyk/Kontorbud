"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

// Indlæser kun Google Analytics, hvis begge dele er på plads:
// 1) Der er sat et måler-ID i miljøvariablen NEXT_PUBLIC_GA_ID (oprettes i
//    Google Analytics og tilføjes i Vercels projektindstillinger - ingen
//    kodeændring nødvendig, når det er gjort).
// 2) Brugeren har aktivt sagt ja tak til analytics-cookien i cookiebanneret
//    (se components/CookieBanner.js). Siger man "Kun nødvendige", eller har
//    man endnu ikke taget stilling, sættes Googles cookies slet ikke - det er
//    et krav efter cookiebekendtgørelsen/GDPR for cookies, der ikke er
//    strengt nødvendige for at bruge siden.
export default function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    function checkConsent() {
      setConsent(localStorage.getItem("kb_cookie_consent") === "accepted");
    }
    checkConsent();
    window.addEventListener("cookie-consent-changed", checkConsent);
    return () => window.removeEventListener("cookie-consent-changed", checkConsent);
  }, []);

  if (!gaId || !consent) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
