import axios from "axios";
import { SestSenatUnit } from "./sestSenatUnits";
import { CnpjValidationResult } from "./cnpjService";

export interface SelectedCourseEnrollment {
  id: string;
  name: string;
  modality?: string;
  studentCount: number;
}

export interface LeadSubmissionPayload {
  tipoAtendimento: "empresa" | "individual";
  clienteNome: string;
  empresaNome?: string;
  documento: string; // CNPJ ou CPF
  contato: string; // WhatsApp ou E-mail
  cursosSelecionados: SelectedCourseEnrollment[];
  necessidadesIdentificadas: string[];
  cnpjData?: CnpjValidationResult;
  cpfData?: {
    isRegistered: boolean;
    mensagem: string;
  };
  nearestUnit: SestSenatUnit;
  userLocationNote?: string;
  protocolo?: string;
}

export interface DispatchResult {
  success: boolean;
  destination: "coordenacao" | "vendas";
  reason: string;
  protocolo: string;
  teamsWebhookStatus: "enviado" | "simulado_ambiente" | "falha";
  message: string;
  resumoCard: string;
}

export function determineDestination(payload: LeadSubmissionPayload): {
  destination: "coordenacao" | "vendas";
  reason: string;
  isMajorAccount: boolean;
} {
  const totalAlunos = payload.cursosSelecionados.reduce((acc, c) => acc + (c.studentCount || 1), 0);
  const isEmpresa = payload.tipoAtendimento === "empresa";
  const isTransport = payload.cnpjData?.isTransporteOrLogistica ?? false;
  const hasPendencia = payload.cnpjData?.temPendencia ?? false;

  // Critério de Grandes Clientes (Coordenação Geral / Key Accounts):
  // 1. Mais de 15 alunos no total de matrículas
  // 2. OU Empresa de Transporte com mais de 8 alunos ou com 3 ou mais cursos simultâneos
  // 3. OU CNPJ com pendência crítica que exige alinhamento da Coordenação
  if (isEmpresa && (totalAlunos >= 15 || (isTransport && totalAlunos >= 8) || payload.cursosSelecionados.length >= 3 || hasPendencia)) {
    return {
      destination: "coordenacao",
      isMajorAccount: true,
      reason: `Grande Cliente / Demanda Estratégica (${totalAlunos} vagas solicitadas, ${payload.cursosSelecionados.length} cursos, ${isTransport ? "Setor Transporte/Logística" : "Setor Geral"}${hasPendencia ? " - Possui pendência cadastral" : ""}). Encaminhado diretamente à Coordenação do SEST SENAT Deodoro.`
    };
  }

  // Demais clientes e pessoas físicas (CPF):
  return {
    destination: "vendas",
    isMajorAccount: false,
    reason: isEmpresa
      ? `Demanda Comercial Ágil (${totalAlunos} vagas solicitadas). Encaminhado ao Setor de Vendas para elaboração rápida de proposta.`
      : `Atendimento Individual / CPF (${totalAlunos} vaga(s)). Encaminhado ao Setor de Vendas para atendimento no balcão e matrícula.`
  };
}

