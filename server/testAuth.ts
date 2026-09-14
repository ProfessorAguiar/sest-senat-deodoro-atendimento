import { timingSafeEqual, scryptSync } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { parse as parseCookies } from "cookie";
import type { Response, Request } from "express";
import type { User } from "../drizzle/schema";

export const TEST_SESSION_COOKIE = "sest_test_session";
const TEST_PASSWORD_HASH = process.env.TEST_LOGIN_PASSWORD_HASH || "3930142bbdb03cadaa126dff20b134be:42005ceb967302c65283f7823d3a715b8866f7ce31cd5c609d303119425aaaa7bba198162652a64eb98f82cf34f586a8e630b60fe3e890833eb61a2fd83f1d98";
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "sest-senat-local-development-secret-change-in-production");

const accounts = {
  "viniciusaguiar@sestsenat.org.br": { name: "Vinicius Aguiar", role: "user" as const, area: "Vendas" },
  "erika@sestsenat.org.br": { name: "Erika", role: "admin" as const, area: "Coordenação" },
};
export const TEST_LOGIN_EMAIL = "viniciusaguiar@sestsenat.org.br";

export function verifyTestPassword(password: string): boolean {
  const [salt, expectedHex] = TEST_PASSWORD_HASH.split(":");
  if (!salt || !expectedHex) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function userForEmail(email: string): User {
  const account = accounts[email.toLowerCase() as keyof typeof accounts];
  return { id: account.role === "admin" ? 900002 : 900001, openId: `test-login-${email}`, name: account.name, email, loginMethod: "test_password", role: account.role, createdAt: new Date(0), updatedAt: new Date(0), lastSignedIn: new Date() };
}

export function isTestAccount(email: string) { return Boolean(accounts[email.toLowerCase() as keyof typeof accounts]); }
export function getTestUser(email: string) { return userForEmail(email); }

function getTestCookie(req: Request) {
  const parsed = req.cookies || parseCookies(req.headers.cookie || "");
  return parsed[TEST_SESSION_COOKIE];
}

export async function issueTestSession(res: Response, req: Request, email: string) {
  const user = userForEmail(email);
  const token = await new SignJWT({ sub: user.openId, email: user.email, role: user.role, area: accounts[email.toLowerCase() as keyof typeof accounts].area, test: true }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("8h").sign(JWT_SECRET);
  const secure = req.protocol === "https" || String(req.headers["x-forwarded-proto"] || "").includes("https");
  res.cookie(TEST_SESSION_COOKIE, token, { httpOnly: true, sameSite: secure ? "none" : "lax", secure, path: "/", maxAge: 8 * 60 * 60 * 1000 });
}

export async function getTestUserFromRequest(req: Request): Promise<User | null> {
  const token = getTestCookie(req);
  if (!token) return null;
  try { const verified = await jwtVerify(token, JWT_SECRET); if (verified.payload.test !== true || typeof verified.payload.email !== "string" || !isTestAccount(verified.payload.email)) return null; return userForEmail(verified.payload.email); } catch { return null; }
}

export function clearTestSession(res: Response, req: Request) { if (!getTestCookie(req)) return; const secure = req.protocol === "https" || String(req.headers["x-forwarded-proto"] || "").includes("https"); res.clearCookie(TEST_SESSION_COOKIE, { httpOnly: true, sameSite: secure ? "none" : "lax", secure, path: "/" }); }
