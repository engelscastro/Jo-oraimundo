export interface PropertyImage {
  id: string;
  url: string;
  title: string;
  category: 'exterior' | 'interior' | 'lazer' | 'planta' | 'vista';
}

export const MACEIO_BAIRROS = [
  "Antares",
  "Barro Duro",
  "Bebedouro",
  "Benedito Bentes",
  "Bom Parto",
  "Canaã",
  "Centro",
  "Chã da Jaqueira",
  "Chã de Bebedouro",
  "Cidade Universitária",
  "Clima Bom",
  "Cruz das Almas",
  "Farol",
  "Feitosa",
  "Fernão Velho",
  "Garça Torta",
  "Gruta de Lourdes",
  "Guaxuma",
  "Ipioca",
  "Jacarecica",
  "Jacintinho",
  "Jaraguá",
  "Jardim Petrópolis",
  "Jatiúca",
  "Levada",
  "Mangabeiras",
  "Mutange",
  "Ouro Preto",
  "Pajuçara",
  "Pescaria",
  "Petrópolis",
  "Pinheiro",
  "Pitanguinha",
  "Poço",
  "Ponta da Terra",
  "Ponta Grossa",
  "Ponta Verde",
  "Pontal da Barra",
  "Prado",
  "Riacho Doce",
  "Rio Novo",
  "Santa Amélia",
  "Santa Lúcia",
  "Santo Amaro",
  "Santos Dumont",
  "São Jorge",
  "Serraria",
  "Tabuleiro do Martins",
  "Trapiche da Barra",
  "Vergel do Lago"
] as const;

export type MaceioBairro = (typeof MACEIO_BAIRROS)[number] | string;

export const MACEIO_BAIRROS_BY_REGION = [
  {
    region: "Orla Marítima e Praias (Litoral Sul e Norte)",
    bairros: [
      "Ponta Verde",
      "Jatiúca",
      "Pajuçara",
      "Cruz das Almas",
      "Mangabeiras",
      "Jacarecica",
      "Guaxuma",
      "Garça Torta",
      "Riacho Doce",
      "Pescaria",
      "Ipioca",
      "Pontal da Barra"
    ]
  },
  {
    region: "Zona Central, Histórica e Tradicional",
    bairros: [
      "Centro",
      "Farol",
      "Jaraguá",
      "Poço",
      "Ponta da Terra",
      "Ponta Grossa",
      "Prado",
      "Trapiche da Barra",
      "Levada",
      "Vergel do Lago",
      "Bom Parto",
      "Bebedouro",
      "Mutange",
      "Pinheiro",
      "Pitanguinha"
    ]
  },
  {
    region: "Zona Alta, Serraria e Gruta",
    bairros: [
      "Gruta de Lourdes",
      "Serraria",
      "Antares",
      "Barro Duro",
      "Feitosa",
      "São Jorge",
      "Jardim Petrópolis",
      "Santo Amaro",
      "Ouro Preto",
      "Canaã"
    ]
  },
  {
    region: "Tabuleiro e Zona Universitária / Norte-Oeste",
    bairros: [
      "Tabuleiro do Martins",
      "Cidade Universitária",
      "Santa Lúcia",
      "Santa Amélia",
      "Santos Dumont",
      "Clima Bom",
      "Benedito Bentes",
      "Jacintinho",
      "Chã da Jaqueira",
      "Chã de Bebedouro",
      "Petrópolis",
      "Fernão Velho",
      "Rio Novo"
    ]
  }
];

export interface Property {
  id: string;
  code: string;
  title: string;
  tagline: string;
  bairro: MaceioBairro;
  address: string;
  status: 'Lançamento' | 'Em Construção' | 'Pronto para Morar' | 'Últimas Unidades';
  statusProgress?: number; // e.g. 68% for em construção
  deliveryYear: string;
  price: number;
  condoFee?: number;
  iptu?: number;
  areaMin: number;
  areaMax: number;
  bedroomsMin: number;
  bedroomsMax: number;
  suitesMin: number;
  suitesMax: number;
  parkingSpots: number;
  bathrooms: number;
  featured: boolean;
  seaView: boolean;
  beachfront: boolean;
  images: PropertyImage[];
  description: string;
  amenities: string[];
  differentials: string[];
  coords?: { lat: number; lng: number };
}

export interface BannerSlide {
  id: string;
  badge: string;
  title: string;
  highlight: string;
  subtitle: string;
  bairro: string;
  ctaText: string;
  ctaTarget: string;
  secondaryCtaText?: string;
  secondaryCtaTarget?: string;
  priceText?: string;
  imageTheme: 'ponta_verde' | 'jatiuca' | 'pajucara' | 'resort';
  imageUrl?: string;
}

export interface NeighborhoodInfo {
  name: string;
  slug: string;
  headline: string;
  description: string;
  highlights: string[];
  avgPricePerSqm: string;
  propertyCount: number;
  coverGradient: string;
}

export const BROKER_INFO = {
  name: "João Raimundo",
  creci: "CRECI-AL 7438",
  role: "Consultor Imobiliário de Alto Padrão",
  region: "Maceió - Alagoas (Orla e Litoral)",
  phone: "+55 82 9315-4400",
  phoneFormatted: "(82) 9315-4400",
  email: "contato@joaoraimundocorretor.com.br",
  address: "Av. Silvio Carlos Viana, 2100 - Ponta Verde, Maceió - AL, 57035-160",
  whatsappNumber: "558293154400",
  experienceYears: 12,
  propertiesSold: 460,
  volumeNegotiated: "R$ 190 Milhões",
  rating: 4.9,
  reviewsCount: 148,
  avatarUrl: "",
  bio: "Especialista no mercado imobiliário litorâneo de Maceió há mais de uma década. Meu compromisso é encontrar o imóvel perfeito para a sua família ou o investimento com maior rentabilidade patrimonial na orla mais bonita do Brasil, oferecendo assessoria completa desde a escolha da planta até a entrega das chaves e trâmites de cartório."
};