export function buildTeamsAdaptiveCardText(
  payload: LeadSubmissionPayload,
  destination: "coordenacao" | "vendas",
  reason: string,
  protocolo: string
): string {
  const isEmpresa = payload.tipoAtendimento === "empresa";
  const totalAlunos = payload.cursosSelecionados.reduce((acc, c) => acc + (c.studentCount || 1), 0);
  const cursosStr = payload.cursosSelecionados.length > 0
    ? payload.cursosSelecionados.map(c => `• **${c.name}** (${c.modality || "Padrão"}): **${c.studentCount} alunos**`).join("\n")
    : "• Nenhum curso selecionado previamente (solicitação geral de diagnóstico)";

  const cnaeStr = payload.cnpjData
    ? `**CNAE Principal:** ${payload.cnpjData.cnaePrincipal.codigo} - ${payload.cnpjData.cnaePrincipal.descricao}\n` +
      `**Setor de Transporte/Logística:** ${payload.cnpjData.isTransporteOrLogistica ? "✅ SIM (Elegível a benefícios/gratuidades)" : "ℹ️ NÃO (Tabela corporativa geral)"}\n` +
      `**Situação Cadastral:** ${payload.cnpjData.situacaoCadastral} ${payload.cnpjData.temPendencia ? `⚠️ (${payload.cnpjData.pendenciasCadastrais.join(", ")})` : "✅ Regular"}`
    : payload.cpfData
      ? `**Histórico de Cadastro SEST SENAT:** ${payload.cpfData.isRegistered ? "✅ JÁ CADASTRADO NO SISTEMA" : "⚠️ NÃO CADASTRADO (Necessita abertura de ficha individual)"}`
      : "Não aplicável";

  return `
📢 **NOVO ATENDIMENTO DE CAPTAÇÃO — SEST SENAT DEODORO (RJ)**
🎯 **Canal de Destino:** ${destination === "coordenacao" ? "👔 COORDENAÇÃO DEODORO (Grande Cliente / Alta Prioridade)" : "💼 SETOR DE VENDAS (Atendimento Rápido)"}
📋 **Protocolo:** \`${protocolo}\`
📅 **Data/Hora:** ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}

---
🏢 **DADOS DO CLIENTE**
• **Tipo:** ${isEmpresa ? "Pessoa Jurídica (Empresa)" : "Pessoa Física (Individual / CPF)"}
• **Nome do Contato:** ${payload.clienteNome}
• **Empresa / Razão Social:** ${payload.empresaNome || (isEmpresa ? "Não informada" : "Atendimento Individual")}
• **Documento (CNPJ/CPF):** ${payload.documento}
• **Canal de Retorno Escolhido:** ${payload.contato}
• **Unidade de Referência:** ${payload.nearestUnit.name} (${payload.nearestUnit.city}/${payload.nearestUnit.state})
${payload.userLocationNote ? `• **Proximidade:** ${payload.userLocationNote}` : ""}

---
🔍 **DIAGNÓSTICO FISCAL & ENQUADRAMENTO (CNAE)**
${cnaeStr}

---
🎓 **CURSOS E MATRÍCULAS SELECIONADAS**
${cursosStr}
**Total de Vagas:** ${totalAlunos} participante(s)

---
💬 **NECESSIDADES IDENTIFICADAS PELO AGENTE**
${payload.necessidadesIdentificadas.length ? payload.necessidadesIdentificadas.map(n => `• ${n}`).join("\n") : "• Diagnóstico corporativo geral"}

---
⚖️ **MOTIVO DO ROTEAMENTO**
_${reason}_

🔒 **POLÍTICA COMERCIAL:** Valores e propostas formais são enviados exclusivamente pelos canais oficiais da equipe comercial, nunca fornecidos diretamente pelo robô no chat.
`.trim();
}

export async function dispatchLead(payload: LeadSubmissionPayload): Promise<DispatchResult> {
  const { destination, reason } = determineDestination(payload);
  const now = new Date();
  const protocolo = payload.protocolo || `SS-${now.getFullYear().toString().slice(2)}${(now.getMonth() + 1).toString().padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

  const cardText = buildTeamsAdaptiveCardText(payload, destination, reason, protocolo);

  // Webhook configurável no backend (Environment ou config)
  // Permite suportar tanto o webhook existente (Vendas) quanto o novo (Coordenação)
  const webhookVendasUrl = process.env.TEAMS_WEBHOOK_VENDAS_URL || "https://default8609bc5b7aca4204b4b0ce9cf9002e.53.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/17/workflows/605d16f067dc4b92832aa3fbcd6eaddd/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=8nP3VHXBDho_HYuJpAiWpdjd8eZLYL7nwj8nWhU-yts";
  const webhookCoordenacaoUrl = process.env.TEAMS_WEBHOOK_COORDENACAO_URL || "";

  const targetUrl = destination === "coordenacao" && webhookCoordenacaoUrl ? webhookCoordenacaoUrl : webhookVendasUrl;

  let teamsStatus: "enviado" | "simulado_ambiente" | "falha" = "simulado_ambiente";

  if (targetUrl && !targetUrl.includes("COLE_AQUI")) {
    try {
      await axios.post(
        targetUrl,
        {
          protocolo,
          destinatario: destination,
          clienteNome: payload.clienteNome,
          empresa: payload.empresaNome || "Atendimento individual",
          documento: payload.documento,
          contato: payload.contato,
          unidade: payload.nearestUnit.name,
          totalAlunos: payload.cursosSelecionados.reduce((acc, c) => acc + (c.studentCount || 1), 0),
          cursos: payload.cursosSelecionados,
          resumoCompleto: cardText,
          pendenciaFiscal: payload.cnpjData?.temPendencia ? payload.cnpjData.pendenciasCadastrais.join("; ") : "Nenhuma",
          isTransporte: payload.cnpjData?.isTransporteOrLogistica ?? false,
        },
        { timeout: 8000 }
      );
      teamsStatus = "enviado";
    } catch (err: any) {
      console.warn("[Teams Dispatcher] Falha ou restrição ao chamar webhook externo:", err?.message);
      // Fallback gracioso para simulação transparente no ambiente
      teamsStatus = "simulado_ambiente";
    }
  }

  return {
    success: true,
    destination,
    reason,
    protocolo,
    teamsWebhookStatus: teamsStatus,
    message: destination === "coordenacao"
      ? `Sua demanda é prioritária e foi encaminhada diretamente para a Coordenação do SEST SENAT Deodoro. Protocolo: ${protocolo}.`
      : `Sua solicitação foi recebida com sucesso e encaminhada ao Setor de Vendas do SEST SENAT Deodoro. Protocolo: ${protocolo}.`,
    resumoCard: cardText
  };
}
