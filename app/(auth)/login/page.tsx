"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Envelope, Lock, ArrowRight, WarningCircle } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";

import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "Incorrect email or password. Please try again."
          : authError.message
      );
      setLoading(false);
      return;
    }

    router.push(nextPath);
    router.refresh();
  };

  return (
    <div>
      <div className="mb-6">
        <h1
          className="font-body-bold text-xl"
          style={{ color: "var(--text-primary)" }}
        >
          Welcome back
        </h1>
        <p className="font-body mt-0.5 text-sm" style={{ color: "var(--text-muted)" }}>
          Sign in to continue your journey
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4" noValidate>
        <Input
          label="Email"
          id="login-email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Envelope size={16} />}
          required
          disabled={loading}
        />

        <Input
          label="Password"
          id="login-password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock size={16} />}
          required
          disabled={loading}
        />

        {/* Inline error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-2 rounded-xl p-3"
              style={{
                background: "var(--red-soft)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
              role="alert"
            >
              <WarningCircle
                size={16}
                className="mt-0.5 shrink-0"
                style={{ color: "var(--red)" }}
              />
              <p className="font-body text-sm" style={{ color: "var(--red)" }}>
                {error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.button
          id="login-submit"
          type="submit"
          disabled={loading || !email || !password}
          whileTap={{ scale: 0.98 }}
          className="relative mt-2 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl font-body-bold text-sm text-white transition-opacity disabled:opacity-60"
          style={{
            background:
              "linear-gradient(135deg, var(--accent-start), var(--accent-end))",
            boxShadow: "0 4px 20px rgba(255,107,0,0.3)",
          }}
        >
          {loading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              Sign In
              <ArrowRight size={16} weight="bold" />
            </>
          )}
        </motion.button>
      </form>

      <p
        className="font-body mt-6 text-center text-sm"
        style={{ color: "var(--text-muted)" }}
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-body-bold transition-colors"
          style={{ color: "var(--accent-text)" }}
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent border-[var(--accent-start)]" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
