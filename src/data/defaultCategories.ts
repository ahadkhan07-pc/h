import { Category } from '../types/hisab';

/**
 * Pre-seeded default categories
 * Luxury palette: Purple, Magenta/Pink, and Orange accents (STRICTLY NO GREEN, NO GRADIENTS)
 * Pink and Purple accents swapped as requested.
 */
export const DEFAULT_CATEGORIES: Category[] = [
  // --- EXPENSE CATEGORIES ---
  {
    id: 'exp_food',
    nameEn: 'Food & Dining',
    nameBn: 'খাবার ও রেস্তোরাঁ',
    type: 'EXPENSE',
    icon: 'Utensils',
    colorHex: '#F97316', // Orange (unchanged)
    isDefault: true,
  },
  {
    id: 'exp_groceries',
    nameEn: 'Daily Bazar & Groceries',
    nameBn: 'দৈনিক বাজার ও সদাই',
    type: 'EXPENSE',
    icon: 'ShoppingBag',
    colorHex: '#EA580C', // Deep Orange (unchanged)
    isDefault: true,
  },
  {
    id: 'exp_transport',
    nameEn: 'Transport & Fuel',
    nameBn: 'যাতায়াত ও ভাড়া',
    type: 'EXPENSE',
    icon: 'Car',
    colorHex: '#8B5CF6', // Swapped: Purple
    isDefault: true,
  },
  {
    id: 'exp_housing',
    nameEn: 'House Rent & Bills',
    nameBn: 'বাড়ি ভাড়া ও বিল',
    type: 'EXPENSE',
    icon: 'Home',
    colorHex: '#D946EF', // Swapped: Pink
    isDefault: true,
  },
  {
    id: 'exp_shopping',
    nameEn: 'Shopping & Apparel',
    nameBn: 'কেনাকাটা ও পোশাক',
    type: 'EXPENSE',
    icon: 'Shirt',
    colorHex: '#A855F7', // Swapped: Royal Purple
    isDefault: true,
  },
  {
    id: 'exp_health',
    nameEn: 'Healthcare & Medicine',
    nameBn: 'চিকিৎসা ও ঔষধ',
    type: 'EXPENSE',
    icon: 'HeartPulse',
    colorHex: '#FB7185', // Rose/Coral (unchanged)
    isDefault: true,
  },
  {
    id: 'exp_education',
    nameEn: 'Education & Books',
    nameBn: 'পড়াশোনা ও বই',
    type: 'EXPENSE',
    icon: 'GraduationCap',
    colorHex: '#D946EF', // Swapped: Pink
    isDefault: true,
  },
  {
    id: 'exp_entertainment',
    nameEn: 'Entertainment & Outing',
    nameBn: 'বিনোদন ও ঘোরাঘুরি',
    type: 'EXPENSE',
    icon: 'Film',
    colorHex: '#FB923C', // Warm Orange (unchanged)
    isDefault: true,
  },
  {
    id: 'exp_family',
    nameEn: 'Family & Parents',
    nameBn: 'পরিবার ও উপহার',
    type: 'EXPENSE',
    icon: 'Users',
    colorHex: '#7C3AED', // Swapped: Velvet Purple
    isDefault: true,
  },
  {
    id: 'exp_other',
    nameEn: 'Other Expense',
    nameBn: 'অন্যান্য খরচ',
    type: 'EXPENSE',
    icon: 'MoreHorizontal',
    colorHex: '#E879F9', // Swapped: Light Pink
    isDefault: true,
  },

  // --- INCOME CATEGORIES ---
  {
    id: 'inc_salary',
    nameEn: 'Monthly Salary',
    nameBn: 'মাসিক বেতন',
    type: 'INCOME',
    icon: 'Briefcase',
    colorHex: '#7C3AED', // Swapped: Velvet Purple
    isDefault: true,
  },
  {
    id: 'inc_business',
    nameEn: 'Business Profit',
    nameBn: 'ব্যবসার লাভ',
    type: 'INCOME',
    icon: 'TrendingUp',
    colorHex: '#D946EF', // Swapped: Pink
    isDefault: true,
  },
  {
    id: 'inc_freelance',
    nameEn: 'Freelance & Projects',
    nameBn: 'ফ্রিল্যান্সিং ও প্রজেক্ট',
    type: 'INCOME',
    icon: 'Laptop',
    colorHex: '#F97316', // Orange (unchanged)
    isDefault: true,
  },
  {
    id: 'inc_investment',
    nameEn: 'Investment Returns',
    nameBn: 'বিনিয়োগের লভ্যাংশ',
    type: 'INCOME',
    icon: 'Coins',
    colorHex: '#8B5CF6', // Swapped: Purple
    isDefault: true,
  },
  {
    id: 'inc_gift',
    nameEn: 'Gifts & Bonus',
    nameBn: 'উপহার ও বোনাস',
    type: 'INCOME',
    icon: 'Gift',
    colorHex: '#FB923C', // Warm Orange (unchanged)
    isDefault: true,
  },
  {
    id: 'inc_other',
    nameEn: 'Other Income',
    nameBn: 'অন্যান্য আয়',
    type: 'INCOME',
    icon: 'PlusCircle',
    colorHex: '#E879F9', // Swapped: Light Pink
    isDefault: true,
  },

  // --- SAVINGS CATEGORIES ---
  {
    id: 'sav_emergency',
    nameEn: 'Emergency Fund',
    nameBn: 'জরুরি তহবিল',
    type: 'SAVINGS',
    icon: 'ShieldCheck',
    colorHex: '#D946EF', // Swapped: Pink
    isDefault: true,
  },
  {
    id: 'sav_bank_dps',
    nameEn: 'DPS & Fixed Deposit',
    nameBn: 'ডিপিএস ও ফিক্সড ডিপোজিট',
    type: 'SAVINGS',
    icon: 'Building2',
    colorHex: '#7C3AED', // Swapped: Velvet Purple
    isDefault: true,
  },
  {
    id: 'sav_gold_assets',
    nameEn: 'Gold & Long-term Asset',
    nameBn: 'স্বর্ণ ও স্থায়ী সম্পদ',
    type: 'SAVINGS',
    icon: 'Gem',
    colorHex: '#EA580C', // Deep Orange (unchanged)
    isDefault: true,
  },
  {
    id: 'sav_cash_reserve',
    nameEn: 'Cash Reserve / Safe',
    nameBn: 'নগদ জমা / ভল্ট',
    type: 'SAVINGS',
    icon: 'Wallet',
    colorHex: '#E879F9', // Swapped: Light Pink
    isDefault: true,
  },
];
