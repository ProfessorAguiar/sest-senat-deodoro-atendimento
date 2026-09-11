import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, ShieldCheck, RefreshCw, Sparkles, Building2, UserCheck, AlertTriangle } from "lucide-react";
import { trpc } from "../lib/trpc";

export default function ChatCopilot({
  chatMessages,
  onSendMessage,
  isLoading,
  clientData,
  onQuickAction,
  onStartNewSession
}) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
      {/* Topo do Chat */}
      <div className="px-4 py-3.5 bg-gradient-to-r from-emerald-900/40 via-slate-900 to-slate-900/80 border-b border-slate-800/90 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white tracking-wide">Agente Virtual Deodoro</h2>
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                Copilot Studio
              </span>
            </div>
            <p className="text-[11px] text-slate-400">SEST SENAT • Polo Deodoro RJ</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onStartNewSession}
          className="text-xs text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1"
          title="Reiniciar Atendimento"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reiniciar</span>
        </button>
      </div>

      {/* Faixa de Aviso de Política Comercial */}
      <div className="px-4 py-1.5 bg-amber-500/10 border-b border-amber-500/20 text-[11px] text-amber-300 flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Valores oficiais são enviados exclusivamente por proposta formal pela equipe comercial.</span>
        </div>
      </div>

      {/* Lista de Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
        {chatMessages.map((msg, index) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={index}
              className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs shadow-sm ${
                  isUser
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800 text-emerald-400 border border-slate-700"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed shadow-md ${
                  isUser
                    ? "bg-emerald-600 text-white rounded-tr-none font-medium text-sm"
                    : "bg-slate-800/90 text-slate-100 rounded-tl-none border border-slate-700/80 text-sm"
                }`}
              >
                <div
                  className="whitespace-pre-wrap break-words space-y-2"
                  dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      .replace(/\*(.*?)\*/g, "<em>$1</em>")
                      .replace(/\n/g, "<br/>")
                  }}
                />
                <div
                  className={`text-[10px] mt-1 text-right ${
                    isUser ? "text-emerald-200/80" : "text-slate-400"
                  }`}
                >
                  {msg.time || "Agora"}
                </div>
              </div>
            </div>
          );
        })}

        {/* Indicador de Digitação do Agente */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-800 text-emerald-400 border border-slate-700 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl rounded-tl-none px-4 py-3 flex items-center space-x-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
              <span className="text-xs text-slate-400 pl-1 font-medium">Consultando informações...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Botões de Respostas Rápidas Sugeridas */}
      <div className="px-3 pt-2 pb-1 bg-slate-900/60 border-t border-slate-800/80 flex gap-1.5 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => onQuickAction("Represento uma Empresa de Transporte e quero capacitar minha equipe")}
          className="text-[11px] whitespace-nowrap bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-emerald-500/40 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 shrink-0"
        >
          <Building2 className="w-3 h-3 text-emerald-400" /> Sou Empresa
        </button>
        <button
          type="button"
          onClick={() => onQuickAction("Gostaria de atendimento individual como Pessoa Física")}
          className="text-[11px] whitespace-nowrap bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-emerald-500/40 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 shrink-0"
        >
          <UserCheck className="w-3 h-3 text-teal-400" /> Sou Pessoa Física (CPF)
        </button>
        <button
          type="button"
          onClick={() => onQuickAction("Quais treinamentos são indicados para motoristas e frotas?")}
          className="text-[11px] whitespace-nowrap bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-emerald-500/40 px-2.5 py-1 rounded-full transition-colors shrink-0"
        >
          🚦 Cursos para Motoristas
        </button>
        <button
          type="button"
          onClick={() => onQuickAction("Quais os benefícios para empresas com CNAE de transporte?")}
          className="text-[11px] whitespace-nowrap bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-emerald-500/40 px-2.5 py-1 rounded-full transition-colors shrink-0"
        >
          ⭐ Benefícios do CNAE
        </button>
      </div>

      {/* Input de Mensagem */}
      <form onSubmit={handleSubmit} className="p-3 bg-slate-950/70 border-t border-slate-800/90 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Converse com o agente virtual..."
          disabled={isLoading}
          className="flex-1 bg-slate-900/90 border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-100 placeholder-slate-500 text-sm px-4 py-2.5 rounded-xl outline-none transition-all"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:hover:bg-emerald-500 text-slate-950 px-4 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20"
          title="Enviar mensagem"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
