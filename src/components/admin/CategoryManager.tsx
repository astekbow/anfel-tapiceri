"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveCategory, deleteCategory, moveCategory } from "@/actions/categories";
import ConfirmButton from "./ConfirmButton";
import ImagePicker from "./ImagePicker";

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  published: boolean;
  productCount: number;
}

interface FormState {
  name: string;
  description: string;
  image: string;
  published: boolean;
}

const emptyForm: FormState = { name: "", description: "", image: "", published: true };

const inputClass =
  "w-full rounded-xl border border-seam bg-ivory px-4 py-2.5 text-[15px] text-walnut outline-none transition-colors focus:border-camel";

export default function CategoryManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null); // "new" ose id
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const startEdit = (category?: CategoryRow) => {
    if (category) {
      setEditing(category.id);
      setForm({
        name: category.name,
        description: category.description ?? "",
        image: category.image ?? "",
        published: category.published,
      });
    } else {
      setEditing("new");
      setForm(emptyForm);
    }
  };

  const save = async () => {
    if (form.name.trim().length < 2) {
      toast.error("Emri duhet të ketë të paktën 2 shkronja");
      return;
    }
    setSaving(true);
    const result = await saveCategory({
      id: editing === "new" ? null : editing,
      name: form.name,
      description: form.description || null,
      image: form.image || null,
      published: form.published,
    });
    setSaving(false);
    if (result.ok) {
      toast.success(editing === "new" ? "Kategoria u krijua" : "Kategoria u përditësua");
      setEditing(null);
      router.refresh();
    } else {
      toast.error(result.error ?? "Ruajtja dështoi");
    }
  };

  const remove = async (category: CategoryRow) => {
    const result = await deleteCategory(category.id);
    if (result.ok) {
      toast.success(`"${category.name}" u fshi`);
      router.refresh();
    } else {
      toast.error(result.error ?? "Fshirja dështoi");
    }
  };

  const move = async (id: string, direction: "up" | "down") => {
    const result = await moveCategory(id, direction);
    if (result.ok) {
      router.refresh();
    } else {
      toast.error(result.error ?? "Rirenditja dështoi");
    }
  };

  const editorCard = (
    <div className="rounded-2xl border border-camel/60 bg-ivory p-5">
      <h2 className="font-display text-xl text-walnut">
        {editing === "new" ? "Kategori e re" : "Edito kategorinë"}
      </h2>
      <div className="mt-4 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Emri</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Përshkrimi (opsionale)</label>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={inputClass}
          />
        </div>
        <ImagePicker
          label="Fotoja e kategorisë"
          value={form.image}
          onChange={(image) => setForm({ ...form, image })}
        />
        <label className="flex cursor-pointer items-center gap-2.5 text-[15px]">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
            className="h-4 w-4 accent-pine"
          />
          E publikuar
        </label>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-full bg-pine px-6 py-2.5 text-sm font-semibold text-ivory transition-colors hover:bg-pine-deep disabled:opacity-60"
          >
            {saving ? "Duke ruajtur…" : "Ruaj"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(null)}
            className="rounded-full border border-seam px-6 py-2.5 text-sm font-medium text-walnut transition-colors hover:border-camel"
          >
            Anulo
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {editing === "new" ? (
        editorCard
      ) : (
        <button
          type="button"
          onClick={() => startEdit()}
          className="rounded-full bg-pine px-5 py-2.5 text-sm font-semibold text-ivory transition-colors hover:bg-pine-deep"
        >
          + Shto kategori
        </button>
      )}

      {categories.map((category, index) =>
        editing === category.id ? (
          <div key={category.id}>{editorCard}</div>
        ) : (
          <div
            key={category.id}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-seam bg-ivory p-3 sm:flex-nowrap sm:p-4"
          >
            <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-linen">
              {category.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={category.image} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-walnut">
                {category.name}
                {!category.published && (
                  <span className="ml-2 rounded-full bg-seam/70 px-2.5 py-0.5 text-xs font-medium text-mink">
                    Draft
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-sm text-mink">
                {category.productCount} produkte · /{category.slug}
              </p>
            </div>
            <div className="flex w-full items-center justify-end gap-1 sm:w-auto">
              <button
                type="button"
                onClick={() => move(category.id, "up")}
                disabled={index === 0}
                aria-label="Ngjite lart"
                className="flex h-9 w-9 items-center justify-center rounded-full text-mink transition-colors hover:bg-seam/60 disabled:opacity-30"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M12 19V5M6 11l6-6 6 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => move(category.id, "down")}
                disabled={index === categories.length - 1}
                aria-label="Zbrite poshtë"
                className="flex h-9 w-9 items-center justify-center rounded-full text-mink transition-colors hover:bg-seam/60 disabled:opacity-30"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M12 5v14M6 13l6 6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => startEdit(category)}
                className="rounded-full border border-seam px-3.5 py-1.5 text-xs font-semibold text-walnut transition-colors hover:border-camel"
              >
                Edito
              </button>
              <ConfirmButton
                title="Fshini kategorinë?"
                description={
                  category.productCount > 0
                    ? `Kategoria ka ${category.productCount} produkte — s'mund të fshihet pa i zhvendosur ato.`
                    : `"${category.name}" do të fshihet përfundimisht.`
                }
                onConfirm={() => remove(category)}
                className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
              >
                Fshi
              </ConfirmButton>
            </div>
          </div>
        )
      )}
    </div>
  );
}
