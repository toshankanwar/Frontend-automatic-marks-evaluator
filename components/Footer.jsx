"use client";

import { Heart, Globe, Mail, ShieldCheck, GitBranch } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t border-emerald-100 bg-white/90 backdrop-blur">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:grid-cols-2">
        {/* Brand */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800">AutoGrade</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
            AI-powered evaluation platform for faster, smarter, and more consistent
            answer sheet assessment for modern educators.
          </p>
          <p className="mt-3 inline-flex items-center gap-1 text-sm text-slate-600">
            <ShieldCheck size={14} className="text-emerald-700" />
            Secure • Reliable • Scalable
          </p>
        </div>

        {/* Creator */}
        <div className="md:justify-self-end">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Creator
          </h4>

          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p className="inline-flex items-center gap-1">
              Designed & Developed with
              <Heart size={14} className="fill-rose-500 text-rose-500" />
              by{" "}
              <a
                href="https://toshankanwar.in"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-slate-800 underline decoration-emerald-300 underline-offset-4 transition hover:text-emerald-700"
              >
                Toshan Kanwar
              </a>
            </p>

            <a
              href="https://toshankanwar.in"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:text-emerald-700"
            >
              <Globe size={14} />
              toshankanwar.in
            </a>

            <a
              href="https://github.com/toshankanwar"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:text-emerald-700"
            >
              <GitBranch size={14} />
              github.com/toshankanwar
            </a>

            <a
              href="mailto:hello@toshankanwar.in"
              className="flex items-center gap-2 hover:text-emerald-700"
            >
              <Mail size={14} />
              developer@toshankanwar.in
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-emerald-100 bg-emerald-50/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-3 text-xs text-slate-600 sm:flex-row">
          <p>© {year} AutoGrade. All rights reserved.</p>
          <p className="text-center sm:text-right">
            Built for modern educators • AI-assisted evaluation system
          </p>
        </div>
      </div>
    </footer>
  );
}