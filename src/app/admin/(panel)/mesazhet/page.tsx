import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import InquiryList from "@/components/admin/InquiryList";

export default async function AdminInquiriesPage() {
  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: { select: { title: true, slug: true } } },
  });

  const unread = inquiries.filter((inquiry) => !inquiry.read).length;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl text-pine">Mesazhet</h1>
      <p className="mt-2 text-[15px] text-mink">
        {inquiries.length} mesazhe gjithsej{unread > 0 && `, ${unread} të palexuara`}.
      </p>
      <InquiryList
        inquiries={inquiries.map((inquiry) => ({
          id: inquiry.id,
          name: inquiry.name,
          phone: inquiry.phone,
          message: inquiry.message,
          read: inquiry.read,
          createdAt: formatDate(inquiry.createdAt),
          productTitle: inquiry.product?.title ?? null,
          productSlug: inquiry.product?.slug ?? null,
        }))}
      />
    </div>
  );
}
