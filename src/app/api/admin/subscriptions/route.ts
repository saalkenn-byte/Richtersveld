import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptionPayments, businesses } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(subscriptionPayments);
    return NextResponse.json({ success: true, payments: list });
  } catch (error) {
    console.error("Fetch payments error:", error);
    return NextResponse.json({ success: false, error: "Kon nie betalings laai nie" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessId,
      amount,
      period,
      paymentMethod,
      reference,
      notes,
      recordedBy,
      monthsToExtend = 1,
    } = body;

    if (!businessId || !amount || !period || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: "Vul asseblief Besigheid, Bedrag, Tydperk en Betaalmetode in." },
        { status: 400 }
      );
    }

    const bId = Number(businessId);
    const parsedAmount = Number(amount);

    // 1. Record payment in ledger
    const [newPayment] = await db
      .insert(subscriptionPayments)
      .values({
        businessId: bId,
        amount: parsedAmount,
        period: period.trim(),
        paymentMethod: paymentMethod.trim(),
        reference: reference?.trim() || null,
        status: "bevestig",
        notes: notes?.trim() || null,
        recordedBy: recordedBy?.trim() || "Admin",
      })
      .returning();

    // 2. Extend subscription paid date for business
    const bizList = await db.select().from(businesses).where(eq(businesses.id, bId));
    let baseDate = new Date();
    if (bizList.length > 0 && bizList[0].subscriptionPaidUntil) {
      const existingDate = new Date(bizList[0].subscriptionPaidUntil);
      if (existingDate > baseDate) {
        baseDate = existingDate;
      }
    }

    const newExpiry = new Date(baseDate);
    newExpiry.setDate(newExpiry.getDate() + Number(monthsToExtend) * 30);

    await db
      .update(businesses)
      .set({
        subscriptionStatus: "aktief",
        subscriptionPaidUntil: newExpiry,
        paymentReference: reference?.trim() || bizList[0]?.paymentReference || null,
      })
      .where(eq(businesses.id, bId));

    return NextResponse.json({
      success: true,
      payment: newPayment,
      newExpiry: newExpiry.toISOString(),
      message: `Betaling van R${parsedAmount} aangeteken en intekening verleng tot ${newExpiry.toLocaleDateString("af-ZA")}`,
    });
  } catch (error) {
    console.error("Record subscription payment error:", error);
    return NextResponse.json({ success: false, error: "Fout met aantekening van betaling" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId, subscriptionStatus, subscriptionPlan, monthlyFee, subscriptionPaidUntil } = body;

    if (!businessId) {
      return NextResponse.json({ success: false, error: "Besigheids ID word vereis" }, { status: 400 });
    }

    const updateData: Record<string, any> = {};
    if (subscriptionStatus) updateData.subscriptionStatus = subscriptionStatus;
    if (subscriptionPlan) updateData.subscriptionPlan = subscriptionPlan;
    if (monthlyFee !== undefined) updateData.monthlyFee = Number(monthlyFee);
    if (subscriptionPaidUntil) updateData.subscriptionPaidUntil = new Date(subscriptionPaidUntil);

    await db.update(businesses).set(updateData).where(eq(businesses.id, Number(businessId)));

    return NextResponse.json({ success: true, message: "Intekeningbesonderhede opgedateer" });
  } catch (error) {
    console.error("Update subscription error:", error);
    return NextResponse.json({ success: false, error: "Kon nie intekening opdateer nie" }, { status: 500 });
  }
}
