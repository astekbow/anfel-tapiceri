import type { Metadata } from "next";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import WhatsAppFloat from "@/components/public/WhatsAppFloat";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: s["seo.title"] || s["site.name"],
      template: `%s — ${s["site.name"]}`,
    },
    description: s["seo.description"],
    openGraph: {
      siteName: s["site.name"],
      title: s["seo.title"],
      description: s["seo.description"],
      images: s["seo.ogImage"] ? [s["seo.ogImage"]] : [],
      locale: "sq_AL",
      type: "website",
    },
  };
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
