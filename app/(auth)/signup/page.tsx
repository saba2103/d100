"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Envelope,
  Lock,
  ArrowRight,
  WarningCircle,
  CalendarBlank,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";
import type { ProfileInsert } from "@/lib/types/database";

// ── Helpers ─────────────────────────────────────────────────────────────────
function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

// ── Component ────────────────────────────────────────────────────────────────
export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState<"S" | "P">("S");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [startDate, setStartDate] = useState(todayISO());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Validation ─────────────────────────────────────────────────
  const passwordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;
  const passwordTooShort = password.length > 0 && password.length < 8;

  const isValid =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 8 &&
    password === confirmPassword;

  // ── Submit ─────────────────────────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setError(null);
    setLoading(true);

    const supabase = createClient();

    // 1. Create auth user — trigger will auto-create profile row
    const { data: signUpData, error: signUpError } =
      await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: displayName,
            full_name: fullName.trim(),
          },
        },
      });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const userId = signUpData.user?.id;
    if (!userId) {
      setError("Account created but could not retrieve user. Please sign in.");
      setLoading(false);
      return;
    }

    // 2. Upsert profile with all extra fields (trigger may have run already).
    // Cast needed: Supabase typed client resolves upsert overload to never[]
    // when both object and array overloads exist. Shape is validated via ProfileInsert above.
    const profilePayload: ProfileInsert = {
      id: userId,
      display_name: displayName,
      full_name: fullName.trim(),
      email: email.trim(),
      program_start_date: startDate,
    };
    const { error: profileError } = await supabase
      .from("profiles")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .upsert(profilePayload as any);

    if (profileError) {
      // Non-fatal — profile trigger may have already created the row
      console.warn("Profile upsert warning:", profileError.message);
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div>
      <div className="mb-6">
        <h1
          className="font-body-bold text-xl"
          style={{ color: "var(--text-primary)" }}
        >
          Create your account
        </h1>
        <p className="font-body mt-0.5 text-sm" style={{ color: "var(--text-muted)" }}>
          Start your 100-day transformation
        </p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4" noValidate>
        {/* Full name */}
        <Input
          label="Full Name"
          id="signup-fullname"
          type="text"
          placeholder="Your name"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          leftIcon={<User size={16} />}
          required
          disabled={loading}
        />

        {/* Profile label */}
        <div className="flex flex-col gap-1.5">
          <label
            className="font-body-bold text-xs uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Profile Label
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["S", "P"] as const).map((label) => (
              <button
                key={label}
                type="button"
                id={`profile-label-${label}`}
                onClick={() => setDisplayName(label)}
                disabled={loading}
                className={cn(
                  "h-11 rounded-xl font-body-bold text-sm transition-all duration-200",
                  displayName === label
                    ? "text-white"
                    : "border"
                )}
                style={
                  displayName === label
                    ? {
                        background:
                          "linear-gradient(135deg, var(--accent-start), var(--accent-end))",
                        boxShadow: "0 2px 12px rgba(255,107,0,0.3)",
                      }
                    : {
                        background: "var(--bg-elevated)",
                        borderColor: "var(--border)",
                        color: "var(--text-secondary)",
                      }
                }
              >
                {label}
              </button>
            ))}
          </div>
          <p className="font-body text-xs" style={{ color: "var(--text-muted)" }}>
            Which household member is this profile for?
          </p>
        </div>

        {/* Email */}
        <Input
          label="Email"
          id="signup-email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Envelope size={16} />}
          required
          disabled={loading}
        />

        {/* Password */}
        <Input
          label="Password"
          id="signup-password"
          type="password"
          placeholder="Minimum 8 characters"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock size={16} />}
          error={passwordTooShort ? "Password must be at least 8 characters" : undefined}
          required
          disabled={loading}
        />

        {/* Confirm password */}
        <Input
          label="Confirm Password"
          id="signup-confirm-password"
          type="password"
          placeholder="Repeat your password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          leftIcon={<Lock size={16} />}
          error={passwordMismatch ? "Passwords do not match" : undefined}
          required
          disabled={loading}
        />

        {/* Program start date */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="signup-start-date"
            className="font-body-bold text-xs uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Program Start Date
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
              <CalendarBlank size={16} />
            </span>
            <input
              id="signup-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={loading}
              className="h-11 w-full rounded-xl pl-10 pr-4 font-body text-sm outline-none transition-all duration-200 focus:ring-2 disabled:opacity-50"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                colorScheme: "dark",
              } as React.CSSProperties}
            />
          </div>
        </div>

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
          id="signup-submit"
          type="submit"
          disabled={loading || !isValid}
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
              Create Account
              <ArrowRight size={16} weight="bold" />
            </>
          )}
        </motion.button>
      </form>

      <p
        className="font-body mt-6 text-center text-sm"
        style={{ color: "var(--text-muted)" }}
      >
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-body-bold transition-colors"
          style={{ color: "var(--accent-text)" }}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
