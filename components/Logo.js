"use client";

import { useLayoutEffect, useRef, useState } from "react";

// Kontorbuds ordmærke - to-tonet "Kontor" + "bud", efter det logo Oliver selv
// designede og sendte 28/9 (erstatter det tidligere "KB"-firkant + almindelig
// "Kontorbud"-tekst i header/mobilmenu). "Kontor" bruger sitets egen mørkeblå/
// navy (#14213D), og "bud" bruger 29/9 også sitets egen blå (#2A55E5, samme som
// f.eks. "Opret opgave"-knappen) - begge dele af logoet matcher nu sitets
// eksisterende farvepalet i stedet for logoets oprindelige, lidt mere
// elektriske blå fra referencebilledet.
// Bruger sitets eksisterende skrifttype (Plus Jakarta Sans, vægt 800) i stedet for
// at indlæse en ny skrifttype, da den bold/afrundede stil allerede ligner godt.

// SSR-sikker useLayoutEffect: undgår "useLayoutEffect does nothing on the server"
// advarslen, uden at miste fordelen af at opdatere FØR browseren maler (ingen
// synligt "hop" i bogstavmellemrummet, når det udregnes ved indlæsning).
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : () => {};

export default function Logo({ size = 20, tagline = false, align = "flex-start" }) {
  const headingRef = useRef(null);
  const taglineRef = useRef(null);
  // Fallback, hvis målingen af en eller anden grund ikke når at køre (fx uden JS):
  // et fornuftigt fast mellemrum, tæt på det ønskede udtryk.
  const [letterSpacingEm, setLetterSpacingEm] = useState(0.1);

  useIsomorphicLayoutEffect(() => {
    if (!tagline || !headingRef.current || !taglineRef.current) return;
    const headingEl = headingRef.current;
    const taglineEl = taglineRef.current;
    const text = taglineEl.textContent || "";
    if (text.length < 2) return;

    // Mål taglinjens naturlige bredde uden ekstra bogstavmellemrum, så vi kan
    // udregne, præcis hvor meget mellemrum pr. bogstav der skal til, for at
    // linjen bliver lige så bred som "Kontorbud"-teksten ovenover - ligesom i
    // Olivers referencebillede, hvor de to linjer fylder præcis det samme.
    const prevSpacing = taglineEl.style.letterSpacing;
    taglineEl.style.letterSpacing = "0px";
    const naturalWidth = taglineEl.scrollWidth;
    taglineEl.style.letterSpacing = prevSpacing;

    const headingWidth = headingEl.scrollWidth;
    const fontSizePx = Math.round(size * 0.26);
    const gaps = text.length - 1;
    const perCharPx = (headingWidth - naturalWidth) / gaps;
    const perCharEm = perCharPx / fontSizePx;

    // Hold mellemrummet inden for et fornuftigt interval, så det ikke bliver
    // negativt eller absurd stort, hvis bredderne af en eller anden grund ikke
    // matcher (fx meget smal skærm eller anden skrifttype, der ikke er loadet endnu).
    setLetterSpacingEm(Math.max(0.01, Math.min(perCharEm, 0.5)));
  }, [tagline, size]);

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: align }}>
      <div
        ref={headingRef}
        style={{ fontSize: size, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap" }}
      >
        <span style={{ color: "#14213D" }}>Kontor</span>
        <span style={{ color: "#2A55E5" }}>bud</span>
      </div>
      {tagline && (
        <div
          ref={taglineRef}
          style={{
            fontSize: Math.round(size * 0.26),
            fontWeight: 700,
            letterSpacing: `${letterSpacingEm}em`,
            color: "#9AA2B1",
            marginTop: 5,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          Få hjælp til dine kontoropgaver
        </div>
      )}
    </div>
  );
}
