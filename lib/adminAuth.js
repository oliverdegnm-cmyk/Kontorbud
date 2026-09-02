import { cookies } from "next/headers";
import { pool } from "@/lib/db";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

export async function requireAdmin() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const payload = verifySession(token);
  if (!payload) return null;

  const { rows } = await pool.query("SELECT id, name, is_admin FROM users WHERE id = $1", [payload.userId]);
  const user = rows[0];
  if (!user?.is_admin) return null;

  return user;
}
