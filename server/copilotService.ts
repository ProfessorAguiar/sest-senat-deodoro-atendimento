import axios from "axios";
import { invokeLLM } from "./_core/llm";

const DIRECT_LINE_SECRET = process.env.COPILOT_DIRECTLINE_SECRET || "8J32lkJL8lmTPR4EVfn7Bl25tpbBjXotNiSeUMi9LwgBXagd10wNJQQJ99CIACL93NaAArohAAABAZBS272N.1ixZegyO7lAnjXITRcmOVDtUtefFRVJVFqIltczCGP6F8jJgtCCuJQQJ99CIACL93NaAArohAAABAZBS2mG8";
const DIRECT_LINE_BASE = "https://directline.botframework.com/v3/directline";

export interface BotActivity { id?: string; type: string; from?: { id: string; name?: string }; text?: string; }
export interface CopilotSession { conversationId: string; token?: string; watermark?: string; }

export async function createCopilotConversation(): Promise<CopilotSession> {
  try {
    const res = await axios.post(`${DIRECT_LINE_BASE}/conversations`, {}, { headers: { Authorization: `Bearer ${DIRECT_LINE_SECRET}`, "Content-Type": "application/json" }, timeout: 10000 });
    return { conversationId: res.data.conversationId, token: res.data.token || DIRECT_LINE_SECRET };
  } catch (err: any) {
    console.warn("[Copilot] Falha ao iniciar Direct Line:", err?.response?.data || err?.message);
    return { conversationId: `deodoro-ai-${Math.random().toString(36).slice(2, 9)}`, token: "internal-agent-session" };
  }
}

export async function postCopilotActivity(conversationId: string, text: string, userId = "web-client"): Promise<boolean> {
  if (conversationId.startsWith("deodoro-ai-")) return false;
  try { await axios.post(`${DIRECT_LINE_BASE}/conversations/${encodeURIComponent(conversationId)}/activities`, { type: "message", from: { id: userId }, text }, { headers: { Authorization: `Bearer ${DIRECT_LINE_SECRET}`, "Content-Type": "application/json" }, timeout: 10000 }); return true; } catch (err: any) { console.warn("[Copilot] Falha ao postar atividade:", err?.response?.data || err?.message); return false; }
}

export async function pollCopilotActivities(conversationId: string, watermark?: string): Promise<{ activities: BotActivity[]; watermark?: string }> {
  if (conversationId.startsWith("deodoro-ai-")) return { activities: [], watermark };
  try { const url = new URL(`${DIRECT_LINE_BASE}/conversations/${encodeURIComponent(conversationId)}/activities`); if (watermark) url.searchParams.set("watermark", watermark); const res = await axios.get(url.toString(), { headers: { Authorization: `Bearer ${DIRECT_LINE_SECRET}` }, timeout: 10000 }); return { activities: (res.data.activities || []).filter((a: BotActivity) => a.type === "message" && a.from?.id !== "web-client"), watermark: res.data.watermark }; } catch (err: any) { console.warn("[Copilot] Falha ao consultar resposta:", err?.response?.data || err?.message); return { activities: [], watermark }; }
}

export async function waitForCopilotReply(conversationId: string, timeoutMs = 15000): Promise<string | null> {
  if (conversationId.startsWith("deodoro-ai-")) return null;
  const started = Date.now(); let watermark: string | undefined;
  while (Date.now() - started < timeoutMs) {
    const result = await pollCopilotActivities(conversationId, watermark); watermark = result.watermark;
    const reply = result.activities.map(activity => activity.text?.trim()).filter(Boolean).join("\n\n");
    if (reply) return reply;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return null;
}

export async function generateDeodoroAgentResponse(params: { userMessage: string; history: Array<{ role: "user" | "assistant"; content: string }>; clientName?: string; companyName?: string; isCompany?: boolean; }): Promise<string> {
  const systemPrompt = `Você é o Agente Virtual de Atendimento do SEST SENAT Deodoro. Acolha o cliente, ajude a identificar capacitações e colete tipo de atendimento, nome, empresa, CNPJ/CPF, cursos, quantidade de alunos e contato. Nunca informe preços no chat; diga que a proposta será enviada pelos canais oficiais. Responda de forma objetiva, acolhedora e concisa.`;
  try { const res = await invokeLLM({ messages: [{ role: "system", content: systemPrompt }, ...params.history.slice(-6), { role: "user", content: params.userMessage }] }); const content = res.choices?.[0]?.message?.content; if (typeof content === "string" && content.trim()) return content.trim(); } catch (err: any) { console.warn("[Agent fallback]", err?.message); }
  return "Entendi. Vou orientar as melhores soluções de capacitação do SEST SENAT Deodoro. Não enviamos valores diretamente pelo chat; a equipe comercial retornará pelo canal informado. Como posso ajudar nos próximos passos?";
}
