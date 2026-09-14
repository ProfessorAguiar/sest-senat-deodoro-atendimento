import { createHash, timingSafeEqual, scryptSync } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import type { Response, Request } from "express";
import type { User } from "../drizzle/schema";

export const TEST_LOGIN_EMAIL = process.env.TEST_LOGIN_EMAIL || "viniciusaguiar@sestsenat.org.br";
const TEST_PASSWORD_HASH = process.env.TEST_LOGIN_PASSWORD_HASH || "3930142bbdb03cadaa126dff20b134be:42005ceb967302c65283f7823d3a715b8866f7ce31cd5c609d303119425aaaa7bba198162652a64eb98f82cf34f586a8e630b60fe3e890833eb61a2fd83f1d98";
export const TEST_SESSION_COOKIE = "sest_test_session";
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "sest-senat-local-development-secret-change-in-production");

export const testUser: User = {
  id: 900001,
  openId: "test-login-viniciusaguiar",
  name: "Vinicius Aguiar",
  email: TEST_LOGIN_EMAIL,
  loginMethod: "test_password",
  role: "admin",
  createdAt: new Date(0),
  updatedAt: new Date(0),
  lastSignedIn: new Date(),
};

export function verifyTestPassword(password: string): boolean {
  const [salt, expectedHex] = TEST_PASSWORD_HASH.split(":");
  if (!salt || !expectedHex) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function issueTestSession(res: Response, req: Request) {
  const token = await new SignJWT({ sub: testUser.openId, email: testUser.email, role: testUser.role, test: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(JWT_SECRET);
  const secure = req.protocol === "https" || String(req.headers["x-forwarded-proto"] || "").includes("https");
  res.cookie(TEST_SESSION_COOKIE, token, { httpOnly: true, sameSite: secure ? "none" : "lax", secure, path: "/", maxAge: 8 * 60 * 60 * 1000 });
}

export async function getTestUserFromRequest(req: Request): Promise<User | null> {
  const token = req.cookies?.[TEST_SESSION_COOKIE];
  if (!token) return null;
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    if (verified.payload.test !== true || verified.payload.email !== TEST_LOGIN_EMAIL) return null;
    return { ...testUser, lastSignedIn: new Date() };
  } catch {
    return null;
  }
}

export function clearTestSession(res: Response, req: Request) {
  if (!req.cookies?.[TEST_SESSION_COOKIE]) return;
  const secure = req.protocol === "https" || String(req.headers["x-forwarded-proto"] || "").includes("https");
  res.clearCookie(TEST_SESSION_COOKIE, { httpOnly: true, sameSite: secure ? "none" : "lax", secure, path: "/" });
}
