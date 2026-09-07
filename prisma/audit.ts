import path from "path";
import { promises as fs } from "fs";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const UPLOAD_DIR = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "./uploads");

async function fileExists(url: string | null | undefined): Promise<boolean | null> {
  if (!url || url.startsWith("http")) return null; // bosh ose në cloud - s'kontrollohet
  if (!url.startsWith("/uploads/")) return null;
  try {
    await fs.access(path.join(UPLOAD_DIR, path.basename(url)));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (process.argv[2] === "cleanup") {
    const removed = await prisma.inquiry.deleteMany({ where: { name: "Audit Test" } });
    console.log(`Pastrimi: ${removed.count} mesazhe testi u fshinë`);
    return;
  }

  const [categories, products, gallery, settings, inquiries, admins] = await Promise.all([
    prisma.category.findMany({ include: { _count: { select: { products: true } } } }),
    prisma.product.findMany({ include: { images: true } }),
    prisma.galleryItem.findMany(),
    prisma.siteSetting.findMany(),
    prisma.inquiry.count(),
    prisma.adminUser.findMany(),
  ]);

  console.log("== DATABAZA ==");
  console.log(`Kategori: ${categories.length} (të publikuara: ${categories.filter((c) => c.published).length})`);
  console.log(`Produkte: ${products.length} (të publikuara: ${products.filter((p) => p.published).length}, featured: ${products.filter((p) => p.featured).length})`);
  console.log(`Foto produktesh: ${products.reduce((n, p) => n + p.images.length, 0)}`);
  console.log(`Galeri: ${gallery.length} (para/pas: ${gallery.filter((g) => g.beforeImageUrl).length})`);
  console.log(`Cilësime/tekste: ${settings.length}`);
  console.log(`Mesazhe: ${inquiries}`);
  console.log(`Administratorë: ${admins.length} (${admins.map((a) => a.email).join(", ")})`);

  console.log("\n== FJALËKALIMI ==");
  const ok = admins[0] && (await bcrypt.compare("Anfel2026", admins[0].passwordHash));
  console.log(`"Anfel2026" përputhet me hash-in: ${ok ? "PO ✓" : "JO ✗"}`);

  console.log("\n== INTEGRITETI ==");
  const missing: string[] = [];
  for (const p of products) {
    if (p.published && p.images.length === 0) missing.push(`Produkt pa foto: ${p.slug}`);
    for (const img of p.images) {
      if ((await fileExists(img.url)) === false) missing.push(`Foto mungon në disk: ${img.url}`);
      if ((await fileExists(img.thumbUrl)) === false) missing.push(`Thumb mungon: ${img.thumbUrl}`);
    }
  }
  for (const c of categories) {
    if ((await fileExists(c.image)) === false) missing.push(`Foto kategorie mungon: ${c.image}`);
  }
  for (const g of gallery) {
    if ((await fileExists(g.imageUrl)) === false) missing.push(`Foto galerie mungon: ${g.imageUrl}`);
    if ((await fileExists(g.beforeImageUrl)) === false) missing.push(`Foto 'para' mungon: ${g.beforeImageUrl}`);
  }
  const imageKeys = ["hero.image", "home.about.image", "about.image", "seo.ogImage", "header.logo"];
  for (const key of imageKeys) {
    const row = settings.find((s) => s.key === key);
    if (row && (await fileExists(row.value)) === false) missing.push(`Foto e cilësimit '${key}' mungon: ${row.value}`);
  }
  console.log(missing.length === 0 ? "Të gjitha fotot e referuara ekzistojnë në disk ✓" : missing.join("\n"));

  const emptyCats = categories.filter((c) => c.published && c._count.products === 0);
  if (emptyCats.length > 0) {
    console.log(`Kategori bosh (informative): ${emptyCats.map((c) => c.slug).join(", ")}`);
  }

  console.log("\nSLUGS_JSON=" + JSON.stringify(products.filter((p) => p.published).map((p) => p.slug)));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
