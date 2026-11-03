import { AppSettings, BackupData, Category, MonthlySummary, SyncStatus, ThemeMode, Transaction } from '../types/hisab';
import { DEFAULT_CATEGORIES } from '../data/defaultCategories';
import { auth, deleteTransactionFromCloud, fetchCloudData, syncLocalToCloud } from './firebase';

const STORAGE_KEYS = {
  TRANSACTIONS: 'my_daily_hisab_transactions_v1',
  CATEGORIES: 'my_daily_hisab_categories_v1',
  SETTINGS: 'my_daily_hisab_settings_v1',
  THEME_MODE: 'my_daily_hisab_theme_preference_v1',
};

const DEFAULT_SETTINGS: AppSettings = {
  language: 'bn', // Default to Bengali as requested by Bangladeshi/South Asian hisab user base, toggles instantly
  currency: 'BDT',
  currencySymbol: '৳',
  useBengaliNumerals: true,
  soundEnabled: true,
  hapticEnabled: true,
  monthlyBudget: 25000,
  userName: 'ব্যবহারকারী',
};

class StorageService {
  private listeners: (() => void)[] = [];
  private syncStatus: SyncStatus = 'idle';
  private syncError: string | null = null;

  constructor() {
    this.initDefaults();
    this.setupNetworkSyncListener();
  }

  public getSyncStatus(): SyncStatus {
    return this.syncStatus;
  }

  public getSyncError(): string | null {
    return this.syncError;
  }

