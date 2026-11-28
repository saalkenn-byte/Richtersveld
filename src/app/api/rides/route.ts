import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { rides } from "@/db/schema";
import { desc, gte } from "drizzle-orm";

function containsSpamLinks(text?: string | null): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return lower.includes("http://") || lower.includes("https://") || lower.includes("www.");
}

export async function GET() {
  try {
    // Vandag se datum in YYYY-MM-DD formaat sodat verstreke ritte outomaties weggesteek word
    const today = new Date().toISOString().split("T")[0];

    const allRides = await db
      .select()
      .from(rides)
      .where(gte(rides.date, today))
      .orderBy(desc(rides.createdAt));

    return NextResponse.json({ success: true, rides: allRides });
  } catch (error) {
    console.error("Error fetching rides:", error);
    return NextResponse.json({ success: false, error: "Kon nie saamry geleenthede laai nie" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      origin,
      destination,
      date,
      time,
      seatsAvailable,
      pricePerSeat,
      driverName,
      vehicleInfo,
      phone,
      whatsapp,
      notes,
    } = body;

    if (!origin?.trim() || !destination?.trim() || !date?.trim() || !time?.trim() || !seatsAvailable || !pricePerSeat?.trim() || !driverName?.trim() || !phone?.trim()) {
      return NextResponse.json({ success: false, error: "Vul asseblief alle ritbesonderhede in." }, { status: 400 });
    }

    if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
      return NextResponse.json({ success: false, error: "Vertrekpunt en bestemming kan nie dieselfde dorp wees nie." }, { status: 400 });
    }

    // Blokkeer spam-skakels
    if (
      containsSpamLinks(origin) ||
      containsSpamLinks(destination) ||
      containsSpamLinks(vehicleInfo) ||
      containsSpamLinks(notes)
    ) {
      return NextResponse.json({ success: false, error: "Web-skakels word nie in ritbesonderhede toegelaat nie." }, { status: 400 });
    }

    const seats = Number(seatsAvailable);
    if (Number.isNaN(seats) || seats < 1 || seats > 60) {
      return NextResponse.json({ success: false, error: "Aantal sitplekke moet tussen 1 en 60 wees." }, { status: 400 });
    }

    let cleanWa = (whatsapp || phone).replace(/[^0-9]/g, "");
    if (cleanWa.startsWith("0")) {
      cleanWa = "27" + cleanWa.substring(1);
    }

    if (cleanWa.length < 9 || cleanWa.length > 15) {
      return NextResponse.json({ success: false, error: "Verskaf asseblief 'n geldige Suid-Afrikaanse telefoonnommer." }, { status: 400 });
    }

    const [newRide] = await db
      .insert(rides)
      .values({
        origin: origin.trim().slice(0, 80),
        destination: destination.trim().slice(0, 80),
        date: date.trim().slice(0, 20),
        time: time.trim().slice(0, 20),
        seatsAvailable: seats,
        pricePerSeat: pricePerSeat.trim().slice(0, 40),
        driverName: driverName.trim().slice(0, 80),
        vehicleInfo: vehicleInfo?.trim().slice(0, 100) || null,
        phone: phone.trim().slice(0, 20),
        whatsapp: cleanWa,
        notes: notes?.trim().slice(0, 400) || null,
        isVerified: true,
      })
      .returning();

    return NextResponse.json({ success: true, ride: newRide }, { status: 201 });
  } catch (error) {
    console.error("Error creating ride:", error);
    return NextResponse.json({ success: false, error: "Fout met oplaai van rit" }, { status: 500 });
  }
}
