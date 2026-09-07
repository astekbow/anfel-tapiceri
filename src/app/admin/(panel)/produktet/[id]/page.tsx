import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { toPlainProduct } from "@/lib/types";
import ProductForm from "@/components/admin/ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [categories, productRaw] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
    prisma.product.findUnique({
      where: { id },
      include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
    }),
  ]);

  if (!productRaw) notFound();
  const product = toPlainProduct(productRaw);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-pine">Edito produktin</h1>
        <a
          href={`/produktet/${product.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-camel hover:underline"
        >
          Shikoje në faqe
        </a>
      </div>
      <div className="mt-6">
        <ProductForm categories={categories} product={product} />
      </div>
    </div>
  );
}
