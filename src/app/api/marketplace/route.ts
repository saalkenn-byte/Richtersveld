import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { marketplaceListings } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const town = searchParams.get("town");
    const category = searchParams.get("category");

    const conditions = [];
    if (town && town !== "all" && town !== "Alle Dorpe") {
      conditions.push(eq(marketplaceListings.town, town));
    }
    if (category && category !== "all" && category !== "Alle Kategorieë") {
      conditions.push(eq(marketplaceListings.category, category));
    }

    const items = await db
      .select()
      .from(marketplaceListings)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(marketplaceListings.createdAt));

    return NextResponse.json({ success: true, listings: items });
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json({ success: false, error: "Kon nie items laai nie" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, category, town, price, description, sellerName, phone, whatsapp, type, imageUrl } = body;

    if (!title || !category || !town || !price || !description || !sellerName || !phone) {
      return NextResponse.json({ success: false, error: "Vul asseblief alle velde in." }, { status: 400 });
    }

    let cleanWa = (whatsapp || phone).replace(/[^0-9]/g, "");
    if (cleanWa.startsWith("0")) {
      cleanWa = "27" + cleanWa.substring(1);
    }

    const [newItem] = await db
      .insert(marketplaceListings)
      .values({
        title: title.trim(),
        category,
        town,
        price: price.trim(),
        description: description.trim(),
        sellerName: sellerName.trim(),
        phone: phone.trim(),
        whatsapp: cleanWa,
        type: type || "sell",
        status: "active",
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80",
      })
      .returning();

    return NextResponse.json({ success: true, listing: newItem }, { status: 201 });
  } catch (error) {
    console.error("Error creating listing:", error);
    return NextResponse.json({ success: false, error: "Fout met adverteer" }, { status: 500 });
  }
}
