import { initializeApp, getApp, getApps, deleteApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const loginWithGoogleRedirect = () => signInWithRedirect(auth, googleProvider);
export const handleRedirectResult = () => getRedirectResult(auth);

// Helper for username login (using a dummy domain)
export const loginWithUsername = (username: string, pass: string) => {
  const email = `${username.toLowerCase().trim()}@pesantren.local`;
  return signInWithEmailAndPassword(auth, email, pass);
};

// Helper for creating users without signing out the current admin
export const createStaffAccount = async (username: string, pass: string) => {
  const cleanUsername = username.toLowerCase().trim().replace(/\s+/g, '_');
  const secondaryAppName = `SecondaryApp_${Date.now()}`;
  const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
  const secondaryAuth = getAuth(secondaryApp);
  const email = `${cleanUsername}@pesantren.local`;
  
  try {
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, pass);
    await signOut(secondaryAuth);
    return userCredential.user;
  } catch (error: any) {
    console.error("Staff Auth Creation Error:", error);
    throw error;
  } finally {
    try {
      await deleteApp(secondaryApp);
    } catch (e) {
      console.warn("Failed to delete secondary app:", e);
    }
  }
};

// Validation check
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
