import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";

// Hvilke filtyper der reelt giver mening pr. sted i appen - håndhævet server-
// side, så det ikke er nok bare at ændre filendelsen for at omgå begrænsningen
// (klientens accept="..." er kun en visuel hjælp, ingen sikkerhedsspærre).
const ALLOWED_TYPES = {
  cv: ["application/pdf"],
  image: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"],
  attachment: [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/webp",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
    "text/plain",
  ],
};

export async function POST(request) {
  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      // Understøtter både det almindelige variabelnavn og et præfikset navn
      // (f.eks. BLOB2_READ_WRITE_TOKEN), hvis I har måttet forbinde et nyt
      // Blob-lager med et præfiks for at undgå navnekonflikt med et gammelt.
      token: process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB2_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let purpose = "attachment";
        try {
          purpose = JSON.parse(clientPayload || "{}").purpose || "attachment";
        } catch (e) {
          // ukendt/manglende payload - behandles som en almindelig vedhæftning
        }

        return {
          // CV'er skal ikke fylde meget; billeder og vedhæftninger må gerne
          // være større (store regneark, PDF-scanninger).
          maximumSizeInBytes: purpose === "cv" ? 10 * 1024 * 1024 : 100 * 1024 * 1024,
          allowedContentTypes: ALLOWED_TYPES[purpose] || ALLOWED_TYPES.attachment,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // Ingen ekstra handling nødvendig - filen er allerede uploadet, når klienten får URL'en tilbage.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: error.message || "Kunne ikke starte upload." }, { status: 400 });
  }
}
