import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { communityNotices } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db
      .select()
      .from(communityNotices)
      .orderBy(desc(communityNotices.isUrgent), desc(communityNotices.createdAt));
    return NextResponse.json({ success: true, notices: list });
  } catch (error) {
    console.error("Error fetching notices:", error);
    return NextResponse.json({ success: false, error: "Kon nie kennisgewings laai nie" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, category, town, content, date, isUrgent, author, contactPhone } = body;

    if (!title || !category || !town || !content || !author) {
      return NextResponse.json({ success: false, error: "Vul asseblief alle vereiste velde in." }, { status: 400 });
    }

    const [newNotice] = await db
      .insert(communityNotices)
      .values({
        title: title.trim(),
        category,
        town,
        content: content.trim(),
        date: date || new Date().toLocaleDateString("af-ZA", { day: "numeric", month: "long", year: "numeric" }),
        isUrgent: Boolean(isUrgent),
        author: author.trim(),
        contactPhone: contactPhone?.trim() || null,
      })
      .returning();

    return NextResponse.json({ success: true, notice: newNotice }, { status: 201 });
  } catch (error) {
    console.error("Error creating notice:", error);
    return NextResponse.json({ success: false, error: "Fout met oplaai van kennisgewing" }, { status: 500 });
  }
}
