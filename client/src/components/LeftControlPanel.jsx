import React, { useState } from "react";
import {
  Building2,
  User,
  Search,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Send,
  Sparkles,
  Layers,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Phone,
  Mail
} from "lucide-react";

export default function LeftControlPanel({
  activeTab,
  setActiveTab,
  tipoAtendimento,
  setTipoAtendimento,
  documentoInput,
  setDocumentoInput,
  onConsultarDocumento,
  isConsultingDocument,
  cnpjResult,
  cpfResult,
  clienteNome,
  setClienteNome,
  contatoInput,
  setContatoInput,
  nearestUnit,
  selectedCourses,
  totalAlunos,
  onSubmitProposal,
  isSubmittingProposal,
  submissionResult,
  leadRoutingPreview
}) {
  const [contactType, setContactType] = useState("whatsapp");

  return (
    <div className="flex flex-col h-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
      {/* Abas Superiores do Painel Esquerdo */}
      <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("catalogo")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "catalogo"
              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Cursos & Treinamentos</span>
          {selectedCourses.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-slate-950 text-emerald-400 text-[10px] flex items-center justify-center font-bold">
              {selectedCourses.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("identificacao")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "identificacao"
              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>CNPJ / Dados</span>
          {(cnpjResult || cpfResult) && (
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("resumo")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "resumo"
              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Resumo & Teams</span>
          {selectedCourses.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>
      </div>

      {/* Conteúdo Dinâmico da Aba Ativa */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ABA 1: IDENTIFICAÇÃO E VERIFICAÇÃO CNPJ/CPF */}
        {activeTab === "identificacao" && (
          <div className="space-y-4">
            <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Tipo de Atendimento
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTipoAtendimento("empresa")}
                  className={`p-2.5 rounded-lg border text-left text-xs font-semibold flex items-center gap-2 transition-all ${
                    tipoAtendimento === "empresa"
                      ? "bg-emerald-950/60 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="font-bold">Empresa (PJ)</p>
                    <p className="text-[10px] text-slate-400">Verifica CNAE e benefícios</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTipoAtendimento("individual")}
                  className={`p-2.5 rounded-lg border text-left text-xs font-semibold flex items-center gap-2 transition-all ${
                    tipoAtendimento === "individual"
                      ? "bg-emerald-950/60 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <User className="w-4 h-4 text-teal-400" />
                  <div>
                    <p className="font-bold">Pessoa Física</p>
                    <p className="text-[10px] text-slate-400">Verifica cadastro prévio</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Campo do Documento e Botão de Consulta */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 block">
                {tipoAtendimento === "empresa" ? "CNPJ da Empresa" : "CPF do Cliente"}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={documentoInput}
                  onChange={(e) => setDocumentoInput(e.target.value)}
                  placeholder={tipoAtendimento === "empresa" ? "00.000.000/0000-00" : "000.000.000-00"}
                  className="flex-1 bg-slate-950 border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm px-3.5 py-2 rounded-xl text-white outline-none"
                />
                <button
                  type="button"
                  onClick={onConsultarDocumento}
                  disabled={isConsultingDocument || !documentoInput}
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
                >
                  {isConsultingDocument ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <Search className="w-3.5 h-3.5" />
                  )}
                  <span>Verificar</span>
                </button>
              </div>
            </div>

            {/* Resultado da Análise de CNPJ */}
            {cnpjResult && tipoAtendimento === "empresa" && (
              <div className="p-3.5 rounded-xl border border-slate-700 bg-slate-950/80 space-y-2.5 animate-fadeIn text-xs">
                <div className="flex items-start justify-between border-b border-slate-800 pb-2">
                  <div>
                    <h4 className="font-bold text-white text-sm">{cnpjResult.razaoSocial}</h4>
                    {cnpjResult.nomeFantasia && (
                      <p className="text-slate-400 text-[11px]">{cnpjResult.nomeFantasia}</p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      cnpjResult.situacaoCadastral === "ATIVA"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    {cnpjResult.situacaoCadastral}
                  </span>
                </div>

                {/* CNAE e Enquadramento de Transporte */}
                <div className="space-y-1.5">
                  <div className="flex items-start gap-1.5">
                    <span className="font-semibold text-slate-300 shrink-0">CNAE Principal:</span>
                    <span className="text-slate-200">
                      {cnpjResult.cnaePrincipal.codigo} - {cnpjResult.cnaePrincipal.descricao}
                    </span>
                  </div>

                  <div
                    className={`p-2 rounded-lg border flex items-start gap-2 ${
                      cnpjResult.isTransporteOrLogistica
                        ? "bg-emerald-950/40 border-emerald-600/50 text-emerald-200"
                        : "bg-slate-900 border-slate-800 text-slate-300"
                    }`}
                  >
                    {cnpjResult.isTransporteOrLogistica ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <strong className="block text-xs">
                        {cnpjResult.isTransporteOrLogistica
                          ? "✓ Enquadramento Setor de Transporte e Logística Reconhecido"
                          : "Setor Geral de Mercado"}
                      </strong>
                      <p className="text-[11px] mt-0.5 opacity-90">{cnpjResult.motivoBeneficio}</p>
                    </div>
                  </div>

                  {/* Alerta de Pendência Cadastral */}
                  {cnpjResult.temPendencia ? (
                    <div className="p-2 rounded-lg bg-rose-950/50 border border-rose-600/60 text-rose-200 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-xs">Pendência Identificada no CNPJ</strong>
                        <ul className="text-[11px] list-disc list-inside mt-0.5">
                          {cnpjResult.pendenciasCadastrais.map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                        <p className="text-[10px] text-rose-300/80 mt-1">
                          Aviso será enviado em destaque para a Coordenação do SEST SENAT.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Nenhuma pendência fiscal impeditiva identificada.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Resultado da Análise de CPF */}
            {cpfResult && tipoAtendimento === "individual" && (
              <div className="p-3.5 rounded-xl border border-slate-700 bg-slate-950/80 space-y-2 animate-fadeIn text-xs">
                <div
                  className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                    cpfResult.isRegistered
                      ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200"
                      : "bg-amber-950/40 border-amber-500/50 text-amber-200"
                  }`}
                >
                  {cpfResult.isRegistered ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <strong className="block text-xs">
                      {cpfResult.isRegistered
                        ? "Cliente Já Cadastrado no Sistema SEST SENAT"
                        : "Novo Cliente (Não Cadastrado Anteriormente)"}
                    </strong>
                    <p className="text-[11px] mt-0.5">{cpfResult.mensagem}</p>
                    {cpfResult.unidadeOrigem && (
                      <p className="text-[10px] text-emerald-300 mt-1">
                        Unidade Vinculada: {cpfResult.unidadeOrigem}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Nome do Contato e Telefone/Email */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  Nome do Solicitante / Contato
                </label>
                <input
                  type="text"
                  value={clienteNome}
                  onChange={(e) => setClienteNome(e.target.value)}
                  placeholder="Ex: Carlos Eduardo de Oliveira"
                  className="w-full bg-slate-950 border border-slate-700/80 focus:border-emerald-500 text-sm px-3.5 py-2 rounded-xl text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  Canal de Retorno para Proposta
                </label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setContactType("whatsapp")}
                    className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      contactType === "whatsapp"
                        ? "bg-emerald-600 text-slate-950 border-emerald-400 font-bold"
                        : "bg-slate-900 text-slate-300 border-slate-800"
                    }`}
                  >
                    <Phone className="w-3 h-3" /> WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactType("email")}
                    className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      contactType === "email"
                        ? "bg-emerald-600 text-slate-950 border-emerald-400 font-bold"
                        : "bg-slate-900 text-slate-300 border-slate-800"
                    }`}
                  >
                    <Mail className="w-3 h-3" /> E-mail
                  </button>
                </div>
                <input
                  type={contactType === "email" ? "email" : "tel"}
                  value={contatoInput}
                  onChange={(e) => setContatoInput(e.target.value)}
                  placeholder={contactType === "email" ? "contato@empresa.com.br" : "(21) 98888-0000"}
                  className="w-full bg-slate-950 border border-slate-700/80 focus:border-emerald-500 text-sm px-3.5 py-2 rounded-xl text-white outline-none"
                />
              </div>
            </div>

            {/* Unidade Mais Próxima Detectada */}
            {nearestUnit && (
              <div className="p-3 rounded-xl bg-slate-950/90 border border-emerald-500/30 flex items-start gap-2.5 text-xs">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide block">
                    Polo de Atendimento Designado
                  </span>
                  <strong className="text-white text-xs">{nearestUnit.name}</strong>
                  <p className="text-slate-400 text-[11px] mt-0.5">{nearestUnit.address}</p>
                  {nearestUnit.phone && (
                    <p className="text-[10px] text-slate-300 mt-0.5">Telefone: {nearestUnit.phone}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ABA 2: RESUMO E ENCAMINHAMENTO TEAMS */}
        {activeTab === "resumo" && (
          <div className="space-y-4 text-xs">
            {/* Banner de Direcionamento Comercial Inteligente */}
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                leadRoutingPreview?.destination === "coordenacao"
                  ? "bg-emerald-950/60 border-emerald-500 text-emerald-100"
                  : "bg-slate-950 border-slate-700 text-slate-200"
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-sm block font-bold">
                  {leadRoutingPreview?.destination === "coordenacao"
                    ? "👔 Direcionamento: Coordenação Geral SEST SENAT Deodoro"
                    : "💼 Direcionamento: Setor de Vendas Corporativas"}
                </strong>
                <p className="text-[11px] mt-1 text-slate-300">
                  {leadRoutingPreview?.reason || "Avaliação automática baseada em porte, CNAE e total de matrículas."}
                </p>
              </div>
            </div>

            {/* Lista dos Cursos Selecionados com Quantidade */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">Cursos Selecionados ({selectedCourses.length})</span>
                <span className="text-emerald-400 font-bold">{totalAlunos} aluno(s) total</span>
              </div>

              {selectedCourses.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-slate-500">
                  <p>Nenhum curso selecionado ainda.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("catalogo")}
                    className="mt-2 text-xs text-emerald-400 hover:underline font-semibold"
                  >
                    Ver catálogo de cursos
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedCourses.map((c) => (
                    <div
                      key={c.id}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-white line-clamp-1">{c.name}</p>
                        <p className="text-[10px] text-slate-400">{c.modality || "Presencial"}</p>
                      </div>
                      <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold text-xs">
                        {c.studentCount} vaga(s)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Checklist de Envio */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-[11px] text-slate-300">
              <p className="font-bold text-slate-200 text-xs">Resumo do Envio:</p>
              <p>• <strong>Cliente:</strong> {clienteNome || "Não informado"}</p>
              <p>• <strong>Documento:</strong> {documentoInput || "Não informado"}</p>
              <p>• <strong>Canal Retorno:</strong> {contatoInput || "Não informado"}</p>
              <p>• <strong>Unidade Designada:</strong> {nearestUnit?.name || "SEST SENAT Deodoro"}</p>
              <p>• <strong>Setor Transporte:</strong> {cnpjResult?.isTransporteOrLogistica ? "Sim (Com Benefícios)" : "Geral"}</p>
            </div>

            {/* Botão de Envio para Teams */}
            <button
              type="button"
              onClick={onSubmitProposal}
              disabled={isSubmittingProposal || !clienteNome || !contatoInput || selectedCourses.length === 0}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-40 text-slate-950 font-extrabold py-3 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              {isSubmittingProposal ? (
                <span>Despachando para o Teams...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>
                    {leadRoutingPreview?.destination === "coordenacao"
                      ? "Enviar Resumo para a Coordenação (Teams)"
                      : "Enviar Resumo para o Setor de Vendas (Teams)"}
                  </span>
                </>
              )}
            </button>

            {submissionResult && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 space-y-1 animate-fadeIn">
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Solicitação Despachada com Sucesso!</span>
                </div>
                <p className="text-xs">{submissionResult.message}</p>
                <p className="text-[11px] text-emerald-300">
                  Canal Destino: <strong>{submissionResult.destination === "coordenacao" ? "Coordenação Geral" : "Setor de Vendas"}</strong> | Status Teams: <strong>{submissionResult.teamsWebhookStatus}</strong>
                </p>
              </div>
            )}
          </div>
        )}

        {/* ABA 3: CATÁLOGO DE CURSOS (FILTROS) */}
        {activeTab === "catalogo" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs pb-1">
              <span className="text-slate-400 font-medium">Selecione os cursos abaixo:</span>
              <button
                type="button"
                onClick={() => setActiveTab("resumo")}
                className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
              >
                <span>Finalizar Proposta ({selectedCourses.length})</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
