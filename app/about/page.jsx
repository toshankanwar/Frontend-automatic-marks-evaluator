import {
    Info,
    ShieldCheck,
    Target,
    Workflow,
    Database,
    FileText,
    Cpu,
    Mail,
    Globe,
    UserCircle2,
    ExternalLink,
    Server,
  } from "lucide-react";
  import Image from "next/image";
  import Navbar from "@/components/Navbar";
  
  export const metadata = {
    title: "About",
    description:
      "Learn everything about AutoGrade — vision, workflow, features, architecture, security, and roadmap.",
  };
  
  const techStack = [
    "Next.js (App Router)",
    "React + Tailwind CSS",
    "FastAPI backend",
    "MongoDB",
    "JWT Authentication",
    "OCR + AI Evaluation Pipeline",
    "PWA support (Manifest + Service Worker)",
  ];
  
  const workflowSteps = [
    "User authentication and secure session handling",
    "Answer/script upload and preprocessing",
    "OCR extraction from uploaded content",
    "Evaluation logic + scoring",
    "Result formatting and feedback generation",
    "Storage, retrieval, and dashboard visibility",
  ];
  
  const BASE_API = "https://api.autograde.toshankanwar.in";
  
  const apiList = [
    { method: "POST", path: "/auth/register", purpose: "Register new user" },
    { method: "POST", path: "/auth/login", purpose: "User login + token" },
    { method: "POST", path: "/auth/forgot-password", purpose: "Send reset link" },
    { method: "POST", path: "/auth/reset-password", purpose: "Reset password via token" },
    { method: "POST", path: "/auth/change-password", purpose: "Change password (authorized)" },
    { method: "GET", path: "/users/me", purpose: "Get logged-in profile" },
    { method: "PUT", path: "/users/me", purpose: "Update profile details" },
    { method: "POST", path: "/evaluations", purpose: "Create new evaluation" },
    { method: "GET", path: "/evaluations", purpose: "List all evaluations" },
    { method: "GET", path: "/evaluations/{evaluation_id}", purpose: "Get single evaluation" },
    { method: "DELETE", path: "/evaluations/{evaluation_id}", purpose: "Delete evaluation" },
    { method: "POST", path: "/ocr/extract", purpose: "Run OCR on uploaded file" },
    { method: "GET", path: "/ocr/accuracy", purpose: "Get OCR accuracy metrics" },
    { method: "GET", path: "/health", purpose: "Service health check" },
  ];
  
  const card =
    "rounded-2xl border border-emerald-200 bg-white p-5 md:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-300";
  
  export default function AboutPage() {
    const developerBio =
      "Toshan Kanwar is the developer behind AutoGrade, focused on building practical AI-powered tools with clean UI, scalable backend architecture, and secure user-first workflows for modern education systems.";
  
    return (
      <>
  
        <main className="min-h-[calc(100vh-72px)] bg-gradient-to-b from-emerald-50 via-white to-emerald-50/30">
          {/* Hero */}
          <section className="border-b border-emerald-200 bg-white">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-14">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-xs font-bold tracking-wide text-emerald-800">
                <Info size={14} />
                ABOUT AUTOGRADE
              </div>
  
              <h1 className="mt-4 max-w-4xl text-3xl md:text-5xl font-extrabold tracking-tight text-emerald-900 leading-tight">
                AutoGrade — Automated Academic Evaluation Platform
              </h1>
              <p className="mt-4 max-w-3xl text-sm md:text-base text-slate-700 leading-7">
                AutoGrade simplifies and accelerates answer evaluation using OCR and intelligent grading workflows.
                It helps institutions reduce manual effort, improve consistency, and deliver results faster.
              </p>
            </div>
          </section>
  
          {/* Main */}
          <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
            
            {/* Rest */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <article className={card}>
                <h2 className="flex items-center gap-2 text-xl font-bold text-emerald-800">
                  <Target size={20} />
                  Vision & Purpose
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  AutoGrade aims to modernize assessment systems with a reliable, transparent, and scalable evaluation process.
                  The goal is to make grading faster while maintaining fairness and consistency.
                </p>
              </article>
  
              <article className={card}>
                <h2 className="flex items-center gap-2 text-xl font-bold text-emerald-800">
                  <Cpu size={20} />
                  Technology Stack
                </h2>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {techStack.map((tech) => (
                    <li key={tech} className="flex items-center gap-2">
                      <Database size={14} className="text-emerald-600" />
                      {tech}
                    </li>
                  ))}
                </ul>
              </article>
            </div>
  
            <article className={card}>
              <h2 className="flex items-center gap-2 text-xl font-bold text-emerald-800">
                <Workflow size={20} />
                End-to-End Workflow
              </h2>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {workflowSteps.map((step, i) => (
                  <div
                    key={step}
                    className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-100/70"
                  >
                    <span className="mr-2 font-semibold text-emerald-700">{String(i + 1).padStart(2, "0")}.</span>
                    {step}
                  </div>
                ))}
              </div>
            </article>
  
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <article className={card}>
                <h2 className="flex items-center gap-2 text-xl font-bold text-emerald-800">
                  <ShieldCheck size={20} />
                  Security & Reliability
                </h2>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  <li>JWT-based authentication and protected routes</li>
                  <li>Password reset and change-password workflows</li>
                  <li>Token validation and expiry handling</li>
                  <li>Consistent API response/error handling patterns</li>
                  <li>PWA readiness with manifest + service worker support</li>
                </ul>
              </article>
  
              <article className={card}>
                <h2 className="flex items-center gap-2 text-xl font-bold text-emerald-800">
                  <FileText size={20} />
                  Project Scope (A to Z)
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  This platform covers the full lifecycle of modern evaluation: authentication, user-specific workflows,
                  document processing, OCR-assisted extraction, AI-supported assessment logic, result generation,
                  and secure access to outputs — all in a responsive production-ready frontend.
                </p>
              </article>
            </div>
  
            <article className={card}>
              <h2 className="flex items-center gap-2 text-xl font-bold text-emerald-800">
                <Server size={20} />
                API Endpoints
              </h2>
              <p className="mt-2 text-sm text-slate-700">
                <span className="font-semibold text-emerald-700">Base URL:</span> {BASE_API}
              </p>
  
              <div className="mt-4 overflow-x-auto rounded-xl border border-emerald-100">
                <table className="min-w-full text-sm">
                  <thead className="bg-emerald-50 text-emerald-800">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Method</th>
                      <th className="px-4 py-3 text-left font-semibold">Endpoint</th>
                      <th className="px-4 py-3 text-left font-semibold">Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiList.map((api) => (
                      <tr key={`${api.method}-${api.path}`} className="border-t border-emerald-100 hover:bg-emerald-50/60">
                        <td className="px-4 py-3">
                          <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
                            {api.method}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs md:text-sm text-slate-800">{api.path}</td>
                        <td className="px-4 py-3 text-slate-700">{api.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
            {/* Developer box */}
            <article className={card}>
              <h2 className="flex items-center gap-2 text-xl font-bold text-emerald-800">
                <UserCircle2 size={20} />
                About the Developer
              </h2>
  
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 items-center">
                {/* Left image */}
                <div className="flex justify-center lg:justify-start">
                  <div className="h-72 w-72 md:h-80 md:w-80 overflow-hidden rounded-full border-[6px] border-emerald-300 shadow-lg transition duration-300 hover:scale-[1.02] hover:shadow-2xl">
                    <Image
                      src="https://static-assets.toshankanwar.in/images/image-toshan.jpg"
                      alt="Toshan Kanwar"
                      width={700}
                      height={700}
                      className="h-full w-full object-cover"
                      priority
                    />
                  </div>
                </div>
  
                {/* Right info */}
                <div className="min-w-0">
                  <h3 className="text-2xl md:text-3xl font-bold text-emerald-900 text-center lg:text-left">
                    Toshan Kanwar
                  </h3>
                  <p className="mt-3 text-sm md:text-base leading-7 text-slate-700 text-center lg:text-left">
                    {developerBio}
                  </p>
  
                  <div className="mt-5 flex flex-wrap gap-3 justify-center lg:justify-start">
                    <a
                      href="mailto:developer@toshankanwar.in"
                      className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition hover:-translate-y-0.5 hover:bg-emerald-100 hover:shadow-md"
                    >
                      <Mail size={15} />
                      developer@toshankanwar.in
                    </a>
  
                    <a
                      href="https://toshankanwar.in"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition hover:-translate-y-0.5 hover:bg-emerald-100 hover:shadow-md"
                    >
                      <Globe size={15} />
                      toshankanwar.in
                      <ExternalLink size={14} />
                    </a>
  
                    <a
                      href="https://github.com/toshankanwar/Frontend-automatic-marks-evaluator"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition hover:-translate-y-0.5 hover:bg-emerald-100 hover:shadow-md"
                    >
                      <Globe size={15} />
                      Project Repository
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </article>
          </section>
        </main>
      </>
    );
  }