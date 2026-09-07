"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { categorySchema, type CategoryInput } from "@/lib/schemas";
import { uniqueSlug } from "@/lib/slug";
import { deleteUploadedFile } from "@/lib/uploads";

export async function saveCategory(
  input: CategoryInput
): Promise<{ ok: boolean; error?: string; id?: string }> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Të dhëna të pavlefshme" };
  }
  const data = parsed.data;

  try {
    if (data.id) {
      const existing = await prisma.category.findUnique({ where: { id: data.id } });
      if (!existing) return { ok: false, error: "Kategoria nuk u gjet" };
      if (existing.image && existing.image !== data.image) {
        await deleteUploadedFile(existing.image);
      }
      await prisma.category.update({
        where: { id: data.id },
        data: {
          name: data.name,
          description: data.description || null,
          image: data.image || null,
          published: data.published,
        },
      });
      return { ok: true, id: data.id };
    }

    const slug = await uniqueSlug(data.name, async (s) =>
      Boolean(await prisma.category.findUnique({ where: { slug: s } }))
    );
    const last = await prisma.category.findFirst({ orderBy: { sortOrder: "desc" } });
    const created = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        image: data.image || null,
        published: data.published,
        sortOrder: (last?.sortOrder ?? 0) + 1,
      },
    });
    return { ok: true, id: created.id };
  } catch (err) {
    console.error("saveCategory:", err);
    return { ok: false, error: "Ruajtja dështoi. Provoni përsëri." };
  }
}

export async function deleteCategory(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  try {
    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) {
      return {
        ok: false,
        error: `Kategoria ka ${count} produkte — zhvendosini ose fshini ato më parë.`,
      };
    }
    const category = await prisma.category.delete({ where: { id } });
    await deleteUploadedFile(category.image);
    return { ok: true };
  } catch (err) {
    console.error("deleteCategory:", err);
    return { ok: false, error: "Fshirja dështoi. Provoni përsëri." };
  }
}

export async function moveCategory(
  id: string,
  direction: "up" | "down"
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  try {
    const all = await prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
    const index = all.findIndex((c) => c.id === id);
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || swapWith < 0 || swapWith >= all.length) return { ok: true };
    // rinumëro të gjitha që radha të jetë gjithmonë e qëndrueshme
    const reordered = [...all];
    [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];
    await prisma.$transaction(
      reordered.map((c, i) =>
        prisma.category.update({ where: { id: c.id }, data: { sortOrder: i } })
      )
    );
    return { ok: true };
  } catch {
    return { ok: false, error: "Rirenditja dështoi" };
  }
}
