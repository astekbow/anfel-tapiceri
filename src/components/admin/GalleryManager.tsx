"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveGalleryItem, deleteGalleryItem, moveGalleryItem } from "@/actions/gallery";
import ConfirmButton from "./ConfirmButton";
import ImagePicker from "./ImagePicker";

export interface GalleryRow {
  id: string;
  title: string | null;
  imageUrl: string;
  beforeImageUrl: string | null;
  published: boolean;
}

interface FormState {
  title: string;
  imageUrl: string;
  beforeImageUrl: string;
  published: boolean;
}

const emptyForm: FormState = { title: "", imageUrl: "", beforeImageUrl: "", published: true };

export default function GalleryManager({ items }: { items: GalleryRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const startEdit = (item?: GalleryRow) => {
    if (item) {
      setEditing(item.id);
      setForm({
        title: item.title ?? "",
        imageUrl: item.imageUrl,
        beforeImageUrl: item.beforeImageUrl ?? "",
        published: item.published,
      });
    } else {
      setEditing("new");
      setForm(emptyForm);
    }
  };

  const save = async () => {
    if (!form.imageUrl) {
      toast.error("Ngarkoni foton e punimit");
      return;
    }
    setSaving(true);
    const result = await saveGalleryItem({
      id: editing === "new" ? null : editing,
      title: form.title || null,
      imageUrl: form.imageUrl,
      beforeImageUrl: form.beforeImageUrl || null,
      published: form.published,
    });
    setSaving(false);
    if (result.ok) {
      toast.success(editing === "new" ? "Punimi u shtua" : "Punimi u përditësua");
      setEditing(null);
      router.refresh();
    } else {
      toast.error(result.error ?? "Ruajtja dështoi");
    }
  };

  const remove = async (id: string) => {
    const result = await deleteGalleryItem(id);
    if (result.ok) {
      toast.success("Punimi u fshi");
      router.refresh();
    } else {
      toast.error(result.error ?? "Fshirja dështoi");
    }
  };

  const move = async (id: string, direction: "up" | "down") => {
    const result = await moveGalleryItem(id, direction);
    if (result.ok) router.refresh();
    else toast.error(result.error ?? "Rirenditja dështoi");
  };

  const editorCard = (
    <div className="rounded-2xl border border-camel/60 bg-ivory p-5 sm:col-span-2 lg:col-span-3">
      <h2 className="font-display text-xl text-walnut">
        {editing === "new" ? "Punim i ri" : "Edito punimin"}
      </h2>
      <div className="mt-4 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Titulli (opsionale)</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="p.sh. Divan këndor me porosi për një apartament"
            className="w-full rounded-xl border border-seam bg-ivory px-4 py-2.5 text-[15px] outline-none focus:border-camel"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ImagePicker
            label="Fotoja e punimit (pas)"
            value={form.imageUrl}
            onChange={(imageUrl) => setForm({ ...form, imageUrl })}
          />
          <ImagePicker
            label='Fotoja "para" (opsionale — për krahasim)'
            value={form.beforeImageUrl}
            onChange={(beforeImageUrl) => setForm({ ...form, beforeImageUrl })}
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2.5 text-[15px]">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
            className="h-4 w-4 accent-pine"
          />
          I publikuar
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
    <div>
      {editing === "new" ? (
        <div className="mb-4">{editorCard}</div>
      ) : (
        <button
          type="button"
          onClick={() => startEdit()}
          className="rounded-full bg-pine px-5 py-2.5 text-sm font-semibold text-ivory transition-colors hover:bg-pine-deep"
        >
          + Shto punim
        </button>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) =>
          editing === item.id ? (
            <div key={item.id} className="sm:col-span-2 lg:col-span-3">
              {editorCard}
            </div>
          ) : (
            <div key={item.id} className="overflow-hidden rounded-2xl border border-seam bg-ivory">
              <div className="relative aspect-[4/3] bg-linen">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.title ?? ""} className="h-full w-full object-cover" />
                {item.beforeImageUrl && (
                  <span className="absolute left-2 top-2 rounded-full bg-walnut/70 px-2.5 py-1 text-xs font-medium text-ivory">
                    Para / Pas
                  </span>
                )}
                {!item.published && (
                  <span className="absolute right-2 top-2 rounded-full bg-seam px-2.5 py-1 text-xs font-medium text-mink">
                    Draft
                  </span>
                )}
              </div>
              <div className="p-3.5">
                {item.title && <p className="line-clamp-2 text-sm text-walnut">{item.title}</p>}
                <div className="mt-2.5 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(item.id, "up")}
                    disabled={index === 0}
                    aria-label="Ngjite përpara"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-mink transition-colors hover:bg-seam/60 disabled:opacity-30"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M12 19V5M6 11l6-6 6 6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => move(item.id, "down")}
                    disabled={index === items.length - 1}
                    aria-label="Zbrite prapa"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-mink transition-colors hover:bg-seam/60 disabled:opacity-30"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M12 5v14M6 13l6 6 6-6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="ml-auto rounded-full border border-seam px-3 py-1.5 text-xs font-semibold text-walnut transition-colors hover:border-camel"
                  >
                    Edito
                  </button>
                  <ConfirmButton
                    title="Fshini punimin?"
                    description="Fotot e këtij punimi do të fshihen përfundimisht."
                    onConfirm={() => remove(item.id)}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
                  >
                    Fshi
                  </ConfirmButton>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {items.length === 0 && editing !== "new" && (
        <div className="mt-6 rounded-2xl border border-seam bg-ivory p-10 text-center">
          <p className="italic text-mink">Galeria është bosh — shtoni punimin e parë.</p>
        </div>
      )}
    </div>
  );
}
