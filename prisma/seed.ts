import path from "path";
import { promises as fs } from "fs";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import sharp from "sharp";
import { defaultSettings } from "../src/lib/settings";

const prisma = new PrismaClient();

const UPLOAD_DIR = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "./uploads");

// ---------------------------------------------------------------------------
// Gjenerimi i fotove placeholder (zëvendësohen nga admini me foto reale)
// ---------------------------------------------------------------------------

interface Palette {
  bg: string;
  ink: string;
}

const palettes: Record<string, Palette> = {
  pine: { bg: "#274036", ink: "#F6F2EA" },
  camel: { bg: "#B4885A", ink: "#2A2118" },
  linen: { bg: "#E9E0CE", ink: "#3B3128" },
  walnut: { bg: "#4A3D30", ink: "#EFE7DA" },
  sage: { bg: "#7C8B7A", ink: "#222921" },
  clay: { bg: "#9C674B", ink: "#F4EADF" },
};

function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp((n >> 16) + amount);
  const g = clamp(((n >> 8) & 255) + amount);
  const b = clamp((n & 255) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function esc(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function placeholderSvg(w: number, h: number, palette: Palette, label?: string): string {
  const fontSize = Math.round(w * 0.05);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${shade(palette.bg, 10)}"/>
      <stop offset="1" stop-color="${shade(palette.bg, -18)}"/>
    </linearGradient>
    <pattern id="weave" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <path d="M0 0H18" stroke="${palette.ink}" stroke-opacity="0.07" stroke-width="1.6"/>
      <path d="M0 9H18" stroke="${palette.ink}" stroke-opacity="0.045" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" fill="url(#weave)"/>
  <rect x="30" y="30" width="${w - 60}" height="${h - 60}" rx="28" fill="none"
        stroke="${palette.ink}" stroke-opacity="0.5" stroke-width="3"
        stroke-dasharray="2 14" stroke-linecap="round"/>
  ${
    label
      ? `<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
        font-family="Georgia, 'Times New Roman', serif" font-style="italic"
        font-size="${fontSize}" fill="${palette.ink}" fill-opacity="0.92">${esc(label)}</text>`
      : ""
  }
  <text x="50%" y="${label ? "62%" : "53%"}" text-anchor="middle"
        font-family="Verdana, Arial, sans-serif" font-size="${Math.round(w * 0.017)}"
        letter-spacing="7" fill="${palette.ink}" fill-opacity="0.55">ANFEL TAPICERI</text>
</svg>`;
}

async function makeImage(
  name: string,
  paletteName: keyof typeof palettes,
  label?: string,
  w = 1400,
  h = 1050
): Promise<{ url: string; thumbUrl: string }> {
  // mos e mbivendos një foto ekzistuese (p.sh. fotot reale të ngarkuara më vonë)
  const mainPath = path.join(UPLOAD_DIR, `${name}.webp`);
  const exists = await fs
    .access(mainPath)
    .then(() => true)
    .catch(() => false);
  if (exists) {
    return { url: `/uploads/${name}.webp`, thumbUrl: `/uploads/${name}-thumb.webp` };
  }
  const svg = Buffer.from(placeholderSvg(w, h, palettes[paletteName], label));
  await sharp(svg).webp({ quality: 82 }).toFile(path.join(UPLOAD_DIR, `${name}.webp`));
  await sharp(svg)
    .resize({ width: 600, fit: "inside" })
    .webp({ quality: 74 })
    .toFile(path.join(UPLOAD_DIR, `${name}-thumb.webp`));
  return { url: `/uploads/${name}.webp`, thumbUrl: `/uploads/${name}-thumb.webp` };
}

// ---------------------------------------------------------------------------
// Të dhënat fillestare
// ---------------------------------------------------------------------------

const categories = [
  {
    slug: "divane",
    name: "Divane",
    description: "Divane dy e tre-vendësh dhe këndore, të ndërtuara me porosi.",
    palette: "pine" as const,
  },
  {
    slug: "kolltuqe",
    name: "Kolltuqe",
    description: "Kolltuqe klasike dhe moderne, me stofin që zgjidhni ju.",
    palette: "clay" as const,
  },
  {
    slug: "karrige",
    name: "Karrige",
    description: "Karrige ngrënieje dhe karrige të veshura për shtëpi e lokale.",
    palette: "sage" as const,
  },
  {
    slug: "krevate",
    name: "Krevate",
    description: "Krevate me kokë të veshur dhe bazamente ngritëse.",
    palette: "walnut" as const,
  },
  {
    slug: "stola-pufa",
    name: "Stola & Pufa",
    description: "Pufa, stola me kuti dhe ndenjëse të vogla për çdo qoshe.",
    palette: "camel" as const,
  },
  {
    slug: "punime-me-porosi",
    name: "Punime me Porosi",
    description: "Projekte me masë dhe retapicerim i mobiljeve tuaja.",
    palette: "linen" as const,
  },
];

interface SeedProduct {
  slug: string;
  title: string;
  category: string;
  price: number | null;
  priceNote: string | null;
  dimensions: string | null;
  materials: string | null;
  featured: boolean;
  palette: keyof typeof palettes;
  imageCount: number;
  description: string;
}

const products: SeedProduct[] = [
  {
    slug: "divan-vera-3-vendesh",
    title: 'Divan "Vera" 3-vendësh',
    category: "divane",
    price: 78000,
    priceNote: null,
    dimensions: "220 × 95 × 85 cm",
    materials: "Stof liri anti-njollë, sfungjer me densitet të lartë, strukturë ahu",
    featured: true,
    palette: "pine",
    imageCount: 1,
    description:
      "Divan tre-vendësh me linja të pastra dhe krahë të ngushtë, i ndërtuar mbi strukturë ahu të stazhionuar.\n\nSfungjeri me densitet të lartë e mban formën edhe pas viteve me përdorim, ndërsa stofi prej liri pastrohet lehtë dhe merr frymë në verë. Qepjet e dyfishta përgjatë jastëkëve i japin atë pamjen e punës së dorës që nuk e gjeni në mobilje fabrike.\n\nPorositet në çdo ngjyrë dhe përmasë — na sillni masat e sallonit dhe ne ju këshillojmë modelin.",
  },
  {
    slug: "divan-kendor-drini",
    title: 'Divan këndor "Drini"',
    category: "divane",
    price: null,
    priceNote: "Çmimi sipas porosisë",
    dimensions: "Sipas hapësirës suaj",
    materials: "Stof sipas zgjedhjes, sfungjer + pupël, strukturë ahu",
    featured: true,
    palette: "walnut",
    imageCount: 1,
    description:
      "Divan këndor i punuar tërësisht me porosi, i menduar për t'u përshtatur milimetër pas milimetri me hapësirën tuaj.\n\nVjen me shezlong majtas ose djathtas, mbushje që kombinon sfungjer dhe pupël për një ndenjëse të butë që rikthehet në formë, dhe qepje të forta në çdo kënd. Sillni planimetrinë ose një foto të dhomës — ne bëjmë pjesën tjetër.",
  },
  {
    slug: "kolltuk-teuta",
    title: 'Kolltuk "Teuta"',
    category: "kolltuqe",
    price: 32000,
    priceNote: null,
    dimensions: "80 × 85 × 95 cm",
    materials: "Kadife e trashë, këmbë arre masive",
    featured: true,
    palette: "clay",
    imageCount: 1,
    description:
      "Kolltuk me shpinore të lartë dhe ndenjëse të thellë, i veshur me kadife që e kap dritën bukur në çdo orë të ditës.\n\nKëmbët prej arre masive i japin një qëndrim klasik që nuk vjetrohet. I përshtatshëm për një cep leximi ose si palë pranë divanit.",
  },
  {
    slug: "kolltuk-relaks-alba",
    title: 'Kolltuk relaks "Alba" me pufë',
    category: "kolltuqe",
    price: 45000,
    priceNote: "bashkë me pufën",
    dimensions: "85 × 90 × 100 cm",
    materials: "Stof bukle, sfungjer HR, strukturë pishe",
    featured: false,
    palette: "camel",
    imageCount: 1,
    description:
      "Kolltuk relaksi me shpinore të pjerrët dhe pufë të veshur me të njëjtin stof, për t'i mbajtur këmbët lart pas një dite të gjatë.\n\nStofi bukle është i ngrohtë në dimër dhe i këndshëm në prekje, ndërsa mbushja e ndenjëses është zgjedhur për qëndrim të gjatë pa u deformuar.",
  },
  {
    slug: "set-karrige-lira",
    title: 'Karrige ngrënieje "Lira"',
    category: "karrige",
    price: 9500,
    priceNote: "çmimi për copë",
    dimensions: "46 × 52 × 92 cm",
    materials: "Stof kadife e lehtë, dru ahu i lyer",
    featured: false,
    palette: "sage",
    imageCount: 1,
    description:
      "Karrige ngrënieje me shpinore të veshur dhe ndenjëse të butë, e ndërtuar mbi skelet ahu të fortë.\n\nPorositet në setin dhe ngjyrën që dëshironi — për tavolinën e shtëpisë ose për një lokal. Me porosi mbi 6 copë ofrojmë çmim të veçantë.",
  },
  {
    slug: "karrige-mira",
    title: 'Karrige "Mira" me shpinore të veshur',
    category: "karrige",
    price: 8000,
    priceNote: null,
    dimensions: "45 × 50 × 88 cm",
    materials: "Stof i fortë me strukturë, dru ahu",
    featured: false,
    palette: "linen",
    imageCount: 1,
    description:
      "Model i thjeshtë dhe i qëndrueshëm, me shpinore të veshur që e bën të rehatshme edhe për ndenjje të gjata.\n\nE preferuar për kuzhina dhe lokale, sepse stofi me strukturë e fsheh mirë përdorimin e përditshëm.",
  },
  {
    slug: "krevat-luna",
    title: 'Krevat "Luna" me kokë të veshur',
    category: "krevate",
    price: 95000,
    priceNote: null,
    dimensions: "Për dyshek 160 × 200 cm",
    materials: "Stof bukle, dru pishe dhe MDF",
    featured: true,
    palette: "walnut",
    imageCount: 1,
    description:
      "Krevat me kokë të lartë të veshur me stof bukle, që e kthen murin e dhomës së gjumit në sfondin më të butë të shtëpisë.\n\nKoka është e kapitonuar me dorë, me thellime të njëtrajtshme që mbahen në vite. Struktura mban çdo dyshek standard 160 × 200 cm; me porosi bëhet edhe në përmasa të tjera.",
  },
  {
    slug: "krevat-ari-me-bazament",
    title: 'Krevat "Ari" me bazament ngritës',
    category: "krevate",
    price: null,
    priceNote: "Çmimi sipas përmasave",
    dimensions: "160 × 200 cm ose me porosi",
    materials: "Stof sipas zgjedhjes, mekanizëm ngritës me amortizatorë",
    featured: false,
    palette: "pine",
    imageCount: 1,
    description:
      "Krevat me bazament ngritës dhe hapësirë magazinimi poshtë dyshekut — zgjidhja praktike për apartamentet e Tiranës.\n\nMekanizmi me amortizatorë ngrihet lehtë me një dorë, ndërsa fundi i krevatit është i veshur me të njëjtin stof si koka. Porositet në çdo përmasë dysheku.",
  },
  {
    slug: "pufe-bora",
    title: 'Pufë "Bora"',
    category: "stola-pufa",
    price: 6500,
    priceNote: null,
    dimensions: "Ø 45 × 42 cm",
    materials: "Kadife, këmbë druri",
    featured: false,
    palette: "clay",
    imageCount: 1,
    description:
      "Pufë e rrumbullakët me veshje kadifeje dhe këmbë të shkurtra druri — një ndenjëse shtesë që zë pak vend dhe zbukuron çdo cep.\n\nZgjidhni ngjyrën nga koleksioni ynë i kadifeve ose na sillni stofin tuaj.",
  },
  {
    slug: "stol-me-kuti-nora",
    title: 'Stol me kuti "Nora"',
    category: "stola-pufa",
    price: 12000,
    priceNote: null,
    dimensions: "90 × 40 × 45 cm",
    materials: "Stof i fortë, trup MDF me mentesha të buta",
    featured: false,
    palette: "camel",
    imageCount: 1,
    description:
      "Stol i veshur me kapak që hapet — ndenjëse te dera ose në fund të krevatit, dhe njëkohësisht kuti për batanije, këpucë a lodra.\n\nMenteshat me mbyllje të butë e bëjnë të sigurt edhe për fëmijët.",
  },
  {
    slug: "kend-dite-me-porosi",
    title: "Kënd dite sipas projektit tuaj",
    category: "punime-me-porosi",
    price: null,
    priceNote: "Me porosi — kërkoni ofertë",
    dimensions: "Sipas hapësirës suaj",
    materials: "Dru i stazhionuar, stof sipas zgjedhjes",
    featured: true,
    palette: "linen",
    imageCount: 1,
    description:
      "Kënd dite, minderë dhome ose ndenjëse dritareje — e ndërtojmë nga zero sipas skicës ose fotos që na sillni.\n\nReparti ynë i marangozisë përgatit strukturën me masë, ndërsa tapiceria e vesh me stofin dhe trashësinë e mbushjes që zgjidhni ju. Ideale për hapësira jo standarde ku mobiljet e gatshme nuk hyjnë.",
  },
  {
    slug: "retapicerim-divani",
    title: "Retapicerim i divanit tuaj",
    category: "punime-me-porosi",
    price: null,
    priceNote: "Çmimi pas vlerësimit",
    dimensions: null,
    materials: "Stof i ri sipas zgjedhjes, sfungjer dhe susta të reja sipas nevojës",
    featured: false,
    palette: "sage",
    imageCount: 1,
    description:
      "Divani juaj i vjetër ka strukturë të mirë? Atëherë nuk ka nevojë të ndërrohet — vishet nga e para.\n\nE marrim në punishte, ndërrojmë stofin, sfungjerin dhe sustat e lodhura, forcojmë skeletin ku duhet, dhe jua kthejmë si të ri — shpesh me gjysmën e kostos së një divani të ri. Na dërgoni një foto në WhatsApp dhe ju kthejmë një vlerësim pa detyrim.",
  },
];

const galleryItems = [
  {
    key: "gal-retapicerim-kolltuk",
    title: "Retapicerim kolltuku klasik — nga stofi i grisur te kadifeja e re",
    palette: "pine" as const,
    beforePalette: "walnut" as const,
  },
  {
    key: "gal-divan-kendor",
    title: "Divan këndor me porosi për një apartament në Tiranë",
    palette: "clay" as const,
    beforePalette: null,
  },
  {
    key: "gal-set-karrige",
    title: "Set karrigesh të veshura për një lokal në qendër",
    palette: "sage" as const,
    beforePalette: null,
  },
  {
    key: "gal-koke-krevati",
    title: "Kokë krevati me kapitone, e punuar me dorë",
    palette: "camel" as const,
    beforePalette: null,
  },
  {
    key: "gal-retapicerim-divan",
    title: "Divan familjar i rikthyer në jetë me retapicerim",
    palette: "linen" as const,
    beforePalette: "walnut" as const,
  },
  {
    key: "gal-pufa-porosi",
    title: "Pufa me porosi në ngjyrat e klientit",
    palette: "pine" as const,
    beforePalette: null,
  },
];

// ---------------------------------------------------------------------------

async function main() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  console.log(`📁 Fotot placeholder ruhen në: ${UPLOAD_DIR}`);

  // 1. Admini nga .env
  const email = (process.env.ADMIN_EMAIL || "admin@anfel.al").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "admin123";
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.warn("⚠  ADMIN_EMAIL / ADMIN_PASSWORD mungojnë në .env — po përdoren vlerat e paracaktuara.");
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.upsert({
    where: { email },
    create: { email, passwordHash, name: "Admin" },
    update: { passwordHash },
  });
  console.log(`👤 Admini: ${email} (fjalëkalimi nga .env)`);

  // 2. Fotot kryesore të faqes
  await makeImage("hero", "pine", undefined, 1920, 1280);
  await makeImage("atelier", "camel", "Punishtja jonë", 1400, 1120);
  await makeImage("about", "walnut", "Punë dore që nga fillimi", 1200, 1500);

  // 3. Kategoritë
  for (const [i, category] of categories.entries()) {
    const image = await makeImage(`cat-${category.slug}`, category.palette, category.name, 1200, 900);
    await prisma.category.upsert({
      where: { slug: category.slug },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: image.url,
        sortOrder: i,
        published: true,
      },
      update: {},
    });
  }
  console.log(`🗂  ${categories.length} kategori`);

  // 4. Produktet
  for (const [i, product] of products.entries()) {
    const category = await prisma.category.findUnique({ where: { slug: product.category } });
    if (!category) continue;

    const images: { url: string; thumbUrl: string }[] = [];
    for (let j = 1; j <= product.imageCount; j++) {
      images.push(
        await makeImage(
          `prod-${product.slug}-${j}`,
          product.palette,
          j === 1 ? product.title : `${product.title} · ${j}`,
          1400,
          1050
        )
      );
    }

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        title: product.title,
        slug: product.slug,
        description: product.description,
        price: product.price,
        priceNote: product.priceNote,
        dimensions: product.dimensions,
        materials: product.materials,
        featured: product.featured,
        published: true,
        sortOrder: i,
        categoryId: category.id,
        images: {
          create: images.map((img, j) => ({
            url: img.url,
            thumbUrl: img.thumbUrl,
            alt: product.title,
            sortOrder: j,
          })),
        },
      },
    });
  }
  console.log(`🛋  ${products.length} produkte`);

  // 5. Galeria (vetëm nëse është bosh, që të mos prekim punën e adminit)
  const galleryCount = await prisma.galleryItem.count();
  if (galleryCount === 0) {
    for (const [i, item] of galleryItems.entries()) {
      const after = await makeImage(item.key, item.palette, "Pas punimit", 1200, 900);
      let beforeUrl: string | null = null;
      if (item.beforePalette) {
        const before = await makeImage(`${item.key}-para`, item.beforePalette, "Para punimit", 1200, 900);
        beforeUrl = before.url;
      }
      await prisma.galleryItem.create({
        data: {
          title: item.title,
          imageUrl: after.url,
          beforeImageUrl: beforeUrl,
          sortOrder: i,
          published: true,
        },
      });
    }
    console.log(`🖼  ${galleryItems.length} punime në galeri`);
  }

  // 6. Tekstet e faqes (vetëm çelësat që mungojnë — nuk prekim ndryshimet e adminit)
  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.siteSetting.upsert({ where: { key }, create: { key, value }, update: {} });
  }
  console.log(`📝 ${Object.keys(defaultSettings).length} tekste faqeje`);

  // 7. Një mesazh shembull
  const inquiryCount = await prisma.inquiry.count();
  if (inquiryCount === 0) {
    await prisma.inquiry.create({
      data: {
        name: "Klient Shembull",
        phone: "069 000 0000",
        message:
          "Përshëndetje! Sa kushton afërsisht retapicerimi i një divani tre-vendësh? Faleminderit.",
      },
    });
    console.log("✉  1 mesazh shembull");
  }

  console.log("✅ Seed-i përfundoi me sukses.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
