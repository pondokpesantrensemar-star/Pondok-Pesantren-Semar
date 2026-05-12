export interface InternalUser {
  id: string;
  username: string;
  access: 'all' | 'putra' | 'putri' | 'kesantrian';
  type: 'credential';
}

const SESSION_KEY = 'pesantren_admin_session';

export const internalAuth = {
  getUser: (): InternalUser | null => {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) return null;
    try {
      return JSON.parse(session);
    } catch {
      return null;
    }
  },

  login: async (username: string, pass: string): Promise<InternalUser> => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: pass }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login gagal.');
    }

    const data = await response.json();

    const user: InternalUser = {
      id: data.id,
      username: data.username,
      access: data.access,
      type: 'credential'
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
    window.location.reload();
  }
};
