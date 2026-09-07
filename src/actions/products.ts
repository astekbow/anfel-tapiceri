"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { productSchema, type ProductInput } from "@/lib/schemas";
import { slugify, uniqueSlug } from "@/lib/slug";
import { deleteUploadedFile } from "@/lib/uploads";

export interface SaveProductResult {
  ok: boolean;
  error?: string;
  id?: string;
  slug?: string;
}

export async function saveProduct(input: ProductInput): Promise<SaveProductResult> {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Të dhëna të pavlefshme" };
  }
  const data = parsed.data;

  try {
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) return { ok: false, error: "Kategoria e zgjedhur nuk ekziston" };

    const existing = data.id
      ? await prisma.product.findUnique({ where: { id: data.id }, include: { images: true } })
      : null;
    if (data.id && !existing) return { ok: false, error: "Produkti nuk u gjet" };

    // slug: rigjenerohet vetëm kur krijohet ose kur ndryshon titulli
    let slug = existing?.slug ?? "";
    if (!existing || slugify(data.title) !== slugify(existing.title)) {
      slug = await uniqueSlug(data.title, async (s) => {
        const found = await prisma.product.findUnique({ where: { slug: s } });
        return Boolean(found && found.id !== existing?.id);
      });
    }

    const fields = {
      title: data.title,
      slug,
      description: data.description,
      price: data.price ?? null,
      priceNote: data.priceNote || null,
      categoryId: data.categoryId,
      featured: data.featured,
      published: data.published,
      dimensions: data.dimensions || null,
      materials: data.materials || null,
    };

    const product = existing
      ? await prisma.product.update({ where: { id: existing.id }, data: fields })
      : await prisma.product.create({ data: fields });

    // sinkronizo fotot: fshi ato që u hoqën, rikrijo listën me radhën e re
    const newUrls = new Set(data.images.map((img) => img.url));
    const removed = (existing?.images ?? []).filter((img) => !newUrls.has(img.url));
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    if (data.images.length > 0) {
      await prisma.productImage.createMany({
        data: data.images.map((img, index) => ({
          productId: product.id,
          url: img.url,
          thumbUrl: img.thumbUrl ?? null,
          alt: img.alt || data.title,
          sortOrder: index,
        })),
      });
    }
    for (const img of removed) await deleteUploadedFile(img.url);

    return { ok: true, id: product.id, slug: product.slug };
  } catch (err) {
    console.error("saveProduct:", err);
    return { ok: false, error: "Ndodhi një gabim gjatë ruajtjes. Provoni përsëri." };
  }
}

export async function deleteProduct(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  try {
    const product = await prisma.product.findUnique({ where: { id }, include: { images: true } });
    if (!product) return { ok: false, error: "Produkti nuk u gjet" };
    await prisma.product.delete({ where: { id } });
    for (const img of product.images) await deleteUploadedFile(img.url);
    return { ok: true };
  } catch (err) {
    console.error("deleteProduct:", err);
    return { ok: false, error: "Fshirja dështoi. Provoni përsëri." };
  }
}

export async function toggleProductFlag(
  id: string,
  flag: "published" | "featured",
  value: boolean
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  try {
    await prisma.product.update({ where: { id }, data: { [flag]: value } });
    return { ok: true };
  } catch {
    return { ok: false, error: "Ndryshimi dështoi" };
  }
}
