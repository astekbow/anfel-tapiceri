import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { siteUrl } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();

  let products: { slug: string; updatedAt: Date }[] = [];
  try {
    products = await prisma.product.findMany({
      where: { published: true, category: { published: true } },
      select: { slug: true, updatedAt: true },
    });
  } catch {
    // databaza mund të mos jetë gati — sitemap-i minimal mjafton
  }

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    ...["/produktet", "/galeria", "/rreth-nesh", "/kontakt"].map((path) => ({
      url: `${base}${path}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: `${base}/produktet/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
