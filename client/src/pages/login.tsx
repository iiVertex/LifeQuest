import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { useTranslation } from "@/lib/translation-provider";

export default function Login() {
  const [, setLocation] = useLocation();
  const { t, dir } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Login with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // 2. Also login to our backend to get cookies/session
      const username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json();
        console.warn("Backend login failed:", errData.message);
        // Continue anyway if Supabase auth worked
      }

      console.log("✅ Login successful");

      // Login successful, redirect to dashboard
      setLocation("/dashboard");
    } catch (err: any) {
      console.error("❌ Login error:", err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir={dir}>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{t('Welcome Back', 'مرحباً بعودتك')}</h1>
          <p className="text-muted-foreground mt-2">{t('Sign in to your account', 'سجل الدخول إلى حسابك')}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">{t('Email', 'البريد الإلكتروني')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('your@email.com', 'بريدك@الإلكتروني.com')}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">{t('Password', 'كلمة المرور')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('Enter your password', 'أدخل كلمة المرور')}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500 text-center">{error}</div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('Signing in...', 'جاري تسجيل الدخول...')}
              </>
            ) : (
              t('Sign In', 'تسجيل الدخول')
            )}
          </Button>
        </form>

        <div className="text-center text-sm">
          {t("Don't have an account?", 'ليس لديك حساب؟')}{" "}
          <a href="/signup" className="text-primary hover:underline">
            {t('Sign up', 'إنشاء حساب')}
          </a>
        </div>
      </div>
    </div>
  );
}
