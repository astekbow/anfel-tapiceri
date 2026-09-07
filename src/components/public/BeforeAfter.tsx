"use client";

import { useState } from "react";

export default function BeforeAfter({
  beforeUrl,
  afterUrl,
  alt,
  beforeLabel,
  afterLabel,
}: {
  beforeUrl: string;
  afterUrl: string;
  alt: string;
  beforeLabel: string;
  afterLabel: string;
}) {
  const [pos, setPos] = useState(50);

  return (
    <div className="relative aspect-[4/3] select-none overflow-hidden rounded-2xl border border-seam bg-seam">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={afterUrl} alt={alt} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={beforeUrl}
          alt={`${beforeLabel}: ${alt}`}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <div
        className="pointer-events-none absolute inset-y-0 w-[2px] bg-ivory shadow-[0_0_8px_rgba(0,0,0,0.4)]"
        style={{ left: `${pos}%` }}
      >
        <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ivory text-walnut shadow-md">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M8 8l-4 4 4 4M16 8l4 4-4 4" />
          </svg>
        </span>
      </div>

      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-walnut/65 px-2.5 py-1 text-xs font-medium text-ivory">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-pine/75 px-2.5 py-1 text-xs font-medium text-ivory">
        {afterLabel}
      </span>

      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={`Krahaso ${beforeLabel} / ${afterLabel}`}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
