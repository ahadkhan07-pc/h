import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Transaction, Category, AppSettings } from '../types/hisab';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export interface UserProfileData {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  phone?: string;
  bio?: string;
  updatedAt?: string;
}

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'failed';

// Google Sign-In
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Sync initial profile
    const user = result.user;
    await syncUserProfile({
      uid: user.uid,
      displayName: user.displayName || 'ব্যবহারকারী',
      email: user.email || '',
      photoURL: user.photoURL || '',
      updatedAt: new Date().toISOString(),
    });
    return user;
  } catch (error) {
    console.error('Google Sign-In failed:', error);
    throw error;
  }
}

// Sign-Out
export async function signOutUser(): Promise<void> {
  await fbSignOut(auth);
}

// User Profile Sync & Storage
export async function syncUserProfile(profile: UserProfileData): Promise<void> {
  if (!profile.uid) return;
  const userRef = doc(db, 'users', profile.uid);
  await setDoc(userRef, profile, { merge: true });
}

export async function getUserProfile(uid: string): Promise<UserProfileData | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfileData;
    }
    return null;
  } catch (error) {
    console.error('Failed to get user profile from Cloud Firestore:', error);
    return null;
  }
}

export async function updateUserProfileDetails(
  displayName: string,
  photoURL?: string,
  phone?: string,
  bio?: string
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  // Update Firebase Auth profile
  await updateProfile(currentUser, {
    displayName,
    ...(photoURL ? { photoURL } : {}),
  });

  // Update Firestore user document
  const profileData: UserProfileData = {
    uid: currentUser.uid,
    displayName,
    email: currentUser.email || '',
    photoURL: photoURL || currentUser.photoURL || '',
    phone: phone || '',
    bio: bio || '',
    updatedAt: new Date().toISOString(),
  };

  await syncUserProfile(profileData);
}

// --- Cloud Firestore Sync Engine for Financial Records ---

/**
 * Uploads all local transactions, categories, and settings to user's Cloud Firestore
 */
export async function syncLocalToCloud(
  transactions: Transaction[],
  categories: Category[],
  settings: AppSettings
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be signed in to sync data');

  const batch = writeBatch(db);

  // Sync settings
  const settingsRef = doc(db, 'users', user.uid, 'settings', 'appSettings');
  batch.set(
    settingsRef,
    {
      userId: user.uid,
      language: settings.language,
      currency: settings.currency,
      currencySymbol: settings.currencySymbol,
      useBengaliNumerals: settings.useBengaliNumerals,
      monthlyBudget: settings.monthlyBudget,
      userName: settings.userName,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  // Sync transactions
  transactions.forEach((tx) => {
    const txRef = doc(db, 'users', user.uid, 'transactions', tx.id);
    batch.set(
      txRef,
      {
        ...tx,
        userId: user.uid,
      },
      { merge: true }
    );
  });

  // Sync categories
  categories.forEach((cat) => {
    const catRef = doc(db, 'users', user.uid, 'categories', cat.id);
    batch.set(
      catRef,
      {
        ...cat,
        userId: user.uid,
      },
      { merge: true }
    );
  });

  await batch.commit();
}

/**
 * Fetches all transactions, categories, and settings from user's Cloud Firestore
 * Prevents duplicates by keying by ID.
 */
export async function fetchCloudData(): Promise<{
  transactions: Transaction[];
  categories: Category[];
  settings: Partial<AppSettings> | null;
} | null> {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    // Transactions
    const txCol = collection(db, 'users', user.uid, 'transactions');
    const txSnap = await getDocs(txCol);
    const cloudTransactions: Transaction[] = [];
    txSnap.forEach((docSnap) => {
      const data = docSnap.data();
      cloudTransactions.push({
        id: data.id || docSnap.id,
        amount: Number(data.amount) || 0,
        type: data.type,
        categoryId: data.categoryId,
        date: data.date,
        time: data.time || '12:00',
        paymentMethod: data.paymentMethod || 'CASH',
        note: data.note || '',
        createdAt: data.createdAt || Date.now(),
      });
    });

    // Categories
    const catCol = collection(db, 'users', user.uid, 'categories');
    const catSnap = await getDocs(catCol);
    const cloudCategories: Category[] = [];
    catSnap.forEach((docSnap) => {
      const data = docSnap.data();
      cloudCategories.push({
        id: data.id || docSnap.id,
        nameEn: data.nameEn,
        nameBn: data.nameBn,
        type: data.type,
        icon: data.icon,
        colorHex: data.colorHex,
        isDefault: Boolean(data.isDefault),
      });
    });

    // Settings
    const settingsRef = doc(db, 'users', user.uid, 'settings', 'appSettings');
    const settingsSnap = await getDoc(settingsRef);
    let cloudSettings: Partial<AppSettings> | null = null;
    if (settingsSnap.exists()) {
      cloudSettings = settingsSnap.data() as Partial<AppSettings>;
    }

    return {
      transactions: cloudTransactions,
      categories: cloudCategories,
      settings: cloudSettings,
    };
  } catch (error) {
    console.error('Failed to fetch user financial data from Firestore:', error);
    throw error;
  }
}

/**
 * Sync single transaction deletion to cloud
 */
export async function deleteTransactionFromCloud(id: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const txRef = doc(db, 'users', user.uid, 'transactions', id);
    await deleteDoc(txRef);
  } catch (e) {
    console.warn('Failed to delete transaction from cloud:', e);
  }
}
