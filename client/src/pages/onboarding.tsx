import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Shield, Car, Heart, Plane, Home, Users, Trophy, Target, Languages } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { ProgressRing } from "@/components/progress-ring";

interface OnboardingProps {
  onComplete: () => void;
}

const insuranceCategories = [
  { id: "motor", label: "Motor", labelAr: "السيارات", icon: Car, color: "text-blue-500" },
  { id: "health", label: "Health", labelAr: "الصحة", icon: Heart, color: "text-red-500" },
  { id: "travel", label: "Travel", labelAr: "السفر", icon: Plane, color: "text-green-500" },
  { id: "home", label: "Home", labelAr: "المنزل", icon: Home, color: "text-orange-500" },
  { id: "life", label: "Life", labelAr: "الحياة", icon: Users, color: "text-purple-500" },
];

const languages = [
  { id: "en", label: "English", flag: "🇬🇧" },
  { id: "ar", label: "العربية", flag: "🇸🇦" },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("en");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Setup failed');
      return res.json();
    },
    onSuccess: () => onComplete(),
  });

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="text-center space-y-8 max-w-2xl mx-auto animate-in fade-in duration-500">
            <div className="p-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 w-32 h-32 mx-auto flex items-center justify-center">
              <Shield className="h-16 w-16 text-primary animate-pulse" />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Welcome to QIC LifeQuest!
              </h1>
              <p className="text-xl text-muted-foreground">Turn your insurance into a rewarding journey.</p>
            </div>
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-background border-primary/20">
              <p className="text-lg mb-6 text-center">
                Earn points, unlock badges, and level up your Protection Score.
              </p>
              <div className="space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <Trophy className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Earn Points</h3>
                    <p className="text-sm text-muted-foreground">Complete challenges and earn engagement points</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Unlock Badges</h3>
                    <p className="text-sm text-muted-foreground">Achieve milestones and collect rewards</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Level Up Protection</h3>
                    <p className="text-sm text-muted-foreground">Boost your Protection Score and unlock tiers</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 1:
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3">Tell Us About Yourself</h2>
              <p className="text-muted-foreground">Help us personalize your experience</p>
            </div>
            
            <Card className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-lg"
                />
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  Preferred Language
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  {languages.map((lang) => (
                    <Card
                      key={lang.id}
                      onClick={() => setLanguage(lang.id)}
                      className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                        language === lang.id ? "border-primary bg-primary/5 shadow-lg" : "hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{lang.flag}</span>
                        <span className={`font-semibold ${lang.id === 'ar' ? 'text-xl' : ''}`}>{lang.label}</span>
                        {language === lang.id && (
                          <div className="ml-auto h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="max-w-2xl mx-auto space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3">
                {t('Which Insurance Matters Most to You?', 'أي تأمين يهمك أكثر؟')}
              </h2>
              <p className="text-muted-foreground">
                {t('Choose one category that matters most', 'اختر فئة واحدة الأكثر أهمية')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insuranceCategories.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <Card
                    key={category.id}
                    onClick={() => {
                      // Single select only - replace the selection
                      setSelectedCategories([category.id]);
                    }}
                    className={`p-6 cursor-pointer transition-all hover:scale-105 ${
                      isSelected ? "border-primary bg-primary/5 shadow-lg" : "hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full bg-background ${category.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{language === 'ar' ? category.labelAr : category.label}</h3>
                      </div>
                      {isSelected && (
                        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
            <p className="text-sm text-center text-muted-foreground">
              {selectedCategories.length > 0 ? t(`Selected: ${selectedCategories[0]}`, `المحدد: ${selectedCategories[0]}`) : t('Select one', 'اختر واحدة')}
            </p>
          </div>
        );

      case 3:
        return (
          <div className="max-w-xl mx-auto space-y-8 text-center" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="p-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 w-40 h-40 mx-auto flex items-center justify-center animate-pulse">
              <Sparkles className="h-20 w-20 text-primary" />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">
                {t('Meet Your QIC Smart Advisor', 'تعرف على مستشار QIC الذكي')}
              </h2>
              <Card className="p-6 bg-primary/5 border-primary/20">
                <p className="text-lg">
                  {language === 'ar' 
                    ? `مرحباً ${name || "بك"}، سأكون مستشار QIC الذكي الخاص بك. لنبدأ بتحديك الأول!`
                    : `"Hey ${name || "there"}, I'll be your QIC Smart Advisor. Let's get started with your first challenge!"`
                  }
                </p>
              </Card>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="max-w-2xl mx-auto space-y-8 text-center" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold mb-3">
                {t('Your Protection Journey', 'رحلة الحماية الخاصة بك')}
              </h2>
              <p className="text-muted-foreground">
                {t('Build your Protection Points and climb the tiers', 'اجمع نقاط الحماية واصعد المستويات')}
              </p>
            </div>

            {/* Current Status */}
            <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-background border-orange-500/20">
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Shield className="h-8 w-8 text-orange-500" />
                  <div className="text-center">
                    <div className="text-4xl font-bold">0 PP</div>
                    <div className="text-sm text-muted-foreground">{t('Protection Points', 'نقاط الحماية')}</div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-full">
                    <span className="text-orange-600 dark:text-orange-400 font-bold">
                      🥉 {t('Bronze Tier', 'مستوى البرونز')}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tier Progression */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg">{t('Tier System', 'نظام المستويات')}</h3>
              
              {/* Bronze */}
              <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-background border-orange-500/30 shadow-lg">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <Shield className="h-6 w-6 text-orange-500" />
                    </div>
                    <div className={language === 'ar' ? 'text-right flex-1' : 'text-left flex-1'}>
                      <div className="font-bold text-orange-600 dark:text-orange-400">
                        {t('Bronze', 'برونزي')}
                      </div>
                      <div className="text-sm text-muted-foreground">0-249 PP</div>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-xs font-semibold text-orange-600 dark:text-orange-400">
                    {t('Current', 'الحالي')}
                  </div>
                </div>
              </Card>

              {/* Silver */}
              <Card className="p-4 opacity-70 hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gray-400/20 flex items-center justify-center flex-shrink-0">
                      <Trophy className="h-6 w-6 text-gray-500" />
                    </div>
                    <div className={language === 'ar' ? 'text-right flex-1' : 'text-left flex-1'}>
                      <div className="font-bold text-gray-600 dark:text-gray-400">
                        {t('Silver', 'فضي')}
                      </div>
                      <div className="text-sm text-muted-foreground">250-499 PP</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">250 PP</div>
                    <div className="text-xs text-muted-foreground">{t('to unlock', 'للفتح')}</div>
                  </div>
                </div>
              </Card>

              {/* Gold */}
              <Card className="p-4 opacity-70 hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                      <Trophy className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div className={language === 'ar' ? 'text-right flex-1' : 'text-left flex-1'}>
                      <div className="font-bold text-yellow-600 dark:text-yellow-400">
                        {t('Gold', 'ذهبي')}
                      </div>
                      <div className="text-sm text-muted-foreground">500-749 PP</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">500 PP</div>
                    <div className="text-xs text-muted-foreground">{t('to unlock', 'للفتح')}</div>
                  </div>
                </div>
              </Card>

              {/* Platinum */}
              <Card className="p-4 opacity-70 hover:opacity-100 transition-opacity border-purple-500/20">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-6 w-6 text-purple-500" />
                    </div>
                    <div className={language === 'ar' ? 'text-right flex-1' : 'text-left flex-1'}>
                      <div className="font-bold text-purple-600 dark:text-purple-400">
                        {t('Platinum', 'بلاتيني')}
                      </div>
                      <div className="text-sm text-muted-foreground">750-1000 PP</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">750 PP</div>
                    <div className="text-xs text-muted-foreground">{t('to unlock', 'للفتح')}</div>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-4 bg-primary/5 border-primary/20">
              <p className="text-sm">
                💡 {t('Complete daily challenges to earn Protection Points and climb the tiers!', 'أكمل التحديات اليومية لكسب نقاط الحماية والصعود عبر المستويات!')}
              </p>
            </Card>

            <p className="text-sm text-muted-foreground pt-2">
              {t('Ready to start your journey to Platinum? Let\'s go! 🚀', 'هل أنت مستعد لبدء رحلتك إلى البلاتين؟ لنبدأ! 🚀')}
            </p>
          </div>
        );
    }
  };

  const totalSteps = 5;
  const progress = ((step + 1) / totalSteps) * 100;

  const handleContinue = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      registerMutation.mutate({
        name: name || "User",
        language,
        focusAreas: selectedCategories,
        advisorTone: "balanced",
        protectionScore: 0,
        tier: "bronze",
      });
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 0: return true;
      case 1: return name.trim().length > 0;
      case 2: return selectedCategories.length > 0;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="p-4">
        <Progress value={progress} className="h-1" />
      </div>
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-y-auto">
        {renderStep()}
      </div>
      <div className="p-6 md:p-8 flex justify-between items-center max-w-4xl mx-auto w-full border-t bg-card/50 backdrop-blur-sm">
        {step > 0 && (
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={registerMutation.isPending}
            size="lg"
          >
            {t('Back', 'رجوع')}
          </Button>
        )}
        <div className="flex-1" />
        <Button
          onClick={handleContinue}
          disabled={!isStepValid() || registerMutation.isPending}
          size="lg"
          className="min-w-[140px]"
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('Setting up...', 'جاري الإعداد...')}
            </>
          ) : step === totalSteps - 1 ? (
            t("Let's Go! 🚀", "لنبدأ! 🚀")
          ) : (
            t('Continue', 'متابعة')
          )}
        </Button>
      </div>
      {registerMutation.isError && (
        <div className="px-8 pb-4 text-center">
          <p className="text-sm text-red-500">
            {registerMutation.error instanceof Error ? registerMutation.error.message : t('Setup failed. Please try again.', 'فشل الإعداد. يرجى المحاولة مرة أخرى.')}
          </p>
        </div>
      )}
    </div>
  );
}
