export interface UploadedFile {
  url: string;
  thumbUrl: string;
}

/**
 * Zvogëlon foton në browser para ngarkimit (max 1920px, WebP).
 * E domosdoshme për hosting serverless (Vercel pranon max ~4.5MB për kërkesë)
 * dhe e bën ngarkimin shumë më të shpejtë nga telefoni.
 */
async function compressImage(file: File): Promise<Blob> {
  try {
    if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, 1920 / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.85)
    );
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

/** Ngarkon fotot një nga një (kërkesa të vogla, funksionon edhe në serverless). */
export async function uploadImages(files: File[] | FileList): Promise<UploadedFile[]> {
  const results: UploadedFile[] = [];

  for (const file of Array.from(files)) {
    const compressed = await compressImage(file);
    const formData = new FormData();
    formData.append("files", compressed, file.name.replace(/\.\w+$/, "") + ".webp");

    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error ?? `Ngarkimi i "${file.name}" dështoi. Provoni përsëri.`);
    }
    results.push(...(data.files as UploadedFile[]));
  }

  return results;
}
