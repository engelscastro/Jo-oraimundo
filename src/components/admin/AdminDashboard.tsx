import React, { useState, useRef } from 'react';
import { 
  X, 
  Settings, 
  Image as ImageIcon, 
  Building2, 
  User, 
  Plus, 
  Trash2, 
  Upload, 
  Save, 
  RotateCcw, 
  Download, 
  Check, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Eye,
  Sliders,
  DollarSign,
  MapPin,
  Lock
} from 'lucide-react';
import { useRealEstate } from '../../context/RealEstateContext';
import { Property, BannerSlide, PropertyImage, MACEIO_BAIRROS, MACEIO_BAIRROS_BY_REGION } from '../../data/properties';

const POPULAR_MACEIO_BAIRROS = [
  "Ponta Verde",
  "Jatiúca",
  "Pajuçara",
  "Cruz das Almas",
  "Mangabeiras",
  "Guaxuma",
  "Garça Torta",
  "Ipioca",
  "Farol",
  "Gruta de Lourdes",
  "Serraria",
  "Antares"
];

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const {
    properties,
    banners,
    brokerInfo,
    updateBanner,
    addBanner,
    deleteBanner,
    updateProperty,
    addProperty,
    deleteProperty,
    updateBroker,
    resetToDefaults,
    exportJSON,
    importJSON
  } = useRealEstate();

  const [activeTab, setActiveTab] = useState<'banners' | 'properties' | 'broker' | 'backup'>('banners');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id || '');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // New Property Registration Modal State
  const [isCreatingProperty, setIsCreatingProperty] = useState(false);
  const [newPropData, setNewPropData] = useState({
    title: '',
    code: '',
    tagline: 'Lançamento Exclusivo',
    bairro: 'Ponta Verde',
    customBairro: '',
    isCustomBairro: false,
    address: 'Maceió - AL',
    price: 850000,
    status: 'Lançamento' as Property['status'],
    deliveryYear: '2027',
    areaMin: 70,
    areaMax: 120,
    bedroomsMin: 2,
    bedroomsMax: 3,
    parkingSpots: 2,
    bathrooms: 2,
    beachfront: false,
    seaView: true
  });

  // Selected property reference
  const currentProperty = properties.find((p) => p.id === selectedPropertyId) || properties[0];

  const showNotification = (msg: string) => {
    setSaveSuccessNotice(msg);
    setTimeout(() => setSaveSuccessNotice(null), 3000);
  };

  if (!isOpen) return null;

  // Helper to convert uploaded file into base64 data URL
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('A imagem é muito grande! Escolha uma imagem de até 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        onSuccess(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Export JSON file
  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportJSON());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `joao_raimundo_site_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON file
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importJSON(content);
        if (ok) {
          showNotification('Backup importado com sucesso!');
        } else {
          alert('Erro ao importar arquivo JSON. Verifique o formato.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6">
      <div className="relative bg-white w-full max-w-6xl h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Painel Administrativo do Site
              </h2>
              <p className="text-xs text-teal-400">
                Gerencie fotos, banners, imóveis e dados do corretor em tempo real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {saveSuccessNotice && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-500/30">
                <Check className="w-4 h-4" />
                <span>{saveSuccessNotice}</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Fechar painel"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 border-b border-slate-200 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('banners')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'banners'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-teal-600" />
            <span>Banners Rotativos ({banners.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('properties')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'properties'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-teal-600" />
            <span>Imóveis &amp; Fotos ({properties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('broker')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'broker'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-teal-600" />
            <span>Perfil do Corretor</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'backup'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Save className="w-4 h-4 text-teal-600" />
            <span>Backup &amp; Restaurar</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          
          {/* TAB 1: BANNERS ROTATIVOS */}
          {activeTab === 'banners' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Gerenciar Banners do Topo
                  </h3>
                  <p className="text-xs text-slate-500">
                    Edite as fotos, títulos e botões que aparecem no carrossel da página inicial.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const newId = `slide-${Date.now()}`;
                    addBanner({
                      id: newId,
                      badge: "NOVO LANÇAMENTO",
                      title: "Novo Empreendimento em Maceió",
                      highlight: "Condições Especiais de Lançamento",
                      subtitle: "Apartamentos com vista mar e infraestrutura completa.",
                      bairro: "Ponta Verde",
                      ctaText: "Ver Empreendimento",
                      ctaTarget: "#imoveis",
                      priceText: "A partir de R$ 900.000",
                      imageTheme: "ponta_verde"
                    });
                    showNotification('Novo banner adicionado!');
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Novo Banner</span>
                </button>
              </div>

              {/* Banners List */}
              <div className="space-y-6">
                {banners.map((slide, idx) => (
                  <div
                    key={slide.id}
                    className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">
                          {slide.title || 'Banner sem título'}
                        </h4>
                      </div>

                      {banners.length > 1 && (
                        <button
                          onClick={() => {
                            if (window.confirm('Excluir este banner?')) {
                              deleteBanner(slide.id);
                              showNotification('Banner removido');
                            }
                          }}
                          className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Excluir</span>
                        </button>
                      )}
                    </div>

                    {/* Image Preview & Upload Row */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      
                      <div className="md:col-span-5 space-y-2">
                        <label className="text-xs font-bold text-slate-700 block">
                          Prévia da Imagem do Banner
                        </label>
                        <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center">
                          {slide.imageUrl ? (
                            <img
                              src={slide.imageUrl}
                              alt={slide.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center p-4">
                              <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-1" />
                              <p className="text-[11px] text-slate-400">Usando ilustração padrão de Maceió</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-7 space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">
                            Fazer Upload de Foto do Computador (PNG/JPG)
                          </label>
                          <div className="flex items-center gap-2">
                            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors">
                              <Upload className="w-4 h-4 text-teal-400" />
                              <span>Escolher Foto do seu PC</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleFileUpload(e, (dataUrl) => {
                                    updateBanner({ ...slide, imageUrl: dataUrl });
                                    showNotification('Imagem do banner atualizada!');
                                  })
                                }
                              />
                            </label>

                            {slide.imageUrl && (
                              <button
                                type="button"
                                onClick={() => {
                                  updateBanner({ ...slide, imageUrl: undefined });
                                  showNotification('Imagem personalizada removida');
                                }}
                                className="px-3 py-2 text-xs text-slate-600 hover:text-red-600 font-medium"
                              >
                                Remover foto
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">
                            Ou insira o caminho / URL da Imagem:
                          </label>
                          <input
                            type="text"
                            value={slide.imageUrl || ''}
                            onChange={(e) => updateBanner({ ...slide, imageUrl: e.target.value })}
                            placeholder="Ex: /images/banner-ponta-verde.jpg ou https://..."
                            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      </div>

                    </div>

                    {/* Text Inputs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Badge Superior</label>
                        <input
                          type="text"
                          value={slide.badge}
                          onChange={(e) => updateBanner({ ...slide, badge: e.target.value })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-semibold text-slate-700">Título Principal</label>
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) => updateBanner({ ...slide, title: e.target.value })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-semibold text-slate-700">Destaque Promocional</label>
                        <input
                          type="text"
                          value={slide.highlight}
                          onChange={(e) => updateBanner({ ...slide, highlight: e.target.value })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Bairro</label>
                        <input
                          type="text"
                          value={slide.bairro}
                          onChange={(e) => updateBanner({ ...slide, bairro: e.target.value })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-semibold text-slate-700">Subtítulo / Descrição</label>
                        <input
                          type="text"
                          value={slide.subtitle}
                          onChange={(e) => updateBanner({ ...slide, subtitle: e.target.value })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Texto de Preço</label>
                        <input
                          type="text"
                          value={slide.priceText || ''}
                          onChange={(e) => updateBanner({ ...slide, priceText: e.target.value })}
                          placeholder="Ex: A partir de R$ 1.890.000"
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: IMÓVEIS & FOTOS */}
          {activeTab === 'properties' && (
            <div className="max-w-6xl mx-auto space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Gerenciar Imóveis e Galerias de Fotos
                  </h3>
                  <p className="text-xs text-slate-500">
                    Adicione fotos, altere preços, metragens e informações de cada empreendimento.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setNewPropData({
                      title: '',
                      code: `JR-${Math.floor(Math.random() * 900 + 100)}`,
                      tagline: 'Lançamento exclusivo em Maceió',
                      bairro: 'Ponta Verde',
                      customBairro: '',
                      isCustomBairro: false,
                      address: 'Ponta Verde, Maceió - AL',
                      price: 950000,
                      status: 'Lançamento',
                      deliveryYear: '2027',
                      areaMin: 80,
                      areaMax: 130,
                      bedroomsMin: 2,
                      bedroomsMax: 3,
                      parkingSpots: 2,
                      bathrooms: 2,
                      beachfront: false,
                      seaView: true
                    });
                    setIsCreatingProperty(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs shadow-md transition-all hover:scale-[1.02]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Novo Imóvel</span>
                </button>
              </div>

              {/* MODAL: CADASTRAR NOVO IMÓVEL COM TODOS OS 50 BAIRROS DE MACEIÓ */}
              {isCreatingProperty && (
                <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
                  <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                    {/* Modal Header */}
                    <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center font-bold">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white">
                            Cadastrar Novo Imóvel em Maceió
                          </h3>
                          <p className="text-xs text-teal-400">
                            Selecione entre todos os 50 bairros oficiais de Maceió
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCreatingProperty(false)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Modal Form */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const finalBairro = newPropData.isCustomBairro && newPropData.customBairro.trim()
                          ? newPropData.customBairro.trim()
                          : newPropData.bairro;

                        const newProp: Property = {
                          id: `prop-${Date.now()}`,
                          code: newPropData.code || `JR-${Math.floor(Math.random() * 900 + 100)}`,
                          title: newPropData.title.trim() || `Residencial em ${finalBairro}`,
                          tagline: newPropData.tagline || 'Lançamento exclusivo em Maceió',
                          bairro: finalBairro,
                          address: newPropData.address.trim() || `${finalBairro}, Maceió - AL`,
                          status: newPropData.status,
                          deliveryYear: newPropData.deliveryYear || '2027',
                          price: Number(newPropData.price) || 850000,
                          condoFee: 750,
                          iptu: 250,
                          areaMin: Number(newPropData.areaMin) || 70,
                          areaMax: Number(newPropData.areaMax) || 120,
                          bedroomsMin: Number(newPropData.bedroomsMin) || 2,
                          bedroomsMax: Number(newPropData.bedroomsMax) || 3,
                          suitesMin: 1,
                          suitesMax: 2,
                          parkingSpots: Number(newPropData.parkingSpots) || 1,
                          bathrooms: Number(newPropData.bathrooms) || 2,
                          featured: true,
                          seaView: newPropData.seaView,
                          beachfront: newPropData.beachfront,
                          images: [
                            {
                              id: `img-${Date.now()}-1`,
                              url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600' width='100%' height='100%'><rect width='800' height='600' fill='%230f172a'/><text x='400' y='300' fill='%23ffffff' font-size='24' font-family='sans-serif' text-anchor='middle'>Insira a foto da fachada</text></svg>",
                              title: "Fachada Principal",
                              category: "exterior"
                            }
                          ],
                          description: `Excelente oportunidade imobiliária no bairro ${finalBairro} em Maceió. Projeto com acabamento primoroso, área de lazer equipada e localização estratégica.`,
                          amenities: [
                            "Piscina com deck molhado",
                            "Espaço Fitness / Academia",
                            "Varanda Gourmet integrada",
                            "Portaria e segurança 24h"
                          ],
                          differentials: [
                            `Localização privilegiada no bairro ${finalBairro}`,
                            "Alto potencial de valorização em Maceió"
                          ]
                        };

                        addProperty(newProp);
                        setSelectedPropertyId(newProp.id);
                        setIsCreatingProperty(false);
                        showNotification(`Imóvel cadastrado com sucesso em ${finalBairro}!`);
                      }}
                      className="p-6 overflow-y-auto space-y-5"
                    >
                      {/* Row 1: Title and Code */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-xs font-bold text-slate-700">
                            Título do Empreendimento *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Mansão Vista Mar, Edifício Ilhas do Sul..."
                            value={newPropData.title}
                            onChange={(e) => setNewPropData({ ...newPropData, title: e.target.value })}
                            className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 font-medium"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">
                            Código de Referência
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: JR-810"
                            value={newPropData.code}
                            onChange={(e) => setNewPropData({ ...newPropData, code: e.target.value })}
                            className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 font-mono font-bold"
                          />
                        </div>
                      </div>

                      {/* Row 2: BAIRROS DE MACEIÓ (TODOS OS 50 BAIRROS) */}
                      <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200/80 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <label className="text-xs font-extrabold text-teal-900 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-teal-700" />
                            <span>Bairro de Maceió (50 Bairros Oficiais Disponíveis) *</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setNewPropData({ ...newPropData, isCustomBairro: !newPropData.isCustomBairro })}
                            className="text-[11px] text-teal-800 hover:text-teal-950 font-semibold underline text-left"
                          >
                            {newPropData.isCustomBairro ? 'Voltar para lista de bairros' : 'Digitar outro bairro / condomínio'}
                          </button>
                        </div>

                        {newPropData.isCustomBairro ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              placeholder="Digite o nome do bairro ou condomínio (ex: Reserva Pratagy, Aldebaran...)"
                              value={newPropData.customBairro}
                              onChange={(e) => setNewPropData({ ...newPropData, customBairro: e.target.value })}
                              className="w-full text-xs px-3 py-2.5 rounded-lg border border-teal-300 bg-white focus:ring-2 focus:ring-teal-500 font-semibold text-slate-900"
                            />
                            <p className="text-[11px] text-teal-700">
                              O nome personalizado será exibido no cartão do imóvel e na busca.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <select
                              value={newPropData.bairro}
                              onChange={(e) => setNewPropData({ ...newPropData, bairro: e.target.value })}
                              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-teal-300 bg-white focus:ring-2 focus:ring-teal-500 font-semibold text-slate-900 shadow-xs"
                            >
                              {MACEIO_BAIRROS_BY_REGION.map((group) => (
                                <optgroup key={group.region} label={`📍 ${group.region} (${group.bairros.length} bairros)`}>
                                  {group.bairros.map((b) => (
                                    <option key={b} value={b}>
                                      {b}
                                    </option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>

                            {/* Quick selection chips for top demand neighborhoods */}
                            <div className="pt-1">
                              <span className="text-[11px] font-bold text-teal-900 block mb-1.5">
                                Bairros Mais Procurados (Clique rápido para selecionar):
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {POPULAR_MACEIO_BAIRROS.map((popB) => (
                                  <button
                                    type="button"
                                    key={popB}
                                    onClick={() => setNewPropData({ ...newPropData, bairro: popB, isCustomBairro: false })}
                                    className={`text-[11px] px-2.5 py-1 rounded-md font-semibold transition-all ${
                                      newPropData.bairro === popB && !newPropData.isCustomBairro
                                        ? 'bg-teal-700 text-white shadow-xs'
                                        : 'bg-white hover:bg-teal-100 text-teal-900 border border-teal-200'
                                    }`}
                                  >
                                    {popB}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="space-y-1 pt-1">
                          <label className="text-xs font-semibold text-slate-700">
                            Endereço / Localização Específica
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Av. Álvaro Otacílio, 450 - Ponta Verde, Maceió - AL"
                            value={newPropData.address}
                            onChange={(e) => setNewPropData({ ...newPropData, address: e.target.value })}
                            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      </div>

                      {/* Row 3: Preço, Status e Entrega */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">
                            Valor de Venda (R$) *
                          </label>
                          <input
                            type="number"
                            required
                            value={newPropData.price}
                            onChange={(e) => setNewPropData({ ...newPropData, price: Number(e.target.value) })}
                            className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 font-bold text-slate-900"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">
                            Status da Obra
                          </label>
                          <select
                            value={newPropData.status}
                            onChange={(e) => setNewPropData({ ...newPropData, status: e.target.value as any })}
                            className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 bg-white font-medium"
                          >
                            <option value="Lançamento">Lançamento</option>
                            <option value="Em Construção">Em Construção</option>
                            <option value="Pronto para Morar">Pronto para Morar</option>
                            <option value="Últimas Unidades">Últimas Unidades</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">
                            Previsão de Entrega
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: 2027 ou Pronto"
                            value={newPropData.deliveryYear}
                            onChange={(e) => setNewPropData({ ...newPropData, deliveryYear: e.target.value })}
                            className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 font-medium"
                          />
                        </div>
                      </div>

                      {/* Row 4: Specs (Área, Quartos, Vagas) */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">Área Mín (m²)</label>
                          <input
                            type="number"
                            value={newPropData.areaMin}
                            onChange={(e) => setNewPropData({ ...newPropData, areaMin: Number(e.target.value) })}
                            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-medium"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">Área Máx (m²)</label>
                          <input
                            type="number"
                            value={newPropData.areaMax}
                            onChange={(e) => setNewPropData({ ...newPropData, areaMax: Number(e.target.value) })}
                            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-medium"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">Quartos Mín</label>
                          <input
                            type="number"
                            value={newPropData.bedroomsMin}
                            onChange={(e) => setNewPropData({ ...newPropData, bedroomsMin: Number(e.target.value) })}
                            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-medium"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">Quartos Máx</label>
                          <input
                            type="number"
                            value={newPropData.bedroomsMax}
                            onChange={(e) => setNewPropData({ ...newPropData, bedroomsMax: Number(e.target.value) })}
                            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-medium"
                          />
                        </div>
                      </div>

                      {/* Row 5: Diferenciais Rápidos */}
                      <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newPropData.seaView}
                            onChange={(e) => setNewPropData({ ...newPropData, seaView: e.target.checked })}
                            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                          />
                          <span>Vista para o Mar</span>
                        </label>

                        <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newPropData.beachfront}
                            onChange={(e) => setNewPropData({ ...newPropData, beachfront: e.target.checked })}
                            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                          />
                          <span>Frente Mar / Pé na Areia</span>
                        </label>
                      </div>

                      {/* Modal Footer Actions */}
                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => setIsCreatingProperty(false)}
                          className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          Cancelar
                        </button>

                        <button
                          type="submit"
                          className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-md transition-all hover:scale-[1.02]"
                        >
                          <Check className="w-4 h-4" />
                          <span>Concluir Cadastro e Inserir Fotos</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Property Selector & Editor Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Selector List (4 cols) */}
                <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-3 space-y-2 max-h-[70vh] overflow-y-auto">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 block">
                    Selecione um Imóvel:
                  </span>
                  {properties.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPropertyId(p.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        p.id === currentProperty?.id
                          ? 'bg-teal-50 border-teal-500 shadow-xs'
                          : 'bg-white border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-teal-800">{p.bairro}</span>
                        <span className="font-mono text-slate-400">{p.code}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {p.title}
                      </h4>
                      <p className="text-[11px] font-extrabold text-slate-700 mt-1">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(p.price)}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Right Editor Form (8 cols) */}
                {currentProperty && (
                  <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                    
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                          Editando Imóvel:
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900">
                          {currentProperty.title} ({currentProperty.code})
                        </h3>
                      </div>

                      {properties.length > 1 && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Excluir o imóvel ${currentProperty.title}?`)) {
                              deleteProperty(currentProperty.id);
                              showNotification('Imóvel excluído');
                            }
                          }}
                          className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Excluir Imóvel</span>
                        </button>
                      )}
                    </div>

                    {/* SECTION: PHOTO GALLERY MANAGER */}
                    <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4 text-teal-600" />
                            <span>Galeria de Fotos do Imóvel ({currentProperty.images.length} fotos)</span>
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Faça upload das fotos da fachada, interiores, lazer e planta baixa.
                          </p>
                        </div>

                        {/* Add Photo Button */}
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm">
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar Foto do PC</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileUpload(e, (dataUrl) => {
                                const newImg: PropertyImage = {
                                  id: `img-${Date.now()}`,
                                  url: dataUrl,
                                  title: `Foto ${currentProperty.images.length + 1}`,
                                  category: 'interior'
                                };
                                updateProperty({
                                  ...currentProperty,
                                  images: [...currentProperty.images, newImg]
                                });
                                showNotification('Foto adicionada à galeria!');
                              })
                            }
                          />
                        </label>
                      </div>

                      {/* Photo Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {currentProperty.images.map((img, photoIdx) => (
                          <div
                            key={img.id}
                            className="group relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900 aspect-[4/3]"
                          >
                            <img
                              src={img.url}
                              alt={img.title}
                              className="w-full h-full object-cover"
                            />
                            
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                              <span className="text-[10px] text-white font-semibold truncate">
                                {img.title}
                              </span>

                              <button
                                onClick={() => {
                                  const updated = currentProperty.images.filter((_, i) => i !== photoIdx);
                                  updateProperty({ ...currentProperty, images: updated });
                                  showNotification('Foto removida');
                                }}
                                className="self-end p-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs"
                                title="Excluir foto"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="absolute bottom-1 left-1 bg-black/70 text-[9px] text-white px-1.5 py-0.5 rounded">
                              {photoIdx + 1}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Manual Image URL Adder */}
                      <div className="pt-2 flex items-center gap-2">
                        <input
                          type="text"
                          id={`new-url-${currentProperty.id}`}
                          placeholder="Ou cole a URL direta de uma imagem da internet..."
                          className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById(`new-url-${currentProperty.id}`) as HTMLInputElement;
                            if (input && input.value) {
                              const newImg: PropertyImage = {
                                id: `img-${Date.now()}`,
                                url: input.value,
                                title: `Foto ${currentProperty.images.length + 1}`,
                                category: 'exterior'
                              };
                              updateProperty({
                                ...currentProperty,
                                images: [...currentProperty.images, newImg]
                              });
                              input.value = '';
                              showNotification('Foto adicionada via link!');
                            }
                          }}
                          className="px-3 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700"
                        >
                          Adicionar Link
                        </button>
                      </div>
                    </div>

                    {/* Basic Data Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-semibold text-slate-700">Título do Empreendimento</label>
                        <input
                          type="text"
                          value={currentProperty.title}
                          onChange={(e) => updateProperty({ ...currentProperty, title: e.target.value })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Código</label>
                        <input
                          type="text"
                          value={currentProperty.code}
                          onChange={(e) => updateProperty({ ...currentProperty, code: e.target.value })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-semibold text-slate-700">Endereço Completo</label>
                        <input
                          type="text"
                          value={currentProperty.address}
                          onChange={(e) => updateProperty({ ...currentProperty, address: e.target.value })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-teal-600" />
                            <span>Bairro de Maceió</span>
                          </label>
                          <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded font-bold">
                            50 bairros
                          </span>
                        </div>
                        <select
                          value={currentProperty.bairro}
                          onChange={(e) => updateProperty({ ...currentProperty, bairro: e.target.value })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 bg-white font-medium"
                        >
                          {!MACEIO_BAIRROS.includes(currentProperty.bairro as any) && (
                            <option value={currentProperty.bairro}>
                              {currentProperty.bairro} (Personalizado)
                            </option>
                          )}
                          {MACEIO_BAIRROS_BY_REGION.map((group) => (
                            <optgroup key={group.region} label={`📍 ${group.region}`}>
                              {group.bairros.map((b) => (
                                <option key={b} value={b}>
                                  {b}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>

                        {/* Quick Selection Chips */}
                        <div className="flex flex-wrap items-center gap-1 pt-1">
                          {POPULAR_MACEIO_BAIRROS.slice(0, 6).map((popB) => (
                            <button
                              type="button"
                              key={popB}
                              onClick={() => updateProperty({ ...currentProperty, bairro: popB })}
                              className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                                currentProperty.bairro === popB
                                  ? 'bg-teal-700 text-white font-bold'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {popB}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Valor (R$)</label>
                        <input
                          type="number"
                          value={currentProperty.price}
                          onChange={(e) => updateProperty({ ...currentProperty, price: Number(e.target.value) })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Status da Obra</label>
                        <select
                          value={currentProperty.status}
                          onChange={(e) => updateProperty({ ...currentProperty, status: e.target.value as any })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 bg-white"
                        >
                          <option value="Lançamento">Lançamento</option>
                          <option value="Em Construção">Em Construção</option>
                          <option value="Pronto para Morar">Pronto para Morar</option>
                          <option value="Últimas Unidades">Últimas Unidades</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Previsão de Entrega</label>
                        <input
                          type="text"
                          value={currentProperty.deliveryYear}
                          onChange={(e) => updateProperty({ ...currentProperty, deliveryYear: e.target.value })}
                          placeholder="Ex: 2026 ou Pronto"
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    {/* Specs Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-100">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Área Mín (m²)</label>
                        <input
                          type="number"
                          value={currentProperty.areaMin}
                          onChange={(e) => updateProperty({ ...currentProperty, areaMin: Number(e.target.value) })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Área Máx (m²)</label>
                        <input
                          type="number"
                          value={currentProperty.areaMax}
                          onChange={(e) => updateProperty({ ...currentProperty, areaMax: Number(e.target.value) })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Quartos Mín</label>
                        <input
                          type="number"
                          value={currentProperty.bedroomsMin}
                          onChange={(e) => updateProperty({ ...currentProperty, bedroomsMin: Number(e.target.value) })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Quartos Máx</label>
                        <input
                          type="number"
                          value={currentProperty.bedroomsMax}
                          onChange={(e) => updateProperty({ ...currentProperty, bedroomsMax: Number(e.target.value) })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                        />
                      </div>
                    </div>

                    {/* Description Textarea */}
                    <div className="space-y-1 pt-3 border-t border-slate-100">
                      <label className="text-xs font-semibold text-slate-700">Descrição Detalhada</label>
                      <textarea
                        rows={3}
                        value={currentProperty.description}
                        onChange={(e) => updateProperty({ ...currentProperty, description: e.target.value })}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                  </div>
                )}

              </div>

            </div>
          )}

          {/* TAB 3: PERFIL DO CORRETOR */}
          {activeTab === 'broker' && (
            <div className="max-w-3xl mx-auto space-y-6 bg-white p-6 sm:p-8 rounded-xl border border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Dados e Foto do Corretor João Raimundo
                </h3>
                <p className="text-xs text-slate-500">
                  Atualize suas informações de contato, telefone WhatsApp, CRECI e foto de apresentação.
                </p>
              </div>

              {/* Photo Upload Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-28 h-36 rounded-xl overflow-hidden bg-slate-900 border border-slate-300 shadow-sm shrink-0 flex items-center justify-center">
                  {brokerInfo.avatarUrl ? (
                    <img
                      src={brokerInfo.avatarUrl}
                      alt={brokerInfo.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-slate-500" />
                  )}
                </div>

                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Foto de Perfil do Corretor
                  </h4>
                  <p className="text-xs text-slate-500">
                    Aparece na seção "Sobre João Raimundo" e no rodapé do site.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start pt-1">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm">
                      <Upload className="w-3.5 h-3.5 text-teal-400" />
                      <span>Carregar Foto do Computador</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(e, (dataUrl) => {
                            updateBroker({ avatarUrl: dataUrl });
                            showNotification('Foto do corretor atualizada!');
                          })
                        }
                      />
                    </label>

                    {brokerInfo.avatarUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          updateBroker({ avatarUrl: "" });
                          showNotification('Foto removida');
                        }}
                        className="px-3 py-2 text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Remover foto
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Nome do Corretor</label>
                  <input
                    type="text"
                    value={brokerInfo.name}
                    onChange={(e) => updateBroker({ name: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Número do CRECI</label>
                  <input
                    type="text"
                    value={brokerInfo.creci}
                    onChange={(e) => updateBroker({ creci: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">WhatsApp (apenas números com DDD)</label>
                  <input
                    type="text"
                    value={brokerInfo.whatsappNumber}
                    onChange={(e) => updateBroker({ whatsappNumber: e.target.value })}
                    placeholder="Ex: 558293154400"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Telefone Formatado</label>
                  <input
                    type="text"
                    value={brokerInfo.phoneFormatted}
                    onChange={(e) => updateBroker({ phoneFormatted: e.target.value })}
                    placeholder="Ex: (82) 9315-4400"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">E-mail Profissional</label>
                  <input
                    type="email"
                    value={brokerInfo.email}
                    onChange={(e) => updateBroker({ email: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Endereço do Escritório</label>
                  <input
                    type="text"
                    value={brokerInfo.address}
                    onChange={(e) => updateBroker({ address: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Biografia / Apresentação</label>
                  <textarea
                    rows={4}
                    value={brokerInfo.bio}
                    onChange={(e) => updateBroker({ bio: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: BACKUP & RESTAURAR */}
          {activeTab === 'backup' && (
            <div className="max-w-2xl mx-auto space-y-6 bg-white p-6 sm:p-8 rounded-xl border border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Backup e Exportação de Conteúdo
                </h3>
                <p className="text-xs text-slate-500">
                  Todas as suas alterações são salvas automaticamente no navegador. Você também pode exportar um arquivo de backup para salvar ou levar para outro computador.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  1. Exportar Arquivo JSON
                </h4>
                <p className="text-xs text-slate-600">
                  Baixe um arquivo contendo todos os seus imóveis, fotos e banners cadastrados.
                </p>
                <button
                  onClick={handleDownloadJSON}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4 text-teal-400" />
                  <span>Baixar Backup Completo (.JSON)</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  2. Importar Arquivo de Backup
                </h4>
                <p className="text-xs text-slate-600">
                  Restaure seus dados a partir de um arquivo JSON salvo anteriormente.
                </p>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold rounded-lg text-xs shadow-sm transition-colors">
                  <Upload className="w-4 h-4 text-teal-600" />
                  <span>Selecionar Arquivo JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImportFile}
                  />
                </label>
              </div>

              <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-3">
                <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider">
                  3. Restaurar Valores Originais
                </h4>
                <p className="text-xs text-red-700">
                  Apaga todas as alterações salvas no navegador e retorna o site aos dados originais.
                </p>
                <button
                  onClick={resetToDefaults}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs shadow-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restaurar Padrão do Sistema</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500">
            ✓ Alterações salvas instantaneamente no seu navegador.
          </p>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs"
          >
            Fechar Painel
          </button>
        </div>

      </div>
    </div>
  );
};
