// ============================================================
// API Client — Centralized fetch with auth token
// Frontend NEVER calculates financial values — API provides them.
// ============================================================

function getApiBase(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:4000';
    }
    // On hosted domains (such as Vercel preview/production), use same-origin relative endpoints
    return '';
  }
  return 'http://localhost:4000';
}

const API_BASE = getApiBase();

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('krishisetu_token', token);
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('krishisetu_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('krishisetu_token');
      localStorage.removeItem('krishisetu_user');
    }
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers || {}) as Record<string, string>),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const targetUrl = API_BASE ? `${API_BASE}${path}` : path;
      const res = await fetch(targetUrl, {
        ...options,
        headers,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(error.message || `API Error: ${res.status}`);
      }

      return res.json();
    } catch (err: any) {
      // If localhost:4000 is unreachable, try relative Next.js API route if running in browser
      if (API_BASE && typeof window !== 'undefined' && (err?.message?.includes('Failed to fetch') || err?.name === 'TypeError')) {
        try {
          const fallbackRes = await fetch(path, { ...options, headers });
          if (fallbackRes.ok) {
            return fallbackRes.json();
          }
        } catch {
          // keep original error
        }
      }
      console.warn(`[ApiClient] Request to ${path} failed:`, err.message);
      throw err;
    }
  }

  // Auth
  async login(email: string, password: string) {
    const result = await this.request<{ user: any; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(result.token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('krishisetu_user', JSON.stringify(result.user));
    }
    return result;
  }

  async register(data: { email: string; password: string; name: string; role: string }) {
    const result = await this.request<{ user: any; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(result.token);
    return result;
  }

  async requestOtp(email: string, purpose: string = 'LOGIN') {
    return this.request<{
      success: boolean;
      message: string;
      email: string;
      expiresInMinutes: number;
      cooldownSeconds: number;
      demoOtp?: string;
    }>('/api/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify({ email, purpose }),
    });
  }

  async verifyOtp(email: string, otp: string, purpose: string = 'LOGIN') {
    const result = await this.request<{ user?: any; token?: string; verified?: boolean; message?: string }>('/api/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ email, otp, purpose }),
    });
    if (result.token) {
      this.setToken(result.token);
    }
    if (result.user && typeof window !== 'undefined') {
      localStorage.setItem('krishisetu_user', JSON.stringify(result.user));
    }
    return result;
  }

  async forgotPassword(email: string) {
    return this.request<{ success: boolean; message: string; email: string; demoOtp?: string }>(
      '/api/auth/password/forgot',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      },
    );
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    return this.request<{ success: boolean; message: string }>('/api/auth/password/reset', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    });
  }

  async getEmailHealth() {
    return this.request<{
      service: string;
      mode: string;
      configured: boolean;
      connected: boolean;
      host?: string;
      port?: number;
      fromAddress?: string;
      details?: string;
    }>('/api/admin/email/health');
  }

  async sendTestEmail(to?: string) {
    return this.request<{ success: boolean; messageId?: string; simulated?: boolean; error?: string }>(
      '/api/admin/email/test',
      {
        method: 'POST',
        body: JSON.stringify({ to }),
      },
    );
  }

  // Profile
  async getProfile() {
    return this.request<any>('/api/users/me');
  }

  // Lots
  async createLot(data: any) {
    return this.request<any>('/api/lots', { method: 'POST', body: JSON.stringify(data) });
  }

  async getLots() {
    return this.request<any[]>('/api/lots');
  }

  async getLot(id: string) {
    return this.request<any>(`/api/lots/${id}`);
  }

  async updateLotStatus(id: string, status: string) {
    return this.request<any>(`/api/lots/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getRecommendation(lotId: string) {
    return this.request<any>(`/api/lots/${lotId}/recommendation`);
  }

  async getBuyerMatches(lotId: string) {
    return this.request<any>(`/api/lots/${lotId}/buyer-matches`);
  }

  // Opportunities — Database CRUD & Intelligence
  async getOpportunities(params?: { channelType?: string; isEligible?: boolean; search?: string }) {
    const query = new URLSearchParams();
    if (params?.channelType) query.append('channelType', params.channelType);
    if (typeof params?.isEligible === 'boolean') query.append('isEligible', String(params.isEligible));
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return this.request<any[]>(`/api/opportunities${qs ? `?${qs}` : ''}`);
  }

  async getOpportunity(id: string) {
    return this.request<any>(`/api/opportunities/${id}`);
  }

  async createOpportunity(data: any) {
    return this.request<any>('/api/opportunities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOpportunity(id: string, data: any) {
    return this.request<any>(`/api/opportunities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteOpportunity(id: string) {
    return this.request<{ success: boolean; message: string }>(`/api/opportunities/${id}`, {
      method: 'DELETE',
    });
  }

  async resetOpportunities() {
    return this.request<{ success: boolean; message: string; count: number; data: any[] }>('/api/opportunities/reset', {
      method: 'POST',
    });
  }

  async analyzeOpportunities(lotId: string) {
    return this.request<any>(`/api/opportunities/${lotId}`);
  }

  // FPO Aggregation
  async getFpoAggregation() {
    return this.request<any>('/api/fpo/aggregation-opportunities');
  }

  // Demands
  async getDemands() {
    return this.request<any[]>('/api/demands');
  }

  async createDemand(data: any) {
    return this.request<any>('/api/demands', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Markets
  async getMarkets() {
    return this.request<any[]>('/api/markets');
  }

  // Offers
  async createOffer(data: { lotId: string; receiverId: string; pricePaise: number; quantity: number }) {
    return this.request<any>('/api/offers', { method: 'POST', body: JSON.stringify(data) });
  }

  async counterOffer(offerId: string, pricePaise: number) {
    return this.request<any>(`/api/offers/${offerId}/counter`, {
      method: 'POST',
      body: JSON.stringify({ pricePaise }),
    });
  }

  async acceptOffer(offerId: string) {
    return this.request<any>(`/api/offers/${offerId}/accept`, { method: 'POST' });
  }

  async getOffersForLot(lotId: string) {
    return this.request<any[]>(`/api/offers/lot/${lotId}`);
  }

  // Transactions
  async getTransactions() {
    return this.request<any[]>('/api/transactions');
  }

  async getTransaction(id: string) {
    return this.request<any>(`/api/transactions/${id}`);
  }

  async getTransactionSummary(id: string) {
    return this.request<any>(`/api/transactions/${id}/summary`);
  }

  async bookLogistics(transactionId: string, data: { distanceKm: number; estimatedCostPaise: number; vehicleType?: string }) {
    return this.request<any>(`/api/transactions/${transactionId}/logistics`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async completePayment(transactionId: string) {
    return this.request<any>(`/api/transactions/${transactionId}/payment/complete`, {
      method: 'POST',
    });
  }

  async getImpact(transactionId: string) {
    return this.request<any>(`/api/transactions/${transactionId}/impact`);
  }

  // Google OAuth
  async loginWithGoogle(payload: { email: string; name?: string; avatarUrl?: string; idToken?: string; role?: string }) {
    const result = await this.request<{ user: any; token: string; isNewUser?: boolean; isAdmin?: boolean }>('/api/auth/google/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(result.token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('krishisetu_user', JSON.stringify(result.user));
    }
    return result;
  }

  async getAuthConfig() {
    return this.request<{ demoMode: boolean; googleAuthEnabled: boolean; googleClientId?: string }>(
      '/api/auth/config',
    );
  }

  // Admin User Management
  async getAdminUsers(params?: { search?: string; role?: string; status?: string; provider?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.role) query.append('role', params.role);
    if (params?.status) query.append('status', params.status);
    if (params?.provider) query.append('provider', params.provider);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<any[]>(`/api/admin/users${qs}`);
  }

  async getAdminUserStats() {
    return this.request<{
      totalUsers: number;
      farmers: number;
      buyers: number;
      fpos: number;
      admins: number;
      active: number;
      suspended: number;
      pending: number;
    }>('/api/admin/users/stats');
  }

  async getAdminUserDetail(id: string) {
    return this.request<any>(`/api/admin/users/${id}`);
  }

  async updateUserRole(id: string, role: string, reason?: string) {
    return this.request<any>(`/api/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role, reason }),
    });
  }

  async updateUserStatus(id: string, status: string, reason?: string) {
    return this.request<any>(`/api/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
  }

  async getAdminUserAudit(id: string) {
    return this.request<any[]>(`/api/admin/users/${id}/audit`);
  }
}

export const api = new ApiClient();
