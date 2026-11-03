import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { AppSettings, Category, ThemeMode, TransactionType } from '../types/hisab';
import { TRANSLATIONS } from '../utils/translations';
import { AVAILABLE_ICONS, CategoryIcon } from './CategoryIcon';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  settings: AppSettings;
  themeMode: ThemeMode;
  onAddCategory: (cat: Omit<Category, 'id'>) => void;
  onUpdateCategory: (cat: Category) => void;
  onDeleteCategory: (id: string) => boolean;
}

// STRICTLY NO GREEN, NO GRADIENTS - Swapped: Purple first, then Pink and Orange tones
const LUXURY_PALETTE = [
  '#7C3AED', // Velvet Purple
  '#8B5CF6', // Purple
  '#A855F7', // Royal Purple
  '#D946EF', // Magenta/Pink
  '#C026D3', // Dark Magenta/Pink
  '#E879F9', // Light Magenta/Pink
  '#F97316', // Orange (unchanged)
  '#EA580C', // Deep Orange (unchanged)
  '#FB923C', // Warm Orange (unchanged)
  '#FB7185', // Rose (unchanged)
  '#F59E0B', // Amber (unchanged)
];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  settings,
  themeMode,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const t = TRANSLATIONS[settings.language];
  const isLight = themeMode === 'light';

  const [activeTab, setActiveTab] = useState<TransactionType>('EXPENSE');
  const [isCreating, setIsCreating] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  // Form State
  const [nameEn, setNameEn] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Tag');
  const [selectedColor, setSelectedColor] = useState(LUXURY_PALETTE[0]);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === activeTab);

  const startCreate = () => {
    setNameEn('');
    setNameBn('');
    setSelectedIcon('Tag');
    // Swapped: Income is now Purple, Savings is now Pink
    setSelectedColor(activeTab === 'INCOME' ? '#7C3AED' : activeTab === 'SAVINGS' ? '#D946EF' : '#F97316');
    setEditingCatId(null);
    setIsCreating(true);
    setErrorMsg('');
  };

  const startEdit = (cat: Category) => {
    setNameEn(cat.nameEn);
    setNameBn(cat.nameBn);
    setSelectedIcon(cat.icon);
    setSelectedColor(cat.colorHex);
    setEditingCatId(cat.id);
    setIsCreating(true);
    setErrorMsg('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() && !nameBn.trim()) {
      setErrorMsg('Please provide a category name.');
      return;
    }

    if (editingCatId) {
      const existing = categories.find((c) => c.id === editingCatId);
      if (existing) {
        onUpdateCategory({
          ...existing,
          nameEn: nameEn.trim() || nameBn.trim(),
          nameBn: nameBn.trim() || nameEn.trim(),
          icon: selectedIcon,
          colorHex: selectedColor,
        });
      }
    } else {
      onAddCategory({
        nameEn: nameEn.trim() || nameBn.trim(),
        nameBn: nameBn.trim() || nameEn.trim(),
        type: activeTab,
        icon: selectedIcon,
        colorHex: selectedColor,
        isDefault: false,
      });
    }

    setIsCreating(false);
    setEditingCatId(null);
  };

  const handleDelete = (id: string) => {
    const success = onDeleteCategory(id);
    if (!success) {
      alert(t.cannotDeleteDefault);
    }
  };

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
        {/* Header (Swapped: Indicator dot is now Pink) */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between shrink-0 transition-colors ${
            isLight ? 'border-[#EAE2F3]' : 'border-[#231738]'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#D946EF]" />
            <h2
              className={`text-base font-bold tracking-tight ${
                isLight ? 'text-[#160F24]' : 'text-white'
              }`}
            >
              {t.manageCategories}
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

        {/* Tab switch: Expense (Orange), Income (Now Purple), Savings (Now Pink) */}
        <div
          className={`px-5 pt-3 pb-1 border-b shrink-0 ${
            isLight ? 'border-[#EAE2F3]' : 'border-[#1E142F]'
          }`}
        >
          <div
            className={`grid grid-cols-3 gap-1.5 p-1 rounded-xl border text-xs ${
              isLight ? 'bg-[#F6EFFB] border-[#DECFF2]' : 'bg-[#170F25] border-[#271A3F]'
            }`}
          >
            <button
              onClick={() => {
                setActiveTab('EXPENSE');
                setIsCreating(false);
              }}
              className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'EXPENSE'
                  ? 'bg-[#F97316] text-white shadow-sm'
                  : isLight
                  ? 'text-[#695B7E] hover:text-[#160F24]'
                  : 'text-[#948BA5] hover:text-white'
              }`}
            >
              {t.expense}
            </button>
            <button
              onClick={() => {
                setActiveTab('INCOME');
                setIsCreating(false);
              }}
              className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'INCOME'
                  ? 'bg-[#7C3AED] dark:bg-[#8B5CF6] text-white shadow-sm'
                  : isLight
                  ? 'text-[#695B7E] hover:text-[#160F24]'
                  : 'text-[#948BA5] hover:text-white'
              }`}
            >
              {t.income}
            </button>
            <button
              onClick={() => {
                setActiveTab('SAVINGS');
                setIsCreating(false);
              }}
              className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'SAVINGS'
                  ? 'bg-[#D946EF] text-white shadow-sm'
                  : isLight
                  ? 'text-[#695B7E] hover:text-[#160F24]'
                  : 'text-[#948BA5] hover:text-white'
              }`}
            >
              {t.savings}
            </button>
          </div>
        </div>

        {/* Body content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* If creating/editing */}
          {isCreating ? (
            <form
              onSubmit={handleSave}
              className={`space-y-3.5 p-4 rounded-2xl border transition-colors ${
                isLight
                  ? 'bg-[#FAF6FE] border-[#DECFF2]'
                  : 'bg-[#160E23] border-[#2C1D45]'
              }`}
            >
              <div
                className={`flex items-center justify-between pb-1 border-b ${
                  isLight ? 'border-[#EAE2F3]' : 'border-[#25173B]'
                }`}
              >
                <h3 className={`font-bold ${isLight ? 'text-[#160F24]' : 'text-white'}`}>
                  {editingCatId ? t.editCategory : t.addCategory}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className={`text-xs cursor-pointer ${
                    isLight ? 'text-[#695B7E] hover:text-[#160F24]' : 'text-[#948BA5] hover:text-white'
                  }`}
                >
                  {t.cancel}
                </button>
              </div>

              {errorMsg && <p className="text-[#FB7185] font-medium">{errorMsg}</p>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label
                    className={`block text-[11px] font-mono mb-1 ${
                      isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
                    }`}
                  >
                    {t.categoryNameEn}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Electricity Bill"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-xl outline-none focus:border-[#7C3AED] dark:focus:border-[#8B5CF6] ${
                      isLight
                        ? 'bg-[#FFFFFF] border-[#DECFF2] text-[#160F24]'
                        : 'bg-[#1C122C] border-[#2E1E48] text-white'
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-[11px] font-mono mb-1 ${
                      isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
                    }`}
                  >
                    {t.categoryNameBn}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: বিদ্যুৎ বিল"
                    value={nameBn}
                    onChange={(e) => setNameBn(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-xl outline-none focus:border-[#7C3AED] dark:focus:border-[#8B5CF6] ${
                      isLight
                        ? 'bg-[#FFFFFF] border-[#DECFF2] text-[#160F24]'
                        : 'bg-[#1C122C] border-[#2E1E48] text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Color Picker (Strictly NO GREEN) */}
              <div>
                <label
                  className={`block text-[11px] font-mono mb-1.5 ${
                    isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
                  }`}
                >
                  {t.categoryColor} (No Green)
                </label>
                <div className="flex flex-wrap gap-2">
                  {LUXURY_PALETTE.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setSelectedColor(hex)}
                      className={`w-7 h-7 rounded-lg transition-transform cursor-pointer ${
                        selectedColor === hex
                          ? 'scale-110 ring-2 ring-[#D946EF] ring-offset-2'
                          : 'opacity-85 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Icon Picker (Swapped: Selected is now Purple) */}
              <div>
                <label
                  className={`block text-[11px] font-mono mb-1.5 ${
                    isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
                  }`}
                >
                  {t.categoryIcon}
                </label>
                <div
                  className={`grid grid-cols-7 gap-2 max-h-28 overflow-y-auto p-2 rounded-xl border ${
                    isLight ? 'bg-[#FFFFFF] border-[#DECFF2]' : 'bg-[#130B1E] border-[#241639]'
                  }`}
                >
                  {AVAILABLE_ICONS.map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setSelectedIcon(iconName)}
                      className={`p-2 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                        selectedIcon === iconName
                          ? isLight
                            ? 'bg-[#F0E6FC] text-[#7C3AED] border border-[#7C3AED]'
                            : 'bg-[#21163A] text-white border border-[#8B5CF6]'
                          : isLight
                          ? 'text-[#695B7E] hover:text-[#160F24] hover:bg-[#FAF6FE]'
                          : 'text-[#948BA5] hover:text-white hover:bg-[#1D112D]'
                      }`}
                    >
                      <CategoryIcon name={iconName} size={16} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className={`px-4 py-2 rounded-xl font-medium cursor-pointer ${
                    isLight ? 'bg-[#EDE4F5] text-[#160F24]' : 'bg-[#1C122C] text-[#948BA5] hover:text-white'
                  }`}
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold cursor-pointer"
                >
                  {t.save}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={startCreate}
              className={`w-full py-2.5 px-4 rounded-xl border border-dashed hover:border-[#7C3AED] dark:hover:border-[#8B5CF6] text-[#7C3AED] dark:text-[#8B5CF6] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                isLight ? 'border-[#D9CCE8] bg-[#FBF8FE]' : 'border-[#3D285E]'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{t.addCategory}</span>
            </button>
          )}

          {/* Existing Categories List */}
          <div className="space-y-2">
            {filteredCategories.map((cat) => (
              <div
                key={cat.id}
                className="luxury-card rounded-xl p-3 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${cat.colorHex}22`,
                      border: `1px solid ${cat.colorHex}55`,
                    }}
                  >
                    <CategoryIcon name={cat.icon} size={15} color={cat.colorHex} />
                  </div>

                  <div>
                    <span
                      className={`font-semibold block ${
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
                      {settings.language === 'bn' ? cat.nameEn : cat.nameBn}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {cat.isDefault ? (
                    <span
                      title="Default Category"
                      className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        isLight ? 'bg-[#F2ECF8] text-[#695B7E]' : 'bg-[#171024] text-[#948BA5]'
                      }`}
                    >
                      Default
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(cat)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isLight
                            ? 'text-[#695B7E] hover:text-[#160F24] hover:bg-[#F2ECF8]'
                            : 'text-[#948BA5] hover:text-white hover:bg-[#201533]'
                        }`}
                        title={t.editCategory}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 rounded-lg text-[#FB7185] hover:bg-[#2B101D] transition-colors cursor-pointer"
                        title={t.delete}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
