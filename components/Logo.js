// Kontorbuds ordmærke - to-tonet "Kontor" (mørk navy) + "bud" (blå), efter det
// logo Oliver selv designede og sendte 28/9 (erstatter det tidligere "KB"-firkant
// + almindelig "Kontorbud"-tekst i header/mobilmenu). Farverne er samplet direkte
// fra det billede, han sendte - bevidst IKKE de samme som sitets øvrige blå/navy
// (#2A55E5/#14213D), da det er selve logoets egne, lidt mere elektriske farver.
// Bruger sitets eksisterende skrifttype (Plus Jakarta Sans, vægt 800) i stedet for
// at indlæse en ny skrifttype, da den bold/afrundede stil allerede ligner godt.
export default function Logo({ size = 20, tagline = false, align = "flex-start" }) {
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: tagline ? "center" : align }}>
      <div style={{ fontSize: size, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>
        <span style={{ color: "#03203A" }}>Kontor</span>
        <span style={{ color: "#0980FE" }}>bud</span>
      </div>
      {tagline && (
        <div
          style={{
            fontSize: Math.round(size * 0.26),
            fontWeight: 700,
            letterSpacing: "0.1em",
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
