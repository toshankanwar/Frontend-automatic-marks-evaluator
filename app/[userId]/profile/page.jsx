"use client";

import { useEffect, useMemo, useState } from "react";
import { getToken, getUser, logout } from "@/lib/auth";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { User2, Mail, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
export const runtime = 'edge';
export default function ProfilePage() {
  const { userId } = useParams();
  const router = useRouter();

  const user = useMemo(() => getUser(), []);
  const token = useMemo(() => getToken(), []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [deletePassword, setDeletePassword] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");
  const [loadingDelete, setLoadingDelete] = useState(false);

  // ✅ must type exact phrase to reveal delete button
  const requiredConfirmText = "DELETE MY ACCOUNT";
  const isConfirmTextValid = confirmText.trim() === requiredConfirmText;
  const canShowDeleteButton = isConfirmTextValid;

  useEffect(() => {
    if (!user || !token) {
      router.push("/login");
      return;
    }
    if (user.user_id !== userId) {
      router.push(`/${user.user_id}/profile`);
      return;
    }
    setName(user.name || "");
    setEmail(user.email || "");
  }, [user, token, userId, router]);

  const showMessage = (text, type = "success") => {
    setMsg(text);
    setMsgType(type);
  };

  const deleteAccount = async () => {
    setLoadingDelete(true);
    setMsg("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/profile/me`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          password: deletePassword,
          confirm_text: "DELETE", // backend expects DELETE
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Delete failed");

      logout();
      router.push("/signup");
    } catch (e) {
      showMessage(e.message || "Something went wrong.", "error");
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-[calc(100vh-72px)] bg-gradient-to-b from-emerald-50/60 to-white">
        <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
          {/* Read-only Profile */}
          <section className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h1 className="text-2xl font-bold text-emerald-800">My Profile</h1>
              <p className="mt-1 text-sm text-emerald-700/80">Account details</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-emerald-900">
                  <User2 size={15} /> Name
                </label>
                <input
                  value={name}
                  disabled
                  className="w-full rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-emerald-900">
                  <Mail size={15} /> Email
                </label>
                <input
                  value={email}
                  disabled
                  className="w-full rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900"
                />
              </div>
            </div>
          </section>

          {/* Delete Account */}
          <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="flex items-center gap-2 text-xl font-bold text-red-700">
                <AlertTriangle size={18} />
                Delete Account
              </h2>
              <p className="mt-1 text-sm text-red-700/90">
                This action is permanent. Type <b>{requiredConfirmText}</b> to enable delete button.
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="password"
                placeholder="Enter current password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full rounded-xl border border-red-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-200"
              />

              <input
                placeholder={`Type "${requiredConfirmText}" to confirm`}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full rounded-xl border border-red-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-200"
              />

              {isConfirmTextValid ? (
                <p className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                  <CheckCircle2 size={14} />
                  Confirmation text matched. You can delete now.
                </p>
              ) : (
                <p className="text-xs text-red-600">
                  Delete button will appear only after exact confirmation text.
                </p>
              )}

              {canShowDeleteButton && (
                <button
                  onClick={deleteAccount}
                  disabled={loadingDelete || !deletePassword.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                >
                  <Trash2 size={16} />
                  {loadingDelete ? "Deleting..." : "Delete My Account"}
                </button>
              )}
            </div>
          </section>

          {msg && (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
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