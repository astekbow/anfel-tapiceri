import { cache } from "react";
import { prisma } from "./db";

export type SettingFieldType = "text" | "textarea" | "image";

export interface SettingField {
  key: string;
  label: string;
  type: SettingFieldType;
  help?: string;
}

export interface SettingsSection {
  id: string;
  title: string;
  description?: string;
  fields: SettingField[];
}

/** Vlerat fillestare — çdo tekst i faqes publike jeton këtu dhe në tabelën SiteSetting. */
export const defaultSettings: Record<string, string> = {
  "site.name": "Anfel Tapiceri",
  "seo.title": "Anfel Tapiceri — Mobilje të buta me porosi në Tiranë",
  "seo.description":
    "Punishte tapicerie në Tiranë: divane, kolltuqe, karrige, krevate e pufa me porosi, dhe retapicerim i mobiljeve tuaja të vjetra. Punë dore dhe materiale cilësore.",
  "seo.ogImage": "/uploads/hero.webp",

  "header.logo": "",
  "header.menu.home": "Kryefaqja",
  "header.menu.products": "Produktet",
  "header.menu.gallery": "Galeria",
  "header.menu.about": "Rreth Nesh",
  "header.menu.contact": "Kontakt",
  "header.cta": "Na kontakto",

  "hero.title": "Mobilje të buta, të punuara me dorë në Tiranë",
  "hero.subtitle":
    "Divane, kolltuqe, karrige e krevate me porosi — dhe rikthimi në jetë i mobiljeve tuaja të vjetra me retapicerim.",
  "hero.cta1": "Shiko produktet",
  "hero.cta2": "Kërko një ofertë",
  "hero.image": "/uploads/hero.webp",

  "home.categories.title": "Çfarë punojmë",
  "home.categories.text":
    "Nga divani i sallonit te stoli i vogël i korridorit — çdo pjesë ndërtohet dhe vishet në punishten tonë.",
  "home.featured.title": "Produkte të zgjedhura",
  "home.featured.text":
    "Disa nga punimet që na kërkohen më shpesh. Çdo model porositet në përmasat dhe stofin që zgjidhni ju.",
  "home.services.title": "Shërbimet tona",
  "home.services.text":
    "Katër mënyra si mund t'ju ndihmojmë — nga një porosi krejt e re te rifreskimi i asaj që keni në shtëpi.",

  "service.1.title": "Punime me porosi",
  "service.1.text":
    "Ju zgjidhni përmasat, modelin dhe stofin — ne e ndërtojmë nga zero, me strukturë druri të fortë dhe qepje të bëra me kujdes.",
  "service.2.title": "Retapicerim & rivestim",
  "service.2.text":
    "Divani apo kolltuku juaj i vjetër merr jetë të re: ndërrojmë stofin, sfungjerin dhe sustat, duke ruajtur strukturën që ju pëlqen.",
  "service.3.title": "Divane & kolltuqe",
  "service.3.text":
    "Modele klasike dhe moderne, të ndërtuara për përdorim të përditshëm dhe rehati që zgjat me vite.",
  "service.4.title": "Krevate & punime druri",
  "service.4.text":
    "Krevate me kokë të veshur, bazamente ngritëse dhe struktura druri të punuara nga marangozët tanë.",

  "home.process.title": "Si punojmë",
  "home.process.text":
    "Nga mesazhi i parë te dorëzimi në shtëpi — një proces i thjeshtë dhe i qartë.",
  "process.1.title": "Na tregoni idenë",
  "process.1.text":
    "Na shkruani në WhatsApp ose ejani në punishte me një foto, një skicë a thjesht një ide. Ju kthejmë përgjigje me këshillë dhe një ofertë pa detyrim.",
  "process.2.title": "Zgjidhni stofin dhe masat",
  "process.2.text":
    "Bashkë zgjedhim modelin, përmasat dhe stofin nga koleksionet tona — ose sillni stofin tuaj. Çdo detaj bihet dakord para se të nisë puna.",
  "process.3.title": "Punojmë dhe dorëzojmë",
  "process.3.text":
    "Struktura ndërtohet në marangozinë tonë, veshja qepet me dorë, dhe mobilja mbërrin në shtëpinë tuaj gati për përdorim.",

  "home.about.title": "Një punishte, jo një fabrikë",
  "home.about.text":
    "Te Anfel Tapiceri çdo porosi kalon nëpër duart e mjeshtrit: nga zgjedhja e drurit e deri te qepja e fundit. Punojmë me porosi të vogla dhe kujdes të madh — ashtu siç punohej dikur.",
  "home.about.cta": "Njihuni me punishten",
  "home.about.image": "/uploads/atelier.webp",
  "home.gallery.title": "Punime të realizuara",
  "home.gallery.text": "Një pjesë e vogël nga porositë që kanë dalë nga punishtja jonë.",
  "home.cta.title": "Keni një ide apo një mobilje për të veshur?",
  "home.cta.text":
    "Na shkruani në WhatsApp ose ejani në punishte — ju kthejmë përgjigje shpejt, me këshillë dhe një ofertë pa detyrim.",

  "products.title": "Produktet",
  "products.intro":
    "Modele që i ndërtojmë rregullisht në punishte. Çdo produkt porositet në përmasat, ngjyrën dhe stofin që zgjidhni ju.",
  "products.askLabel": "Pyet për këtë produkt",
  "products.priceOnRequest": "Sipas porosisë",
  "products.relatedTitle": "Produkte të ngjashme",
  "products.formTitle": "Ose na lini një mesazh",

  "gallery.title": "Galeria e punimeve",
  "gallery.intro":
    "Porosi të realizuara dhe mobilje të kthyera në jetë me retapicerim. Rrëshqitni fotot \"para / pas\" për të parë ndryshimin.",
  "gallery.beforeLabel": "Para",
  "gallery.afterLabel": "Pas",

  "about.title": "Rreth nesh",
  "about.intro": "Historia e një punishteje ku mobiljet bëhen ende me dorë.",
  "about.body":
    "Anfel Tapiceri është një punishte tapicerie në Tiranë, ku prodhohen dhe vishen mobilje të buta: divane, kolltuqe, karrige, krevate, stola e pufa.\n\nÇdo punim nis nga dëshira e klientit: ju sillni një ide, një foto ose një mobilje të vjetër — ne e kthejmë në një pjesë që zgjat. Strukturat i ndërtojmë me dru të stazhionuar në repartin tonë të marangozisë, ndërsa veshjet qepen me dorë, me stofa që i zgjidhni vetë nga koleksionet tona.\n\nKrahas prodhimit me porosi, retapicerojmë mobilje ekzistuese: ndërrojmë sfungjerin, sustat dhe stofin, duke i dhënë jetë të re divanit apo kolltukut tuaj, shpesh me kosto shumë më të vogël se blerja e një të riu.",
  "about.image": "/uploads/about.webp",
  "value.1.title": "Punë dore",
  "value.1.text": "Prerja, qepja dhe veshja bëhen me dorë në punishten tonë — jo në linjë prodhimi.",
  "value.2.title": "Materiale cilësore",
  "value.2.text":
    "Dru i stazhionuar, sfungjer me densitet të lartë dhe stofa të zgjedhur që durojnë përdorimin e përditshëm.",
  "value.3.title": "Porosi me masë",
  "value.3.text": "Çdo punim bëhet në përmasat e hapësirës suaj dhe në stofin që zgjidhni vetë.",

  "contact.title": "Na kontaktoni",
  "contact.intro":
    "Na shkruani për një ofertë, sillni një foto të mobiljes që doni të vishni, ose ejani direkt në punishte.",
  "contact.phone": "068 200 2586",
  "contact.whatsapp": "068 200 2586",
  "contact.email": "",
  "contact.address": "Tiranë, Shqipëri",
  "contact.hours": "E hënë – E shtunë: 08:00 – 18:00",
  "contact.map": "",

  "social.instagram": "https://www.instagram.com/anfeltapiceri",
  "social.facebook": "",
  "social.tiktok": "",

  "footer.text":
    "Punishte tapicerie në Tiranë — divane, kolltuqe, karrige, krevate dhe retapicerim me porosi.",
};

