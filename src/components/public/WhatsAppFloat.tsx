import { getSettings } from "@/lib/settings";
import { whatsappHref } from "@/lib/whatsapp";

export default async function WhatsAppFloat() {
  const s = await getSettings();
  const phone = s["contact.whatsapp"] || s["contact.phone"];
  if (!phone) return null;

  return (
    <a
      href={whatsappHref(phone, "Përshëndetje! Ju shkruaj nga faqja juaj e internetit.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Na shkruani në WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-walnut/25 transition-transform hover:scale-105"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-white">
        <path d="M16.004 3.2c-7.065 0-12.8 5.735-12.8 12.8 0 2.26.59 4.468 1.712 6.416L3.2 28.8l6.56-1.68a12.74 12.74 0 0 0 6.24 1.616h.004c7.065 0 12.796-5.735 12.796-12.8 0-3.42-1.33-6.633-3.748-9.052A12.72 12.72 0 0 0 16.004 3.2zm0 23.36h-.004a10.6 10.6 0 0 1-5.4-1.48l-.388-.23-3.892.996 1.04-3.792-.253-.39a10.58 10.58 0 0 1-1.623-5.664c0-5.868 4.776-10.64 10.648-10.64 2.844 0 5.516 1.108 7.524 3.12a10.57 10.57 0 0 1 3.116 7.528c0 5.868-4.776 10.552-10.768 10.552zm5.84-7.96c-.32-.16-1.892-.933-2.185-1.04-.293-.107-.507-.16-.72.16-.213.32-.827 1.04-1.013 1.253-.187.213-.374.24-.694.08-.32-.16-1.35-.497-2.572-1.586-.95-.848-1.592-1.895-1.779-2.215-.186-.32-.02-.493.14-.652.145-.144.32-.374.48-.56.16-.187.214-.32.32-.534.107-.213.054-.4-.026-.56-.08-.16-.72-1.735-.987-2.375-.26-.624-.523-.54-.72-.55l-.613-.01c-.213 0-.56.08-.853.4-.293.32-1.12 1.093-1.12 2.667 0 1.573 1.147 3.093 1.307 3.306.16.214 2.256 3.444 5.464 4.83.764.33 1.36.527 1.824.674.767.244 1.464.21 2.015.127.615-.092 1.893-.774 2.16-1.52.266-.747.266-1.387.186-1.52-.08-.134-.293-.214-.613-.374z" />
      </svg>
    </a>
  );
}
