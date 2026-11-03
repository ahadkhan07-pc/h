import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Shield,
  Plus,
  ArrowRight,
  Clock,
  Zap,
} from 'lucide-react';
import { AppSettings, Category, ThemeMode, Transaction } from '../types/hisab';
import { TRANSLATIONS, formatCurrency, formatFriendlyDate } from '../utils/translations';
import { CategoryIcon } from './CategoryIcon';

interface HomeScreenProps {
  settings: AppSettings;
  themeMode: ThemeMode;
  transactions: Transaction[];
  categories: Category[];
  onOpenAddModal: (prefill?: Partial<Transaction>) => void;
  onEditTransaction: (tx: Transaction) => void;
  onViewAllTransactions: () => void;
  onLoadSampleData: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  settings,
  themeMode,
  transactions,
  categories,
  onOpenAddModal,
  onEditTransaction,
  onViewAllTransactions,
  onLoadSampleData,
}) => {
  const t = TRANSLATIONS[settings.language];
  const isLight = themeMode === 'light';
  const catMap = new Map<string, Category>(categories.map((c) => [c.id, c]));

  // Calculate overall balance
  let totalIncome = 0;
  let totalExpense = 0;
  let totalSavings = 0;

  // Calculate today's stats
  const todayStr = new Date().toISOString().split('T')[0];
  let todayIncome = 0;
  let todayExpense = 0;
  let todaySavings = 0;

  for (const tx of transactions) {
    if (tx.type === 'INCOME') totalIncome += tx.amount;
    else if (tx.type === 'EXPENSE') totalExpense += tx.amount;
    else if (tx.type === 'SAVINGS') totalSavings += tx.amount;

    if (tx.date === todayStr) {
      if (tx.type === 'INCOME') todayIncome += tx.amount;
      else if (tx.type === 'EXPENSE') todayExpense += tx.amount;
      else if (tx.type === 'SAVINGS') todaySavings += tx.amount;
    }
  }

  const netBalance = totalIncome - totalExpense;
  const recentTransactions = transactions.slice(0, 6);

  // Quick shortcut categories
  const quickCategories = [
    categories.find((c) => c.id === 'exp_food') || categories[0],
    categories.find((c) => c.id === 'exp_groceries') || categories[1],
    categories.find((c) => c.id === 'exp_transport') || categories[2],
    categories.find((c) => c.id === 'inc_salary') || categories[5],
  ].filter(Boolean);

  return (
    <div className="space-y-5 pb-6">
      {/* --- Main Luxury Net Balance Card --- */}
      <section className="luxury-card rounded-2xl p-5 relative overflow-hidden transition-colors">
        {/* Subtle decorative edge indicator (Swapped: Now Pink) */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#D946EF]" />

        <div
          className={`flex items-center justify-between text-xs font-mono mb-2 ${
            isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
          }`}
        >
          <span className="uppercase tracking-wider font-semibold">{t.totalBalance}</span>
          <span className="flex items-center gap-1 text-[#7C3AED] dark:text-[#8B5CF6] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] dark:bg-[#8B5CF6]" />
            ROOM SQLITE
          </span>
        </div>

        {/* Big Balance Number */}
        <div
          className={`text-3xl sm:text-4xl font-extrabold tracking-tight mb-5 ${
            isLight ? 'text-[#160F24]' : 'text-white'
          }`}
        >
          {formatCurrency(netBalance, settings.currencySymbol, settings.useBengaliNumerals)}
        </div>

        {/* 3 Metrics: Income (Now Purple), Expense (Orange - unchanged), Savings (Now Pink) */}
        <div
          className={`grid grid-cols-3 gap-2 pt-4 border-t ${
            isLight ? 'border-[#EAE2F3]' : 'border-[#231838]'
          }`}
        >
          {/* Income (Swapped: Now Purple) */}
          <div
            className={`p-2.5 rounded-xl border transition-colors ${
              isLight ? 'bg-[#FAF6FE] border-[#EAE2F3]' : 'bg-[#171024] border-[#2A1D40]'
            }`}
          >
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#7C3AED] dark:text-[#8B5CF6] mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{t.income}</span>
            </div>
            <div
              className={`text-sm sm:text-base font-bold truncate ${
                isLight ? 'text-[#160F24]' : 'text-white'
              }`}
            >
              {formatCurrency(totalIncome, settings.currencySymbol, settings.useBengaliNumerals)}
            </div>
          </div>

          {/* Expense (Orange - Unchanged) */}
          <div
            className={`p-2.5 rounded-xl border transition-colors ${
              isLight ? 'bg-[#FAF6FE] border-[#EAE2F3]' : 'bg-[#171024] border-[#2A1D40]'
            }`}
          >
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#F97316] mb-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>{t.expense}</span>
            </div>
            <div
              className={`text-sm sm:text-base font-bold truncate ${
                isLight ? 'text-[#160F24]' : 'text-white'
              }`}
            >
              {formatCurrency(totalExpense, settings.currencySymbol, settings.useBengaliNumerals)}
            </div>
          </div>

          {/* Savings (Swapped: Now Pink) */}
          <div
            className={`p-2.5 rounded-xl border transition-colors ${
              isLight ? 'bg-[#FAF6FE] border-[#EAE2F3]' : 'bg-[#171024] border-[#2A1D40]'
            }`}
          >
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#D946EF] mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>{t.savings}</span>
            </div>
            <div
              className={`text-sm sm:text-base font-bold truncate ${
                isLight ? 'text-[#160F24]' : 'text-white'
              }`}
            >
              {formatCurrency(totalSavings, settings.currencySymbol, settings.useBengaliNumerals)}
            </div>
          </div>
        </div>
      </section>

      {/* --- Today's Hisab (আজকের হিসাব) --- */}
      <section className="luxury-card rounded-2xl p-4 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#7C3AED] dark:text-[#8B5CF6]" />
            <h2
              className={`text-sm font-bold tracking-tight ${
                isLight ? 'text-[#160F24]' : 'text-white'
              }`}
            >
              {t.todayHisab}
            </h2>
          </div>
          <span
            className={`text-xs font-mono ${
              isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
            }`}
          >
            {formatFriendlyDate(todayStr, settings.language)}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          {/* Today Income (Swapped: Now Purple) */}
          <div
            className={`py-2 px-1 rounded-lg border transition-colors ${
              isLight ? 'bg-[#FAF7FE] border-[#EAE2F3]' : 'bg-[#140E1E] border-[#261A39]'
            }`}
          >
            <span
              className={`text-[10px] block font-mono ${
                isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
              }`}
            >
              {t.todayIncome}
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#7C3AED] dark:text-[#8B5CF6]">
              {formatCurrency(todayIncome, settings.currencySymbol, settings.useBengaliNumerals)}
            </span>
          </div>

          {/* Today Expense (Orange - Unchanged) */}
          <div
            className={`py-2 px-1 rounded-lg border transition-colors ${
              isLight ? 'bg-[#FAF7FE] border-[#EAE2F3]' : 'bg-[#140E1E] border-[#261A39]'
            }`}
          >
            <span
              className={`text-[10px] block font-mono ${
                isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
              }`}
            >
              {t.todayExpense}
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#EA580C]">
              {formatCurrency(todayExpense, settings.currencySymbol, settings.useBengaliNumerals)}
            </span>
          </div>

          {/* Today Savings (Swapped: Now Pink) */}
          <div
            className={`py-2 px-1 rounded-lg border transition-colors ${
              isLight ? 'bg-[#FAF7FE] border-[#EAE2F3]' : 'bg-[#140E1E] border-[#261A39]'
            }`}
          >
            <span
              className={`text-[10px] block font-mono ${
                isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
              }`}
            >
              {t.todaySavings}
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#D946EF]">
              {formatCurrency(todaySavings, settings.currencySymbol, settings.useBengaliNumerals)}
            </span>
          </div>
        </div>
      </section>

      {/* --- Quick Shortcuts (1-Tap Fast Entry) --- */}
      <section>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div
            className={`flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase font-mono ${
              isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#F97316]" />
            <span>{settings.language === 'bn' ? 'দ্রুত এন্ট্রি' : 'Quick Actions'}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {quickCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onOpenAddModal({ categoryId: cat.id, type: cat.type })}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-colors cursor-pointer group ${
                isLight
                  ? 'bg-[#FFFFFF] hover:bg-[#F9F5FD] border-[#E8DEF2]'
                  : 'bg-[#130E1D] hover:bg-[#1B142A] border-[#241A38]'
              }`}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${cat.colorHex}22`, border: `1px solid ${cat.colorHex}44` }}
              >
                <CategoryIcon name={cat.icon} size={16} color={cat.colorHex} />
              </div>
              <div className="overflow-hidden">
                <span
                  className={`text-xs font-semibold block truncate group-hover:text-[#7C3AED] dark:group-hover:text-[#8B5CF6] transition-colors ${
                    isLight ? 'text-[#160F24]' : 'text-white'
                  }`}
                >
                  {settings.language === 'bn' ? cat.nameBn : cat.nameEn}
                </span>
                <span
                  className={`text-[10px] block ${
                    isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
                  }`}
                >
                  {cat.type === 'INCOME' ? t.income : t.expense}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* --- Recent Transactions Section --- */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2
            className={`text-sm font-bold tracking-tight ${
              isLight ? 'text-[#160F24]' : 'text-white'
            }`}
          >
            {settings.language === 'bn' ? 'সাম্প্রতিক লেনদেন' : 'Recent Transactions'}
          </h2>
          {transactions.length > 0 && (
            <button
              onClick={onViewAllTransactions}
              className="text-xs font-semibold text-[#7C3AED] dark:text-[#8B5CF6] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{settings.language === 'bn' ? 'সব দেখুন' : 'View all'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {transactions.length === 0 ? (
          <div className="luxury-card rounded-2xl p-8 text-center transition-colors">
            <div
              className={`w-14 h-14 mx-auto mb-3 rounded-2xl border flex items-center justify-center ${
                isLight ? 'bg-[#F0E6FC] border-[#DECFF2]' : 'bg-[#1A1227] border-[#38265B]'
              }`}
            >
              <Plus className="w-7 h-7 text-[#7C3AED] dark:text-[#8B5CF6]" />
            </div>
            <h3
              className={`text-base font-bold mb-1 ${
                isLight ? 'text-[#160F24]' : 'text-white'
              }`}
            >
              {settings.language === 'bn' ? 'কোনো হিসাব রেকর্ড নেই' : 'No Transactions Recorded'}
            </h3>
            <p
              className={`text-xs max-w-xs mx-auto mb-5 leading-relaxed ${
                isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
              }`}
            >
              {t.noTransactionsYet}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <button
                onClick={() => onOpenAddModal()}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] font-semibold text-xs text-white shadow-md transition-colors cursor-pointer"
              >
                {t.addTransaction}
              </button>
              <button
                onClick={onLoadSampleData}
                className={`w-full sm:w-auto px-4 py-2 rounded-xl border text-xs font-medium text-[#EA580C] transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-[#FFF8F5] hover:bg-[#FEEDEA] border-[#FBD6CC]'
                    : 'bg-[#171024] hover:bg-[#201633] border-[#2C1F42]'
                }`}
              >
                {settings.language === 'bn' ? 'টেস্ট ডাটা লোড করুন' : 'Load Starter Data'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((tx) => {
              const cat = catMap.get(tx.categoryId) || {
                id: 'unknown',
                nameEn: 'General',
                nameBn: 'সাধারণ',
                type: tx.type,
                icon: 'Tag',
                colorHex: '#7C3AED',
              };

              const isIncome = tx.type === 'INCOME';
              const isSavings = tx.type === 'SAVINGS';
              // Swapped: Income is now Purple, Savings is now Pink
              const amountColor = isIncome
                ? isLight ? 'text-[#7C3AED]' : 'text-[#8B5CF6]'
                : isSavings
                ? 'text-[#D946EF]'
                : isLight ? 'text-[#EA580C]' : 'text-[#F97316]';

              return (
                <div
                  key={tx.id}
                  onClick={() => onEditTransaction(tx)}
                  className={`luxury-card rounded-xl p-3.5 flex items-center justify-between gap-3 transition-colors cursor-pointer active:scale-[0.99] ${
                    isLight ? 'hover:border-[#DECFF2]' : 'hover:border-[#38265B]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${cat.colorHex}22`,
                        border: `1px solid ${cat.colorHex}44`,
                      }}
                    >
                      <CategoryIcon name={cat.icon} size={18} color={cat.colorHex} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-sm font-semibold truncate ${
                            isLight ? 'text-[#160F24]' : 'text-white'
                          }`}
                        >
                          {settings.language === 'bn' ? cat.nameBn : cat.nameEn}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                            isLight
                              ? 'bg-[#F5EFFB] border-[#DECFF2] text-[#695B7E]'
                              : 'bg-[#1C142B] border-[#2D1F45] text-[#948BA5]'
                          }`}
                        >
                          {tx.paymentMethod}
                        </span>
                      </div>
                      <div
                        className={`flex items-center gap-2 text-xs mt-0.5 truncate ${
                          isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
                        }`}
                      >
                        <span>{formatFriendlyDate(tx.date, settings.language)}</span>
                        {tx.note && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span
                              className={`truncate ${
                                isLight ? 'text-[#483B5E]' : 'text-[#B7AEC5]'
                              }`}
                            >
                              {tx.note}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`text-sm sm:text-base font-bold ${amountColor}`}>
                      {isIncome ? '+ ' : isSavings ? '' : '- '}
                      {formatCurrency(tx.amount, settings.currencySymbol, settings.useBengaliNumerals)}
                    </div>
                    <span
                      className={`text-[10px] font-mono uppercase block ${
                        isLight ? 'text-[#8E80A2]' : 'text-[#6A5E82]'
                      }`}
                    >
                      {isIncome ? t.income : isSavings ? t.savings : t.expense}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
