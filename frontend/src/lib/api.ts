const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  subscriptionTier: string;
  queryLimitPerMonth: number;
  queriesUsedThisMonth: number;
  createdAt: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

// Database connection types
export interface DatabaseConnection {
  id: string;
  name: string;
  databaseType: 'PostgreSQL' | 'MySQL' | 'SQLServer' | 'MongoDB';
  isActive: boolean;
  lastTestedAt: string | null;
  createdAt: string;
}

export interface CreateDatabaseConnectionPayload {
  name: string;
  databaseType: number; // 0=PostgreSQL, 1=MySQL, 2=SQLServer, 3=MongoDB
  host: string;
  port: number;
  databaseName: string;
  username: string;
  password: string;
}

export interface UpdateDatabaseConnectionPayload {
  name?: string;
  host?: string;
  port?: number;
  databaseName?: string;
  username?: string;
  password?: string;
}

export interface SchemaInfo {
  tables: TableSchema[];
}

export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
}

export interface ColumnSchema {
  name: string;
  dataType: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
}

// Conversation types
export interface Conversation {
  id: string;
  title: string;
  databaseConnectionId: string | null;
  databaseConnectionName: string | null;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
}

export interface CreateConversationPayload {
  title?: string;
  databaseConnectionId?: string;
}

// Message types
export interface Message {
  id: string;
  role: 'User' | 'Assistant' | 'System';
  content: string;
  sqlQuery: string | null;
  queryResult: QueryResult | string | null; // Can be JSON string or parsed object
  tokensUsed: number;
  createdAt: string;
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  executionTimeMs: number;
}

export interface ChatRequest {
  conversationId: string;
  message: string;
  executeQuery?: boolean; // Default: true
}

export interface ChatResponse {
  userMessage: Message;
  assistantMessage: Message;
  queryResult: string | null;
  tokensUsed: number;
}

// Usage types
export interface UsageStats {
  queriesUsedThisMonth: number;
  queryLimitPerMonth: number;
  percentageUsed: number;
  daysUntilReset: number;
  billingCycleStart: string;
  billingCycleEnd: string;
}

// Subscription types
export interface SubscriptionPlan {
  tier: number;
  name: string;
  price: number;
  description: string;
  queriesPerMonth: number;
  databaseConnections: number;
  supportLevel: string;
  features: string[];
  isCurrent: boolean;
  isPopular: boolean;
}

export interface SubscriptionResponse {
  currentTier: number;
  tierName: string;
  queriesPerMonth: number;
  queriesUsed: number;
  billingCycleReset: string;
}

