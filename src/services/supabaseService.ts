/**
 * Serviço de Integração com Supabase
 * Permite persistir imóveis, banners e perfil do corretor no banco de dados do Supabase
 */
import { createClient } from '@supabase/supabase-js';

const STORAGE_KEY_SB_URL = 'JR_SUPABASE_URL';
const STORAGE_KEY_SB_KEY = 'JR_SUPABASE_KEY';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig {
  let url = '';
  let anonKey = '';
  try {
    url = localStorage.getItem(STORAGE_KEY_SB_URL) || '';
    anonKey = localStorage.getItem(STORAGE_KEY_SB_KEY) || '';
  } catch {
    // ignore
  }

  const defaultUrl = 'https://jswtlwpzmcfewtdbimyp.supabase.co';
  const defaultKey = 'sb_publishable_4sq4wlVOd8YPYthNRNPAXw_zPa97muK';

  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || defaultUrl;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || defaultKey;

  return {
    url: url.trim() || envUrl,
    anonKey: anonKey.trim() || envKey,
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_SB_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_SB_KEY, anonKey.trim());
  } catch (err) {
    console.error('Erro ao salvar config do Supabase:', err);
  }
}

export function removeSupabaseConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_SB_URL);
    localStorage.removeItem(STORAGE_KEY_SB_KEY);
  } catch {
    // ignore
  }
}

export function getSupabaseClient() {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) return null;
  try {
    return createClient(config.url, config.anonKey);
  } catch (err) {
    console.error('Erro ao inicializar cliente Supabase:', err);
    return null;
  }
}

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'URL ou Chave Anônima do Supabase não configuradas.' };
  }

  try {
    const { data, error } = await client.from('site_catalog').select('id').limit(1);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return {
          success: true,
          message: 'Conectado ao Supabase! (Dica: crie a tabela "site_catalog" no SQL Editor do Supabase para persistir os dados).'
        };
      }
      return { success: false, message: `Erro do Supabase: ${error.message}` };
    }
    return { success: true, message: 'Conexão com o Supabase estabelecida com sucesso!' };
  } catch (err: any) {
    return { success: false, message: `Falha de rede ao conectar com Supabase: ${err.message}` };
  }
}

export async function saveCatalogToSupabase(payload: any): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase não configurado' };

  try {
    const { error } = await client
      .from('site_catalog')
      .upsert({ id: 1, data: payload, updated_at: new Date().toISOString() });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchCatalogFromSupabase(): Promise<any | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('site_catalog')
      .select('data')
      .eq('id', 1)
      .maybeSingle();

    if (error || !data) return null;
    return data.data;
  } catch {
    return null;
  }
}

/**
 * Converte arquivo para Base64 puro / DataURL para armazenamento direto no Supabase
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}

/**
 * Faz upload de imagem para o Supabase Storage (bucket "imoveis-fotos")
 * com fallback para DataURL direto no banco caso o bucket não exista
 */
export async function uploadImageToSupabase(file: File, filename?: string): Promise<{ success: boolean; url: string }> {
  const client = getSupabaseClient();
  const cleanName = `${Date.now()}-${(filename || file.name).toLowerCase().replace(/[^a-z0-9.-]/g, '_')}`;

  if (client) {
    try {
      const { data, error } = await client.storage
        .from('imoveis-fotos')
        .upload(cleanName, file, { cacheControl: '3600', upsert: true });

      if (!error && data) {
        const { data: publicUrlData } = client.storage
          .from('imoveis-fotos')
          .getPublicUrl(cleanName);

        if (publicUrlData?.publicUrl) {
          return { success: true, url: publicUrlData.publicUrl };
        }
      }
    } catch {
      // Fallback para DataURL caso o bucket de storage não tenha sido criado
    }
  }

  // Fallback: Converte em Base64 DataURL (salvo diretamente dentro do JSON do banco no Supabase)
  const dataUrl = await fileToDataUrl(file);
  return { success: true, url: dataUrl };
}
