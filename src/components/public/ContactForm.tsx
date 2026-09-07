"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().trim().min(2, "Shkruani emrin tuaj").max(100),
  phone: z.string().trim().min(5, "Shkruani numrin e telefonit").max(30),
  message: z.string().trim().min(5, "Shkruani mesazhin tuaj").max(2000),
});

type FormValues = z.infer<typeof formSchema>;

const inputClass =
  "w-full rounded-xl border border-seam bg-ivory px-4 py-3 text-[15px] text-walnut outline-none transition-colors placeholder:text-mink/60 focus:border-camel";

export default function ContactForm({
  productId,
  defaultMessage,
}: {
  productId?: string;
  defaultMessage?: string;
}) {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", phone: "", message: defaultMessage ?? "" },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, productId: productId ?? null, website: honeypot }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setServerError(data.error ?? "Dërgimi dështoi. Provoni përsëri.");
        return;
      }
      setSent(true);
    } catch {
      setServerError("Dërgimi dështoi. Kontrolloni lidhjen dhe provoni përsëri.");
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-pine/25 bg-pine/5 p-6 text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-pine text-ivory">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M4.5 12.5l5 5 10-11" />
          </svg>
        </span>
        <p className="mt-4 font-display text-xl text-pine">Faleminderit!</p>
        <p className="mt-1.5 text-[15px] text-mink">
          Mesazhi juaj u dërgua — ju kontaktojmë së shpejti.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />

      <div>
        <label htmlFor="cf-name" className="mb-1.5 block text-sm font-medium">
          Emri
        </label>
        <input id="cf-name" type="text" autoComplete="name" className={inputClass} {...register("name")} />
        {errors.name && <p className="mt-1 text-sm text-red-700">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="cf-phone" className="mb-1.5 block text-sm font-medium">
          Telefoni
        </label>
        <input id="cf-phone" type="tel" autoComplete="tel" className={inputClass} {...register("phone")} />
        {errors.phone && <p className="mt-1 text-sm text-red-700">{errors.phone.message}</p>}
      </div>

      <div>
        <label htmlFor="cf-message" className="mb-1.5 block text-sm font-medium">
          Mesazhi
        </label>
        <textarea id="cf-message" rows={5} className={inputClass} {...register("message")} />
        {errors.message && <p className="mt-1 text-sm text-red-700">{errors.message.message}</p>}
      </div>

      {serverError && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-pine px-6 py-3.5 text-[15px] font-semibold text-ivory transition-colors hover:bg-pine-deep disabled:opacity-60 sm:w-auto sm:min-w-48"
      >
        {isSubmitting ? "Duke dërguar…" : "Dërgo mesazhin"}
      </button>
    </form>
  );
}
