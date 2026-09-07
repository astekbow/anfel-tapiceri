import path from "path";
import { promises as fs } from "fs";
import crypto from "crypto";
import sharp from "sharp";

export const UPLOAD_DIR = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "./uploads");

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
 * Kthen URL-të publike (/uploads/...).
 */
export async function saveUpload(buffer: Buffer): Promise<SavedUpload> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const id = crypto.randomBytes(9).toString("hex");
  const mainName = `${id}.webp`;
  const thumbName = `${id}-thumb.webp`;

  const image = sharp(buffer, { failOn: "none" }).rotate();

  await image
    .clone()
    .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(path.join(UPLOAD_DIR, mainName));

  await image
    .clone()
    .resize({ width: 600, height: 600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 74 })
    .toFile(path.join(UPLOAD_DIR, thumbName));

  return { url: `/uploads/${mainName}`, thumbUrl: `/uploads/${thumbName}` };
}

/** Fshin nga disku një foto të ngarkuar (best-effort, nuk hedh gabim). */
export async function deleteUploadedFile(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith("/uploads/")) return;
  const name = path.basename(url);
  try {
    await fs.unlink(path.join(UPLOAD_DIR, name));
  } catch {
    // skedari mund të mos ekzistojë - s'është problem
  }
  // provo edhe thumbnail-in përkatës
  if (!name.endsWith("-thumb.webp")) {
    try {
      await fs.unlink(path.join(UPLOAD_DIR, name.replace(/\.webp$/, "-thumb.webp")));
    } catch {
      /* injoro */
    }
  }
}
