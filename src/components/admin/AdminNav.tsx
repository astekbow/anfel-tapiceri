"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Paneli" },
  { href: "/admin/produktet", label: "Produktet" },
  { href: "/admin/kategorite", label: "Kategoritë" },
  { href: "/admin/galeria", label: "Galeria" },
  { href: "/admin/tekstet", label: "Tekstet e faqes" },
  { href: "/admin/mesazhet", label: "Mesazhet" },
  { href: "/admin/cilesimet", label: "Cilësimet" },
];

export default function AdminNav({ unread }: { unread: number }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <nav className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 pb-3 sm:px-6">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            isActive(link.href)
              ? "bg-pine text-ivory"
              : "text-mink hover:bg-seam/60 hover:text-walnut"
          }`}
        >
          {link.label}
          {link.href === "/admin/mesazhet" && unread > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-camel px-1.5 text-xs font-bold text-walnut">
              {unread}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
