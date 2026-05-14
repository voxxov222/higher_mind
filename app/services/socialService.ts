import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  updateDoc, 
  doc, 
  getDoc,
  setDoc,
  where,
  limit,
  increment
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { CommunityPost, Message, UserProfileConfig, WallPost } from '../types';

// --- PROFILE SERVICES ---

export const getAstralProfile = async (userId: string): Promise<UserProfileConfig | null> => {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().profileConfig as UserProfileConfig;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const saveAstralProfile = async (userId: string, profile: UserProfileConfig): Promise<void> => {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, {
      userId,
      username: profile.username,
      displayName: profile.displayName,
      profileConfig: profile,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

// --- COMMUNITY SERVICES ---

export const createPost = async (post: Partial<CommunityPost>): Promise<string> => {
  const path = 'community_posts';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...post,
      timestamp: serverTimestamp(),
      likes: 0,
      comments: 0
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return '';
  }
};

export const subscribeToPosts = (callback: (posts: CommunityPost[]) => void) => {
  const path = 'community_posts';
  const q = query(collection(db, path), orderBy('timestamp', 'desc'), limit(50));
  
  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CommunityPost));
    callback(posts);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

export const likePost = async (postId: string): Promise<void> => {
  const path = `community_posts/${postId}`;
  try {
    const docRef = doc(db, 'community_posts', postId);
    await updateDoc(docRef, {
      likes: increment(1)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

// --- MESSAGING SERVICES ---

export const sendMessage = async (message: Partial<Message>): Promise<string> => {
  const path = 'messages';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...message,
      timestamp: serverTimestamp(),
      read: false
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return '';
  }
};

export const subscribeToMessages = (userId: string, recipientId: string, callback: (messages: Message[]) => void) => {
  const path = 'messages';
  // Note: Firestore doesn't support complex OR queries easily for this structure without composite indexes
  // So we'll filter on the client or refine the schema later.
  // For now, let's query where current user is either sender or recipient
  const q = query(
    collection(db, path),
    where('senderId', 'in', [userId, recipientId]),
    where('recipientId', 'in', [userId, recipientId]),
    orderBy('timestamp', 'asc'),
    limit(100)
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Message));
    callback(messages);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

export const markAsRead = async (messageId: string): Promise<void> => {
  const path = `messages/${messageId}`;
  try {
    const docRef = doc(db, 'messages', messageId);
    await updateDoc(docRef, {
      read: true
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

// --- WALL SERVICES ---

export const createWallPost = async (userId: string, post: Partial<WallPost>): Promise<string> => {
  const path = `users/${userId}/wall_posts`;
  try {
    const docRef = await addDoc(collection(db, 'users', userId, 'wall_posts'), {
      ...post,
      timestamp: serverTimestamp(),
      likes: 0
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return '';
  }
};

export const subscribeToWallPosts = (userId: string, callback: (posts: WallPost[]) => void) => {
  const path = `users/${userId}/wall_posts`;
  const q = query(collection(db, 'users', userId, 'wall_posts'), orderBy('timestamp', 'desc'), limit(50));
  
  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as WallPost));
    callback(posts);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};
