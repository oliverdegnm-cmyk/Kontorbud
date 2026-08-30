import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
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
