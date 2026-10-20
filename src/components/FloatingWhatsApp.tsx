import React, { useState } from 'react';
import { MessageCircle, X, ChevronRight } from 'lucide-react';
import { BROKER_INFO } from '../data/properties';
import { useRealEstate } from '../context/RealEstateContext';

export const FloatingWhatsApp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { brokerInfo } = useRealEstate();
  const currentBroker = brokerInfo || BROKER_INFO;

  const openWhatsApp = (customMessage: string) => {
    const url = `https://wa.me/${currentBroker.whatsappNumber}?text=${encodeURIComponent(customMessage)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
      
      {/* Quick Menu Popover */}
      {isOpen && (
        <div className="mb-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
          
          {/* Header */}
          <div className="bg-emerald-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                JR
              </div>
              <div>
                <h4 className="text-sm font-bold leading-tight">{currentBroker.name}</h4>
                <p className="text-[11px] text-emerald-100">Corretor Online · Resposta Rápida</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-emerald-100 hover:text-white rounded-md"
              aria-label="Fechar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Questions */}
          <div className="p-3 bg-slate-50 space-y-2">
            <p className="text-[11px] font-semibold text-slate-500 px-1 uppercase tracking-wider">
              Como posso te ajudar hoje?
            </p>

            <button
              onClick={() => openWhatsApp('Olá João! Vi seu site e gostaria de conhecer os lançamentos de frente para o mar em Maceió.')}
              className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-950 border border-slate-200/80 hover:border-emerald-300 text-xs font-medium transition-colors flex items-center justify-between group shadow-2xs"
            >
              <span>Quero conhecer lançamentos na orla</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
            </button>

            <button
              onClick={() => openWhatsApp('Olá João Raimundo! Quero tirar dúvidas sobre aprovação de financiamento bancário para compra de imóvel.')}
              className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-950 border border-slate-200/80 hover:border-emerald-300 text-xs font-medium transition-colors flex items-center justify-between group shadow-2xs"
            >
              <span>Dúvidas sobre financiamento bancário</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
            </button>

            <button
              onClick={() => openWhatsApp('Olá João! Gostaria de agendar uma visita guiada para conhecer empreendimentos em Maceió.')}
              className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-950 border border-slate-200/80 hover:border-emerald-300 text-xs font-medium transition-colors flex items-center justify-between group shadow-2xs"
            >
              <span>Agendar visita a imóveis</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
            </button>

            <button
              onClick={() => openWhatsApp('Olá João Raimundo! Estou em Maceió e gostaria de uma consultoria imobiliária.')}
              className="w-full text-center py-2 text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              Iniciar conversa em branco
            </button>
          </div>

        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        aria-label="Abrir conversa no WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="hidden sm:inline">Falar no WhatsApp</span>
      </button>

    </div>
  );
};
