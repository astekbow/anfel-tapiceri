"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { uploadImages } from "./upload-client";

export default function ImagePicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const [file] = await uploadImages([files[0]]);
      onChange(file.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ngarkimi dështoi");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      {label && <p className="mb-1.5 text-sm font-medium">{label}</p>}
      <div className="flex items-center gap-3">
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-seam bg-linen">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-xs text-mink/60">
              Pa foto
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-full border border-seam bg-ivory px-4 py-2 text-sm font-medium text-walnut transition-colors hover:border-camel disabled:opacity-60"
          >
            {uploading ? "Duke ngarkuar…" : value ? "Ndrysho foton" : "Ngarko foto"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="rounded-full px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
            >
              Hiq
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
