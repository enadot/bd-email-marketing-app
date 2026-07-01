"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Card, Input } from "@heroui/react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = params.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  async function onPasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    router.push(nextPath);
    router.refresh();
  }

  async function onMagicLink() {
    setError(null);
    if (!email) return setError("הזן כתובת אימייל קודם");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });
    setLoading(false);
    if (error) return setError(error.message);
    setMagicSent(true);
  }

  return (
    <Card className="p-6">
      <Card.Header className="mb-4 flex-col items-start gap-1">
        <Card.Title className="text-xl font-bold">התחברות</Card.Title>
        <Card.Description className="text-sm text-neutral-500">
          ברוך הבא ל-Edri Mail Marketing
        </Card.Description>
      </Card.Header>

      {magicSent ? (
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          שלחנו לך קישור התחברות ל-{email}. בדוק את תיבת הדואר.
        </p>
      ) : (
        <form onSubmit={onPasswordLogin} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span>אימייל</span>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>סיסמה</span>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" variant="primary" isDisabled={loading} fullWidth>
            התחבר
          </Button>
          <Button
            type="button"
            variant="outline"
            onPress={onMagicLink}
            isDisabled={loading}
            fullWidth
          >
            שלח קישור קסם (Magic Link)
          </Button>
        </form>
      )}

      <p className="mt-4 text-center text-sm text-neutral-500">
        אין לך חשבון?{" "}
        <Link href="/register" className="font-medium text-primary underline">
          הרשמה
        </Link>
      </p>
    </Card>
  );
}
