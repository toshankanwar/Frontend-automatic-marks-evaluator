"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  ShieldCheck,
  BarChart3,
  ClipboardList,
  User,
  KeyRound,
  ChevronDown
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { logout, getUser } from "@/lib/auth";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    setUser(getUser()); // localStorage read only on client after mount
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (!menuRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!mounted) {
    // prevent SSR/CSR mismatch
    return (
      <header className="sticky top-0 z-40 border-b border-emerald-100/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="h-10 w-40 animate-pulse rounded-lg bg-emerald-100" />
          <div className="h-10 w-28 animate-pulse rounded-lg bg-emerald-100" />
        </div>
      </header>
    );
  }

  const userId = user?.user_id;
  const evalHref = userId ? `/${userId}/allevaluations` : "/login";
  const ocrHref = userId ? `/${userId}/ocr-accuracy` : "/login";
  const profileHref = userId ? `/${userId}/profile` : "/login";
  const resetPassHref = userId ? `/${userId}/reset-password` : "/login";
  const aboutHref = "/about"; // added

  const isActive = (href) => pathname?.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-100/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <button
          onClick={() => router.push(evalHref)}
          className="group flex items-center gap-3 rounded-xl px-1 py-1 transition"
        >
          <div className="rounded-xl bg-emerald-600 p-2.5 text-white shadow-sm transition group-hover:scale-105 group-hover:bg-emerald-700">
            <ShieldCheck size={17} />
          </div>
          <div className="text-left">
            <p className="text-lg font-extrabold tracking-tight text-emerald-700 leading-none">AutoGrade</p>
            <p className="text-[11px] text-emerald-600/80">Smart Evaluation Suite</p>
          </div>
        </button>

        <nav className="hidden items-center gap-2 md:flex">
          <Link href={evalHref} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${isActive(evalHref) ? "bg-emerald-100 text-emerald-800" : "text-emerald-700 hover:bg-emerald-50"}`}>
            <ClipboardList size={16} /> Evaluations
          </Link>
          <Link href={ocrHref} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${isActive(ocrHref) ? "bg-emerald-100 text-emerald-800" : "text-emerald-700 hover:bg-emerald-50"}`}>
            <BarChart3 size={16} /> OCR Accuracy
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user?.name && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100"
              >
                <User size={15} />
                <span className="max-w-[120px] truncate">{user.name}</span>
                <ChevronDown size={15} />
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-lg">
                  <Link href={profileHref} onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-emerald-800 hover:bg-emerald-50">
                    <User size={15} /> Profile
                  </Link>
                  <Link href={resetPassHref} onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-emerald-800 hover:bg-emerald-50">
                    <KeyRound size={15} /> Reset Password
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      router.push("/login");
                    }}
                    className="flex w-full items-center gap-2 border-t border-emerald-100 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}