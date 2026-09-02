import { useEffect, useState } from 'react';
import { supabase } from './supabase';

// ---- Types matching database schema ----

export interface Farmer {
  id: string;
  name: string;
  crop: string;
  quantity_quintals: number;
  phone: string | null;
}

export interface ProcurementCenter {
  id: string;
  name: string;
  district: string;
  crowd: 'low' | 'moderate' | 'high';
  farmers_waiting: number;
  avg_wait_min: number;
  capacity_pct: number;
  best_choice: boolean;
  map_x: number;
  map_y: number;
}

export interface Token {
  id: string;
  token_number: string;
  farmer_name: string;
  crop: string;
  quantity_quintals: number;
  center_name: string;
  appointment_date: string;
  appointment_time: string;
  queue_position: number;
  status: string;
}

export interface QueueEntry {
  id: string;
  token_number: string;
  center_id: string;
  status: 'processing' | 'waiting';
  is_you: boolean;
  position: number;
}

export interface NotificationItem {
  id: string;
  type: 'reminder' | 'queue' | 'produce' | 'payment';
  title: string;
  body: string;
  display_time: string;
}

export interface Payment {
  id: string;
  farmer_name: string;
  amount: number;
  crop: string;
  quantity_quintals: number;
  center_name: string;
  rate_per_quintal: number;
  transaction_id: string;
  bank_last4: string;
  status: string;
  timeline_step: number;
}

export interface PlatformStats {
  farmers_connected: number;
  procurement_centers: number;
  quintals_procured: number;
  payments_processed_cr: number;
}

export interface CenterStats {
  farmers_today: number;
  tokens: number;
  waiting: number;
  completed: number;
  quintals: number;
  payments_lakh: number;
  capacity_pct: number;
}

export interface SmartAlert {
  id: string;
  severity: string;
  title: string;
  body: string;
  recommendation: string;
  center_name: string;
  redirect_count: number;
  redirect_center: string;
}

export interface CropDist {
  crop: string;
  pct: number;
  color: string;
}

export interface WeekVolume {
  day: string;
  volume: number;
  wait_min: number;
}

export interface SatisfactionRating {
  label: string;
  pct: number;
  total_ratings: number;
  average_rating: number;
}

export interface AIRecommendation {
  selected_slot: string;
  selected_wait_min: number;
  recommended_slot: string;
  recommended_wait_min: number;
  time_saved_min: number;
  farmer_name: string;
  center_name: string;
}

export interface MSPPrice {
  id: string;
  crop: string;
  variety: string;
  msp_per_quintal: number;
  market_price_per_quintal: number | null;
  unit: string;
  season: string;
  change_pct: number;
  is_active: boolean;
}

// ---- Generic hook ----

function useQuery<T>(fetcher: () => Promise<{ data: T | null; error: { message: string } | null }>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await fetcher();
        if (!active) return;
        if (error) setError(error.message);
        else setData(data as T);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading, error };
}

// ---- Specific hooks ----

export function useFarmer() {
  return useQuery<Farmer>(async () => {
    const { data, error } = await supabase
      .from('farmers')
      .select('*')
      .limit(1)
      .maybeSingle();
    return { data, error };
  });
}

export function useCenters() {
  return useQuery<ProcurementCenter[]>(async () => {
    const { data, error } = await supabase
      .from('procurement_centers')
      .select('*')
      .order('name');
    return { data, error };
  });
}

export function useToken() {
  return useQuery<Token>(async () => {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .limit(1)
      .maybeSingle();
    return { data, error };
  });
}

export function useQueue() {
  const [data, setData] = useState<QueueEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchQueue = async () => {
      try {
        const { data, error } = await supabase
          .from('queue_entries')
          .select('*')
          .order('position');
        if (!active) return;
        if (error) setError(error.message);
        else setData(data as QueueEntry[]);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchQueue();

    const channel = supabase
      .channel('queue_entries_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'queue_entries' },
        () => {
          fetchQueue();
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { data, loading, error };
}

export function useNotifications() {
  return useQuery<NotificationItem[]>(async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at');
    return { data, error };
  });
}

export function usePayment() {
  return useQuery<Payment>(async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .limit(1)
      .maybeSingle();
    return { data, error };
  });
}

export function usePlatformStats() {
  return useQuery<PlatformStats>(async () => {
    const { data, error } = await supabase
      .from('platform_stats')
      .select('*')
      .eq('id', 'main')
      .maybeSingle();
    return { data, error };
  });
}

export function useCenterStats() {
  return useQuery<CenterStats>(async () => {
    const { data, error } = await supabase
      .from('center_stats')
      .select('*')
      .eq('id', 'main')
      .maybeSingle();
    return { data, error };
  });
}

export function useSmartAlerts() {
  return useQuery<SmartAlert[]>(async () => {
    const { data, error } = await supabase
      .from('smart_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    return { data, error };
  });
}

export function useCropDist() {
  return useQuery<CropDist[]>(async () => {
    const { data, error } = await supabase
      .from('crop_distribution')
      .select('*')
      .order('pct', { ascending: false });
    return { data, error };
  });
}

export function useWeekVolume() {
  return useQuery<WeekVolume[]>(async () => {
    const { data, error } = await supabase
      .from('week_volume')
      .select('*')
      .order('volume');
    return { data, error };
  });
}

export function useSatisfaction() {
  return useQuery<SatisfactionRating[]>(async () => {
    const { data, error } = await supabase
      .from('satisfaction_ratings')
      .select('*')
      .order('pct', { ascending: false });
    return { data, error };
  });
}

export function useAIRecommendation() {
  return useQuery<AIRecommendation>(async () => {
    const { data, error } = await supabase
      .from('ai_recommendations')
      .select('*')
      .limit(1)
      .maybeSingle();
    return { data, error };
  });
}

export function useMSPPrices() {
  const [data, setData] = useState<MSPPrice[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        // 1. Fetch from Supabase live database table
        const { data: dbPrices, error: dbErr } = await supabase
          .from('msp_prices')
          .select('*')
          .eq('is_active', true)
          .order('msp_per_quintal', { ascending: false });

        if (!active) return;

        if (dbPrices && dbPrices.length > 0) {
          setData(dbPrices as MSPPrice[]);
        }

        // 2. Fetch live daily market prices from public Open Data feed
        try {
          const publicApiKey = '579b464db66ec23bdd000001cdd3946f44ce43727582b64b7396659c';
          const apiUrl = `https://api.data.gov.in/resource/9ef0be35-87f5-45a0-a0a3-ac4d6085a563?api-key=${publicApiKey}&format=json&limit=30`;
          
          const res = await fetch(apiUrl);
          if (res.ok) {
            const json = await res.json();
            if (json.records && json.records.length > 0 && active) {
              const liveMap: Record<string, number> = {};
              json.records.forEach((r: { commodity?: string; modal_price?: number | string }) => {
                if (r.commodity && r.modal_price) {
                  const cropKey = r.commodity.toLowerCase();
                  liveMap[cropKey] = Number(r.modal_price);
                }
              });

              setData((prev) => {
                if (!prev) return prev;
                return prev.map((p) => {
                  const matchedKey = Object.keys(liveMap).find((k) => k.includes(p.crop.toLowerCase()));
                  if (matchedKey && liveMap[matchedKey]) {
                    return { ...p, market_price_per_quintal: liveMap[matchedKey] };
                  }
                  return p;
                });
              });
            }
          }
        } catch {
          // Soft fail for network/CORS restrictions — keeps DB prices intact
        }

        if (dbErr && !dbPrices) setError(dbErr.message);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return { data, loading, error };
}

