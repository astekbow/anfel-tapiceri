"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { galleryItemSchema, type GalleryItemInput } from "@/lib/schemas";
import { deleteUploadedFile } from "@/lib/uploads";

export async function saveGalleryItem(
  input: GalleryItemInput
): Promise<{ ok: boolean; error?: string; id?: string }> {
  await requireAdmin();
  const parsed = galleryItemSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Të dhëna të pavlefshme" };
  }
  const data = parsed.data;

  try {
    if (data.id) {
      const existing = await prisma.galleryItem.findUnique({ where: { id: data.id } });
      if (!existing) return { ok: false, error: "Punimi nuk u gjet" };
      if (existing.imageUrl !== data.imageUrl) await deleteUploadedFile(existing.imageUrl);
      if (existing.beforeImageUrl && existing.beforeImageUrl !== data.beforeImageUrl) {
        await deleteUploadedFile(existing.beforeImageUrl);
      }
      await prisma.galleryItem.update({
        where: { id: data.id },
        data: {
          title: data.title || null,
          imageUrl: data.imageUrl,
          beforeImageUrl: data.beforeImageUrl || null,
          published: data.published,
        },
      });
      return { ok: true, id: data.id };
    }

    const last = await prisma.galleryItem.findFirst({ orderBy: { sortOrder: "desc" } });
    const created = await prisma.galleryItem.create({
      data: {
        title: data.title || null,
        imageUrl: data.imageUrl,
        beforeImageUrl: data.beforeImageUrl || null,
        published: data.published,
        sortOrder: (last?.sortOrder ?? 0) + 1,
      },
    });
    return { ok: true, id: created.id };
  } catch (err) {
    console.error("saveGalleryItem:", err);
    return { ok: false, error: "Ruajtja dështoi. Provoni përsëri." };
  }
}

export async function deleteGalleryItem(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  try {
    const item = await prisma.galleryItem.delete({ where: { id } });
    await deleteUploadedFile(item.imageUrl);
    await deleteUploadedFile(item.beforeImageUrl);
    return { ok: true };
  } catch (err) {
    console.error("deleteGalleryItem:", err);
    return { ok: false, error: "Fshirja dështoi. Provoni përsëri." };
  }
}

export async function moveGalleryItem(
  id: string,
  direction: "up" | "down"
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  try {
    const all = await prisma.galleryItem.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    const index = all.findIndex((g) => g.id === id);
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || swapWith < 0 || swapWith >= all.length) return { ok: true };
    const reordered = [...all];
    [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];
    await prisma.$transaction(
      reordered.map((g, i) =>
        prisma.galleryItem.update({ where: { id: g.id }, data: { sortOrder: i } })
      )
    );
    return { ok: true };
  } catch {
    return { ok: false, error: "Rirenditja dështoi" };
  }
}
