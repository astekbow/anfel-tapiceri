import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import GalleryGrid from "@/components/public/GalleryGrid";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: s["gallery.title"], description: s["gallery.intro"] };
}

export default async function GalleryPage() {
  const [s, items] = await Promise.all([
    getSettings(),
    prisma.galleryItem.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <h1 className="font-display text-4xl text-pine sm:text-[42px]">{s["gallery.title"]}</h1>
      <div className="stitch mt-4 w-16" />
      <p className="mt-4 max-w-2xl leading-relaxed text-mink">{s["gallery.intro"]}</p>

      {items.length === 0 ? (
        <div className="mt-14 rounded-2xl border border-seam bg-ivory p-10 text-center">
          <p className="italic text-mink">Fotot e punimeve vijnë së shpejti.</p>
        </div>
      ) : (
        <div className="mt-10">
          <GalleryGrid
            items={items.map((item) => ({
              id: item.id,
              title: item.title,
              imageUrl: item.imageUrl,
              beforeImageUrl: item.beforeImageUrl,
            }))}
            beforeLabel={s["gallery.beforeLabel"]}
            afterLabel={s["gallery.afterLabel"]}
          />
        </div>
      )}
    </div>
  );
}
