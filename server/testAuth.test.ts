import { describe, expect, it } from "vitest";
import { TEST_LOGIN_EMAIL, verifyTestPassword } from "./testAuth";

describe("Login de homologação", () => {
  it("mantém o email de homologação e rejeita senha incorreta", () => {
    expect(TEST_LOGIN_EMAIL).toBe("viniciusaguiar@sestsenat.org.br");
    expect(verifyTestPassword("senha-incorreta")).toBe(false);
  });
});
