import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession } from "iron-session";
import { getSessionOptions, type SessionData } from "./session-config";

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), getSessionOptions());
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session.adminId) redirect("/admin/login");
  return session;
}

export async function isAdmin() {
  const session = await getSession();
  return Boolean(session.adminId);
}
