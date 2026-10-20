import React from 'react';
import { MapPin, TrendingUp, Check, ArrowRight } from 'lucide-react';
import { NEIGHBORHOODS, NeighborhoodInfo } from '../data/properties';

interface NeighborhoodsGuideProps {
  onSelectNeighborhood: (bairroName: string) => void;
}

export const NeighborhoodsGuide: React.FC<NeighborhoodsGuideProps> = ({ onSelectNeighborhood }) => {
  return (
    <section id="bairros" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wider mb-2">
            <MapPin className="w-4 h-4" />
            <span>Guia de Bairros Nobres</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            As Melhores Regiões de Maceió para Morar e Investir
          </h2>
          <p className="text-base text-slate-600 mt-3 leading-relaxed">
            Maceió ostenta a orla urbana mais encantadora do Brasil. Conheça as particularidades de cada bairro e encontre o endereço que mais combina com seu estilo de vida e planos financeiros.
          </p>
        </div>

        {/* Neighborhoods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {NEIGHBORHOODS.map((nh) => (
            <div
              key={nh.slug}
              className="group bg-slate-50 hover:bg-white rounded-2xl border border-slate-200/90 hover:border-teal-600/50 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div>
                {/* Visual Header Strip */}
                <div className={`h-24 w-full rounded-xl bg-gradient-to-r ${nh.coverGradient} p-4 text-white flex flex-col justify-between mb-5 shadow-sm`}>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="bg-black/30 backdrop-blur-md px-2 py-0.5 rounded">
                      {nh.avgPricePerSqm}
                    </span>
                    <span className="font-mono text-white/80">
                      {nh.propertyCount}+ opções
                    </span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">
                    {nh.name}
                  </h3>
                </div>

                <p className="text-xs font-bold text-slate-900 mb-2 leading-snug">
                  {nh.headline}
                </p>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {nh.description}
                </p>

                {/* Highlights */}
                <div className="space-y-1.5 pt-3 border-t border-slate-200/80 mb-6">
                  {nh.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-slate-700">
                      <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span className="truncate">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectNeighborhood(nh.name)}
                className="w-full py-2.5 px-3 rounded-lg bg-white group-hover:bg-teal-700 text-slate-800 group-hover:text-white border border-slate-300 group-hover:border-teal-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Ver Imóveis em {nh.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
