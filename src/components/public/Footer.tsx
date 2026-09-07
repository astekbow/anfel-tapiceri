import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { whatsappHref } from "@/lib/whatsapp";

export default async function Footer() {
  const s = await getSettings();
  const year = new Date().getFullYear();
  const name = s["site.name"] || "Anfel Tapiceri";

  const links = [
    { href: "/", label: s["header.menu.home"] },
    { href: "/produktet", label: s["header.menu.products"] },
    { href: "/galeria", label: s["header.menu.gallery"] },
    { href: "/rreth-nesh", label: s["header.menu.about"] },
    { href: "/kontakt", label: s["header.menu.contact"] },
  ];

  return (
    <footer className="bg-pine text-linen">
      <div className="stitch-light" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/uploads/logo-ari.svg" alt={name} className="h-[72px] w-auto" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-linen/70">{s["footer.text"]}</p>
        </div>

        <div>
          <h3 className="font-display text-lg text-ivory">Faqet</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-linen/75 transition-colors hover:text-ivory">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg text-ivory">Kontakt</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-linen/75">
            {s["contact.phone"] && (
              <li>
                <a href={`tel:${s["contact.phone"].replace(/\s/g, "")}`} className="hover:text-ivory">
                  {s["contact.phone"]}
                </a>
              </li>
            )}
            {s["contact.whatsapp"] && (
              <li>
                <a
                  href={whatsappHref(s["contact.whatsapp"])}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ivory"
                >
                  WhatsApp
                </a>
              </li>
            )}
            {s["contact.email"] && (
              <li>
                <a href={`mailto:${s["contact.email"]}`} className="hover:text-ivory">
                  {s["contact.email"]}
                </a>
              </li>
            )}
            {s["contact.address"] && <li>{s["contact.address"]}</li>}
            {s["contact.hours"] && <li>{s["contact.hours"]}</li>}
          </ul>
        </div>
      </div>

      <div className="border-t border-linen/15">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-sm text-linen/60 sm:px-6">
          <p>
            © {year} {name} · Tiranë ·{" "}
            <a
              href="https://hapweb-in.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-camel-soft transition-colors hover:text-ivory"
            >
              Krijuar nga Hap Web-in
            </a>
          </p>
          <div className="flex gap-5">
            {s["social.instagram"] && (
              <a href={s["social.instagram"]} target="_blank" rel="noopener noreferrer" className="hover:text-ivory">
                Instagram
              </a>
            )}
            {s["social.facebook"] && (
              <a href={s["social.facebook"]} target="_blank" rel="noopener noreferrer" className="hover:text-ivory">
                Facebook
              </a>
            )}
            {s["social.tiktok"] && (
              <a href={s["social.tiktok"]} target="_blank" rel="noopener noreferrer" className="hover:text-ivory">
                TikTok
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
