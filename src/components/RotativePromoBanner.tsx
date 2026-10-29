import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, MessageCircle } from 'lucide-react';
import { MID_BANNER_PROMOS, BROKER_INFO } from '../data/properties';
import { useRealEstate } from '../context/RealEstateContext';

interface RotativePromoBannerProps {
  onTriggerAction: (action: string) => void;
}

export const RotativePromoBanner: React.FC<RotativePromoBannerProps> = ({ onTriggerAction }) => {
  const { brokerInfo } = useRealEstate();
  const currentBroker = brokerInfo || BROKER_INFO;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const items = MID_BANNER_PROMOS;

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % items.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, items.length]);

  const promo = items[currentIdx];

  const handleAction = () => {
    if (promo.action === 'open_whatsapp') {
      const msg = encodeURIComponent(
        'Olá João Raimundo! Vi a consultoria para investidores no banner do site e gostaria de um estudo de rentabilidade em Maceió.'
      );
      window.open(`https://wa.me/${currentBroker.whatsappNumber}?text=${msg}`, '_blank');
    } else {
      onTriggerAction(promo.action);
    }
  };

  return (
    <section 
      className="py-12 bg-slate-100"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-8 sm:p-10 lg:p-12 overflow-hidden shadow-xl border border-slate-800">
          
          {/* Subtle geometric background pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:20px_20px]" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-teal-500/20 text-teal-300 text-xs font-bold tracking-wider border border-teal-500/30">
                <Sparkles className="w-3 h-3 text-teal-400" />
                <span>{promo.tag}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {promo.title}
              </h3>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {promo.description}
              </p>
            </div>

            {/* Action button & Carousel Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
              <button
                onClick={handleAction}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold rounded-lg text-sm shadow-md transition-colors"
              >
                <span>{promo.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentIdx((prev) => (prev - 1 + items.length) % items.length)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/20"
                  aria-label="Destaque anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentIdx((prev) => (prev + 1) % items.length)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/20"
                  aria-label="Próximo destaque"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

          </div>

          {/* Dots Indicator */}
          <div className="flex items-center gap-2 mt-6">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIdx ? 'w-8 bg-teal-400' : 'w-2 bg-white/30'
                }`}
                aria-label={`Banner promocional ${i + 1}`}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};
