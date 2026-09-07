import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { inquirySchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // honeypot kundër spam-it: fusha "website" duhet të jetë bosh
    if (typeof body.website === "string" && body.website.trim() !== "") {
      return NextResponse.json({ ok: true });
    }

    const parsed = inquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? "Të dhëna të pavlefshme" },
        { status: 400 }
      );
    }

    let productId: string | null = null;
    if (parsed.data.productId) {
      const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
      productId = product?.id ?? null;
    }

    await prisma.inquiry.create({
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        message: parsed.data.message,
        productId,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("inquiry:", err);
    return NextResponse.json(
      { ok: false, error: "Dërgimi dështoi. Provoni përsëri ose na shkruani në WhatsApp." },
      { status: 500 }
    );
  }
}
