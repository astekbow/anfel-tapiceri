import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { toPlainProduct } from "@/lib/types";
import { whatsappHref } from "@/lib/whatsapp";
import SectionHeading from "@/components/public/SectionHeading";
import ProductCard from "@/components/public/ProductCard";
import CategoryCard from "@/components/public/CategoryCard";
import ServiceIcon, { type ServiceIconName } from "@/components/public/ServiceIcon";

export const dynamic = "force-dynamic";

const serviceIcons: ServiceIconName[] = ["custom", "reupholster", "sofa", "bed"];

export default async function HomePage() {
  const [s, categories, featuredRaw, gallery] = await Promise.all([
    getSettings(),
    prisma.category.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      take: 6,
      include: { _count: { select: { products: { where: { published: true } } } } },
    }),
    prisma.product.findMany({
      where: { featured: true, published: true, category: { published: true } },
      include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 6,
    }),
    prisma.galleryItem.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 8,
    }),
  ]);
  const featured = featuredRaw.map(toPlainProduct);
  const whatsappPhone = s["contact.whatsapp"] || s["contact.phone"];
  const trust = [s["value.1.title"], s["value.2.title"], s["value.3.title"]].filter(Boolean);
  const processSteps = [1, 2, 3]
    .map((i) => ({ title: s[`process.${i}.title`], text: s[`process.${i}.text`] }))
    .filter((step) => step.title);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-pine-deep">
        <div className="absolute inset-0">
          {s["hero.image"] && (
            <Image
              src={s["hero.image"]}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-pine-deep/95 via-pine-deep/65 to-pine-deep/25" />
        </div>
        <div className="relative mx-auto flex min-h-[540px] max-w-6xl flex-col justify-center px-4 py-20 sm:px-6 md:min-h-[620px]">
          <div className="max-w-xl">
            <h1 className="font-display text-4xl leading-[1.08] text-ivory sm:text-5xl md:text-[54px]">
              {s["hero.title"]}
            </h1>
            <div className="stitch-light mt-6 w-20" />
            <p className="mt-6 text-lg leading-relaxed text-linen/85">{s["hero.subtitle"]}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/produktet"
                className="rounded-full bg-camel px-7 py-3.5 text-[15px] font-semibold text-walnut transition-colors hover:bg-camel-soft"
              >
                {s["hero.cta1"]}
              </Link>
              <Link
                href="/kontakt"
                className="rounded-full border border-linen/50 px-7 py-3.5 text-[15px] font-semibold text-linen transition-colors hover:bg-linen/10"
              >
                {s["hero.cta2"]}
              </Link>
            </div>
            {trust.length > 0 && (
              <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-linen/75">
                {trust.map((item, i) => (
                  <span key={item} className="flex items-center gap-3">
                    {i > 0 && <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-camel/80" />}
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      <div className="stitch opacity-60" />

      {/* Kategoritë */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <SectionHeading title={s["home.categories.title"]} text={s["home.categories.text"]} />
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                name={category.name}
                slug={category.slug}
                image={category.image}
                count={category._count.products}
              />
            ))}
          </div>
        </section>
      )}

      {/* Produkte të zgjedhura */}
      {featured.length > 0 && (
        <section className="border-y border-seam bg-ivory/60">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading title={s["home.featured.title"]} text={s["home.featured.text"]} />
              <Link
                href="/produktet"
                className="text-[15px] font-semibold text-camel underline decoration-camel/40 underline-offset-4 hover:decoration-camel"
              >
                {s["header.menu.products"]}
              </Link>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priceOnRequestLabel={s["products.priceOnRequest"]}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Shërbimet */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <SectionHeading title={s["home.services.title"]} text={s["home.services.text"]} />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {serviceIcons.map((icon, i) => (
            <div key={icon} className="rounded-2xl border border-seam bg-ivory p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-linen text-camel">
                <ServiceIcon name={icon} className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-xl text-pine">{s[`service.${i + 1}.title`]}</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-mink">
                {s[`service.${i + 1}.text`]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Si punojmë */}
      {processSteps.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 md:pb-24">
          <div className="border-t border-seam pt-14 md:pt-20">
            <SectionHeading title={s["home.process.title"]} text={s["home.process.text"]} />
            <ol className="mt-10 grid gap-9 sm:grid-cols-3">
              {processSteps.map((step, i) => (
                <li key={i}>
                  <span className="font-display text-[44px] italic leading-none text-camel">
                    {i + 1}.
                  </span>
                  <div className="stitch mt-4 w-10" />
                  <h3 className="mt-4 font-display text-xl text-pine">{step.title}</h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-mink">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Rreth nesh - shkurt */}
      <section className="border-y border-seam bg-ivory/60">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-seam">
            {s["home.about.image"] && (
              <Image
                src={s["home.about.image"]}
                alt={s["home.about.title"]}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            )}
            <div className="pointer-events-none absolute inset-3 rounded-xl border-2 border-dashed border-ivory/50" />
          </div>
          <div>
            <SectionHeading title={s["home.about.title"]} />
            <p className="mt-5 leading-relaxed text-mink">{s["home.about.text"]}</p>
            <Link
              href="/rreth-nesh"
              className="mt-6 inline-block text-[15px] font-semibold text-camel underline decoration-camel/40 underline-offset-4 hover:decoration-camel"
            >
              {s["home.about.cta"]}
            </Link>
          </div>
        </div>
      </section>

      {/* Galeria - një pjesë */}
      {gallery.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading title={s["home.gallery.title"]} text={s["home.gallery.text"]} />
              <Link
                href="/galeria"
                className="text-[15px] font-semibold text-camel underline decoration-camel/40 underline-offset-4 hover:decoration-camel"
              >
                {s["header.menu.gallery"]}
              </Link>
            </div>
          </div>
          <div className="no-scrollbar mt-10 flex snap-x gap-4 overflow-x-auto px-4 sm:px-6">
            {gallery.map((item) => (
              <Link
                key={item.id}
                href="/galeria"
                className="relative h-56 w-72 shrink-0 snap-start overflow-hidden rounded-2xl bg-seam sm:h-64 sm:w-80"
              >
                <Image
                  src={item.imageUrl}
                  alt={item.title || "Punim i realizuar"}
                  fill
                  sizes="320px"
                  className="object-cover"
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA kontakti */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 md:pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-pine px-6 py-14 text-center sm:px-12 md:py-16">
          <div className="pointer-events-none absolute inset-4 rounded-2xl border-2 border-dashed border-linen/20" />
          <h2 className="relative mx-auto max-w-2xl font-display text-3xl text-ivory sm:text-4xl">
            {s["home.cta.title"]}
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl leading-relaxed text-linen/80">
            {s["home.cta.text"]}
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            {whatsappPhone && (
              <a
                href={whatsappHref(whatsappPhone, "Përshëndetje! Kam një pyetje për një porosi.")}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[#25D366] px-7 py-3.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                WhatsApp
              </a>
            )}
            <Link
              href="/kontakt"
              className="rounded-full bg-camel px-7 py-3.5 text-[15px] font-semibold text-walnut transition-colors hover:bg-camel-soft"
            >
              {s["header.cta"]}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
