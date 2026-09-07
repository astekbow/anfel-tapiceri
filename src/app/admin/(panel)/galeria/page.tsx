import { prisma } from "@/lib/db";
import GalleryManager from "@/components/admin/GalleryManager";

export default async function AdminGalleryPage() {
  const items = await prisma.galleryItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-pine">Galeria e punimeve</h1>
      <p className="mt-2 text-[15px] text-mink">
        Shtoni foto të punimeve të realizuara. Nëse ngarkoni edhe një foto &quot;para&quot;, në faqe
        shfaqet krahasimi para / pas me rrëshqitje.
      </p>
      <div className="mt-6">
        <GalleryManager
          items={items.map((item) => ({
            id: item.id,
            title: item.title,
            imageUrl: item.imageUrl,
            beforeImageUrl: item.beforeImageUrl,
            published: item.published,
          }))}
        />
      </div>
    </div>
  );
}