// Rich SVG Data URLs for real estate illustrations with bright sunny daylight colors
const svgBg = (type: string, title: string, subtitle: string, accentHex: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="100%" height="100%">
    <defs>
      <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="60%" stop-color="#7dd3fc"/>
        <stop offset="100%" stop-color="#e0f2fe"/>
      </linearGradient>
      <linearGradient id="seaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="50%" stop-color="#06b6d4"/>
        <stop offset="100%" stop-color="#0d9488"/>
      </linearGradient>
      <linearGradient id="bldgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#f1f5f9"/>
      </linearGradient>
      <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="rgba(186,230,253,0.85)"/>
        <stop offset="100%" stop-color="rgba(125,211,252,0.5)"/>
      </linearGradient>
      <linearGradient id="sunsetGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="40%" stop-color="#38bdf8"/>
        <stop offset="75%" stop-color="#fb923c"/>
        <stop offset="100%" stop-color="#fde047"/>
      </linearGradient>
    </defs>
    <!-- Sunny Bright Sky -->
    <rect width="1200" height="800" fill="${type === 'sunset' ? 'url(#sunsetGrad)' : 'url(#skyGrad)'}"/>
    
    <!-- Sun -->
    <circle cx="1020" cy="180" r="60" fill="#fef08a" opacity="0.9"/>

    <!-- Tropical Emerald Ocean Wave layers -->
    <path d="M0,480 C300,450 600,510 1200,470 L1200,800 L0,800 Z" fill="url(#seaGrad)" opacity="0.95"/>
    <path d="M0,530 C400,570 800,500 1200,540 L1200,800 L0,800 Z" fill="#0891b2" opacity="0.8"/>
    
    <!-- White Sand Beach shoreline -->
    <path d="M0,570 Q350,550 700,590 T1200,560 L1200,800 L0,800 Z" fill="#fef3c7" opacity="0.95"/>

    <!-- Architectural Facade in Bright Daylight -->
    <g transform="translate(140, 160)">
      <!-- Main High-rise Building Structure -->
      <rect x="0" y="0" width="340" height="520" rx="8" fill="url(#bldgGrad)" stroke="#e2e8f0" stroke-width="2"/>
      <rect x="360" y="80" width="260" height="440" rx="6" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
      <rect x="640" y="140" width="220" height="380" rx="6" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>
      
      <!-- Architectural Glass Balconies (Crystal Blue) -->
      <g fill="url(#glassGrad)" stroke="#0284c7" stroke-width="1.5">
        <rect x="20" y="40" width="300" height="28" rx="3"/>
        <rect x="20" y="85" width="300" height="28" rx="3"/>
        <rect x="20" y="130" width="300" height="28" rx="3"/>
        <rect x="20" y="175" width="300" height="28" rx="3"/>
        <rect x="20" y="220" width="300" height="28" rx="3"/>
        <rect x="20" y="265" width="300" height="28" rx="3"/>
        <rect x="20" y="310" width="300" height="28" rx="3"/>
        <rect x="20" y="355" width="300" height="28" rx="3"/>
        <rect x="20" y="400" width="300" height="28" rx="3"/>
        <rect x="20" y="445" width="300" height="28" rx="3"/>

        <!-- Balconies Building 2 -->
        <rect x="380" y="120" width="220" height="24" rx="3"/>
        <rect x="380" y="160" width="220" height="24" rx="3"/>
        <rect x="380" y="200" width="220" height="24" rx="3"/>
        <rect x="380" y="240" width="220" height="24" rx="3"/>
        <rect x="380" y="280" width="220" height="24" rx="3"/>
        <rect x="380" y="320" width="220" height="24" rx="3"/>
        <rect x="380" y="360" width="220" height="24" rx="3"/>
        <rect x="380" y="400" width="220" height="24" rx="3"/>
        <rect x="380" y="440" width="220" height="24" rx="3"/>
      </g>

      <!-- Rooftop Infinity Pool Accent -->
      <rect x="10" y="10" width="320" height="15" rx="3" fill="#0ea5e9"/>
      <line x1="15" y1="20" x2="325" y2="20" stroke="#ffffff" stroke-width="2" stroke-dasharray="10,6"/>
    </g>

    <!-- Lush Tropical Green Palm Trees -->
    <g fill="#047857">
      <path d="M 980 620 Q 990 480 1010 380 Q 1025 480 1020 620 Z"/>
      <circle cx="1010" cy="380" r="16"/>
      <path d="M 1010 380 Q 930 360 880 410 Q 940 375 1010 380 Z"/>
      <path d="M 1010 380 Q 1070 330 1140 360 Q 1080 365 1010 380 Z"/>
      <path d="M 1010 380 Q 960 310 910 290 Q 960 330 1010 380 Z"/>
      <path d="M 1010 380 Q 1060 290 1120 310 Q 1070 340 1010 380 Z"/>
      <path d="M 1010 380 Q 1010 260 990 240 Q 1020 290 1010 380 Z"/>
    </g>

    <!-- Clean Label Tag -->
    <g transform="translate(60, 680)">
      <rect x="0" y="0" width="520" height="70" rx="8" fill="rgba(255, 255, 255, 0.95)" stroke="#cbd5e1" stroke-width="1.5"/>
      <circle cx="35" cy="35" r="18" fill="${accentHex}"/>
      <path d="M28 35 L33 40 L43 30" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round"/>
      <text x="68" y="32" fill="#0f172a" font-family="sans-serif" font-weight="700" font-size="20">${title}</text>
      <text x="68" y="54" fill="#475569" font-family="sans-serif" font-weight="500" font-size="14">${subtitle}</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const svgInterior = (title: string, subtitle: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="100%" height="100%">
    <defs>
      <linearGradient id="intGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f8fafc"/>
        <stop offset="100%" stop-color="#f1f5f9"/>
      </linearGradient>
      <linearGradient id="seaView" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="50%" stop-color="#06b6d4"/>
        <stop offset="100%" stop-color="#0284c7"/>
      </linearGradient>
      <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#92400e"/>
        <stop offset="100%" stop-color="#d97706"/>
      </linearGradient>
    </defs>
    <!-- Bright Interior Walls -->
    <rect width="1200" height="800" fill="url(#intGrad)"/>
    
    <!-- Floor-to-ceiling panoramic glass window showing Maceió Sea in Daylight -->
    <rect x="220" y="80" width="760" height="480" rx="4" fill="url(#seaView)"/>
    <path d="M220,380 C460,350 700,400 980,370 L980,560 L220,560 Z" fill="#0284c7" opacity="0.8"/>
    
    <!-- Window Frames in Clean Slate -->
    <line x1="470" y1="80" x2="470" y2="560" stroke="#cbd5e1" stroke-width="8"/>
    <line x1="730" y1="80" x2="730" y2="560" stroke="#cbd5e1" stroke-width="8"/>
    <rect x="216" y="76" width="768" height="488" rx="4" fill="none" stroke="#94a3b8" stroke-width="8"/>

    <!-- Floor with Bright Travertine Marble -->
    <polygon points="0,560 1200,560 1200,800 0,800" fill="#f8fafc"/>
    <line x1="200" y1="560" x2="100" y2="800" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="500" y1="560" x2="450" y2="800" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="800" y1="560" x2="850" y2="800" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="1050" y1="560" x2="1150" y2="800" stroke="#e2e8f0" stroke-width="2"/>

    <!-- Contemporary Designer Sofa in Warm Light Linen -->
    <rect x="320" y="580" width="480" height="130" rx="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
    <rect x="350" y="550" width="420" height="60" rx="12" fill="#f1f5f9"/>
    <rect x="290" y="590" width="40" height="110" rx="8" fill="#e2e8f0"/>
    <rect x="790" y="590" width="40" height="110" rx="8" fill="#e2e8f0"/>
    
    <!-- Minimalist Coffee Table -->
    <ellipse cx="560" cy="740" rx="140" ry="30" fill="url(#woodGrad)"/>

    <!-- Pendant Designer Lighting -->
    <line x1="560" y1="0" x2="560" y2="180" stroke="#b45309" stroke-width="3"/>
    <circle cx="560" cy="190" r="22" fill="#f59e0b"/>

    <!-- Label Tag -->
    <g transform="translate(60, 680)">
      <rect x="0" y="0" width="460" height="70" rx="8" fill="rgba(255, 255, 255, 0.95)" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="30" y="32" fill="#0f172a" font-family="sans-serif" font-weight="700" font-size="20">${title}</text>
      <text x="30" y="54" fill="#475569" font-family="sans-serif" font-weight="500" font-size="14">${subtitle}</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const svgRooftopPool = (title: string, subtitle: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="100%" height="100%">
    <defs>
      <linearGradient id="skyMidday" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="40%" stop-color="#38bdf8"/>
        <stop offset="80%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#f0f9ff"/>
      </linearGradient>
      <linearGradient id="poolWater" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="50%" stop-color="#06b6d4"/>
        <stop offset="100%" stop-color="#0284c7"/>
      </linearGradient>
    </defs>
    <!-- Bright Midday Sky -->
    <rect width="1200" height="800" fill="url(#skyMidday)"/>
    <circle cx="600" cy="220" r="70" fill="#fef08a" opacity="0.95"/>
    
    <!-- Horizon Sea line -->
    <rect x="0" y="380" width="1200" height="140" fill="#0284c7"/>
    
    <!-- Rooftop Decking in Light Teak Wood -->
    <polygon points="0,520 1200,520 1200,800 0,800" fill="#f8fafc"/>
    
    <!-- Glass Infinity Pool edge -->
    <polygon points="120,440 1080,440 1140,680 60,680" fill="url(#poolWater)"/>
    <line x1="120" y1="440" x2="1080" y2="440" stroke="#ffffff" stroke-width="4"/>
    <line x1="120" y1="440" x2="60" y2="680" stroke="#bae6fd" stroke-width="2"/>
    <line x1="1080" y1="440" x2="1140" y2="680" stroke="#bae6fd" stroke-width="2"/>

    <!-- Pool Water Ripple Accents -->
    <path d="M200,480 Q400,460 600,480 T1000,480" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.8"/>
    <path d="M150,540 Q350,520 650,540 T1050,540" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.8"/>
    <path d="M120,600 Q400,580 700,600 T1100,600" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.8"/>

    <!-- Deck Lounge Chairs -->
    <g fill="#ffffff" stroke="#cbd5e1" stroke-width="2">
      <polygon points="80,720 180,680 240,730 140,770"/>
      <polygon points="960,720 1060,680 1120,730 1020,770"/>
    </g>

    <!-- Label Tag -->
    <g transform="translate(60, 680)">
      <rect x="0" y="0" width="490" height="70" rx="8" fill="rgba(255, 255, 255, 0.95)" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="30" y="32" fill="#0f172a" font-family="sans-serif" font-weight="700" font-size="20">${title}</text>
      <text x="30" y="54" fill="#475569" font-family="sans-serif" font-weight="500" font-size="14">${subtitle}</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const svgPlanta = (title: string, sqm: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="100%" height="100%">
    <rect width="1200" height="800" fill="#f8fafc"/>
    <!-- Blueprint grid -->
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="1200" height="800" fill="url(#grid)"/>

    <!-- Floor Plan Walls Blueprint in Modern Slate -->
    <g stroke="#0f172a" stroke-width="4" fill="none">
      <!-- Outer perimeter -->
      <polygon points="200,140 1000,140 1000,660 200,660"/>
      
      <!-- Living / Balcony Area -->
      <line x1="200" y1="400" x2="650" y2="400"/>
      <line x1="650" y1="140" x2="650" y2="400"/>
      
      <!-- Master Suite -->
      <line x1="650" y1="260" x2="1000" y2="260"/>
      <line x1="820" y1="140" x2="820" y2="260"/>
      
      <!-- Second Suite & Bathroom -->
      <line x1="650" y1="460" x2="1000" y2="460"/>
      <line x1="820" y1="460" x2="820" y2="660"/>
      
      <!-- Kitchen & Gourmet Balcony -->
      <line x1="420" y1="400" x2="420" y2="660"/>
    </g>

    <!-- Room labels -->
    <g fill="#0f172a" font-family="sans-serif" font-size="16" font-weight="700" text-anchor="middle">
      <text x="420" y="270">LIVING INTEGRADO &amp; VARANDA GOURMET</text>
      <text x="420" y="295" font-size="13" fill="#0284c7">46.5 m² · Vista Panorâmica</text>

      <text x="735" y="200">SUÍTE MASTER</text>
      <text x="735" y="220" font-size="12" fill="#0284c7">24.2 m²</text>

      <text x="910" y="200">CLOSET / WC</text>
      <text x="910" y="220" font-size="12" fill="#0284c7">9.8 m²</text>

      <text x="825" y="360">SUÍTE 02</text>
      <text x="825" y="380" font-size="12" fill="#0284c7">18.6 m²</text>

      <text x="310" y="530">COZINHA &amp; ÁREA</text>
      <text x="310" y="550" font-size="12" fill="#0284c7">16.4 m²</text>

      <text x="535" y="530">SUÍTE 03 / HOME</text>
      <text x="535" y="550" font-size="12" fill="#0284c7">17.8 m²</text>

      <text x="910" y="560">LAVABO / BANHO</text>
    </g>

    <!-- Title Badge -->
    <g transform="translate(60, 680)">
      <rect x="0" y="0" width="540" height="70" rx="8" fill="rgba(255, 255, 255, 0.95)" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="30" y="32" fill="#0f172a" font-family="sans-serif" font-weight="700" font-size="20">PLANTA HUMANIZADA · ${title}</text>
      <text x="30" y="54" fill="#0284c7" font-family="sans-serif" font-weight="600" font-size="14">ÁREA PRIVATIVA: ${sqm} · ACABAMENTO PREMIUM</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const BANNER_SLIDES: BannerSlide[] = [
  {
    id: "slide-1",
    badge: "LANÇAMENTO EXCLUSIVO FRENTE MAR",
    title: "Viva de Frente para as Águas Esmeralda da Ponta Verde",
    highlight: "Condições Direto com a Construtora em até 60x",
    subtitle: "Apartamentos de 148 a 265 m² com 3 e 4 suítes e varanda gourmet infinita na Av. Silvio Carlos Viana.",
    bairro: "Ponta Verde",
    ctaText: "Ver Empreendimento",
    ctaTarget: "#imoveis",
    secondaryCtaText: "Falar com João Raimundo",
    secondaryCtaTarget: "https://wa.me/558293154400?text=Ola%20Joao%20Raimundo,%20vi%20o%20banner%20do%20Mare%20Nostrum%20na%20Ponta%20Verde%20e%20gostaria%20de%20mais%20detalhes.",
    priceText: "A partir de R$ 1.890.000",
    imageTheme: "ponta_verde",
    imageUrl: svgBg("ocean", "Orla de Ponta Verde", "Av. Silvio Carlos Viana · Frente Mar", "#0284c7")
  },
  {
    id: "slide-2",
    badge: "ALTA RENTABILIDADE & INVESTIMENTO",
    title: "Studios e 2 Quartos de Luxo na Pajuçara com Alta Ocupação",
    highlight: "Retorno Médio de 1,2% a 1,6% a.m. com Locação por Temporada",
    subtitle: "Estrutura completa de resort urbano com rooftop 360°, piscina aquecida e gestão profissional de locação.",
    bairro: "Pajuçara",
    ctaText: "Conhecer Oportunidade",
    ctaTarget: "#imoveis",
    secondaryCtaText: "Simular Rentabilidade",
    secondaryCtaTarget: "#simulador",
    priceText: "A partir de R$ 510.000",
    imageTheme: "pajucara",
    imageUrl: svgRooftopPool("Rooftop 360° Pajuçara", "Piscinas Naturais da Pajuçara")
  },
  {
    id: "slide-3",
    badge: "QUALIDADE DE VIDA & GASTRONOMIA",
    title: "O Melhor de Jatiúca: A Poucos Passos da Praia e dos Melhores Restaurantes",
    highlight: "Empreendimentos em Construção com Parcelas que Cabem no Seu Planejamento",
    subtitle: "Plantas modernas de 78 a 124 m² com lazer nas alturas, fechadura digital e tomada para carro elétrico.",
    bairro: "Jatiúca",
    ctaText: "Ver Imóveis em Jatiúca",
    ctaTarget: "#imoveis",
    secondaryCtaText: "Agendar Visita Guiada",
    secondaryCtaTarget: "#contato",
    priceText: "A partir de R$ 840.000",
    imageTheme: "jatiuca",
    imageUrl: svgInterior("Living Panorâmico", "Jatiúca · Alto Padrão")
  },
  {
    id: "slide-4",
    badge: "REFÚGIO PÉ NA AREIA",
    title: "Residencial Resort em Guaxuma: Mar Tranquilo e Natureza Preservada",
    highlight: "Casas e Apartamentos Garden com Acesso Exclusivo à Praia",
    subtitle: "Viva o melhor do litoral norte de Maceió a apenas 12 minutos do Centro da cidade.",
    bairro: "Guaxuma",
    ctaText: "Explorar o Resort",
    ctaTarget: "#imoveis",
    secondaryCtaText: "Receber Apresentação PDF",
    secondaryCtaTarget: "https://wa.me/558293154400?text=Ola%20Joao,%20quero%20receber%20a%20apresentacao%20em%20PDF%20do%20Residencial%20Guaxuma.",
    priceText: "A partir de R$ 1.150.000",
    imageTheme: "resort",
    imageUrl: svgBg("sunset", "Guaxuma Beach Resort", "Litoral Norte de Maceió", "#059669")
  }
];

export const PROPERTIES: Property[] = [
  {
    id: "prop-1",
    code: "JR-PV01",
    title: "Residencial Mare Nostrum",
    tagline: "A Obra-Prima da Orla de Ponta Verde",
    bairro: "Ponta Verde",
    address: "Av. Silvio Carlos Viana, 1420 - Ponta Verde, Maceió - AL",
    status: "Lançamento",
    deliveryYear: "2027",
    price: 1890000,
    condoFee: 1200,
    iptu: 450,
    areaMin: 148,
    areaMax: 265,
    bedroomsMin: 3,
    bedroomsMax: 4,
    suitesMin: 3,
    suitesMax: 4,
    parkingSpots: 3,
    bathrooms: 4,
    featured: true,
    seaView: true,
    beachfront: true,
    images: [
      {
        id: "img-1-1",
        url: svgBg("ocean", "Fachada Mar e Varandas", "Av. Silvio Carlos Viana · Ponta Verde", "#0284c7"),
        title: "Fachada Contemporânea Frente Mar",
        category: "exterior"
      },
      {
        id: "img-1-2",
        url: svgInterior("Living Panorâmico Integrado", "Acabamentos em mármore e madeira freijó"),
        title: "Living com Vista 180° para a Orla",
        category: "interior"
      },
      {
        id: "img-1-3",
        url: svgRooftopPool("Rooftop Sky Pool", "Piscina com borda infinita debruçada sobre o mar"),
        title: "Piscina Aquecida no Rooftop",
        category: "lazer"
      },
      {
        id: "img-1-4",
        url: svgPlanta("Unidade Tipo 215m²", "215 m² Privativos"),
        title: "Planta Humanizada - 4 Suítes",
        category: "planta"
      }
    ],
    description: "Concebido para quem exige o mais alto padrão de sofisticação e uma vista perene para as águas mornas e cristalinas da Ponta Verde. O Mare Nostrum combina arquitetura biofílica, pele de vidro insulado e tecnologia de ponta para proporcionar uma experiência residencial singular.",
    amenities: [
      "Piscina com borda infinita no rooftop",
      "Varanda gourmet com churrasqueira a gás instalada",
      "Adega climatizada privativa para cada unidade",
      "Espaço Fitness assinado por consultoria esportiva",
      "Lobby monumental com pé direito duplo",
      "Gerador full para 100% dos apartamentos e áreas comuns",
      "Ponto de recarga individual para veículos elétricos",
      "Portaria com reconhecimento facial e eclusa blindada"
    ],
    differentials: [
      "Pé na areia em frente às piscinas naturais da Ponta Verde",
      "Acústica com manta atenuadora entre pavimentos",
      "Fechadura biométrica e automação residencial cabeada",
      "Personalização de plantas e acabamentos com a construtora"
    ],
    coords: { lat: -9.6631, lng: -35.7025 }
  },
  {
    id: "prop-2",
    code: "JR-JT02",
    title: "Edifício Porto Bellagio",
    tagline: "Design Urbano a 100 Metros da Praia",
    bairro: "Jatiúca",
    address: "Rua Dr. Lessa de Andrade, 340 - Jatiúca, Maceió - AL",
    status: "Em Construção",
    statusProgress: 68,
    deliveryYear: "2026",
    price: 840000,
    condoFee: 780,
    iptu: 280,
    areaMin: 78,
    areaMax: 124,
    bedroomsMin: 2,
    bedroomsMax: 3,
    suitesMin: 1,
    suitesMax: 3,
    parkingSpots: 2,
    bathrooms: 3,
    featured: true,
    seaView: true,
    beachfront: false,
    images: [
      {
        id: "img-2-1",
        url: svgBg("ocean", "Torre Bellagio Jatiúca", "A 100 metros da orla e polo gastronômico", "#0d9488"),
        title: "Fachada em Linhas Retas e Brises",
        category: "exterior"
      },
      {
        id: "img-2-2",
        url: svgInterior("Varanda Gourmet Grill", "Integração total entre cozinha e terraço"),
        title: "Varanda Gourmet e Sala de Estar",
        category: "interior"
      },
      {
        id: "img-2-3",
        url: svgRooftopPool("Espaço Beach Lounge & Piscina", "Deck molhado e gazebos de relaxamento"),
        title: "Área de Lazer Completa",
        category: "lazer"
      },
      {
        id: "img-2-4",
        url: svgPlanta("Planta 3 Quartos 102m²", "102 m² Privativos"),
        title: "Planta Humanizada 3 Quartos",
        category: "planta"
      }
    ],
    description: "Localizado no coração da Jatiúca, próximo aos restaurantes mais premiados de Maceió e da famosa praia da Jatiúca. O Porto Bellagio equilibra modernidade, praticidade e alta liquidez para quem deseja morar bem ou investir em um dos bairros mais valorizados da capital alagoana.",
    amenities: [
      "Espaço Coworking equipado com cabines privativas de call",
      "Academia Reebok Fitness com vista mar",
      "Piscina adulto e infantil com deck solarium",
      "Espaço Grill com forno de pizza e churrasqueira",
      "Playground e Brinquedoteca climatizada",
      "Lavanderia compartilhada e Pet Care no térreo",
      "Bicicletário com oficina e calibrador",
      "Wi-Fi de alta velocidade em todas as áreas comuns"
    ],
    differentials: [
      "Obra avançada com entrega garantida para 2026",
      "Excelente custo-benefício por m² na Jatiúca",
      "Condomínio econômico com reaproveitamento de água pluvial",
      "A 3 minutos a pé do Massarela e Lopana"
    ],
    coords: { lat: -9.6545, lng: -35.7002 }
  },
  {
    id: "prop-3",
    code: "JR-PJ03",
    title: "Infinity Coast Residence",
    tagline: "Studios e 2 Quartos de Alta Rentabilidade",
    bairro: "Pajuçara",
    address: "Av. Doutor Antônio Gouveia, 880 - Pajuçara, Maceió - AL",
    status: "Pronto para Morar",
    deliveryYear: "Pronto",
    price: 510000,
    condoFee: 490,
    iptu: 190,
    areaMin: 38,
    areaMax: 82,
    bedroomsMin: 1,
    bedroomsMax: 2,
    suitesMin: 1,
    suitesMax: 2,
    parkingSpots: 1,
    bathrooms: 2,
    featured: true,
    seaView: true,
    beachfront: true,
    images: [
      {
        id: "img-3-1",
        url: svgBg("sunset", "Infinity Coast Frente Mar", "Em frente às Jangadas da Pajuçara", "#d97706"),
        title: "Fachada Iluminada ao Entardecer",
        category: "exterior"
      },
      {
        id: "img-3-2",
        url: svgInterior("Studio Alto Padrão Mobiliado", "Conceito aberto pronto para locação"),
        title: "Studio Design Conceito Aberto",
        category: "interior"
      },
      {
        id: "img-3-3",
        url: svgRooftopPool("Rooftop 360° Pajuçara", "Vista panorâmica das piscinas naturais"),
        title: "Piscina Suspensa com Bar Molhado",
        category: "lazer"
      },
      {
        id: "img-3-4",
        url: svgPlanta("Studio Smart 44m²", "44 m² Otimizados"),
        title: "Planta Inteligente para Investimento",
        category: "planta"
      }
    ],
    description: "Pronto para morar e faturar. O Infinity Coast é a escolha número 1 de investidores que buscam dividendos consistentes através de locação de curta temporada (Airbnb/Booking). Localizado em frente à Feirinha de Artesanato e ao ponto de partida das jangadas para as piscinas naturais da Pajuçara.",
    amenities: [
      "Rooftop Panorâmico com Bar Molhado",
      "Piscina aquecida com borda de vidro",
      "Lavanderia OMO compartilhada inteligente",
      "Restaurante bistrô no mezanino aberto ao público",
      "Recepção 24 horas estilo hotel com concierge",
      "Grab & Go (Mercadinho autônomo 24 horas)",
      "Vagas rotativas com manobrista",
      "Fechaduras eletrônicas conectadas à nuvem"
    ],
    differentials: [
      "Taxa de ocupação média de 78% ao longo do ano em Maceió",
      "Gestão de locação disponível: receba os rendimentos limpos na conta",
      "Imóvel 100% pronto e averbado em cartório",
      "Aceita financiamento bancário imediato por qualquer banco"
    ],
    coords: { lat: -9.6705, lng: -35.7142 }
  },
  {
    id: "prop-4",
    code: "JR-PV04",
    title: "Ilhas de Alagoas Sky Tower",
    tagline: "Exclusividade Máxima com 1 por Andar",
    bairro: "Ponta Verde",
    address: "Rua Durval Guimarães, 980 - Ponta Verde, Maceió - AL",
    status: "Últimas Unidades",
    deliveryYear: "2025",
    price: 1450000,
    condoFee: 1100,
    iptu: 390,
    areaMin: 162,
    areaMax: 162,
    bedroomsMin: 3,
    bedroomsMax: 3,
    suitesMin: 3,
    suitesMax: 3,
    parkingSpots: 3,
    bathrooms: 4,
    featured: false,
    seaView: true,
    beachfront: false,
    images: [
      {
        id: "img-4-1",
        url: svgBg("ocean", "Ilhas de Alagoas Sky Tower", "Rua Durval Guimarães · Ponta Verde", "#2563eb"),
        title: "Torre Residencial Exclusiva",
        category: "exterior"
      },
      {
        id: "img-4-2",
        url: svgInterior("Living 3 Ambientes", "Varanda com cortina de vidro e churrasqueira"),
        title: "Living com Porcelanato 120x120",
        category: "interior"
      },
      {
        id: "img-4-3",
        url: svgRooftopPool("Clube Privativo no Mezanino", "Piscina semiolímpica e hidromassagem"),
        title: "Área de Lazer e Relaxamento",
        category: "lazer"
      },
      {
        id: "img-4-4",
        url: svgPlanta("Planta 3 Suítes 162m²", "162 m² Privativos"),
        title: "Planta Humanizada com Hall Privativo",
        category: "planta"
      }
    ],
    description: "Apenas 14 famílias privilegiadas neste empreendimento com hall social privativo e plantas sem pilares no living. Para quem valoriza privacidade absoluta no melhor quadrilátero residencial da Ponta Verde, a duas quadras do mar.",
    amenities: [
      "Hall de elevador privativo com biometria",
      "Piscina com raia de 20 metros climatizada",
      "Espaço Gourmet Master assinado por chef",
      "Brinquedoteca com monitoramento por câmeras",
      "Gerador full automático",
      "Depósito individual privativo na garagem",
      "3 vagas de garagem soltas e cobertas",
      "Ponto de ar condicionado em todos os cômodos"
    ],
    differentials: [
      "Apenas 1 apartamento por andar",
      "Últimas 2 unidades disponíveis no prédio",
      "Dependência completa de empregada",
      "Localização silenciosa e arborizada na Ponta Verde"
    ],
    coords: { lat: -9.6612, lng: -35.7058 }
  },
  {
    id: "prop-5",
    code: "JR-GX05",
    title: "Parque das Águas Beach Resort",
    tagline: "O Primeiro Resort Residencial Pé na Areia de Guaxuma",
    bairro: "Guaxuma",
    address: "Rodovia AL-101 Norte, Km 8 - Guaxuma, Maceió - AL",
    status: "Lançamento",
    deliveryYear: "2027",
    price: 1150000,
    condoFee: 850,
    iptu: 310,
    areaMin: 110,
    areaMax: 220,
    bedroomsMin: 3,
    bedroomsMax: 4,
    suitesMin: 2,
    suitesMax: 4,
    parkingSpots: 2,
    bathrooms: 4,
    featured: true,
    seaView: true,
    beachfront: true,
    images: [
      {
        id: "img-5-1",
        url: svgBg("sunset", "Parque das Águas Guaxuma", "Praia de Guaxuma · Litoral Norte", "#059669"),
        title: "Condomínio Pé na Areia Integrado à Natureza",
        category: "exterior"
      },
      {
        id: "img-5-2",
        url: svgInterior("Garden com Piscina Privativa", "Área externa com deck e jardim tropical"),
        title: "Apartamento Garden Integrado",
        category: "interior"
      },
      {
        id: "img-5-3",
        url: svgRooftopPool("Parque Aquático Resort", "Complexo de piscinas com toboágua e bar"),
        title: "Complexo Aquático com 1.200m² de Lâmina d'Água",
        category: "lazer"
      },
      {
        id: "img-5-4",
        url: svgPlanta("Garden 3 Suítes 180m²", "180 m² com Deck Privativo"),
        title: "Planta Garden com Piscina Exclusiva",
        category: "planta"
      }
    ],
    description: "Um oásis particular no litoral norte de Maceió. O Parque das Águas traz o conceito de resort residencial com mais de 30 itens de lazer e esportes, praia preservada sem aglomerações e segurança máxima para você e seus filhos.",
    amenities: [
      "Acesso direto e exclusivo à areia da praia de Guaxuma",
      "4 quadras de Beach Tennis com iluminação de LED",
      "Complexo aquático com piscinas tropicais e toboágua",
      "Restaurante pé na areia para uso exclusivo dos moradores",
      "Academia com vista mar e pista de cooper interna",
      "Guarita blindada com monitoramento perimetral 24h",
      "Stand Up Paddle e caiaques disponíveis para uso coletivo",
      "Cinema privativo e espaço teens com jogos eletrônicos"
    ],
    differentials: [
      "Praia com mar azul turquesa sem trânsito de veículos",
      "Alta valorização com as obras de duplicação da AL-101 Norte",
      "Opções com piscina privativa nos apartamentos garden",
      "Financiamento facilitado com parcelamento de entrada"
    ],
    coords: { lat: -9.6023, lng: -35.6710 }
  },
  {
    id: "prop-6",
    code: "JR-FR06",
    title: "Mirante do Farol Privilege",
    tagline: "Tradição, Vista Panorâmica e Espaço Familiar",
    bairro: "Farol",
    address: "Rua Aristeu de Andrade, 550 - Farol, Maceió - AL",
    status: "Pronto para Morar",
    deliveryYear: "Pronto",
    price: 690000,
    condoFee: 590,
    iptu: 210,
    areaMin: 92,
    areaMax: 118,
    bedroomsMin: 3,
    bedroomsMax: 3,
    suitesMin: 2,
    suitesMax: 2,
    parkingSpots: 2,
    bathrooms: 3,
    featured: false,
    seaView: true,
    beachfront: false,
    images: [
      {
        id: "img-6-1",
        url: svgBg("ocean", "Mirante do Farol Privilege", "Vista panorâmica da cidade e do mar", "#7c3aed"),
        title: "Fachada Tradicional e Elegante",
        category: "exterior"
      },
      {
        id: "img-6-2",
        url: svgInterior("Sala de Jantar e Estar com Vista Alta", "Ventilação natural constante do Farol"),
        title: "Sala com Vista Alta para a Cidade",
        category: "interior"
      },
      {
        id: "img-6-3",
        url: svgRooftopPool("Piscina com Vista Panorâmica", "Deck com vista para a Lagoa Mundaú"),
        title: "Piscina com Vista Panorâmica",
        category: "lazer"
      },
      {
        id: "img-6-4",
        url: svgPlanta("Planta 3 Quartos 118m²", "118 m² Privativos"),
        title: "Planta Tradicional Espaçosa",
        category: "planta"
      }
    ],
    description: "Situado no ponto mais alto e tradicional de Maceió, o Mirante do Farol combina clima fresco, vista espetacular para a orla e para as lagoas, além de facilidade de acesso aos melhores colégios, hospitais e clínicas da capital.",
    amenities: [
      "Piscina com vista panorâmica da cidade",
      "Salão de festas climatizado para 120 pessoas",
      "Quadra poliesportiva oficial",
      "Churrasqueira gourmet coberta",
      "Playground infantil arborizado",
      "Guarita 24 horas e circuito de segurança CFTV",
      "Gerador para áreas comuns e elevadores"
    ],
    differentials: [
      "Pronto para morar com documentação 100% regularizada",
      "Ventilação constante e clima ameno do bairro do Farol",
      "Condomínio com a melhor relação custo-benefício de Maceió",
      "Financiamento imediato com aprovação em 24h pelo João Raimundo"
    ],
    coords: { lat: -9.6582, lng: -35.7350 }
  }
];

export const NEIGHBORHOODS: NeighborhoodInfo[] = [
  {
    name: "Ponta Verde",
    slug: "ponta-verde",
    headline: "O metro quadrado mais nobre e desejado de Maceió",
    description: "Com o famoso Farol da Ponta Verde, piscinas naturais de águas cristalinas, orla gastronômica com os quiosques Kanoa e Lopana, ciclovias e praças arborizadas. O bairro preferido para morar com conforto e alta valorização.",
    highlights: ["Farol da Ponta Verde", "Piscinas Naturais", "Quiosques Kanoa e Lopana", "Ciclovia e Caminhada"],
    avgPricePerSqm: "R$ 10.500 / m²",
    propertyCount: 24,
    coverGradient: "from-sky-700 via-teal-700 to-cyan-900"
  },
  {
    name: "Jatiúca",
    slug: "jatiuca",
    headline: "O polo gastronômico, cultural e de lazer da capital",
    description: "Famosa pela praia de mar aberto para esportes, vida noturna sofisticada e ampla oferta de bistrôs, cafeterias e academias premium. Perfeita para quem busca dinamismo sem abrir mão de viver a passos do mar.",
    highlights: ["Polo Gastronômico da Av. Amélia Rosa", "Mar de Ondas Suaves", "Comércio e Serviços Premium", "Fácil Acesso ao Shopping"],
    avgPricePerSqm: "R$ 9.800 / m²",
    propertyCount: 19,
    coverGradient: "from-teal-800 via-cyan-800 to-blue-900"
  },
  {
    name: "Pajuçara",
    slug: "pajucara",
    headline: "Mar calmo, jangadas tradicionais e altíssima demanda turística",
    description: "O cartão-postal histórico de Maceió. Suas águas calmas e mornas acolhem famílias e turistas do mundo todo. É o endereço com a maior rentabilidade em aluguel por temporada e novos empreendimentos estilo studio e resort.",
    highlights: ["Passeio de Jangada às Piscinas", "Feirinha de Artesanato", "Mar tipo lagoa sem ondas", "Líder em Rentabilidade Airbnb"],
    avgPricePerSqm: "R$ 9.200 / m²",
    propertyCount: 15,
    coverGradient: "from-blue-800 via-indigo-800 to-slate-900"
  },
  {
    name: "Guaxuma & Litoral Norte",
    slug: "guaxuma",
    headline: "O novo vetor de expansão de luxo pé na areia",
    description: "A poucos minutos do centro urbano, Guaxuma e a Rota Ecológica oferecem a experiência de praia paradisíaca virgem com condomínios fechados horizontais e resorts residenciais com segurança reforçada.",
    highlights: ["Praia Paradisíaca Pé na Areia", "Condomínios Fechados de Alto Padrão", "Duplicação da Rodovia AL-101", "Tranquilidade e Natureza"],
    avgPricePerSqm: "R$ 8.600 / m²",
    propertyCount: 11,
    coverGradient: "from-emerald-800 via-teal-800 to-blue-950"
  }
];

export const TESTIMONIALS = [
  {
    name: "Dr. Marcelo Cavalcante",
    role: "Médico Cardiologista",
    location: "Maceió - AL",
    property: "Comprador do Residencial Mare Nostrum",
    comment: "O João Raimundo foi cirúrgico na consultoria. Queria um apartamento frente mar na Ponta Verde com planta ampla para minha família. Ele conseguiu uma negociação direta excelente com a construtora e cuidou de toda a burocracia do financiamento bancário.",
    rating: 5,
    date: "Fevereiro de 2026"
  },
  {
    name: "Renata & Gustavo Albuquerque",
    role: "Empresários de São Paulo",
    location: "São Paulo - SP",
    property: "Investidores do Infinity Coast Pajuçara",
    comment: "Moramos em SP e decidimos diversificar investimentos comprando 2 studios em Maceió. O João nos apresentou todo o estudo de viabilidade de locação por temporada. Em menos de 30 dias após a entrega já estávamos operando com mais de 80% de taxa de ocupação.",
    rating: 5,
    date: "Janeiro de 2026"
  },
  {
    name: "Fernanda Silveira",
    role: "Advogada",
    location: "Maceió - AL",
    property: "Compradora no Edifício Porto Bellagio",
    comment: "Atendimento impecável e transparente. O João Raimundo conhece cada palmo da orla de Maceió e soube indicar o empreendimento certo na Jatiúca que encaixava com o momento da minha família. Recomendo de olhos fechados!",
    rating: 5,
    date: "Novembro de 2025"
  }
];

export const MID_BANNER_PROMOS = [
  {
    id: "promo-1",
    tag: "CONDIÇÃO ESPECIAL DIRETO COM CONSTRUTORA",
    title: "Entrada Facilitada e Parcelamento em até 60 Meses",
    description: "Compre seu imóvel na planta em Maceió sem burocracia bancária durante a fase de obra. Assessoria gratuita na negociação.",
    cta: "Consultar Obras Disponíveis",
    action: "filter_lancamentos"
  },
  {
    id: "promo-2",
    tag: "ASSESSORIA DE FINANCIAMENTO IMOBILIÁRIO",
    title: "Aprovação de Crédito Rápida em até 24 Horas",
    description: "Parceria com Caixa Econômica, Itaú, Santander e Bradesco. Encontramos a menor taxa de juros do mercado para o seu perfil.",
    cta: "Fazer Simulação com João",
    action: "open_simulator"
  },
  {
    id: "promo-3",
    tag: "CONSULTORIA PARA INVESTIDORES",
    title: "Maceió: A Cidade Líder em Valorização Imobiliária do Brasil",
    description: "Rentabilidade consistente em locação por temporada de frente para as piscinas naturais. Receba estudo completo de rentabilidade.",
    cta: "Falar com João no WhatsApp",
    action: "open_whatsapp"
  }
];
