"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  User2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
} from "lucide-react";
import api from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) return toast.error("Please enter your name");
    if (!form.email.trim()) return toast.error("Please enter your email");
    if (!form.password.trim()) return toast.error("Please enter your password");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");

    try {
      setLoading(true);
      const { data } = await api.post("/auth/signup", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      saveAuth(data);
      toast.success("Signup successful");
      router.push(`/${data.user_id}/allevaluations`);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-white px-4 py-10">
      {/* Background blobs */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-green-200/40 blur-3xl" />

      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-emerald-100 bg-white/90 shadow-2xl backdrop-blur">
        <div className="grid md:grid-cols-2">
          {/* Left panel */}
          <div className="hidden bg-gradient-to-br from-emerald-600 to-green-600 p-10 text-white md:block">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-sm">
              <ShieldCheck size={16} />
              Smart Evaluation Platform
            </div>
            <h1 className="text-3xl font-extrabold leading-tight">
              Create your <br /> AutoGrade account
            </h1>
            <p className="mt-4 text-sm text-emerald-50">
              Start building evaluations, upload answer sheets, and access
              detailed AI-assisted marking results.
            </p>

            <div className="mt-8 space-y-3 text-sm">
              <div className="rounded-xl bg-white/10 p-3">✅ Secure JWT based authentication</div>
              <div className="rounded-xl bg-white/10 p-3">✅ Clean dashboard and result workflow</div>
              <div className="rounded-xl bg-white/10 p-3">✅ Teacher-friendly manual override support</div>
            </div>
          </div>

          {/* Right panel */}
          <div className="p-6 sm:p-10">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Signup</h2>
                <p className="text-sm text-slate-500">
                  Create your account to continue
                </p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <div className="group flex items-center rounded-xl border border-emerald-200 bg-white px-3 transition focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100">
                  <User2 size={18} className="text-slate-400 group-focus-within:text-emerald-600" />
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-slate-400"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <div className="group flex items-center rounded-xl border border-emerald-200 bg-white px-3 transition focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100">
                  <Mail size={18} className="text-slate-400 group-focus-within:text-emerald-600" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-slate-400"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="group flex items-center rounded-xl border border-emerald-200 bg-white px-3 transition focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100">
                  <Lock size={18} className="text-slate-400 group-focus-within:text-emerald-600" />
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-slate-400"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="text-slate-500 transition hover:text-emerald-700"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                disabled={loading}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}