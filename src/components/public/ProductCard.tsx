import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import type { PlainProduct } from "@/lib/types";

export default function ProductCard({
  product,
  priceOnRequestLabel,
}: {
  product: PlainProduct;
  priceOnRequestLabel: string;
}) {
  const image = product.images[0];
  const price = formatPrice(product.price);

  return (
    <Link
      href={`/produktet/${product.slug}`}
      className="group overflow-hidden rounded-2xl border border-seam bg-ivory transition-shadow hover:shadow-md hover:shadow-walnut/10"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-seam">
        {image && (
          <Image
            src={image.url}
            alt={image.alt || product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        )}
      </div>
      <div className="p-5">
        <p className="text-xs text-mink">{product.categoryName}</p>
        <h3 className="mt-1 font-display text-lg leading-snug text-walnut">{product.title}</h3>
        <p className="mt-3 border-t border-seam/70 pt-3 text-[15px]">
          {price ? (
            <>
              <span className="font-semibold text-camel">{price}</span>
              {product.priceNote && <span className="text-sm text-mink"> · {product.priceNote}</span>}
            </>
          ) : (
            <span className="italic text-mink">{product.priceNote || priceOnRequestLabel}</span>
          )}
        </p>
      </div>
    </Link>
  );
}
