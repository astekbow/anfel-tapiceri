"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { allSettingKeys } from "@/lib/settings";

export async function saveSettings(
  entries: Record<string, string>
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  try {
    const valid = Object.entries(entries).filter(
      ([key, value]) => allSettingKeys.has(key) && typeof value === "string" && value.length <= 20000
    );
    if (valid.length === 0) return { ok: false, error: "S'ka asgjë për të ruajtur" };

    await prisma.$transaction(
      valid.map(([key, value]) =>
        prisma.siteSetting.upsert({
          where: { key },
          create: { key, value },
          update: { value },
        })
      )
    );
    return { ok: true };
  } catch (err) {
    console.error("saveSettings:", err);
    return { ok: false, error: "Ruajtja dështoi. Provoni përsëri." };
  }
}
