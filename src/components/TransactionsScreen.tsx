import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Plus,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import {
  AppSettings,
  Category,
  ThemeMode,
  Transaction,
  TransactionType,
} from '../types/hisab';
import {
  TRANSLATIONS,
  formatCurrency,
  formatFriendlyDate,
} from '../utils/translations';
import { CategoryIcon } from './CategoryIcon';

interface TransactionsScreenProps {
  settings: AppSettings;
  themeMode: ThemeMode;
  transactions: Transaction[];
  categories: Category[];
  onEditTransaction: (tx: Transaction) => void;
  onOpenAddModal: () => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionsScreen: React.FC<TransactionsScreenProps> = ({
  settings,
  themeMode,
  transactions,
  categories,
  onEditTransaction,
  onOpenAddModal,
  onDeleteTransaction,
}) => {
  const t = TRANSLATIONS[settings.language];
  const isLight = themeMode === 'light';
  const catMap = useMemo(() => new Map<string, Category>(categories.map((c) => [c.id, c])), [categories]);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | TransactionType>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>(''); // YYYY-MM

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type filter
      if (typeFilter !== 'ALL' && tx.type !== typeFilter) {
        return false;
      }
      // Month filter
      if (selectedMonth && !tx.date.startsWith(selectedMonth)) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const cat = catMap.get(tx.categoryId);
        const catNameEn = cat?.nameEn?.toLowerCase() || '';
        const catNameBn = cat?.nameBn?.toLowerCase() || '';
        const note = tx.note?.toLowerCase() || '';
        const payment = tx.paymentMethod.toLowerCase();
        const amountStr = tx.amount.toString();

        const matches =
          note.includes(query) ||
          catNameEn.includes(query) ||
          catNameBn.includes(query) ||
          payment.includes(query) ||
          amountStr.includes(query);

        if (!matches) return false;
      }
      return true;
    });
  }, [transactions, typeFilter, selectedMonth, searchQuery, catMap]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: { date: string; items: Transaction[]; dailyExpense: number; dailyIncome: number }[] = [];
    const dateMap = new Map<string, Transaction[]>();

    for (const tx of filteredTransactions) {
      if (!dateMap.has(tx.date)) {
        dateMap.set(tx.date, []);
      }
      dateMap.get(tx.date)!.push(tx);
    }

    dateMap.forEach((items, date) => {
      let dailyExpense = 0;
      let dailyIncome = 0;
      for (const item of items) {
        if (item.type === 'EXPENSE') dailyExpense += item.amount;
        else if (item.type === 'INCOME') dailyIncome += item.amount;
      }
      groups.push({ date, items, dailyExpense, dailyIncome });
    });

    return groups.sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredTransactions]);

  // Total summary of filtered results
  const filteredTotals = useMemo(() => {
    let inc = 0;
    let exp = 0;
    let sav = 0;
    for (const tx of filteredTransactions) {
      if (tx.type === 'INCOME') inc += tx.amount;
      else if (tx.type === 'EXPENSE') exp += tx.amount;
      else if (tx.type === 'SAVINGS') sav += tx.amount;
    }
    return { inc, exp, sav, count: filteredTransactions.length };
  }, [filteredTransactions]);

  return (
    <div className="space-y-4 pb-6">
      {/* Header Search & Filter */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search
            className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
              isLight ? 'text-[#87789D]' : 'text-[#84789A]'
            }`}
          />
          <input
            type="text"
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-xs outline-none transition-colors ${
              isLight
                ? 'bg-[#FFFFFF] border-[#E5DBF0] focus:border-[#7C3AED] text-[#160F24] placeholder-[#8F81A5]'
                : 'bg-[#130E1F] border-[#261A3B] focus:border-[#8B5CF6] text-white placeholder-[#584972]'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs cursor-pointer ${
                isLight ? 'text-[#695B7E] hover:text-[#160F24]' : 'text-[#948BA5] hover:text-white'
              }`}
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Tabs: All, Expense (Orange), Income (Now Purple), Savings (Now Pink) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors cursor-pointer ${
              typeFilter === 'ALL'
                ? isLight
                  ? 'bg-[#F8EBFD] border border-[#D946EF] text-[#D946EF]'
                  : 'bg-[#29173A] border border-[#D946EF] text-[#D946EF]'
                : isLight
                ? 'bg-[#FFFFFF] border border-[#E8DEF2] text-[#695B7E] hover:text-[#160F24]'
                : 'bg-[#140E1E] border border-[#231737] text-[#948BA5] hover:text-white'
            }`}
          >
            {t.all} ({transactions.length})
          </button>

          <button
            onClick={() => setTypeFilter('EXPENSE')}
            className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors cursor-pointer ${
              typeFilter === 'EXPENSE'
                ? isLight
                  ? 'bg-[#FDF1EB] border border-[#F97316] text-[#EA580C]'
                  : 'bg-[#351A18] border border-[#F97316] text-[#FB923C]'
                : isLight
                ? 'bg-[#FFFFFF] border border-[#E8DEF2] text-[#695B7E] hover:text-[#160F24]'
                : 'bg-[#140E1E] border border-[#231737] text-[#948BA5] hover:text-white'
            }`}
          >
            {t.expense}
          </button>

          {/* Income Tab (Swapped: Now Purple) */}
          <button
            onClick={() => setTypeFilter('INCOME')}
            className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors cursor-pointer ${
              typeFilter === 'INCOME'
                ? isLight
                  ? 'bg-[#F0E6FC] border border-[#8B5CF6] text-[#7C3AED]'
                  : 'bg-[#21163A] border border-[#8B5CF6] text-[#8B5CF6]'
                : isLight
                ? 'bg-[#FFFFFF] border border-[#E8DEF2] text-[#695B7E] hover:text-[#160F24]'
                : 'bg-[#140E1E] border border-[#231737] text-[#948BA5] hover:text-white'
            }`}
          >
            {t.income}
          </button>

          {/* Savings Tab (Swapped: Now Pink) */}
          <button
            onClick={() => setTypeFilter('SAVINGS')}
            className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors cursor-pointer ${
              typeFilter === 'SAVINGS'
                ? isLight
                  ? 'bg-[#F8EBFD] border border-[#D946EF] text-[#D946EF]'
                  : 'bg-[#29173A] border border-[#D946EF] text-[#E879F9]'
                : isLight
                ? 'bg-[#FFFFFF] border border-[#E8DEF2] text-[#695B7E] hover:text-[#160F24]'
                : 'bg-[#140E1E] border border-[#231737] text-[#948BA5] hover:text-white'
            }`}
          >
            {t.savings}
          </button>
        </div>

        {/* Filter Summary Banner */}
        <div
          className={`flex items-center justify-between px-3 py-2 rounded-lg border text-[11px] font-mono transition-colors ${
            isLight
              ? 'bg-[#FFFFFF] border-[#E6DDF2] text-[#695B7E]'
              : 'bg-[#140E1E] border-[#211736] text-[#948BA5]'
          }`}
        >
          <span>
            {settings.language === 'bn' ? 'মোট রেকর্ড:' : 'Total Records:'}{' '}
            <strong className={isLight ? 'text-[#160F24]' : 'text-white'}>
              {filteredTotals.count}
            </strong>
          </span>
          <div className="flex items-center gap-3 font-bold">
            {filteredTotals.inc > 0 && (
              <span className={isLight ? 'text-[#7C3AED]' : 'text-[#8B5CF6]'}>
                +{formatCurrency(filteredTotals.inc, settings.currencySymbol, settings.useBengaliNumerals)}
              </span>
            )}
            {filteredTotals.exp > 0 && (
              <span className={isLight ? 'text-[#EA580C]' : 'text-[#F97316]'}>
                -{formatCurrency(filteredTotals.exp, settings.currencySymbol, settings.useBengaliNumerals)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Transactions List */}
      {groupedByDate.length === 0 ? (
        <div className="luxury-card rounded-2xl p-8 text-center my-6 transition-colors">
          <p
            className={`text-xs mb-4 ${
              isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
            }`}
          >
            {searchQuery
              ? settings.language === 'bn'
                ? 'কোনো লেনদেন খুঁজে পাওয়া যায়নি।'
                : 'No transactions found matching your search.'
              : t.noTransactionsYet}
          </p>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] font-bold text-xs text-white shadow-md inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addTransaction}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByDate.map((group) => (
            <div key={group.date} className="space-y-1.5">
              {/* Date Header (Swapped: Calendar icon now Pink) */}
              <div className="flex items-center justify-between px-1 text-xs">
                <span
                  className={`font-bold flex items-center gap-1.5 ${
                    isLight ? 'text-[#160F24]' : 'text-[#E5E0EE]'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-[#D946EF]" />
                  {formatFriendlyDate(group.date, settings.language)}
                </span>
                <div className="flex items-center gap-2 text-[11px] font-mono font-bold">
                  {group.dailyIncome > 0 && (
                    <span className={isLight ? 'text-[#7C3AED]' : 'text-[#8B5CF6]'}>
                      +{formatCurrency(group.dailyIncome, settings.currencySymbol, settings.useBengaliNumerals)}
                    </span>
                  )}
                  {group.dailyExpense > 0 && (
                    <span className={isLight ? 'text-[#EA580C]' : 'text-[#F97316]'}>
                      -{formatCurrency(group.dailyExpense, settings.currencySymbol, settings.useBengaliNumerals)}
                    </span>
                  )}
                </div>
              </div>

              {/* Transactions on this date */}
              <div className="space-y-1.5">
                {group.items.map((tx) => {
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
                      className={`luxury-card rounded-xl p-3 flex items-center justify-between gap-3 transition-colors cursor-pointer group active:scale-[0.99] ${
                        isLight ? 'hover:border-[#DECFF2]' : 'hover:border-[#38265B]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: `${cat.colorHex}22`,
                            border: `1px solid ${cat.colorHex}44`,
                          }}
                        >
                          <CategoryIcon name={cat.icon} size={16} color={cat.colorHex} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-xs sm:text-sm font-semibold truncate group-hover:text-[#7C3AED] dark:group-hover:text-[#8B5CF6] transition-colors ${
                                isLight ? 'text-[#160F24]' : 'text-white'
                              }`}
                            >
                              {settings.language === 'bn' ? cat.nameBn : cat.nameEn}
                            </span>
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                                isLight
                                  ? 'bg-[#F6EFFB] border-[#DECFF2] text-[#695B7E]'
                                  : 'bg-[#1C142B] border-[#2D1F45] text-[#948BA5]'
                              }`}
                            >
                              {tx.paymentMethod}
                            </span>
                          </div>

                          <div
                            className={`flex items-center gap-2 text-[11px] mt-0.5 truncate ${
                              isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
                            }`}
                          >
                            <span className="font-mono">{tx.time}</span>
                            {tx.note && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span
                                  className={`truncate ${
                                    isLight ? 'text-[#4A3B60]' : 'text-[#C3BBD0]'
                                  }`}
                                >
                                  {tx.note}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <div className={`text-xs sm:text-sm font-bold ${amountColor}`}>
                            {isIncome ? '+ ' : isSavings ? '' : '- '}
                            {formatCurrency(tx.amount, settings.currencySymbol, settings.useBengaliNumerals)}
                          </div>
                          <span
                            className={`text-[9px] font-mono uppercase block ${
                              isLight ? 'text-[#8E80A2]' : 'text-[#6A5E82]'
                            }`}
                          >
                            {isIncome ? t.income : isSavings ? t.savings : t.expense}
                          </span>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 transition-colors ${
                            isLight
                              ? 'text-[#9B8DAE] group-hover:text-[#160F24]'
                              : 'text-[#5D5174] group-hover:text-white'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
