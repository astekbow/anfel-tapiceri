"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession, requireAdmin } from "@/lib/session";
import { loginSchema, changePasswordSchema } from "@/lib/schemas";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export async function login(input: { email: string; password: string }): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Të dhëna të pavlefshme" };
  }

  const admin = await prisma.adminUser.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (!admin || !(await bcrypt.compare(parsed.data.password, admin.passwordHash))) {
    return { ok: false, error: "Email ose fjalëkalim i pasaktë" };
  }

  const session = await getSession();
  session.adminId = admin.id;
  session.email = admin.email;
  await session.save();
  return { ok: true };
}

export async function logout(): Promise<void> {
  const session = await getSession();
  session.destroy();
  redirect("/admin/login");
}

export async function changePassword(input: {
  current: string;
  next: string;
  confirm: string;
}): Promise<ActionResult> {
  const session = await requireAdmin();
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Të dhëna të pavlefshme" };
  }

  const admin = await prisma.adminUser.findUnique({ where: { id: session.adminId! } });
  if (!admin || !(await bcrypt.compare(parsed.data.current, admin.passwordHash))) {
    return { ok: false, error: "Fjalëkalimi aktual është i pasaktë" };
  }

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.next, 10) },
  });
  return { ok: true };
}
