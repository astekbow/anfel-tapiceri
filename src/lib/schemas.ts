import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Shkruani emrin tuaj").max(100, "Emri është shumë i gjatë"),
  phone: z.string().trim().min(5, "Shkruani numrin e telefonit").max(30, "Numri është shumë i gjatë"),
  message: z.string().trim().min(5, "Shkruani mesazhin tuaj").max(2000, "Mesazhi është shumë i gjatë"),
  productId: z.string().max(50).optional().nullable(),
});
export type InquiryInput = z.infer<typeof inquirySchema>;

export const productImageSchema = z.object({
  url: z
    .string()
    .min(1)
    .refine((v) => v.startsWith("/") || v.startsWith("https://"), "URL e pavlefshme"),
  thumbUrl: z.string().optional().nullable(),
  alt: z.string().max(200).default(""),
});

export const productSchema = z.object({
  id: z.string().optional().nullable(),
  title: z.string().trim().min(2, "Titulli duhet të ketë të paktën 2 shkronja").max(150),
  description: z.string().trim().min(1, "Shkruani një përshkrim").max(10000),
  categoryId: z.string().min(1, "Zgjidhni një kategori"),
  price: z.number().nonnegative("Çmimi s'mund të jetë negativ").max(100000000).optional().nullable(),
  priceNote: z.string().trim().max(200).optional().nullable(),
  dimensions: z.string().trim().max(300).optional().nullable(),
  materials: z.string().trim().max(500).optional().nullable(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  images: z.array(productImageSchema).max(20, "Maksimumi 20 foto për produkt").default([]),
});
export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  id: z.string().optional().nullable(),
  name: z.string().trim().min(2, "Emri duhet të ketë të paktën 2 shkronja").max(100),
  description: z.string().trim().max(500).optional().nullable(),
  image: z.string().optional().nullable(),
  published: z.boolean().default(true),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const galleryItemSchema = z.object({
  id: z.string().optional().nullable(),
  title: z.string().trim().max(150).optional().nullable(),
  imageUrl: z.string().min(1, "Ngarkoni një foto"),
  beforeImageUrl: z.string().optional().nullable(),
  published: z.boolean().default(true),
});
export type GalleryItemInput = z.infer<typeof galleryItemSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Shkruani një email të vlefshëm"),
  password: z.string().min(1, "Shkruani fjalëkalimin"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z
  .object({
    current: z.string().min(1, "Shkruani fjalëkalimin aktual"),
    next: z.string().min(8, "Fjalëkalimi i ri duhet të ketë të paktën 8 karaktere").max(100),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, {
    message: "Fjalëkalimet nuk përputhen",
    path: ["confirm"],
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
