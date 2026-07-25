import { mapApiToFormData } from "./mapper";

describe("mapApiToFormData (peixaria)", () => {
  it("preenche dataColeta e consecutivoColeta a partir do cod_peixaria no formato do frontend", () => {
    const result = mapApiToFormData({
      cod_peixaria: "JP TB 25 07 26 01"
    });

    expect(result.dataColeta).toBe("2026-07-25");
    expect(result.consecutivoColeta).toBe("1");
  });

  it("normaliza perdas_por_especie achatadas em grupos por titulo com causas padrao", () => {
    const result = mapApiToFormData({
      perdas_por_especie: [
        { ID_perda_por_especie: 1, titulo: "Espécie 1", causa: "Deterioração", estimativa: "10", destino: "Descarte" },
        { ID_perda_por_especie: 2, titulo: "Espécie 1", causa: "Falta de mercado", estimativa: "5", destino: "Doação" },
        { ID_perda_por_especie: 3, titulo: "Espécie 1", causa: "Transporte", estimativa: "2", destino: "Venda local" }
      ]
    });

    expect(result.perdasPorEspecie).toHaveLength(3);
    expect(result.perdasPorEspecie[0].titulo).toBe("Espécie 1");
    expect(result.perdasPorEspecie[0].linhas).toHaveLength(3);
    expect(result.perdasPorEspecie[0].linhas[0]).toEqual({
      causa: "Deterioração",
      estimativa: "10",
      destino: "Descarte"
    });
    expect(result.perdasPorEspecie[0].linhas[1]).toEqual({
      causa: "Falta de mercado",
      estimativa: "5",
      destino: "Doação"
    });
    expect(result.perdasPorEspecie[0].linhas[2]).toEqual({
      causa: "Transporte",
      estimativa: "2",
      destino: "Venda local"
    });
  });
});
