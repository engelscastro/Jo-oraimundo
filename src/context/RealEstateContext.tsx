import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { 
  Property, 
  BannerSlide, 
  PROPERTIES as INITIAL_PROPERTIES, 
  BANNER_SLIDES as INITIAL_BANNERS, 
  BROKER_INFO as INITIAL_BROKER,
  MID_BANNER_PROMOS as INITIAL_PROMOS
} from '../data/properties';
import { 
  fetchSharedCatalog, 
  saveSharedCatalog, 
  migrateLocalImagesToVercel,
  SharedCatalogData 
} from '../services/siteDataService';
import { checkVercelBlobStatus, getVercelBlobToken } from '../services/vercelBlobService';
import { fetchPublishedCatalog, saveGitHubConfig } from '../services/githubService';
import { fetchCatalogFromSupabase, saveCatalogToSupabase } from '../services/supabaseService';

export type BrokerInfoType = typeof INITIAL_BROKER;
export type PromoBannerType = typeof INITIAL_PROMOS[0];

export interface CloudSyncState {
  isConfigured: boolean;
  isSyncing: boolean;
  isCloudLoaded: boolean;
  lastSyncedAt: string | null;
  error: string | null;
}

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

  // Cloud & Cross-Device Sync actions
  cloudSync: CloudSyncState;
  syncToCloud: () => Promise<boolean>;
  loadFromCloud: () => Promise<boolean>;
  migratePendingImages: (
    onProgress?: (current: number, total: number, message: string) => void
  ) => Promise<{ migratedCount: number }>;

  // Reset & Backup actions
  resetToDefaults: () => void;
  exportJSON: () => string;
  importJSON: (jsonStr: string) => boolean;
}

