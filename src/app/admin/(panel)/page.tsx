import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";

export default async function AdminDashboard() {
  const [productCount, publishedCount, categoryCount, galleryCount, unreadCount, recentProducts, recentInquiries] =
    await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { published: true } }),
      prisma.category.count(),
      prisma.galleryItem.count(),
      prisma.inquiry.count({ where: { read: false } }),
      prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      }),
      prisma.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    ]);

  const stats = [
    { label: "Produkte gjithsej", value: productCount, href: "/admin/produktet" },
    { label: "Të publikuara", value: publishedCount, href: "/admin/produktet" },
    { label: "Kategori", value: categoryCount, href: "/admin/kategorite" },
    { label: "Punime në galeri", value: galleryCount, href: "/admin/galeria" },
    { label: "Mesazhe të palexuara", value: unreadCount, href: "/admin/mesazhet" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-pine">Paneli</h1>
        <Link
          href="/admin/produktet/i-ri"
          className="rounded-full bg-pine px-5 py-2.5 text-sm font-semibold text-ivory transition-colors hover:bg-pine-deep"
        >
          + Shto produkt
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-2xl border border-seam bg-ivory p-4 transition-colors hover:border-camel"
          >
            <p className="font-display text-3xl text-pine">{stat.value}</p>
            <p className="mt-1 text-sm text-mink">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-seam bg-ivory p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-walnut">Produktet e fundit</h2>
            <Link href="/admin/produktet" className="text-sm font-medium text-camel hover:underline">
              Të gjitha
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-seam/70">
            {recentProducts.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/admin/produktet/${product.id}`}
                  className="flex items-center gap-3 py-3 transition-colors hover:bg-linen/50"
                >
                  <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-linen">
                    {product.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.images[0].thumbUrl || product.images[0].url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-medium text-walnut">{product.title}</p>
                    <p className="text-sm text-mink">
                      {product.category.name}
                      {!product.published && " · Draft"}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
            {recentProducts.length === 0 && (
              <li className="py-3 text-sm italic text-mink">Ende s'ka produkte.</li>
            )}
          </ul>
        </section>

        <section className="rounded-2xl border border-seam bg-ivory p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-walnut">Mesazhet e fundit</h2>
            <Link href="/admin/mesazhet" className="text-sm font-medium text-camel hover:underline">
              Të gjitha
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-seam/70">
            {recentInquiries.map((inquiry) => (
              <li key={inquiry.id} className="py-3">
                <div className="flex items-center gap-2">
                  {!inquiry.read && <span className="h-2 w-2 shrink-0 rounded-full bg-camel" />}
                  <p className={`text-[15px] ${inquiry.read ? "text-walnut" : "font-semibold text-walnut"}`}>
                    {inquiry.name}
                  </p>
                  <span className="ml-auto shrink-0 text-xs text-mink">
                    {formatDate(inquiry.createdAt)}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-mink">{inquiry.message}</p>
              </li>
            ))}
            {recentInquiries.length === 0 && (
              <li className="py-3 text-sm italic text-mink">Ende s'ka mesazhe.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
