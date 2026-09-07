import type { Metadata } from "next";
import Link from "next/link";
import { Toaster } from "sonner";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/db";
import { logout } from "@/actions/auth";
import AdminNav from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Paneli i administrimit — Anfel Tapiceri",
  robots: { index: false, follow: false },
};

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const unread = await prisma.inquiry.count({ where: { read: false } });

  return (
    <div className="min-h-screen bg-linen">
      <header className="sticky top-0 z-40 border-b border-seam bg-ivory/95 backdrop-blur">
        <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-3 sm:px-6">
          <Link href="/admin" className="font-display text-xl leading-none text-pine">
            Anfel <em className="text-camel">Admin</em>
          </Link>
          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-seam px-4 py-2 text-sm font-medium text-walnut transition-colors hover:border-camel"
            >
              Shiko faqen
            </a>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-full px-4 py-2 text-sm font-medium text-mink transition-colors hover:bg-seam/60 hover:text-walnut"
              >
                Dil
              </button>
            </form>
          </div>
        </div>
        <AdminNav unread={unread} />
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
      <Toaster position="top-center" richColors />
    </div>
  );
}
