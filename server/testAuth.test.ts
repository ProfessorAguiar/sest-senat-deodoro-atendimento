import { describe, expect, it } from "vitest";
import { TEST_LOGIN_EMAIL, getTestUser, isTestAccount, verifyTestPassword } from "./testAuth";

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
});
