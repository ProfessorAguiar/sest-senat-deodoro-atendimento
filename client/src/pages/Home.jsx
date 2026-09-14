import React, { useEffect, useMemo, useState } from "react";
import { Building2, CheckCircle2, ChevronRight, LockKeyhole, MapPin, Phone, Search, ShieldCheck, Truck, UserRound } from "lucide-react";
import BackgroundCarousel from "../components/BackgroundCarousel";
import CourseCard from "../components/CourseCard";
import ChatCopilot from "../components/ChatCopilot";
import { trpc } from "../lib/trpc";

const LOGO = "/manus-storage/sest-senat-logo_9fa2d3d4.png";

export default function Home() {
  const [tipoAtendimento, setTipoAtendimento] = useState("empresa");
  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState("");
  const [contato, setContato] = useState("");
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("todos");
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [conversationId, setConversationId] = useState("");
  const [submission, setSubmission] = useState(null);
  const [companyLogoUrl, setCompanyLogoUrl] = useState("");
  const [messages, setMessages] = useState([{ role: "assistant", content: "Olá! Sou o assistente do **SEST SENAT Deodoro**. Posso ajudar sua empresa ou você, como pessoa física, a encontrar o treinamento mais adequado.\n\nPara começar, me diga: você representa uma empresa ou busca uma capacitação individual?", time: "Agora" }]);
  const [loadingChat, setLoadingChat] = useState(false);

  const courses = trpc.courses.list.useQuery({ category: categoria, search: busca });
  const startSession = trpc.copilot.startSession.useMutation();
  const sendMessage = trpc.copilot.sendMessage.useMutation();
  const submitLead = trpc.lead.submit.useMutation();
  const nearestUnit = trpc.units.findNearest.useQuery({ cityName: "Rio de Janeiro" });

  useEffect(() => { startSession.mutateAsync().then((data) => setConversationId(data.conversationId)).catch(() => {}); }, []);
  const totalAlunos = useMemo(() => selectedCourses.reduce((sum, item) => sum + item.studentCount, 0), [selectedCourses]);

  const toggleCourse = (course) => setSelectedCourses((current) => current.some((item) => item.id === course.id) ? current.filter((item) => item.id !== course.id) : [...current, { id: course.id, name: course.name, modality: course.modality, studentCount: 1 }]);
  const changeQuantity = (id, studentCount) => setSelectedCourses((current) => current.map((item) => item.id === id ? { ...item, studentCount } : item));

  const handleSendMessage = async (text) => {
    setMessages((current) => [...current, { role: "user", content: text, time: "Agora" }]);
    setLoadingChat(true);
    try {
      const response = await sendMessage.mutateAsync({ conversationId: conversationId || "deodoro-chat", text, history: messages.slice(-6).map(({ role, content }) => ({ role, content })), clientName: nome, isCompany: tipoAtendimento === "empresa" });
      setMessages((current) => [...current, { role: "assistant", content: response.reply, time: "Agora" }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: "Entendi. A equipe do SEST SENAT Deodoro poderá orientar sua turma, cronograma e condições por meio do contato informado. Não enviamos valores diretamente no chat.", time: "Agora" }]);
    } finally { setLoadingChat(false); }
  };

  const submitRequest = async () => {
    if (!nome || !contato || selectedCourses.length === 0) return;
    const emailDomain = contato.includes("@") ? contato.trim().toLowerCase().split("@")[1] : "";
    const detectedLogo = tipoAtendimento === "empresa" && emailDomain && !/gmail|hotmail|outlook|yahoo|icloud/.test(emailDomain)
      ? `https://logo.clearbit.com/${emailDomain}`
      : "";
    setCompanyLogoUrl(detectedLogo);
    const result = await submitLead.mutateAsync({
      tipoAtendimento,
      clienteNome: nome,
      empresaNome: tipoAtendimento === "empresa" ? nome : undefined,
      documento: documento || "Não informado",
      contato,
      companyLogoUrl: detectedLogo || undefined,
      cursosSelecionados: selectedCourses,
      necessidadesIdentificadas: [tipoAtendimento === "empresa" ? "Solicitação corporativa" : "Solicitação individual"],
      nearestUnit: nearestUnit.data?.nearest || { id: "deodoro-rj", name: "SEST SENAT Deodoro", city: "Rio de Janeiro", state: "RJ", neighborhood: "Deodoro", address: "Estrada do Camboatá, 4000 - Deodoro, Rio de Janeiro - RJ", latitude: -22.8552, longitude: -43.3768 }
    });
    setSubmission(result);
    setCompanyLogoUrl("");
    setMessages((current) => [...current, { role: "assistant", content: `Sua solicitação foi recebida com sucesso. O protocolo é **${result.protocolo}**. A equipe retornará por **${contato}**. Valores e propostas formais são tratados apenas pela equipe comercial.`, time: "Agora" }]);
  };

  const quick = (text, type) => { if (type) setTipoAtendimento(type); handleSendMessage(text); };

  return <div className="relative min-h-screen bg-slate-50 text-slate-900"><BackgroundCarousel />
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-w-0 max-w-7xl items-center justify-between gap-3 px-4 py-3 lg:px-8">
        <a href="/" className="flex min-w-0 items-center gap-3" aria-label="SEST SENAT Deodoro - início"><img src={LOGO} alt="SEST SENAT" className="h-10 w-auto max-w-[150px] object-contain sm:h-12 sm:max-w-none" /><div className="hidden border-l border-slate-200 pl-3 sm:block"><strong className="block text-base text-[#155a91]">Unidade Deodoro</strong><span className="text-sm text-slate-600">Atendimento e capacitação</span></div></a>
        <div className="flex items-center gap-2 text-sm"><span className="hidden items-center gap-1 text-slate-600 md:flex"><MapPin className="h-4 w-4 text-[#155a91]" />Rio de Janeiro/RJ</span><a href="/interno" className="flex items-center gap-2 rounded-lg border border-[#155a91] px-3 py-2 font-bold text-[#155a91] hover:bg-blue-50"><LockKeyhole className="h-4 w-4" />Área interna</a></div>
      </div>
    </header>

    <main className="mx-auto grid min-w-0 max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.78fr)] lg:px-8">
      <section className="min-w-0 space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:p-7"><div className="min-w-0 max-w-2xl"><span className="text-sm font-extrabold uppercase tracking-widest text-[#155a91]">Capacitação para transformar</span><h1 className="mt-2 break-words text-2xl font-extrabold leading-tight text-slate-950 sm:text-3xl lg:text-4xl">Encontre o treinamento certo para sua equipe.</h1><p className="mt-3 text-lg leading-relaxed text-slate-600">Converse com nosso assistente e conheça soluções para transporte, logística, tecnologia e gestão. Sem valores no chat: a proposta é preparada pela equipe responsável.</p></div></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-extrabold text-slate-950">Cursos e treinamentos</h2><p className="text-base text-slate-600">Selecione um ou mais cursos de interesse.</p></div><span className="rounded-full bg-blue-50 px-3 py-2 text-sm font-bold text-[#155a91]">{selectedCourses.length} selecionado(s)</span></div><div className="mb-4 flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><span className="sr-only">Buscar cursos</span><Search className="absolute left-3 top-3 h-5 w-5 text-slate-500" /><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar curso" className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-3 text-base" /></label><div className="flex gap-2 overflow-x-auto pb-1">{[["todos","Todos"],["transporte","Transporte"],["tecnologia","Tecnologia"],["operacao","Operação"],["gestao","Gestão"]].map(([id,label]) => <button key={id} type="button" onClick={() => setCategoria(id)} className={`whitespace-nowrap rounded-full px-3 py-2 text-sm font-bold ${categoria === id ? "bg-[#155a91] text-white" : "bg-slate-100 text-slate-700 hover:bg-blue-50"}`}>{label}</button>)}</div></div><div className="grid gap-3 md:grid-cols-2">{courses.data?.map((course) => <CourseCard key={course.id} course={course} isSelected={selectedCourses.some((item) => item.id === course.id)} studentCount={selectedCourses.find((item) => item.id === course.id)?.studentCount || 1} onToggleSelect={() => toggleCourse(course)} onChangeQuantity={(count) => changeQuantity(course.id, count)} />)}</div></div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-start gap-3"><div className="rounded-full bg-blue-50 p-2 text-[#155a91]"><Truck className="h-5 w-5" /></div><div><h2 className="text-2xl font-extrabold text-slate-950">Como podemos retornar?</h2><p className="text-base text-slate-600">Esses dados são usados somente para o atendimento comercial.</p></div></div><div className="mb-4 grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => setTipoAtendimento("empresa")} className={`rounded-xl border p-4 text-left ${tipoAtendimento === "empresa" ? "border-[#155a91] bg-blue-50 ring-2 ring-blue-100" : "border-slate-300"}`}><Building2 className="mb-2 h-6 w-6 text-[#155a91]" /><strong className="block text-lg">Represento uma empresa</strong><span className="text-sm text-slate-600">Capacitação para equipes e operações.</span></button><button type="button" onClick={() => setTipoAtendimento("individual")} className={`rounded-xl border p-4 text-left ${tipoAtendimento === "individual" ? "border-[#155a91] bg-blue-50 ring-2 ring-blue-100" : "border-slate-300"}`}><UserRound className="mb-2 h-6 w-6 text-[#155a91]" /><strong className="block text-lg">Sou pessoa física</strong><span className="text-sm text-slate-600">Cursos e formação individual.</span></button></div><div className="grid gap-3 sm:grid-cols-2"><label className="text-base font-bold text-slate-800">{tipoAtendimento === "empresa" ? "Nome da empresa ou contato" : "Nome completo"}<input value={nome} onChange={(e) => setNome(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal" /></label><label className="text-base font-bold text-slate-800">CNPJ ou CPF (opcional)<input value={documento} onChange={(e) => setDocumento(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal" /></label><label className="text-base font-bold text-slate-800 sm:col-span-2">WhatsApp ou e-mail<input value={contato} onChange={(e) => setContato(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal" /></label></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><span className="text-base text-slate-700"><strong>{totalAlunos}</strong> vaga(s) selecionada(s)</span><button type="button" onClick={submitRequest} disabled={!nome || !contato || !selectedCourses.length || submitLead.isPending} className="rounded-xl bg-[#155a91] px-5 py-3 text-base font-extrabold text-white hover:bg-[#104a78] disabled:opacity-40">{submitLead.isPending ? "Enviando..." : "Enviar solicitação"}<ChevronRight className="ml-1 inline h-5 w-5" /></button></div>{submission && <div role="status" className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-base text-emerald-900"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />Solicitação recebida. Protocolo <strong>{submission.protocolo}</strong>. A equipe retornará pelo canal informado.</div>}</div>
      </section>
      <aside className="min-w-0 lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]"><ChatCopilot chatMessages={messages} onSendMessage={handleSendMessage} isLoading={loadingChat} companyLogoUrl={companyLogoUrl} onQuickAction={quick} onStartNewSession={() => { setMessages([{ role: "assistant", content: "Atendimento reiniciado. Como posso ajudar?", time: "Agora" }]); setSubmission(null); }} /></aside>
    </main>
    <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center text-sm text-slate-600"><ShieldCheck className="mr-1 inline h-4 w-4 text-[#155a91]" />Atendimento acessível e seguro • SEST SENAT Deodoro • <Phone className="ml-2 mr-1 inline h-4 w-4" />(21) 3457-9200</footer>
  </div>;
}
