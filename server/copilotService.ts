import axios from "axios";
import { invokeLLM } from "./_core/llm";

// Mantém a chave e o endpoint protegidos no servidor
const DIRECT_LINE_SECRET = process.env.COPILOT_DIRECTLINE_SECRET || "8J32lkJL8lmTPR4EVfn7Bl25tpbBjXotNiSeUMi9LwgBXagd10wNJQQJ99CIACL93NaAArohAAABAZBS272N.1ixZegyO7lAnjXITRcmOVDtUtefFRVJVFqIltczCGP6F8jJgtCCuJQQJ99CIACL93NaAArohAAABAZBS2mG8";

export interface BotActivity {
  id?: string;
  type: string;
  from?: { id: string; name?: string };
  text?: string;
}

export interface CopilotSession {
  conversationId: string;
  token?: string;
  watermark?: string;
}

export async function createCopilotConversation(): Promise<CopilotSession> {
  try {
    const res = await axios.post(
      "https://directline.botframework.com/v3/directline/conversations",
      {},
      {
        headers: {
          Authorization: `Bearer ${DIRECT_LINE_SECRET}`,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );
    return {
      conversationId: res.data.conversationId,
      token: res.data.token || DIRECT_LINE_SECRET
    };
  } catch (err: any) {
    console.warn("[Copilot Proxy] Falha ao iniciar conversa via Direct Line nativo. Ativando motor inteligente SEST SENAT Deodoro:", err?.message);
    // Modo resiliente que nunca deixa o cliente na mão
    return {
      conversationId: `deodoro-ai-${Math.random().toString(36).slice(2, 9)}`,
      token: "internal-agent-session"
    };
  }
}

export async function postCopilotActivity(conversationId: string, text: string, userId: string = "web-client"): Promise<boolean> {
  if (conversationId.startsWith("deodoro-ai-")) {
    return true;
  }
  try {
    await axios.post(
      `https://directline.botframework.com/v3/directline/conversations/${encodeURIComponent(conversationId)}/activities`,
      {
        type: "message",
        from: { id: userId },
        text
      },
      {
        headers: {
          Authorization: `Bearer ${DIRECT_LINE_SECRET}`,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );
    return true;
  } catch (err: any) {
    console.warn("[Copilot Proxy] Erro ao postar atividade no Direct Line:", err?.message);
    return false;
  }
}

export async function pollCopilotActivities(conversationId: string, watermark?: string): Promise<{ activities: BotActivity[]; watermark?: string }> {
  if (conversationId.startsWith("deodoro-ai-")) {
    return { activities: [], watermark: undefined };
  }
  try {
    const url = new URL(`https://directline.botframework.com/v3/directline/conversations/${encodeURIComponent(conversationId)}/activities`);
    if (watermark) url.searchParams.set("watermark", watermark);

    const res = await axios.get(url.toString(), {
      headers: {
        Authorization: `Bearer ${DIRECT_LINE_SECRET}`
      },
      timeout: 10000
    });

    const activities = (res.data.activities || []).filter((a: any) => a.type === "message" && a.from?.id !== "web-client");
    return {
      activities,
      watermark: res.data.watermark
    };
  } catch (err: any) {
    console.warn("[Copilot Proxy] Erro no polling de atividades:", err?.message);
    return { activities: [], watermark };
  }
}

/**
 * Resposta inteligente usando o modelo integrado da plataforma para manter respostas imediatas e calorosas
 * com o tom oficial do SEST SENAT Deodoro, garantindo a regra de nunca passar preços e recomendar os cursos adequados.
 */
export async function generateDeodoroAgentResponse(params: {
  userMessage: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  clientName?: string;
  companyName?: string;
  isCompany?: boolean;
}): Promise<string> {
  const systemPrompt = `
Você é o Agente Virtual de Atendimento do SEST SENAT Deodoro (Rio de Janeiro/RJ) — uma das maiores unidades de excelência do SEST SENAT no Brasil.
Seu objetivo é acolher os clientes, entender suas necessidades reais de capacitação profissional e treinamentos para o setor de transporte e logística (e demais setores), e coletar com simpatia e agilidade os dados:
1. Tipo de atendimento (Empresa ou Pessoa Física/Individual)
2. Nome do cliente
3. Razão Social / Nome da Empresa (se empresa)
4. CNPJ ou CPF
5. Necessidade de capacitação ou cursos de interesse (ex.: Direção Defensiva, Excel para Logística, Power BI, Operação de Empilhadeira, Liderança de Equipes de Transporte, Condutor de Passageiros)
6. Quantidade de alunos/colaboradores para matricular
7. Contato para retorno da proposta (WhatsApp ou E-mail)

REGRAS CRÍTICAS E OBRIGATÓRIAS:
- NUNCA envie valores ou preços monetários diretamente no chat. Diga gentilmente que o SEST SENAT Deodoro analisa as gratuidades regulamentares pelo CNAE de transporte e condições personalizadas de faturamento corporativo, e que a proposta formal com valores e condições especiais será enviada pela equipe comercial/coordenação pelo canal informado.
- Destaque o orgulho da Unidade Deodoro no RJ, sua infraestrutura moderna (simuladores de trânsito de última geração, pistas de manobra, laboratórios de informática e corpo docente especializado).
- Responda de forma objetiva, acolhedora, profissional e dinâmica.
- Mantenha a resposta concisa (2 a 4 parágrafos curtos).
`.trim();

  try {
    const messages: any[] = [
      { role: "system", content: systemPrompt },
      ...params.history.slice(-6).map(h => ({ role: h.role, content: h.content })),
      { role: "user", content: params.userMessage }
    ];

    const res = await invokeLLM({ messages });
    const content = res.choices?.[0]?.message?.content;
    if (typeof content === "string" && content.trim()) {
      return content.trim();
    }
  } catch (err: any) {
    console.warn("[Agent Fallback] Falha no invokeLLM:", err?.message);
  }

  // Resposta de fallback calorosa caso a API externa sofra timeout
  return `Olá! Sou o assistente do SEST SENAT Deodoro. Identifiquei seu interesse e vou orientar as melhores soluções em capacitação para sua equipe. Nossos consultores comerciais e a coordenação de Deodoro avaliarão o enquadramento de gratuidade e benefícios pelo seu CNAE. Como posso ajudar com os próximos passos?`;
}
