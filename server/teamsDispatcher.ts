import axios from "axios";
import { SestSenatUnit } from "./sestSenatUnits";
import { CnpjValidationResult } from "./cnpjService";

export interface SelectedCourseEnrollment { id: string; name: string; modality?: string; studentCount: number; }
export interface LeadSubmissionPayload { tipoAtendimento: "empresa" | "individual"; clienteNome: string; empresaNome?: string; documento: string; contato: string; companyLogoUrl?: string; cursosSelecionados: SelectedCourseEnrollment[]; necessidadesIdentificadas: string[]; cnpjData?: CnpjValidationResult; cpfData?: { isRegistered: boolean; mensagem: string }; nearestUnit: SestSenatUnit; userLocationNote?: string; protocolo?: string; }
export interface DispatchResult { success: boolean; destination: "coordenacao" | "vendas"; reason: string; protocolo: string; teamsWebhookStatus: "enviado" | "simulado_ambiente" | "falha"; message: string; resumoCard: string; }

export function determineDestination(payload: LeadSubmissionPayload) {
  const totalAlunos = payload.cursosSelecionados.reduce((acc, c) => acc + (c.studentCount || 1), 0);
  const isEmpresa = payload.tipoAtendimento === "empresa";
  const isTransport = payload.cnpjData?.isTransporteOrLogistica ?? false;
  const hasPendencia = payload.cnpjData?.temPendencia ?? false;
  if (isEmpresa && (totalAlunos >= 15 || (isTransport && totalAlunos >= 8) || payload.cursosSelecionados.length >= 3 || hasPendencia)) return { destination: "coordenacao" as const, isMajorAccount: true, reason: `Grande Cliente / Demanda Estratégica (${totalAlunos} vagas, ${payload.cursosSelecionados.length} cursos${hasPendencia ? ", com pendência cadastral" : ""}).` };
  return { destination: "vendas" as const, isMajorAccount: false, reason: isEmpresa ? `Demanda Comercial Ágil (${totalAlunos} vagas).` : `Atendimento Individual / CPF (${totalAlunos} vaga(s)).` };
}

export function buildTeamsAdaptiveCardText(payload: LeadSubmissionPayload, destination: "coordenacao" | "vendas", reason: string, protocolo: string) {
  const totalAlunos = payload.cursosSelecionados.reduce((acc, c) => acc + (c.studentCount || 1), 0);
  const cursosStr = payload.cursosSelecionados.map(c => `• **${c.name}** (${c.modality || "Padrão"}): **${c.studentCount} alunos**`).join("\n");
  const cnaeStr = payload.cnpjData ? `**CNAE Principal:** ${payload.cnpjData.cnaePrincipal.codigo} - ${payload.cnpjData.cnaePrincipal.descricao}\n**Transporte/Logística:** ${payload.cnpjData.isTransporteOrLogistica ? "SIM" : "NÃO"}\n**Situação:** ${payload.cnpjData.situacaoCadastral} ${payload.cnpjData.temPendencia ? `⚠️ ${payload.cnpjData.pendenciasCadastrais.join(", ")}` : "✅ Regular"}` : payload.cpfData ? `**Cadastro SEST SENAT:** ${payload.cpfData.isRegistered ? "JÁ CADASTRADO" : "NÃO CADASTRADO"}` : "Não aplicável";
  return `📢 **NOVO ATENDIMENTO — SEST SENAT DEODORO**\n🎯 **Destino:** ${destination === "coordenacao" ? "COORDENAÇÃO" : "SETOR DE VENDAS"}\n📋 **Protocolo:** ${protocolo}\n\n🏢 **CLIENTE**\n• Nome: ${payload.clienteNome}\n• Empresa: ${payload.empresaNome || "Atendimento individual"}\n• Documento: ${payload.documento}\n• Contato: ${payload.contato}\n• Logo da empresa/avatar: ${payload.companyLogoUrl || "Não identificada"}\n• Unidade: ${payload.nearestUnit.name}\n\n🔍 **DIAGNÓSTICO INTERNO**\n${cnaeStr}\n\n🎓 **CURSOS**\n${cursosStr}\n**Total:** ${totalAlunos} participante(s)\n\n⚖️ **ROTEAMENTO:** ${reason}\n\n🔒 **POLÍTICA COMERCIAL:** Valores e propostas formais são enviados exclusivamente pelos canais oficiais da equipe comercial; nunca diretamente pelo chat.`;
}

export async function dispatchLead(payload: LeadSubmissionPayload): Promise<DispatchResult> {
  const { destination, reason } = determineDestination(payload);
  const totalAlunos = payload.cursosSelecionados.reduce((acc, c) => acc + (c.studentCount || 1), 0);
  const now = new Date();
  const protocolo = payload.protocolo || `SS-${now.getFullYear().toString().slice(2)}${(now.getMonth() + 1).toString().padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
  const cardText = buildTeamsAdaptiveCardText(payload, destination, reason, protocolo);
  const webhookVendasUrl = process.env.TEAMS_WEBHOOK_VENDAS_URL || "https://default8609bc5b7aca4204b4b0ce9cf9002e.53.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/17/workflows/605d16f067dc4b92832aa3fbcd6eaddd/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=8nP3VHXBDho_HYuJpAiWpdjd8eZLYL7nwj8nWhU-yts";
  const webhookCoordenacaoUrl = process.env.TEAMS_WEBHOOK_COORDENACAO_URL || "";
  const targetUrl = destination === "coordenacao" && webhookCoordenacaoUrl ? webhookCoordenacaoUrl : webhookVendasUrl;
  let teamsWebhookStatus: "enviado" | "simulado_ambiente" | "falha" = targetUrl ? "falha" : "simulado_ambiente";
  try {
    if (targetUrl && !targetUrl.includes("COLE_AQUI")) {
      await axios.post(targetUrl, {
        protocolo,
        nomeContato: payload.clienteNome,
        empresa: payload.empresaNome || "Atendimento individual",
        documento: payload.documento,
        contatoRetorno: payload.contato,
        necessidades: payload.necessidadesIdentificadas.join("; ") || "não informadas",
        cursosSelecionados: payload.cursosSelecionados.map(c => `${c.name} (${c.studentCount} alunos)`).join("; "),
        cursosApresentados: "Não informado",
        participantes: String(totalAlunos),
        prioridade: destination === "coordenacao" ? "Alta" : "Média",
        unidade: payload.nearestUnit.name,
        destinatario: destination,
        companyLogoUrl: payload.companyLogoUrl || null,
        resumoComercial: cardText,
        resumoCompleto: cardText,
      }, { timeout: 8000 });
      teamsWebhookStatus = "enviado";
    }
    } catch (error: any) { console.error("[Teams] Falha ao enviar resumo:", error?.response?.data || error?.message); teamsWebhookStatus = "falha"; }
  return { success: true, destination, reason, protocolo, teamsWebhookStatus, message: destination === "coordenacao" ? `Sua demanda foi encaminhada à Coordenação. Protocolo: ${protocolo}.` : `Sua solicitação foi encaminhada ao Setor de Vendas. Protocolo: ${protocolo}.`, resumoCard: cardText };
}
