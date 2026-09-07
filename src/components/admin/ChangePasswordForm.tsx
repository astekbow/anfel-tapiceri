"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { changePassword } from "@/actions/auth";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/schemas";

const inputClass =
  "w-full rounded-xl border border-seam bg-ivory px-4 py-2.5 text-[15px] text-walnut outline-none transition-colors focus:border-camel";

export default function ChangePasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current: "", next: "", confirm: "" },
  });

  const onSubmit = async (values: ChangePasswordInput) => {
    const result = await changePassword(values);
    if (result.ok) {
      toast.success("Fjalëkalimi u ndryshua");
      reset();
    } else {
      toast.error(result.error ?? "Ndryshimi dështoi");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <label htmlFor="current" className="mb-1.5 block text-sm font-medium">
          Fjalëkalimi aktual
        </label>
        <input
          id="current"
          type="password"
          autoComplete="current-password"
          className={inputClass}
          {...register("current")}
        />
        {errors.current && <p className="mt-1 text-sm text-red-700">{errors.current.message}</p>}
      </div>
      <div>
        <label htmlFor="next" className="mb-1.5 block text-sm font-medium">
          Fjalëkalimi i ri
        </label>
        <input
          id="next"
          type="password"
          autoComplete="new-password"
          className={inputClass}
          {...register("next")}
        />
        {errors.next && <p className="mt-1 text-sm text-red-700">{errors.next.message}</p>}
      </div>
      <div>
        <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium">
          Përsërisni fjalëkalimin e ri
        </label>
        <input
          id="confirm"
          type="password"
          autoComplete="new-password"
          className={inputClass}
          {...register("confirm")}
        />
        {errors.confirm && <p className="mt-1 text-sm text-red-700">{errors.confirm.message}</p>}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-pine px-6 py-2.5 text-sm font-semibold text-ivory transition-colors hover:bg-pine-deep disabled:opacity-60"
      >
        {isSubmitting ? "Duke ndryshuar…" : "Ndrysho fjalëkalimin"}
      </button>
    </form>
  );
}