/** Seksionet e faqes "Tekstet e faqes" në admin. */
export const textSections: SettingsSection[] = [
  {
    id: "header",
    title: "Header & Menu",
    description: "Etiketat e menusë dhe butoni kryesor në krye të faqes.",
    fields: [
      { key: "header.menu.home", label: "Menu — Kryefaqja", type: "text" },
      { key: "header.menu.products", label: "Menu — Produktet", type: "text" },
      { key: "header.menu.gallery", label: "Menu — Galeria", type: "text" },
      { key: "header.menu.about", label: "Menu — Rreth Nesh", type: "text" },
      { key: "header.menu.contact", label: "Menu — Kontakt", type: "text" },
      { key: "header.cta", label: "Butoni në header", type: "text" },
    ],
  },
  {
    id: "hero",
    title: "Kryefaqja — Hero",
    description: "Pjesa e parë që shohin vizitorët kur hapin faqen.",
    fields: [
      { key: "hero.title", label: "Titulli kryesor", type: "text" },
      { key: "hero.subtitle", label: "Nëntitulli", type: "textarea" },
      { key: "hero.cta1", label: "Butoni i parë", type: "text" },
      { key: "hero.cta2", label: "Butoni i dytë", type: "text" },
      { key: "hero.image", label: "Fotoja e madhe", type: "image" },
    ],
  },
  {
    id: "home",
    title: "Kryefaqja — Seksionet",
    description: "Titujt dhe tekstet e seksioneve të kryefaqes.",
    fields: [
      { key: "home.categories.title", label: "Kategoritë — titulli", type: "text" },
      { key: "home.categories.text", label: "Kategoritë — teksti", type: "textarea" },
      { key: "home.featured.title", label: "Produktet e zgjedhura — titulli", type: "text" },
      { key: "home.featured.text", label: "Produktet e zgjedhura — teksti", type: "textarea" },
      { key: "home.process.title", label: "Si punojmë — titulli", type: "text" },
      { key: "home.process.text", label: "Si punojmë — teksti", type: "textarea" },
      { key: "process.1.title", label: "Si punojmë — hapi 1, titulli", type: "text" },
      { key: "process.1.text", label: "Si punojmë — hapi 1, teksti", type: "textarea" },
      { key: "process.2.title", label: "Si punojmë — hapi 2, titulli", type: "text" },
      { key: "process.2.text", label: "Si punojmë — hapi 2, teksti", type: "textarea" },
      { key: "process.3.title", label: "Si punojmë — hapi 3, titulli", type: "text" },
      { key: "process.3.text", label: "Si punojmë — hapi 3, teksti", type: "textarea" },
      { key: "home.about.title", label: "Rreth nesh (shkurt) — titulli", type: "text" },
      { key: "home.about.text", label: "Rreth nesh (shkurt) — teksti", type: "textarea" },
      { key: "home.about.cta", label: "Rreth nesh (shkurt) — linku", type: "text" },
      { key: "home.about.image", label: "Rreth nesh (shkurt) — fotoja", type: "image" },
      { key: "home.gallery.title", label: "Galeria — titulli", type: "text" },
      { key: "home.gallery.text", label: "Galeria — teksti", type: "textarea" },
      { key: "home.cta.title", label: "Thirrja për kontakt — titulli", type: "text" },
      { key: "home.cta.text", label: "Thirrja për kontakt — teksti", type: "textarea" },
    ],
  },
  {
    id: "services",
    title: "Shërbimet",
    description: "Katër kartat e shërbimeve në kryefaqe.",
    fields: [
      { key: "home.services.title", label: "Titulli i seksionit", type: "text" },
      { key: "home.services.text", label: "Teksti i seksionit", type: "textarea" },
      { key: "service.1.title", label: "Shërbimi 1 — titulli", type: "text" },
      { key: "service.1.text", label: "Shërbimi 1 — përshkrimi", type: "textarea" },
      { key: "service.2.title", label: "Shërbimi 2 — titulli", type: "text" },
      { key: "service.2.text", label: "Shërbimi 2 — përshkrimi", type: "textarea" },
      { key: "service.3.title", label: "Shërbimi 3 — titulli", type: "text" },
      { key: "service.3.text", label: "Shërbimi 3 — përshkrimi", type: "textarea" },
      { key: "service.4.title", label: "Shërbimi 4 — titulli", type: "text" },
      { key: "service.4.text", label: "Shërbimi 4 — përshkrimi", type: "textarea" },
    ],
  },
  {
    id: "products-page",
    title: "Faqja e produkteve",
    fields: [
      { key: "products.title", label: "Titulli i faqes", type: "text" },
      { key: "products.intro", label: "Teksti hyrës", type: "textarea" },
      { key: "products.askLabel", label: "Butoni \"Pyet për këtë produkt\"", type: "text" },
      { key: "products.priceOnRequest", label: "Etiketa kur s'ka çmim fiks", type: "text" },
      { key: "products.relatedTitle", label: "Titulli \"Produkte të ngjashme\"", type: "text" },
      { key: "products.formTitle", label: "Titulli i formës së mesazhit", type: "text" },
    ],
  },
  {
    id: "gallery-page",
    title: "Faqja e galerisë",
    fields: [
      { key: "gallery.title", label: "Titulli i faqes", type: "text" },
      { key: "gallery.intro", label: "Teksti hyrës", type: "textarea" },
      { key: "gallery.beforeLabel", label: "Etiketa \"Para\"", type: "text" },
      { key: "gallery.afterLabel", label: "Etiketa \"Pas\"", type: "text" },
    ],
  },
  {
    id: "about-page",
    title: "Rreth nesh",
    fields: [
      { key: "about.title", label: "Titulli i faqes", type: "text" },
      { key: "about.intro", label: "Teksti hyrës", type: "text" },
      { key: "about.body", label: "Historia (paragrafët ndahen me rresht bosh)", type: "textarea" },
      { key: "about.image", label: "Fotoja", type: "image" },
      { key: "value.1.title", label: "Vlera 1 — titulli", type: "text" },
      { key: "value.1.text", label: "Vlera 1 — teksti", type: "textarea" },
      { key: "value.2.title", label: "Vlera 2 — titulli", type: "text" },
      { key: "value.2.text", label: "Vlera 2 — teksti", type: "textarea" },
      { key: "value.3.title", label: "Vlera 3 — titulli", type: "text" },
      { key: "value.3.text", label: "Vlera 3 — teksti", type: "textarea" },
    ],
  },
  {
    id: "contact-footer",
    title: "Kontakt & Footer",
    fields: [
      { key: "contact.title", label: "Kontakt — titulli", type: "text" },
      { key: "contact.intro", label: "Kontakt — teksti hyrës", type: "textarea" },
      {
        key: "contact.map",
        label: "Harta — linku i Google Maps (embed)",
        type: "text",
        help: "Në Google Maps: Share → Embed a map → kopjoni vetëm URL-në brenda src=\"...\".",
      },
      { key: "footer.text", label: "Teksti i footer-it", type: "textarea" },
    ],
  },
  {
    id: "seo",
    title: "SEO",
    description: "Si shfaqet faqja në Google dhe kur ndahet në rrjete sociale.",
    fields: [
      { key: "seo.title", label: "Titulli i faqes (Google)", type: "text" },
      { key: "seo.description", label: "Përshkrimi (Google)", type: "textarea" },
      { key: "seo.ogImage", label: "Fotoja kur ndahet linku", type: "image" },
    ],
  },
];

