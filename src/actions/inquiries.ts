"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export async function setInquiryRead(
  id: string,
  read: boolean
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  try {
    await prisma.inquiry.update({ where: { id }, data: { read } });
    return { ok: true };
  } catch {
    return { ok: false, error: "Ndryshimi dështoi" };
  }
}

export async function deleteInquiry(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  try {
    await prisma.inquiry.delete({ where: { id } });
    return { ok: true };
  } catch {
    return { ok: false, error: "Fshirja dështoi" };
  }
}
