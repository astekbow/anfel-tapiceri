import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { whatsappHref } from "@/lib/whatsapp";
import ContactForm from "@/components/public/ContactForm";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: s["contact.title"], description: s["contact.intro"] };
}

export default async function ContactPage() {
  const s = await getSettings();
  const whatsappPhone = s["contact.whatsapp"] || s["contact.phone"];

  const rows = [
    s["contact.phone"] && {
      label: "Telefon",
      value: s["contact.phone"],
      href: `tel:${s["contact.phone"].replace(/\s/g, "")}`,
    },
    s["contact.email"] && {
      label: "Email",
      value: s["contact.email"],
      href: `mailto:${s["contact.email"]}`,
    },
    s["contact.address"] && { label: "Adresa", value: s["contact.address"] },
    s["contact.hours"] && { label: "Orari", value: s["contact.hours"] },
  ].filter(Boolean) as { label: string; value: string; href?: string }[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <h1 className="font-display text-4xl text-pine sm:text-[42px]">{s["contact.title"]}</h1>
      <div className="stitch mt-4 w-16" />
      <p className="mt-4 max-w-2xl leading-relaxed text-mink">{s["contact.intro"]}</p>

      <div className="mt-12 grid gap-10 lg:grid-cols-[5fr_7fr]">
        <div>
          <dl className="space-y-4">
            {rows.map((row) => (
              <div key={row.label} className="rounded-2xl border border-seam bg-ivory px-5 py-4">
                <dt className="text-sm font-medium text-mink">{row.label}</dt>
                <dd className="mt-1 text-[16px] text-walnut">
                  {row.href ? (
                    <a href={row.href} className="hover:text-pine">
                      {row.value}
                    </a>
                  ) : (
                    <span className="whitespace-pre-line">{row.value}</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            {whatsappPhone && (
              <a
                href={whatsappHref(whatsappPhone, "Përshëndetje! Kam një pyetje.")}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[#25D366] px-6 py-3 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                Na shkruani në WhatsApp
              </a>
            )}
            {s["social.instagram"] && (
              <a
                href={s["social.instagram"]}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-seam bg-ivory px-6 py-3 text-[15px] font-semibold text-walnut transition-colors hover:border-camel"
              >
                Instagram
              </a>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-seam bg-ivory p-6 sm:p-8">
          <h2 className="font-display text-2xl text-pine">Dërgoni një mesazh</h2>
          <div className="mt-5">
            <ContactForm />
          </div>
        </div>
      </div>

      {s["contact.map"] && (
        <div className="mt-12 overflow-hidden rounded-2xl border border-seam">
          <iframe
            src={s["contact.map"]}
            title="Harta e vendndodhjes"
            className="h-[380px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}
