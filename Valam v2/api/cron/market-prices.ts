import { createClient } from '@supabase/supabase-js';

type Request = { headers: Record<string, string | string[] | undefined> };
type Response = { status: (code: number) => Response; json: (body: unknown) => void; setHeader: (name: string, value: string) => void };
type AgmarknetRecord = Record<string, string | number | null | undefined>;

const RESOURCE_ID = '35985678-0d79-46b4-9ed6-6f13308a1d24';
const API_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}`;
const PAUSE_BETWEEN_REQUESTS_MS = 750;

const value = (record: AgmarknetRecord, ...keys: string[]) => {
  for (const key of keys) if (record[key] !== undefined && record[key] !== null) return String(record[key]).trim();
  return '';
};
const numberValue = (record: AgmarknetRecord, ...keys: string[]) => {
  const parsed = Number(value(record, ...keys).replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
};
const normalizeArrivalDate = (raw: string) => {
  const parts = raw.trim().split(/[/-]/);
  if (parts.length === 3 && parts[2].length === 4) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  return raw;
};
const pause = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(request: Request, response: Response) {
  response.setHeader('Cache-Control', 'no-store');
  const authorization = request.headers.authorization;
  if (!process.env.CRON_SECRET || authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return response.status(401).json({ error: 'Unauthorized' });
  }
  const url = process.env.SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const apiKey = process.env.AGMARKNET_API_KEY;
  if (!url || !serviceRole || !apiKey) return response.status(500).json({ error: 'Server secrets are not configured.' });

  const database = createClient(url, serviceRole, { auth: { persistSession: false } });
  const { data: run, error: runError } = await database
    .from('market_price_sync_runs')
    .insert({ status: 'running' })
    .select('id')
    .single();
  if (runError) return response.status(500).json({ error: 'Could not start sync run.' });

  try {
    const { data: farms, error: farmsError } = await database
      .from('farms')
      .select('state, district, farm_crops(crop_name)')
      .eq('is_complete', true);
    if (farmsError) throw farmsError;

    const pairs = new Map<string, { state: string; district: string; commodity: string }>();
    for (const farm of farms ?? []) {
      for (const crop of farm.farm_crops ?? []) {
        const state = String(farm.state ?? '').trim();
        const district = String(farm.district ?? '').trim();
        const commodity = String(crop.crop_name ?? '').trim();
        if (state && district && commodity) pairs.set(`${state}|${district}|${commodity}`, { state, district, commodity });
      }
    }
    await database.from('market_price_sync_runs').update({ requested_pairs: pairs.size }).eq('id', run.id);

    let saved = 0;
    const failures: string[] = [];
    for (const pair of pairs.values()) {
      const params = new URLSearchParams({
        'api-key': apiKey,
        format: 'json',
        offset: '0',
        limit: '100',
        'filters[State]': pair.state,
        'filters[District]': pair.district,
        'filters[Commodity]': pair.commodity,
      });
      try {
        const apiResponse = await fetch(`${API_URL}?${params.toString()}`, { headers: { Accept: 'application/json' } });
        if (!apiResponse.ok) throw new Error(`AGMARKNET returned ${apiResponse.status}`);
        const payload = await apiResponse.json() as { records?: AgmarknetRecord[] };
        const rows = (payload.records ?? []).map(record => {
          const modalPrice = numberValue(record, 'Modal_Price', 'Modal_x0020_Price', 'Modal Price');
          const arrivalDate = value(record, 'Arrival_Date', 'Arrival_x0020_Date', 'Arrival Date');
          const market = value(record, 'Market', 'Market_Name') || pair.district;
          if (!modalPrice || !arrivalDate) return null;
          return {
            state: value(record, 'State') || pair.state,
            district: value(record, 'District') || pair.district,
            market,
            commodity: value(record, 'Commodity') || pair.commodity,
            variety: value(record, 'Variety'),
            grade: value(record, 'Grade'),
            arrival_date: normalizeArrivalDate(arrivalDate),
            min_price: numberValue(record, 'Min_Price', 'Min_x0020_Price', 'Min Price'),
            max_price: numberValue(record, 'Max_Price', 'Max_x0020_Price', 'Max Price'),
            modal_price: modalPrice,
            source_payload: record,
          };
        }).filter(Boolean);
        if (rows.length) {
          const { error } = await database.from('market_prices').upsert(rows, {
            onConflict: 'state,district,market,commodity,variety,grade,arrival_date',
          });
          if (error) throw error;
          saved += rows.length;
        }
      } catch (error) {
        failures.push(`${pair.district}/${pair.commodity}: ${error instanceof Error ? error.message : 'unknown error'}`);
      }
      await pause(PAUSE_BETWEEN_REQUESTS_MS);
    }
    const status = failures.length === 0 ? 'success' : saved > 0 ? 'partial_failure' : 'failed';
    await database.from('market_price_sync_runs').update({ completed_at: new Date().toISOString(), records_saved: saved, status, error_summary: failures.join('; ').slice(0, 4000) || null }).eq('id', run.id);
    return response.status(status === 'failed' ? 502 : 200).json({ status, requestedPairs: pairs.size, recordsSaved: saved, failures });
  } catch (error) {
    await database.from('market_price_sync_runs').update({ completed_at: new Date().toISOString(), status: 'failed', error_summary: error instanceof Error ? error.message : 'Unknown error' }).eq('id', run.id);
    return response.status(500).json({ error: 'Market-price sync failed safely; the app will continue to use cached or mock prices.' });
  }
}
