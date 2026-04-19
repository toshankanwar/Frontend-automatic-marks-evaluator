"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Mail, Send, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");
  const [loading, setLoading] = useState(false);

  const showMessage = (text, type = "success") => {
    setMsg(text);
    setMsgType(type);
  };

  const submit = async () => {
    setMsg("");

    if (!email.trim()) {
      showMessage("Please enter your email address.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Unable to process request");

      showMessage(
        data?.message ||
          "If this email is registered, reset instructions have been sent."
      );
    } catch (e) {
      showMessage(e.message || "Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-[calc(100vh-72px)] bg-gradient-to-br from-emerald-50 via-white to-emerald-100/40">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-10 sm:py-14">
          <section className="w-full max-w-2xl rounded-3xl border border-emerald-200/80 bg-white p-6 shadow-[0_12px_40px_rgba(16,185,129,0.12)] sm:p-8 md:p-10">
            <div className="mb-7">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <ShieldCheck size={14} />
                Account Recovery
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-emerald-900 sm:text-4xl">
                Forgot Password
              </h1>
              <p className="mt-2 text-base leading-relaxed text-emerald-700/90 sm:text-lg">
                Enter your registered email and we will send a secure password reset link.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-900 sm:text-base">
                  <Mail size={16} />
                  Email Address
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-xl border border-emerald-300 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <button
                onClick={submit}
                disabled={loading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-base font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                <Send size={16} />
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800"
              >
                <ArrowLeft size={15} />
                Back to Login
              </Link>
            </div>

            {msg && (
              <div
                className={`mt-6 rounded-xl border px-4 py-3 text-sm sm:text-base ${
                  msgType === "error"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                {msg}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}