import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { marketplaceListings } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

function containsSpamLinks(text: string): boolean {
  const lower = text.toLowerCase();
  return lower.includes("http://") || lower.includes("https://") || lower.includes("www.");
}

export async function GET() {
  try {
    const items = await db
      .select()
      .from(marketplaceListings)
      .where(eq(marketplaceListings.isVerified, true))
      .orderBy(desc(marketplaceListings.createdAt));

    return NextResponse.json({ success: true, listings: items });
  } catch (error) {
    console.error("Marketplace GET error:", error);
    return NextResponse.json({ success: false, error: "Kon nie markplein laai nie" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, category, town, price, description, sellerName, phone, whatsapp, type } = body;

    if (!title?.trim() || !category || !town || !price?.trim() || !description?.trim() || !sellerName?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { success: false, error: "Vul asseblief alle verpligte velde in." },
        { status: 400 }
      );
    }

    // Blokkeer eksterne spam-skakels
    if (containsSpamLinks(title) || containsSpamLinks(description)) {
      return NextResponse.json(
        { success: false, error: "Web-skakels word nie in plasings toegelaat nie." },
        { status: 400 }
      );
    }

    let cleanWa = (whatsapp || phone).replace(/[^0-9]/g, "");
    if (cleanWa.startsWith("0")) {
      cleanWa = "27" + cleanWa.substring(1);
    }

    if (cleanWa.length < 9 || cleanWa.length > 15) {
      return NextResponse.json(
        { success: false, error: "Verskaf asseblief 'n geldige telefoonnommer." },
        { status: 400 }
      );
    }

    const [newItem] = await db
      .insert(marketplaceListings)
      .values({
        title: title.trim().slice(0, 100),
        category,
        town,
        price: price.trim().slice(0, 40),
        description: description.trim().slice(0, 800),
        sellerName: sellerName.trim().slice(0, 80),
        phone: phone.trim().slice(0, 20),
        whatsapp: cleanWa,
        type: type || "sell",
        status: "active",
        isVerified: false, // Wag vir admin-goedkeuring voor dit publiek wys
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        listing: newItem,
        message: "Plasing ontvang! Dit sal verskyn sodra die admin dit goedgekeur het.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Marketplace POST error:", error);
    return NextResponse.json({ success: false, error: "Kon nie plasing stoor nie" }, { status: 500 });
  }
}
