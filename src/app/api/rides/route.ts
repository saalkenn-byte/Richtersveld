import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { rides } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allRides = await db.select().from(rides).orderBy(desc(rides.createdAt));
    return NextResponse.json({ success: true, rides: allRides });
  } catch (error) {
    console.error("Error fetching rides:", error);
    return NextResponse.json({ success: false, error: "Kon nie saamry geleenthede laai nie" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { origin, destination, date, time, seatsAvailable, pricePerSeat, driverName, vehicleInfo, phone, whatsapp, notes } = body;

    if (!origin || !destination || !date || !time || !seatsAvailable || !pricePerSeat || !driverName || !phone) {
      return NextResponse.json({ success: false, error: "Vul asseblief alle ritbesonderhede in." }, { status: 400 });
    }

    let cleanWa = (whatsapp || phone).replace(/[^0-9]/g, "");
    if (cleanWa.startsWith("0")) {
      cleanWa = "27" + cleanWa.substring(1);
    }

    const [newRide] = await db
      .insert(rides)
      .values({
        origin: origin.trim(),
        destination: destination.trim(),
        date: date.trim(),
        time: time.trim(),
        seatsAvailable: Number(seatsAvailable),
        pricePerSeat: pricePerSeat.trim(),
        driverName: driverName.trim(),
        vehicleInfo: vehicleInfo?.trim() || null,
        phone: phone.trim(),
        whatsapp: cleanWa,
        notes: notes?.trim() || null,
      })
      .returning();

    return NextResponse.json({ success: true, ride: newRide }, { status: 201 });
  } catch (error) {
    console.error("Error creating ride:", error);
    return NextResponse.json({ success: false, error: "Fout met oplaai van rit" }, { status: 500 });
  }
}
