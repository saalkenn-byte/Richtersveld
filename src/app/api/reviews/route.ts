import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, businesses } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId, reviewerName, rating, comment } = body;

    if (!businessId || !reviewerName || !rating || !comment) {
      return NextResponse.json({ success: false, error: "Vul asseblief alle velde in." }, { status: 400 });
    }

    const [newReview] = await db
      .insert(reviews)
      .values({
        businessId: Number(businessId),
        reviewerName: reviewerName.trim(),
        rating: Math.min(5, Math.max(1, Number(rating))),
        comment: comment.trim(),
      })
      .returning();

    // Update business review count and average
    const allReviews = await db.select().from(reviews).where(eq(reviews.businessId, Number(businessId)));
    const avg = allReviews.reduce((acc, r) => acc + r.rating, 0) / (allReviews.length || 1);

    await db
      .update(businesses)
      .set({
        reviewCount: sql`${businesses.reviewCount} + 1`,
        rating: avg.toFixed(1),
      })
      .where(eq(businesses.id, Number(businessId)));

    return NextResponse.json({ success: true, review: newReview }, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json({ success: false, error: "Kon nie resensie stoor nie" }, { status: 500 });
  }
}
