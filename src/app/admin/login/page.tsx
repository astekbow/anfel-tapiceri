"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "@/actions/auth";
import { loginSchema, type LoginInput } from "@/lib/schemas";

const inputClass =
  "w-full rounded-xl border border-seam bg-ivory px-4 py-3 text-[15px] text-walnut outline-none transition-colors focus:border-camel";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginInput) => {
    setError(null);
    const result = await login(values);
    if (result.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError(result.error ?? "Hyrja dështoi");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linen px-4">
      <div className="w-full max-w-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/uploads/logo.svg" alt="Anfel Tapiceri" className="mx-auto h-16 w-auto" />
        <div className="stitch mx-auto mt-5 w-16" />

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mt-8 rounded-2xl border border-seam bg-ivory p-6 shadow-sm"
        >
          <h1 className="font-display text-xl text-walnut">Hyrje në panel</h1>

          <div className="mt-5">
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              Email
            </label>
            <input id="email" type="email" autoComplete="email" className={inputClass} {...register("email")} />
            {errors.email && <p className="mt-1 text-sm text-red-700">{errors.email.message}</p>}
          </div>

          <div className="mt-4">
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
              Fjalëkalimi
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className={inputClass}
              {...register("password")}
            />
            {errors.password && <p className="mt-1 text-sm text-red-700">{errors.password.message}</p>}
          </div>

          {error && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-full bg-pine px-6 py-3 text-[15px] font-semibold text-ivory transition-colors hover:bg-pine-deep disabled:opacity-60"
          >
            {isSubmitting ? "Duke hyrë…" : "Hyr"}
          </button>
        </form>
      </div>
    </div>
  );
}
