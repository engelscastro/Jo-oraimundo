import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';
import { TESTIMONIALS } from '../data/properties';

export const Testimonials: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Depoimentos Verificados</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            A Experiência de Quem Já Realizou o Sonho com João Raimundo
          </h2>
          <p className="text-base text-slate-600 mt-2">
            Famílias e investidores de todo o Brasil que confiaram na nossa assessoria imobiliária em Alagoas.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-7 flex flex-col justify-between hover:shadow-lg transition-shadow"
            >
              <div className="space-y-4">
                {/* Rating Stars */}
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{t.date}</span>
                </div>

                {/* Comment quote */}
                <p className="text-sm text-slate-700 italic leading-relaxed">
                  "{t.comment}"
                </p>
              </div>

              {/* Attribution */}
              <div className="pt-6 mt-6 border-t border-slate-200">
                <h4 className="text-sm font-bold text-slate-900">
                  {t.name}
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  {t.role} · {t.location}
                </p>
                <p className="text-xs text-teal-700 font-semibold mt-1">
                  {t.property}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
