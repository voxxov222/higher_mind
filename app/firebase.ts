// --- FIREBASE INFRASTRUCTURE & AUTH ---
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { initializeFirestore, doc, setDoc, getDoc, getDocFromServer, updateDoc, serverTimestamp } from 'firebase/firestore';
import { CosmicData, UserProfileConfig } from './types';

const firebaseConfig = {
  projectId:         process.env.FIREBASE_PROJECT_ID          || import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId:             process.env.FIREBASE_APP_ID              || import.meta.env.VITE_FIREBASE_APP_ID,
  apiKey:            process.env.FIREBASE_API_KEY             || import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        process.env.FIREBASE_AUTH_DOMAIN         || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  firestoreDatabaseId: process.env.FIREBASE_FIRESTORE_DATABASE_ID || import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID,
  storageBucket:     process.env.FIREBASE_STORAGE_BUCKET      || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  measurementId:     process.env.FIREBASE_MEASUREMENT_ID      || import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

if (!firebaseConfig.apiKey && typeof window !== 'undefined') {
  console.warn("CRITICAL: Firebase API Key is missing. Infrastructure connection may fail.");
}

// Initialize the core Firebase App and services
const app = initializeApp(firebaseConfig);

let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
  }, firebaseConfig.firestoreDatabaseId || undefined);
} catch (error) {
  console.warn("Retrying Firestore initialization with default settings...", error);
  try {
    firestoreInstance = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
    });
  } catch (err) {
    console.error("Critical: Firestore failed to initialize completely", err);
  }
}

export const db = firestoreInstance!;
export const auth = getAuth(app);

export const authProvider = new GoogleAuthProvider();

/**
 * Executes a Google Sign-In popup for authentication.
 */
export const signIn = async () => {
  try {
    const result = await signInWithPopup(auth, authProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- FIRESTORE DATA PERSISTENCE ---

/**
 * Persists the main cosmic profile data for an authenticated user.
 */
export const saveCosmicProfile = async (userId: string, data: CosmicData, rawInput: {name: string, date: string, time: string, location: string}) => {
  const path = `users/${userId}`;
  try {
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem(`cosmic_backup_${userId}`);
      let parsed: any = {};
      if (existing) {
        try { 
          parsed = JSON.parse(existing); 
        } catch (e) {
          console.warn("Failed to parse existing backup data", e);
        }
      }
      localStorage.setItem(`cosmic_backup_${userId}`, JSON.stringify({
        ...parsed,
        input: rawInput,
        cosmicData: data,
        updatedAt: new Date().toISOString()
      }));
    }
    await setDoc(doc(db, "users", userId), {
      userId,
      input: rawInput,
      cosmicData: data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.warn(`Firestore save delayed or failed for path ${path} (operating in offline-capable mode):`, error);
  }
};

/**
 * Retrieves the profile configuration and cosmic data from the user's document.
 */
export const getCosmicProfile = async (userId: string): Promise<{input: any, cosmicData: CosmicData, profileConfig?: UserProfileConfig} | null> => {
  const path = `users/${userId}`;
  let localBackup: any = null;
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(`cosmic_backup_${userId}`);
    if (stored) {
      try {
        localBackup = JSON.parse(stored);
      } catch (e) {
        console.warn("Failed to parse stored local backup", e);
      }
    }
  }

  try {
    const docSnap = await getDoc(doc(db, "users", userId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      const loaded = { input: data.input, cosmicData: data.cosmicData, profileConfig: data.profileConfig };
      if (typeof window !== 'undefined') {
        localStorage.setItem(`cosmic_backup_${userId}`, JSON.stringify(loaded));
      }
      return loaded;
    }
    return localBackup;
  } catch (error) {
    console.warn(`Firestore get failed for path ${path} (operating in offline-capable mode), using local cache:`, error);
    return localBackup;
  }
};

/**
 * Updates UI-specific configuration settings like theme and biographic info.
 */
export const updateProfileConfig = async (userId: string, profileConfig: UserProfileConfig) => {
  const path = `users/${userId}`;
  if (typeof window !== 'undefined') {
    const existing = localStorage.getItem(`cosmic_backup_${userId}`);
    let parsed: any = {};
    if (existing) {
      try { 
        parsed = JSON.parse(existing); 
      } catch (e) {
        console.warn("Failed to parse local config backup", e);
      }
    }
    localStorage.setItem(`cosmic_backup_${userId}`, JSON.stringify({
      ...parsed,
      profileConfig,
      updatedAt: new Date().toISOString()
    }));
  }

  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      await setDoc(docRef, {
        userId,
        input: {},
        cosmicData: {},
        profileConfig,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } else {
      await updateDoc(docRef, {
        profileConfig,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.warn(`Firestore profile update delayed or failed for path ${path} (operating in offline-capable mode):`, error);
  }
};

async function testConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
      console.log("Firebase connection established.");
      return;
    } catch (error) {
      if (i === retries - 1) {
        console.log("Firebase is running in offline mode. Resilient local fallback active.");
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
  }
}
if (typeof window !== 'undefined') {
  testConnection();
}
