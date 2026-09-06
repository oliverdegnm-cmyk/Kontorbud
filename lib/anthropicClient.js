// Bruger Anthropics API til at læse et CV (PDF) og finde de oplysninger, der
// kan bruges til at foreslå udfyldning af profilen. Kræver ANTHROPIC_API_KEY
// som miljøvariabel i Vercel - en ny, selvstændig nøgle, adskilt fra selve
// byggeprocessen her.
export async function extractCvData(pdfBase64) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY mangler i miljøvariablerne - automatisk udfyldning kan ikke bruges endnu.");
  }

  const prompt = `Du får vedhæftet et CV som PDF. Læs det, og svar UDELUKKENDE med et JSON-objekt (ingen forklaring, ingen markdown-kodeblok omkring), i præcis dette format:
{
  "bio": "en kort, professionel præsentation på 2-3 sætninger baseret på CV'et, skrevet på dansk, i jeg-form",
  "job": "et resumé af erhvervserfaring/tidligere og nuværende jobs, gerne med årstal og virksomhedsnavne, skrevet på dansk",
  "education": "et resumé af uddannelse, kurser og certificeringer, gerne med årstal, skrevet på dansk",
  "skills": "en kommasepareret liste af de vigtigste faglige kompetencer, maks. 8 stykker"
}
Hvis en oplysning ikke tydeligt fremgår af CV'et, brug en tom streng "" for det pågældende felt. Opfind aldrig oplysninger, der ikke står i dokumentet.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdfBase64 } },
            { type: "text", text: prompt },
          ],
        },
      ],
    }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error.message || "Kunne ikke analysere CV'et.");
  }

  const text = (data.content || []).map((c) => c.text || "").join("");
  const cleaned = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error("Kunne ikke tolke svaret fra AI-analysen.");
  }
}
