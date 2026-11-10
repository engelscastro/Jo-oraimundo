import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  MapPin, 
  Bed, 
  Car, 
  Bath, 
  Sparkles, 
  MessageCircle, 
  Eye, 
  Percent,
  CheckCircle2
} from 'lucide-react';
import { Property, BROKER_INFO } from '../data/properties';
import { useRealEstate } from '../context/RealEstateContext';
import { resolveImageUrl, handleImageError } from '../services/githubService';

interface PropertyCardProps {
  property: Property;
  onOpenDetails: (property: Property) => void;
  onOpenSimulatorForProperty: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  onOpenDetails,
  onOpenSimulatorForProperty 
}) => {
  const { brokerInfo } = useRealEstate();
  const currentBroker = brokerInfo || BROKER_INFO;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = property.images;
  const totalImages = images.length;

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % totalImages);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(property.price);

  const whatsappMessage = encodeURIComponent(
    `Olá João Raimundo! Vi no seu site o imóvel ${property.title} (${property.code}) no bairro ${property.bairro} por ${formattedPrice}. Gostaria de mais informações e disponibilidade.`
  );

  const whatsappLink = `https://wa.me/${currentBroker.whatsappNumber}?text=${whatsappMessage}`;

  return (
    <article className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
      
      {/* Rotative Image Slider Container (Apto.vc style positioning) */}
      <div className="relative aspect-[16/10] w-full bg-slate-900 overflow-hidden">
        {/* Active Image */}
        <img
          src={resolveImageUrl(images[currentImageIndex]?.url)}
          onError={(e) => handleImageError(e, images[currentImageIndex]?.url)}
          alt={`${property.title} - ${images[currentImageIndex]?.title}`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
          onClick={() => onOpenDetails(property)}
        />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-slate-950/80 text-white backdrop-blur-md shadow-sm border border-white/10">
              {property.status}
            </span>

            {property.beachfront && (
              <span className="px-2 py-1 text-xs font-semibold rounded-md bg-teal-600/90 text-white backdrop-blur-md shadow-sm">
                Frente Mar
              </span>
            )}

            {property.seaView && !property.beachfront && (
              <span className="px-2 py-1 text-xs font-semibold rounded-md bg-cyan-700/90 text-white backdrop-blur-md shadow-sm">
                Vista Mar
              </span>
            )}
          </div>

          {/* Image counter indicator (e.g. 1/4) */}
          <span className="px-2 py-0.5 text-xs font-mono font-medium rounded bg-black/60 text-white backdrop-blur-sm border border-white/20">
            {currentImageIndex + 1}/{totalImages}
          </span>
        </div>

        {/* Slider Navigation Chevrons (Hover or always on mobile) */}
        {totalImages > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
              aria-label="Próxima foto"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Slide Indicator Dots */}
        <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentImageIndex ? 'w-5 bg-teal-400' : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Quick Zoom / Detail overlay button */}
        <button
          onClick={() => onOpenDetails(property)}
          className="absolute bottom-2.5 right-3 p-1.5 rounded-md bg-black/60 hover:bg-black/80 text-white text-xs flex items-center gap-1 backdrop-blur-sm transition-colors opacity-90 sm:opacity-0 group-hover:opacity-100"
          aria-label="Ver fotos expandidas"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px] font-medium">Fotos</span>
        </button>
      </div>

      {/* Property Information Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div>
          {/* Location & Code */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="flex items-center gap-1 font-semibold text-teal-700">
              <MapPin className="w-3.5 h-3.5" />
              <span>{property.bairro}, Maceió</span>
            </span>
            <span className="font-mono text-slate-400 text-[11px]">
              {property.code}
            </span>
          </div>

          {/* Development Title */}
          <h3 
            onClick={() => onOpenDetails(property)}
            className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors cursor-pointer line-clamp-1"
          >
            {property.title}
          </h3>

          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            {property.address}
          </p>

          {/* Construction progress bar if in progress */}
          {property.statusProgress && (
            <div className="mt-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1 font-medium">
                <span>Andamento da Obra</span>
                <span className="font-bold text-teal-700">{property.statusProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-teal-600 rounded-full"
                  style={{ width: `${property.statusProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Key Metric Specs */}
          <div className="grid grid-cols-4 gap-2 py-3 mt-3 border-y border-slate-100 text-slate-700">
            <div className="text-center">
              <span className="block text-[11px] text-slate-400 font-medium">Área</span>
              <span className="font-bold text-xs text-slate-900">
                {property.areaMin === property.areaMax ? `${property.areaMin}m²` : `${property.areaMin}-${property.areaMax}m²`}
              </span>
            </div>

            <div className="text-center">
              <span className="block text-[11px] text-slate-400 font-medium">Quartos</span>
              <span className="font-bold text-xs text-slate-900">
                {property.bedroomsMin === property.bedroomsMax ? `${property.bedroomsMin}` : `${property.bedroomsMin} a ${property.bedroomsMax}`}
              </span>
            </div>

            <div className="text-center">
              <span className="block text-[11px] text-slate-400 font-medium">Suítes</span>
              <span className="font-bold text-xs text-slate-900">
                {property.suitesMin === property.suitesMax ? `${property.suitesMin}` : `${property.suitesMin} a ${property.suitesMax}`}
              </span>
            </div>

            <div className="text-center">
              <span className="block text-[11px] text-slate-400 font-medium">Vagas</span>
              <span className="font-bold text-xs text-slate-900">
                {property.parkingSpots}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing & Call to Actions */}
        <div className="pt-2">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">
                Valor a partir de
              </span>
              <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                {formattedPrice}
              </span>
            </div>
            
            <button
              onClick={() => onOpenSimulatorForProperty(property)}
              className="text-xs text-teal-700 hover:text-teal-900 font-semibold underline underline-offset-2 flex items-center gap-1"
              title="Simular parcelas e financiamento"
            >
              <Percent className="w-3 h-3" />
              <span>Simular</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onOpenDetails(property)}
              className="w-full py-2.5 px-3 rounded-lg border border-slate-300 hover:border-slate-400 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver Detalhes</span>
            </button>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

      </div>

    </article>
  );
};