  private setupNetworkSyncListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.performFullSync().catch((e) => console.warn('Background sync on network recovery failed', e));
      });
    }
  }

  private initDefaults(): void {
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      // Clean fresh start - NO fake data!
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    }
    // On first launch, persistent default MUST be Light Mode
    if (!localStorage.getItem(STORAGE_KEYS.THEME_MODE)) {
      localStorage.setItem(STORAGE_KEYS.THEME_MODE, 'light');
    }
  }

  public getThemeMode(): ThemeMode {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME_MODE);
      if (!stored) {
        // Very first launch! Default MUST be Light Mode
        localStorage.setItem(STORAGE_KEYS.THEME_MODE, 'light');
        return 'light';
      }
      return stored === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  }

  public setThemeMode(theme: ThemeMode): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME_MODE, theme);
      this.notify();
    } catch (e) {
      console.error('Failed to save theme preference', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  // --- Transactions (Room DAO parity) ---
  public getTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const parsed: Transaction[] = data ? JSON.parse(data) : [];
      // Sort descending by date and time
      return parsed.sort((a, b) => {
        const dateComp = b.date.localeCompare(a.date);
        if (dateComp !== 0) return dateComp;
        return (b.time || '').localeCompare(a.time || '');
      });
    } catch (e) {
      console.error('Error reading transactions from local storage', e);
      return [];
    }
  }

  public addTransaction(tx: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
    const list = this.getTransactions();
    const newTx: Transaction = {
      ...tx,
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: Date.now(),
    };
    list.unshift(newTx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list));
    this.notify();

    // Trigger cloud sync if authenticated and online
    if (auth.currentUser && typeof navigator !== 'undefined' && navigator.onLine) {
      this.syncLocalToCloudAsync();
    }

    return newTx;
  }

  public updateTransaction(tx: Transaction): void {
    const list = this.getTransactions();
    const idx = list.findIndex((t) => t.id === tx.id);
    if (idx !== -1) {
      list[idx] = { ...tx };
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list));
      this.notify();

      if (auth.currentUser && typeof navigator !== 'undefined' && navigator.onLine) {
        this.syncLocalToCloudAsync();
      }
    }
  }

  public deleteTransaction(id: string): void {
    const list = this.getTransactions();
    const updated = list.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
    this.notify();

    if (auth.currentUser && typeof navigator !== 'undefined' && navigator.onLine) {
      deleteTransactionFromCloud(id).catch((e) => console.warn('Cloud delete failed', e));
    }
  }

  // --- Categories (Room DAO parity) ---
  public getCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  }

  public getCategoryById(id: string): Category | undefined {
    const cats = this.getCategories();
    return cats.find((c) => c.id === id);
  }

  public addCategory(cat: Omit<Category, 'id'>): Category {
    const list = this.getCategories();
    const newCat: Category = {
      ...cat,
      id: 'cat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
    };
    list.push(newCat);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(list));
    this.notify();
    return newCat;
  }

  public updateCategory(cat: Category): void {
    const list = this.getCategories();
    const idx = list.findIndex((c) => c.id === cat.id);
    if (idx !== -1) {
      list[idx] = { ...cat };
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(list));
      this.notify();
    }
  }

  public deleteCategory(id: string): boolean {
    const list = this.getCategories();
    const target = list.find((c) => c.id === id);
    if (target?.isDefault) {
      return false; // protect system defaults
    }
    const updated = list.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    this.notify();
    return true;
  }

  // --- Settings ---
  public getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public updateSettings(settings: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    this.notify();
    return updated;
  }

  // --- Financial Statistics & Monthly Summaries ---
  public getTodaySummary(): { income: number; expense: number; savings: number; net: number } {
    const todayStr = new Date().toISOString().split('T')[0];
    const txs = this.getTransactions().filter((t) => t.date === todayStr);

    let income = 0;
    let expense = 0;
    let savings = 0;

    for (const tx of txs) {
      if (tx.type === 'INCOME') income += tx.amount;
      else if (tx.type === 'EXPENSE') expense += tx.amount;
      else if (tx.type === 'SAVINGS') savings += tx.amount;
    }

    return {
      income,
      expense,
      savings,
      net: income - expense,
    };
  }

  public getTotalBalance(): { netBalance: number; totalIncome: number; totalExpense: number; totalSavings: number } {
    const txs = this.getTransactions();
    let totalIncome = 0;
    let totalExpense = 0;
    let totalSavings = 0;

    for (const tx of txs) {
      if (tx.type === 'INCOME') totalIncome += tx.amount;
      else if (tx.type === 'EXPENSE') totalExpense += tx.amount;
      else if (tx.type === 'SAVINGS') totalSavings += tx.amount;
    }

    return {
      totalIncome,
      totalExpense,
      totalSavings,
      netBalance: totalIncome - totalExpense,
    };
  }

  public getMonthlySummary(year: number, month: number): MonthlySummary {
    const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
    const txs = this.getTransactions().filter((t) => t.date.startsWith(monthPrefix));
    const categories = this.getCategories();
    const catMap = new Map<string, Category>(categories.map((c) => [c.id, c]));

    let totalIncome = 0;
    let totalExpense = 0;
    let totalSavings = 0;

    // Daily expenses map
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyMap = new Map<number, number>();
    for (let d = 1; d <= daysInMonth; d++) {
      dailyMap.set(d, 0);
    }

    // Category breakdown map for expenses
    const catExpMap = new Map<string, number>();

    for (const tx of txs) {
      if (tx.type === 'INCOME') {
        totalIncome += tx.amount;
      } else if (tx.type === 'EXPENSE') {
        totalExpense += tx.amount;
        const day = parseInt(tx.date.split('-')[2], 10);
        dailyMap.set(day, (dailyMap.get(day) || 0) + tx.amount);
        catExpMap.set(tx.categoryId, (catExpMap.get(tx.categoryId) || 0) + tx.amount);
      } else if (tx.type === 'SAVINGS') {
        totalSavings += tx.amount;
      }
    }

    const dailyExpenses = Array.from(dailyMap.entries()).map(([day, amount]) => ({
      day,
      date: `${monthPrefix}-${String(day).padStart(2, '0')}`,
      amount,
    }));

    const categoryBreakdown = Array.from(catExpMap.entries())
      .map(([catId, amount]) => {
        const cat = catMap.get(catId) || {
          id: catId,
          nameEn: 'Other',
          nameBn: 'অন্যান্য',
          type: 'EXPENSE' as const,
          icon: 'MoreHorizontal',
          colorHex: '#A855F7',
        };
        const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
        return { category: cat, amount, percentage };
      })
      .sort((a, b) => b.amount - a.amount);

    const savingsRate = totalIncome > 0 ? Math.max(0, ((totalIncome - totalExpense) / totalIncome) * 100) : 0;

    return {
      month,
      year,
      totalIncome,
      totalExpense,
      totalSavings,
      netBalance: totalIncome - totalExpense,
      savingsRate: Math.round(savingsRate * 10) / 10,
      dailyExpenses,
      categoryBreakdown,
    };
  }

  // --- Backup & Restore (Room JSON Parity) ---
  public exportBackup(): BackupData {
    return {
      version: 1,
      appName: 'My Daily Hisab',
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      categories: this.getCategories(),
      transactions: this.getTransactions(),
    };
  }

  public importBackup(backupJsonStr: string): { success: boolean; message?: string } {
    try {
      const parsed = JSON.parse(backupJsonStr) as BackupData;
      if (!parsed || !Array.isArray(parsed.transactions) || !Array.isArray(parsed.categories)) {
        return { success: false, message: 'Invalid backup structure' };
      }

      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(parsed.transactions));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(parsed.categories));
      if (parsed.settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed.settings));
      }
      this.notify();
      return { success: true };
    } catch (e: any) {
      return { success: false, message: e.message || 'Parse error' };
    }
  }

  public resetAllData(): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    this.notify();
  }

  public loadSampleDataForDemo(): void {
    // Optional helper if user clicks "Load Sample Record"
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const dateToday = `${y}-${m}-${d}`;
    
    const sampleTxs: Transaction[] = [
      {
        id: 'tx_init_1',
        amount: 45000,
        type: 'INCOME',
        categoryId: 'inc_salary',
        date: dateToday,
        time: '10:00',
        paymentMethod: 'BANK',
        note: 'October Monthly Salary',
        createdAt: Date.now() - 3600000 * 5,
      },
      {
        id: 'tx_init_2',
        amount: 12000,
        type: 'EXPENSE',
        categoryId: 'exp_housing',
        date: dateToday,
        time: '11:30',
        paymentMethod: 'BKASH',
        note: 'Monthly Apartment Rent',
        createdAt: Date.now() - 3600000 * 4,
      },
      {
        id: 'tx_init_3',
        amount: 850,
        type: 'EXPENSE',
        categoryId: 'exp_groceries',
        date: dateToday,
        time: '14:15',
        paymentMethod: 'CASH',
        note: 'Fish, vegetables and rice bazaar',
        createdAt: Date.now() - 3600000 * 2,
      },
      {
        id: 'tx_init_4',
        amount: 5000,
        type: 'SAVINGS',
        categoryId: 'sav_bank_dps',
        date: dateToday,
        time: '16:00',
        paymentMethod: 'BANK',
        note: 'Monthly DPS Installment',
        createdAt: Date.now() - 3600000,
      },
    ];

    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(sampleTxs));
    this.notify();
  }

  private async syncLocalToCloudAsync(): Promise<void> {
    try {
      this.syncStatus = 'syncing';
      this.notify();
      await syncLocalToCloud(this.getTransactions(), this.getCategories(), this.getSettings());
      this.syncStatus = 'synced';
      this.syncError = null;
    } catch (e: any) {
      console.warn('Sync failed:', e);
      this.syncStatus = 'failed';
      this.syncError = e?.message || 'Cloud sync failed';
    } finally {
      this.notify();
    }
  }

  public async performFullSync(): Promise<{ success: boolean; error?: string }> {
    if (!auth.currentUser) {
      this.syncStatus = 'idle';
      this.notify();
      return { success: false, error: 'User is not signed in' };
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.syncStatus = 'failed';
      this.syncError = 'No internet connection';
      this.notify();
      return { success: false, error: 'Offline' };
    }

    try {
      this.syncStatus = 'syncing';
      this.notify();

      // Fetch existing cloud data
      const cloudData = await fetchCloudData();
      if (cloudData) {
        // Merge transactions by ID (deduplicating!)
        const localTxs = this.getTransactions();
        const txMap = new Map<string, Transaction>();
        // Put cloud transactions first
        cloudData.transactions.forEach((tx) => txMap.set(tx.id, tx));
        // Put local transactions (overriding or adding newer changes)
        localTxs.forEach((tx) => txMap.set(tx.id, tx));

        const mergedTxs = Array.from(txMap.values()).sort((a, b) => {
          const dComp = b.date.localeCompare(a.date);
          if (dComp !== 0) return dComp;
          return (b.time || '').localeCompare(a.time || '');
        });

        // Merge categories
        const localCats = this.getCategories();
        const catMap = new Map<string, Category>();
        localCats.forEach((c) => catMap.set(c.id, c));
        cloudData.categories.forEach((c) => {
          if (!catMap.has(c.id)) {
            catMap.set(c.id, c);
          }
        });
        const mergedCats = Array.from(catMap.values());

        // Update local state
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(mergedTxs));
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(mergedCats));

        if (cloudData.settings) {
          const currentSettings = this.getSettings();
          const mergedSettings = { ...currentSettings, ...cloudData.settings };
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(mergedSettings));
        }

        // Upload unified set back to cloud
        await syncLocalToCloud(mergedTxs, mergedCats, this.getSettings());
      } else {
        // If no cloud data yet, upload all local data
        await syncLocalToCloud(this.getTransactions(), this.getCategories(), this.getSettings());
      }

      this.syncStatus = 'synced';
      this.syncError = null;
      this.notify();
      return { success: true };
    } catch (e: any) {
      console.error('Full cloud synchronization failed:', e);
      this.syncStatus = 'failed';
      this.syncError = e?.message || 'Sync failed';
      this.notify();
      return { success: false, error: this.syncError || undefined };
    }
  }
}

export const storageService = new StorageService();
