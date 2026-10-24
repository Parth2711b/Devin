export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl?: string | null;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
}

export interface Membership {
  id: string;
  organizationId: string;
  userId: string;
  role: 'OWNER' | 'MANAGER' | 'DEVELOPER' | 'VIEWER';
  createdAt: string;
  user?: User;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  repositoryUrl?: string | null;
  techStack?: any | null;
  organizationId: string;
  createdAt?: string;
}

export interface EnvVar {
  id: string;
  projectId: string;
  key: string;
  value: string;
}

export interface Session {
  id: string;
  projectId: string;
  status: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'STOPPED';
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  sessionId: string;
  role: 'USER' | 'AGENT' | 'SYSTEM';
  summaryText: string;
  rawTrace?: {
    toolCalls?: any[];
    toolResults?: any[];
  } | null;
  createdAt: string;
}

export interface FileChange {
  id: string;
  sessionId: string;
  filePath: string;
  diff: string;
  status: 'COMMITTED' | 'PROPOSED' | 'REJECTED';
  createdAt: string;
}

const API_BASE = 'http://localhost:3000';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('devin_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('devin_token', token);
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('devin_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errMsg = `Request failed: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errMsg = errorData.message || errMsg;
      } catch {
        // ignore
      }
      throw new Error(errMsg);
    }

    return response.json();
  }

  // Auth
  async devLogin(email: string = 'parth@example.com'): Promise<{ access_token: string; user: User }> {
    const data = await this.request<{ access_token: string; user: User }>('/auth/dev-login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  // Organizations
  async getOrgs(): Promise<Organization[]> {
    return this.request<Organization[]>('/orgs');
  }

  async createOrg(name: string, slug: string): Promise<Organization> {
    return this.request<Organization>('/orgs', {
      method: 'POST',
      body: JSON.stringify({ name, slug }),
    });
  }

  async deleteOrg(orgId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/orgs/${orgId}`, {
      method: 'DELETE',
    });
  }

  // Memberships
  async getMembers(orgId: string): Promise<Membership[]> {
    return this.request<Membership[]>(`/orgs/${orgId}/members`);
  }

  async addMember(
    orgId: string,
    userId: string,
    role: 'OWNER' | 'MANAGER' | 'DEVELOPER' | 'VIEWER' = 'DEVELOPER',
  ): Promise<Membership> {
    return this.request<Membership>(`/orgs/${orgId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId, role }),
    });
  }

  async removeMember(orgId: string, memberId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/orgs/${orgId}/members/${memberId}`, {
      method: 'DELETE',
    });
  }

  // Projects
  async getProjects(orgId: string): Promise<Project[]> {
    return this.request<Project[]>(`/orgs/${orgId}/projects`);
  }

  async createProject(
    orgId: string,
    data: { name: string; slug: string; description?: string; repositoryUrl?: string; techStack?: any },
  ): Promise<Project> {
    return this.request<Project>(`/orgs/${orgId}/projects`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(projectId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  // Env Vars & Hosting
  async getEnvVars(projectId: string): Promise<EnvVar[]> {
    return this.request<EnvVar[]>(`/projects/${projectId}/env-vars`);
  }

  async createEnvVar(projectId: string, key: string, value: string): Promise<EnvVar> {
    return this.request<EnvVar>(`/projects/${projectId}/env-vars`, {
      method: 'POST',
      body: JSON.stringify({ key, value }),
    });
  }

  async deleteEnvVar(projectId: string, id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/projects/${projectId}/env-vars/${id}`, {
      method: 'DELETE',
    });
  }

  // Sessions
  async getSessions(projectId: string): Promise<Session[]> {
    return this.request<Session[]>(`/projects/${projectId}/sessions`);
  }

  async createSession(projectId: string, title?: string): Promise<Session> {
    return this.request<Session>(`/projects/${projectId}/sessions`, {
      method: 'POST',
      body: JSON.stringify({ title: title || 'New Agent Session' }),
    });
  }

  async getSession(sessionId: string): Promise<Session> {
    return this.request<Session>(`/sessions/${sessionId}`);
  }

  // Messages & Agent
  async getMessages(sessionId: string): Promise<Message[]> {
    return this.request<Message[]>(`/sessions/${sessionId}/messages`);
  }

  async getFileChanges(sessionId: string): Promise<FileChange[]> {
    return this.request<FileChange[]>(`/sessions/${sessionId}/file-changes`);
  }

  async sendPrompt(sessionId: string, prompt: string): Promise<{
    sessionId: string;
    status: string;
    finalResponse: string;
    stepsCount: number;
  }> {
    return this.request(`/sessions/${sessionId}/prompt`, {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }
}

export const api = new ApiClient();
