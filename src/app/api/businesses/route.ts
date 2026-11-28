import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { desc, ilike, and, eq, or } from "drizzle-orm";
import { desc, ilike, and, eq, or, gt } from "drizzle-orm";

function getMonthlyFeeFromPlan(plan?: string): number {
  if (!plan) return 50;
  if (plan.includes("200") || plan.toLowerCase().includes("pro")) return 200;
  if (plan.includes("120") || plan.toLowerCase().includes("plus")) return 120;
  return 50;
}

function sanitizeImageUrl(url?: string): string {
  const defaultImg = "https://unsplash.com";
  if (!url) return defaultImg;
  const trimmed = url.trim();
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    return trimmed;
  }
  return defaultImg;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const town = searchParams.get("town");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const includeUnverified = searchParams.get("includeUnverified") === "true";

    const conditions = [];

    // Wys slegs geverifieerde besighede aan publieke verbruikers, tensy anders versoek
    if (!includeUnverified) {
  conditions.push(eq(businesses.isVerified, true));
  conditions.push(gt(businesses.subscriptionPaidUntil, new Date()));
}

    if (town && town !== "Alle Dorpe" && town !== "all") {
      conditions.push(eq(businesses.town, town));
    }
    if (category && category !== "Alle Kategorieë" && category !== "all") {
      conditions.push(eq(businesses.category, category));
    }
    if (search) {
      const q = `%${search.trim().slice(0, 100)}%`;
      conditions.push(
        or(
          ilike(businesses.name, q),
          ilike(businesses.description, q),
          ilike(businesses.ownerName, q),
          ilike(businesses.town, q)
        )
      );
    }

    const result = await db
      .select()
      .from(businesses)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(businesses.isFeatured), desc(businesses.createdAt));

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

    if (!name?.trim() || !ownerName?.trim() || !category || !town || !description?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { success: false, error: "Vul asseblief alle verpligte velde in (Naam, Eienaar, Kategorie, Dorp, Beskrywing, Foon)." },
        { status: 400 }
      );
    }

    // Maak telefoon- en WhatsApp-nommers skoon en standaardiseer na +27 formaat
    let cleanWa = (whatsapp || phone).replace(/[^0-9]/g, "");
    if (cleanWa.startsWith("0")) {
      cleanWa = "27" + cleanWa.substring(1);
    }

    if (cleanWa.length < 9 || cleanWa.length > 15) {
      return NextResponse.json(
        { success: false, error: "Verskaf asseblief 'n geldige Suid-Afrikaanse telefoonnommer." },
        { status: 400 }
      );
    }

    // Gratis 3-dae proeftydperk
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 3);

    const selectedPlan = subscriptionPlan || "Gemeenskap Basies (R50/m)";
    const calculatedFee = getMonthlyFeeFromPlan(selectedPlan);

    const [newBiz] = await db
      .insert(businesses)
      .values({
        name: name.trim().slice(0, 120),
        ownerName: ownerName.trim().slice(0, 100),
        category,
        town,
        description: description.trim().slice(0, 1000),
        phone: phone.trim().slice(0, 20),
        whatsapp: cleanWa,
        address: address?.trim().slice(0, 200) || null,
        hours: hours?.trim().slice(0, 100) || "Ma - Sa: 08:00 - 17:00",
        paymentMethods: paymentMethods || "Kontant, Capitec Pay",
        services: typeof services === "string" ? services : JSON.stringify(services || []),
        imageUrl: sanitizeImageUrl(imageUrl),
        isVerified: false,
        verificationStatus: "hangend",
        subscriptionStatus: "proeftydperk",
        subscriptionPlan: selectedPlan,
        monthlyFee: calculatedFee,
        subscriptionPaidUntil: trialEnd,
        paymentReference: "3-DAE-PROEF",
        isFeatured: true,
        rating: "5.0",
        reviewCount: 1,
      })
      .returning();

    return NextResponse.json({ success: true, business: newBiz }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating business:", error);
    const err = error as { message?: string; cause?: { message?: string } };
    const realReason = err?.cause?.message || err?.message || "Onbekende fout";
    return NextResponse.json(
      { success: false, error: `Kon nie besigheid registreer nie: ${realReason}` },
      { status: 500 }
    );
  }
}
