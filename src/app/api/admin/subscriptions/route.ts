import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptionPayments, businesses } from "@/db/schema";
import { eq } from "drizzle-orm";

function isAdminAuthenticated(request: NextRequest): boolean {
  const sessionCookie = request.cookies.get("richtersveld_admin_session");
  return Boolean(sessionCookie && sessionCookie.value === "authenticated");
}

export async function GET(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ success: false, error: "Ongemagtigde toegang" }, { status: 401 });
  }

  try {
    const list = await db.select().from(subscriptionPayments);
    return NextResponse.json({ success: true, payments: list });
  } catch (error) {
    console.error("Fetch payments error:", error);
    return NextResponse.json({ success: false, error: "Kon nie betalings laai nie" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ success: false, error: "Ongemagtigde toegang" }, { status: 401 });
  }

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
    const parsedMonths = Math.max(1, Number(monthsToExtend) || 1);

    if (Number.isNaN(bId) || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Ongeldige besigheids-ID of bedrag." },
        { status: 400 }
      );
    }

    // 1. Teken betaling aan in grootboek
    const [newPayment] = await db
      .insert(subscriptionPayments)
      .values({
        businessId: bId,
        amount: parsedAmount,
        period: period.trim().slice(0, 60),
        paymentMethod: paymentMethod.trim().slice(0, 60),
        reference: reference?.trim().slice(0, 100) || null,
        status: "bevestig",
        notes: notes?.trim().slice(0, 300) || null,
        recordedBy: recordedBy?.trim().slice(0, 60) || "Admin",
      })
      .returning();

    // 2. Verleng intekening vanaf huidige vervaldatum (indien nog in die toekoms) of vandag
    const bizList = await db.select().from(businesses).where(eq(businesses.id, bId));
    let baseDate = new Date();
    if (bizList.length > 0 && bizList[0].subscriptionPaidUntil) {
      const existingDate = new Date(bizList[0].subscriptionPaidUntil);
      if (existingDate > baseDate) {
        baseDate = existingDate;
      }
    }

    const newExpiry = new Date(baseDate);
    newExpiry.setDate(newExpiry.getDate() + parsedMonths * 30);

    await db
      .update(businesses)
      .set({
        isVerified: true,
        verificationStatus: "goedgekeur",
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
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ success: false, error: "Ongemagtigde toegang" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { businessId, subscriptionStatus, subscriptionPlan, monthlyFee, subscriptionPaidUntil } = body;

    if (!businessId) {
      return NextResponse.json({ success: false, error: "Besigheids ID word vereis" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (subscriptionStatus) {
      updateData.subscriptionStatus = subscriptionStatus;
      // Versteek besigheid outomaties as admin dit op 'verval' stel
      if (subscriptionStatus === "verval") {
        updateData.isVerified = false;
      }
    }
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
