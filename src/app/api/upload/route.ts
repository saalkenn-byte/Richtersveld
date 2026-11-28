import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "Geen lêer gekies nie" }, { status: 400 });
    }

    // Beperk lêergrootte tot 5MB en laat slegs prente toe
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "Slegs prent-lêers (JPG, PNG, WebP) word toegelaat" }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "Prent is te groot (maksimum 5MB)" }, { status: 400 });
    }

    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("richtersveld-images")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json({ success: false, error: "Kon nie foto oplaai nie" }, { status: 500 });
    }

    const { data } = supabase.storage.from("richtersveld-images").getPublicUrl(fileName);

    return NextResponse.json({ success: true, imageUrl: data.publicUrl });
  } catch (error) {
    console.error("Upload route error:", error);
    return NextResponse.json({ success: false, error: "Bedienersfout met foto-oplaai" }, { status: 500 });
  }
}

