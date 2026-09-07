"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveSettings } from "@/actions/settings";
import type { SettingsSection } from "@/lib/settings";
import ImagePicker from "./ImagePicker";

const inputClass =
  "w-full rounded-xl border border-seam bg-ivory px-4 py-2.5 text-[15px] text-walnut outline-none transition-colors focus:border-camel";

export default function SettingsSectionForm({
  section,
  values,
  defaultOpen = false,
}: {
  section: SettingsSection;
  values: Record<string, string>;
  defaultOpen?: boolean;
}) {
  const router = useRouter();
  const [state, setState] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of section.fields) initial[field.key] = values[field.key] ?? "";
    return initial;
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const result = await saveSettings(state);
    setSaving(false);
    if (result.ok) {
      toast.success(`"${section.title}" u ruajt`);
      router.refresh();
    } else {
      toast.error(result.error ?? "Ruajtja dështoi");
    }
  };

  return (
    <details
      open={defaultOpen}
      className="group rounded-2xl border border-seam bg-ivory open:border-camel/50"
    >
      <summary className="flex cursor-pointer select-none items-center justify-between px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="font-display text-lg text-walnut">{section.title}</span>
          {section.description && (
            <span className="mt-0.5 block text-sm text-mink">{section.description}</span>
          )}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 shrink-0 text-mink transition-transform group-open:rotate-180"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </summary>

      <div className="space-y-4 border-t border-seam px-5 py-5">
        {section.fields.map((field) => (
          <div key={field.key}>
            {field.type === "image" ? (
              <ImagePicker
                label={field.label}
                value={state[field.key]}
                onChange={(url) => setState({ ...state, [field.key]: url })}
              />
            ) : (
              <>
                <label htmlFor={field.key} className="mb-1.5 block text-sm font-medium">
                  {field.label}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    id={field.key}
                    rows={state[field.key].length > 200 ? 8 : 3}
                    value={state[field.key]}
                    onChange={(e) => setState({ ...state, [field.key]: e.target.value })}
                    className={inputClass}
                  />
                ) : (
                  <input
                    id={field.key}
                    type="text"
                    value={state[field.key]}
                    onChange={(e) => setState({ ...state, [field.key]: e.target.value })}
                    className={inputClass}
                  />
                )}
              </>
            )}
            {field.help && <p className="mt-1 text-xs text-mink">{field.help}</p>}
          </div>
        ))}

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-full bg-pine px-6 py-2.5 text-sm font-semibold text-ivory transition-colors hover:bg-pine-deep disabled:opacity-60"
        >
          {saving ? "Duke ruajtur…" : "Ruaj seksionin"}
        </button>
      </div>
    </details>
  );
}
