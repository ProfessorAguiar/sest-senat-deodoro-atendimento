import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  LockKeyhole,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Truck,
  UserRound,
} from "lucide-react";
import CourseCard from "../components/CourseCard";
import ChatCopilot from "../components/ChatCopilot";
import { trpc } from "../lib/trpc";

const LOGO = "/manus-storage/logo-cnt-sest-senat-itl_470f9910.png";
const TRUCK = "/manus-storage/caminhao-azul_7710abcc.jpg";

export default function Home() {
  const [tipoAtendimento, setTipoAtendimento] = useState("empresa");
  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState("");
  const [contato, setContato] = useState("");
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("todos");
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [showCourses, setShowCourses] = useState(false);
  const [conversationId, setConversationId] = useState("");
  const [submission, setSubmission] = useState(null);
  const [companyLogoUrl, setCompanyLogoUrl] = useState("");
  const [companyData, setCompanyData] = useState(null);
  const [reviewStage, setReviewStage] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Olá! Sou o assistente do **SEST SENAT Deodoro**. Posso ajudar sua empresa ou você, como pessoa física, a encontrar o treinamento mais adequado.\n\nPara começar, me diga: você representa uma empresa ou busca uma capacitação individual?",
      time: "Agora",
    },
  ]);
  const [loadingChat, setLoadingChat] = useState(false);
  const courses = trpc.courses.list.useQuery(
    { category: categoria, search: busca },
    { enabled: showCourses }
  );
  const startSession = trpc.copilot.startSession.useMutation();
  const sendMessage = trpc.copilot.sendMessage.useMutation();
  const submitLead = trpc.lead.submit.useMutation();
  const lookupCnpj = trpc.company.consultarCnpj.useMutation();
  const nearestUnit = trpc.units.findNearest.useQuery({
    cityName: "Rio de Janeiro",
  });
  useEffect(() => {
    startSession
      .mutateAsync()
      .then(data => setConversationId(data.conversationId))
      .catch(() => {});
  }, []);
  const totalAlunos = useMemo(
    () => selectedCourses.reduce((sum, item) => sum + item.studentCount, 0),
    [selectedCourses]
  );
  const toggleCourse = course => {
    const already = selectedCourses.some(item => item.id === course.id);
    setSelectedCourses(current =>
      already
        ? current.filter(item => item.id !== course.id)
        : [
            ...current,
            {
              id: course.id,
              name: course.name,
              modality: course.modality,
              studentCount: 1,
            },
          ]
    );
    if (!already)
      setMessages(current => [
        ...current,
        {
          role: "assistant",
          content: `Boa escolha! Registrei seu interesse em **${course.name}**. Você pode selecionar outros cursos e informar a quantidade de participantes para cada um.`,
          time: "Agora",
        },
      ]);
  };
  const changeQuantity = (id, studentCount) =>
    setSelectedCourses(current =>
      current.map(item => (item.id === id ? { ...item, studentCount } : item))
    );
  const marketTrail = useMemo(() => {
    const names = selectedCourses
      .map(course => course.name.toLowerCase())
      .join(" ");
    if (/excel|power bi|dados|informática|tecnologia/.test(names))
      return "Trilha sugerida: Excel para produtividade → Power BI para indicadores → Liderança para transformar dados em decisões.";
    if (
      /direção|motorista|condutor|transporte|empilhadeira|logística/.test(names)
    )
      return "Trilha sugerida: Direção segura → Operação eficiente → Gestão de frota e resultados.";
    return "Trilha sugerida: Fundamentos profissionais → Eficiência operacional → Liderança e resultados para o mercado.";
  }, [selectedCourses]);
  const requestReview = () => {
    if (!selectedCourses.length) return;
    setReviewStage(true);
    setMessages(current => [
      ...current,
      {
        role: "assistant",
        content: `Antes de finalizar, revise sua solicitação:\n\n${selectedCourses.map(course => `• **${course.name}** — ${course.studentCount} participante(s)`).join("\n")}\n\n${marketTrail}\n\nVocê está satisfeito com os cursos e quantidades? Podemos confirmar, alterar a quantidade, remover um curso ou buscar outra opção.`,
        time: "Agora",
      },
    ]);
  };
  const handleCnpjBlur = async () => {
    if (
      tipoAtendimento !== "empresa" ||
      documento.replace(/\D/g, "").length !== 14 ||
      lookupCnpj.isPending
    )
      return;
    try {
      const data = await lookupCnpj.mutateAsync({ cnpj: documento });
      setCompanyData(data);
      if (data.nomeFantasia || data.razaoSocial)
        setNome(data.nomeFantasia || data.razaoSocial);
      if (data.logoUrl) setCompanyLogoUrl(data.logoUrl);
      const atividade =
        data.cnaePrincipal?.descricao || "atividade empresarial";
      const local = [data.cidade, data.uf].filter(Boolean).join("/");
      setMessages(current => [
        ...current,
        {
          role: "assistant",
          content: `Obrigado por escolher o **SEST SENAT**. Encontrei a empresa **${data.nomeFantasia || data.razaoSocial}**${local ? `, localizada em ${local}` : ""}. Vi que a atividade principal está relacionada a **${atividade}**${data.isTransporteOrLogistica ? ", um segmento que acompanhamos de perto e que pode ter benefícios específicos para capacitação" : "."}.\n\nVou usar essas informações para indicar treinamentos mais alinhados à sua realidade.`,
          time: "Agora",
        },
      ]);
    } catch {
      setMessages(current => [
        ...current,
        {
          role: "assistant",
          content:
            "Não consegui consultar o CNPJ agora. Você pode continuar preenchendo o atendimento e nossa equipe confirmará os dados no retorno.",
          time: "Agora",
        },
      ]);
    }
  };
  const handleSendMessage = async text => {
    setMessages(current => [
      ...current,
      { role: "user", content: text, time: "Agora" },
    ]);
    setLoadingChat(true);
    try {
      const response = await sendMessage.mutateAsync({
        conversationId: conversationId || "deodoro-chat",
        text,
        history: messages
          .slice(-6)
          .map(({ role, content }) => ({ role, content })),
        clientName: nome,
        companyName:
          tipoAtendimento === "empresa"
            ? companyData?.nomeFantasia || companyData?.razaoSocial || nome
            : undefined,
        isCompany: tipoAtendimento === "empresa",
      });
      setMessages(current => [
        ...current,
        { role: "assistant", content: response.reply, time: "Agora" },
      ]);
    } catch {
      setMessages(current => [
        ...current,
        {
          role: "assistant",
          content:
            "Entendi. A equipe do SEST SENAT Deodoro poderá orientar seu atendimento. Não enviamos valores diretamente no chat.",
          time: "Agora",
        },
      ]);
    } finally {
      setLoadingChat(false);
    }
  };
  const submitRequest = async () => {
    if (!nome || !contato || !selectedCourses.length) return;
    const domain = contato.includes("@")
      ? contato.trim().toLowerCase().split("@")[1]
      : "";
    const detectedLogo =
      companyData?.logoUrl ||
      (tipoAtendimento === "empresa" &&
      domain &&
      !/gmail|hotmail|outlook|yahoo|icloud/.test(domain)
        ? `https://logo.clearbit.com/${domain}`
        : "");
    setCompanyLogoUrl(detectedLogo);
    const result = await submitLead.mutateAsync({
      tipoAtendimento,
      clienteNome: nome,
      empresaNome:
        tipoAtendimento === "empresa"
          ? companyData?.nomeFantasia || companyData?.razaoSocial || nome
          : undefined,
      documento: documento || "Não informado",
      contato,
      companyLogoUrl: detectedLogo || undefined,
      cnpjData: companyData || undefined,
      cursosSelecionados: selectedCourses,
      necessidadesIdentificadas: [
        tipoAtendimento === "empresa"
          ? `Solicitação corporativa — ${companyData?.cnaePrincipal?.descricao || "atividade a confirmar"}`
          : "Solicitação individual",
      ],
      nearestUnit: nearestUnit.data?.nearest || {
        id: "deodoro-rj",
        name: "SEST SENAT Deodoro",
        city: "Rio de Janeiro",
        state: "RJ",
        neighborhood: "Deodoro",
        address: "Estrada do Camboatá, 4000 - Deodoro, Rio de Janeiro - RJ",
        latitude: -22.8552,
        longitude: -43.3768,
      },
    });
    setSubmission(result);
    setReviewStage(false);
    setMessages(current => [
      ...current,
      {
        role: "assistant",
        content: `Obrigado por escolher o **SEST SENAT Deodoro** e por compartilhar os objetivos da **${companyData?.nomeFantasia || companyData?.razaoSocial || nome}**.\n\nSua solicitação foi recebida com os cursos e quantidades selecionados. O protocolo é **${result.protocolo}** e a equipe retornará por **${contato}**.`,
        time: "Agora",
      },
    ]);
  };
  const quick = (text, type) => {
    if (type) setTipoAtendimento(type);
    handleSendMessage(text);
  };
  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-w-0 max-w-7xl items-center justify-between gap-3 px-4 py-3 lg:px-8">
          <a
            href="/"
            aria-label="SEST SENAT Deodoro - início"
            className="flex min-w-0 items-center"
          >
            <img
              src={LOGO}
              alt="CNT, SEST SENAT e ITL"
              className="h-10 w-auto max-w-[220px] object-contain sm:h-12"
            />
          </a>
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden items-center gap-1 text-slate-600 md:flex">
              <MapPin className="h-4 w-4 text-[#155a91]" />
              Rio de Janeiro/RJ
            </span>
            <a
              href="/interno"
              className="flex items-center gap-2 rounded-lg border border-[#155a91] px-3 py-2 font-bold text-[#155a91]"
            >
              <LockKeyhole className="h-4 w-4" />
              Área interna
            </a>
          </div>
        </div>
      </header>
      <main className="mx-auto grid min-w-0 max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.78fr)] lg:px-8">
        <section className="min-w-0 space-y-5">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid items-center md:grid-cols-[1.05fr_0.95fr]">
              <div className="p-6 lg:p-8">
                <span className="text-sm font-extrabold uppercase tracking-widest text-[#155a91]">
                  Sistema Transporte
                </span>
                <h1 className="mt-2 break-words text-3xl font-extrabold leading-tight text-slate-950 lg:text-4xl">
                  Capacitação para transformar sua operação.
                </h1>
                <p className="mt-3 text-lg leading-relaxed text-slate-600">
                  Converse com o assistente e encontre treinamentos para sua
                  equipe. Os valores são tratados pela equipe comercial, fora do
                  chat.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowCourses(true);
                    document
                      .getElementById("cursos")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="mt-5 rounded-xl bg-[#155a91] px-5 py-3 text-base font-extrabold text-white"
                >
                  Ver cursos e treinamentos{" "}
                  <ChevronRight className="ml-1 inline h-5 w-5" />
                </button>
              </div>
              <img
                src={TRUCK}
                alt="Caminhão azul em uma estrada, representando o setor de transporte"
                className="h-64 w-full object-cover md:h-full"
              />
            </div>
          </div>
          {showCourses ? (
            <div
              id="cursos"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-extrabold">
                    Cursos e treinamentos
                  </h2>
                  <p className="text-base text-slate-600">
                    Selecione um ou mais cursos de interesse.
                  </p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-2 text-sm font-bold text-[#155a91]">
                  {selectedCourses.length} selecionado(s)
                </span>
              </div>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                <label className="relative flex-1">
                  <span className="sr-only">Buscar cursos</span>
                  <Search className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                  <input
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                    placeholder="Buscar curso"
                    className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-3 text-base"
                  />
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {[
                    ["todos", "Todos"],
                    ["transporte", "Transporte"],
                    ["tecnologia", "Tecnologia"],
                    ["operacao", "Operação"],
                    ["gestao", "Gestão"],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setCategoria(id)}
                      className={`whitespace-nowrap rounded-full px-3 py-2 text-sm font-bold ${categoria === id ? "bg-[#155a91] text-white" : "bg-slate-100 text-slate-700"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {courses.data?.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isSelected={selectedCourses.some(
                      item => item.id === course.id
                    )}
                    studentCount={
                      selectedCourses.find(item => item.id === course.id)
                        ?.studentCount || 1
                    }
                    onToggleSelect={() => toggleCourse(course)}
                    onChangeQuantity={count => changeQuantity(course.id, count)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
              <Truck className="mx-auto h-10 w-10 text-[#155a91]" />
              <p className="mt-2 text-lg font-bold text-slate-800">
                Quando quiser, consulte nosso catálogo de cursos.
              </p>
              <button
                type="button"
                onClick={() => setShowCourses(true)}
                className="mt-3 rounded-xl border border-[#155a91] px-4 py-2 font-bold text-[#155a91]"
              >
                Listar cursos
              </button>
            </div>
          )}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-full bg-blue-50 p-2 text-[#155a91]">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold">
                  Como podemos retornar?
                </h2>
                <p className="text-base text-slate-600">
                  Dados usados somente para o atendimento comercial.
                </p>
              </div>
            </div>
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setTipoAtendimento("empresa")}
                className={`rounded-xl border p-4 text-left ${tipoAtendimento === "empresa" ? "border-[#155a91] bg-blue-50 ring-2 ring-blue-100" : "border-slate-300"}`}
              >
                <Building2 className="mb-2 h-6 w-6 text-[#155a91]" />
                <strong className="block text-lg">
                  Represento uma empresa
                </strong>
                <span className="text-sm text-slate-600">
                  Capacitação para equipes.
                </span>
              </button>
              <button
                type="button"
                onClick={() => setTipoAtendimento("individual")}
                className={`rounded-xl border p-4 text-left ${tipoAtendimento === "individual" ? "border-[#155a91] bg-blue-50 ring-2 ring-blue-100" : "border-slate-300"}`}
              >
                <UserRound className="mb-2 h-6 w-6 text-[#155a91]" />
                <strong className="block text-lg">Sou pessoa física</strong>
                <span className="text-sm text-slate-600">
                  Formação individual.
                </span>
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-base font-bold text-slate-800">
                Nome
                <input
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal"
                />
              </label>
              <label className="text-base font-bold text-slate-800">
                CNPJ ou CPF
                <input
                  value={documento}
                  onChange={e => setDocumento(e.target.value)}
                  onBlur={handleCnpjBlur}
                  aria-describedby="cnpj-help"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal"
                />
              </label>
              <label className="text-base font-bold text-slate-800 sm:col-span-2">
                WhatsApp ou e-mail
                <input
                  value={contato}
                  onChange={e => setContato(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal"
                />
              </label>
            </div>
            {reviewStage && !submission && (
              <div
                className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4"
                role="dialog"
                aria-label="Revisão da solicitação"
              >
                <p className="font-bold text-[#155a91]">
                  Está satisfeito com sua seleção?
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  Você pode confirmar, alterar a quantidade, remover cursos ou
                  buscar outro treinamento.
                </p>
                <p className="mt-3 text-sm font-semibold text-slate-800">
                  {marketTrail}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewStage(false)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-bold text-slate-700"
                  >
                    Alterar cursos/quantidades
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCourses(true);
                      setReviewStage(false);
                      document
                        .getElementById("cursos")
                        ?.scrollIntoView({ behavior: "smooth" });
                      setMessages(current => [
                        ...current,
                        {
                          role: "assistant",
                          content:
                            "Claro. Escolha outro curso ou ajuste as quantidades. Depois, posso revisar tudo novamente.",
                          time: "Agora",
                        },
                      ]);
                    }}
                    className="rounded-lg border border-[#155a91] bg-white px-3 py-2 font-bold text-[#155a91]"
                  >
                    Buscar outro curso
                  </button>
                  <button
                    type="button"
                    onClick={submitRequest}
                    disabled={!nome || !contato || submitLead.isPending}
                    className="rounded-lg bg-[#155a91] px-3 py-2 font-bold text-white disabled:opacity-40"
                  >
                    Sim, estou satisfeito — finalizar
                  </button>
                </div>
              </div>
            )}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-base text-slate-700">
                <strong>{totalAlunos}</strong> vaga(s) selecionada(s)
              </span>
              <button
                type="button"
                onClick={requestReview}
                disabled={
                  !nome ||
                  !contato ||
                  !selectedCourses.length ||
                  submitLead.isPending
                }
                className="rounded-xl bg-[#155a91] px-5 py-3 text-base font-extrabold text-white disabled:opacity-40"
              >
                {submitLead.isPending
                  ? "Enviando..."
                  : reviewStage
                    ? "Revisão aberta"
                    : "Revisar e continuar"}
                <ChevronRight className="ml-1 inline h-5 w-5" />
              </button>
            </div>
            {submission && (
              <div
                role="status"
                className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-base text-emerald-900"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5" />
                Solicitação recebida. Protocolo{" "}
                <strong>{submission.protocolo}</strong>.
              </div>
            )}
          </div>
        </section>
        <aside className="min-w-0 lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]">
          <ChatCopilot
            chatMessages={messages}
            onSendMessage={handleSendMessage}
            isLoading={loadingChat}
            companyLogoUrl={companyLogoUrl}
            onQuickAction={quick}
            onStartNewSession={() => {
              setMessages([
                {
                  role: "assistant",
                  content: "Atendimento reiniciado. Como posso ajudar?",
                  time: "Agora",
                },
              ]);
              setSubmission(null);
              setReviewStage(false);
            }}
          />
        </aside>
      </main>
      <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center text-sm text-slate-600">
        <ShieldCheck className="mr-1 inline h-4 w-4 text-[#155a91]" />
        Atendimento acessível e seguro • SEST SENAT Deodoro •{" "}
        <Phone className="ml-2 mr-1 inline h-4 w-4" />
        (21) 3457-9200
      </footer>
    </div>
  );
}
