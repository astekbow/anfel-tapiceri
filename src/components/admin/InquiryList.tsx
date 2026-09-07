"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setInquiryRead, deleteInquiry } from "@/actions/inquiries";
import { whatsappHref } from "@/lib/whatsapp";
import ConfirmButton from "./ConfirmButton";

export interface InquiryRow {
  id: string;
  name: string;
  phone: string;
  message: string;
  read: boolean;
  createdAt: string;
  productTitle: string | null;
  productSlug: string | null;
}

export default function InquiryList({ inquiries }: { inquiries: InquiryRow[] }) {
  const router = useRouter();

  const toggleRead = async (inquiry: InquiryRow) => {
    const result = await setInquiryRead(inquiry.id, !inquiry.read);
    if (result.ok) router.refresh();
    else toast.error(result.error ?? "Ndryshimi dështoi");
  };

  const remove = async (id: string) => {
    const result = await deleteInquiry(id);
    if (result.ok) {
      toast.success("Mesazhi u fshi");
      router.refresh();
    } else {
      toast.error(result.error ?? "Fshirja dështoi");
    }
  };

  if (inquiries.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-seam bg-ivory p-10 text-center">
        <p className="italic text-mink">Ende s&apos;ka mesazhe nga forma e kontaktit.</p>
      </div>
    );
  }

  return (
    <ul className="mt-6 space-y-3">
      {inquiries.map((inquiry) => (
        <li
          key={inquiry.id}
          className={`rounded-2xl border bg-ivory p-4 sm:p-5 ${
            inquiry.read ? "border-seam" : "border-camel/60"
          }`}
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {!inquiry.read && <span className="h-2.5 w-2.5 rounded-full bg-camel" />}
            <p className={`text-[16px] ${inquiry.read ? "font-medium" : "font-bold"} text-walnut`}>
              {inquiry.name}
            </p>
            <a href={`tel:${inquiry.phone.replace(/\s/g, "")}`} className="text-sm text-pine hover:underline">
              {inquiry.phone}
            </a>
            <a
              href={whatsappHref(inquiry.phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-[#128C4B] hover:underline"
            >
              WhatsApp
            </a>
            <span className="ml-auto text-xs text-mink">{inquiry.createdAt}</span>
          </div>

          {inquiry.productTitle && (
            <p className="mt-2 text-sm text-mink">
              Për produktin:{" "}
              {inquiry.productSlug ? (
                <Link
                  href={`/produktet/${inquiry.productSlug}`}
                  target="_blank"
                  className="font-medium text-camel hover:underline"
                >
                  {inquiry.productTitle}
                </Link>
              ) : (
                <span className="font-medium">{inquiry.productTitle}</span>
              )}
            </p>
          )}

          <p className="mt-2.5 whitespace-pre-line text-[15px] leading-relaxed text-walnut/90">
            {inquiry.message}
          </p>

          <div className="mt-3.5 flex gap-2">
            <button
              type="button"
              onClick={() => toggleRead(inquiry)}
              className="rounded-full border border-seam px-4 py-1.5 text-xs font-semibold text-walnut transition-colors hover:border-camel"
            >
              {inquiry.read ? "Shëno si të palexuar" : "Shëno si të lexuar"}
            </button>
            <ConfirmButton
              title="Fshini mesazhin?"
              description={`Mesazhi nga ${inquiry.name} do të fshihet përfundimisht.`}
              onConfirm={() => remove(inquiry.id)}
              className="rounded-full px-4 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
            >
              Fshi
            </ConfirmButton>
          </div>
        </li>
      ))}
    </ul>
  );
}
