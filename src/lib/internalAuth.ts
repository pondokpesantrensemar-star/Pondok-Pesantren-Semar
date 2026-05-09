import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

import { handleFirestoreError, OperationType } from './firestoreUtils';

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
    // We store admin docs by their ID which is "username@pesantren.local" 
    // or just the username as the ID now to keep it simple.
    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const docId = `${cleanUsername}@pesantren.local`;
    
    let adminDoc;
    try {
      adminDoc = await getDoc(doc(db, 'admins', docId));
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `admins/${docId}`);
      throw err;
    }
    
    if (!adminDoc.exists()) {
      throw new Error('User tidak ditemukan.');
    }

    const data = adminDoc.data();
    if (data.password !== pass) {
      throw new Error('Password salah.');
    }

    const user: InternalUser = {
      id: adminDoc.id,
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
