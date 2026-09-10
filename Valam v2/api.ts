export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
  } catch (e) {
    // #region agent log
    fetch('http://127.0.0.1:7292/ingest/7a20f725-2310-4ea2-bf32-01246a4db1ae',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bb8ab0'},body:JSON.stringify({sessionId:'bb8ab0',hypothesisId:'A',location:'api.ts:request:network',message:'fetch threw',data:{path,apiBase:API_BASE,err:e instanceof Error ? e.message : String(e)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    throw e;
  }
  const data = await response.json().catch(() => ({}));
  // #region agent log
  fetch('http://127.0.0.1:7292/ingest/7a20f725-2310-4ea2-bf32-01246a4db1ae',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bb8ab0'},body:JSON.stringify({sessionId:'bb8ab0',hypothesisId:'A',location:'api.ts:request',message:'api response',data:{path,status:response.status,ok:response.ok,hasOtp:!!(data as {otp?:string}).otp,err:(data as {error?:string}).error||null},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data as T;
}

export interface BackendState {
  user: any;
  farmProfile: any;
  alerts: any[];
  pdfDownloads: number;
  bundle: any[];
  hasBackup: boolean;
  ledgerEntries: any[];
  enquiries: any[];
  activityLog: any[];
  upcomingEvents: any[];
}

export const api = {
  health: () => request<{ ok: boolean; service: string }>('/api/health'),
  requestOtp: (phone: string, name?: string) => request<{ ok: boolean; otp?: string; isNewUser: boolean }>('/api/auth/request-otp', {
    method: 'POST', body: JSON.stringify({ phone, name }),
  }),
  verifyOtp: (phone: string, otp: string, name?: string, initialState?: Partial<BackendState>) => request<BackendState>('/api/auth/verify', {
    method: 'POST', body: JSON.stringify({ phone, otp, name, initialState }),
  }),
  getState: (userId: string) => request<BackendState>(`/api/state/${userId}`),
  saveState: (userId: string, state: Partial<BackendState>) => request<{ ok: boolean }>(`/api/state/${userId}`, {
    method: 'PUT', body: JSON.stringify(state),
  }),
};
