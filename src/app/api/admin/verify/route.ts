import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { businesses, marketplaceListings, rides, communityNotices } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  // Beskerm admin-aksies teen ongemagtigde toegang
  const sessionCookie = request.cookies.get("richtersveld_admin_session");
  if (!sessionCookie || sessionCookie.value !== "authenticated") {
    return NextResponse.json(
      { success: false, error: "Ongemagtigde toegang. Meld eers as admin aan." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { type, id, action, status, isFeatured } = body;

    if (!type || !id || !action) {
      return NextResponse.json({ success: false, error: "Ontbrekende vereiste parameters" }, { status: 400 });
    }

    const targetId = Number(id);
    if (Number.isNaN(targetId)) {
      return NextResponse.json({ success: false, error: "Ongeldige ID" }, { status: 400 });
    }

    // 1. BESIGHEID VERIFIKASIE & STATUS
    if (type === "business") {
      if (action === "verify") {
        await db
          .update(businesses)
          .set({
            isVerified: true,
            verificationStatus: status || "goedgekeur",
          })
          .where(eq(businesses.id, targetId));

        return NextResponse.json({ success: true, message: "Besigheid suksesvol geverifieer" });
      }

      if (action === "reject") {
        await db
          .update(businesses)
          .set({
            isVerified: false,
            verificationStatus: "afgekeur",
          })
          .where(eq(businesses.id, targetId));

        return NextResponse.json({ success: true, message: "Besigheid afgekeur" });
      }

      if (action === "pending") {
        await db
          .update(businesses)
          .set({
            isVerified: false,
            verificationStatus: "hangend",
          })
          .where(eq(businesses.id, targetId));

        return NextResponse.json({ success: true, message: "Besigheid status na hangend verander" });
      }

      if (action === "expireTrial") {
        await db
          .update(businesses)
          .set({
            isVerified: false,
            subscriptionStatus: "verval",
          })
          .where(eq(businesses.id, targetId));

        return NextResponse.json({ success: true, message: "3-dae proeftydperk gemerk as verval" });
      }

      if (action === "toggleFeatured") {
        await db
          .update(businesses)
          .set({
            isFeatured: Boolean(isFeatured),
          })
          .where(eq(businesses.id, targetId));

        return NextResponse.json({ success: true, message: "Besigheid uitgelig status opgedateer" });
      }

      if (action === "delete") {
        await db.delete(businesses).where(eq(businesses.id, targetId));
        return NextResponse.json({ success: true, message: "Besigheid verwyder" });
      }
    }

    // 2. MARKPLEIN
    if (type === "marketplace") {
      if (action === "verify") {
        await db.update(marketplaceListings).set({ isVerified: true }).where(eq(marketplaceListings.id, targetId));
        return NextResponse.json({ success: true, message: "Item geverifieer" });
      }
      if (action === "delete") {
        await db.delete(marketplaceListings).where(eq(marketplaceListings.id, targetId));
        return NextResponse.json({ success: true, message: "Item verwyder" });
      }
    }

    // 3. SAAMRYGELEENTHEDE
    if (type === "ride") {
      if (action === "verify") {
        await db.update(rides).set({ isVerified: true }).where(eq(rides.id, targetId));
        return NextResponse.json({ success: true, message: "Rit geverifieer" });
      }
      if (action === "delete") {
        await db.delete(rides).where(eq(rides.id, targetId));
        return NextResponse.json({ success: true, message: "Rit verwyder" });
      }
    }

    // 4. KENNISGEWINGS
    if (type === "notice") {
      if (action === "verify") {
        await db.update(communityNotices).set({ isVerified: true }).where(eq(communityNotices.id, targetId));
        return NextResponse.json({ success: true, message: "Kennisgewing geverifieer" });
      }
      if (action === "delete") {
        await db.delete(communityNotices).where(eq(communityNotices.id, targetId));
        return NextResponse.json({ success: true, message: "Kennisgewing verwyder" });
      }
    }

    return NextResponse.json({ success: false, error: "Ongeldige aksie of tipe" }, { status: 400 });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ success: false, error: "Kon nie aksie uitvoer nie" }, { status: 500 });
  }
}
