import { prisma } from "@/lib/db";
import CategoryManager from "@/components/admin/CategoryManager";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl text-pine">Kategoritë</h1>
      <p className="mt-2 text-[15px] text-mink">
        Radha këtu përcakton radhën e shfaqjes në faqen publike.
      </p>
      <div className="mt-6">
        <CategoryManager
          categories={categories.map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            image: category.image,
            published: category.published,
            productCount: category._count.products,
          }))}
        />
      </div>
    </div>
  );
}
