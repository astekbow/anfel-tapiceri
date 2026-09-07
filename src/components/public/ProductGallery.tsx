"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "./Lightbox";
import type { PlainImage } from "@/lib/types";

export default function ProductGallery({ images, title }: { images: PlainImage[]; title: string }) {
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-seam bg-ivory">
        <p className="text-sm italic text-mink">Fotot vijnë së shpejti</p>
      </div>
    );
  }

  const current = images[Math.min(selected, images.length - 1)];

  return (
    <div>
      <button
        type="button"
        onClick={() => setLightbox(selected)}
        className="relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-2xl border border-seam bg-seam"
        aria-label="Zmadho foton"
      >
        <Image
          src={current.url}
          alt={current.alt || title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="object-cover"
        />
      </button>

      {images.length > 1 && (
        <div className="no-scrollbar mt-3 flex gap-2.5 overflow-x-auto">
          {images.map((image, i) => (
            <button
              key={image.id || image.url}
              type="button"
              onClick={() => setSelected(i)}
              aria-label={`Fotoja ${i + 1}`}
              className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                i === selected ? "border-camel" : "border-transparent opacity-80 hover:opacity-100"
              }`}
            >
              <Image
                src={image.thumbUrl || image.url}
                alt={image.alt || title}
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <Lightbox
        images={images.map((img) => ({ url: img.url, alt: img.alt || title }))}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onNavigate={setLightbox}
      />
    </div>
  );
}
