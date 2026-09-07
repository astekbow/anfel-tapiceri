import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: s["about.title"], description: s["about.intro"] };
}

export default async function AboutPage() {
  const s = await getSettings();
  const paragraphs = s["about.body"].split(/\n{2,}/).filter(Boolean);
  const values = [1, 2, 3]
    .map((i) => ({ title: s[`value.${i}.title`], text: s[`value.${i}.text`] }))
    .filter((v) => v.title);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <h1 className="font-display text-4xl text-pine sm:text-[42px]">{s["about.title"]}</h1>
      <div className="stitch mt-4 w-16" />
      <p className="mt-4 max-w-2xl leading-relaxed text-mink">{s["about.intro"]}</p>

      <div className="mt-12 grid gap-10 md:grid-cols-2 md:items-start">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-seam md:sticky md:top-24">
          {s["about.image"] && (
            <Image
              src={s["about.image"]}
              alt={s["about.title"]}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          )}
          <div className="pointer-events-none absolute inset-3 rounded-xl border-2 border-dashed border-ivory/50" />
        </div>
        <div className="prose-anfel text-[16px] leading-relaxed text-walnut/90">
          {paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>

      {values.length > 0 && (
        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          {values.map((value, i) => (
            <div key={i} className="rounded-2xl border border-seam bg-ivory p-6">
              <span className="font-display text-3xl italic text-camel">{i + 1}.</span>
              <h2 className="mt-3 font-display text-xl text-pine">{value.title}</h2>
              <p className="mt-2.5 text-[15px] leading-relaxed text-mink">{value.text}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-14 rounded-2xl border border-seam bg-ivory px-6 py-8 text-center sm:px-10">
        <p className="mx-auto max-w-lg font-display text-2xl text-pine">{s["home.cta.title"]}</p>
        <Link
          href="/kontakt"
          className="mt-5 inline-block rounded-full bg-pine px-7 py-3.5 text-[15px] font-semibold text-ivory transition-colors hover:bg-pine-deep"
        >
          {s["header.cta"]}
        </Link>
      </div>
    </div>
  );
}
