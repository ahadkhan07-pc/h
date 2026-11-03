import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Trash2,
  Calendar,
  Clock,
  Plus,
} from 'lucide-react';
import {
  AppSettings,
  Category,
  PaymentMethod,
  ThemeMode,
  Transaction,
  TransactionType,
} from '../types/hisab';
import { TRANSLATIONS } from '../utils/translations';
import { CategoryIcon } from './CategoryIcon';

interface AddTransactionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (txData: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onUpdate?: (tx: Transaction) => void;
  onDelete?: (id: string) => void;
  editingTransaction?: Transaction | null;
  categories: Category[];
  settings: AppSettings;
  themeMode: ThemeMode;
  initialType?: TransactionType;
  initialCategoryId?: string;
}

export const AddTransactionSheet: React.FC<AddTransactionSheetProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  editingTransaction,
  categories,
  settings,
  themeMode,
  initialType = 'EXPENSE',
  initialCategoryId,
}) => {
  const t = TRANSLATIONS[settings.language];
  const isLight = themeMode === 'light';

  // Form State
  const [type, setType] = useState<TransactionType>(initialType);
  const [amountStr, setAmountStr] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // Sync state when editing or opening
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmountStr(editingTransaction.amount.toString());
      setCategoryId(editingTransaction.categoryId);
      setPaymentMethod(editingTransaction.paymentMethod);
      setDate(editingTransaction.date);
      setTime(editingTransaction.time || '12:00');
      setNote(editingTransaction.note || '');
    } else {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const curHours = String(now.getHours()).padStart(2, '0');
      const curMins = String(now.getMinutes()).padStart(2, '0');

      setType(initialType);
      setAmountStr('');
      setPaymentMethod('CASH');
      setDate(`${y}-${m}-${d}`);
      setTime(`${curHours}:${curMins}`);
      setNote('');

      // Auto-select initial category
      if (initialCategoryId) {
        setCategoryId(initialCategoryId);
      } else {
        const firstMatching = categories.find((c) => c.type === initialType);
        if (firstMatching) setCategoryId(firstMatching.id);
      }
    }
    setShowDeleteConfirm(false);
  }, [editingTransaction, isOpen, initialType, initialCategoryId, categories]);

  if (!isOpen) return null;

  // Filter categories for the current transaction type
  const filteredCategories = categories.filter((c) => c.type === type);

  // When switching type, automatically adjust category if current selection doesn't match
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const matchingCat = categories.find((c) => c.type === newType);
    if (matchingCat) {
      setCategoryId(matchingCat.id);
    }
  };

  const handleQuickAddAmount = (addValue: number) => {
    const current = parseFloat(amountStr) || 0;
    setAmountStr((current + addValue).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amountStr);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    if (editingTransaction && onUpdate) {
      onUpdate({
        ...editingTransaction,
        amount: parsedAmount,
        type,
        categoryId: categoryId || filteredCategories[0]?.id || 'other',
        paymentMethod,
        date,
        time,
        note: note.trim(),
      });
    } else {
      onSave({
        amount: parsedAmount,
        type,
        categoryId: categoryId || filteredCategories[0]?.id || 'other',
        paymentMethod,
        date,
        time,
        note: note.trim(),
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (editingTransaction && onDelete) {
      onDelete(editingTransaction.id);
      onClose();
    }
  };

  const paymentOptions: { id: PaymentMethod; label: string }[] = [
    { id: 'CASH', label: t.cash },
    { id: 'BKASH', label: t.bkash },
    { id: 'NAGAD', label: t.nagad },
    { id: 'BANK', label: t.bank },
    { id: 'CARD', label: t.card },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div
        className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl transition-colors ${
          isLight
            ? 'bg-[#FFFFFF] border border-[#DECFF2] text-[#160F24]'
            : 'bg-[#110B1B] border border-[#2B1D42] text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`px-5 py-3.5 border-b flex items-center justify-between shrink-0 transition-colors ${
            isLight ? 'border-[#EAE2F3]' : 'border-[#231738]'
          }`}
        >
          <div className="flex items-center gap-2">
            {/* Swapped: Income is Purple, Savings is Pink */}
            <div
              className={`w-3 h-3 rounded-full ${
                type === 'INCOME'
                  ? 'bg-[#7C3AED] dark:bg-[#8B5CF6]'
                  : type === 'SAVINGS'
                  ? 'bg-[#D946EF]'
                  : 'bg-[#F97316]'
              }`}
            />
            <h2
              className={`text-base font-bold tracking-tight ${
                isLight ? 'text-[#160F24]' : 'text-white'
              }`}
            >
              {editingTransaction ? t.editTransaction : t.addTransaction}
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* 1. Transaction Type Segmented Bar (Swapped: Income is Purple, Savings is Pink) */}
          <div
            className={`grid grid-cols-3 gap-1.5 p-1 rounded-xl border ${
              isLight ? 'bg-[#F6EFFB] border-[#DECFF2]' : 'bg-[#170F25] border-[#271A3F]'
            }`}
          >
            <button
              type="button"
              onClick={() => handleTypeChange('EXPENSE')}
              className={`py-2 rounded-lg font-bold transition-all text-center cursor-pointer ${
                type === 'EXPENSE'
                  ? 'bg-[#F97316] text-white shadow-sm'
                  : isLight
                  ? 'text-[#695B7E] hover:text-[#160F24]'
                  : 'text-[#948BA5] hover:text-white'
              }`}
            >
              {t.expense}
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('INCOME')}
              className={`py-2 rounded-lg font-bold transition-all text-center cursor-pointer ${
                type === 'INCOME'
                  ? 'bg-[#7C3AED] dark:bg-[#8B5CF6] text-white shadow-sm'
                  : isLight
                  ? 'text-[#695B7E] hover:text-[#160F24]'
                  : 'text-[#948BA5] hover:text-white'
              }`}
            >
              {t.income}
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('SAVINGS')}
              className={`py-2 rounded-lg font-bold transition-all text-center cursor-pointer ${
                type === 'SAVINGS'
                  ? 'bg-[#D946EF] text-white shadow-sm'
                  : isLight
                  ? 'text-[#695B7E] hover:text-[#160F24]'
                  : 'text-[#948BA5] hover:text-white'
              }`}
            >
              {t.savings}
            </button>
          </div>

          {/* 2. Amount Input & Quick Chips (Swapped: Currency symbol is Pink, Chips are Purple) */}
          <div>
            <label
              className={`block text-[11px] font-mono uppercase mb-1.5 ${
                isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
              }`}
            >
              {t.amount} ({settings.currencySymbol})
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-[#D946EF]">
                {settings.currencySymbol}
              </span>
              <input
                type="number"
                step="any"
                required
                min="0.01"
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                autoFocus={!editingTransaction}
                className={`w-full pl-11 pr-4 py-3 border focus:border-[#7C3AED] dark:focus:border-[#8B5CF6] rounded-xl text-2xl font-extrabold outline-none transition-colors ${
                  isLight
                    ? 'bg-[#FAF6FE] border-[#DECFF2] text-[#160F24] placeholder-[#A093B3]'
                    : 'bg-[#170F25] border-[#2A1D43] text-white placeholder-[#4D3F65]'
                }`}
              />
            </div>

            {/* Quick Add Increment Buttons (Swapped: Now Purple) */}
            <div className="flex items-center gap-1.5 mt-2">
              {[100, 500, 1000, 5000].map((inc) => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => handleQuickAddAmount(inc)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono text-[#7C3AED] dark:text-[#8B5CF6] font-bold transition-colors cursor-pointer ${
                    isLight
                      ? 'bg-[#F0E6FC] hover:bg-[#EAE0F9] border-[#DECFF2]'
                      : 'bg-[#1D132D] hover:bg-[#28183F] border-[#382357]'
                  }`}
                >
                  +{inc}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Category Selector Grid (Swapped: Selected border is now Purple) */}
          <div>
            <label
              className={`block text-[11px] font-mono uppercase mb-1.5 ${
                isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
              }`}
            >
              {t.category}
            </label>
            <div
              className={`grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 rounded-xl border ${
                isLight ? 'bg-[#FAF7FE] border-[#EAE2F3]' : 'bg-[#150E22] border-[#25193B]'
              }`}
            >
              {filteredCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex flex-col items-center p-2 rounded-xl text-center transition-all cursor-pointer ${
                      isSelected
                        ? isLight
                          ? 'bg-[#FFFFFF] border-2 border-[#7C3AED] text-[#160F24] shadow-xs'
                          : 'bg-[#21163A] border-2 border-[#8B5CF6] text-white shadow-sm'
                        : isLight
                        ? 'bg-[#FFFFFF] border border-[#E8DEF2] text-[#695B7E] hover:text-[#160F24]'
                        : 'bg-[#191128] border border-[#26193E] text-[#948BA5] hover:text-white'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center mb-1"
                      style={{
                        backgroundColor: `${cat.colorHex}22`,
                        border: `1px solid ${cat.colorHex}55`,
                      }}
                    >
                      <CategoryIcon name={cat.icon} size={15} color={cat.colorHex} />
                    </div>
                    <span className="text-[11px] font-semibold truncate w-full">
                      {settings.language === 'bn' ? cat.nameBn : cat.nameEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Payment Method (Swapped: Selected is now Pink) */}
          <div>
            <label
              className={`block text-[11px] font-mono uppercase mb-1.5 ${
                isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
              }`}
            >
              {t.paymentMethod}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {paymentOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPaymentMethod(opt.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    paymentMethod === opt.id
                      ? isLight
                        ? 'bg-[#F8EBFD] border border-[#D946EF] text-[#D946EF]'
                        : 'bg-[#29173A] border border-[#D946EF] text-white'
                      : isLight
                      ? 'bg-[#FAF6FE] border border-[#E8DEF2] text-[#695B7E] hover:text-[#160F24]'
                      : 'bg-[#170F25] border border-[#271B3E] text-[#948BA5] hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Date & Time */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label
                className={`block text-[11px] font-mono uppercase mb-1.5 ${
                  isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
                }`}
              >
                {t.date}
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full px-3 py-2 border focus:border-[#7C3AED] dark:focus:border-[#8B5CF6] rounded-xl text-xs outline-none ${
                    isLight
                      ? 'bg-[#FAF6FE] border-[#DECFF2] text-[#160F24]'
                      : 'bg-[#170F25] border-[#271B3E] text-white'
                  }`}
                />
              </div>
            </div>

            <div>
              <label
                className={`block text-[11px] font-mono uppercase mb-1.5 ${
                  isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
                }`}
              >
                {t.time}
              </label>
              <div className="relative">
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={`w-full px-3 py-2 border focus:border-[#7C3AED] dark:focus:border-[#8B5CF6] rounded-xl text-xs outline-none ${
                    isLight
                      ? 'bg-[#FAF6FE] border-[#DECFF2] text-[#160F24]'
                      : 'bg-[#170F25] border-[#271B3E] text-white'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* 6. Description / Note */}
          <div>
            <label
              className={`block text-[11px] font-mono uppercase mb-1.5 ${
                isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
              }`}
            >
              {t.note}
            </label>
            <input
              type="text"
              placeholder={t.notePlaceholder}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={`w-full px-3.5 py-2.5 border focus:border-[#7C3AED] dark:focus:border-[#8B5CF6] rounded-xl text-xs outline-none transition-colors ${
                isLight
                  ? 'bg-[#FAF6FE] border-[#DECFF2] text-[#160F24] placeholder-[#9A8DAE]'
                  : 'bg-[#170F25] border-[#271B3E] text-white placeholder-[#514368]'
              }`}
            />
          </div>

          {/* Delete Confirm Warning Box */}
          {showDeleteConfirm && (
            <div className="p-3 rounded-xl bg-[#2A111A] border border-[#521C2B] text-xs">
              <p className="text-[#FB7185] font-medium mb-2">{t.confirmDelete}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1.5 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold cursor-pointer"
                >
                  {t.delete}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer ${
                    isLight ? 'bg-[#EDE4F5] text-[#160F24]' : 'bg-[#1E142F] text-[#948BA5] hover:text-white'
                  }`}
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          )}

          {/* Footer Submit / Delete Buttons (Swapped: Submit is now Purple) */}
          <div className="pt-2 flex items-center gap-2">
            {editingTransaction && !showDeleteConfirm && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-[#FFF5F6] hover:bg-[#FFEAEB] border-[#FBD2D6] text-[#E11D48]'
                    : 'bg-[#221019] hover:bg-[#321323] border-[#431B2C] text-[#FB7185]'
                }`}
                title={t.deleteTransaction}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.99] font-bold text-xs text-white shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{editingTransaction ? t.update : t.save}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
