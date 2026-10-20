import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Search, MapPin, Bed, DollarSign, Building, Sparkles, ArrowRight, MessageCircle } from 'lucide-react';
import { BANNER_SLIDES, BannerSlide } from '../data/properties';

interface HeroCarouselProps {
  banners?: BannerSlide[];
  onSearch: (filters: {
    status: string;
    bairro: string;
    bedrooms: string;
    priceRange: string;
  }) => void;
  filteredCount: number;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ 
  banners = BANNER_SLIDES,
  onSearch, 
  filteredCount 
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slideCount = banners.length || 1;

  // Keep currentSlide within bounds if banners change
  useEffect(() => {
    if (currentSlide >= banners.length) {
      setCurrentSlide(0);
    }
  }, [banners.length]);

  // Search filter states
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedBairro, setSelectedBairro] = useState('Todos');
  const [selectedBedrooms, setSelectedBedrooms] = useState('Todos');
  const [selectedPriceRange, setSelectedPriceRange] = useState('Todos');

  // Trigger search whenever any filter changes
  useEffect(() => {
    onSearch({
      status: selectedStatus,
      bairro: selectedBairro,
      bedrooms: selectedBedrooms,
      priceRange: selectedPriceRange,
    });
  }, [selectedStatus, selectedBairro, selectedBedrooms, selectedPriceRange]);

  // Auto rotation timer
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideCount);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, slideCount]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slideCount);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount);
  };

  const slide = banners[currentSlide] || banners[0] || BANNER_SLIDES[0];

  // Visual backdrops tailored for each Maceió slide
  const getSlideBackground = (theme: BannerSlide['imageTheme']) => {
    switch (theme) {
      case 'ponta_verde':
        return 'from-slate-950 via-teal-950/90 to-cyan-900/80';
      case 'pajucara':
        return 'from-slate-950 via-sky-950/90 to-blue-900/80';
      case 'jatiuca':
        return 'from-slate-950 via-slate-900/90 to-teal-900/80';
      case 'resort':
        return 'from-slate-950 via-emerald-950/90 to-cyan-950/80';
      default:
        return 'from-slate-950 via-slate-900 to-teal-950';
    }
  };

  return (
    <section 
      className="relative w-full bg-slate-100 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Destaques Imobiliários de Maceió"
    >
      {/* Rotative Banner Container */}
      <div className="relative min-h-[500px] sm:min-h-[540px] lg:min-h-[580px] flex items-end pb-28 sm:pb-24">
        {/* Crisp photo with ZERO shading / ZERO dark overlay */}
        {slide.imageUrl ? (
          <img
            src={slide.imageUrl}
            alt={slide.title}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          />
        ) : (
          <div 
            className="absolute inset-0 bg-gradient-to-r from-sky-100 via-teal-50 to-blue-100 transition-colors duration-500"
          />
        )}

        {/* Discreet, Low-Profile Info Box (Tucked at bottom-left, leaving images completely unobstructed) */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-md bg-white/92 hover:bg-white/98 backdrop-blur-md rounded-xl p-4 sm:p-5 shadow-lg border border-slate-200/80 space-y-2 text-slate-900 transition-all">
            
            {/* Top Badge/Kicker */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-[10px] font-bold text-teal-800 tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{slide.badge}</span>
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-semibold text-slate-600">{slide.bairro}</span>
            </div>

            {/* Display Headline */}
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug line-clamp-1">
              {slide.title}
            </h2>

            {/* Subtitle / Description */}
            <p className="text-xs text-slate-600 line-clamp-1">
              {slide.highlight || slide.subtitle}
            </p>

            {/* Price indicator & CTA in a single discreet row */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
              {slide.priceText ? (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block leading-tight">
                    A partir de
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 tabular-nums">
                    {slide.priceText}
                  </span>
                </div>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <a
                  href={slide.ctaTarget}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors whitespace-nowrap"
                >
                  <span>Ver Detalhes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>

                {slide.secondaryCtaText && (
                  <a
                    href={slide.secondaryCtaTarget}
                    target={slide.secondaryCtaTarget?.startsWith('http') ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                    title="Conversar no WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Carousel Arrow Controls (Crisp White Floating Buttons) */}
        <button
          onClick={prevSlide}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center border border-slate-200 shadow-xl transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500"
          aria-label="Slide anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center border border-slate-200 shadow-xl transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500"
          aria-label="Próximo slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicators / Thumbnails Bar */}
        <div className="absolute bottom-28 sm:bottom-24 left-0 right-0 z-20 flex justify-center items-center gap-2 px-4">
          {banners.map((b, index) => (
            <button
              key={b.id}
              onClick={() => setCurrentSlide(index)}
              className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none ${
                index === currentSlide 
                  ? 'w-10 bg-slate-900 shadow-md' 
                  : 'w-2.5 bg-slate-400/60 hover:bg-slate-600'
              }`}
              aria-label={`Ir para slide ${index + 1}: ${b.title}`}
            />
          ))}
        </div>
      </div>

      {/* Floating Real Estate Search Filter Bar (Apto.vc Style) */}
      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 mb-8">
        <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 p-4 sm:p-6 backdrop-blur-xl">
          
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base sm:text-lg">
              <Search className="w-5 h-5 text-teal-600" />
              <span>O que você procura em Maceió?</span>
            </div>
            
            {/* Quick status tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              {['Todos', 'Lançamento', 'Em Construção', 'Pronto para Morar'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                    selectedStatus === status
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Form grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            
            {/* Field 1: Bairro */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                <span>Bairro de Maceió</span>
              </label>
              <select
                value={selectedBairro}
                onChange={(e) => setSelectedBairro(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Todos">Todos os Bairros</option>
                <option value="Ponta Verde">Ponta Verde (Orla Nobre)</option>
                <option value="Jatiúca">Jatiúca (Polo Gastronômico)</option>
                <option value="Pajuçara">Pajuçara (Piscinas Naturais)</option>
                <option value="Guaxuma">Guaxuma (Litoral Norte Pé na Areia)</option>
                <option value="Farol">Farol (Alto Padrão Tradicional)</option>
              </select>
            </div>

            {/* Field 2: Quartos */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Bed className="w-3.5 h-3.5 text-teal-600" />
                <span>Quartos / Dormitórios</span>
              </label>
              <select
                value={selectedBedrooms}
                onChange={(e) => setSelectedBedrooms(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Todos">Qualquer quantidade</option>
                <option value="1">1 Quarto / Studio</option>
                <option value="2">2 Quartos</option>
                <option value="3">3 Quartos</option>
                <option value="4">4+ Quartos</option>
              </select>
            </div>

            {/* Field 3: Faixa de Preço */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-teal-600" />
                <span>Faixa de Preço</span>
              </label>
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Todos">Todas as faixas</option>
                <option value="ate-800k">Até R$ 800.000</option>
                <option value="800k-1.5m">R$ 800.000 a R$ 1.500.000</option>
                <option value="acima-1.5m">Acima de R$ 1.500.000</option>
              </select>
            </div>

            {/* Search Submit CTA */}
            <div className="flex items-end">
              <a
                href="#imoveis"
                className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-sm transition-colors shadow-md h-[42px]"
              >
                <Search className="w-4 h-4 text-teal-400" />
                <span>Ver {filteredCount} {filteredCount === 1 ? 'Imóvel' : 'Imóveis'}</span>
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
