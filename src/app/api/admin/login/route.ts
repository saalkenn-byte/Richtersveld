import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { seedDatabase } from "@/db/seed";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    await seedDatabase();
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Verskaf asseblief 'n gebruikersnaam en wagwoord." },
        { status: 400 }
      );
    }

    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();
    const envAdminPass = process.env.ADMIN_PASSWORD || "richtersveld2026";

    const users = await db.select().from(adminUsers).where(eq(adminUsers.username, trimmedUser));

    let authenticatedUser: { id: number; username: string; fullName: string; role: string | null } | null = null;

    if (users.length === 0) {
      if (trimmedUser === "admin" && trimmedPass === envAdminPass) {
        authenticatedUser = {
          id: 1,
          username: "admin",
          fullName: "Richtersveld Gemeenskap Admin Kantoor",
          role: "superadmin",
        };
      }
    } else {
      const admin = users[0];
      if (admin.passwordHash === trimmedPass || (trimmedUser === "admin" && trimmedPass === envAdminPass)) {
        await db.update(adminUsers).set({ lastLogin: new Date() }).where(eq(adminUsers.id, admin.id));
        authenticatedUser = {
          id: admin.id,
          username: admin.username,
          fullName: admin.fullName,
          role: admin.role,
        };
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json({ success: false, error: "Ongeldige gebruikersnaam of wagwoord." }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      user: authenticatedUser,
    });

    response.cookies.set("richtersveld_admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 ure
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ success: false, error: "Inlogfout" }, { status: 500 });
  }
}
