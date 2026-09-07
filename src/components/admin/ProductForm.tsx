"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { saveProduct, deleteProduct } from "@/actions/products";
import type { PlainProduct } from "@/lib/types";
import ImageUploader, { type UploadedImage } from "./ImageUploader";
import ConfirmButton from "./ConfirmButton";

const formSchema = z.object({
  title: z.string().trim().min(2, "Titulli duhet të ketë të paktën 2 shkronja").max(150),
  categoryId: z.string().min(1, "Zgjidhni një kategori"),
  description: z.string().trim().min(1, "Shkruani përshkrimin").max(10000),
  dimensions: z.string().trim().max(300).optional(),
  materials: z.string().trim().max(500).optional(),
  featured: z.boolean(),
  published: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

const inputClass =
  "w-full rounded-xl border border-seam bg-ivory px-4 py-2.5 text-[15px] text-walnut outline-none transition-colors focus:border-camel";
const labelClass = "mb-1.5 block text-sm font-medium";

export default function ProductForm({
  categories,
  product,
}: {
  categories: { id: string; name: string }[];
  product?: PlainProduct;
}) {
  const router = useRouter();
  const [images, setImages] = useState<UploadedImage[]>(
    product?.images.map((img) => ({ url: img.url, thumbUrl: img.thumbUrl, alt: img.alt })) ?? []
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: product?.title ?? "",
      categoryId: product?.categoryId ?? "",
      description: product?.description ?? "",
      dimensions: product?.dimensions ?? "",
      materials: product?.materials ?? "",
      featured: product?.featured ?? false,
      published: product?.published ?? true,
    },
  });

  const onSubmit = async (values: FormValues) => {
    const result = await saveProduct({
      id: product?.id ?? null,
      title: values.title,
      categoryId: values.categoryId,
      description: values.description,
      price: null,
      priceNote: null,
      dimensions: values.dimensions?.trim() || null,
      materials: values.materials?.trim() || null,
      featured: values.featured,
      published: values.published,
      images: images.map((img) => ({ url: img.url, thumbUrl: img.thumbUrl, alt: img.alt })),
    });

    if (result.ok) {
      toast.success(product ? "Produkti u përditësua" : "Produkti u krijua");
      router.push("/admin/produktet");
      router.refresh();
    } else {
      toast.error(result.error ?? "Ruajtja dështoi");
    }
  };

  const remove = async () => {
    if (!product) return;
    const result = await deleteProduct(product.id);
    if (result.ok) {
      toast.success("Produkti u fshi");
      router.push("/admin/produktet");
      router.refresh();
    } else {
      toast.error(result.error ?? "Fshirja dështoi");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div className="rounded-2xl border border-seam bg-ivory p-5 sm:p-6">
        <h2 className="font-display text-xl text-walnut">Të dhënat kryesore</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="title" className={labelClass}>
              Titulli
            </label>
            <input id="title" type="text" className={inputClass} {...register("title")} />
            {errors.title && <p className="mt-1 text-sm text-red-700">{errors.title.message}</p>}
          </div>

          <div>
            <label htmlFor="categoryId" className={labelClass}>
              Kategoria
            </label>
            <select id="categoryId" className={inputClass} {...register("categoryId")}>
              <option value="">— Zgjidhni —</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-700">{errors.categoryId.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="dimensions" className={labelClass}>
              Përmasat (opsionale)
            </label>
            <input
              id="dimensions"
              type="text"
              placeholder="p.sh. 220 × 95 × 85 cm"
              className={inputClass}
              {...register("dimensions")}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="materials" className={labelClass}>
              Materialet (opsionale)
            </label>
            <input
              id="materials"
              type="text"
              placeholder="p.sh. stof liri, strukturë ahu"
              className={inputClass}
              {...register("materials")}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="description" className={labelClass}>
              Përshkrimi
            </label>
            <textarea
              id="description"
              rows={6}
              placeholder="Paragrafët ndahen me një rresht bosh."
              className={inputClass}
              {...register("description")}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-700">{errors.description.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-seam bg-ivory p-5 sm:p-6">
        <h2 className="font-display text-xl text-walnut">Fotot</h2>
        <div className="mt-4">
          <ImageUploader images={images} onChange={setImages} />
        </div>
      </div>

      <div className="rounded-2xl border border-seam bg-ivory p-5 sm:p-6">
        <h2 className="font-display text-xl text-walnut">Publikimi</h2>
        <div className="mt-4 space-y-3">
          <label className="flex cursor-pointer items-center gap-2.5 text-[15px]">
            <input type="checkbox" className="h-4 w-4 accent-pine" {...register("published")} />
            I publikuar (i dukshëm në faqe)
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 text-[15px]">
            <input type="checkbox" className="h-4 w-4 accent-pine" {...register("featured")} />
            I zgjedhur (shfaqet në kryefaqe)
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-pine px-7 py-3 text-[15px] font-semibold text-ivory transition-colors hover:bg-pine-deep disabled:opacity-60"
        >
          {isSubmitting ? "Duke ruajtur…" : product ? "Ruaj ndryshimet" : "Krijo produktin"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/produktet")}
          className="rounded-full border border-seam px-6 py-3 text-[15px] font-medium text-walnut transition-colors hover:border-camel"
        >
          Anulo
        </button>
        {product && (
          <ConfirmButton
            title="Fshini produktin?"
            description={`"${product.title}" dhe fotot e tij do të fshihen përfundimisht.`}
            onConfirm={remove}
            className="ml-auto rounded-full px-6 py-3 text-[15px] font-semibold text-red-700 transition-colors hover:bg-red-50"
          >
            Fshi produktin
          </ConfirmButton>
        )}
      </div>
    </form>
  );
}
