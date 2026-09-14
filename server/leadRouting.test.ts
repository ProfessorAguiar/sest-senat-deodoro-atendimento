import { describe, expect, it } from "vitest";
import { determineDestination, buildTeamsAdaptiveCardText } from "./teamsDispatcher";
import { isTransportCnae } from "./cnpjService";
import { SEST_SENAT_UNITS, findNearestUnit } from "./sestSenatUnits";

describe("Regras de Roteamento SEST SENAT Deodoro", () => {
  const deodoroUnit = SEST_SENAT_UNITS[0];

  it("deve identificar corretamente CNAEs do setor de transporte", () => {
    expect(isTransportCnae("4930-2/02", "Transporte rodoviário de carga")).toBe(true);
    expect(isTransportCnae("5211-7/99", "Armazenamento e logística")).toBe(true);
    expect(isTransportCnae("4711-3/01", "Comércio varejista")).toBe(false);
  });

  it("deve encaminhar grandes clientes (mais de 15 alunos) para a Coordenação", () => {
    const payload: any = {
      tipoAtendimento: "empresa",
      clienteNome: "Carlos Gestor",
      empresaNome: "Expresso Sudeste Logística",
      documento: "12.345.678/0001-90",
      contato: "carlos@expresso.com.br",
      cursosSelecionados: [
        { id: "1", name: "Direção Defensiva", studentCount: 20 }
      ],
      necessidadesIdentificadas: ["Redução de custos operacionais"],
      cnpjData: { isTransporteOrLogistica: true, temPendencia: false },
      nearestUnit: deodoroUnit
    };

    const result = determineDestination(payload);
    expect(result.destination).toBe("coordenacao");
    expect(result.isMajorAccount).toBe(true);
  });

  it("deve encaminhar demandas menores de empresa para o Setor de Vendas", () => {
    const payload: any = {
      tipoAtendimento: "empresa",
      clienteNome: "Mariana Silva",
      empresaNome: "Padaria e Confeitaria Silva",
      documento: "98.765.432/0001-10",
      contato: "(21) 98888-7777",
      cursosSelecionados: [
        { id: "2", name: "Excel Básico", studentCount: 3 }
      ],
      necessidadesIdentificadas: ["Treinar administrativo"],
      cnpjData: { isTransporteOrLogistica: false, temPendencia: false },
      nearestUnit: deodoroUnit
    };

    const result = determineDestination(payload);
    expect(result.destination).toBe("vendas");
    expect(result.isMajorAccount).toBe(false);
  });

  it("deve encaminhar pessoa física (CPF) para o Setor de Vendas", () => {
    const payload: any = {
      tipoAtendimento: "individual",
      clienteNome: "João da Silva",
      documento: "123.456.789-00",
      contato: "joao@gmail.com",
      cursosSelecionados: [
        { id: "1", name: "Direção Defensiva", studentCount: 1 }
      ],
      necessidadesIdentificadas: [],
      cpfData: { isRegistered: true, mensagem: "Já cadastrado" },
      nearestUnit: deodoroUnit
    };

    const result = determineDestination(payload);
    expect(result.destination).toBe("vendas");
  });

  it("deve localizar a unidade Deodoro como prioritária ou a mais próxima por coordenadas", () => {
    const unitResult = findNearestUnit(-22.855, -43.376);
    expect(unitResult.nearest.id).toBe("deodoro-rj");
  });

  it("deve gerar resumo para o Teams com menção expressa de nunca enviar valores pelo chat", () => {
    const payload: any = {
      tipoAtendimento: "empresa",
      clienteNome: "Roberto Frota",
      empresaNome: "Rio Cargas",
      documento: "01.234.567/0001-88",
      contato: "roberto@riocargas.com.br",
      companyLogoUrl: "https://logo.clearbit.com/riocargas.com.br",
      cursosSelecionados: [{ id: "1", name: "Direção Defensiva", studentCount: 10 }],
      necessidadesIdentificadas: ["Reduzir sinistros"],
      nearestUnit: deodoroUnit
    };

    const card = buildTeamsAdaptiveCardText(payload, "coordenacao", "Grande cliente", "SS-2609-1234");
    expect(card).toContain("SEST SENAT DEODORO");
    expect(card).toContain("https://logo.clearbit.com/riocargas.com.br");
    expect(card).toContain("Valores e propostas formais são enviados exclusivamente pelos canais oficiais");
  });
});
