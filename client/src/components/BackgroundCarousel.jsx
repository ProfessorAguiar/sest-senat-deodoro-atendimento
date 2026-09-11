import React, { useState, useEffect } from "react";

const SLIDES = [
  {
    url: "/manus-storage/FYusBcKCXS0O_8e7aac0a.jpeg",
    title: "Transporte Rodoviário em Movimento",
    subtitle: "Conectando cidades e impulsionando a economia do Brasil"
  },
  {
    url: "/manus-storage/vFvuTzc3UdbA.jpg",
    title: "Frotas Modernas e Sustentáveis",
    subtitle: "Capacitação técnica para alta performance e segurança viária"
  },
  {
    url: "/manus-storage/J06HgaA3EYnd_95ef0600.jpg",
    title: "Centros de Distribuição & Logística",
    subtitle: "Eficiência operacional de ponta a ponta"
  },
  {
    url: "/manus-storage/RKHydvZa8ZXp_3c2a8cbe.jpg",
    title: "Hubs de Integração e Armazenagem",
    subtitle: "Qualificação contínua para operadores e gestores de frota"
  },
  {
    url: "/manus-storage/xv592VLrZNxR_843e427e.jpg",
    title: "Valorização do Profissional do Transporte",
    subtitle: "O SEST SENAT Deodoro apoia o motorista e sua empresa"
  }
];

export default function BackgroundCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none">
      {SLIDES.map((slide, index) => (
        <div
          key={slide.url}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100 scale-100" : "opacity-0 scale-105"
          } transform transition-transform duration-7000`}
          style={{
            backgroundImage: `url(${slide.url})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat"
          }}
        />
      ))}

      {/* Gradientes e camadas de contraste para legibilidade profissional */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-900/90 backdrop-blur-[3px]" />
      <div className="absolute inset-0 bg-radial-at-t from-emerald-950/20 via-transparent to-slate-950/80" />

      {/* Legenda sutil no rodapé com indicador de foto */}
      <div className="absolute bottom-3 left-6 text-xs text-slate-400/80 flex items-center space-x-3 pointer-events-auto">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-medium text-slate-300">{SLIDES[currentIndex].title}</span>
        <span className="text-slate-500 hidden md:inline">• {SLIDES[currentIndex].subtitle}</span>
        <div className="flex space-x-1.5 pl-3">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === currentIndex ? "w-5 bg-emerald-400" : "w-1.5 bg-slate-600 hover:bg-slate-400"
              }`}
              title={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
