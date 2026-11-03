import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Battery,
  Smartphone,
  Globe,
  Database,
  Layers,
  Sun,
  Moon,
  User as UserIcon,
  Cloud,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Download,
} from 'lucide-react';
import { AppSettings, SyncStatus, ThemeMode } from '../types/hisab';
import { TRANSLATIONS } from '../utils/translations';
import { auth } from '../services/firebase';
import { storageService } from '../services/storageService';

interface TopBarProps {
  settings: AppSettings;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onOpenCategories: () => void;
  onOpenBackup: () => void;
  onOpenProfile: () => void;
  onOpenAndroidModal: () => void;
  isDeviceFrame: boolean;
  onToggleDeviceFrame: () => void;
  currentTimeString?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  settings,
  themeMode,
  onToggleTheme,
  onUpdateSettings,
  onOpenCategories,
  onOpenBackup,
  onOpenProfile,
  onOpenAndroidModal,
  isDeviceFrame,
  onToggleDeviceFrame,
  currentTimeString = '10:24',
}) => {
  const t = TRANSLATIONS[settings.language];
  const isLight = themeMode === 'light';

  // Network Connectivity State (PART 2: Green when online, Red when offline)
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(storageService.getSyncStatus());
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubAuth = auth.onAuthStateChanged((u) => setCurrentUser(u));
    const unsubStorage = storageService.subscribe(() => {
      setSyncStatus(storageService.getSyncStatus());
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubAuth();
      unsubStorage();
    };
  }, []);

  const toggleLanguage = () => {
    const nextLang = settings.language === 'bn' ? 'en' : 'bn';
    onUpdateSettings({ language: nextLang });
  };

  return (
    <header
      className={`sticky top-0 z-30 w-full transition-colors ${
        isLight
          ? 'bg-[#FFFFFF] border-b border-[#E6DDF2]'
          : 'bg-[#08060B] border-b border-[#1F172E]'
      }`}
    >

      {/* Main App Header Bar */}
      <div className="px-4 py-3 flex items-center justify-between gap-2 max-w-4xl mx-auto">
        {/* Header Title: Only "আমার দৈনিক হিসাব" + Network connection status dot (Green=Online, Red=Offline) */}
        <div className="flex items-center gap-2 min-w-0">
          <h1
            className={`text-base sm:text-lg font-bold tracking-tight truncate leading-none ${
              isLight ? 'text-[#160F24]' : 'text-white'
            }`}
          >
            আমার দৈনিক হিসাব
          </h1>

          {/* Network connectivity status dot: Green when internet is available, Red when unavailable */}
          <span
            title={isOnline ? 'Internet Connected (অনলাইন)' : 'No Internet (অফলাইন)'}
            className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 transition-colors ${
              isOnline ? 'bg-[#22C55E]' : 'bg-[#EF4444]'
            }`}
            style={{
              boxShadow: isOnline
                ? '0 0 6px rgba(34, 197, 94, 0.6)'
                : '0 0 6px rgba(239, 68, 68, 0.6)',
            }}
          />

          {/* Cloud Sync Status badge (Distinct from internet connection) */}
          {currentUser && (
            <div
              onClick={onOpenProfile}
              title={
                syncStatus === 'synced'
                  ? 'Cloud Synced'
                  : syncStatus === 'syncing'
                  ? 'Cloud Syncing...'
                  : syncStatus === 'failed'
                  ? 'Cloud Sync Failed'
                  : 'Cloud Idle'
              }
              className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono cursor-pointer transition-colors ${
                syncStatus === 'synced'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : syncStatus === 'syncing'
                  ? 'bg-purple-500/10 text-[#8B5CF6] border border-purple-500/20'
                  : syncStatus === 'failed'
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
              }`}
            >
              {syncStatus === 'synced' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              {syncStatus === 'syncing' && <RefreshCw className="w-3 h-3 animate-spin text-[#8B5CF6]" />}
              {syncStatus === 'failed' && <AlertCircle className="w-3 h-3 text-red-400" />}
              <span className="capitalize">{syncStatus}</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* User Profile / Google Sign-In Button */}
          <button
            onClick={onOpenProfile}
            title={currentUser ? currentUser.displayName || 'Profile' : 'Google Sign-In'}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              currentUser
                ? isLight
                  ? 'bg-[#F0E6FC] border-[#DECFF2] text-[#7C3AED]'
                  : 'bg-[#181126] border-[#291B40] text-[#8B5CF6]'
                : isLight
                ? 'bg-white hover:bg-[#F9F5FD] border-[#DECFF2] text-[#695B7E]'
                : 'bg-[#140E1F] hover:bg-[#1D142C] border-[#2B1F40] text-[#948BA5]'
            }`}
          >
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Avatar"
                className="w-4 h-4 rounded-full object-cover"
              />
            ) : (
              <UserIcon className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline max-w-[80px] truncate text-[11px]">
              {currentUser ? currentUser.displayName || 'Profile' : 'Login'}
            </span>
          </button>

          {/* Quick Theme Switcher Button with Sun & Moon Icons */}
          <button
            onClick={onToggleTheme}
            title={isLight ? t.darkMode : t.lightMode}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              isLight
                ? 'bg-[#FDF0FD] hover:bg-[#F9E5F9] border-[#E8DEF2] text-[#D946EF]'
                : 'bg-[#181026] hover:bg-[#231737] border-[#2D1F45] text-[#FB923C]'
            }`}
          >
            {isLight ? (
              <>
                <Moon className="w-3.5 h-3.5 text-[#D946EF]" />
                <span className="hidden sm:inline">{t.darkMode}</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-[#FB923C]" />
                <span className="hidden sm:inline">{t.lightMode}</span>
              </>
            )}
          </button>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            title={settings.language === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold text-[#7C3AED] dark:text-[#8B5CF6] transition-colors cursor-pointer ${
              isLight
                ? 'bg-[#F0E6FC] hover:bg-[#EAE0F9] border-[#DECFF2]'
                : 'bg-[#140E1F] hover:bg-[#1D142C] border-[#2B1F40]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{settings.language === 'bn' ? 'ENG' : 'বাংলা'}</span>
          </button>

          {/* Device Frame View Toggle */}
          <button
            onClick={onToggleDeviceFrame}
            title={isDeviceFrame ? t.fullScreen : t.togglePhoneFrame}
            className={`p-2 rounded-lg border text-xs transition-colors hidden md:flex items-center gap-1 cursor-pointer ${
              isDeviceFrame
                ? isLight
                  ? 'bg-[#F8EBFD] border-[#D946EF] text-[#D946EF]'
                  : 'bg-[#29173A] border-[#D946EF] text-[#D946EF]'
                : isLight
                ? 'bg-[#F9F5FD] border-[#DECFF2] text-[#695B7E] hover:text-[#160F24]'
                : 'bg-[#140E1F] border-[#2B1F40] text-[#948BA5] hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
          </button>

          {/* Category Manager Button */}
          <button
            onClick={onOpenCategories}
            title={t.manageCategories}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              isLight
                ? 'bg-[#F9F5FD] hover:bg-[#F2EBFB] border-[#DECFF2] text-[#695B7E] hover:text-[#EA580C]'
                : 'bg-[#140E1F] hover:bg-[#1D142C] border-[#2B1F40] text-[#948BA5] hover:text-[#FB923C]'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Backup / Storage Button */}
          <button
            onClick={onOpenBackup}
            title={t.backup}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              isLight
                ? 'bg-[#F9F5FD] hover:bg-[#F2EBFB] border-[#DECFF2] text-[#695B7E] hover:text-[#7C3AED]'
                : 'bg-[#140E1F] hover:bg-[#1D142C] border-[#2B1F40] text-[#948BA5] hover:text-[#8B5CF6]'
            }`}
          >
            <Database className="w-4 h-4" />
          </button>

          {/* Download Source Code / Android Project Button */}
          <button
            onClick={onOpenAndroidModal}
            title="Download Source Code ZIP / Android Project"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              isLight
                ? 'bg-[#F3E8FF] hover:bg-[#E9D5FF] border-[#D8B4FE] text-[#7C3AED]'
                : 'bg-[#2E1065]/40 hover:bg-[#2E1065]/70 border-[#7C3AED]/40 text-[#C084FC]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px]">Source ZIP</span>
          </button>
        </div>
      </div>
    </header>
  );
};
