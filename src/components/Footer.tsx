import React from 'react';
import { ShieldCheck, MapPin, Phone, Mail, Award } from 'lucide-react';
import { BROKER_INFO } from '../data/properties';

interface FooterProps {
  onOpenAdmin?: () => void;
  brokerInfo?: typeof BROKER_INFO;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, brokerInfo = BROKER_INFO }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand & Credential */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center font-bold text-lg">
                JR
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">
                  {brokerInfo.name}
                </h3>
                <p className="text-xs text-teal-400 font-medium">
                  {brokerInfo.creci.startsWith('CRECI') ? brokerInfo.creci : `CRECI ${brokerInfo.creci}`} · Alagoas
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Consultoria imobiliária especializada em apartamentos de alto padrão, lançamentos na planta e investimentos de alta rentabilidade na orla de Maceió.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Corretor Certificado e Regularizado</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Navegação
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#imoveis" className="hover:text-teal-400 transition-colors">
                  Imóveis em Destaque
                </a>
              </li>
              <li>
                <a href="#lancamentos" className="hover:text-teal-400 transition-colors">
                  Lançamentos Frente Mar
                </a>
              </li>
              <li>
                <a href="#bairros" className="hover:text-teal-400 transition-colors">
                  Bairros Nobres de Maceió
                </a>
              </li>
              <li>
                <a href="#simulador" className="hover:text-teal-400 transition-colors">
                  Simulador de Financiamento
                </a>
              </li>
              <li>
                <a href="#sobre" className="hover:text-teal-400 transition-colors">
                  Sobre João Raimundo
                </a>
              </li>
              <li>
                <a href="#contato" className="hover:text-teal-400 transition-colors">
                  Agendar Visita
                </a>
              </li>
              {onOpenAdmin && (
                <li>
                  <button
                    onClick={onOpenAdmin}
                    className="text-teal-400 hover:text-teal-300 font-semibold transition-colors flex items-center gap-1 mt-2 text-xs"
                  >
                    <span>⚙️ Painel Administrativo</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Maceió Neighborhoods */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Regiões Atendidas
            </h4>
            <ul className="space-y-2 text-xs">
              <li>Ponta Verde (Orla &amp; Piscinas Naturais)</li>
              <li>Jatiúca (Polo Gastronômico &amp; Mar Aberto)</li>
              <li>Pajuçara (Jangadas &amp; Studios Turísticos)</li>
              <li>Guaxuma (Litoral Norte &amp; Beach Resorts)</li>
              <li>Cruz das Almas &amp; Mangabeiras</li>
              <li>Farol (Tradicional Alto Padrão)</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Atendimento
            </h4>
            <div className="space-y-2.5 text-xs">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>{brokerInfo.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{brokerInfo.phoneFormatted}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{brokerInfo.email}</span>
              </p>
            </div>
          </div>

        </div>

        {/* Legal Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <p>
            © {new Date().getFullYear()} João Raimundo - Consultoria Imobiliária ({brokerInfo.creci.startsWith('CRECI') ? brokerInfo.creci : `CRECI ${brokerInfo.creci}`}). Todos os direitos reservados.
          </p>
          <p>
            As imagens, perspectivas e plantas são meramente ilustrativas e sujeitas a alteração conforme memorial descritivo dos empreendimentos.
          </p>
        </div>

      </div>
    </footer>
  );
};
