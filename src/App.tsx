/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  AppSettings,
  Category,
  ThemeMode,
  Transaction,
  TransactionType,
} from './types/hisab';
import { storageService } from './services/storageService';
import { SplashView } from './components/SplashView';
import { TopBar } from './components/TopBar';
import { BottomNav, TabType } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { TransactionsScreen } from './components/TransactionsScreen';
import { ReportsScreen } from './components/ReportsScreen';
import { AddTransactionSheet } from './components/AddTransactionSheet';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { AndroidProjectModal } from './components/AndroidProjectModal';
import { ProfileModal } from './components/ProfileModal';
import { RedmiFrameWrapper } from './components/RedmiFrameWrapper';
import { auth } from './services/firebase';

export default function App() {
  // Permanent Theme State: First launch = Light Mode. Subsequent launches = Last saved theme.
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => storageService.getThemeMode());

  // Splash Screen state
  const [showSplash, setShowSplash] = useState(true);

  // Core Data States
  const [settings, setSettings] = useState<AppSettings>(() => storageService.getSettings());
  const [transactions, setTransactions] = useState<Transaction[]>(() => storageService.getTransactions());
  const [categories, setCategories] = useState<Category[]>(() => storageService.getCategories());

  // Navigation State
  const [currentTab, setCurrentTab] = useState<TabType>('home');

  // Modals & Sheets
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [addSheetInitialType, setAddSheetInitialType] = useState<TransactionType>('EXPENSE');
  const [addSheetInitialCategoryId, setAddSheetInitialCategoryId] = useState<string | undefined>(undefined);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Auto-sync cloud data on user authentication change
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user && typeof navigator !== 'undefined' && navigator.onLine) {
        storageService.performFullSync().catch((e) => console.warn('Auto sync failed:', e));
      }
    });
    return () => unsub();
  }, []);

  // Device Frame State (Default to device frame on desktop screens > 768px)
  const [isDeviceFrame, setIsDeviceFrame] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 900;
    }
    return false;
  });

  // Clock for Android status bar
  const [timeString, setTimeString] = useState('10:24');

  // Synchronize body class and data-theme attribute
  useEffect(() => {
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(themeMode === 'light' ? 'theme-light' : 'theme-dark');
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setTimeString(`${hours}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Subscribe to storage changes
  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setTransactions(storageService.getTransactions());
      setCategories(storageService.getCategories());
      setSettings(storageService.getSettings());
      setThemeMode(storageService.getThemeMode());
    });
    return () => unsubscribe();
  }, []);

  // Theme switching handlers
  const handleSetThemeMode = useCallback((newTheme: ThemeMode) => {
    storageService.setThemeMode(newTheme);
    setThemeMode(newTheme);
  }, []);

  const handleToggleTheme = useCallback(() => {
    const nextTheme: ThemeMode = themeMode === 'light' ? 'dark' : 'light';
    storageService.setThemeMode(nextTheme);
    setThemeMode(nextTheme);
  }, [themeMode]);

  // Handlers for transactions
  const handleSaveTransaction = useCallback((txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    storageService.addTransaction(txData);
  }, []);

  const handleUpdateTransaction = useCallback((tx: Transaction) => {
    storageService.updateTransaction(tx);
  }, []);

  const handleDeleteTransaction = useCallback((id: string) => {
    storageService.deleteTransaction(id);
  }, []);

  const handleOpenAdd = useCallback((prefill?: Partial<Transaction>) => {
    setEditingTransaction(null);
    setAddSheetInitialType(prefill?.type || 'EXPENSE');
    setAddSheetInitialCategoryId(prefill?.categoryId);
    setIsAddOpen(true);
  }, []);

  const handleOpenEdit = useCallback((tx: Transaction) => {
    setEditingTransaction(tx);
    setIsAddOpen(true);
  }, []);

  // Category handlers
  const handleAddCategory = useCallback((cat: Omit<Category, 'id'>) => {
    storageService.addCategory(cat);
  }, []);

  const handleUpdateCategory = useCallback((cat: Category) => {
    storageService.updateCategory(cat);
  }, []);

  const handleDeleteCategory = useCallback((id: string) => {
    return storageService.deleteCategory(id);
  }, []);

  // Settings handler
  const handleUpdateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    const updated = storageService.updateSettings(newSettings);
    setSettings(updated);
  }, []);

  // Sample data loader
  const handleLoadSampleData = useCallback(() => {
    storageService.loadSampleDataForDemo();
  }, []);

  // Switch to Android modal when user taps bottom nav Android tab
  const handleTabChange = useCallback((tab: TabType) => {
    if (tab === 'android') {
      setIsAndroidModalOpen(true);
    } else {
      setCurrentTab(tab);
    }
  }, []);

  const isLight = themeMode === 'light';

  return (
    <>
      {/* Animated Splash Screen */}
      {showSplash && (
        <SplashView
          onDismiss={() => setShowSplash(false)}
          lang={settings.language}
          themeMode={themeMode}
        />
      )}

      {/* Main App Container wrapped with Redmi Note 14 Pro Frame / Responsive layout */}
      <RedmiFrameWrapper
        isDeviceFrame={isDeviceFrame}
        onToggleFrame={() => setIsDeviceFrame(!isDeviceFrame)}
        themeMode={themeMode}
      >
        <div
          className={`min-h-screen flex flex-col transition-colors ${
            isLight ? 'bg-[#F8F5FC] text-[#160F24]' : 'bg-[#08060B] text-white'
          }`}
        >
          {/* Top Bar with Android 16 Status Bar, Branding, Theme Switcher and Controls */}
          <TopBar
            settings={settings}
            themeMode={themeMode}
            onToggleTheme={handleToggleTheme}
            onUpdateSettings={handleUpdateSettings}
            onOpenCategories={() => setIsCategoryModalOpen(true)}
            onOpenBackup={() => setIsBackupModalOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
            isDeviceFrame={isDeviceFrame}
            onToggleDeviceFrame={() => setIsDeviceFrame(!isDeviceFrame)}
            currentTimeString={timeString}
          />

          {/* Main Content Area */}
          <main className="flex-1 px-4 pt-4 pb-2 max-w-xl mx-auto w-full">
            {currentTab === 'home' && (
              <HomeScreen
                settings={settings}
                themeMode={themeMode}
                transactions={transactions}
                categories={categories}
                onOpenAddModal={handleOpenAdd}
                onEditTransaction={handleOpenEdit}
                onViewAllTransactions={() => setCurrentTab('transactions')}
                onLoadSampleData={handleLoadSampleData}
              />
            )}

            {currentTab === 'transactions' && (
              <TransactionsScreen
                settings={settings}
                themeMode={themeMode}
                transactions={transactions}
                categories={categories}
                onEditTransaction={handleOpenEdit}
                onOpenAddModal={() => handleOpenAdd()}
                onDeleteTransaction={handleDeleteTransaction}
              />
            )}

            {currentTab === 'reports' && (
              <ReportsScreen
                settings={settings}
                themeMode={themeMode}
                transactions={transactions}
                categories={categories}
              />
            )}
          </main>

          {/* Jetpack Compose Material 3 Style Bottom Navigation Bar */}
          <BottomNav
            currentTab={currentTab}
            onTabChange={handleTabChange}
            onOpenAddModal={() => handleOpenAdd()}
            lang={settings.language}
            themeMode={themeMode}
          />
        </div>
      </RedmiFrameWrapper>

      {/* Add / Edit Transaction Bottom Sheet Modal */}
      <AddTransactionSheet
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        onUpdate={handleUpdateTransaction}
        onDelete={handleDeleteTransaction}
        editingTransaction={editingTransaction}
        categories={categories}
        settings={settings}
        themeMode={themeMode}
        initialType={addSheetInitialType}
        initialCategoryId={addSheetInitialCategoryId}
      />

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        settings={settings}
        themeMode={themeMode}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {/* Backup, Restore & Preferences Modal with Sun/Moon Theme Switcher */}
      <BackupRestoreModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        settings={settings}
        themeMode={themeMode}
        onSetThemeMode={handleSetThemeMode}
        onUpdateSettings={handleUpdateSettings}
        onDataChanged={() => {
          setTransactions(storageService.getTransactions());
          setCategories(storageService.getCategories());
          setSettings(storageService.getSettings());
        }}
      />

      {/* Complete Android Project & Debug APK Explorer & Downloader */}
      <AndroidProjectModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
        settings={settings}
      />

      {/* User Profile & Google Cloud Sync Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        settings={settings}
        themeMode={themeMode}
        onUpdateSettings={handleUpdateSettings}
        onSyncComplete={() => {
          setTransactions(storageService.getTransactions());
          setCategories(storageService.getCategories());
          setSettings(storageService.getSettings());
        }}
      />
    </>
  );
}
