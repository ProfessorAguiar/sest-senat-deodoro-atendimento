import React, { useEffect, useRef, useState } from "react";
import { Bot, Building2, RefreshCw, Send, ShieldCheck, UserRound } from "lucide-react";

function MessageAvatar({ message, companyLogoUrl }) {
  const [failed, setFailed] = useState(false);
  const isUser = message.role === "user";
  if (isUser && companyLogoUrl && !failed) return <img src={companyLogoUrl} alt="Logo da empresa" onError={() => setFailed(true)} className="h-9 w-9 rounded-full border border-blue-200 bg-white object-contain p-1" />;
  return <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isUser ? "bg-[#155a91] text-white" : "bg-blue-50 text-[#155a91]"}`}>{isUser ? <UserRound className="h-5 w-5" /> : <Bot className="h-5 w-5" />}</div>;
}

export default function ChatCopilot({ chatMessages, onSendMessage, isLoading, companyLogoUrl, onQuickAction, onStartNewSession }) {
  const [inputText, setInputText] = useState("");
  const endRef = useRef(null);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [chatMessages, isLoading]);
  const submit = (e) => { e.preventDefault(); if (!inputText.trim() || isLoading) return; onSendMessage(inputText.trim()); setInputText(""); };
  return (
    <section aria-label="Chat de atendimento do SEST SENAT" className="flex h-full min-h-[620px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
        <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-[#155a91]"><Bot className="h-6 w-6" /></div><div><h2 className="text-lg font-extrabold text-slate-900">Atendimento SEST SENAT</h2><p className="text-sm text-slate-600">Assistente virtual da Unidade Deodoro</p></div></div>
        <button type="button" onClick={onStartNewSession} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Reiniciar atendimento" title="Reiniciar atendimento"><RefreshCw className="h-5 w-5" /></button>
      </header>
      <div className="flex items-start gap-2 border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-900"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" /><span>Valores de cursos e treinamentos não são exibidos neste chat. A equipe comercial fará o retorno.</span></div>
      <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50 p-5" aria-live="polite">
        {chatMessages.map((msg, index) => { const isUser = msg.role === "user"; return <div key={index} className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}><MessageAvatar message={msg} companyLogoUrl={companyLogoUrl} /><div className={`max-w-[86%] rounded-2xl px-4 py-3 text-base leading-relaxed shadow-sm ${isUser ? "rounded-tr-sm bg-[#155a91] text-white" : "rounded-tl-sm border border-slate-200 bg-white text-slate-800"}`}><div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>") }} /><div className={`mt-1 text-xs ${isUser ? "text-blue-100" : "text-slate-500"}`}>{msg.time || "Agora"}</div></div></div>; })}
        {isLoading && <div className="flex items-center gap-3 text-base text-slate-600"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-[#155a91]"><Bot className="h-5 w-5" /></div>Consultando informações...</div>}
        <div ref={endRef} />
      </div>
      <div className="flex gap-2 overflow-x-auto border-t border-slate-200 bg-white px-4 py-3">
        <button type="button" onClick={() => onQuickAction("Represento uma empresa e quero capacitar minha equipe")} className="flex shrink-0 items-center gap-1 rounded-full border border-slate-300 px-3 py-2 text-sm font-semibold text-[#155a91] hover:bg-blue-50"><Building2 className="h-4 w-4" />Empresa</button>
        <button type="button" onClick={() => onQuickAction("Busco capacitação individual como Pessoa Física")} className="shrink-0 rounded-full border border-slate-300 px-3 py-2 text-sm font-semibold text-[#155a91] hover:bg-blue-50">Pessoa física</button>
        <button type="button" onClick={() => onQuickAction("Quais cursos são indicados para motoristas e frotas?")} className="shrink-0 rounded-full border border-slate-300 px-3 py-2 text-sm font-semibold text-[#155a91] hover:bg-blue-50">Cursos para motoristas</button>
      </div>
      <form onSubmit={submit} className="flex gap-3 border-t border-slate-200 bg-white p-4"><label className="sr-only" htmlFor="chat-message">Mensagem</label><input id="chat-message" value={inputText} onChange={(e) => setInputText(e.target.value)} disabled={isLoading} placeholder="Digite sua mensagem" className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 placeholder:text-slate-500" /><button type="submit" disabled={!inputText.trim() || isLoading} className="rounded-xl bg-[#155a91] px-4 py-3 text-white disabled:opacity-40" aria-label="Enviar mensagem"><Send className="h-5 w-5" /></button></form>
    </section>
  );
}
