import React, { useRef, useState } from 'react';
import {
  X,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Coins,
  Hash,
  Database,
  Sun,
  Moon,
} from 'lucide-react';
import { AppSettings, Currency, Language, ThemeMode } from '../types/hisab';
import { TRANSLATIONS } from '../utils/translations';
import { storageService } from '../services/storageService';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  themeMode: ThemeMode;
  onSetThemeMode: (theme: ThemeMode) => void;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onDataChanged: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  settings,
  themeMode,
  onSetThemeMode,
  onUpdateSettings,
  onDataChanged,
}) => {
  const t = TRANSLATIONS[settings.language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isLight = themeMode === 'light';

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  // Export JSON backup
  const handleExportBackup = () => {
    try {
      const backup = storageService.exportBackup();
      const jsonStr = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `MyDailyHisab_Backup_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatusMsg({ type: 'success', text: t.backupSuccess });
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: e.message || 'Export failed' });
    }
  };

  // Import JSON backup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const result = storageService.importBackup(text);
        if (result.success) {
          setStatusMsg({ type: 'success', text: t.restoreSuccess });
          onDataChanged();
        } else {
          setStatusMsg({ type: 'error', text: result.message || t.restoreError });
        }
      } catch (err: any) {
        setStatusMsg({ type: 'error', text: t.restoreError });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Factory reset (Preserves user permanent theme preference!)
  const handleResetAll = () => {
    storageService.resetAllData();
    setShowResetConfirm(false);
    setStatusMsg({
      type: 'success',
      text: settings.language === 'bn' ? 'সকল ডাটা রিসেট করা হয়েছে।' : 'All financial data has been reset to defaults.',
    });
    onDataChanged();
  };

  const currencies: { code: Currency; symbol: string; label: string }[] = [
    { code: 'BDT', symbol: '৳', label: 'BDT (৳ Taka)' },
    { code: 'USD', symbol: '$', label: 'USD ($ Dollar)' },
    { code: 'INR', symbol: '₹', label: 'INR (₹ Rupee)' },
    { code: 'EUR', symbol: '€', label: 'EUR (€ Euro)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div
        className={`w-full max-w-lg rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl transition-colors ${
          isLight
            ? 'bg-[#FFFFFF] border border-[#DECFF2] text-[#160F24]'
            : 'bg-[#110B1B] border border-[#2B1D42] text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Swapped: Database icon now Purple) */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between shrink-0 transition-colors ${
            isLight ? 'border-[#EAE2F3]' : 'border-[#231738]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#7C3AED] dark:text-[#8B5CF6]" />
            <h2
              className={`text-base font-bold tracking-tight ${
                isLight ? 'text-[#160F24]' : 'text-white'
              }`}
            >
              {t.backup} & {t.preferences}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight
                ? 'text-[#695B7E] hover:text-[#160F24] hover:bg-[#F4EFFB]'
                : 'text-[#948BA5] hover:text-white hover:bg-[#1E142F]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Status feedback message */}
          {statusMsg && (
            <div
              className={`p-3 rounded-xl flex items-center gap-2 font-medium ${
                statusMsg.type === 'success'
                  ? isLight
                    ? 'bg-[#F0E6FC] border border-[#CBB8E8] text-[#7C3AED]'
                    : 'bg-[#21163A] border border-[#7C3AED] text-[#8B5CF6]'
                  : 'bg-[#311119] border border-[#5E1F2E] text-[#FB7185]'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#7C3AED] dark:text-[#8B5CF6]" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#FB7185]" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* 1. App Preferences (Theme, Language & Numerals) */}
          <div className="space-y-3">
            <h3
              className={`text-xs font-mono uppercase tracking-wider ${
                isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
              }`}
            >
              {t.preferences}
            </h3>

            {/* Permanent Theme Mode Selector with Sun and Moon Icons */}
            <div className="luxury-card rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isLight ? 'bg-[#F8EBFD] text-[#D946EF]' : 'bg-[#21163A] text-[#8B5CF6]'
                  }`}
                >
                  {isLight ? <Sun className="w-4 h-4 text-[#FB923C]" /> : <Moon className="w-4 h-4 text-[#D946EF]" />}
                </div>
                <div>
                  <span className={`font-semibold block text-xs sm:text-sm ${isLight ? 'text-[#160F24]' : 'text-white'}`}>
                    {t.themeMode}
                  </span>
                  <span className={`text-[10px] ${isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'}`}>
                    {themeMode === 'light' ? t.lightMode : t.darkMode} ·{' '}
                    {settings.language === 'bn' ? 'স্থায়ীভাবে সংরক্ষিত' : 'Permanently saved'}
                  </span>
                </div>
              </div>

              {/* Sun and Moon Mode Toggle Buttons (Swapped accents) */}
              <div
                className={`flex items-center gap-1 p-1 rounded-lg border self-start sm:self-auto ${
                  isLight ? 'bg-[#F5EFFB] border-[#DECFF2]' : 'bg-[#191128] border-[#271A3F]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSetThemeMode('light')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    themeMode === 'light'
                      ? 'bg-[#FFFFFF] text-[#D946EF] shadow-xs border border-[#DECFF2]'
                      : isLight
                      ? 'text-[#695B7E] hover:text-[#160F24]'
                      : 'text-[#948BA5] hover:text-white'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-[#FB923C]" />
                  <span>{t.lightMode}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSetThemeMode('dark')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    themeMode === 'dark'
                      ? 'bg-[#21163A] text-[#8B5CF6] shadow-xs border border-[#3E2563]'
                      : isLight
                      ? 'text-[#695B7E] hover:text-[#160F24]'
                      : 'text-[#948BA5] hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-[#D946EF]" />
                  <span>{t.darkMode}</span>
                </button>
              </div>
            </div>

            {/* Language Selector (Swapped: Active is now Purple) */}
            <div className="luxury-card rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#D946EF]" />
                <span className={`font-semibold ${isLight ? 'text-[#160F24]' : 'text-white'}`}>
                  {t.language}
                </span>
              </div>
              <div
                className={`flex items-center gap-1 p-1 rounded-lg border ${
                  isLight ? 'bg-[#F5EFFB] border-[#DECFF2]' : 'bg-[#191128] border-[#271A3F]'
                }`}
              >
                <button
                  onClick={() => onUpdateSettings({ language: 'bn' })}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    settings.language === 'bn'
                      ? 'bg-[#7C3AED] dark:bg-[#8B5CF6] text-white shadow-xs'
                      : isLight
                      ? 'text-[#695B7E] hover:text-[#160F24]'
                      : 'text-[#948BA5] hover:text-white'
                  }`}
                >
                  বাংলা
                </button>
                <button
                  onClick={() => onUpdateSettings({ language: 'en' })}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    settings.language === 'en'
                      ? 'bg-[#7C3AED] dark:bg-[#8B5CF6] text-white shadow-xs'
                      : isLight
                      ? 'text-[#695B7E] hover:text-[#160F24]'
                      : 'text-[#948BA5] hover:text-white'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Bengali Numerals Toggle (Swapped: Toggle is now Purple) */}
            <div className="luxury-card rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-[#FB923C]" />
                <div>
                  <span className={`font-semibold block ${isLight ? 'text-[#160F24]' : 'text-white'}`}>
                    {t.bengaliDigits}
                  </span>
                  <span className={`text-[10px] ${isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'}`}>
                    {settings.language === 'bn' ? 'যেমন: ৳ ১,২৫০' : 'e.g. ৳ ১,২৫০'}
                  </span>
                </div>
              </div>
              <button
                onClick={() =>
                  onUpdateSettings({ useBengaliNumerals: !settings.useBengaliNumerals })
                }
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.useBengaliNumerals ? 'bg-[#7C3AED] dark:bg-[#8B5CF6]' : isLight ? 'bg-[#D4C6E5]' : 'bg-[#291F38]'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.useBengaliNumerals ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Currency Symbol Selector (Swapped: Active is now Purple) */}
            <div className="luxury-card rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-4 h-4 text-[#7C3AED] dark:text-[#8B5CF6]" />
                <span className={`font-semibold ${isLight ? 'text-[#160F24]' : 'text-white'}`}>
                  {t.currency}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {currencies.map((c) => (
                  <button
                    key={c.code}
                    onClick={() =>
                      onUpdateSettings({ currency: c.code, currencySymbol: c.symbol })
                    }
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      settings.currencySymbol === c.symbol
                        ? isLight
                          ? 'bg-[#F0E6FC] border border-[#7C3AED] text-[#7C3AED]'
                          : 'bg-[#21163A] border border-[#8B5CF6] text-white'
                        : isLight
                        ? 'bg-[#F8F4FD] border border-[#E4D8F1] text-[#695B7E] hover:text-[#160F24]'
                        : 'bg-[#191128] border border-[#251A3C] text-[#948BA5] hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Room Database Backup & Restore */}
          <div className="space-y-3 pt-2">
            <h3
              className={`text-xs font-mono uppercase tracking-wider ${
                isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
              }`}
            >
              {t.backupData}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Export Backup (Swapped: Icon is now Purple) */}
              <button
                onClick={handleExportBackup}
                className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer group ${
                  isLight
                    ? 'bg-[#FFFFFF] hover:bg-[#FBF8FE] border-[#DECFF2]'
                    : 'bg-[#191026] hover:bg-[#251639] border-[#2E1E48]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-[#7C3AED] dark:text-[#8B5CF6] mb-2 group-hover:scale-105 transition-transform ${
                    isLight ? 'bg-[#F0E6FC]' : 'bg-[#21163A]'
                  }`}
                >
                  <Download className="w-4 h-4" />
                </div>
                <span className={`font-bold block mb-0.5 ${isLight ? 'text-[#160F24]' : 'text-white'}`}>
                  {t.exportBackup}
                </span>
                <span className={`text-[10px] block ${isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'}`}>
                  {settings.language === 'bn'
                    ? 'সকল হিসাবের একটি নিরাপদ JSON ফাইল ডাউনলোড হবে'
                    : 'Download complete snapshot of your Room database'}
                </span>
              </button>

              {/* Import Backup (Swapped: Icon is now Pink) */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer group ${
                  isLight
                    ? 'bg-[#FFFFFF] hover:bg-[#FBF8FE] border-[#DECFF2]'
                    : 'bg-[#191026] hover:bg-[#251639] border-[#2E1E48]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-[#D946EF] mb-2 group-hover:scale-105 transition-transform ${
                    isLight ? 'bg-[#F8EBFD]' : 'bg-[#281432]'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                </div>
                <span className={`font-bold block mb-0.5 ${isLight ? 'text-[#160F24]' : 'text-white'}`}>
                  {t.importBackup}
                </span>
                <span className={`text-[10px] block ${isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'}`}>
                  {settings.language === 'bn'
                    ? 'পূর্বে ব্যাকআপ করা JSON ফাইল থেকে ডাটা পুনরুদ্ধার'
                    : 'Restore data from your previously saved backup'}
                </span>
              </button>
              {/* Download Full Source Code Package */}
              <a
                href="/My_Daily_Hisab_Source_Code.zip"
                download="My_Daily_Hisab_Source_Code.zip"
                className={`sm:col-span-2 p-3.5 rounded-xl border text-left transition-colors cursor-pointer group flex items-center justify-between ${
                  isLight
                    ? 'bg-[#FAF5FF] hover:bg-[#F3E8FF] border-[#D8B4FE]'
                    : 'bg-[#1C102C] hover:bg-[#25153A] border-[#3F2060]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-[#7C3AED] dark:text-[#C084FC] group-hover:scale-105 transition-transform ${
                      isLight ? 'bg-[#EDE9FE]' : 'bg-[#2E1A48]'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`font-bold block text-xs sm:text-sm ${isLight ? 'text-[#160F24]' : 'text-white'}`}>
                      {settings.language === 'bn' ? 'সম্পূর্ণ সোর্স কোড ডাউনলোড (ZIP)' : 'Download Source Code (My_Daily_Hisab_Source_Code.zip)'}
                    </span>
                    <span className={`text-[10px] block ${isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'}`}>
                      {settings.language === 'bn'
                        ? 'ওয়েব অ্যাপ ও অ্যান্ড্রয়েড স্টুডিও সোর্স কোড সহ সম্পূর্ণ প্যাকেজ'
                        : 'Complete project: Web SPA, Android Kotlin Compose, Room & Gradle Wrapper'}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#7C3AED] text-white shrink-0 ml-2">
                  ZIP
                </span>
              </a>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* 3. Factory Reset Zone (Leaves Theme Preference Intact!) */}
          <div
            className={`pt-2 border-t ${
              isLight ? 'border-[#EAE2F3]' : 'border-[#231738]'
            }`}
          >
            {showResetConfirm ? (
              <div className="p-3.5 rounded-xl bg-[#2D121C] border border-[#5B1F2F] text-xs">
                <p className="text-[#FB7185] font-semibold mb-3 leading-relaxed">
                  {t.resetConfirm}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleResetAll}
                    className="px-4 py-2 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold cursor-pointer"
                  >
                    {settings.language === 'bn' ? 'হ্যাঁ, ডাটা রিসেট করুন' : 'Confirm Reset Data'}
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className={`px-3.5 py-2 rounded-lg cursor-pointer ${
                      isLight ? 'bg-[#EDE4F5] text-[#160F24]' : 'bg-[#1E142F] text-[#948BA5] hover:text-white'
                    }`}
                  >
                    {t.cancel}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold text-[#FB7185] flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-[#FFF5F6] hover:bg-[#FFEAEB] border-[#FBD2D6]'
                    : 'bg-[#170E1E] hover:bg-[#26121E] border-[#301625]'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.resetAllData}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
