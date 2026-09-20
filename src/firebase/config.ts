import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, getDoc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

// Initialize Firebase
const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    },
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is currently running offline.');
    }
    return false;
  }
}

// Save user profile to Firestore
export async function syncUserProfileToFirestore(profile: UserProfile): Promise<void> {
  if (!auth.currentUser || auth.currentUser.uid !== profile.userId) return;
  const path = `users/${profile.userId}`;
  try {
    const cleanProfile = {
      userId: profile.userId,
      displayName: profile.displayName || 'Aspirant',
      email: profile.email || '',
      photoURL: profile.photoURL || '',
      streakCount: Number(profile.streakCount) || 1,
      lastActiveDate: profile.lastActiveDate || new Date().toISOString().slice(0, 10),
      points: Number(profile.points) || 0,
      completedQuestions: (profile.completedQuestions || []).slice(0, 150),
      dailyFuel: Number(profile.dailyFuel) || 0,
      dailyGoal: Number(profile.dailyGoal) || 15,
      mockScores: (profile.mockScores || []).slice(0, 50),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', profile.userId), cleanProfile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Fetch user profile from Firestore
export async function fetchUserProfileFromFirestore(userId: string): Promise<Partial<UserProfile> | null> {
  const path = `users/${userId}`;
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      return docSnap.data() as Partial<UserProfile>;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// Sign in helper
export async function signInWithGooglePopup() {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (err) {
    console.error('Sign in with Google error:', err);
    throw err;
  }
}

// Sign out helper
export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Sign out error:', err);
    throw err;
  }
}

// Auth state observer
export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Alias for fetching profile
export const getUserProfileFromFirestore = fetchUserProfileFromFirestore;

