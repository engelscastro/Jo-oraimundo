import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Property, 
  BannerSlide, 
  PROPERTIES as INITIAL_PROPERTIES, 
  BANNER_SLIDES as INITIAL_BANNERS, 
  BROKER_INFO as INITIAL_BROKER,
  MID_BANNER_PROMOS as INITIAL_PROMOS
} from '../data/properties';

export type BrokerInfoType = typeof INITIAL_BROKER;
export type PromoBannerType = typeof INITIAL_PROMOS[0];

interface RealEstateContextType {
  properties: Property[];
  banners: BannerSlide[];
  brokerInfo: BrokerInfoType;
  promos: PromoBannerType[];
  
  // Banner actions
  updateBanner: (updated: BannerSlide) => void;
  addBanner: (banner: BannerSlide) => void;
  deleteBanner: (id: string) => void;

  // Property actions
  updateProperty: (updated: Property) => void;
  addProperty: (property: Property) => void;
  deleteProperty: (id: string) => void;

  // Broker actions
  updateBroker: (updated: Partial<BrokerInfoType>) => void;

  // Reset & Backup actions
  resetToDefaults: () => void;
  exportJSON: () => string;
  importJSON: (jsonStr: string) => boolean;
}

const STORAGE_KEYS = {
  PROPERTIES: 'jr_realestate_properties_v1',
  BANNERS: 'jr_realestate_banners_v1',
  BROKER: 'jr_realestate_broker_v1',
  PROMOS: 'jr_realestate_promos_v1'
};

const RealEstateContext = createContext<RealEstateContextType | undefined>(undefined);

export const RealEstateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
      return saved ? JSON.parse(saved) : INITIAL_PROPERTIES;
    } catch {
      return INITIAL_PROPERTIES;
    }
  });

  const [banners, setBanners] = useState<BannerSlide[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BANNERS);
      return saved ? JSON.parse(saved) : INITIAL_BANNERS;
    } catch {
      return INITIAL_BANNERS;
    }
  });

  const [brokerInfo, setBrokerInfo] = useState<BrokerInfoType>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BROKER);
      return saved ? JSON.parse(saved) : INITIAL_BROKER;
    } catch {
      return INITIAL_BROKER;
    }
  });

  const [promos, setPromos] = useState<PromoBannerType[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROMOS);
      return saved ? JSON.parse(saved) : INITIAL_PROMOS;
    } catch {
      return INITIAL_PROMOS;
    }
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
    } catch (e) {
      console.warn('Could not save properties to localStorage (quota exceeded?)', e);
    }
  }, [properties]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
    } catch (e) {
      console.warn('Could not save banners to localStorage', e);
    }
  }, [banners]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BROKER, JSON.stringify(brokerInfo));
    } catch (e) {
      console.warn('Could not save broker info to localStorage', e);
    }
  }, [brokerInfo]);

  // Actions
  const updateBanner = (updated: BannerSlide) => {
    setBanners((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  const addBanner = (banner: BannerSlide) => {
    setBanners((prev) => [...prev, banner]);
  };

  const deleteBanner = (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
  };

  const updateProperty = (updated: Property) => {
    setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const addProperty = (newProp: Property) => {
    setProperties((prev) => [newProp, ...prev]);
  };

  const deleteProperty = (id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
  };

  const updateBroker = (updated: Partial<BrokerInfoType>) => {
    setBrokerInfo((prev) => ({ ...prev, ...updated }));
  };

  const resetToDefaults = () => {
    if (window.confirm('Tem certeza que deseja restaurar os dados originais? Todas as alterações manuais serão resetadas.')) {
      setProperties(INITIAL_PROPERTIES);
      setBanners(INITIAL_BANNERS);
      setBrokerInfo(INITIAL_BROKER);
      setPromos(INITIAL_PROMOS);
      localStorage.removeItem(STORAGE_KEYS.PROPERTIES);
      localStorage.removeItem(STORAGE_KEYS.BANNERS);
      localStorage.removeItem(STORAGE_KEYS.BROKER);
      localStorage.removeItem(STORAGE_KEYS.PROMOS);
    }
  };

  const exportJSON = () => {
    return JSON.stringify({
      properties,
      banners,
      brokerInfo,
      promos
    }, null, 2);
  };

  const importJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.properties) setProperties(parsed.properties);
      if (parsed.banners) setBanners(parsed.banners);
      if (parsed.brokerInfo) setBrokerInfo(parsed.brokerInfo);
      if (parsed.promos) setPromos(parsed.promos);
      return true;
    } catch (err) {
      console.error('Falha ao importar dados JSON', err);
      return false;
    }
  };

  return (
    <RealEstateContext.Provider
      value={{
        properties,
        banners,
        brokerInfo,
        promos,
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
      }}
    >
      {children}
    </RealEstateContext.Provider>
  );
};

export const useRealEstate = () => {
  const context = useContext(RealEstateContext);
  if (!context) {
    throw new Error('useRealEstate must be used within a RealEstateProvider');
  }
  return context;
};
