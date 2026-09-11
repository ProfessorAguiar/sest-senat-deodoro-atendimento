import React from "react";
import { Check, Plus, Minus, BookOpen, Clock, Award } from "lucide-react";

export default function CourseCard({
  course,
  isSelected,
  studentCount = 1,
  onToggleSelect,
  onChangeQuantity
}) {
  return (
    <div
      className={`group relative rounded-xl border transition-all duration-200 overflow-hidden flex flex-col bg-slate-900/90 backdrop-blur-md shadow-lg ${
        isSelected
          ? "border-emerald-500 ring-2 ring-emerald-500/40 shadow-emerald-950/50"
          : "border-slate-800 hover:border-slate-700 hover:shadow-slate-900/70"
      }`}
    >
      {/* Imagem do curso com foto em destaque */}
      <div className="relative h-40 w-full overflow-hidden bg-slate-800">
        <img
          src={course.imageUrl}
          alt={course.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
        
        {/* Badges superiores */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500 text-slate-950 shadow">
            {course.modality}
          </span>
          {course.isPopular && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-400 text-slate-950 shadow flex items-center gap-1">
              <Award className="w-3 h-3" /> Destaque Deodoro
            </span>
          )}
        </div>

        <div className="absolute bottom-2 right-2.5 text-[11px] font-semibold text-slate-200 flex items-center gap-1 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-700/60 backdrop-blur-sm">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>{course.workloadHours}h carga</span>
        </div>
      </div>

      {/* Corpo do card */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-400">
            Cód. {course.code}
          </span>
          <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1 leading-snug">
            {course.name}
          </h3>
          <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
            {course.description}
          </p>
        </div>

        {/* Destaques em pílulas */}
        <div className="flex flex-wrap gap-1">
          {course.benefits.slice(0, 2).map((b, idx) => (
            <span
              key={idx}
              className="text-[10px] bg-slate-800/90 text-slate-300 border border-slate-700/60 px-2 py-0.5 rounded"
            >
              ✓ {b}
            </span>
          ))}
        </div>

        {/* Rodapé do Card: Seleção e Quantidade de Alunos */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
          {isSelected ? (
            <div className="flex items-center space-x-1.5 bg-slate-800/90 px-2 py-1 rounded-lg border border-slate-700">
              <span className="text-[11px] text-slate-400 font-medium">Alunos:</span>
              <button
                type="button"
                onClick={() => onChangeQuantity(Math.max(1, studentCount - 1))}
                className="w-5 h-5 flex items-center justify-center rounded bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                title="Diminuir alunos"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-5 text-center text-xs font-bold text-emerald-400">
                {studentCount}
              </span>
              <button
                type="button"
                onClick={() => onChangeQuantity(studentCount + 1)}
                className="w-5 h-5 flex items-center justify-center rounded bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                title="Aumentar alunos"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 italic">Disponível em Deodoro</span>
          )}

          <button
            type="button"
            onClick={onToggleSelect}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              isSelected
                ? "bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-sm"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-emerald-500/50"
            }`}
          >
            {isSelected ? (
              <>
                <Check className="w-3.5 h-3.5" /> Selecionado
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
