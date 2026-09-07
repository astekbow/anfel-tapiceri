"use client";

import { useState } from "react";

export default function ConfirmButton({
  title,
  description,
  confirmLabel = "Fshi",
  onConfirm,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-walnut/50 p-4"
          onClick={() => !busy && setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-seam bg-ivory p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-label={title}
          >
            <h2 className="font-display text-xl text-walnut">{title}</h2>
            {description && <p className="mt-2 text-[15px] leading-relaxed text-mink">{description}</p>}
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={busy}
                className="rounded-full border border-seam px-5 py-2.5 text-sm font-medium text-walnut transition-colors hover:border-camel disabled:opacity-60"
              >
                Anulo
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={busy}
                className="rounded-full bg-red-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-800 disabled:opacity-60"
              >
                {busy ? "Duke fshirë…" : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
