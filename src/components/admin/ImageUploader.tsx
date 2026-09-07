"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { uploadImages } from "./upload-client";

export interface UploadedImage {
  url: string;
  thumbUrl: string | null;
  alt: string;
}

function SortableImage({
  image,
  index,
  onRemove,
  onMakeMain,
  onAltChange,
}: {
  image: UploadedImage;
  index: number;
  onRemove: () => void;
  onMakeMain: () => void;
  onAltChange: (alt: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.url,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`w-32 ${isDragging ? "z-10 opacity-80" : ""}`}
    >
      <div className="relative">
        <div
          {...attributes}
          {...listeners}
          className="relative h-24 w-32 cursor-grab overflow-hidden rounded-xl border border-seam bg-linen active:cursor-grabbing"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.thumbUrl || image.url}
            alt={image.alt}
            className="h-full w-full object-cover"
            draggable={false}
          />
          {index === 0 && (
            <span className="absolute bottom-1 left-1 rounded-full bg-pine px-2 py-0.5 text-[11px] font-semibold text-ivory">
              Kryesore
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Hiq foton"
          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-700 text-white shadow hover:bg-red-800"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" className="h-3.5 w-3.5">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        {index !== 0 && (
          <button
            type="button"
            onClick={onMakeMain}
            className="absolute -left-1 -top-2 rounded-full bg-camel px-2 py-0.5 text-[11px] font-semibold text-walnut shadow hover:bg-camel-soft"
          >
            Bëje kryesore
          </button>
        )}
      </div>
      <input
        type="text"
        value={image.alt}
        onChange={(e) => onAltChange(e.target.value)}
        placeholder="Përshkrimi i fotos"
        className="mt-1.5 w-full rounded-lg border border-seam bg-ivory px-2 py-1 text-xs outline-none focus:border-camel"
      />
    </div>
  );
}

export default function ImageUploader({
  images,
  onChange,
}: {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleFiles = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded = await uploadImages(files);
      onChange([...images, ...uploaded.map((f) => ({ ...f, alt: "" }))]);
      toast.success(`${uploaded.length} foto u ngarkuan`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ngarkimi dështoi");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = images.findIndex((img) => img.url === active.id);
    const newIndex = images.findIndex((img) => img.url === over.id);
    onChange(arrayMove(images, oldIndex, newIndex));
  };

  const update = (index: number, patch: Partial<UploadedImage>) => {
    onChange(images.map((img, i) => (i === index ? { ...img, ...patch } : img)));
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
          dragOver ? "border-camel bg-camel/5" : "border-seam bg-ivory hover:border-camel/60"
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-camel">
          <path d="M12 16V5M7.5 9.5 12 5l4.5 4.5" />
          <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
        </svg>
        <p className="mt-3 text-[15px] font-medium text-walnut">
          {uploading ? "Duke ngarkuar…" : "Tërhiqni fotot këtu ose klikoni për t'i zgjedhur"}
        </p>
        <p className="mt-1 text-sm text-mink">JPG, PNG ose WebP · optimizohen automatikisht</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {images.length > 0 && (
        <>
          <p className="mt-4 text-sm text-mink">
            Tërhiqni fotot për t'i rirenditur — e para është fotoja kryesore.
          </p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={images.map((img) => img.url)} strategy={rectSortingStrategy}>
              <div className="mt-3 flex flex-wrap gap-4">
                {images.map((image, index) => (
                  <SortableImage
                    key={image.url}
                    image={image}
                    index={index}
                    onRemove={() => onChange(images.filter((_, i) => i !== index))}
                    onMakeMain={() =>
                      onChange([images[index], ...images.filter((_, i) => i !== index)])
                    }
                    onAltChange={(alt) => update(index, { alt })}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}
    </div>
  );
}
