import type { Category, Product, ProductImage } from "@prisma/client";

export interface PlainImage {
  id: string;
  url: string;
  thumbUrl: string | null;
  alt: string;
  sortOrder: number;
}

export interface PlainProduct {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number | null;
  priceNote: string | null;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  dimensions: string | null;
  materials: string | null;
  createdAt: string;
  images: PlainImage[];
}

type ProductWithRelations = Product & { category: Category; images: ProductImage[] };

/** Kthen produktin e Prisma-s (me Decimal) në objekt të thjeshtë të serializueshëm. */
export function toPlainProduct(product: ProductWithRelations): PlainProduct {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    price: product.price == null ? null : Number(product.price),
    priceNote: product.priceNote,
    categoryId: product.categoryId,
    categoryName: product.category.name,
    categorySlug: product.category.slug,
    featured: product.featured,
    published: product.published,
    sortOrder: product.sortOrder,
    dimensions: product.dimensions,
    materials: product.materials,
    createdAt: product.createdAt.toISOString(),
    images: [...product.images]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((img) => ({
        id: img.id,
        url: img.url,
        thumbUrl: img.thumbUrl,
        alt: img.alt,
        sortOrder: img.sortOrder,
      })),
  };
}
