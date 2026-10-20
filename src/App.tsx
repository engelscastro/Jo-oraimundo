import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  Filter, 
  RotateCcw, 
  Sparkles, 
  SlidersHorizontal, 
  Check, 
  Flame, 
  Eye, 
  ArrowRight,
  ShieldCheck,
  Phone,
  Settings
} from 'lucide-react';
import { Property } from './data/properties';
import { RealEstateProvider, useRealEstate } from './context/RealEstateContext';
import { Navbar } from './components/Navbar';
import { HeroCarousel } from './components/HeroCarousel';
import { PropertyCard } from './components/PropertyCard';
import { PropertyModal } from './components/PropertyModal';
import { RotativePromoBanner } from './components/RotativePromoBanner';
import { NeighborhoodsGuide } from './components/NeighborhoodsGuide';
import { FinancingSimulator } from './components/FinancingSimulator';
import { AboutBroker } from './components/AboutBroker';
import { Testimonials } from './components/Testimonials';
import { ContactSection } from './components/ContactSection';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/admin/AdminDashboard';

function LandingPageContent() {
  const { properties, banners, brokerInfo } = useRealEstate();

  // Admin Modal state
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [filterBairro, setFilterBairro] = useState<string>('Todos');
  const [filterBedrooms, setFilterBedrooms] = useState<string>('Todos');
  const [filterPriceRange, setFilterPriceRange] = useState<string>('Todos');
  const [activeCategoryTab, setActiveCategoryTab] = useState<'todos' | 'lancamentos' | 'frente_mar' | 'prontos'>('todos');

  // Modal & simulator states
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [simulatorInitialPrice, setSimulatorInitialPrice] = useState<number>(850000);

  // Compute filtered properties from dynamic state
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      // Category tab
      if (activeCategoryTab === 'lancamentos' && p.status !== 'Lançamento') return false;
      if (activeCategoryTab === 'frente_mar' && !p.beachfront) return false;
      if (activeCategoryTab === 'prontos' && p.status !== 'Pronto para Morar') return false;

      // Status filter
      if (filterStatus !== 'Todos' && p.status !== filterStatus) return false;

      // Bairro filter
      if (filterBairro !== 'Todos' && p.bairro !== filterBairro) return false;

      // Bedrooms filter
      if (filterBedrooms !== 'Todos') {
        const reqBeds = parseInt(filterBedrooms, 10);
        if (reqBeds === 4) {
          if (p.bedroomsMax < 4) return false;
        } else {
          if (p.bedroomsMin > reqBeds || p.bedroomsMax < reqBeds) return false;
        }
      }

      // Price filter
      if (filterPriceRange === 'ate-800k' && p.price > 800000) return false;
      if (filterPriceRange === '800k-1.5m' && (p.price < 800000 || p.price > 1500000)) return false;
      if (filterPriceRange === 'acima-1.5m' && p.price < 1500000) return false;

      return true;
    });
  }, [properties, filterStatus, filterBairro, filterBedrooms, filterPriceRange, activeCategoryTab]);

  // Handler from Hero Carousel Search Bar
  const handleHeroSearch = (filters: {
    status: string;
    bairro: string;
    bedrooms: string;
    priceRange: string;
  }) => {
    setFilterStatus(filters.status);
    setFilterBairro(filters.bairro);
    setFilterBedrooms(filters.bedrooms);
    setFilterPriceRange(filters.priceRange);
  };

  // Handler when clicking a neighborhood from NeighborhoodsGuide
  const handleSelectNeighborhood = (bairroName: string) => {
    setFilterBairro(bairroName);
    const targetElement = document.getElementById('imoveis');
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handler when clicking simulator from a card or modal
  const handleOpenSimulator = (price: number) => {
    setSimulatorInitialPrice(price);
    const simulatorElement = document.getElementById('simulador');
    if (simulatorElement) {
      simulatorElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilterStatus('Todos');
    setFilterBairro('Todos');
    setFilterBedrooms('Todos');
    setFilterPriceRange('Todos');
    setActiveCategoryTab('todos');
  };

  // Promo Banner Action Handler
  const handlePromoAction = (action: string) => {
    if (action === 'filter_lancamentos') {
      setActiveCategoryTab('lancamentos');
      setFilterStatus('Lançamento');
      const targetElement = document.getElementById('imoveis');
      if (targetElement) targetElement.scrollIntoView({ behavior: 'smooth' });
    } else if (action === 'open_simulator') {
      const targetElement = document.getElementById('simulador');
      if (targetElement) targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-teal-500 selection:text-white relative">
      
      {/* 3-zone Header Nav Bar with Admin Trigger */}
      <Navbar onOpenAdmin={() => setIsAdminOpen(true)} />

      {/* Hero Section with Rotative Banners and Floating Search Filter */}
      <HeroCarousel 
        banners={banners}
        onSearch={handleHeroSearch}
        filteredCount={filteredProperties.length}
      />

      {/* Main Content Area: Property Listings */}
      <main id="imoveis" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20">
        
        {/* Section Header & Interactive Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider mb-2">
              <Building2 className="w-4 h-4" />
              <span>Portfólio Exclusivo em Maceió</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Apartamentos e Lançamentos Selecionados
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              {filteredProperties.length} {filteredProperties.length === 1 ? 'imóvel disponível' : 'imóveis disponíveis'} de alto padrão com localização privilegiada.
            </p>
          </div>

          {/* Category Tabs (Segmented controls with active states) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-xl overflow-x-auto scrollbar-none self-start md:self-auto">
            <button
              onClick={() => setActiveCategoryTab('todos')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                activeCategoryTab === 'todos'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos os Imóveis
            </button>
            <button
              onClick={() => setActiveCategoryTab('lancamentos')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                activeCategoryTab === 'lancamentos'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lançamentos na Planta
            </button>
            <button
              onClick={() => setActiveCategoryTab('frente_mar')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                activeCategoryTab === 'frente_mar'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Frente Mar
            </button>
            <button
              onClick={() => setActiveCategoryTab('prontos')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                activeCategoryTab === 'prontos'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Prontos para Morar
            </button>
          </div>
        </div>

        {/* Active Filter Badges with Quick Reset */}
        {(filterStatus !== 'Todos' || filterBairro !== 'Todos' || filterBedrooms !== 'Todos' || filterPriceRange !== 'Todos' || activeCategoryTab !== 'todos') && (
          <div className="flex flex-wrap items-center gap-2 pt-4 pb-2">
            <span className="text-xs font-semibold text-slate-500">Filtros ativos:</span>
            
            {filterStatus !== 'Todos' && (
              <span className="px-2.5 py-1 text-xs rounded-md bg-teal-50 text-teal-800 border border-teal-200 font-medium">
                Status: {filterStatus}
              </span>
            )}

            {filterBairro !== 'Todos' && (
              <span className="px-2.5 py-1 text-xs rounded-md bg-teal-50 text-teal-800 border border-teal-200 font-medium">
                Bairro: {filterBairro}
              </span>
            )}

            {filterBedrooms !== 'Todos' && (
              <span className="px-2.5 py-1 text-xs rounded-md bg-teal-50 text-teal-800 border border-teal-200 font-medium">
                Quartos: {filterBedrooms}
              </span>
            )}

            {filterPriceRange !== 'Todos' && (
              <span className="px-2.5 py-1 text-xs rounded-md bg-teal-50 text-teal-800 border border-teal-200 font-medium">
                Faixa: {filterPriceRange === 'ate-800k' ? 'Até R$ 800k' : filterPriceRange === '800k-1.5m' ? 'R$ 800k a 1.5M' : 'Acima de R$ 1.5M'}
              </span>
            )}

            <button
              onClick={resetFilters}
              className="px-2.5 py-1 text-xs rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 font-bold transition-colors inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpar Filtros</span>
            </button>
          </div>
        )}

        {/* Properties Showcase Grid */}
        <div className="mt-8">
          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  onOpenDetails={(p) => setSelectedProperty(p)}
                  onOpenSimulatorForProperty={(p) => handleOpenSimulator(p.price)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">
                Nenhum imóvel encontrado com esses filtros
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Tente ajustar a faixa de preço, bairro ou quantidade de dormitórios para visualizar mais opções do catálogo.
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Ver Todos os Imóveis de Maceió
              </button>
            </div>
          )}
        </div>

      </main>

      {/* Mid-Page Rotative Promotional Banner */}
      <RotativePromoBanner onTriggerAction={handlePromoAction} />

      {/* Interactive Neighborhoods Guide */}
      <NeighborhoodsGuide onSelectNeighborhood={handleSelectNeighborhood} />

      {/* Mortgage and Financing Simulator */}
      <FinancingSimulator initialPrice={simulatorInitialPrice} />

      {/* About Broker João Raimundo */}
      <AboutBroker brokerInfo={brokerInfo} />

      {/* Testimonials */}
      <Testimonials />

      {/* Lead Capture and Contact Section */}
      <ContactSection />

      {/* Footer */}
      <Footer brokerInfo={brokerInfo} onOpenAdmin={() => setIsAdminOpen(true)} />

      {/* Floating WhatsApp Action Button */}
      <FloatingWhatsApp />

      {/* Fixed Admin Access Button (Bottom Left) */}
      <button
        onClick={() => setIsAdminOpen(true)}
        className="fixed bottom-5 left-5 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xl border border-slate-700 transition-transform hover:scale-105"
        title="Abrir Painel Administrativo de Fotos e Conteúdo"
      >
        <Settings className="w-4 h-4 text-teal-400" />
        <span className="hidden sm:inline">Gerenciar Fotos &amp; Site</span>
      </button>

      {/* Property Details Modal */}
      <PropertyModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onOpenSimulator={handleOpenSimulator}
      />

      {/* Full Admin Dashboard Modal */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <RealEstateProvider>
      <LandingPageContent />
    </RealEstateProvider>
  );
}
