import React, { useState, useEffect } from "react";
import { trpc } from "../lib/trpc";
import BackgroundCarousel from "../components/BackgroundCarousel";
import CourseCard from "../components/CourseCard";
import ChatCopilot from "../components/ChatCopilot";
import LeftControlPanel from "../components/LeftControlPanel";
import {
  MapPin,
  Building2,
  Phone,
  ShieldCheck,
  Search,
  CheckCircle,
  Truck,
  BookOpen,
  Info,
  Layers,
  Sparkles
} from "lucide-react";

export default function Home() {
  // Estado do Atendimento e Navegação
  const [activeTab, setActiveTab] = useState("catalogo");
  const [tipoAtendimento, setTipoAtendimento] = useState("empresa");
  const [documentoInput, setDocumentoInput] = useState("");
  const [clienteNome, setClienteNome] = useState("");
  const [contatoInput, setContatoInput] = useState("");
  const [searchCourse, setSearchCourse] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");

  // Resultados de validação
  const [cnpjResult, setCnpjResult] = useState(null);
  const [cpfResult, setCpfResult] = useState(null);

  // Cursos Selecionados: [{ id, name, modality, studentCount }]
  const [selectedCourses, setSelectedCourses] = useState([
    {
      id: "direcao-defensiva",
      name: "Direção Defensiva e Prevenção de Sinistros",
      modality: "Presencial",
      studentCount: 5
    }
  ]);

  // Sessão do Copilot e Mensagens do Chat
  const [conversationId, setConversationId] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content:
        "Olá! Seja bem-vindo ao atendimento oficial do **SEST SENAT Deodoro (Rio de Janeiro)**, o maior polo de formação profissional do transporte.\n\nPara direcionar seus benefícios e tabelas especiais: **você representa uma empresa ou busca capacitação individual como Pessoa Física?**",
      time: "Agora"
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Queries e Mutations via tRPC
  const coursesQuery = trpc.courses.list.useQuery({
    category: selectedCategory,
    search: searchCourse
  });

  const unitsQuery = trpc.units.list.useQuery();
  const nearestUnitQuery = trpc.units.findNearest.useQuery({
    cityName: cnpjResult?.cidade || "Rio de Janeiro"
  });

  const startSessionMutation = trpc.copilot.startSession.useMutation();
  const sendMessageMutation = trpc.copilot.sendMessage.useMutation();
  const consultarCnpjMutation = trpc.company.consultarCnpj.useMutation();
  const consultarCpfMutation = trpc.company.consultarCpf.useMutation();
  const submitLeadMutation = trpc.lead.submit.useMutation();

  // Iniciar sessão do bot ao carregar
  useEffect(() => {
    startSessionMutation.mutateAsync().then((res) => {
      if (res?.conversationId) {
        setConversationId(res.conversationId);
      }
    }).catch(console.error);
  }, []);

  // Total de alunos
  const totalAlunos = selectedCourses.reduce((sum, item) => sum + (item.studentCount || 1), 0);

  // Previsão de roteamento inteligente (Coordenação vs Vendas)
  const isMajorAccount =
    tipoAtendimento === "empresa" &&
    (totalAlunos >= 15 ||
      (cnpjResult?.isTransporteOrLogistica && totalAlunos >= 8) ||
      selectedCourses.length >= 3 ||
      cnpjResult?.temPendencia);

  const leadRoutingPreview = {
    destination: isMajorAccount ? "coordenacao" : "vendas",
    reason: isMajorAccount
      ? `Grande Cliente / Demanda Estratégica (${totalAlunos} vagas solicitadas, ${selectedCourses.length} cursos). Encaminhamento prioritário direto à Coordenação de Deodoro.`
      : tipoAtendimento === "empresa"
      ? `Demanda Comercial Ágil (${totalAlunos} vagas solicitadas). Encaminhamento direto ao Setor de Vendas.`
      : `Atendimento Individual (CPF). Encaminhamento direto ao Setor de Vendas.`
  };

  // Manipulação de Cursos Selecionados
  const handleToggleCourse = (course) => {
    setSelectedCourses((prev) => {
      const exists = prev.find((item) => item.id === course.id);
      if (exists) {
        return prev.filter((item) => item.id !== course.id);
      } else {
        return [...prev, { id: course.id, name: course.name, modality: course.modality, studentCount: 1 }];
      }
    });
  };

  const handleChangeQuantity = (courseId, newCount) => {
    setSelectedCourses((prev) =>
      prev.map((item) => (item.id === courseId ? { ...item, studentCount: newCount } : item))
    );
  };

  // Consulta de Documento (CNPJ ou CPF)
  const handleConsultarDocumento = async () => {
    if (!documentoInput.trim()) return;

    if (tipoAtendimento === "empresa") {
      try {
        const result = await consultarCnpjMutation.mutateAsync({ cnpj: documentoInput });
        setCnpjResult(result);
        setCpfResult(null);
        if (result.razaoSocial && !clienteNome) {
          setClienteNome(result.razaoSocial);
        }

        const botNotice = result.isTransporteOrLogistica
          ? `Localizei os dados do CNPJ **${result.cnpjFormatted}** (**${result.razaoSocial}**).\n\n✓ **CNAE:** ${result.cnaePrincipal.codigo} - *${result.cnaePrincipal.descricao}*\n✓ **Enquadramento:** Sua empresa é do setor de **transporte e logística**, elegível para benefícios de gratuidade e convênio regulamentar no SEST SENAT Deodoro!`
          : `Localizei os dados do CNPJ **${result.cnpjFormatted}** (**${result.razaoSocial}**).\n\n✓ **CNAE:** ${result.cnaePrincipal.codigo} - *${result.cnaePrincipal.descricao}*\n✓ **Enquadramento:** Setor Geral de Mercado. Elaboraremos proposta comercial sob condições corporativas diferenciadas.`;

        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: botNotice, time: "Agora" }
        ]);
      } catch (err) {
        alert("Não foi possível consultar o CNPJ. Verifique os dígitos informados.");
      }
    } else {
      try {
        const result = await consultarCpfMutation.mutateAsync({ cpf: documentoInput });
        setCpfResult(result);
        setCnpjResult(null);

        const botNotice = result.isRegistered
          ? `Localizei seu CPF **${result.cpfFormatted}**! Você já possui cadastro ativo na rede SEST SENAT. Podemos acelerar sua matrícula!`
          : `Seu CPF **${result.cpfFormatted}** ainda não possui cadastro prévio. Vamos registrar seus cursos de interesse e passar para a equipe comercial efetuar seu cadastro.`;

        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: botNotice, time: "Agora" }
        ]);
      } catch (err) {
        alert("Não foi possível verificar o CPF.");
      }
    }
  };

  // Envio de Mensagem para o Chat Copilot
  const handleSendMessage = async (text) => {
    const userMsg = { role: "user", content: text, time: "Agora" };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const response = await sendMessageMutation.mutateAsync({
        conversationId: conversationId || "deodoro-chat",
        text,
        history: chatMessages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        clientName: clienteNome,
        companyName: cnpjResult?.razaoSocial,
        isCompany: tipoAtendimento === "empresa"
      });

      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.reply, time: "Agora" }
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Compreendi sua demanda. No SEST SENAT Deodoro, preparamos treinamentos de excelência com simuladores de ponta e instrutores qualificados. Nossa equipe comercial entrará em contato para detalhar cronogramas e turmas.",
          time: "Agora"
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Ações Rápidas no Chat
  const handleQuickAction = (prompt) => {
    if (prompt.includes("Empresa")) {
      setTipoAtendimento("empresa");
      setActiveTab("identificacao");
    } else if (prompt.includes("Pessoa Física")) {
      setTipoAtendimento("individual");
      setActiveTab("identificacao");
    }
    handleSendMessage(prompt);
  };

  // Despacho de Proposta para Teams (Coordenação vs Vendas)
  const handleSubmitProposal = async () => {
    if (!clienteNome || !contatoInput || selectedCourses.length === 0) {
      alert("Por favor, preencha o nome do cliente, o canal de contato e selecione pelo menos um curso.");
      return;
    }

    const payload = {
      tipoAtendimento,
      clienteNome,
      empresaNome: cnpjResult?.razaoSocial || (tipoAtendimento === "empresa" ? clienteNome : undefined),
      documento: documentoInput || "Não informado",
      contato: contatoInput,
      cursosSelecionados: selectedCourses,
      necessidadesIdentificadas: [
        `Interesse em ${selectedCourses.map((c) => c.name).join(", ")}`,
        cnpjResult?.isTransporteOrLogistica ? "Benefício de Transporte / Gratuidade" : "Capacitação Corporativa Geral"
      ],
      cnpjData: cnpjResult,
      cpfData: cpfResult,
      nearestUnit: nearestUnitQuery.data?.nearest || {
        id: "deodoro-rj",
        name: "SEST SENAT Deodoro (Unidade B-27)",
        city: "Rio de Janeiro",
        state: "RJ",
        neighborhood: "Deodoro",
        address: "Estrada do Camboatá, 4000 - Deodoro, Rio de Janeiro - RJ",
        latitude: -22.8552,
        longitude: -43.3768
      },
      userLocationNote: nearestUnitQuery.data?.note
    };

    try {
      const res = await submitLeadMutation.mutateAsync(payload);
      setSubmissionResult(res);

      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `✅ **Solicitação de Proposta Concluída com Sucesso!**\n\n• **Protocolo:** \`${res.protocolo}\`\n• **Destino:** **${
            res.destination === "coordenacao"
              ? "Coordenação Geral SEST SENAT Deodoro (Prioridade Alta)"
              : "Setor de Vendas Corporativas"
          }**\n• **Unidade Responsável:** SEST SENAT Deodoro - RJ\n\nTodos os detalhes foram despachados para a equipe no Teams e o retorno ocorrerá no contato **${contatoInput}**. Lembramos que valores e orçamentos finais são emitidos exclusivamente pela proposta formal.`,
          time: "Agora"
        }
      ]);
    } catch (err) {
      alert("Falha ao despachar proposta para o Teams.");
    }
  };

  const handleStartNewSession = () => {
    setSelectedCourses([]);
    setCnpjResult(null);
    setCpfResult(null);
    setDocumentoInput("");
    setClienteNome("");
    setContatoInput("");
    setSubmissionResult(null);
    setChatMessages([
      {
        role: "assistant",
        content:
          "Olá! Atendimento reiniciado. Como posso ajudar com os treinamentos do SEST SENAT Deodoro hoje?",
        time: "Agora"
      }
    ]);
  };

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950 font-sans">
      <BackgroundCarousel />

      {/* CABEÇALHO */}
      <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Truck className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-extrabold text-white tracking-tight">
                  SEST SENAT <span className="text-emerald-400">DEODORO</span>
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                  Unidade B-27 • Rio de Janeiro
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Polo de Excelência e Capacitação para o Transporte e Logística
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <div className="hidden md:flex items-center space-x-2 text-slate-300 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-full">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Estrada do Camboatá, 4000 - Deodoro RJ</span>
            </div>
            <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-full">
              <Phone className="w-3.5 h-3.5" />
              <span>(21) 3457-9200</span>
            </div>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL (SPLIT: 7 COLUNAS ESQUERDA / 5 COLUNAS DIREITA) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUNA ESQUERDA */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          {/* Painel Superior de Controle / Abas */}
          <LeftControlPanel
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tipoAtendimento={tipoAtendimento}
            setTipoAtendimento={setTipoAtendimento}
            documentoInput={documentoInput}
            setDocumentoInput={setDocumentoInput}
            onConsultarDocumento={handleConsultarDocumento}
            isConsultingDocument={consultarCnpjMutation.isPending || consultarCpfMutation.isPending}
            cnpjResult={cnpjResult}
            cpfResult={cpfResult}
            clienteNome={clienteNome}
            setClienteNome={setClienteNome}
            contatoInput={contatoInput}
            setContatoInput={setContatoInput}
            nearestUnit={nearestUnitQuery.data?.nearest}
            selectedCourses={selectedCourses}
            totalAlunos={totalAlunos}
            onSubmitProposal={handleSubmitProposal}
            isSubmittingProposal={submitLeadMutation.isPending}
            submissionResult={submissionResult}
            leadRoutingPreview={leadRoutingPreview}
          />

          {/* Seletor e Catálogo Visual de Cursos em Cards com Imagens Reais */}
          <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-4 space-y-3 shadow-xl">
            <div className="flex flex-col sm:flex-row gap-2 items-center justify-between pb-1 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Catálogo de Cursos & Simuladores</h3>
                <span className="text-[11px] text-slate-400">({selectedCourses.length} selecionado{selectedCourses.length === 1 ? "" : "s"})</span>
              </div>

              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto no-scrollbar">
                {[
                  { id: "todos", label: "Todos" },
                  { id: "transporte", label: "Transporte" },
                  { id: "tecnologia", label: "Tecnologia / BI" },
                  { id: "operacao", label: "Operação / NR" },
                  { id: "gestao", label: "Liderança" }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors ${
                      selectedCategory === cat.id
                        ? "bg-emerald-500 text-slate-950 font-bold"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid dos Cards de Cursos com Imagem Ilustrativa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[580px] overflow-y-auto pr-1">
              {coursesQuery.isLoading ? (
                <div className="col-span-2 text-center py-12 text-slate-400">
                  Carregando catálogo de cursos...
                </div>
              ) : (
                coursesQuery.data?.map((course) => {
                  const isSelected = selectedCourses.some((item) => item.id === course.id);
                  const selItem = selectedCourses.find((item) => item.id === course.id);
                  return (
                    <CourseCard
                      key={course.id}
                      course={course}
                      isSelected={isSelected}
                      studentCount={selItem?.studentCount || 1}
                      onToggleSelect={() => handleToggleCourse(course)}
                      onChangeQuantity={(count) => handleChangeQuantity(course.id, count)}
                    />
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* COLUNA DIREITA: CHAT COPILOT STUDIO */}
        <section className="lg:col-span-5 h-[calc(100vh-120px)] sticky top-20">
          <ChatCopilot
            chatMessages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={isChatLoading}
            clientData={{ clienteNome, cnpjResult, cpfResult, selectedCourses }}
            onQuickAction={handleQuickAction}
            onStartNewSession={handleStartNewSession}
          />
        </section>
      </main>

      {/* RODAPÉ */}
      <footer className="bg-slate-950/90 border-t border-slate-800/80 px-6 py-2.5 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <div>
          <span>© 2026 SEST SENAT Deodoro RJ • Sistema CNT • Confederação Nacional do Transporte</span>
        </div>
        <div className="flex items-center space-x-3 text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> Conformidade com NRs e Resoluções CONTRAN
          </span>
          <span>•</span>
          <span className="text-slate-300">Polo Tecnológico com Simuladores Reais</span>
        </div>
      </footer>
    </div>
  );
}
