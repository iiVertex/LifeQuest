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
  const [referralCode, setReferralCode] = useState("");
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
      console.log("🚀 Starting signup process...");
      const username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
      console.log("📝 Username generated:", username);
      
      // 1. Create Supabase Auth user
      console.log("1️⃣ Creating Supabase auth user...");
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

      if (authError) {
        console.error("❌ Supabase auth error:", authError);
        throw new Error(authError.message);
      }
      console.log("✅ Supabase auth user created:", authData);

      // 2. Create user profile in our database (do this BEFORE checking email confirmation)
      console.log("2️⃣ Creating user profile in database...");
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
          referralCode: referralCode.trim() || undefined,
        }),
        credentials: "include",
      });

      console.log("📡 Registration API response status:", res.status);
      
      if (!res.ok) {
        const errData = await res.json();
        console.error("❌ Registration API error:", errData);
        throw new Error(errData.message || "Registration failed");
      }

      const data = await res.json();
      console.log("✅ User registered successfully:", data);

      // Check if email confirmation is required
      if (authData?.user && !authData.session) {
        console.log("📧 Email confirmation required");
        setError("Please check your email to verify your account before signing in.");
        setTimeout(() => setLocation("/login"), 3000);
        return;
      }

      // Success - redirect to dashboard
      console.log("🎉 Signup complete! Redirecting to dashboard...");
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
        return true; // Protection Points Tier System
      case 7:
        return email.trim().length > 0 && isPasswordValid; // Email & Password LAST
      default:
        return false;
    }
  };

  const progress = ((step + 1) / 8) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="p-4">
        <Progress value={progress} className="h-1" />
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl space-y-6">
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
                <h2 className="text-2xl font-bold">How should your AI Smart Advisor communicate?</h2>
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

          {/* Step 6: Protection Points Tier System */}
          {step === 6 && (
            <>
              <div className="max-w-xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
                    <Shield className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold">Protection Points System</h2>
                  <p className="text-muted-foreground">
                    Complete challenges to earn Protection Points (PP) and climb through the tiers!
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Bronze Tier */}
                  <Card className="p-4 border-2 border-orange-500 bg-gradient-to-br from-orange-500/10 to-background">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">Bronze Tier</h3>
                        <p className="text-sm text-muted-foreground">0 - 249 PP</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-semibold text-orange-500">YOU START HERE</div>
                      </div>
                    </div>
                  </Card>

                  {/* Silver Tier */}
                  <Card className="p-4 border border-gray-400/30">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">Silver Tier</h3>
                        <p className="text-sm text-muted-foreground">250 - 499 PP</p>
                      </div>
                    </div>
                  </Card>

                  {/* Gold Tier */}
                  <Card className="p-4 border border-yellow-500/30">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">Gold Tier</h3>
                        <p className="text-sm text-muted-foreground">500 - 749 PP</p>
                      </div>
                    </div>
                  </Card>

                  {/* Platinum Tier */}
                  <Card className="p-4 border border-purple-500/30">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">Platinum Tier</h3>
                        <p className="text-sm text-muted-foreground">750 - 1000 PP</p>
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-semibold mb-2">Daily Challenge Limits:</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Complete up to <span className="font-semibold text-foreground">2 challenges per day</span></li>
                        <li>• Earn a maximum of <span className="font-semibold text-foreground">50 PP daily</span></li>
                        <li>• Challenges expire after 24 hours</li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <p className="text-center text-sm text-muted-foreground">
                  Start at Bronze and work your way to Platinum! 🚀
                </p>
              </div>
            </>
          )}

          {/* Step 7: Email & Password (FINAL STEP) */}
          {step === 7 && (
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
                <div>
                  <Label htmlFor="referralCode" className="text-sm text-muted-foreground">
                    Referral Code (Optional)
                  </Label>
                  <Input
                    id="referralCode"
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="Enter referral code (if you have one)"
                    className="uppercase"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your friend gets bonus points when you sign up with their code!
                  </p>
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
            if (step < 7) {
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
          ) : step === 7 ? (
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
