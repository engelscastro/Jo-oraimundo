import React, { useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Bed, 
  Car, 
  Bath, 
  Maximize2, 
  CheckCircle2, 
  MessageCircle, 
  Calendar, 
  ShieldCheck, 
  Calculator,
  Building,
  Sparkles
} from 'lucide-react';
import { Property, BROKER_INFO } from '../data/properties';
import { useRealEstate } from '../context/RealEstateContext';

interface PropertyModalProps {
  property: Property | null;
  onClose: () => void;
  onOpenSimulator: (price: number) => void;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({ 
  property, 
  onClose,
  onOpenSimulator 
}) => {
  const { brokerInfo } = useRealEstate();
  const currentBroker = brokerInfo || BROKER_INFO;

  if (!property) return null;

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadDate, setLeadDate] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const images = property.images;
  const filteredImages = selectedCategory === 'all' 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(property.price);

  const formattedCondo = property.condoFee ? new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(property.condoFee) : null;

  const nextImg = () => {
    setActiveImageIdx((prev) => (prev + 1) % images.length);
  };

  const prevImg = () => {
    setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadPhone) return;

    const message = encodeURIComponent(
      `Olá João Raimundo! Meu nome é ${leadName} (${leadPhone}). Tenho interesse no imóvel ${property.title} (${property.code}) em ${property.bairro}. ${leadDate ? `Gostaria de agendar visita para ${leadDate}.` : 'Gostaria de receber a tabela de preços e disponibilidade.'}`
    );

    window.open(`https://wa.me/${currentBroker.whatsappNumber}?text=${message}`, '_blank');
    setSubmitted(true);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 lg:p-6"
      onClick={onClose}
    >
      <div 
        className="relative bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden my-6 border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-xs font-bold rounded bg-slate-900 text-white">
              {property.status}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Código: <strong className="text-slate-800">{property.code}</strong>
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="hidden sm:flex items-center gap-1 text-xs text-teal-700 font-medium">
              <MapPin className="w-3.5 h-3.5" />
              <span>{property.bairro}, Maceió - AL</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors"
            aria-label="Fechar detalhes"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="max-h-[85vh] overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8">
          
          {/* Main Photo Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-950 shadow-md">
              <img
                src={images[activeImageIdx]?.url}
                alt={images[activeImageIdx]?.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />

              {/* Chevrons */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImg}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors focus:outline-none"
                    aria-label="Imagem anterior"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImg}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors focus:outline-none"
                    aria-label="Próxima imagem"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Caption pill */}
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 font-medium">
                {images[activeImageIdx]?.title}
              </div>

              <div className="absolute bottom-3 right-3 bg-black/70 text-white font-mono text-xs px-2.5 py-1 rounded-lg">
                {activeImageIdx + 1} de {images.length}
              </div>
            </div>

            {/* Thumbnail Row */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === activeImageIdx ? 'border-teal-600 scale-95 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Title and Specs Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: Details (2 spans) */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {property.title}
                </h2>
                <p className="text-sm font-medium text-teal-700 mt-1">
                  {property.tagline}
                </p>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{property.address}</span>
                </p>
              </div>

              {/* Specification Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="space-y-0.5">
                  <span className="text-xs text-slate-400 font-medium">Área Privativa</span>
                  <p className="text-base font-bold text-slate-900">
                    {property.areaMin === property.areaMax ? `${property.areaMin} m²` : `${property.areaMin} a ${property.areaMax} m²`}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs text-slate-400 font-medium">Dormitórios</span>
                  <p className="text-base font-bold text-slate-900">
                    {property.bedroomsMin === property.bedroomsMax ? `${property.bedroomsMin} quartos` : `${property.bedroomsMin} a ${property.bedroomsMax} quartos`}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs text-slate-400 font-medium">Suítes</span>
                  <p className="text-base font-bold text-slate-900">
                    {property.suitesMin === property.suitesMax ? `${property.suitesMin} suítes` : `${property.suitesMin} a ${property.suitesMax} suítes`}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs text-slate-400 font-medium">Vagas na Garagem</span>
                  <p className="text-base font-bold text-slate-900">
                    {property.parkingSpots} vagas cobertas
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-base font-bold text-slate-900">
                  Sobre o Empreendimento
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {property.description}
                </p>
              </div>

              {/* Amenities / Lazer */}
              <div className="space-y-3">
                <h4 className="text-base font-bold text-slate-900">
                  Áreas Comuns &amp; Lazer
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {property.amenities.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Differentials */}
              <div className="space-y-3">
                <h4 className="text-base font-bold text-slate-900">
                  Diferenciais Exclusivos
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {property.differentials.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Col: Pricing & Direct Action Box (1 span) */}
            <div className="space-y-6">
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-5">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">
                    Valor de Comercialização
                  </span>
                  <div className="text-3xl font-black text-slate-900 mt-1 tabular-nums">
                    {formattedPrice}
                  </div>
                  {formattedCondo && (
                    <p className="text-xs text-slate-500 mt-1">
                      Condomínio estimado: <strong>{formattedCondo}</strong>/mês
                    </p>
                  )}
                  <p className="text-xs text-slate-500">
                    Previsão de Entrega: <strong>{property.deliveryYear}</strong>
                  </p>
                </div>

                {/* Simulator Action Button */}
                <button
                  onClick={() => {
                    onClose();
                    onOpenSimulator(property.price);
                  }}
                  className="w-full py-2.5 px-3 rounded-lg border border-teal-600/30 hover:border-teal-600 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Calculator className="w-4 h-4 text-teal-600" />
                  <span>Simular Financiamento Bancário</span>
                </button>

                <div className="pt-2 border-t border-slate-200">
                  <h5 className="text-sm font-bold text-slate-900 mb-2">
                    Agendar Visita com João Raimundo
                  </h5>
                  <p className="text-xs text-slate-500 mb-4">
                    Receba a tabela completa, plantas e faça uma visita técnica acompanhada.
                  </p>

                  <form onSubmit={handleLeadSubmit} className="space-y-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Seu nome completo"
                        required
                        value={leadName}
                        onChange={(e) => setLeadName(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        placeholder="WhatsApp (ex: 82 99999-9999)"
                        required
                        value={leadPhone}
                        onChange={(e) => setLeadPhone(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <input
                        type="date"
                        value={leadDate}
                        onChange={(e) => setLeadDate(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        title="Data desejada para visita"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Falar Diretamente no WhatsApp</span>
                    </button>
                  </form>

                  {submitted && (
                    <p className="text-xs text-emerald-700 font-semibold text-center mt-2">
                      ✓ Redirecionando para o WhatsApp do João Raimundo...
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    JR
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">{currentBroker.name}</p>
                    <p className="text-slate-500">
                      {currentBroker.creci.startsWith('CRECI') ? currentBroker.creci : `CRECI ${currentBroker.creci}`} · Especialista Maceió
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
