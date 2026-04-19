"use client";

import { useEffect, useMemo, useState } from "react";
import { getToken, getUser } from "@/lib/auth";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
export const runtime = "edge";
export default function UserResetPasswordPage() {
  const { userId } = useParams();
  const router = useRouter();

  const user = useMemo(() => getUser(), []);
  const token = useMemo(() => getToken(), []);

  const [old_password, setOld] = useState("");
  const [new_password, setNew] = useState("");
  const [confirm_password, setConfirm] = useState("");

  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !token) {
      router.push("/login");
      return;
    }
    if (user.user_id !== userId) {
      router.push(`/${user.user_id}/reset-password`);
    }
  }, [user, token, userId, router]);

  const showMessage = (text, type = "success") => {
    setMsg(text);
    setMsgType(type);
  };

  const submit = async () => {
    setMsg("");

    if (!old_password || !new_password || !confirm_password) {
      showMessage("Please fill all fields.", "error");
      return;
    }

    if (new_password !== confirm_password) {
      showMessage("New password and confirm password do not match.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ old_password, new_password, confirm_password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Failed to reset password");

      showMessage("✅ Password updated successfully.");
      setOld("");
      setNew("");
      setConfirm("");
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
        <div className="mx-auto max-w-2xl px-4 py-8">
          <section className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h1 className="flex items-center gap-2 text-2xl font-bold text-emerald-800">
                <KeyRound size={22} />
                Reset Password
              </h1>
              <p className="mt-1 text-sm text-emerald-700/80">
                Use your current password to set a new secure password.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-emerald-900">
                  <LockKeyhole size={15} />
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={old_password}
                  onChange={(e) => setOld(e.target.value)}
                  className="w-full rounded-xl border border-emerald-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-emerald-900">
                  <ShieldCheck size={15} />
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={new_password}
                  onChange={(e) => setNew(e.target.value)}
                  className="w-full rounded-xl border border-emerald-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-emerald-900">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirm_password}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-xl border border-emerald-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <button
                onClick={submit}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </section>

          {msg && (
            <div
              className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                msgType === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {msg}
            </div>
          )}
        </div>
      </main>
    </>
  );
}