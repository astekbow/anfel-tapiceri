import path from "path";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import { UPLOAD_DIR } from "@/lib/uploads";

export const runtime = "nodejs";

const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: parts } = await params;
  const relative = parts.join("/");
  const filePath = path.resolve(UPLOAD_DIR, relative);

  // mos lejo dalje jashtë folderit të uploads
  if (!filePath.startsWith(UPLOAD_DIR)) {
    return new NextResponse("Kërkesë e pavlefshme", { status: 400 });
  }

  try {
    const data = await fs.readFile(filePath);
    const contentType = CONTENT_TYPES[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Nuk u gjet", { status: 404 });
  }
}
