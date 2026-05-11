// --- FIREBASE INFRASTRUCTURE & AUTH ---
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, Timestamp, updateDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { CosmicData, UserProfileConfig } from './types';

// Initialize the core Firebase App and services
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
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
    await setDoc(doc(db, "users", userId), {
      userId,
      input: rawInput,
      cosmicData: data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

/**
 * Retrieves the profile configuration and cosmic data from the user's document.
 */
export const getCosmicProfile = async (userId: string): Promise<{input: any, cosmicData: CosmicData, profileConfig?: UserProfileConfig} | null> => {
  const path = `users/${userId}`;
  try {
    const docSnap = await getDoc(doc(db, "users", userId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { input: data.input, cosmicData: data.cosmicData, profileConfig: data.profileConfig };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

/**
 * Updates UI-specific configuration settings like theme and biographic info.
 */
export const updateProfileConfig = async (userId: string, profileConfig: UserProfileConfig) => {
  const path = `users/${userId}`;
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
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

async function testConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await getDoc(doc(db, 'test', 'connection'));
      console.log("Firebase connection established.");
      return;
    } catch (error) {
      if (i === retries - 1) {
        console.error("Firebase connection failed after retries:", error);
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. You may need to accept terms in the Firebase setup UI.");
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
}
testConnection();