const STORAGE_KEYS = {
  PROPERTIES: 'jr_realestate_properties_v1',
  BANNERS: 'jr_realestate_banners_v1',
  BROKER: 'jr_realestate_broker_v1',
  PROMOS: 'jr_realestate_promos_v1',
  LAST_CLOUD_SYNC: 'jr_realestate_last_sync_v1'
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
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.creci === '8472-AL' ||
          parsed.creci === '8472' ||
          parsed.phoneFormatted === '(82) 99988-7766' ||
          parsed.whatsappNumber === '5582999887766'
        ) {
          const updated = {
            ...parsed,
            creci: INITIAL_BROKER.creci,
            phone: INITIAL_BROKER.phone,
            phoneFormatted: INITIAL_BROKER.phoneFormatted,
            whatsappNumber: INITIAL_BROKER.whatsappNumber
          };
          try {
            localStorage.setItem(STORAGE_KEYS.BROKER, JSON.stringify(updated));
          } catch {
            // ignore
          }
          return updated;
        }
        return parsed;
      }
      return INITIAL_BROKER;
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

  const [cloudSync, setCloudSync] = useState<CloudSyncState>(() => {
    let savedTime: string | null = null;
    try {
      savedTime = localStorage.getItem(STORAGE_KEYS.LAST_CLOUD_SYNC);
    } catch {
      // ignore
    }
    return {
      isConfigured: false,
      isSyncing: false,
      isCloudLoaded: false,
      lastSyncedAt: savedTime,
      error: null
    };
  });

  // Track if initial load from cloud has occurred
  const hasLoadedFromCloudRef = useRef(false);
  const autoSyncTimeoutRef = useRef<any>(null);

  // Function to load shared catalog from Supabase / GitHub / Vercel Cloud
  const loadFromCloud = useCallback(async (): Promise<boolean> => {
    try {
      setCloudSync(prev => ({ ...prev, isSyncing: true, error: null }));

      // 0. Tenta carregar do Supabase primeiro (banco de dados relacional principal)
      const sbData = await fetchCatalogFromSupabase();
      if (sbData && Array.isArray(sbData.properties) && sbData.properties.length > 0) {
        setProperties(sbData.properties);
        if (Array.isArray(sbData.banners) && sbData.banners.length > 0) {
          setBanners(sbData.banners);
        }
        if (sbData.brokerInfo) {
          setBrokerInfo(sbData.brokerInfo);
        }
        if (Array.isArray(sbData.promos) && sbData.promos.length > 0) {
          setPromos(sbData.promos);
        }

        const syncTime = sbData.updatedAt || new Date().toISOString();
        try {
          localStorage.setItem(STORAGE_KEYS.LAST_CLOUD_SYNC, syncTime);
          localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(sbData.properties));
          if (sbData.banners) localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(sbData.banners));
          if (sbData.brokerInfo) localStorage.setItem(STORAGE_KEYS.BROKER, JSON.stringify(sbData.brokerInfo));
        } catch {
          // ignore
        }

        setCloudSync(prev => ({
          ...prev,
          isSyncing: false,
          isCloudLoaded: true,
          isConfigured: true,
          lastSyncedAt: syncTime,
          error: null
        }));
        return true;
      }

      // 1. Tenta buscar o catálogo publicado no GitHub / Vercel public/catalog.json
      const published = await fetchPublishedCatalog();
      if (published) {
        if (published.githubConfig?.repo && published.githubConfig?.token) {
          saveGitHubConfig(
            published.githubConfig.repo,
            published.githubConfig.token,
            published.githubConfig.branch || 'main'
          );
        }

        if (Array.isArray(published.properties) && published.properties.length > 0) {
          setProperties(published.properties);
        }
        if (Array.isArray(published.banners) && published.banners.length > 0) {
          setBanners(published.banners);
        }
        if (published.brokerInfo) {
          setBrokerInfo(published.brokerInfo);
        }
        if (Array.isArray(published.promos) && published.promos.length > 0) {
          setPromos(published.promos);
        }

        const syncTime = published.updatedAt || new Date().toISOString();
        try {
          localStorage.setItem(STORAGE_KEYS.LAST_CLOUD_SYNC, syncTime);
        } catch {
          // ignore
        }

        setCloudSync(prev => ({
          ...prev,
          isSyncing: false,
          isCloudLoaded: true,
          isConfigured: true,
          lastSyncedAt: syncTime,
          error: null
        }));
        return true;
      }

      // 2. Fallback para Vercel Blob se configurado
      const status = await checkVercelBlobStatus();
      setCloudSync(prev => ({ ...prev, isConfigured: status.configured }));

      const result = await fetchSharedCatalog();
      if (result.success && result.found && result.data) {
        if (Array.isArray(result.data.properties) && result.data.properties.length > 0) {
          setProperties(result.data.properties);
        }
        if (Array.isArray(result.data.banners) && result.data.banners.length > 0) {
          setBanners(result.data.banners);
        }
        if (result.data.brokerInfo) {
          setBrokerInfo(result.data.brokerInfo);
        }
        if (Array.isArray(result.data.promos) && result.data.promos.length > 0) {
          setPromos(result.data.promos);
        }

        const syncTime = result.updatedAt || new Date().toISOString();
        try {
          localStorage.setItem(STORAGE_KEYS.LAST_CLOUD_SYNC, syncTime);
        } catch {
          // ignore
        }

        setCloudSync(prev => ({
          ...prev,
          isSyncing: false,
          isCloudLoaded: true,
          isConfigured: true,
          lastSyncedAt: syncTime,
          error: null
        }));
        return true;
      } else {
        setCloudSync(prev => ({
          ...prev,
          isSyncing: false,
          isCloudLoaded: true,
          isConfigured: result.configured,
          error: result.error || null
        }));
        return false;
      }
    } catch (err: any) {
      setCloudSync(prev => ({
        ...prev,
        isSyncing: false,
        isCloudLoaded: true,
        error: err.message || 'Erro ao carregar dados da nuvem'
      }));
      return false;
    }
  }, [banners, brokerInfo, promos]);

  // Sync current data to Supabase and Vercel Cloud
  const syncToCloud = useCallback(async (): Promise<boolean> => {
    try {
      setCloudSync(prev => ({ ...prev, isSyncing: true, error: null }));
      
      const payload: SharedCatalogData = {
        updatedAt: new Date().toISOString(),
        properties,
        banners,
        brokerInfo,
        promos
      };

      // 1. Salva no Supabase primeiro
      const sbRes = await saveCatalogToSupabase(payload);
      if (sbRes.success) {
        const syncTime: string = payload.updatedAt || new Date().toISOString();
        try {
          localStorage.setItem(STORAGE_KEYS.LAST_CLOUD_SYNC, syncTime);
        } catch {
          // ignore
        }
        setCloudSync(prev => ({
          ...prev,
          isSyncing: false,
          isConfigured: true,
          lastSyncedAt: syncTime,
          error: null
        }));
        return true;
      }

      // 2. Fallback para Vercel Blob
      const result = await saveSharedCatalog(payload);
      if (result.success) {
        const syncTime = result.uploadedAt || new Date().toISOString();
        try {
          localStorage.setItem(STORAGE_KEYS.LAST_CLOUD_SYNC, syncTime);
        } catch {
          // ignore
        }
        setCloudSync(prev => ({
          ...prev,
          isSyncing: false,
          isConfigured: true,
          lastSyncedAt: syncTime,
          error: null
        }));
        return true;
      } else {
        setCloudSync(prev => ({
          ...prev,
          isSyncing: false,
          error: result.error || 'Falha ao sincronizar com Supabase / Vercel'
        }));
        return false;
      }
    } catch (err: any) {
      setCloudSync(prev => ({
        ...prev,
        isSyncing: false,
        error: err.message || 'Erro de conexão ao salvar na nuvem'
      }));
      return false;
    }
  }, [properties, banners, brokerInfo, promos]);

  // Migrate local base64 images to Vercel Blob
  const migratePendingImages = useCallback(async (
    onProgress?: (current: number, total: number, message: string) => void
  ): Promise<{ migratedCount: number }> => {
    setCloudSync(prev => ({ ...prev, isSyncing: true }));
    try {
      const res = await migrateLocalImagesToVercel(properties, banners, onProgress);
      if (res.migratedCount > 0) {
        setProperties(res.properties);
        setBanners(res.banners);
        
        // Save immediately to cloud
        await saveCatalogToSupabase({
          updatedAt: new Date().toISOString(),
          properties: res.properties,
          banners: res.banners,
          brokerInfo,
          promos
        });

        const syncTime = new Date().toISOString();
        try {
          localStorage.setItem(STORAGE_KEYS.LAST_CLOUD_SYNC, syncTime);
        } catch {
          // ignore
        }

        setCloudSync(prev => ({
          ...prev,
          isSyncing: false,
          isConfigured: true,
          lastSyncedAt: syncTime,
          error: null
        }));
      } else {
        setCloudSync(prev => ({ ...prev, isSyncing: false }));
      }
      return { migratedCount: res.migratedCount };
    } catch (err: any) {
      setCloudSync(prev => ({
        ...prev,
        isSyncing: false,
        error: err.message || 'Erro durante migração de imagens'
      }));
      return { migratedCount: 0 };
    }
  }, [properties, banners, brokerInfo, promos]);

  // Initial load from cloud on mount
  useEffect(() => {
    if (!hasLoadedFromCloudRef.current) {
      hasLoadedFromCloudRef.current = true;
      loadFromCloud();
    }
  }, [loadFromCloud]);

  // Save to localStorage cache whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
    } catch (e) {
      console.warn('Could not save properties to localStorage', e);
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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROMOS, JSON.stringify(promos));
    } catch (e) {
      console.warn('Could not save promos to localStorage', e);
    }
  }, [promos]);

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
    setProperties(INITIAL_PROPERTIES);
    setBanners(INITIAL_BANNERS);
    setBrokerInfo(INITIAL_BROKER);
    setPromos(INITIAL_PROMOS);
    try {
      localStorage.removeItem(STORAGE_KEYS.PROPERTIES);
      localStorage.removeItem(STORAGE_KEYS.BANNERS);
      localStorage.removeItem(STORAGE_KEYS.BROKER);
      localStorage.removeItem(STORAGE_KEYS.PROMOS);
    } catch {
      // ignore
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
        cloudSync,
        syncToCloud,
        loadFromCloud,
        migratePendingImages,
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
