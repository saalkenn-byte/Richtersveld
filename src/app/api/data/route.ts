import { NextResponse } from "next/server";
import { db } from "@/db";
import { businesses, marketplaceListings, rides, communityNotices, emergencyContacts } from "@/db/schema";
import { seedDatabase } from "@/db/seed";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    // Ensure seeded
    await seedDatabase();

    const [allBusinesses, allListings, allRides, allNotices, allContacts] = await Promise.all([
      db.select().from(businesses).orderBy(desc(businesses.isFeatured), desc(businesses.createdAt)),
      db.select().from(marketplaceListings).orderBy(desc(marketplaceListings.createdAt)),
      db.select().from(rides).orderBy(desc(rides.createdAt)),
      db.select().from(communityNotices).orderBy(desc(communityNotices.isUrgent), desc(communityNotices.createdAt)),
      db.select().from(emergencyContacts),
    ]);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      businesses: allBusinesses,
      listings: allListings,
      rides: allRides,
      notices: allNotices,
      emergencyContacts: allContacts,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ success: false, error: "Kon nie data laai nie" }, { status: 500 });
  }
}
