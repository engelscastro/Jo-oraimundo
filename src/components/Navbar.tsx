import React, { useState } from 'react';
import { Phone, MessageCircle, Menu, X, Building2, MapPin } from 'lucide-react';
import { BROKER_INFO } from '../data/properties';
import { useRealEstate } from '../context/RealEstateContext';

interface NavbarProps {
  onSelectNeighborhood?: (neighborhood: string) => void;
  onFilterStatus?: (status: string) => void;
  onOpenAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAdmin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { brokerInfo } = useRealEstate();
  const currentBroker = brokerInfo || BROKER_INFO;

  const creciDisplay = currentBroker.creci.startsWith('CRECI') 
    ? currentBroker.creci 
    : `CRECI ${currentBroker.creci}`;

  const whatsappUrl = `https://wa.me/${currentBroker.whatsappNumber}?text=${encodeURIComponent(
    'Olá João Raimundo! Acessei seu site e gostaria de consultoria sobre imóveis em Maceió.'
  )}`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          
          {/* Zone 1: Single text element wordmark adhering to Top Bar Contract */}
          <a href="#" className="flex items-center gap-3 text-slate-900 group whitespace-nowrap shrink-0">
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-teal-700 transition-colors">
              JR
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
                João Raimundo
              </span>
              <span className="text-xs text-slate-500 font-medium tracking-wide">
                {creciDisplay} · Maceió
              </span>
            </div>
          </a>

          {/* Zone 2: 4-5 clean single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a 
              href="#imoveis" 
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Imóveis
            </a>
            <a 
              href="#lancamentos" 
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Lançamentos
            </a>
            <a 
              href="#bairros" 
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Bairros de Maceió
            </a>
            <a 
              href="#simulador" 
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Simulador
            </a>
            <a 
              href="#sobre" 
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Sobre João
            </a>
          </nav>

          {/* Zone 3: 1 primary action + Admin trigger */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                title="Gerenciar fotos, banners e conteúdos"
              >
                <span>Painel Admin</span>
              </button>
            )}

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-emerald-600"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Falar no WhatsApp</span>
            </a>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 rounded-md"
              aria-label="Abrir menu de navegação"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 animate-in fade-in duration-150">
          <nav className="flex flex-col space-y-3 pt-2">
            <a
              href="#imoveis"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md"
            >
              Ver Imóveis Disponíveis
            </a>
            <a
              href="#lancamentos"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md"
            >
              Lançamentos na Planta
            </a>
            <a
              href="#bairros"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md"
            >
              Bairros Nobres de Maceió
            </a>
            <a
              href="#simulador"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md"
            >
              Simulador de Financiamento
            </a>
            <a
              href="#sobre"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md"
            >
              Sobre o Corretor João Raimundo
            </a>
            <a
              href="#contato"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md"
            >
              Agendar Visita ou Consultoria
            </a>
          </nav>
          
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            {onOpenAdmin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
              >
                <span>⚙️ Abrir Painel Administrativo</span>
              </button>
            )}

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-emerald-600 rounded-lg shadow hover:bg-emerald-700 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Conversar via WhatsApp</span>
            </a>
            <a
              href={`tel:${currentBroker.whatsappNumber}`}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Ligar: {currentBroker.phoneFormatted}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
