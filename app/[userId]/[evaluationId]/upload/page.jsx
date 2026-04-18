"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  Files,
  Plus,
  Trash2,
  ClipboardList,
  PlayCircle,
  Loader2,
  ArrowLeft,
  Hash,
  Award,
} from "lucide-react";
import api from "@/lib/api";
import Protected from "@/components/Protected";
import Navbar from "@/components/Navbar";
import toast from "react-hot-toast";
export const runtime = "edge";
export default function UploadPage() {
  const params = useParams();
  const router = useRouter();

  const userId = useMemo(
    () => (Array.isArray(params?.userId) ? params.userId[0] : params?.userId),
    [params]
  );
  const evaluationId = useMemo(
    () => (Array.isArray(params?.evaluationId) ? params.evaluationId[0] : params?.evaluationId),
    [params]
  );

  const [answerKey, setAnswerKey] = useState(null);
  const [students, setStudents] = useState([]);
  const [questions, setQuestions] = useState([{ q_no: 1, max_marks: 5 }]);
  const [loading, setLoading] = useState(false);

  const totalMarks = questions.reduce((acc, q) => acc + (Number(q.max_marks) || 0), 0);

  const addQuestion = () => {
    setQuestions((prev) => [...prev, { q_no: prev.length + 1, max_marks: 5 }]);
  };

  const removeQuestion = (idx) => {
    if (questions.length === 1) return toast.error("At least 1 question required");
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateQ = (idx, key, val) => {
    const copy = [...questions];
    copy[idx][key] = Number(val);
    setQuestions(copy);
  };

  const onPickStudents = (e) => {
    const list = Array.from(e.target.files || []);
    setStudents(list);
  };

  const submit = async () => {
    if (!answerKey) return toast.error("Please upload answer key PDF");
    if (students.length === 0) return toast.error("Please upload student files");

    const invalid = questions.some((q) => !q.q_no || q.q_no < 1 || !q.max_marks || q.max_marks <= 0);
    if (invalid) return toast.error("Please enter valid question numbers and marks");

    try {
      setLoading(true);

      const form = new FormData();
      form.append("answer_key_file", answerKey);
      students.forEach((f) => form.append("student_files", f));
      form.append("question_schema", JSON.stringify(questions));

      await api.post(`/users/${userId}/evaluations/${evaluationId}/upload-and-evaluate`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Evaluation completed successfully");
      router.push(`/${userId}/${evaluationId}/results`);
    } catch (e) {
      console.error(e?.response?.data || e.message);
      toast.error(e?.response?.data?.detail || "Evaluation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Protected>
      <Navbar />
      <main className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-emerald-50 via-white to-white">
        <section className="mx-auto max-w-7xl px-4 pb-28 pt-6">
          {/* Header */}
          <div className="mb-6 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Upload & Evaluate
                </p>
                <h1 className="text-2xl font-semibold text-slate-900">Evaluation Setup</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Add answer key, upload student sheets, and configure marks.
                </p>
              </div>
              <button
                onClick={() => router.push(`/${userId}/allevaluations`)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left */}
            <div className="space-y-6 lg:col-span-8">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                    <FileText size={18} />
                  </div>
                  <h2 className="text-base font-semibold text-slate-900">Answer Key (PDF)</h2>
                </div>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 px-4 py-8 text-center transition hover:border-emerald-400 hover:bg-emerald-50">
                  <UploadCloud className="mb-2 text-emerald-600" size={28} />
                  <span className="text-sm font-medium text-slate-700">Click to upload answer key</span>
                  <span className="mt-1 text-xs text-slate-500">Only .pdf supported</span>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => setAnswerKey(e.target.files?.[0] || null)}
                  />
                </label>

                {answerKey && (
                  <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                    Selected: <span className="font-medium">{answerKey.name}</span>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                    <Files size={18} />
                  </div>
                  <h2 className="text-base font-semibold text-slate-900">Student Copies</h2>
                </div>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 px-4 py-8 text-center transition hover:border-emerald-400 hover:bg-emerald-50">
                  <UploadCloud className="mb-2 text-emerald-600" size={28} />
                  <span className="text-sm font-medium text-slate-700">Upload images / PDFs</span>
                  <span className="mt-1 text-xs text-slate-500">Multiple files allowed</span>
                  <input type="file" multiple className="hidden" onChange={onPickStudents} />
                </label>

                {students.length > 0 && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {students.map((f, i) => (
                      <div
                        key={`${f.name}-${i}`}
                        className="truncate rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700"
                        title={f.name}
                      >
                        {f.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right */}
            <div className="lg:col-span-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                      <ClipboardList size={18} />
                    </div>
                    <h2 className="text-base font-semibold text-slate-900">Question Schema</h2>
                  </div>
                  <button
                    onClick={addQuestion}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                  >
                    <Plus size={13} />
                    Add
                  </button>
                </div>

                <div className="space-y-2">
                  {questions.map((q, idx) => (
                    <div
                      key={idx}
                      className="grid min-w-0 grid-cols-1 gap-2 rounded-xl border border-slate-200 p-2 sm:grid-cols-[1fr_1fr_auto]"
                    >
                      <div className="relative min-w-0">
                        <Hash size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-8 pr-2 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                          type="number"
                          min={1}
                          value={q.q_no}
                          onChange={(e) => updateQ(idx, "q_no", e.target.value)}
                          placeholder="Q No"
                        />
                      </div>

                      <div className="relative min-w-0">
                        <Award size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-8 pr-2 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                          type="number"
                          min={1}
                          value={q.max_marks}
                          onChange={(e) => updateQ(idx, "max_marks", e.target.value)}
                          placeholder="Marks"
                        />
                      </div>

                      <button
                        onClick={() => removeQuestion(idx)}
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-red-200 px-3 text-red-600 transition hover:bg-red-50 sm:h-auto"
                        title="Remove"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm">
                  <div className="flex items-center justify-between text-slate-700">
                    <span>Total Questions</span>
                    <span className="font-semibold text-emerald-700">{questions.length}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-slate-700">
                    <span>Total Max Marks</span>
                    <span className="font-semibold text-emerald-700">{totalMarks}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom action bar */}
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <p className="text-sm text-slate-600">
              Ready for <span className="font-semibold text-emerald-700">{students.length}</span> students
            </p>
            <button
              onClick={submit}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Evaluating...
                </>
              ) : (
                <>
                  <PlayCircle size={16} />
                  Start Evaluation
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </Protected>
  );
}