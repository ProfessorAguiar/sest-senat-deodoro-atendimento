import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { consultarCnpj, verificarCpf } from "./cnpjService";
import { SEST_SENAT_UNITS, findNearestUnit } from "./sestSenatUnits";
import { CATALOG_COURSES } from "./courseCatalog";
import { dispatchLead } from "./teamsDispatcher";
import { createCopilotConversation, postCopilotActivity, pollCopilotActivities, generateDeodoroAgentResponse } from "./copilotService";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Catálogo de Cursos do SEST SENAT Deodoro
  courses: router({
    list: publicProcedure
      .input(
        z.object({
          category: z.string().optional(),
          search: z.string().optional(),
        }).optional()
      )
      .query(({ input }) => {
        let items = [...CATALOG_COURSES];
        if (input?.category && input.category !== "todos") {
          items = items.filter(c => c.category === input.category);
        }
        if (input?.search) {
          const s = input.search.toLowerCase();
          items = items.filter(c => c.name.toLowerCase().includes(s) || c.description.toLowerCase().includes(s));
        }
        return items;
      }),
  }),

  // Validação de CNPJ, CNAE e Transporte
  company: router({
    consultarCnpj: publicProcedure
      .input(z.object({ cnpj: z.string() }))
      .mutation(async ({ input }) => {
        return await consultarCnpj(input.cnpj);
      }),

    consultarCpf: publicProcedure
      .input(z.object({ cpf: z.string() }))
      .mutation(({ input }) => {
        return verificarCpf(input.cpf);
      }),
  }),

  // Unidades SEST SENAT e geolocalização mais próxima
  units: router({
    list: publicProcedure.query(() => {
      return SEST_SENAT_UNITS;
    }),

    findNearest: publicProcedure
      .input(
        z.object({
          latitude: z.number().optional(),
          longitude: z.number().optional(),
          cityName: z.string().optional(),
        })
      )
      .query(({ input }) => {
        return findNearestUnit(input.latitude, input.longitude, input.cityName);
      }),
  }),

  // Agente de IA & Copilot Studio
  copilot: router({
    startSession: publicProcedure.mutation(async () => {
      return await createCopilotConversation();
    }),

    sendMessage: publicProcedure
      .input(
        z.object({
          conversationId: z.string(),
          text: z.string(),
          history: z.array(z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string()
          })).optional(),
          clientName: z.string().optional(),
          companyName: z.string().optional(),
          isCompany: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Envia para o Direct Line em background
        const postedToDirectLine = await postCopilotActivity(input.conversationId, input.text);

        // Se o Direct Line demorar ou for fallback, gera resposta imediata acolhedora com contexto de Deodoro
        const aiResponse = await generateDeodoroAgentResponse({
          userMessage: input.text,
          history: input.history || [],
          clientName: input.clientName,
          companyName: input.companyName,
          isCompany: input.isCompany,
        });

        return {
          directLinePosted: postedToDirectLine,
          reply: aiResponse,
          timestamp: new Date().toISOString()
        };
      }),

    poll: publicProcedure
      .input(
        z.object({
          conversationId: z.string(),
          watermark: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        return await pollCopilotActivities(input.conversationId, input.watermark);
      }),
  }),

  // Despacho de propostas para Teams (Coordenação vs Vendas)
  lead: router({
    submit: publicProcedure
      .input(
        z.object({
          tipoAtendimento: z.enum(["empresa", "individual"]),
          clienteNome: z.string(),
          empresaNome: z.string().optional(),
          documento: z.string(),
          contato: z.string(),
          cursosSelecionados: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              modality: z.string().optional(),
              studentCount: z.number().default(1),
            })
          ),
          necessidadesIdentificadas: z.array(z.string()).default([]),
          cnpjData: z.any().optional(),
          cpfData: z.any().optional(),
          nearestUnit: z.object({
            id: z.string(),
            name: z.string(),
            city: z.string(),
            state: z.string(),
            neighborhood: z.string(),
            address: z.string(),
            phone: z.string().optional(),
            latitude: z.number(),
            longitude: z.number(),
          }),
          userLocationNote: z.string().optional(),
          protocolo: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await dispatchLead(input as any);
      }),
  }),
});

export type AppRouter = typeof appRouter;
