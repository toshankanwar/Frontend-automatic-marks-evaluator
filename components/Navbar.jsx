"use client";
import { useRouter } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";
import { logout, getUser } from "@/lib/auth";

export default function Navbar() {
  const router = useRouter();
  const user = getUser();

  return (
    <header className="sticky top-0 z-30 border-b border-emerald-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <button
          onClick={() => user?.user_id && router.push(`/${user.user_id}/allevaluations`)}
          className="flex items-center gap-2"
        >
          <div className="rounded-lg bg-emerald-600 p-2 text-white shadow-sm">
            <ShieldCheck size={16} />
          </div>
          <span className="text-lg font-bold tracking-tight text-emerald-700">AutoGrade</span>
        </button>

        <div className="flex items-center gap-3">
          {user?.name && (
            <span className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-sm text-emerald-800 sm:block">
              {user.name}
            </span>
          )}
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}