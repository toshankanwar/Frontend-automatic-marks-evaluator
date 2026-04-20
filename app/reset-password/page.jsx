"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  KeyRound,
  ShieldCheck,
  Lock,
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";

  const [new_password, setNewPassword] = useState("");
  const [confirm_password, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");
  const [loading, setLoading] = useState(false);

  const showMessage = (text, type = "success") => {
    setMsg(text);
    setMsgType(type);
  };

  const submit = async () => {
    setMsg("");

    if (!token) {
      showMessage("Invalid reset link (token missing).", "error");
      return;
    }
    if (!new_password || !confirm_password) {
      showMessage("Please fill all fields.", "error");
      return;
    }
    if (new_password !== confirm_password) {
      showMessage("New password and confirm password do not match.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password, confirm_password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Password reset failed");

      showMessage("Password reset successful. Redirecting to login...", "success");
      setTimeout(() => router.push("/login"), 1200);
    } catch (e) {
      showMessage(e.message || "Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-[calc(100vh-72px)] bg-gradient-to-b from-emerald-50/60 via-white to-emerald-50/40">
        <div className="mx-auto w-full max-w-6xl px-5 py-10 md:py-14">
          <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm lg:grid-cols-2">
            {/* Left - Form */}
            <section className="p-6 sm:p-8 md:p-10">
              <h1 className="flex items-center gap-3 text-2xl md:text-3xl font-bold text-emerald-800">
                <KeyRound size={24} />
                Reset Password
              </h1>
              <p className="mt-2 text-sm md:text-base text-emerald-700/80">
                Create a new password for your account and continue securely.
              </p>

              <div className="mt-7 space-y-4">
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-emerald-900">
                    <Lock size={16} />
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={new_password}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full rounded-2xl border border-emerald-300 bg-white px-4 py-3 pr-12 text-base text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((v) => !v)}
                      className="absolute inset-y-0 right-3 inline-flex items-center text-emerald-700 hover:text-emerald-900"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-emerald-900">
                    <ShieldCheck size={16} />
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirm_password}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full rounded-2xl border border-emerald-300 bg-white px-4 py-3 pr-12 text-base text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute inset-y-0 right-3 inline-flex items-center text-emerald-700 hover:text-emerald-900"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={submit}
                  disabled={loading}
                  className="mt-2 w-full rounded-2xl bg-emerald-600 px-5 py-3 text-base font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  {loading ? "Updating..." : "Reset Password"}
                </button>

                {msg && (
                  <p
                    className={`rounded-xl border px-3 py-2 text-sm ${
                      msgType === "error"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {msg}
                  </p>
                )}
              </div>
            </section>

            {/* Right - UI panel */}
            <aside className="relative hidden lg:flex flex-col justify-between bg-emerald-700 p-10 text-white">
              <div className="absolute -top-16 -right-16 h-44 w-44 rounded-full bg-emerald-500/30 blur-2xl" />
              <div className="absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-emerald-400/20 blur-2xl" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide">
                  <Sparkles size={14} />
                  AUTO GRADE SECURITY
                </div>

                <h2 className="mt-5 text-3xl font-bold leading-tight">
                  Keep your account
                  <br />
                  protected always.
                </h2>

                <p className="mt-4 max-w-md text-sm text-emerald-50/90">
                  Choose a strong password with letters, numbers, and symbols.
                  A secure password helps protect your data and evaluation history.
                </p>
              </div>

              <div className="relative z-10 mt-8 space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  Minimum 8 characters recommended
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  Use upper + lower case letters
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  Include numbers and special symbols
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-600">Loading reset page...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}