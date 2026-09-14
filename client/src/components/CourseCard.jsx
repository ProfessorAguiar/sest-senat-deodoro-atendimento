import React from "react";
import { Check, Plus, Minus, Clock } from "lucide-react";

export default function CourseCard({ course, isSelected, studentCount = 1, onToggleSelect, onChangeQuantity }) {
  const [imageFailed, setImageFailed] = React.useState(false);
  return (
    <article className={`course-card group rounded-xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${isSelected ? "border-[#155a91] ring-2 ring-blue-100" : "border-slate-200"}`}>
      <div className="flex items-stretch gap-3 p-3">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-[#155a91] to-[#0ea5e9]" aria-hidden="true">
          {!imageFailed && course.imageUrl ? (
            <img src={course.imageUrl} alt="" className="h-full w-full object-cover" onError={() => setImageFailed(true)} />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center px-2 text-center text-white">
              <span className="text-xl font-extrabold">{course.code.slice(0, 3)}</span>
              <span className="text-[10px] font-semibold leading-tight">SEST SENAT</span>
            </div>
          )}
          <span className="absolute bottom-1 left-1 rounded bg-white/95 px-1.5 py-0.5 text-[10px] font-bold text-[#155a91]">{course.modality}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-[#155a91]">{course.code}</span>
            <span className="flex shrink-0 items-center gap-1 text-xs text-slate-600"><Clock className="h-3.5 w-3.5" />{course.workloadHours}h</span>
          </div>
          <h3 className="line-clamp-2 text-base font-bold leading-tight text-slate-900">{course.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm leading-snug text-slate-600">{course.description}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-3 py-2.5">
        {isSelected ? (
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-2 py-1 text-sm font-semibold text-slate-700" aria-label={`Quantidade de alunos para ${course.name}`}>
            <span>Alunos</span>
            <button type="button" aria-label="Diminuir quantidade" onClick={() => onChangeQuantity(Math.max(1, studentCount - 1))} className="rounded bg-white p-1 shadow-sm hover:bg-blue-50"><Minus className="h-4 w-4" /></button>
            <strong className="min-w-5 text-center text-[#155a91]">{studentCount}</strong>
            <button type="button" aria-label="Aumentar quantidade" onClick={() => onChangeQuantity(studentCount + 1)} className="rounded bg-white p-1 shadow-sm hover:bg-blue-50"><Plus className="h-4 w-4" /></button>
          </div>
        ) : <span className="text-sm text-slate-500">Selecione para incluir</span>}
        <button type="button" onClick={onToggleSelect} aria-pressed={isSelected} className={`rounded-lg px-3 py-2 text-sm font-bold transition ${isSelected ? "bg-[#155a91] text-white" : "border border-[#155a91] text-[#155a91] hover:bg-blue-50"}`}>
          {isSelected ? <><Check className="mr-1 inline h-4 w-4" />Selecionado</> : <><Plus className="mr-1 inline h-4 w-4" />Adicionar</>}
        </button>
      </div>
    </article>
  );
}
