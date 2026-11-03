import React from 'react';
import { Home, Receipt, BarChart3, Plus, Code2 } from 'lucide-react';
import { TRANSLATIONS } from '../utils/translations';
import { Language, ThemeMode } from '../types/hisab';

export type TabType = 'home' | 'transactions' | 'reports' | 'android';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenAddModal: () => void;
  lang: Language;
  themeMode: ThemeMode;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  onOpenAddModal,
  lang,
  themeMode,
}) => {
  const t = TRANSLATIONS[lang];
  const isLight = themeMode === 'light';

  return (
    <nav
      className={`sticky bottom-0 z-40 w-full pb-safe transition-colors ${
        isLight
          ? 'bg-[#FFFFFF] border-t border-[#E6DDF2]'
          : 'bg-[#0B0812] border-t border-[#1F172E]'
      }`}
    >
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between relative">
        {/* Home Tab (Swapped: Now Purple) */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
            currentTab === 'home'
              ? isLight
                ? 'text-[#7C3AED]'
                : 'text-[#8B5CF6]'
              : isLight
              ? 'text-[#695B7E] hover:text-[#160F24]'
              : 'text-[#847B95] hover:text-[#EDEDED]'
          }`}
        >
          <div
            className={`w-10 h-7 rounded-full flex items-center justify-center mb-1 transition-all ${
              currentTab === 'home'
                ? isLight
                  ? 'bg-[#F0E6FC]'
                  : 'bg-[#21163A]'
                : 'bg-transparent'
            }`}
          >
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold tracking-tight">{t.home}</span>
        </button>

        {/* Transactions Tab (Swapped: Now Pink) */}
        <button
          onClick={() => onTabChange('transactions')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
            currentTab === 'transactions'
              ? 'text-[#D946EF]'
              : isLight
              ? 'text-[#695B7E] hover:text-[#160F24]'
              : 'text-[#847B95] hover:text-[#EDEDED]'
          }`}
        >
          <div
            className={`w-10 h-7 rounded-full flex items-center justify-center mb-1 transition-all ${
              currentTab === 'transactions'
                ? isLight
                  ? 'bg-[#F8EBFD]'
                  : 'bg-[#29173A]'
                : 'bg-transparent'
            }`}
          >
            <Receipt className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold tracking-tight">{t.transactions}</span>
        </button>

        {/* Center Floating Action Button (FAB) for Quick Add - SWAPPED FROM PINK TO PURPLE */}
        <div className="flex flex-col items-center justify-center px-2 -mt-5">
          <button
            onClick={onOpenAddModal}
            title={t.addTransaction}
            className={`w-13 h-13 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-95 text-white flex items-center justify-center shadow-lg transition-transform duration-150 cursor-pointer ${
              isLight ? 'border-2 border-white' : 'border-2 border-[#1E0F2B]'
            }`}
            style={{ boxShadow: '0 8px 24px -4px rgba(124, 58, 237, 0.45)' }}
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
          <span
            className={`text-[10px] font-bold mt-1 tracking-tight ${
              isLight ? 'text-[#7C3AED]' : 'text-[#8B5CF6]'
            }`}
          >
            {t.quickAdd}
          </span>
        </div>

        {/* Reports Tab (Orange - Unchanged) */}
        <button
          onClick={() => onTabChange('reports')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
            currentTab === 'reports'
              ? isLight
                ? 'text-[#EA580C]'
                : 'text-[#F97316]'
              : isLight
              ? 'text-[#695B7E] hover:text-[#160F24]'
              : 'text-[#847B95] hover:text-[#EDEDED]'
          }`}
        >
          <div
            className={`w-10 h-7 rounded-full flex items-center justify-center mb-1 transition-all ${
              currentTab === 'reports'
                ? isLight
                  ? 'bg-[#FDF0E9]'
                  : 'bg-[#311818]'
                : 'bg-transparent'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold tracking-tight">{t.reports}</span>
        </button>

        {/* Android Project & APK Tab (Swapped: Now Purple) */}
        <button
          onClick={() => onTabChange('android')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
            currentTab === 'android'
              ? isLight
                ? 'text-[#7C3AED]'
                : 'text-[#8B5CF6]'
              : isLight
              ? 'text-[#695B7E] hover:text-[#160F24]'
              : 'text-[#847B95] hover:text-[#EDEDED]'
          }`}
        >
          <div
            className={`w-10 h-7 rounded-full flex items-center justify-center mb-1 transition-all ${
              currentTab === 'android'
                ? isLight
                  ? 'bg-[#F0E6FC]'
                  : 'bg-[#21163A]'
                : 'bg-transparent'
            }`}
          >
            <Code2 className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold tracking-tight">
            {lang === 'bn' ? 'অ্যান্ড্রয়েড' : 'Android'}
          </span>
        </button>
      </div>
    </nav>
  );
};
