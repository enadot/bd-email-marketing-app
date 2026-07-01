"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card, Input } from "@heroui/react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });
    setLoading(false);
    if (error) return setError(error.message);
    setDone(true);
  }

  return (
    <Card className="p-6">
      <Card.Header className="mb-4 flex-col items-start gap-1">
        <Card.Title className="text-xl font-bold">יצירת חשבון</Card.Title>
        <Card.Description className="text-sm text-neutral-500">
          התחל לבנות סדרות מיילים חכמות
        </Card.Description>
      </Card.Header>

      {done ? (
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          נשלח אליך מייל אימות ל-{email}. אשר אותו כדי להמשיך.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span>שם</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="השם שלך" />
          </label>
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
              placeholder="לפחות 6 תווים"
              required
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" variant="primary" isDisabled={loading} fullWidth>
            הרשמה
          </Button>
        </form>
      )}

      <p className="mt-4 text-center text-sm text-neutral-500">
        כבר יש לך חשבון?{" "}
        <Link href="/login" className="font-medium text-primary underline">
          התחברות
        </Link>
      </p>
    </Card>
  );
}
