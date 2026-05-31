import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';

export interface SwarmFinding {
  id: string;
  userId: string;
  agentId: string;
  agentName: string;
  category: string;
  content: string;
  timestamp: string | any;
  links?: string[];
  references?: string[];
  archived?: boolean;
  highlighted?: boolean;
}

export const getSwarmFindings = async (userId: string): Promise<SwarmFinding[]> => {
  if (!db) throw new Error("Firestore not initialized");
  const q = query(
    collection(db, 'swarm_findings'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate().toLocaleTimeString() || new Date().toLocaleTimeString()
  } as SwarmFinding));
};

export const saveSwarmFinding = async (userId: string, finding: Omit<SwarmFinding, 'id' | 'userId' | 'timestamp'>): Promise<string> => {
  if (!db) throw new Error("Firestore not initialized");
  
  const docRef = await addDoc(collection(db, 'swarm_findings'), {
    ...finding,
    userId,
    archived: false,
    highlighted: false,
    timestamp: serverTimestamp()
  });
  
  return docRef.id;
};

export const updateSwarmFinding = async (findingId: string, updates: Partial<SwarmFinding>): Promise<void> => {
  if (!db) throw new Error("Firestore not initialized");
  const docRef = doc(db, 'swarm_findings', findingId);
  await updateDoc(docRef, updates);
};

export const deleteSwarmFinding = async (findingId: string): Promise<void> => {
  if (!db) throw new Error("Firestore not initialized");
  const docRef = doc(db, 'swarm_findings', findingId);
  await deleteDoc(docRef);
};
