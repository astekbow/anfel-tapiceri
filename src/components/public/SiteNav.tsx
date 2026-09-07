"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface NavLink {
  href: string;
  label: string;
}

export default function SiteNav({ links, cta }: { links: NavLink[]; cta: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <nav className="hidden items-center gap-7 md:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-[15px] transition-colors ${
              isActive(link.href) ? "font-semibold text-pine" : "text-mink hover:text-pine"
            }`}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/kontakt"
          className="rounded-full bg-pine px-5 py-2.5 text-sm font-semibold text-ivory transition-colors hover:bg-pine-deep"
        >
          {cta}
        </Link>
      </nav>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Mbyll menunë" : "Hap menunë"}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full text-pine md:hidden"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="h-6 w-6">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b border-seam bg-linen shadow-lg shadow-walnut/5 md:hidden">
          <nav className="flex flex-col px-5 py-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`border-b border-seam/70 py-3.5 text-[15px] last:border-0 ${
                  isActive(link.href) ? "font-semibold text-pine" : "text-walnut"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/kontakt"
              className="mb-2 mt-3 rounded-full bg-pine px-5 py-3 text-center text-sm font-semibold text-ivory"
            >
              {cta}
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
