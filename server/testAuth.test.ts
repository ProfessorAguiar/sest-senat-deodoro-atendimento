import { describe, expect, it } from "vitest";
import { TEST_LOGIN_EMAIL, getTestUser, getTestUserFromRequest, isTestAccount, issueTestSession, verifyTestPassword } from "./testAuth";

describe("Login e perfis de homologação", () => {
  it("mapeia Vinicius para Vendas e Erika para Coordenação", () => {
    expect(TEST_LOGIN_EMAIL).toBe("viniciusaguiar@sestsenat.org.br");
    expect(isTestAccount(TEST_LOGIN_EMAIL)).toBe(true);
    expect(isTestAccount("erika@sestsenat.org.br")).toBe(true);
    expect(getTestUser(TEST_LOGIN_EMAIL).role).toBe("user");
    expect(getTestUser("erika@sestsenat.org.br").role).toBe("admin");
  });

  it("rejeita senha incorreta", () => {
    expect(verifyTestPassword("senha-incorreta")).toBe(false);
  });

  it("lê a sessão emitida mesmo sem middleware req.cookies", async () => {
    let cookie = "";
    const response = { cookie: (_name: string, value: string) => { cookie = value; } } as any;
    const request = { protocol: "https", headers: { "x-forwarded-proto": "https" } } as any;
    await issueTestSession(response, request, TEST_LOGIN_EMAIL);
    const authenticated = await getTestUserFromRequest({ headers: { cookie: `sest_test_session_v2=${cookie}` } } as any);
    expect(authenticated?.email).toBe(TEST_LOGIN_EMAIL);
    expect(authenticated?.role).toBe("user");
  });
});