/** Seksionet e faqes "Cilësimet" në admin. */
export const basicSections: SettingsSection[] = [
  {
    id: "brand",
    title: "Identiteti",
    fields: [
      { key: "site.name", label: "Emri i biznesit", type: "text" },
      {
        key: "header.logo",
        label: "Logo",
        type: "image",
        help: "Nëse s'ka logo, shfaqet emri i biznesit me shkronja elegante.",
      },
    ],
  },
  {
    id: "contact",
    title: "Kontakti",
    fields: [
      { key: "contact.phone", label: "Numri i telefonit", type: "text" },
      { key: "contact.whatsapp", label: "Numri i WhatsApp", type: "text" },
      { key: "contact.email", label: "Email (opsionale)", type: "text" },
      { key: "contact.address", label: "Adresa", type: "textarea" },
      { key: "contact.hours", label: "Orari i punës", type: "text" },
    ],
  },
  {
    id: "social",
    title: "Rrjetet sociale",
    fields: [
      { key: "social.instagram", label: "Instagram (URL)", type: "text" },
      { key: "social.facebook", label: "Facebook (URL, opsionale)", type: "text" },
      { key: "social.tiktok", label: "TikTok (URL, opsionale)", type: "text" },
    ],
  },
];

export const allSettingKeys = new Set([
  ...Object.keys(defaultSettings),
  ...textSections.flatMap((s) => s.fields.map((f) => f.key)),
  ...basicSections.flatMap((s) => s.fields.map((f) => f.key)),
]);

export type Settings = Record<string, string>;

/** Lexon të gjitha cilësimet nga DB, të bashkuara me vlerat fillestare. */
export const getSettings = cache(async (): Promise<Settings> => {
  const merged: Settings = { ...defaultSettings };
  try {
    const rows = await prisma.siteSetting.findMany();
    for (const row of rows) merged[row.key] = row.value;
  } catch {
    // p.sh. gjatë build-it pa databazë — përdor vlerat fillestare
  }
  return merged;
});
