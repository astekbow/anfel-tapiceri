"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteProduct, toggleProductFlag } from "@/actions/products";
import { formatPrice } from "@/lib/format";
import ConfirmButton from "./ConfirmButton";

export interface ProductRow {
  id: string;
  title: string;
  slug: string;
  categoryName: string;
  price: number | null;
  priceNote: string | null;
  featured: boolean;
  published: boolean;
  thumbUrl: string | null;
}

export default function ProductsList({ products }: { products: ProductRow[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const toggle = (id: string, flag: "published" | "featured", value: boolean) => {
    startTransition(async () => {
      const result = await toggleProductFlag(id, flag, value);
      if (result.ok) {
        router.refresh();
      } else {
        toast.error(result.error ?? "Ndryshimi dështoi");
      }
    });
  };

  const remove = async (id: string, title: string) => {
    const result = await deleteProduct(id);
    if (result.ok) {
      toast.success(`"${title}" u fshi`);
      router.refresh();
    } else {
      toast.error(result.error ?? "Fshirja dështoi");
    }
  };

  if (products.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-seam bg-ivory p-10 text-center">
        <p className="italic text-mink">Nuk u gjet asnjë produkt.</p>
      </div>
    );
  }

  return (
    <ul className="mt-6 space-y-3">
      {products.map((product) => (
        <li
          key={product.id}
          className="flex flex-wrap items-center gap-3 rounded-2xl border border-seam bg-ivory p-3 sm:flex-nowrap sm:gap-4 sm:p-4"
        >
          <Link
            href={`/admin/produktet/${product.id}`}
            className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-linen"
          >
            {product.thumbUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.thumbUrl} alt="" className="h-full w-full object-cover" />
            )}
          </Link>

          <div className="min-w-0 flex-1">
            <Link
              href={`/admin/produktet/${product.id}`}
              className="block truncate text-[15px] font-semibold text-walnut hover:text-pine"
            >
              {product.title}
            </Link>
            <p className="mt-0.5 truncate text-sm text-mink">
              {product.categoryName} ·{" "}
              {formatPrice(product.price) ?? product.priceNote ?? "Sipas porosisë"}
            </p>
          </div>

          <div className="flex w-full items-center justify-end gap-1.5 sm:w-auto">
            <button
              type="button"
              onClick={() => toggle(product.id, "featured", !product.featured)}
              title={product.featured ? "Hiqe nga të zgjedhurat" : "Vendose te të zgjedhurat"}
              aria-label="E zgjedhur"
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                product.featured ? "text-camel" : "text-seam hover:text-mink"
              }`}
            >
              <svg viewBox="0 0 24 24" fill={product.featured ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" className="h-5 w-5">
                <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => toggle(product.id, "published", !product.published)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                product.published
                  ? "bg-pine/10 text-pine hover:bg-pine/20"
                  : "bg-seam/70 text-mink hover:bg-seam"
              }`}
            >
              {product.published ? "Publikuar" : "Draft"}
            </button>

            <Link
              href={`/admin/produktet/${product.id}`}
              className="rounded-full border border-seam px-3.5 py-1.5 text-xs font-semibold text-walnut transition-colors hover:border-camel"
            >
              Edito
            </Link>

            <ConfirmButton
              title="Fshini produktin?"
              description={`"${product.title}" dhe fotot e tij do të fshihen përfundimisht.`}
              onConfirm={() => remove(product.id, product.title)}
              className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
            >
              Fshi
            </ConfirmButton>
          </div>
        </li>
      ))}
    </ul>
  );
}
