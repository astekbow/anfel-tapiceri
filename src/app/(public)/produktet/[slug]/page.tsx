import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { toPlainProduct } from "@/lib/types";
import { formatPrice, siteUrl } from "@/lib/format";
import { whatsappHref } from "@/lib/whatsapp";
import ProductGallery from "@/components/public/ProductGallery";
import ProductCard from "@/components/public/ProductCard";
import ContactForm from "@/components/public/ContactForm";

export const dynamic = "force-dynamic";

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product || !product.published) return {};
  const description = product.description.slice(0, 160);
  const image = product.images[0]?.url;
  return {
    title: product.title,
    description,
    openGraph: {
      title: product.title,
      description,
      images: image ? [siteUrl(image)] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [s, productRaw] = await Promise.all([getSettings(), getProduct(slug)]);
  if (!productRaw || !productRaw.published) notFound();

  const product = toPlainProduct(productRaw);
  const price = formatPrice(product.price);
  const whatsappPhone = s["contact.whatsapp"] || s["contact.phone"];
  const whatsappMessage = `Përshëndetje! Kam interes për "${product.title}": ${siteUrl(
    `/produktet/${product.slug}`
  )}`;

  const relatedRaw = await prisma.product.findMany({
    where: {
      published: true,
      categoryId: product.categoryId,
      id: { not: product.id },
      category: { published: true },
    },
    include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: 3,
  });
  const related = relatedRaw.map(toPlainProduct);

  const paragraphs = product.description.split(/\n{2,}/).filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      <nav className="text-sm text-mink">
        <Link href="/produktet" className="hover:text-pine">
          {s["products.title"]}
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/produktet?kategoria=${product.categorySlug}`} className="hover:text-pine">
          {product.categoryName}
        </Link>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[7fr_5fr]">
        <ProductGallery images={product.images} title={product.title} />

        <div>
          <h1 className="font-display text-3xl leading-tight text-pine sm:text-4xl">
            {product.title}
          </h1>
          <p className="mt-4 text-xl">
            {price ? (
              <>
                <span className="font-semibold text-camel">{price}</span>
                {product.priceNote && (
                  <span className="ml-2 text-base text-mink">· {product.priceNote}</span>
                )}
              </>
            ) : (
              <span className="italic text-mink">
                {product.priceNote || s["products.priceOnRequest"]}
              </span>
            )}
          </p>
          <div className="stitch mt-5 w-16" />

          <div className="prose-anfel mt-5 text-[15px] text-walnut/90">
            {paragraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          {(product.dimensions || product.materials) && (
            <dl className="mt-6 space-y-3 rounded-2xl border border-seam bg-ivory p-5 text-[15px]">
              {product.dimensions && (
                <div className="flex gap-3">
                  <dt className="w-28 shrink-0 font-medium text-mink">Përmasat</dt>
                  <dd>{product.dimensions}</dd>
                </div>
              )}
              {product.materials && (
                <div className="flex gap-3">
                  <dt className="w-28 shrink-0 font-medium text-mink">Materialet</dt>
                  <dd>{product.materials}</dd>
                </div>
              )}
            </dl>
          )}

          {whatsappPhone && (
            <a
              href={whatsappHref(whatsappPhone, whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 flex w-full items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-6 py-3.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              <svg viewBox="0 0 32 32" className="h-5 w-5 fill-white">
                <path d="M16.004 3.2c-7.065 0-12.8 5.735-12.8 12.8 0 2.26.59 4.468 1.712 6.416L3.2 28.8l6.56-1.68a12.74 12.74 0 0 0 6.24 1.616h.004c7.065 0 12.796-5.735 12.796-12.8 0-3.42-1.33-6.633-3.748-9.052A12.72 12.72 0 0 0 16.004 3.2z" />
              </svg>
              {s["products.askLabel"]}
            </a>
          )}

          <details className="group mt-4 rounded-2xl border border-seam bg-ivory">
            <summary className="cursor-pointer select-none px-5 py-4 font-display text-lg text-pine [&::-webkit-details-marker]:hidden">
              {s["products.formTitle"]}
            </summary>
            <div className="border-t border-seam px-5 py-5">
              <ContactForm
                productId={product.id}
                defaultMessage={`Përshëndetje, kam interes për "${product.title}".`}
              />
            </div>
          </details>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16 border-t border-seam pt-12 md:mt-20">
          <h2 className="font-display text-2xl text-pine sm:text-3xl">
            {s["products.relatedTitle"]}
          </h2>
          <div className="stitch mt-4 w-16" />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                product={relatedProduct}
                priceOnRequestLabel={s["products.priceOnRequest"]}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
