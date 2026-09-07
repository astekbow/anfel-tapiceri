import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { toPlainProduct } from "@/lib/types";
import ProductCard from "@/components/public/ProductCard";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: s["products.title"], description: s["products.intro"] };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ kategoria?: string; kerko?: string }>;
}) {
  const { kategoria, kerko } = await searchParams;
  const [s, categories] = await Promise.all([
    getSettings(),
    prisma.category.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  const activeCategory = kategoria ? categories.find((c) => c.slug === kategoria) : undefined;

  const productsRaw = await prisma.product.findMany({
    where: {
      published: true,
      category: { published: true },
      ...(activeCategory ? { categoryId: activeCategory.id } : {}),
      ...(kerko ? { title: { contains: kerko } } : {}),
    },
    include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  const products = productsRaw.map(toPlainProduct);

  const pillClass = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
      active
        ? "border-pine bg-pine text-ivory"
        : "border-seam bg-ivory text-mink hover:border-camel hover:text-walnut"
    }`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <h1 className="font-display text-4xl text-pine sm:text-[42px]">{s["products.title"]}</h1>
      <div className="stitch mt-4 w-16" />
      <p className="mt-4 max-w-2xl leading-relaxed text-mink">{s["products.intro"]}</p>

      <div className="mt-8 flex flex-wrap items-center gap-2.5">
        <Link href="/produktet" className={pillClass(!activeCategory)}>
          Të gjitha
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/produktet?kategoria=${category.slug}`}
            className={pillClass(activeCategory?.id === category.id)}
          >
            {category.name}
          </Link>
        ))}
      </div>

      <form method="GET" action="/produktet" className="mt-5 flex max-w-md gap-2">
        {activeCategory && <input type="hidden" name="kategoria" value={activeCategory.slug} />}
        <input
          type="search"
          name="kerko"
          defaultValue={kerko ?? ""}
          placeholder="Kërko produkt…"
          className="w-full rounded-full border border-seam bg-ivory px-5 py-2.5 text-[15px] outline-none placeholder:text-mink/60 focus:border-camel"
        />
        <button
          type="submit"
          className="rounded-full bg-pine px-5 py-2.5 text-sm font-semibold text-ivory transition-colors hover:bg-pine-deep"
        >
          Kërko
        </button>
      </form>

      {products.length === 0 ? (
        <div className="mt-14 rounded-2xl border border-seam bg-ivory p-10 text-center">
          <p className="font-display text-xl text-pine">Nuk u gjet asnjë produkt</p>
          <p className="mt-2 text-[15px] text-mink">
            Provoni një kategori tjetër, ose{" "}
            <Link href="/kontakt" className="font-semibold text-camel underline underline-offset-4">
              na kontaktoni
            </Link>{" "}
            për një porosi me masë.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              priceOnRequestLabel={s["products.priceOnRequest"]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
