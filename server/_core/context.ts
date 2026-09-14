import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { getTestUserFromRequest, isTestAccount, getTestUser } from "../testAuth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  if (!user) {
    user = await getTestUserFromRequest(opts.req);
  }

  // Apply the application's explicit area mapping to the two homologation
  // accounts even when the user arrived through the existing OAuth provider.
  let mappedEmail: string | undefined;
  if (user?.email && isTestAccount(user.email)) mappedEmail = user.email;
  else if (user?.name?.toLowerCase().includes("vinicius")) mappedEmail = "viniciusaguiar@sestsenat.org.br";
  else if (user?.name?.toLowerCase().includes("erika")) mappedEmail = "erika@sestsenat.org.br";
  if (user && mappedEmail) {
    const mapped = getTestUser(mappedEmail);
    user = { ...user, name: mapped.name, role: mapped.role, loginMethod: user.loginMethod || mapped.loginMethod };
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
