import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { businesses, subscriptionPayments, marketplaceListings, rides, communityNotices } from "@/db/schema";
import { and, desc, eq, lt } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get("richtersveld_admin_session");
  if (!sessionCookie || sessionCookie.value !== "authenticated") {
    return NextResponse.json({ success: false, error: "Ongemagtigde toegang" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Merk verstreke 3-dae proeftydperke outomaties as 'verval'
    await db
      .update(businesses)
      .set({
        subscriptionStatus: "verval",
        isVerified: false,
      })
      .where(
        and(
          eq(businesses.subscriptionStatus, "proeftydperk"),
          lt(businesses.subscriptionPaidUntil, now)
        )
      );

    const [allBiz, allPayments, allMarketplace, allRides, allNotices] = await Promise.all([
      db.select().from(businesses).orderBy(desc(businesses.createdAt)),
      db.select().from(subscriptionPayments).orderBy(desc(subscriptionPayments.paidAt)),
      db.select().from(marketplaceListings).orderBy(desc(marketplaceListings.createdAt)),
      db.select().from(rides).orderBy(desc(rides.createdAt)),
      db.select().from(communityNotices).orderBy(desc(communityNotices.createdAt)),
    ]);

    const totalBusinesses = allBiz.length;
    const verifiedCount = allBiz.filter((b) => b.isVerified && b.verificationStatus === "goedgekeur").length;
    const pendingVerificationCount = allBiz.filter((b) => b.verificationStatus === "hangend" || !b.isVerified).length;
    const rejectedCount = allBiz.filter((b) => b.verificationStatus === "afgekeur").length;

    const activeSubs = allBiz.filter((b) => b.subscriptionStatus === "aktief").length;
    const trialSubs = allBiz.filter((b) => b.subscriptionStatus === "proeftydperk").length;
    const overdueSubs = allBiz.filter((b) => b.subscriptionStatus === "agterstallig").length;
    const expiredSubs = allBiz.filter((b) => b.subscriptionStatus === "verval").length;

    const monthlyProjectedRevenue = allBiz
      .filter((b) => b.subscriptionStatus === "aktief")
      .reduce((sum, b) => sum + (b.monthlyFee || 50), 0);

    const totalCollectedFees = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalBusinesses,
        verifiedCount,
        pendingVerificationCount,
        rejectedCount,
        activeSubs,
        trialSubs,
        overdueSubs,
        expiredSubs,
        monthlyProjectedRevenue,
        totalCollectedFees,
        totalMarketplace: allMarketplace.length,
        totalRides: allRides.length,
        totalNotices: allNotices.length,
      },
      businesses: allBiz,
      payments: allPayments,
      marketplace: allMarketplace,
      rides: allRides,
      notices: allNotices,
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    return NextResponse.json({ success: false, error: "Kon nie admin oorsig laai nie" }, { status: 500 });
  }
}
