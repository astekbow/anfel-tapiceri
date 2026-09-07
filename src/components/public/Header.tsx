import Link from "next/link";
import { getSettings } from "@/lib/settings";
import SiteNav from "./SiteNav";

export default async function Header() {
  const s = await getSettings();
  const links = [
    { href: "/", label: s["header.menu.home"] },
    { href: "/produktet", label: s["header.menu.products"] },
    { href: "/galeria", label: s["header.menu.gallery"] },
    { href: "/rreth-nesh", label: s["header.menu.about"] },
    { href: "/kontakt", label: s["header.menu.contact"] },
  ];

  const name = s["site.name"] || "Anfel Tapiceri";
  const [first, ...rest] = name.split(" ");

  return (
    <header className="sticky top-0 z-40 border-b border-seam bg-linen/90 backdrop-blur">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[72px] sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label={name}>
          {s["header.logo"] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s["header.logo"]} alt={name} className="h-10 w-auto sm:h-11" />
          ) : (
            <span className="font-display text-[26px] leading-none text-pine">
              {first}
              {rest.length > 0 && <em className="text-camel"> {rest.join(" ")}</em>}
            </span>
          )}
        </Link>
        <SiteNav links={links} cta={s["header.cta"]} />
      </div>
    </header>
  );
}
