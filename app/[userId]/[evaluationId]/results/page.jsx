"use client";
export const runtime = "edge";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Save,
  Loader2,
  CheckCircle2,
  XCircle,
  Trophy,
  Users,
  Sigma,
  ChevronDown,
  ChevronUp,
  Download,
  Clock3,
  Timer,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import api from "@/lib/api";
import Protected from "@/components/Protected";
import Navbar from "@/components/Navbar";
import toast from "react-hot-toast";

const msToSec = (ms) => {
  const n = Number(ms);
  if (Number.isNaN(n)) return "N/A";
  return `${(n / 1000).toFixed(2)}s`;
};

const safe = (v, fallback = "N/A") =>
  v === undefined || v === null || v === "" ? fallback : v;

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();

  const userId = useMemo(
    () => (Array.isArray(params?.userId) ? params.userId[0] : params?.userId),
    [params]
  );
  const evaluationId = useMemo(
    () =>
      Array.isArray(params?.evaluationId)
        ? params.evaluationId[0]
        : params?.evaluationId,
    [params]
  );

  const [results, setResults] = useState([]);
  const [batchTiming, setBatchTiming] = useState(null);

  const [editingTotal, setEditingTotal] = useState({});
  const [editingQuestion, setEditingQuestion] = useState({});
  const [savingId, setSavingId] = useState("");
  const [savingQuestionKey, setSavingQuestionKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("marks_desc");

  const getStudentId = (r) =>
    r?.student_id || r?.roll_no || r?.admission_no || r?.id || "N/A";

  const load = async () => {
    if (!userId || !evaluationId) return;
    try {
      setLoading(true);

      const { data } = await api.get(
        `/users/${userId}/evaluations/${evaluationId}/results`,
        {
          params: { _t: Date.now() },
          headers: { "Cache-Control": "no-cache" },
        }
      );

      console.log("RESULTS_API_DATA =>", data);

      // New backend shape: { batch_timing, results: [] }
      if (Array.isArray(data)) {
        setResults(data);
        setBatchTiming(null);
      } else {
        setResults(Array.isArray(data?.results) ? data.results : []);
        setBatchTiming(data?.batch_timing || null);
      }
    } catch (e) {
      console.error("RESULTS_FETCH_ERROR =>", e?.response?.data || e.message);
      toast.error("Failed to fetch results");
      setResults([]);
      setBatchTiming(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, evaluationId]);

  const updateMarks = async (studentId, totalMax) => {
    const raw = editingTotal[studentId];
    const val = Number(raw);

    if (raw === undefined || raw === "") return toast.error("Enter marks first");
    if (Number.isNaN(val)) return toast.error("Invalid marks");
    if (val < 0) return toast.error("Marks cannot be negative");
    if (val > Number(totalMax))
      return toast.error(`Marks cannot exceed ${totalMax}`);

    try {
      setSavingId(studentId);
      await api.patch(`/users/${userId}/evaluations/${evaluationId}/results/${studentId}`, {
        total_marks: val,
        note: "Teacher updated total",
      });
      toast.success("Total marks updated");
      await load();
      setEditingTotal((prev) => ({ ...prev, [studentId]: "" }));
    } catch (e) {
      console.error(e?.response?.data || e.message);
      toast.error("Total update failed");
    } finally {
      setSavingId("");
    }
  };

  const updateQuestionMarks = async (studentId, qNo, qMax) => {
    const key = `${studentId}_${qNo}`;
    const raw = editingQuestion[key];
    const val = Number(raw);

    if (raw === undefined || raw === "")
      return toast.error("Enter question marks first");
    if (Number.isNaN(val)) return toast.error("Invalid marks");
    if (val < 0) return toast.error("Marks cannot be negative");
    if (val > Number(qMax)) return toast.error(`Marks cannot exceed ${qMax}`);

    try {
      setSavingQuestionKey(key);
      await api.patch(
        `/users/${userId}/evaluations/${evaluationId}/results/${studentId}/questions/${qNo}`,
        {
          awarded_marks: val,
          note: "Teacher updated question mark",
        }
      );
      toast.success(`Q${qNo} marks updated`);
      await load();
      setEditingQuestion((prev) => ({ ...prev, [key]: "" }));
    } catch (e) {
      console.error(e?.response?.data || e.message);
      toast.error("Question-wise update failed");
    } finally {
      setSavingQuestionKey("");
    }
  };

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = [...results];

    if (q) {
      arr = arr.filter((r) => {
        const sid = String(getStudentId(r)).toLowerCase();
        return r.student_name?.toLowerCase().includes(q) || sid.includes(q);
      });
    }

    arr.sort((a, b) => {
      if (sortBy === "marks_desc") return Number(b.total_marks) - Number(a.total_marks);
      if (sortBy === "marks_asc") return Number(a.total_marks) - Number(b.total_marks);
      if (sortBy === "name_desc")
        return (b.student_name || "").localeCompare(a.student_name || "");
      return (a.student_name || "").localeCompare(b.student_name || "");
    });

    return arr;
  }, [results, query, sortBy]);

  const stats = useMemo(() => {
    const totalStudents = results.length;
    if (!totalStudents)
      return { totalStudents: 0, avgMarks: "0.00", highest: "0.00" };

    const sum = results.reduce((acc, r) => acc + Number(r.total_marks || 0), 0);
    const highest = Math.max(...results.map((r) => Number(r.total_marks || 0)));

    return {
      totalStudents,
      avgMarks: (sum / totalStudents).toFixed(2),
      highest: highest.toFixed(2),
    };
  }, [results]);

  const toggleExpand = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const downloadExcel = () => {
    if (!results.length) return toast.error("No results to export");

    const qNoSet = new Set();
    results.forEach((r) => {
      (r.question_scores || []).forEach((q) => {
        if (q?.q_no !== undefined && q?.q_no !== null) qNoSet.add(Number(q.q_no));
      });
    });
    const qNos = Array.from(qNoSet).sort((a, b) => a - b);

    const rows = results.map((r) => {
      const row = {
        file_name: r.file_name || r.student_name || r.student_id || "unknown_file",
      };

      const qMap = {};
      (r.question_scores || []).forEach((q) => {
        qMap[Number(q.q_no)] = q;
      });

      qNos.forEach((qNo) => {
        row[`Q${qNo}`] = Number(qMap[qNo]?.awarded_marks ?? 0);
      });

      row.total_marks = Number(r.total_marks || 0);
      row.out_of = Number(r.total_max_marks || 0);

      row.expected_questions = r?.validation?.expected_questions ?? "";
      row.attempted_questions = r?.validation?.attempted_questions ?? "";
      row.missing_questions = Array.isArray(r?.validation?.missing_questions)
        ? r.validation.missing_questions.join(", ")
        : "";

      return row;
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "TeacherResults");

    // Batch timing sheet (NEW)
    if (batchTiming) {
      const batchRows = [
        { metric: "Students Count", value: safe(batchTiming.students_count, 0) },
        { metric: "Batch Upload (ms)", value: safe(batchTiming.batch_upload_ms, 0) },
        { metric: "Batch OCR (ms)", value: safe(batchTiming.batch_ocr_ms, 0) },
        { metric: "Batch Parser (ms)", value: safe(batchTiming.batch_parser_ms, 0) },
        { metric: "Batch Scoring (ms)", value: safe(batchTiming.batch_scoring_ms, 0) },
        { metric: "Batch Total (ms)", value: safe(batchTiming.batch_total_ms, 0) },
        { metric: "Avg Total/Student (ms)", value: safe(batchTiming.avg_total_ms_per_student, 0) },
      ];
      const wsBatch = XLSX.utils.json_to_sheet(batchRows);
      XLSX.utils.book_append_sheet(wb, wsBatch, "BatchTiming");
    }

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `evaluation_${evaluationId}_teacher_results.xlsx`
    );

    toast.success("Teacher Excel downloaded");
  };

  return (
    <Protected>
      <Navbar />
      <main className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-emerald-50 via-white to-white">
        <section className="mx-auto max-w-7xl px-4 py-6">
          <div className="mb-6 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Evaluation Results
                </p>
                <h1 className="text-2xl font-semibold text-slate-900">Student Performance</h1>
                <p className="mt-1 text-sm text-slate-600">
                  Batch timing overview + question-wise breakdown + total update.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={downloadExcel}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  <Download size={16} />
                  Download Excel
                </button>
                <button
                  onClick={() => router.push(`/${userId}/allevaluations`)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
              </div>
            </div>
          </div>

          {/* Academic stats */}
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <StatCard icon={<Users size={16} />} label="Total Students" value={stats.totalStudents} />
            <StatCard icon={<Sigma size={16} />} label="Average Marks" value={stats.avgMarks} />
            <StatCard icon={<Trophy size={16} />} label="Highest Marks" value={stats.highest} />
          </div>

          {/* Batch timing cards (MAIN FOCUS) */}
          <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 size={16} className="text-emerald-700" />
              <h3 className="text-sm font-semibold text-slate-900">Batch Processing Timing (All Students Combined)</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <MiniCard icon={<Users size={14} />} label="Students" value={String(safe(batchTiming?.students_count, 0))} />
              <MiniCard icon={<Clock3 size={14} />} label="Upload" value={msToSec(batchTiming?.batch_upload_ms)} />
              <MiniCard icon={<Clock3 size={14} />} label="OCR" value={msToSec(batchTiming?.batch_ocr_ms)} />
              <MiniCard icon={<Clock3 size={14} />} label="Parser" value={msToSec(batchTiming?.batch_parser_ms)} />
              <MiniCard icon={<Clock3 size={14} />} label="Scoring" value={msToSec(batchTiming?.batch_scoring_ms)} />
              <MiniCard icon={<Timer size={14} />} label="Batch Total" value={msToSec(batchTiming?.batch_total_ms)} />
            </div>
            <p className="mt-3 text-xs text-slate-600">
              Avg per student: <span className="font-semibold">{msToSec(batchTiming?.avg_total_ms_per_student)}</span>
            </p>
          </div>

          <div className="mb-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_240px]">
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search by student name or student ID..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="relative">
              <SlidersHorizontal size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm font-medium text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="marks_desc">Marks: High to Low</option>
                <option value="marks_asc">Marks: Low to High</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100">
                  <tr className="text-slate-800">
                    <th className="px-4 py-3 text-left font-semibold">Student</th>
                    <th className="px-4 py-3 text-left font-semibold">Student ID</th>
                    <th className="px-4 py-3 text-left font-semibold">Total</th>
                    <th className="px-4 py-3 text-left font-semibold">Out Of</th>
                    <th className="px-4 py-3 text-left font-semibold">Validation</th>
                    <th className="px-4 py-3 text-left font-semibold">Override</th>
                    <th className="px-4 py-3 text-left font-semibold">Update Total</th>
                    <th className="px-4 py-3 text-left font-semibold">Details</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-slate-700">
                        Loading results...
                      </td>
                    </tr>
                  ) : filteredSorted.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-slate-700">
                        No results found.
                      </td>
                    </tr>
                  ) : (
                    filteredSorted.map((r, index) => {
                      const sid = getStudentId(r);
                      const rowKey = r.id || r._id || `${sid}_${index}`;
                      const v = r?.validation || {};

                      return (
                        <React.Fragment key={rowKey}>
                          <tr className="border-t border-slate-200 hover:bg-emerald-50/30">
                            <td className="px-4 py-3 font-medium text-slate-900">{r.student_name || "N/A"}</td>
                            <td className="px-4 py-3 font-medium text-slate-800">{sid}</td>
                            <td className="px-4 py-3 font-semibold text-emerald-700">{r.total_marks}</td>
                            <td className="px-4 py-3 text-slate-800">{r.total_max_marks}</td>
                            <td className="px-4 py-3">
                              {v?.status === "PARTIAL_ATTEMPT" ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                                  <AlertTriangle size={13} />
                                  {safe(v.attempted_questions, 0)}/{safe(v.expected_questions, 0)}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                                  <CheckCircle2 size={13} />
                                  {safe(v.attempted_questions, 0)}/{safe(v.expected_questions, 0)}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {r.manual_override ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                                  <CheckCircle2 size={13} /> Yes
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700">
                                  <XCircle size={13} /> No
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex min-w-[220px] items-center gap-2">
                                <input
                                  type="number"
                                  min={0}
                                  max={r.total_max_marks}
                                  value={editingTotal[sid] ?? ""}
                                  onChange={(e) =>
                                    setEditingTotal((prev) => ({ ...prev, [sid]: e.target.value }))
                                  }
                                  placeholder="new total"
                                  className="w-24 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                                />
                                <button
                                  onClick={() => updateMarks(sid, r.total_max_marks)}
                                  disabled={savingId === sid}
                                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                                >
                                  {savingId === sid ? (
                                    <>
                                      <Loader2 size={13} className="animate-spin" /> Saving
                                    </>
                                  ) : (
                                    <>
                                      <Save size={13} /> Update
                                    </>
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => toggleExpand(rowKey)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
                              >
                                {expanded[rowKey] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                {expanded[rowKey] ? "Hide" : "View"}
                              </button>
                            </td>
                          </tr>

                          {expanded[rowKey] && (
                            <tr className="bg-emerald-50/40">
                              <td colSpan={8} className="px-4 py-4">
                                <div className="rounded-xl border border-emerald-200 bg-white p-3">
                                  <h4 className="mb-3 text-sm font-semibold text-slate-900">
                                    Validation + Question-wise Marks
                                  </h4>

                                  <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800">
                                    <p>
                                      <span className="font-semibold">Attempted:</span>{" "}
                                      {safe(r?.validation?.attempted_questions, 0)} / {safe(r?.validation?.expected_questions, 0)}
                                    </p>
                                    <p className="mt-1">
                                      <span className="font-semibold">Status:</span> {safe(r?.validation?.status)}
                                    </p>
                                    <p className="mt-1">
                                      <span className="font-semibold">Missing Questions:</span>{" "}
                                      {Array.isArray(r?.validation?.missing_questions) && r.validation.missing_questions.length
                                        ? r.validation.missing_questions.join(", ")
                                        : "None"}
                                    </p>
                                  </div>

                                  <div className="overflow-x-auto">
                                    <table className="min-w-full text-xs">
                                      <thead>
                                        <tr className="bg-slate-100 text-slate-900">
                                          <th className="px-3 py-2 text-left font-semibold">Q No</th>
                                          <th className="px-3 py-2 text-left font-semibold">Awarded</th>
                                          <th className="px-3 py-2 text-left font-semibold">Max</th>
                                          <th className="px-3 py-2 text-left font-semibold">Keyword</th>
                                          <th className="px-3 py-2 text-left font-semibold">Semantic</th>
                                          <th className="px-3 py-2 text-left font-semibold">Feedback</th>
                                          <th className="px-3 py-2 text-left font-semibold">Update Q Marks</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {(r.question_scores || []).map((q, idx) => {
                                          const qKey = `${sid}_${q.q_no}`;
                                          return (
                                            <tr key={idx} className="border-t border-slate-200">
                                              <td className="px-3 py-2 font-semibold text-slate-900">Q{q.q_no}</td>
                                              <td className="px-3 py-2 font-semibold text-emerald-700">{q.awarded_marks}</td>
                                              <td className="px-3 py-2 text-slate-800">{q.max_marks}</td>
                                              <td className="px-3 py-2 text-slate-800">{q.keyword_score}</td>
                                              <td className="px-3 py-2 text-slate-800">{q.semantic_score}</td>
                                              <td className="px-3 py-2 text-slate-800">{q.feedback || "-"}</td>
                                              <td className="px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                  <input
                                                    type="number"
                                                    min={0}
                                                    max={q.max_marks}
                                                    value={editingQuestion[qKey] ?? ""}
                                                    onChange={(e) =>
                                                      setEditingQuestion((prev) => ({
                                                        ...prev,
                                                        [qKey]: e.target.value,
                                                      }))
                                                    }
                                                    placeholder="marks"
                                                    className="w-20 rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-900 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100"
                                                  />
                                                  <button
                                                    onClick={() => updateQuestionMarks(sid, q.q_no, q.max_marks)}
                                                    disabled={savingQuestionKey === qKey}
                                                    className="inline-flex items-center gap-1 rounded-md bg-slate-700 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                                                  >
                                                    {savingQuestionKey === qKey ? (
                                                      <>
                                                        <Loader2 size={12} className="animate-spin" />
                                                        Saving
                                                      </>
                                                    ) : (
                                                      <>
                                                        <Save size={12} />
                                                        Save
                                                      </>
                                                    )}
                                                  </button>
                                                </div>
                                              </td>
                                            </tr>
                                          );
                                        })}

                                        {(!r.question_scores || r.question_scores.length === 0) && (
                                          <tr>
                                            <td colSpan={7} className="px-3 py-3 text-slate-700">
                                              No question-wise data found.
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </Protected>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 inline-flex rounded-lg bg-emerald-100 p-2 text-emerald-700">{icon}</div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-600">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function MiniCard({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-1 inline-flex items-center gap-1 text-slate-600">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}