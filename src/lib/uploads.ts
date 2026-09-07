import path from "path";
import { promises as fs } from "fs";
import crypto from "crypto";
import sharp from "sharp";

export const UPLOAD_DIR = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "./uploads");

/**
 * Ku ruhen fotot e reja, sipas konfigurimit:
 * 1. Supabase Storage (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY) - e nevojshme në Vercel
 * 2. Vercel Blob (BLOB_READ_WRITE_TOKEN)
 * 3. Disku lokal (zhvillim / VPS)
 */
const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SUPABASE_ENABLED = Boolean(SUPABASE_URL && SUPABASE_KEY);
const BLOB_ENABLED = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

export function isAllowedImageType(mime: string): boolean {
  return ALLOWED_TYPES.has(mime);
}

export interface SavedUpload {
  url: string;
  thumbUrl: string;
}

async function supabasePut(name: string, buffer: Buffer): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/uploads/${name}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      apikey: SUPABASE_KEY,
      "Content-Type": "image/webp",
      "cache-control": "31536000",
      "x-upsert": "true",
    },
    body: new Uint8Array(buffer),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Supabase Storage ktheu ${res.status}: ${text.slice(0, 200)}`);
  }
  return `${SUPABASE_URL}/storage/v1/object/public/uploads/${name}`;
}

/**
 * Optimizon dhe ruan një imazh: max ~1920px, WebP, plus thumbnail.
 */
export async function saveUpload(buffer: Buffer): Promise<SavedUpload> {
  // Në hosting serverless (Vercel) disku është vetëm-lexim - duhet një storage në cloud
  if (process.env.VERCEL && !SUPABASE_ENABLED && !BLOB_ENABLED) {
    throw new Error(
      "Serveri s'ka ku t'i ruajë fotot: shtoni SUPABASE_URL dhe SUPABASE_SERVICE_ROLE_KEY te Vercel → Settings → Environment Variables dhe bëni Redeploy."
    );
  }

  const id = crypto.randomBytes(9).toString("hex");
  const mainName = `${id}.webp`;
  const thumbName = `${id}-thumb.webp`;

  const image = sharp(buffer, { failOn: "none" }).rotate();
  const mainBuffer = await image
    .clone()
    .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  const thumbBuffer = await image
    .clone()
    .resize({ width: 600, height: 600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 74 })
    .toBuffer();

  if (SUPABASE_ENABLED) {
    const url = await supabasePut(mainName, mainBuffer);
    const thumbUrl = await supabasePut(thumbName, thumbBuffer);
    return { url, thumbUrl };
  }

  if (BLOB_ENABLED) {
    const { put } = await import("@vercel/blob");
    const options = {
      access: "public" as const,
      contentType: "image/webp",
      addRandomSuffix: false,
      cacheControlMaxAge: 31536000,
    };
    const main = await put(`uploads/${mainName}`, mainBuffer, options);
    const thumb = await put(`uploads/${thumbName}`, thumbBuffer, options);
    return { url: main.url, thumbUrl: thumb.url };
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, mainName), mainBuffer);
  await fs.writeFile(path.join(UPLOAD_DIR, thumbName), thumbBuffer);
  return { url: `/uploads/${mainName}`, thumbUrl: `/uploads/${thumbName}` };
}

/** Fshin një foto të ngarkuar nga vendi ku ruhet (best-effort, nuk hedh gabim). */
export async function deleteUploadedFile(url: string | null | undefined): Promise<void> {
  if (!url) return;

  // foto në Supabase Storage
  if (SUPABASE_ENABLED && url.startsWith(`${SUPABASE_URL}/storage/v1/object/public/uploads/`)) {
    const name = url.split("/uploads/").pop();
    if (!name) return;
    const remove = (fileName: string) =>
      fetch(`${SUPABASE_URL}/storage/v1/object/uploads/${fileName}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${SUPABASE_KEY}`, apikey: SUPABASE_KEY },
      }).catch(() => undefined);
    await remove(name);
    if (!name.endsWith("-thumb.webp")) {
      await remove(name.replace(/\.webp$/, "-thumb.webp"));
    }
    return;
  }

  // foto në Vercel Blob
  if (url.startsWith("https://") && url.includes("blob.vercel-storage.com")) {
    if (!BLOB_ENABLED) return;
    try {
      const { del } = await import("@vercel/blob");
      await del(url);
      if (!url.endsWith("-thumb.webp")) {
        await del(url.replace(/\.webp$/, "-thumb.webp")).catch(() => {});
      }
    } catch {
      /* injoro */
    }
    return;
  }

  // foto në disk lokal
  if (!url.startsWith("/uploads/")) return;
  const name = path.basename(url);
  try {
    await fs.unlink(path.join(UPLOAD_DIR, name));
  } catch {
    /* skedari mund të mos ekzistojë */
  }
  if (!name.endsWith("-thumb.webp")) {
    try {
      await fs.unlink(path.join(UPLOAD_DIR, name.replace(/\.webp$/, "-thumb.webp")));
    } catch {
      /* injoro */
    }
  }
}
