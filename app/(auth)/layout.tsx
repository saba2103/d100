import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "D100",
    template: "%s | D100",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden p-4"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Ambient glow behind the card */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,107,0,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative z-10 w-full max-w-[440px]">
        {/* Logo */}
        <div className="mb-8 text-center">
          <span
            className="font-display text-7xl leading-none"
            style={{
              background:
                "linear-gradient(135deg, var(--accent-start), var(--accent-end))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            D100
          </span>
          <p
            className="font-body mt-1 text-sm tracking-[0.2em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            100 Day Transformation
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6 md:p-8"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            boxShadow:
              "0 0 0 1px rgba(255,107,0,0.05), 0 24px 48px rgba(0,0,0,0.4)",
          }}
        >
          {children}
        </div>

        {/* Footer */}
        <p
          className="font-body mt-6 text-center text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          Your journey starts here.
        </p>
      </div>
    </div>
  );
}
