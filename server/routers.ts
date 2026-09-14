import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { consultarCnpj, verificarCpf } from "./cnpjService";
import { SEST_SENAT_UNITS, findNearestUnit } from "./sestSenatUnits";
import { CATALOG_COURSES } from "./courseCatalog";
import { dispatchLead } from "./teamsDispatcher";
import { createCopilotConversation, postCopilotActivity, pollCopilotActivities, generateDeodoroAgentResponse } from "./copilotService";
import { clearTestSession, issueTestSession, verifyTestPassword, isTestAccount } from "./testAuth";
import { addLeadRecord, listLeadRecords, updateLeadStatus } from "./leadStore";
import { insertLeadRecord, listLeadRecordsDb, updateLeadRecordStatus } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    testLogin: publicProcedure.input(z.object({ email: z.string().email(), password: z.string().min(1) })).mutation(async ({ input, ctx }) => {
      if (!isTestAccount(input.email) || !verifyTestPassword(input.password)) {
        throw new Error("Email ou senha de homologação inválidos.");
      }
      await issueTestSession(ctx.res, ctx.req, input.email.toLowerCase());
      return { success: true, email: input.email.toLowerCase() } as const;
    }),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); clearTestSession(ctx.res, ctx.req); return { success: true } as const; }),
  }),
  courses: router({
    list: publicProcedure.input(z.object({ category: z.string().optional(), search: z.string().optional() }).optional()).query(({ input }) => { let items = [...CATALOG_COURSES]; if (input?.category && input.category !== "todos") items = items.filter(c => c.category === input.category); if (input?.search) { const s = input.search.toLowerCase(); items = items.filter(c => c.name.toLowerCase().includes(s) || c.description.toLowerCase().includes(s)); } return items; }),
  }),
  company: router({
    consultarCnpj: protectedProcedure.input(z.object({ cnpj: z.string() })).mutation(async ({ input }) => consultarCnpj(input.cnpj)),
    consultarCpf: protectedProcedure.input(z.object({ cpf: z.string() })).mutation(({ input }) => verificarCpf(input.cpf)),
  }),
  units: router({
    list: publicProcedure.query(() => SEST_SENAT_UNITS),
    findNearest: publicProcedure.input(z.object({ latitude: z.number().optional(), longitude: z.number().optional(), cityName: z.string().optional() })).query(({ input }) => findNearestUnit(input.latitude, input.longitude, input.cityName)),
  }),
  copilot: router({
    startSession: publicProcedure.mutation(async () => createCopilotConversation()),
    sendMessage: publicProcedure.input(z.object({ conversationId: z.string(), text: z.string(), history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).optional(), clientName: z.string().optional(), companyName: z.string().optional(), isCompany: z.boolean().optional() })).mutation(async ({ input }) => { const directLinePosted = await postCopilotActivity(input.conversationId, input.text); const reply = await generateDeodoroAgentResponse({ userMessage: input.text, history: input.history || [], clientName: input.clientName, companyName: input.companyName, isCompany: input.isCompany }); return { directLinePosted, reply, timestamp: new Date().toISOString() }; }),
    poll: publicProcedure.input(z.object({ conversationId: z.string(), watermark: z.string().optional() })).query(async ({ input }) => pollCopilotActivities(input.conversationId, input.watermark)),
  }),
  lead: router({
    submit: publicProcedure.input(z.object({ tipoAtendimento: z.enum(["empresa", "individual"]), clienteNome: z.string(), empresaNome: z.string().optional(), documento: z.string(), contato: z.string(), companyLogoUrl: z.string().optional(), cursosSelecionados: z.array(z.object({ id: z.string(), name: z.string(), modality: z.string().optional(), studentCount: z.number().default(1) })), necessidadesIdentificadas: z.array(z.string()).default([]), cnpjData: z.any().optional(), cpfData: z.any().optional(), nearestUnit: z.object({ id: z.string(), name: z.string(), city: z.string(), state: z.string(), neighborhood: z.string(), address: z.string(), phone: z.string().optional(), latitude: z.number(), longitude: z.number() }), userLocationNote: z.string().optional(), protocolo: z.string().optional() })).mutation(async ({ input }) => { let cnpjData = input.cnpjData; if (input.tipoAtendimento === "empresa" && input.documento.replace(/\D/g, "").length === 14 && !cnpjData) { try { cnpjData = await consultarCnpj(input.documento); } catch { cnpjData = undefined; } } const companyLogoUrl = input.companyLogoUrl || cnpjData?.logoUrl; const payload = { ...input, cnpjData, companyLogoUrl }; const result = await dispatchLead(payload as any); const record = addLeadRecord({ categoria: input.tipoAtendimento, clienteNome: input.clienteNome, empresaNome: input.empresaNome, documento: input.documento, contato: input.contato, regiao: input.nearestUnit.city, cursos: input.cursosSelecionados.map(c => ({ id: c.id, name: c.name, studentCount: c.studentCount })), destino: result.destination, companyLogoUrl, protocolo: result.protocolo, resumo: result.resumoCard }); await insertLeadRecord({ recordId: record.id, createdAt: new Date(record.createdAt), status: record.status, category: record.categoria, clientName: record.clienteNome, companyName: record.empresaNome, document: record.documento, contact: record.contato, region: record.regiao, coursesJson: JSON.stringify(record.cursos), destination: record.destino, companyLogoUrl: record.companyLogoUrl, protocol: record.protocolo, summary: record.resumo }); return result; }),
    dashboard: protectedProcedure.input(z.object({ status: z.string().optional(), categoria: z.string().optional(), curso: z.string().optional(), regiao: z.string().optional() }).optional()).query(async ({ ctx, input }) => { if (ctx.user.role !== "admin") throw new Error("Acesso exclusivo da Coordenação."); const saved = await listLeadRecordsDb(); const source = saved.length ? saved : listLeadRecords(input); return source.filter(r => (!input?.status || input.status === "todos" || r.status === input.status) && (!input?.categoria || input.categoria === "todos" || r.categoria === input.categoria) && (!input?.regiao || input.regiao === "todas" || r.regiao.toLowerCase().includes(input.regiao.toLowerCase())) && (!input?.curso || r.cursos.some((c: { name: string }) => c.name.toLowerCase().includes(input.curso!.toLowerCase())))); }),
    updateStatus: protectedProcedure.input(z.object({ id: z.string(), status: z.enum(["aberto", "finalizado"]) })).mutation(async ({ ctx, input }) => { if (ctx.user.role !== "admin") throw new Error("Acesso exclusivo da Coordenação."); const local = updateLeadStatus(input.id, input.status); await updateLeadRecordStatus(input.id, input.status); return local || { id: input.id, status: input.status }; }),
  }),
});

export type AppRouter = typeof appRouter;
