import Link from "next/link";
import Image from "next/image";

export default function CategoryCard({
  name,
  slug,
  image,
  count,
}: {
  name: string;
  slug: string;
  image: string | null;
  count?: number;
}) {
  return (
    <Link
      href={`/produktet?kategoria=${slug}`}
      className="group relative block overflow-hidden rounded-2xl"
    >
      <div className="relative aspect-[4/3] bg-pine">
        {image && (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-walnut/75 via-walnut/15 to-transparent" />
        <div className="absolute bottom-4 left-5 right-3">
          <h3 className="font-display text-xl text-ivory">{name}</h3>
          {count != null && count > 0 && (
            <p className="mt-0.5 text-[13px] text-ivory/75">{count} produkte</p>
          )}
        </div>
      </div>
    </Link>
  );
}
