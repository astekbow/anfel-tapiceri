"use client";

import { useState } from "react";
import Image from "next/image";
import BeforeAfter from "./BeforeAfter";
import Lightbox from "./Lightbox";

export interface GalleryEntry {
  id: string;
  title: string | null;
  imageUrl: string;
  beforeImageUrl: string | null;
}

export default function GalleryGrid({
  items,
  beforeLabel,
  afterLabel,
}: {
  items: GalleryEntry[];
  beforeLabel: string;
  afterLabel: string;
}) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  // vetëm fotot e thjeshta hapen në lightbox (jo krahasimet para/pas)
  const plain = items.filter((item) => !item.beforeImageUrl);
  const plainIndex = (id: string) => plain.findIndex((p) => p.id === id);

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <figure key={item.id}>
            {item.beforeImageUrl ? (
              <BeforeAfter
                beforeUrl={item.beforeImageUrl}
                afterUrl={item.imageUrl}
                alt={item.title || "Punim i realizuar"}
                beforeLabel={beforeLabel}
                afterLabel={afterLabel}
              />
            ) : (
              <button
                type="button"
                onClick={() => setLightbox(plainIndex(item.id))}
                className="relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-2xl border border-seam bg-seam"
                aria-label={item.title || "Zmadho foton"}
              >
                <Image
                  src={item.imageUrl}
                  alt={item.title || "Punim i realizuar"}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 hover:scale-[1.03]"
                />
              </button>
            )}
            {item.title && (
              <figcaption className="mt-2.5 text-sm text-mink">{item.title}</figcaption>
            )}
          </figure>
        ))}
      </div>

      <Lightbox
        images={plain.map((p) => ({ url: p.imageUrl, alt: p.title || "Punim i realizuar" }))}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onNavigate={setLightbox}
      />
    </>
  );
}
