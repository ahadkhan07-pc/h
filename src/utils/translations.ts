import { Language, Currency } from '../types/hisab';

export const TRANSLATIONS = {
  en: {
    appName: 'My Daily Hisab',
    appTagline: 'Luxury Daily Finance & Room Ledger',
    home: 'Home',
    transactions: 'Transactions',
    reports: 'Reports',
    categories: 'Categories',
    settings: 'Settings',
    androidProject: 'Android Project & APK',
    
    // Balance cards
    totalBalance: 'Net Balance',
    dailyIncome: 'Daily Income',
    dailyExpense: 'Daily Expense',
    dailySavings: 'Daily Savings',
    thisMonthSummary: 'This Month Overview',
    todayHisab: "Today's Ledger",
    todayIncome: "Today's Income",
    todayExpense: "Today's Expense",
    todaySavings: "Today's Savings",
    
    // Actions
    addTransaction: 'Add Record',
    quickAdd: 'Quick Add',
    editTransaction: 'Edit Transaction',
    deleteTransaction: 'Delete Transaction',
    confirmDelete: 'Are you sure you want to delete this record? This action cannot be undone.',
    cancel: 'Cancel',
    save: 'Save Record',
    update: 'Update Record',
    delete: 'Delete',
    filter: 'Filter',
    search: 'Search transactions...',
    all: 'All',
    income: 'Income',
    expense: 'Expense',
    savings: 'Savings',
    export: 'Export',
    import: 'Import',
    backup: 'Backup & Restore',
    downloadApk: 'Download Debug APK',
    downloadSource: 'Download Android Studio Project (.zip)',
    
    // Form fields
    amount: 'Amount',
    type: 'Transaction Type',
    category: 'Category',
    date: 'Date',
    time: 'Time',
    paymentMethod: 'Payment Method',
    note: 'Note / Description (Optional)',
    notePlaceholder: 'e.g. Grocery bazaar, Electric bill, Freelance client...',
    selectCategory: 'Select Category',
    selectDate: 'Select Date',
    
    // Payment methods
    cash: 'Cash',
    bkash: 'bKash',
    nagad: 'Nagad',
    bank: 'Bank Transfer',
    card: 'Debit / Credit Card',
    other: 'Other Method',
    
    // Reports
    monthlyReport: 'Monthly Report',
    selectMonth: 'Select Month',
    totalSpent: 'Total Expenses',
    totalEarned: 'Total Earnings',
    netSavingsRate: 'Savings Rate',
    dailySpendingTrend: 'Daily Spending Trend',
    categoryDistribution: 'Spending by Category',
    noDataForMonth: 'No transactions recorded for this month.',
    noTransactionsYet: 'No transactions yet. Tap the button below to add your first daily hisab!',
    highestSpend: 'Largest Expense',
    averageDaily: 'Average Daily Spend',
    
    // Categories management
    manageCategories: 'Category Manager',
    addCategory: 'New Category',
    editCategory: 'Edit Category',
    categoryNameEn: 'English Name',
    categoryNameBn: 'Bengali Name',
    categoryColor: 'Accent Color',
    categoryIcon: 'Icon',
    deleteCategoryConfirm: 'Delete this category? Associated transactions will remain.',
    cannotDeleteDefault: 'Default categories cannot be deleted.',
    
    // Settings & Backup
    preferences: 'Preferences',
    themeMode: 'Theme Mode',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    language: 'Language',
    bengali: 'বাংলা (Bengali)',
    english: 'English',
    currency: 'Currency Symbol',
    bengaliDigits: 'Bengali Numerals (১২৩৪...)',
    backupData: 'Data Backup (Room JSON)',
    exportBackup: 'Export Full Backup',
    importBackup: 'Restore from File',
    resetAllData: 'Factory Reset All Data',
    resetConfirm: 'WARNING: This will erase all your transactions and restore defaults. Are you sure?',
    backupSuccess: 'Backup exported successfully!',
    restoreSuccess: 'Data restored successfully from backup!',
    restoreError: 'Invalid backup file format.',
    
    // Device preview
    togglePhoneFrame: 'Redmi Note 14 Pro Frame',
    fullScreen: 'Responsive View',
    roomDbStatus: 'Offline Room Database Ready (SQLite / IndexedDB)',
    
    // Android specific
    nativeAndroidDesc: 'Complete Native Android Project (Kotlin + Jetpack Compose + Material3 + Room). Supports Android 10 (API 29) to Android 16 (API 36).',
    minSdk: 'Min SDK: Android 10 (API 29)',
    targetSdk: 'Target SDK: Android 16 (API 36)',
    readyForPlayStore: 'Production Architecture: MVVM + Repository + Room Flow',
    testedDevices: 'Optimized for Redmi Note 14 Pro, Samsung Galaxy, Pixel',
  },
  bn: {
    appName: 'আমার দৈনিক হিসাব',
    appTagline: 'প্রিমিয়াম লাক্সারি দৈনিক হিসাব ও রুম লেজার',
    home: 'নীড়পাতা',
    transactions: 'লেনদেন',
    reports: 'প্রতিবেদন',
    categories: 'ক্যাটাগরি',
    settings: 'সেটিংস',
    androidProject: 'অ্যান্ড্রয়েড প্রজেক্ট ও APK',
    
    // Balance cards
    totalBalance: 'বর্তমান মোট স্থিতি',
    dailyIncome: 'দৈনিক আয়',
    dailyExpense: 'দৈনিক ব্যয়',
    dailySavings: 'দৈনিক সঞ্চয়',
    thisMonthSummary: 'চলতি মাসের সারসংক্ষেপ',
    todayHisab: 'আজকের হিসাব',
    todayIncome: 'আজকের আয়',
    todayExpense: 'আজকের ব্যয়',
    todaySavings: 'আজকের সঞ্চয়',
    
    // Actions
    addTransaction: 'হিসাব যোগ করুন',
    quickAdd: 'দ্রুত যোগ',
    editTransaction: 'হিসাব সম্পাদন',
    deleteTransaction: 'হিসাব মুছুন',
    confirmDelete: 'আপনি কি নিশ্চিত যে এই রেকর্ডটি মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না।',
    cancel: 'বাতিল',
    save: 'সংরক্ষণ করুন',
    update: 'আপডেট করুন',
    delete: 'মুছুন',
    filter: 'ফিল্টার',
    search: 'হিসাব বা নোট খুঁজুন...',
    all: 'সকল',
    income: 'আয়',
    expense: 'ব্যয়',
    savings: 'সঞ্চয়',
    export: 'এক্সপোর্ট',
    import: 'ইমপোর্ট',
    backup: 'ব্যাকআপ ও রিস্টোর',
    downloadApk: 'টেস্ট APK ডাউনলোড',
    downloadSource: 'অ্যান্ড্রয়েড স্টুডিও প্রজেক্ট (.zip)',
    
    // Form fields
    amount: 'টাকার পরিমাণ',
    type: 'লেনদেনের ধরন',
    category: 'ক্যাটাগরি বা খাত',
    date: 'তারিখ',
    time: 'সময়',
    paymentMethod: 'লেনদেনের মাধ্যম',
    note: 'বিবরণ / নোট (ঐচ্ছিক)',
    notePlaceholder: 'যেমন: বাজার খরচ, বিদ্যুৎ বিল, ফ্রিল্যান্সিং সম্মানী...',
    selectCategory: 'ক্যাটাগরি নির্বাচন করুন',
    selectDate: 'তারিখ বাছাই করুন',
    
    // Payment methods
    cash: 'নগদ ক্যাশ',
    bkash: 'বিকাশ (bKash)',
    nagad: 'নগদ (Nagad)',
    bank: 'ব্যাংক ট্রান্সফার',
    card: 'ডেবিট / ক্রেডিট কার্ড',
    other: 'অন্যান্য মাধ্যম',
    
    // Reports
    monthlyReport: 'মাসিক আর্থিক বিবরণী',
    selectMonth: 'মাস নির্বাচন',
    totalSpent: 'সর্বমোট ব্যয়',
    totalEarned: 'সর্বমোট আয়',
    netSavingsRate: 'সঞ্চয়ের হার',
    dailySpendingTrend: 'দৈনিক ব্যয়ের গ্রাফ',
    categoryDistribution: 'খাতভিত্তিক ব্যয়ের অনুপাত',
    noDataForMonth: 'এই মাসের জন্য কোনো লেনদেন রেকর্ড নেই।',
    noTransactionsYet: 'এখনও কোনো লেনদেনের হিসাব নেই। আপনার প্রথম হিসাব যোগ করতে নিচের বাটনে চাপুন!',
    highestSpend: 'সর্বোচ্চ একক ব্যয়',
    averageDaily: 'দৈনিক গড় ব্যয়',
    
    // Categories management
    manageCategories: 'ক্যাটাগরি ব্যবস্থাপনা',
    addCategory: 'নতুন ক্যাটাগরি',
    editCategory: 'ক্যাটাগরি সম্পাদনা',
    categoryNameEn: 'ইংরেজি নাম',
    categoryNameBn: 'বাংলা নাম',
    categoryColor: 'রং হাইলাইট',
    categoryIcon: 'আইকন',
    deleteCategoryConfirm: 'এই ক্যাটাগরিটি মুছে ফেলতে চান? এর অন্তর্ভুক্ত লেনদেনগুলো সংরক্ষিত থাকবে।',
    cannotDeleteDefault: 'ডিফল্ট ক্যাটাগরি মুছে ফেলা যাবে না।',
    
    // Settings & Backup
    preferences: 'পছন্দসমূহ',
    themeMode: 'থিম মুড',
    lightMode: 'লাইট মুড',
    darkMode: 'ডার্ক মুড',
    language: 'ভাষা (Language)',
    bengali: 'বাংলা (Bengali)',
    english: 'English',
    currency: 'মুদ্রা প্রতীক',
    bengaliDigits: 'বাংলা সংখ্যায় প্রদর্শন (১২৩৪...)',
    backupData: 'ডাটা ব্যাকআপ (Room JSON)',
    exportBackup: 'ব্যাকআপ ফাইল সংরক্ষণ',
    importBackup: 'ফাইল থেকে রিস্টোর',
    resetAllData: 'সব ডাটা রিসেট করুন',
    resetConfirm: 'সতর্কতা: এটি আপনার সব লেনদেন মুছে ফেলবে এবং প্রাথমিক অবস্থায় ফিরিয়ে নেবে। আপনি কি নিশ্চিত?',
    backupSuccess: 'সফলভাবে ব্যাকআপ ফাইল প্রস্তুত ও ডাউনলোড হয়েছে!',
    restoreSuccess: 'ব্যাকআপ ফাইল থেকে সফলভাবে সকল হিসাব রিস্টোর হয়েছে!',
    restoreError: 'অকার্যকর ব্যাকআপ ফাইল!',
    
    // Device preview
    togglePhoneFrame: 'রেডমি নোট ১৪ প্রো ফ্রেম',
    fullScreen: 'ফুল স্ক্রিন ভিউ',
    roomDbStatus: 'অফলাইন রুম ডাটাবেজ প্রস্তুত (SQLite / IndexedDB)',
    
    // Android specific
    nativeAndroidDesc: 'সম্পূর্ণ নেটিভ অ্যান্ড্রয়েড কোডবেস (Kotlin + Jetpack Compose + Room + Material3)। অ্যান্ড্রয়েড ১০ (API ২৯) থেকে অ্যান্ড্রয়েড ১৬ (API ৩৬) সাপোর্টেড।',
    minSdk: 'নূন্যতম ওএস: অ্যান্ড্রয়েড ১০ (API 29)',
    targetSdk: 'টার্গেট ওএস: অ্যান্ড্রয়েড ১৬ (API 36)',
    readyForPlayStore: 'আধুনিক আর্কিটেকচার: MVVM + Repository + Room Flow',
    testedDevices: 'রেডমি নোট ১৪ প্রো, স্যামসাং গ্যালাক্সি ও পিক্সেল ডিভাইসের জন্য অপ্টিমাইজড',
  }
};

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function formatNumber(
  num: number,
  useBengaliDigits: boolean = false,
  decimals: number = 0
): string {
  if (isNaN(num)) return useBengaliDigits ? '০' : '0';
  
  const formatted = decimals > 0 
    ? num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.round(num).toLocaleString('en-US');

  if (!useBengaliDigits) {
    return formatted;
  }

  return formatted.replace(/\d/g, (digit) => BENGALI_DIGITS[parseInt(digit, 10)] || digit);
}

export function formatCurrency(
  amount: number,
  currencySymbol: string = '৳',
  useBengaliDigits: boolean = false,
  showSign: boolean = false
): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const numStr = formatNumber(absAmount, useBengaliDigits);
  
  let sign = '';
  if (showSign) {
    sign = isNegative ? '- ' : '+ ';
  } else if (isNegative) {
    sign = '- ';
  }

  return `${sign}${currencySymbol} ${numStr}`;
}

export function formatFriendlyDate(
  dateIsoStr: string,
  lang: Language = 'en'
): string {
  if (!dateIsoStr) return '';
  const [yearStr, monthStr, dayStr] = dateIsoStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  
  const dateObj = new Date(year, month, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const compareDate = new Date(dateObj);
  compareDate.setHours(0, 0, 0, 0);

  if (compareDate.getTime() === today.getTime()) {
    return lang === 'bn' ? 'আজ' : 'Today';
  }
  if (compareDate.getTime() === yesterday.getTime()) {
    return lang === 'bn' ? 'গতকাল' : 'Yesterday';
  }

  if (lang === 'bn') {
    const bnMonths = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    return `${day} ${bnMonths[month]}, ${year}`;
  }

  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
