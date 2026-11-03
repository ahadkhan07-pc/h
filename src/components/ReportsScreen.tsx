import React, { useState, useMemo } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  PieChart,
  BarChart2,
  TrendingDown,
  TrendingUp,
  Shield,
} from 'lucide-react';
import { AppSettings, Category, ThemeMode, Transaction } from '../types/hisab';
import {
  TRANSLATIONS,
  formatCurrency,
  formatNumber,
} from '../utils/translations';
import { storageService } from '../services/storageService';
import { CategoryIcon } from './CategoryIcon';

interface ReportsScreenProps {
  settings: AppSettings;
  themeMode: ThemeMode;
  transactions: Transaction[];
  categories: Category[];
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  settings,
  themeMode,
  transactions,
  categories,
}) => {
  const t = TRANSLATIONS[settings.language];
  const isLight = themeMode === 'light';

  // Month & Year state
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1);

  // Navigate months
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  // Calculate monthly summary
  const summary = useMemo(() => {
    return storageService.getMonthlySummary(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth, transactions]);

  // Max daily expense for scaling chart
  const maxDailyExpense = useMemo(() => {
    const amounts = summary.dailyExpenses.map((d) => d.amount);
    return Math.max(...amounts, 100);
  }, [summary.dailyExpenses]);

  // Find largest single expense this month
  const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(monthPrefix));
  }, [transactions, monthPrefix]);

  const largestExpense = useMemo(() => {
    const expenses = monthTransactions.filter((t) => t.type === 'EXPENSE');
    if (expenses.length === 0) return null;
    return expenses.reduce((max, cur) => (cur.amount > max.amount ? cur : max), expenses[0]);
  }, [monthTransactions]);

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const avgDailySpend = summary.totalExpense > 0 ? summary.totalExpense / daysInMonth : 0;

  // Month names
  const monthNameEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ][selectedMonth - 1];

  const monthNameBn = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
  ][selectedMonth - 1];

  const displayMonthName = settings.language === 'bn' ? monthNameBn : monthNameEn;

  // CSV export handler
  const handleExportCSV = () => {
    const rows: string[] = ['Date,Time,Type,Category,Amount,PaymentMethod,Note'];
    const catMap = new Map<string, Category>(categories.map((c) => [c.id, c]));

    for (const tx of monthTransactions) {
      const cat = catMap.get(tx.categoryId);
      const catName = cat?.nameEn || 'General';
      const cleanNote = (tx.note || '').replace(/,/g, ' ');
      rows.push(
        `${tx.date},${tx.time || ''},${tx.type},"${catName}",${tx.amount},${tx.paymentMethod},"${cleanNote}"`
      );
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hisab_Report_${selectedYear}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Month Navigation Header (Swapped: Calendar icon now Purple) */}
      <div className="luxury-card rounded-2xl p-3 flex items-center justify-between transition-colors">
        <button
          onClick={handlePrevMonth}
          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
            isLight
              ? 'bg-[#FAF6FE] hover:bg-[#F3EBFB] border-[#DECFF2] text-[#695B7E] hover:text-[#160F24]'
              : 'bg-[#170F25] hover:bg-[#23163A] border-[#291B40] text-[#948BA5] hover:text-white'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#7C3AED] dark:text-[#8B5CF6]" />
            <h2
              className={`text-base font-bold tracking-tight ${
                isLight ? 'text-[#160F24]' : 'text-white'
              }`}
            >
              {displayMonthName}{' '}
              {formatNumber(selectedYear, settings.useBengaliNumerals)}
            </h2>
          </div>
          <span
            className={`text-[11px] font-mono ${
              isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
            }`}
          >
            {settings.language === 'bn' ? 'মাসিক রিপোর্ট' : 'Monthly Financial Ledger'}
          </span>
        </div>

        <button
          onClick={handleNextMonth}
          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
            isLight
              ? 'bg-[#FAF6FE] hover:bg-[#F3EBFB] border-[#DECFF2] text-[#695B7E] hover:text-[#160F24]'
              : 'bg-[#170F25] hover:bg-[#23163A] border-[#291B40] text-[#948BA5] hover:text-white'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4 Overview Metric Cards - Swapped: Income is Purple, Savings is Pink */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Income (Swapped: Now Purple) */}
        <div
          className={`luxury-card rounded-2xl p-3.5 transition-colors ${
            isLight ? 'border-[#EAE2F3]' : 'border-[#281845]'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#7C3AED] dark:text-[#8B5CF6] mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t.totalEarned}</span>
          </div>
          <div
            className={`text-base sm:text-lg font-bold truncate ${
              isLight ? 'text-[#160F24]' : 'text-white'
            }`}
          >
            {formatCurrency(summary.totalIncome, settings.currencySymbol, settings.useBengaliNumerals)}
          </div>
        </div>

        {/* Expense (Orange - Unchanged) */}
        <div
          className={`luxury-card rounded-2xl p-3.5 transition-colors ${
            isLight ? 'border-[#EAE2F3]' : 'border-[#3A1E1E]'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F97316] mb-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>{t.totalSpent}</span>
          </div>
          <div
            className={`text-base sm:text-lg font-bold truncate ${
              isLight ? 'text-[#160F24]' : 'text-white'
            }`}
          >
            {formatCurrency(summary.totalExpense, settings.currencySymbol, settings.useBengaliNumerals)}
          </div>
        </div>

        {/* Net Savings (Swapped: Now Pink) */}
        <div
          className={`luxury-card rounded-2xl p-3.5 transition-colors ${
            isLight ? 'border-[#EAE2F3]' : 'border-[#2B1B42]'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#D946EF] mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>{t.savings}</span>
          </div>
          <div
            className={`text-base sm:text-lg font-bold truncate ${
              isLight ? 'text-[#160F24]' : 'text-white'
            }`}
          >
            {formatCurrency(summary.totalSavings, settings.currencySymbol, settings.useBengaliNumerals)}
          </div>
        </div>

        {/* Savings Rate (Swapped: Now Purple) */}
        <div
          className={`luxury-card rounded-2xl p-3.5 transition-colors ${
            isLight ? 'border-[#EAE2F3]' : 'border-[#281845]'
          }`}
        >
          <div
            className={`text-[11px] font-semibold mb-1 ${
              isLight ? 'text-[#7C3AED]' : 'text-[#8B5CF6]'
            }`}
          >
            {t.netSavingsRate}
          </div>
          <div
            className={`text-base sm:text-lg font-bold ${
              isLight ? 'text-[#160F24]' : 'text-white'
            }`}
          >
            {formatNumber(summary.savingsRate, settings.useBengaliNumerals, 1)}%
          </div>
        </div>
      </div>

      {/* --- Daily Spending Trend Chart (Solid Orange - Unchanged) --- */}
      <section className="luxury-card rounded-2xl p-4 sm:p-5 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#F97316]" />
            <h3
              className={`text-sm font-bold ${
                isLight ? 'text-[#160F24]' : 'text-white'
              }`}
            >
              {t.dailySpendingTrend}
            </h3>
          </div>
          <span
            className={`text-[11px] font-mono ${
              isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
            }`}
          >
            {settings.language === 'bn' ? 'দিন ১ থেকে ৩১' : 'Day 1 to 31'}
          </span>
        </div>

        {summary.totalExpense === 0 ? (
          <div
            className={`py-8 text-center text-xs ${
              isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
            }`}
          >
            {t.noDataForMonth}
          </div>
        ) : (
          <div>
            {/* Chart Area */}
            <div
              className={`h-40 flex items-end gap-1 sm:gap-1.5 pt-4 pb-1 border-b overflow-x-auto ${
                isLight ? 'border-[#EAE2F3]' : 'border-[#231936]'
              }`}
            >
              {summary.dailyExpenses.map((d) => {
                const heightPercent = maxDailyExpense > 0 ? (d.amount / maxDailyExpense) * 100 : 0;
                const hasExpense = d.amount > 0;

                return (
                  <div
                    key={d.day}
                    className="flex-1 min-w-[7px] max-w-[14px] flex flex-col items-center group relative cursor-pointer"
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                      <div className="px-2 py-1 rounded bg-[#25173B] border border-[#442C66] text-[10px] text-white whitespace-nowrap shadow-xl font-mono">
                        {d.day} {displayMonthName}: {formatCurrency(d.amount, settings.currencySymbol, settings.useBengaliNumerals)}
                      </div>
                    </div>

                    {/* Bar (solid orange fill) */}
                    <div
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        hasExpense
                          ? 'bg-[#F97316] group-hover:bg-[#EA580C]'
                          : isLight
                          ? 'bg-[#EDE4F5]'
                          : 'bg-[#181124]'
                      }`}
                      style={{ height: `${Math.max(hasExpense ? 4 : 2, heightPercent)}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-axis tick labels */}
            <div
              className={`flex justify-between text-[10px] font-mono pt-2 px-1 ${
                isLight ? 'text-[#87789F]' : 'text-[#6D6284]'
              }`}
            >
              <span>{settings.language === 'bn' ? '১ তারিখ' : '1st'}</span>
              <span>{settings.language === 'bn' ? '১০ তারিখ' : '10th'}</span>
              <span>{settings.language === 'bn' ? '২০ তারিখ' : '20th'}</span>
              <span>{settings.language === 'bn' ? `${daysInMonth} তারিখ` : `${daysInMonth}th`}</span>
            </div>
          </div>
        )}
      </section>

      {/* --- Category Distribution (Spending Breakdown) - Swapped icon to Purple --- */}
      <section className="luxury-card rounded-2xl p-4 sm:p-5 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#7C3AED] dark:text-[#8B5CF6]" />
            <h3
              className={`text-sm font-bold ${
                isLight ? 'text-[#160F24]' : 'text-white'
              }`}
            >
              {t.categoryDistribution}
            </h3>
          </div>
          <span
            className={`text-[11px] font-mono ${
              isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
            }`}
          >
            {summary.categoryBreakdown.length}{' '}
            {settings.language === 'bn' ? 'টি খাত' : 'categories'}
          </span>
        </div>

        {summary.categoryBreakdown.length === 0 ? (
          <div
            className={`py-6 text-center text-xs ${
              isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
            }`}
          >
            {t.noDataForMonth}
          </div>
        ) : (
          <div className="space-y-3">
            {summary.categoryBreakdown.map((item) => (
              <div key={item.category.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${item.category.colorHex}22`,
                        border: `1px solid ${item.category.colorHex}44`,
                      }}
                    >
                      <CategoryIcon name={item.category.icon} size={13} color={item.category.colorHex} />
                    </div>
                    <span
                      className={`font-semibold ${
                        isLight ? 'text-[#160F24]' : 'text-white'
                      }`}
                    >
                      {settings.language === 'bn' ? item.category.nameBn : item.category.nameEn}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <span
                      className={`text-[11px] ${
                        isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
                      }`}
                    >
                      {formatNumber(item.percentage, settings.useBengaliNumerals, 1)}%
                    </span>
                    <span
                      className={`font-bold ${
                        isLight ? 'text-[#160F24]' : 'text-white'
                      }`}
                    >
                      {formatCurrency(item.amount, settings.currencySymbol, settings.useBengaliNumerals)}
                    </span>
                  </div>
                </div>

                {/* Solid Progress Bar (NO Gradients) */}
                <div
                  className={`w-full h-1.5 rounded-full overflow-hidden ${
                    isLight ? 'bg-[#EDE4F5]' : 'bg-[#1A1226]'
                  }`}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.category.colorHex,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* --- Highlights & CSV Export --- */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Largest Single Expense */}
        <div className="luxury-card rounded-2xl p-4 transition-colors">
          <span
            className={`text-[11px] font-mono uppercase block mb-1 ${
              isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
            }`}
          >
            {t.highestSpend}
          </span>
          {largestExpense ? (
            <div>
              <div className="text-base font-bold text-[#F97316]">
                {formatCurrency(largestExpense.amount, settings.currencySymbol, settings.useBengaliNumerals)}
              </div>
              <p
                className={`text-xs mt-0.5 truncate ${
                  isLight ? 'text-[#160F24]' : 'text-white'
                }`}
              >
                {largestExpense.note || largestExpense.categoryId}
              </p>
              <span
                className={`text-[10px] font-mono ${
                  isLight ? 'text-[#87789F]' : 'text-[#6E6386]'
                }`}
              >
                {largestExpense.date}
              </span>
            </div>
          ) : (
            <span
              className={`text-xs ${
                isLight ? 'text-[#87789F]' : 'text-[#6E6386]'
              }`}
            >
              —
            </span>
          )}
        </div>

        {/* Average Daily Spend & Export (Swapped: Export text now Purple) */}
        <div className="luxury-card rounded-2xl p-4 flex flex-col justify-between transition-colors">
          <div>
            <span
              className={`text-[11px] font-mono uppercase block mb-1 ${
                isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
              }`}
            >
              {t.averageDaily}
            </span>
            <div
              className={`text-base font-bold ${
                isLight ? 'text-[#160F24]' : 'text-white'
              }`}
            >
              {formatCurrency(avgDailySpend, settings.currencySymbol, settings.useBengaliNumerals)}
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className={`mt-3 w-full py-2 px-3 rounded-xl border text-xs font-semibold text-[#7C3AED] dark:text-[#8B5CF6] flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              isLight
                ? 'bg-[#F0E6FC] hover:bg-[#EAE0F9] border-[#DECFF2]'
                : 'bg-[#1C122C] hover:bg-[#27193F] border-[#352352]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{settings.language === 'bn' ? 'CSV এক্সপোর্ট করুন' : 'Export Monthly CSV'}</span>
          </button>
        </div>
      </section>
    </div>
  );
};
