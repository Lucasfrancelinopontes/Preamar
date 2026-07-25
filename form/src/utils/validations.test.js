import { validarDataSaidaChegada } from "./validations";

describe("validarDataSaidaChegada", () => {
  it("aceita quando a saida e anterior a chegada", () => {
    expect(validarDataSaidaChegada("2026-07-25T08:00", "2026-07-25T09:00")).toBe(true);
  });

  it("rejeita quando a saida e igual ou posterior a chegada", () => {
    expect(validarDataSaidaChegada("2026-07-25T10:00", "2026-07-25T09:00")).toBe(false);
    expect(validarDataSaidaChegada("2026-07-25T10:00", "2026-07-25T10:00")).toBe(false);
  });
});
