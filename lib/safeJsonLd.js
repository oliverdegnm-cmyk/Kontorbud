// Bruges når JSON-data (f.eks. strukturerede data/JSON-LD) skal indsættes
// direkte i en <script>-tag via dangerouslySetInnerHTML. Almindelig
// JSON.stringify escaper IKKE "<"-tegnet, hvilket betyder, at en bruger-
// indtastet værdi (f.eks. en opgavetitel) med indholdet "</script><script>..."
// bogstaveligt kunne afslutte selve script-tagget og injicere ny, kørende
// kode i andre besøgendes browser. Ved at erstatte "<" med dets Unicode-
// escape er det umuligt for nogen HTML-tag at opstå i outputtet, uanset
// hvad brugeren har skrevet.
export function safeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
