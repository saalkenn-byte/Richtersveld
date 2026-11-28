import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { seedDatabase } from "@/db/seed";
import { desc, ilike, and, eq, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    await seedDatabase();
    const { searchParams } = new URL(request.url);
    const town = searchParams.get("town");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const conditions = [];
    if (town && town !== "Alle Dorpe" && town !== "all") {
      conditions.push(eq(businesses.town, town));
    }
    if (category && category !== "Alle Kategorieë" && category !== "all") {
      conditions.push(eq(businesses.category, category));
    }
    if (search) {
      const q = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(businesses.name, q),
          ilike(businesses.description, q),
          ilike(businesses.ownerName, q),
          ilike(businesses.town, q)
        )
      );
    }

    const query = db
      .select()
      .from(businesses)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(businesses.isFeatured), desc(businesses.createdAt));

    const result = await query;
    return NextResponse.json({ success: true, businesses: result });
  } catch (error) {
    console.error("Error fetching businesses:", error);
    return NextResponse.json({ success: false, error: "Fout met oplaai van besighede" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      ownerName,
      category,
      town,
      description,
      phone,
      whatsapp,
      address,
      hours,
      paymentMethods,
      services,
      imageUrl,
      subscriptionPlan,
    } = body;

    if (!name || !ownerName || !category || !town || !description || !phone) {
      return NextResponse.json(
        { success: false, error: "Vul asseblief alle verpligte velde in (Naam, Eienaar, Kategorie, Dorp, Beskrywing, Foon)." },
        { status: 400 }
      );
    }

    // Clean whatsapp number - remove spaces and lead plus if needed
    let cleanWa = (whatsapp || phone).replace(/[^0-9]/g, "");
    if (cleanWa.startsWith("0")) {
      cleanWa = "27" + cleanWa.substring(1);
    }

    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 30);

    const [newBiz] = await db
      .insert(businesses)
      .values({
        name: name.trim(),
        ownerName: ownerName.trim(),
        category,
        town,
        description: description.trim(),
        phone: phone.trim(),
        whatsapp: cleanWa,
        address: address?.trim() || null,
        hours: hours?.trim() || "Ma - Sa: 08:00 - 17:00",
        paymentMethods: paymentMethods || "Kontant, Capitec Pay",
        services: typeof services === "string" ? services : JSON.stringify(services || []),
        imageUrl: imageUrl?.trim() || "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=600&q=80",
        isVerified: false,
        verificationStatus: "hangend", // Awaits admin verification
        subscriptionStatus: "proeftydperk", // 30-day free trial for new local entrepreneurs
        subscriptionPlan: subscriptionPlan || "Gemeenskap Basies (R50/m)",
        monthlyFee: 50,
        subscriptionPaidUntil: trialEnd,
        paymentReference: "AANLYN-REGISTRASIE",
        isFeatured: false,
        rating: "5.0",
        reviewCount: 1,
      })
      .returning();

    return NextResponse.json({ success: true, business: newBiz }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating business:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Databasis-fout: ${error?.message || "Onbekende fout"}` 
      }, 
      { status: 500 }
    );
  }

