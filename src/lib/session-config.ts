import type { SessionOptions } from "iron-session";

export interface SessionData {
  adminId?: string;
  email?: string;
}

const secret = process.env.SESSION_SECRET;

if (!secret && process.env.NODE_ENV === "production") {
  throw new Error("SESSION_SECRET mungon në .env — vendosni një sekret me të paktën 32 karaktere.");
}

export const sessionOptions: SessionOptions = {
  password: secret ?? "sekret-vetem-per-zhvillim-mos-e-perdor-ne-prodhim",
  cookieName: "anfel_admin",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
};
