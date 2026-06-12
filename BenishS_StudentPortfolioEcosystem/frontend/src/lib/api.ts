const API_BASE_URL = 'http://localhost:5113/api';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'Student' | 'Admin';
  profileId?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('mcc_token') : null;

  const headers = new Headers(options.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData))
    headers.set('Content-Type', 'application/json');

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try { const errData = await response.json(); errorMsg = errData.message || errorMsg; } catch {}
    throw new Error(errorMsg);
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : ({} as unknown as T);
}

// Authentication API
export const authApi = {
  login: async (usernameOrEmail: string, password: string): Promise<AuthResponse> => {
    const data = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password }),
    });
    if (data.token) {
      localStorage.setItem('mcc_token', data.token);
      localStorage.setItem('mcc_user', JSON.stringify(data.user));
    }
    return data;
  },
  register: async (payload: { username: string; email: string; password: string; department: string }): Promise<{ message: string }> =>
    apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => {
    localStorage.removeItem('mcc_token');
    localStorage.removeItem('mcc_user');
  },
  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('mcc_user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

// Portfolio API
export const portfolioApi = {
  getMyProfile: async (): Promise<any> => apiFetch('/portfolio/me'),
  getPublicProfile: async (username: string): Promise<any> => apiFetch(`/portfolio/public/${username}`),
  updateProfile: async (profileData: any): Promise<any> =>
    apiFetch('/portfolio/me', { method: 'PUT', body: JSON.stringify(profileData) }),

  // Delete own account (permanent — cascades all portfolio data)
  deleteMyAccount: async (): Promise<any> =>
    apiFetch('/portfolio/me', { method: 'DELETE' }),

  // Projects
  addProject: async (p: any) => apiFetch('/portfolio/projects', { method: 'POST', body: JSON.stringify(p) }),
  updateProject: async (id: number, p: any) => apiFetch(`/portfolio/projects/${id}`, { method: 'PUT', body: JSON.stringify(p) }),
  deleteProject: async (id: number) => apiFetch(`/portfolio/projects/${id}`, { method: 'DELETE' }),

  // Certifications
  addCertification: async (c: any) => apiFetch('/portfolio/certifications', { method: 'POST', body: JSON.stringify(c) }),
  updateCertification: async (id: number, c: any) => apiFetch(`/portfolio/certifications/${id}`, { method: 'PUT', body: JSON.stringify(c) }),
  deleteCertification: async (id: number) => apiFetch(`/portfolio/certifications/${id}`, { method: 'DELETE' }),

  // Research
  addResearch: async (r: any) => apiFetch('/portfolio/research', { method: 'POST', body: JSON.stringify(r) }),
  updateResearch: async (id: number, r: any) => apiFetch(`/portfolio/research/${id}`, { method: 'PUT', body: JSON.stringify(r) }),
  deleteResearch: async (id: number) => apiFetch(`/portfolio/research/${id}`, { method: 'DELETE' }),

  // Achievements
  addAchievement: async (a: any) => apiFetch('/portfolio/achievements', { method: 'POST', body: JSON.stringify(a) }),
  updateAchievement: async (id: number, a: any) => apiFetch(`/portfolio/achievements/${id}`, { method: 'PUT', body: JSON.stringify(a) }),
  deleteAchievement: async (id: number) => apiFetch(`/portfolio/achievements/${id}`, { method: 'DELETE' }),

  // Hackathons
  addHackathon: async (h: any) => apiFetch('/portfolio/hackathons', { method: 'POST', body: JSON.stringify(h) }),
  updateHackathon: async (id: number, h: any) => apiFetch(`/portfolio/hackathons/${id}`, { method: 'PUT', body: JSON.stringify(h) }),
  deleteHackathon: async (id: number) => apiFetch(`/portfolio/hackathons/${id}`, { method: 'DELETE' }),

  // Community Services
  addCommunityService: async (s: any) => apiFetch('/portfolio/communityservice', { method: 'POST', body: JSON.stringify(s) }),
  updateCommunityService: async (id: number, s: any) => apiFetch(`/portfolio/communityservice/${id}`, { method: 'PUT', body: JSON.stringify(s) }),
  deleteCommunityService: async (id: number) => apiFetch(`/portfolio/communityservice/${id}`, { method: 'DELETE' }),

  // Creative Works
  addCreativeWork: async (cw: any) => apiFetch('/portfolio/creative', { method: 'POST', body: JSON.stringify(cw) }),
  updateCreativeWork: async (id: number, cw: any) => apiFetch(`/portfolio/creative/${id}`, { method: 'PUT', body: JSON.stringify(cw) }),
  deleteCreativeWork: async (id: number) => apiFetch(`/portfolio/creative/${id}`, { method: 'DELETE' }),

  // Public lookups (no auth needed)
  getActiveNotifications: async (): Promise<any[]> => apiFetch('/portfolio/notifications'),
  getInstitution: async (): Promise<any> => apiFetch('/portfolio/institution'),
  getEnabledThemes: async (): Promise<any[]> => apiFetch('/portfolio/themes'),
};

// AI Services API
export const aiApi = {
  generateSOP: async (targetGoal: string, tone: string): Promise<{ sop: string }> =>
    apiFetch('/ai/generate-sop', { method: 'POST', body: JSON.stringify({ targetGoal, tone }) }),
  getResumeSuggestions: async (): Promise<{ portfolioScore: number; feedbackSummary: string; recommendations: string[] }> =>
    apiFetch('/ai/resume-suggestions'),
  getCareerRecommendations: async (): Promise<{ recommendedRole: string; rationale: string; skillsGap: string[]; suggestedUniversities: string[]; suggestedScholarships: string[] }> =>
    apiFetch('/ai/career-recommendations'),
};

// Admin / Super Admin API
export const adminApi = {
  // Analytics
  getAnalytics: async (): Promise<any> => apiFetch('/admin/analytics'),

  // Student Management
  getStudents: async (): Promise<any[]> => apiFetch('/admin/students'),
  approvePortfolio: async (profileId: number, approve = true): Promise<any> =>
    apiFetch(`/admin/approve/${profileId}?approve=${approve}`, { method: 'POST' }),

  // User & Role Management
  getAllUsers: async (): Promise<any[]> => apiFetch('/admin/users'),
  updateUserRole: async (id: number, role: string): Promise<any> =>
    apiFetch(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  deleteUser: async (id: number): Promise<any> =>
    apiFetch(`/admin/users/${id}`, { method: 'DELETE' }),

  // Institution Management
  getInstitution: async (): Promise<any> => apiFetch('/admin/institution'),
  updateInstitution: async (data: any): Promise<any> =>
    apiFetch('/admin/institution', { method: 'PUT', body: JSON.stringify(data) }),

  // Notification Management
  getNotifications: async (): Promise<any[]> => apiFetch('/admin/notifications'),
  addNotification: async (n: any): Promise<any> =>
    apiFetch('/admin/notifications', { method: 'POST', body: JSON.stringify(n) }),
  toggleNotification: async (id: number): Promise<any> =>
    apiFetch(`/admin/notifications/${id}/toggle`, { method: 'PUT' }),
  deleteNotification: async (id: number): Promise<any> =>
    apiFetch(`/admin/notifications/${id}`, { method: 'DELETE' }),

  // Theme Management
  getThemes: async (): Promise<any[]> => apiFetch('/admin/themes'),
  toggleTheme: async (id: number): Promise<any> =>
    apiFetch(`/admin/themes/${id}/toggle`, { method: 'PUT' }),

  // CSV Export - triggers browser download
  exportCSV: () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('mcc_token') : null;
    const url = `${API_BASE_URL}/admin/export/csv`;
    const a = document.createElement('a');
    a.href = url;
    // Append auth token via header is not possible for direct download; use window.open with token in query or form
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        a.href = blobUrl;
        a.download = `mcc_students_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(blobUrl);
      });
  }
};
