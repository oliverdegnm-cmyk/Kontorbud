import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cvr = (searchParams.get("cvr") || "").trim();

  if (!/^\d{8}$/.test(cvr)) {
    return NextResponse.json({ error: "CVR-nummer skal være 8 cifre." }, { status: 400 });
  }

  try {
    const res = await fetch(`https://cvrapi.dk/api?search=${cvr}&country=dk`, {
      headers: {
        // CVR API kræver en beskrivende user-agent frem for standardværdien,
        // ellers risikerer opslag at blive afvist.
        "User-Agent": "CVR API - AIbud.dk - support@aibud.dk",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Kunne ikke finde en virksomhed med det CVR-nummer." }, { status: 404 });
    }

    const data = await res.json();
    if (data.error) {
      return NextResponse.json({ error: "Kunne ikke finde en virksomhed med det CVR-nummer." }, { status: 404 });
    }

    return NextResponse.json({
      name: data.name,
      address: data.address,
      zipcode: data.zipcode,
      city: data.city,
      status: data.companystatus,
    });
  } catch (err) {
    return NextResponse.json({ error: "CVR-opslag er midlertidigt utilgængeligt. Prøv igen senere." }, { status: 500 });
  }
}
