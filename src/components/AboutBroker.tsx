import React from 'react';
import { Award, ShieldCheck, CheckCircle2, Phone, Mail, MapPin, MessageCircle, Star } from 'lucide-react';
import { BROKER_INFO } from '../data/properties';

interface AboutBrokerProps {
  brokerInfo?: typeof BROKER_INFO;
}

export const AboutBroker: React.FC<AboutBrokerProps> = ({ brokerInfo = BROKER_INFO }) => {
  const whatsappUrl = `https://wa.me/${brokerInfo.whatsappNumber}?text=${encodeURIComponent(
    'Olá João Raimundo! Gostaria de agendar uma reunião ou consultoria imobiliária com você.'
  )}`;

  return (
    <section id="sobre" className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Visual & Credentials (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="relative mx-auto max-w-sm rounded-2xl bg-gradient-to-tr from-slate-900 via-teal-950 to-slate-900 p-3 shadow-xl">
              
              {/* Stylized Broker Portrait Card */}
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-slate-800 flex flex-col justify-end p-6 text-white">
                
                {/* Visual Avatar / Portrait Representation */}
                {brokerInfo.avatarUrl ? (
                  <img
                    src={brokerInfo.avatarUrl}
                    alt={brokerInfo.name}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <svg className="absolute inset-0 w-full h-full object-cover" viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="400" height="500" fill="#0f172a"/>
                    <circle cx="200" cy="180" r="90" fill="#1e293b"/>
                    <path d="M 80 460 C 80 340 130 300 200 300 C 270 300 320 340 320 460 Z" fill="#0284c7" opacity="0.4"/>
                    <polygon points="200,300 170,410 230,410" fill="#f8fafc"/>
                    <polygon points="200,340 185,460 215,460" fill="#0f172a"/>
                    <circle cx="200" cy="190" r="60" fill="#fbcfe8" opacity="0.9"/>
                    <path d="M 140 170 C 140 120 180 110 200 110 C 220 110 260 120 260 170 C 240 130 160 130 140 170 Z" fill="#1e1b4b"/>
                    <circle cx="360" cy="80" r="140" fill="#f59e0b" opacity="0.15"/>
                  </svg>
                )}
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10" />

                <div className="relative z-20 space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-500/30 text-teal-300 text-xs font-semibold backdrop-blur-md border border-teal-400/20">
                    <Award className="w-3.5 h-3.5" />
                    <span>{brokerInfo.creci.startsWith('CRECI') ? brokerInfo.creci : `CRECI ${brokerInfo.creci}`}</span>
                  </div>

                  <h3 className="text-2xl font-black text-white">
                    {brokerInfo.name}
                  </h3>

                  <p className="text-xs text-slate-300 font-medium">
                    {brokerInfo.role} · Alagoas
                  </p>

                  <div className="flex items-center gap-1 text-amber-400 pt-1 text-xs">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="font-bold text-white ml-1">4.9 / 5.0</span>
                    <span className="text-slate-400">({brokerInfo.reviewsCount} avaliações)</span>
                  </div>
                </div>

              </div>

              {/* Floating trust badge */}
              <div className="absolute -bottom-4 -right-4 bg-white text-slate-900 rounded-xl p-3 shadow-lg border border-slate-200 hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-base">
                  12+
                </div>
                <div className="text-xs">
                  <p className="font-bold">Anos de Mercado</p>
                  <p className="text-slate-500">Orla de Maceió</p>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Bio & Core Values (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="space-y-2">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                Consultoria Especializada
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Seu parceiro de confiança no litoral mais valorizado do Nordeste
              </h2>
            </div>

            <p className="text-base text-slate-700 leading-relaxed">
              {brokerInfo.bio}
            </p>

            {/* Metric proof counters */}
            <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-200">
              <div>
                <span className="block text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                  +{brokerInfo.propertiesSold}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Famílias Atendidas
                </span>
              </div>

              <div>
                <span className="block text-2xl sm:text-3xl font-black text-teal-700 tabular-nums">
                  {brokerInfo.volumeNegotiated}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Volume Transacionado
                </span>
              </div>

              <div>
                <span className="block text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                  100%
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Segurança Jurídica
                </span>
              </div>
            </div>

            {/* Core Service Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Curadoria de Lançamentos</h4>
                  <p className="text-xs text-slate-500">Acesso antecipado a tabelas de lançamento e plantas exclusivas.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Assessoria Bancária</h4>
                  <p className="text-xs text-slate-500">Aprovação ágil com as melhores taxas da Caixa, Itaú e Bradesco.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Suporte em Cartório</h4>
                  <p className="text-xs text-slate-500">Análise minuciosa de certidões, ITBI e escritura sem surpresas.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Foco em Rentabilidade</h4>
                  <p className="text-xs text-slate-500">Estudos de ROI para locação de curta temporada em Maceió.</p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm transition-colors shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Conversar no WhatsApp com João</span>
              </a>

              <a
                href={`tel:${brokerInfo.whatsappNumber}`}
                className="inline-flex items-center gap-2 px-5 py-3.5 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-lg text-sm border border-slate-300 transition-colors"
              >
                <Phone className="w-4 h-4 text-slate-500" />
                <span>{brokerInfo.phoneFormatted}</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
