// Comprehensive translations for the entire app
export const translations = {
  // Navigation & General
  dashboard: { en: "Dashboard", ar: "لوحة التحكم" },
  challenges: { en: "Challenges", ar: "التحديات" },
  missions: { en: "Missions", ar: "المهام" },
  social: { en: "Social", ar: "المجتمع" },
  rewards: { en: "Rewards", ar: "المكافآت" },
  profile: { en: "Profile", ar: "الملف الشخصي" },
  smartAdvisor: { en: "Smart Advisor", ar: "المستشار الذكي" },
  simulator: { en: "Simulator", ar: "المحاكي" },
  
  // Auth
  login: { en: "Login", ar: "تسجيل الدخول" },
  signup: { en: "Sign Up", ar: "إنشاء حساب" },
  logout: { en: "Logout", ar: "تسجيل الخروج" },
  email: { en: "Email", ar: "البريد الإلكتروني" },
  password: { en: "Password", ar: "كلمة المرور" },
  confirmPassword: { en: "Confirm Password", ar: "تأكيد كلمة المرور" },
  forgotPassword: { en: "Forgot Password?", ar: "نسيت كلمة المرور؟" },
  
  // Onboarding
  welcome: { en: "Welcome", ar: "مرحباً" },
  getStarted: { en: "Get Started", ar: "ابدأ الآن" },
  next: { en: "Next", ar: "التالي" },
  back: { en: "Back", ar: "السابق" },
  skip: { en: "Skip", ar: "تخطي" },
  finish: { en: "Finish", ar: "إنهاء" },
  continue: { en: "Continue", ar: "استمر" },
  
  // Profile Fields
  name: { en: "Name", ar: "الاسم" },
  age: { en: "Age", ar: "العمر" },
  gender: { en: "Gender", ar: "الجنس" },
  male: { en: "Male", ar: "ذكر" },
  female: { en: "Female", ar: "أنثى" },
  language: { en: "Language", ar: "اللغة" },
  preferredLanguage: { en: "Preferred Language", ar: "اللغة المفضلة" },
  
  // Insurance Categories
  motor: { en: "Motor", ar: "السيارات" },
  health: { en: "Health", ar: "الصحة" },
  travel: { en: "Travel", ar: "السفر" },
  home: { en: "Home", ar: "المنزل" },
  life: { en: "Life", ar: "الحياة" },
  
  // Dashboard
  protectionScore: { en: "Protection Score", ar: "نقاط الحماية" },
  lifeScore: { en: "Life Score", ar: "نقاط الحياة" },
  points: { en: "Points", ar: "النقاط" },
  level: { en: "Level", ar: "المستوى" },
  streak: { en: "Streak", ar: "السلسلة" },
  days: { en: "Days", ar: "أيام" },
  
  // Challenges
  dailyChallenges: { en: "Daily Challenges", ar: "التحديات اليومية" },
  weeklyChallenges: { en: "Weekly Challenges", ar: "التحديات الأسبوعية" },
  completedChallenges: { en: "Completed Challenges", ar: "التحديات المكتملة" },
  startChallenge: { en: "Start Challenge", ar: "ابدأ التحدي" },
  completeChallenge: { en: "Complete Challenge", ar: "أكمل التحدي" },
  
  // Rewards
  badges: { en: "Badges", ar: "الشارات" },
  achievements: { en: "Achievements", ar: "الإنجازات" },
  unlocked: { en: "Unlocked", ar: "مفتوحة" },
  locked: { en: "Locked", ar: "مقفلة" },
  
  // Smart Advisor
  askAdvisor: { en: "Ask your advisor", ar: "اسأل مستشارك" },
  typeMessage: { en: "Type your message...", ar: "اكتب رسالتك..." },
  send: { en: "Send", ar: "إرسال" },
  
  // Actions
  save: { en: "Save", ar: "حفظ" },
  cancel: { en: "Cancel", ar: "إلغاء" },
  delete: { en: "Delete", ar: "حذف" },
  edit: { en: "Edit", ar: "تعديل" },
  view: { en: "View", ar: "عرض" },
  close: { en: "Close", ar: "إغلاق" },
  
  // Status
  loading: { en: "Loading...", ar: "جاري التحميل..." },
  success: { en: "Success!", ar: "نجح!" },
  error: { en: "Error", ar: "خطأ" },
  warning: { en: "Warning", ar: "تحذير" },
  
  // Notifications
  welcome_message: { 
    en: "Welcome to QIC LifeQuest!", 
    ar: "مرحباً بك في QIC LifeQuest!" 
  },
  account_created: { 
    en: "Account created successfully", 
    ar: "تم إنشاء الحساب بنجاح" 
  },
  
  // Common Phrases
  select: { en: "Select", ar: "اختر" },
  selected: { en: "Selected", ar: "المحدد" },
  all: { en: "All", ar: "الكل" },
  none: { en: "None", ar: "لا شيء" },
  more: { en: "More", ar: "المزيد" },
  less: { en: "Less", ar: "أقل" },
  
  // Settings
  settings: { en: "Settings", ar: "الإعدادات" },
  theme: { en: "Theme", ar: "المظهر" },
  dark: { en: "Dark", ar: "داكن" },
  light: { en: "Light", ar: "فاتح" },
  system: { en: "System", ar: "النظام" },
  
  // Time
  today: { en: "Today", ar: "اليوم" },
  yesterday: { en: "Yesterday", ar: "أمس" },
  week: { en: "Week", ar: "أسبوع" },
  month: { en: "Month", ar: "شهر" },
  year: { en: "Year", ar: "سنة" },
};

export type TranslationKey = keyof typeof translations;

export function translate(key: TranslationKey, lang: "en" | "ar"): string {
  return translations[key][lang];
}
