import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { FocusAreaSelector } from "@/components/focus-area-selector";
import { ProgressRing } from "@/components/progress-ring";
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle, Shield, Car, Heart, Plane, Home, Users, Trophy, Target, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);

  // Step 1: Name, Age, Gender
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  // Step 3: Email & Password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 4: Insurance Priority (Personalization Q1)
  const [insurancePriority, setInsurancePriority] = useState("");

  // Step 5: Advisor Tone (Personalization Q2)
  const [advisorTone, setAdvisorTone] = useState("balanced");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 2: Focus Areas
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const insuranceOptions = [
    { id: "motor", label: "Motor", icon: Car, color: "text-blue-500" },
    { id: "health", label: "Health", icon: Heart, color: "text-red-500" },
    { id: "travel", label: "Travel", icon: Plane, color: "text-green-500" },
    { id: "home", label: "Home", icon: Home, color: "text-orange-500" },
    { id: "life", label: "Life", icon: Users, color: "text-purple-500" },
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
            focus_areas: selectedAreas,
          },
        },
      });

      if (authError) throw authError;

      // Check if email confirmation is required
      if (authData?.user && !authData.session) {
        setError("Please check your email to verify your account before signing in.");
        setTimeout(() => setLocation("/login"), 3000);
        return;
      }

      // 2. Create user profile in our database with zero initial values
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          name,
          email,
          focusAreas: selectedAreas,
          insurancePriority,
          advisorTone,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Registration failed");
      }

      // Success - redirect to dashboard
      setLocation("/dashboard");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 0:
        return true; // Welcome screen
      case 1:
        return name.trim().length > 0 && age.trim().length > 0 && gender.length > 0;
      case 2:
        return selectedAreas.length > 0;
      case 3:
        return insurancePriority.length > 0; // Personalization Q1
      case 4:
        return advisorTone.length > 0; // Personalization Q2
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
          {/* Step 0: Welcome Screen */}
          {step === 0 && (
            <>
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
            </>
          )}

          {/* Step 1: Name, Age, Gender */}
          {step === 1 && (
            <>
              <div className="text-center">
                <h2 className="text-2xl font-bold">Tell us about yourself</h2>
                <p className="text-muted-foreground mt-2">This helps us personalize your experience</p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Enter your age"
                    min="13"
                    max="120"
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Focus Areas */}
          {step === 2 && (
            <>
              <div className="text-center">
                <h2 className="text-2xl font-bold">What do you want to master?</h2>
                <p className="text-muted-foreground mt-2">Select one or more areas</p>
              </div>
              <FocusAreaSelector
                selected={selectedAreas}
                onToggle={(area) => {
                  setSelectedAreas((prev) =>
                    prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
                  );
                }}
              />
            </>
          )}

          {/* Step 3: Insurance Priority */}
          {step === 3 && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold">Which insurance matters most to you?</h2>
                <p className="text-muted-foreground mt-2">We'll personalize your challenges</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {insuranceOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = insurancePriority === option.id;
                  return (
                    <Card
                      key={option.id}
                      onClick={() => setInsurancePriority(option.id)}
                      className={`p-6 cursor-pointer transition-all hover:scale-105 ${
                        isSelected ? "border-primary bg-primary/5 shadow-lg" : "hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full bg-background ${option.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{option.label}</h3>
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
                <h2 className="text-2xl font-bold">How do you prefer your assistant to communicate?</h2>
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

      <div className="p-8 flex justify-between items-center max-w-2xl mx-auto w-full">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep(step - 1)} disabled={loading}>
            Back
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
              Creating account...
            </>
          ) : step === 8 ? (
            "Get Started"
          ) : (
            "Continue"
          )}
        </Button>
      </div>

      <div className="text-center pb-4 text-sm">
        Already have an account?{" "}
        <a href="/login" className="text-primary hover:underline">
          Sign in
        </a>
      </div>
    </div>
  );
}
