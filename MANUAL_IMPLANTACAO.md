# Manual de Implantação e Arquitetura: Front-End SEST SENAT Deodoro (RJ)

Este documento descreve a solução completa desenvolvida para modernizar a captação corporativa do **SEST SENAT Deodoro (RJ)**, conectando o agente do **Microsoft Copilot Studio**, a validação cadastral (CNPJ/CNAE/CPF) e o roteamento inteligente de solicitações para o **Microsoft Teams** (Coordenação Geral vs. Setor de Vendas).

---

## 1. Visão Geral da Arquitetura

O sistema foi construído em formato **SPA (Single Page Application)** com **React 19 em JavaScript** (sem TypeScript no front-end do usuário), Tailwind CSS 4 para design moderno e responsivo, e uma camada segura em Node.js/Express/tRPC no backend.

```
+-----------------------------------------------------------------------------------+
|                            SPA FRONT-END (REACT JS)                                |
|  - Fundo Dinâmico: Carrossel com fotos reais do Setor de Transporte/Logística       |
|  - Esquerda: Cards de Cursos com fotos, filtros, seletores e diagnóstico CNPJ/CPF  |
|  - Direita: Chat interativo Copilot Studio com respostas imediatas e acolhedoras    |
+-----------------------------------------------------------------------------------+
                                    | (tRPC)
                                    v
+-----------------------------------------------------------------------------------+
|                             BACKEND SEGURO (NODE.JS)                              |
|  - Consulta de CNPJ: BrasilAPI + ReceitaWS + identificação CNAE Transporte (49/52)  |
|  - Verificação de CPF: Histórico e matrícula prévia no SEST SENAT                 |
|  - Georreferenciamento: Proximidade da Unidade Deodoro e demais unidades RJ        |
|  - Despachante Teams: Divisão automática de Grandes Clientes e Vendas Rápidas      |
|  - Gateway Copilot: Proxy com Direct Line Secret protegido no servidor            |
+-----------------------------------------------------------------------------------+
        |                                                   |
        v                                                   v
+-------------------------------+       +-------------------------------------------+
|    MICROSOFT COPILOT STUDIO   |       |          MICROSOFT TEAMS (POWER AUTOMATE) |
|    Direct Line / Bot Service  |       |  - Webhook 1: Setor de Vendas             |
|                               |       |  - Webhook 2: Coordenação Geral Deodoro   |
+-------------------------------+       +-------------------------------------------+
```

---

## 2. Requisitos Atendidos

| Requisito Solicitado | Implementação Realizada |
|---|---|
| **Tecnologia** | SPA React JS em JavaScript, moderna, limpa e intuitiva. |
| **Disposição Visual (Split)** | **Chat à direita** fixo; **Cards de cursos e formulários à esquerda** com scroll e abas. |
| **Fundo da Página** | **Carrossel contínuo de fotos em alta resolução** do setor de transporte rodoviário, caminhões, logística e centros de distribuição. |
| **Apresentação de Cursos em Cards** | Cards visuais com fotos reais temáticas (Excel, Power BI, Direção Defensiva, Operador de Empilhadeira, Liderança, Simulador de Ônibus), carga horária, modalidade e seletor de vagas de alunos por curso (+ / -). |
| **Verificação de CNPJ / CNAE** | Análise automática dos CNAEs principais e secundários (Divisões 49 a 53 e palavras-chave de frota/logística). Informa benefícios de gratuidade e enquadramento tributário diferenciado. |
| **Verificação de Pendências no CNPJ** | Validação de situação cadastral e pendências com alerta em destaque para envio à coordenação. |
| **Identificação de Clientes CPF** | Validação com checagem de cadastro prévio na base do SEST SENAT para agilizar re-matrícula ou encaminhar novo cadastro à equipe de vendas. |
| **Geolocalização / Unidade Mais Próxima** | Algoritmo que calcula a distância em km para as unidades do RJ, destacando a **Unidade Deodoro (B-27)** como polo principal e referência. |
| **Roteamento Comercial Teams** | **Grandes Clientes** (mais de 15 alunos, empresas de transporte com alta demanda ou com pendências) -> **Coordenação**; **Demais clientes e CPFs** -> **Setor de Vendas**. |
| **Política de Preços** | **Regra rigorosa:** Valores monetários **nunca** são transmitidos diretamente pelo chat; o agente informa que a proposta formal será enviada pelo canal de retorno (WhatsApp ou E-mail). |

---

## 3. Configuração de Variáveis de Ambiente em Produção

Para conectar seus webhooks definitivos do Power Automate e a chave do Copilot sem expor segredos no navegador, utilize as seguintes variáveis de ambiente:

```env
# Chave Direct Line do seu bot Copilot Studio (mantida em segredo no servidor)
COPILOT_DIRECTLINE_SECRET=8J32lkJL8lmTPR4EVfn7Bl25tpbBjXotNiSeUMi9LwgBXagd10wNJQQJ99CIACL93NaAArohAAABAZBS272N.1ixZegyO7lAnjXITRcmOVDtUtefFRVJVFqIltczCGP6F8jJgtCCuJQQJ99CIACL93NaAArohAAABAZBS2mG8

# Webhook do Power Automate já programado para o Setor de Vendas
TEAMS_WEBHOOK_VENDAS_URL=https://default8609bc5b7aca4204b4b0ce9cf9002e.53.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/17/workflows/605d16f067dc4b92832aa3fbcd6eaddd/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=8nP3VHXBDho_HYuJpAiWpdjd8eZLYL7nwj8nWhU-yts

# Webhook do Power Automate para a Coordenação Geral (Segundo canal para Grandes Clientes)
TEAMS_WEBHOOK_COORDENACAO_URL=https://seu-fluxo-coordenacao.powerautomate.com/triggers/manual/paths/invoke
```

---

## 4. Testes Automatizados Executados

O projeto conta com suite de testes com Vitest cobrindo:
1. Validação e enquadramento de CNAE de transporte e logística.
2. Direcionamento automático de grandes contas (>15 alunos ou pendência) para a Coordenação.
3. Direcionamento ágil para a equipe de Vendas.
4. Cálculo de proximidade da Unidade SEST SENAT Deodoro.
5. Inclusão da regra de confidencialidade de preços nos resumos gerados.

Comando para rodar os testes:
```bash
pnpm test
```
