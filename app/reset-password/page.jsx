"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { KeyRound } from "lucide-react";

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";

  const [new_password, setNewPassword] = useState("");
  const [confirm_password, setConfirmPassword] = useState("");
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
      <main className="min-h-[calc(100vh-72px)] bg-gradient-to-b from-emerald-50/60 to-white">
        <div className="mx-auto max-w-md px-4 py-10">
          <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
            <h1 className="flex items-center gap-2 text-xl font-bold text-emerald-800">
              <KeyRound size={20} /> Set New Password
            </h1>
            <p className="mt-1 text-sm text-emerald-700/80">
              Enter your new password below.
            </p>

            <div className="mt-5 space-y-3">
              <input
                type="password"
                value={new_password}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                className="w-full rounded-xl border border-emerald-300 bg-white px-3 py-2.5 text-sm text-gray-900"
              />
              <input
                type="password"
                value={confirm_password}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                className="w-full rounded-xl border border-emerald-300 bg-white px-3 py-2.5 text-sm text-gray-900"
              />

              <button
                onClick={submit}
                disabled={loading}
                className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {loading ? "Updating..." : "Reset Password"}
              </button>

              {msg && (
                <p className={`text-sm ${msgType === "error" ? "text-red-600" : "text-emerald-700"}`}>
                  {msg}
                </p>
              )}
            </div>
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