export interface UsageLogEntry {
  id: string;
  databaseConnectionName: string;
  queryType: string;
  executionTimeMs: number;
  createdAt: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 - try to refresh token
    if (response.status === 401) {
      const refreshed = await this.tryRefreshToken();
      if (refreshed) {
        // Retry the request with new token
        const newToken = localStorage.getItem('accessToken');
        headers['Authorization'] = `Bearer ${newToken}`;
        const retryResponse = await fetch(url, { ...options, headers });
        const retryData = await retryResponse.json();
        if (!retryResponse.ok) {
          throw new ApiError(retryData.message || 'Something went wrong', retryResponse.status, retryData);
        }
        return retryData;
      } else {
        // Refresh failed, clear tokens
        auth.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new ApiError('Session expired', 401, null);
      }
    }

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.message || 'Something went wrong', response.status, data);
    }

    return data;
  }

  private async tryRefreshToken(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          auth.saveTokens(data.data.accessToken, data.data.refreshToken);
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  // ========== Auth endpoints ==========
  async register(payload: RegisterPayload): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async login(payload: LoginPayload): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async logout(): Promise<ApiResponse<null>> {
    return this.request<null>('/api/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
    return this.request<AuthTokens>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    return this.request<null>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyOtp(email: string, otp: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<ApiResponse<null>> {
    return this.request<null>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    });
  }

  async resendOtp(email: string): Promise<ApiResponse<null>> {
    return this.request<null>('/api/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // ========== Database endpoints ==========
  async getDatabases(): Promise<ApiResponse<DatabaseConnection[]>> {
    return this.request<DatabaseConnection[]>('/api/databases');
  }

  async getDatabase(id: string): Promise<ApiResponse<DatabaseConnection>> {
    return this.request<DatabaseConnection>(`/api/databases/${id}`);
  }

  async createDatabase(payload: CreateDatabaseConnectionPayload): Promise<ApiResponse<DatabaseConnection>> {
    return this.request<DatabaseConnection>('/api/databases', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateDatabase(id: string, payload: UpdateDatabaseConnectionPayload): Promise<ApiResponse<DatabaseConnection>> {
    return this.request<DatabaseConnection>(`/api/databases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteDatabase(id: string): Promise<ApiResponse<null>> {
    return this.request<null>(`/api/databases/${id}`, {
      method: 'DELETE',
    });
  }

  async testDatabase(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/databases/${id}/test`, {
      method: 'POST',
    });
  }

  async getDatabaseSchema(id: string): Promise<ApiResponse<SchemaInfo>> {
    return this.request<SchemaInfo>(`/api/databases/${id}/schema`);
  }

  // ========== Conversation endpoints ==========
  async getConversations(): Promise<ApiResponse<Conversation[]>> {
    return this.request<Conversation[]>('/api/conversations');
  }

  async getConversation(id: string): Promise<ApiResponse<ConversationDetail>> {
    return this.request<ConversationDetail>(`/api/conversations/${id}`);
  }

  async createConversation(payload: CreateConversationPayload): Promise<ApiResponse<Conversation>> {
    return this.request<Conversation>('/api/conversations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async deleteConversation(id: string): Promise<ApiResponse<null>> {
    return this.request<null>(`/api/conversations/${id}`, {
      method: 'DELETE',
    });
  }

  // ========== Chat endpoints ==========
  async sendMessage(payload: ChatRequest): Promise<ApiResponse<ChatResponse>> {
    return this.request<ChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // ========== Usage endpoints ==========
  async getUsage(): Promise<ApiResponse<UsageStats>> {
    return this.request<UsageStats>('/api/usage');
  }

  async getUsageHistory(skip = 0, take = 50): Promise<ApiResponse<UsageLogEntry[]>> {
    return this.request<UsageLogEntry[]>(`/api/usage/history?skip=${skip}&take=${take}`);
  }

  // ========== Account endpoints ==========
  async getAccount(): Promise<ApiResponse<User>> {
    return this.request<User>('/api/account');
  }

  async updateAccount(payload: { firstName?: string; lastName?: string }): Promise<ApiResponse<User>> {
    return this.request<User>('/api/account', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteAccount(): Promise<ApiResponse<null>> {
    return this.request<null>('/api/account', {
      method: 'DELETE',
    });
  }

  // ========== Subscription endpoints ==========
  async getSubscriptionPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
    return this.request<SubscriptionPlan[]>('/api/subscriptions/plans');
  }

  async getCurrentSubscription(): Promise<ApiResponse<SubscriptionResponse>> {
    return this.request<SubscriptionResponse>('/api/subscriptions/current');
  }

  async upgradeSubscription(newTier: number): Promise<ApiResponse<SubscriptionResponse>> {
    return this.request<SubscriptionResponse>('/api/subscriptions/upgrade', {
      method: 'PUT',
      body: JSON.stringify({ newTier }),
    });
  }
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const api = new ApiClient(API_BASE_URL);

// Auth helpers
export const auth = {
  saveTokens(accessToken: string, refreshToken: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  },

  clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  saveUser(user: User) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('accessToken');
    }
    return false;
  },
};

export type { AuthResponse, RegisterPayload, LoginPayload };
