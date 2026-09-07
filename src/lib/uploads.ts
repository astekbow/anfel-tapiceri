import path from "path";
import { promises as fs } from "fs";
import crypto from "crypto";
import sharp from "sharp";

export const UPLOAD_DIR = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "./uploads");

/** Në Vercel (ose çdo host pa disk të përhershëm) fotot ruhen në Vercel Blob. */
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

/**
 * Optimizon dhe ruan një imazh: max ~1920px, WebP, plus thumbnail.
 * Ruhet në disk lokal, ose në Vercel Blob kur ekziston BLOB_READ_WRITE_TOKEN.
 */
export async function saveUpload(buffer: Buffer): Promise<SavedUpload> {
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

/** Fshin nga disku ose nga Vercel Blob një foto të ngarkuar (best-effort, nuk hedh gabim). */
export async function deleteUploadedFile(url: string | null | undefined): Promise<void> {
  if (!url) return;

  // foto në Vercel Blob (URL absolute)
  if (url.startsWith("https://") && url.includes("blob.vercel-storage.com")) {
    if (!BLOB_ENABLED) return;
    try {
      const { del } = await import("@vercel/blob");
      await del(url);
      if (!url.endsWith("-thumb.webp")) {
        await del(url.replace(/\.webp$/, "-thumb.webp")).catch(() => {});
      }
    } catch {
      // injoro - fshirja është best-effort
    }
    return;
  }

  // foto në disk lokal
  if (!url.startsWith("/uploads/")) return;
  const name = path.basename(url);
  try {
    await fs.unlink(path.join(UPLOAD_DIR, name));
  } catch {
    // skedari mund të mos ekzistojë - s'është problem
  }
  if (!name.endsWith("-thumb.webp")) {
    try {
      await fs.unlink(path.join(UPLOAD_DIR, name.replace(/\.webp$/, "-thumb.webp")));
    } catch {
      /* injoro */
    }
  }
}
