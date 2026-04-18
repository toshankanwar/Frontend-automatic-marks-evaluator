"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, ShieldCheck, BarChart3, ClipboardList } from "lucide-react";
import { logout, getUser } from "@/lib/auth";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = getUser();

  const userId = user?.user_id;
  const evalHref = userId ? `/${userId}/allevaluations` : "/login";
  const ocrHref = userId ? `/${userId}/ocr-accuracy` : "/login";

  const isActive = (href) => pathname?.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-100/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <button
          onClick={() => router.push(evalHref)}
          className="group flex items-center gap-3 rounded-xl px-1 py-1 transition"
        >
          <div className="rounded-xl bg-emerald-600 p-2.5 text-white shadow-sm transition group-hover:scale-105 group-hover:bg-emerald-700">
            <ShieldCheck size={17} />
          </div>
          <div className="text-left">
            <p className="text-lg font-extrabold tracking-tight text-emerald-700 leading-none">
              AutoGrade
            </p>
            <p className="text-[11px] text-emerald-600/80">Smart Evaluation Suite</p>
          </div>
        </button>

        {/* Center Nav */}
        <nav className="hidden items-center gap-2 md:flex">
          <Link
            href={evalHref}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
              isActive(evalHref)
                ? "bg-emerald-100 text-emerald-800"
                : "text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            <ClipboardList size={16} />
            Evaluations
          </Link>

          <Link
            href={ocrHref}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
              isActive(ocrHref)
                ? "bg-emerald-100 text-emerald-800"
                : "text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            <BarChart3 size={16} />
            OCR Accuracy
          </Link>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {user?.name && (
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium text-emerald-800">
                Welcome, <span className="font-semibold">{user.name}</span>
              </span>
            </div>
          )}

          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3.5 py-2 text-sm font-semibold text-red-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-50 hover:shadow focus:outline-none focus:ring-2 focus:ring-red-200"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile quick nav */}
      {userId && (
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 pb-3 md:hidden">
          <Link
            href={evalHref}
            className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium ${
              isActive(evalHref)
                ? "bg-emerald-100 text-emerald-800"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            Evaluations
          </Link>
          <Link
            href={ocrHref}
            className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium ${
              isActive(ocrHref)
                ? "bg-emerald-100 text-emerald-800"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            OCR Accuracy
          </Link>
        </div>
      )}
    </header>
  );
}