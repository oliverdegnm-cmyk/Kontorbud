import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const SECRET = process.env.JWT_SECRET;

export const SESSION_COOKIE = "kontorbud_session";

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function signSession(payload) {
  if (!SECRET) {
    throw new Error("JWT_SECRET mangler. Tilføj den under Environment Variables på Vercel.");
  }
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

export function verifySession(token) {
  if (!SECRET || !token) return null;
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
}
