import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { saveUpload, isAllowedImageType, MAX_UPLOAD_BYTES } from "@/lib/uploads";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.adminId) {
    return NextResponse.json({ error: "I paautorizuar" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files").filter((f): f is File => f instanceof File);
    if (files.length === 0) {
      return NextResponse.json({ error: "Nuk u dërgua asnjë skedar" }, { status: 400 });
    }
    if (files.length > 20) {
      return NextResponse.json({ error: "Maksimumi 20 foto njëherësh" }, { status: 400 });
    }

    const saved = [];
    for (const file of files) {
      if (!isAllowedImageType(file.type)) {
        return NextResponse.json(
          { error: `"${file.name}" nuk është foto e vlefshme (JPG, PNG, WebP)` },
          { status: 400 }
        );
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        return NextResponse.json(
          { error: `"${file.name}" është shumë e madhe (max 15MB)` },
          { status: 400 }
        );
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      saved.push(await saveUpload(buffer));
    }

    return NextResponse.json({ files: saved });
  } catch (err) {
    console.error("upload:", err);
    return NextResponse.json(
      { error: "Ngarkimi dështoi. Provoni përsëri." },
      { status: 500 }
    );
  }
}
