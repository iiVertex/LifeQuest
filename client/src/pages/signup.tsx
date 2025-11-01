import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { ProgressRing } from "@/components/progress-ring";
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle, Shield, Car, Heart, Plane, Home, Users, Trophy, Target, Sparkles, Languages } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { useTranslation } from "@/lib/translation-provider";
import GB from 'country-flag-icons/react/3x2/GB';
import SA from 'country-flag-icons/react/3x2/SA';

export default function Signup() {
  const [, setLocation] = useLocation();
  const { language, setLanguage: setGlobalLanguage, t, dir } = useTranslation();
  const [step, setStep] = useState(0);

  // Step 1: Name, Age, Gender, and Language
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  // Step 2: Email & Password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 3: Insurance Priority (MULTI-SELECT)
  const [insurancePriority, setInsurancePriority] = useState<string[]>([]);
  
  // Advisor Tone
  const [advisorTone, setAdvisorTone] = useState("balanced");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const languages = [
    { id: "en", label: "English", FlagComponent: GB },
    { id: "ar", label: "العربية", FlagComponent: SA },
  ];

  const insuranceOptions = [
    { id: "motor", label: "Motor", labelAr: "السيارات", icon: Car, color: "text-blue-500" },
    { id: "health", label: "Health", labelAr: "الصحة", icon: Heart, color: "text-red-500" },
    { id: "travel", label: "Travel", labelAr: "السفر", icon: Plane, color: "text-green-500" },
    { id: "home", label: "Home", labelAr: "المنزل", icon: Home, color: "text-orange-500" },
    { id: "life", label: "Life", labelAr: "الحياة", icon: Users, color: "text-purple-500" },
  ];

  const advisorTones = [
    { id: "strict", label: "Strict", description: "Direct and to-the-point" },
    { id: "balanced", label: "Balanced", description: "Professional yet friendly" },
    { id: "friendly", label: "Friendly", description: "Warm and encouraging" },
  ];

  // Password validation
  const passwordValidation = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    matches: password === confirmPassword && password.length > 0,
  };

  const isPasswordValid =
    passwordValidation.minLength &&
    passwordValidation.hasUpper &&
    passwordValidation.hasLower &&
    passwordValidation.hasNumber &&
    passwordValidation.matches;

  const handleSignup = async () => {
    setLoading(true);
    setError("");

    try {
      const username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
      
      // 1. Create Supabase Auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            age: parseInt(age),
            gender,
            language,
            focus_areas: insurancePriority,
            advisor_tone: advisorTone,
          },
        },
      });

      // 2. Create user profile in our database (do this BEFORE checking email confirmation)
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          name,
          email,
          age: parseInt(age),
          gender,
          language,
          focusAreas: insurancePriority,
          insurancePriority: insurancePriority[0] || "",
          advisorTone,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Registration failed");
      }

      const data = await res.json();
      console.log("✅ User registered successfully:", data);

      // Check if email confirmation is required
      if (authData?.user && !authData.session) {
        setError("Please check your email to verify your account before signing in.");
        setTimeout(() => setLocation("/login"), 3000);
        return;
      }

      // Success - redirect to dashboard
      setLocation("/dashboard");
    } catch (err: any) {
      console.error("❌ Signup error:", err);
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 0:
        return language.length > 0; // Language selection FIRST
      case 1:
        return true; // Welcome screen
      case 2:
        return name.trim().length > 0 && age.trim().length > 0 && gender.length > 0; // Name, Age, Gender
      case 3:
        return insurancePriority.length > 0; // Insurance Categories
      case 4:
        return advisorTone.length > 0; // Advisor Tone
      case 5:
        return true; // Smart Advisor Setup
      case 6:
        return true; // First Challenge
      case 7:
        return true; // Protection Score
      case 8:
        return email.trim().length > 0 && isPasswordValid; // Email & Password LAST
      default:
        return false;
    }
  };

  const progress = ((step + 1) / 9) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="p-4">
        <Progress value={progress} className="h-1" />
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Step 0: Language Selection - FIRST! */}
          {step === 0 && (
            <>
              <div className="text-center space-y-6">
                <div className="p-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 w-24 h-24 mx-auto flex items-center justify-center">
                  <Languages className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">Choose Your Language</h2>
                  <h2 className="text-3xl font-bold mb-4" dir="rtl">اختر لغتك</h2>
                  <p className="text-muted-foreground">Select your preferred language</p>
                  <p className="text-muted-foreground" dir="rtl">اختر لغتك المفضلة</p>
                </div>
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-8">
                  {languages.map((lang) => {
                    const isSelected = language === lang.id;
                    const FlagComponent = lang.FlagComponent;
                    return (
                      <div
                        key={lang.id}
                        onClick={() => {
                          console.log('🖱️ CLICKED LANGUAGE:', lang.id);
                          setGlobalLanguage(lang.id as "en" | "ar");
                        }}
                        className={`p-6 border-2 rounded-2xl cursor-pointer transition-all hover:scale-105 ${
                          isSelected
                            ? "border-primary bg-primary/10 shadow-xl"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-3">
                          <FlagComponent className="w-16 h-12 rounded shadow-md" />
                          <span className="font-bold text-lg">{lang.label}</span>
                          {isSelected && (
                            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Step 1: Welcome Screen */}
          {step === 1 && (
            <>
              <div className="text-center space-y-8 max-w-2xl mx-auto animate-in fade-in duration-500" dir={dir}>
                <div className="p-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 w-32 h-32 mx-auto flex items-center justify-center">
                  <Shield className="h-16 w-16 text-primary animate-pulse" />
                </div>
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {t('Welcome to QIC LifeQuest!', 'مرحبًا في QIC LifeQuest!')}
                  </h1>
                  <p className="text-xl text-muted-foreground">{t('Turn your insurance into a rewarding journey.', 'حول تأمينك إلى رحلة مجزية.')}</p>
                </div>
                <Card className="p-6 bg-gradient-to-br from-primary/5 to-background border-primary/20">
                  <p className="text-lg mb-6 text-center">
                    {t('Earn points, unlock badges, and level up your Protection Score.', 'اكسب النقاط، وافتح الشارات، وارفع درجة حمايتك.')}
                  </p>
                  <div className="space-y-4 text-left">
                    <div className="flex items-start gap-3">
                      <Trophy className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold">{t('Earn Points', 'اكسب النقاط')}</h3>
                        <p className="text-sm text-muted-foreground">{t('Complete challenges and earn engagement points', 'أكمل التحديات واكسب نقاط المشاركة')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold">{t('Unlock Badges', 'افتح الشارات')}</h3>
                        <p className="text-sm text-muted-foreground">{t('Achieve milestones and collect rewards', 'حقق الإنجازات واجمع المكافآت')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold">{t('Level Up Protection', 'ارفع مستوى الحماية')}</h3>
                        <p className="text-sm text-muted-foreground">{t('Boost your Protection Score and unlock tiers', 'عزز درجة حمايتك وافتح المستويات')}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}

          {/* Step 2: Name, Age, Gender */}
          {step === 2 && (
            <>
              <div className="text-center" dir={dir}>
                <h2 className="text-2xl font-bold">{t('Tell Us About Yourself', 'أخبرنا عن نفسك')}</h2>
                <p className="text-muted-foreground mt-2">{t('This helps us personalize your experience', 'هذا يساعدنا على تخصيص تجربتك')}</p>
              </div>
              <div className="space-y-6" dir={dir}>
                <div>
                  <Label htmlFor="name">{t('Name', 'الاسم')}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('Enter your name', 'أدخل اسمك')}
                  />
                </div>

                <div>
                  <Label htmlFor="age">{t('Age', 'العمر')}</Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder={t('Enter your age', 'أدخل عمرك')}
                    min="13"
                    max="120"
                  />
                </div>

                <div>
                  <Label htmlFor="gender">{t('Gender', 'الجنس')}</Label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">{t('Select gender', 'اختر الجنس')}</option>
                    <option value="male">{t('Male', 'ذكر')}</option>
                    <option value="female">{t('Female', 'أنثى')}</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Step 3: Insurance Categories */}
          {step === 3 && (
            <>
              <div className="text-center mb-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <h2 className="text-2xl font-bold">{t('Which insurance matters most to you?', 'أي نوع تأمين يهمك أكثر؟')}</h2>
                <p className="text-muted-foreground mt-2">{t("Choose all that apply", 'اختر كل ما ينطبق')}</p>
                {insurancePriority.length > 0 && (
                  <p className="text-sm text-primary mt-2">
                    {t('Selected', 'المحدد')} ({insurancePriority.length}): {insurancePriority.map(id => insuranceOptions.find(o => o.id === id)?.[language === 'ar' ? 'labelAr' : 'label']).join(', ')}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {insuranceOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = insurancePriority.includes(option.id);
                  return (
                    <Card
                      key={option.id}
                      onClick={() => {
                        console.log('🎯 Clicked insurance:', option.id, 'Current:', insurancePriority);
                        // Multi-select: toggle selection
                        if (isSelected) {
                          setInsurancePriority(insurancePriority.filter(id => id !== option.id));
                        } else {
                          setInsurancePriority([...insurancePriority, option.id]);
                        }
                      }}
                      className={`p-6 cursor-pointer transition-all hover:scale-105 ${
                        isSelected ? "border-primary bg-primary/5 shadow-lg" : "hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full bg-background ${option.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{language === 'ar' ? option.labelAr : option.label}</h3>
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
            </>
          )}

          {/* Step 4: Advisor Tone */}
          {step === 4 && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold">How should your Smart Advisor communicate?</h2>
                <p className="text-muted-foreground mt-2">Choose the tone that motivates you best</p>
              </div>
              <div className="space-y-3">
                {advisorTones.map((tone) => {
                  const isSelected = advisorTone === tone.id;
                  return (
                    <Card
                      key={tone.id}
                      onClick={() => setAdvisorTone(tone.id)}
                      className={`p-5 cursor-pointer transition-all hover:scale-102 ${
                        isSelected ? "border-primary bg-primary/5 shadow-lg" : "hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{tone.label}</h3>
                          <p className="text-sm text-muted-foreground">{tone.description}</p>
                        </div>
                        {isSelected && (
                          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shrink-0">
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
            </>
          )}

          {/* Step 5: Smart Advisor Setup */}
          {step === 5 && (
            <>
              <div className="max-w-xl mx-auto space-y-8 text-center">
                <div className="p-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 w-40 h-40 mx-auto flex items-center justify-center animate-pulse">
                  <Sparkles className="h-20 w-20 text-primary" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold">Meet Your QIC Smart Advisor</h2>
                  <Card className="p-6 bg-primary/5 border-primary/20">
                    <p className="text-lg">
                      Hey {name || "there"}, I'll be your QIC Smart Advisor. Let's get started with your first challenge!
                    </p>
                  </Card>
                </div>
              </div>
            </>
          )}

          {/* Step 6: First Challenge */}
          {step === 6 && (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-3">Your First Challenge Unlocked! 🎯</h2>
                <p className="text-muted-foreground">Complete this to start earning points</p>
              </div>
              <Card className="p-6 border-2 border-primary shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-primary/10 flex-shrink-0">
                        <Car className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Renew Your Motor Policy Early</h3>
                        <p className="text-sm text-muted-foreground">Complete before expiry</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl font-bold text-primary">+50</div>
                      <div className="text-xs text-muted-foreground">Points</div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Trophy className="h-4 w-4" />
                      <span>Unlock: Car Wash Voucher</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Renew your motor policy early — earn 50 points and unlock a car wash voucher.
                    </p>
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* Step 7: Protection Score */}
          {step === 7 && (
            <>
              <div className="max-w-xl mx-auto space-y-8 text-center">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold mb-3">Your Protection Score</h2>
                  <p className="text-muted-foreground">Track how well-protected you are</p>
                </div>
                <div className="flex justify-center my-8">
                  <ProgressRing progress={42} size={200} strokeWidth={20} />
                </div>
                <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-background border-orange-500/20">
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2">
                      <Shield className="h-6 w-6 text-orange-500" />
                      <h3 className="text-2xl font-bold">You're 42% covered</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Complete challenges to boost your score!
                    </p>
                    <div className="grid grid-cols-4 gap-2 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Bronze</div>
                        <div className="h-2 bg-orange-500 rounded" />
                        <div className="text-xs font-semibold mt-1">0-49</div>
                      </div>
                      <div className="text-center opacity-50">
                        <div className="text-xs text-muted-foreground mb-1">Silver</div>
                        <div className="h-2 bg-gray-400 rounded" />
                        <div className="text-xs font-semibold mt-1">50-69</div>
                      </div>
                      <div className="text-center opacity-50">
                        <div className="text-xs text-muted-foreground mb-1">Gold</div>
                        <div className="h-2 bg-yellow-500 rounded" />
                        <div className="text-xs font-semibold mt-1">70-89</div>
                      </div>
                      <div className="text-center opacity-50">
                        <div className="text-xs text-muted-foreground mb-1">Platinum</div>
                        <div className="h-2 bg-purple-500 rounded" />
                        <div className="text-xs font-semibold mt-1">90-100</div>
                      </div>
                    </div>
                  </div>
                </Card>
                <p className="text-sm text-muted-foreground pt-4">
                  Ready to start your journey to Platinum protection? Let's go! 🚀
                </p>
              </div>
            </>
          )}

          {/* Step 8: Email & Password (FINAL STEP) */}
          {step === 8 && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold">Create Your Account</h2>
                <p className="text-muted-foreground mt-2">Almost there! Just need your email and password</p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                  />
                  <div className="mt-2 space-y-1 text-sm">
                    <div className={`flex items-center gap-2 ${password.length >= 8 ? "text-green-500" : "text-muted-foreground"}`}>
                      {password.length >= 8 ? "✓" : "○"} At least 8 characters
                    </div>
                    <div className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? "text-green-500" : "text-muted-foreground"}`}>
                      {/[A-Z]/.test(password) ? "✓" : "○"} One uppercase letter
                    </div>
                    <div className={`flex items-center gap-2 ${/[0-9]/.test(password) ? "text-green-500" : "text-muted-foreground"}`}>
                      {/[0-9]/.test(password) ? "✓" : "○"} One number
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">Passwords don't match</p>
                  )}
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="text-sm text-red-500 text-center">{error}</div>
          )}
        </div>
      </div>

      <div className="p-8 flex justify-between items-center max-w-2xl mx-auto w-full" dir={dir}>
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep(step - 1)} disabled={loading}>
            {t('Back', 'رجوع')}
          </Button>
        )}
        <div className="flex-1" />
        <Button
          onClick={() => {
            if (step < 8) {
              setStep(step + 1);
            } else {
              handleSignup();
            }
          }}
          disabled={!isStepValid() || loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('Creating account...', 'جاري إنشاء الحساب...')}
            </>
          ) : step === 8 ? (
            t('Get Started', 'ابدأ الآن')
          ) : (
            t('Continue', 'متابعة')
          )}
        </Button>
      </div>

      <div className="text-center pb-4 text-sm" dir={dir}>
        {t('Already have an account?', 'لديك حساب بالفعل؟')}{" "}
        <a href="/login" className="text-primary hover:underline">
          {t('Sign in', 'تسجيل الدخول')}
        </a>
      </div>
    </div>
  );
}
