import Link from "next/link";
import { prisma } from "@/lib/db";
import ProductsList from "@/components/admin/ProductsList";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ kerko?: string; kategoria?: string }>;
}) {
  const { kerko, kategoria } = await searchParams;

  const [categories, productsRaw] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.product.findMany({
      where: {
        ...(kerko ? { title: { contains: kerko } } : {}),
        ...(kategoria ? { category: { slug: kategoria } } : {}),
      },
      include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const products = productsRaw.map((product) => ({
    id: product.id,
    title: product.title,
    slug: product.slug,
    categoryName: product.category.name,
    price: product.price == null ? null : Number(product.price),
    priceNote: product.priceNote,
    featured: product.featured,
    published: product.published,
    thumbUrl: product.images[0]?.thumbUrl || product.images[0]?.url || null,
  }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-pine">Produktet</h1>
        <Link
          href="/admin/produktet/i-ri"
          className="rounded-full bg-pine px-5 py-2.5 text-sm font-semibold text-ivory transition-colors hover:bg-pine-deep"
        >
          + Shto produkt
        </Link>
      </div>

      <form method="GET" className="mt-6 flex flex-wrap gap-2.5">
        <input
          type="search"
          name="kerko"
          defaultValue={kerko ?? ""}
          placeholder="Kërko sipas titullit…"
          className="w-full max-w-xs rounded-full border border-seam bg-ivory px-4 py-2.5 text-sm outline-none focus:border-camel"
        />
        <select
          name="kategoria"
          defaultValue={kategoria ?? ""}
          className="rounded-full border border-seam bg-ivory px-4 py-2.5 text-sm outline-none focus:border-camel"
        >
          <option value="">Të gjitha kategoritë</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-full border border-seam bg-ivory px-5 py-2.5 text-sm font-semibold text-walnut transition-colors hover:border-camel"
        >
          Filtro
        </button>
      </form>

      <ProductsList products={products} />
    </div>
  );
}
