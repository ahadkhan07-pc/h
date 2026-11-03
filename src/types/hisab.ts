/**
 * Type definitions for My Daily Hisab (আমার দৈনিক হিসাব)
 * Matches Room Database Entity models in Android Jetpack Compose architecture
 */

export type TransactionType = 'INCOME' | 'EXPENSE' | 'SAVINGS';

export type PaymentMethod = 'CASH' | 'BKASH' | 'NAGAD' | 'BANK' | 'CARD' | 'OTHER';

export interface Category {
  id: string;
  nameEn: string;
  nameBn: string;
  type: TransactionType;
  icon: string;
  colorHex: string; // Tasteful magenta, purple, orange, amber, rose, violet (Strictly NO GREEN)
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string; // ISO string YYYY-MM-DD
  time: string; // HH:mm
  paymentMethod: PaymentMethod;
  note: string;
  createdAt: number;
}

export interface MonthlySummary {
  month: number; // 1-12
  year: number;
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  netBalance: number;
  savingsRate: number; // percentage
  dailyExpenses: { date: string; amount: number; day: number }[];
  categoryBreakdown: { category: Category; amount: number; percentage: number }[];
}

export type Language = 'en' | 'bn';
export type Currency = 'BDT' | 'USD' | 'INR' | 'EUR';
export type ThemeMode = 'light' | 'dark';

export interface AppSettings {
  language: Language;
  currency: Currency;
  currencySymbol: string;
  useBengaliNumerals: boolean;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  monthlyBudget: number;
  userName: string;
}

export interface BackupData {
  version: number;
  appName: string;
  exportedAt: string;
  settings: AppSettings;
  categories: Category[];
  transactions: Transaction[];
}

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'failed';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  phone?: string;
  bio?: string;
  joinedAt?: string;
}
