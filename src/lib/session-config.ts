import type { SessionOptions } from "iron-session";

export interface SessionData {
  adminId?: string;
  email?: string;
}

/**
 * Kthen konfigurimin e sesionit. Verifikimi bëhet këtu (jo në import),
 * që mungesa e SESSION_SECRET të mos rrëzojë build-in apo faqet publike —
 * gabimi shfaqet vetëm kur përdoret vërtet sesioni (rrugët /admin).
 */
export function getSessionOptions(): SessionOptions {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "SESSION_SECRET mungon ose ka më pak se 32 karaktere — vendoseni te variablat e mjedisit (.env ose panelin e hosting-ut)."
      );
    }
    return {
      password: "sekret-vetem-per-zhvillim-mos-e-perdor-ne-prodhim",
      cookieName: "anfel_admin",
      cookieOptions: { secure: false, httpOnly: true, sameSite: "lax" },
    };
  }

  return {
    password: secret,
    cookieName: "anfel_admin",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  };
}
