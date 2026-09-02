import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";

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
      onBeforeGenerateToken: async () => {
        return {
          // 100 MB dækker stort set alt, en administrativ opgave kræver (store
          // regneark, PDF-scanninger, mindre videoer), uden at én fejlupload
          // kan æde meget af den samlede lagerplads.
          maximumSizeInBytes: 100 * 1024 * 1024,
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
