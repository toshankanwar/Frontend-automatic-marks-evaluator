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
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import api from "@/lib/api";
import Protected from "@/components/Protected";
import Navbar from "@/components/Navbar";
import toast from "react-hot-toast";

export default function ResultsPage() {
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

  const [results, setResults] = useState([]);
  const [editingTotal, setEditingTotal] = useState({});
  const [editingQuestion, setEditingQuestion] = useState({}); // key: `${studentId}_${qNo}`
  const [savingId, setSavingId] = useState("");
  const [savingQuestionKey, setSavingQuestionKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("marks_desc");

  const getStudentId = (r) => r?.student_id || r?.roll_no || r?.admission_no || r?.id || "N/A";

  const load = async () => {
    if (!userId || !evaluationId) return;
    try {
      setLoading(true);
      const { data } = await api.get(`/users/${userId}/evaluations/${evaluationId}/results`);
      setResults(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e?.response?.data || e.message);
      toast.error("Failed to fetch results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, evaluationId]);

  // Existing total update
  const updateMarks = async (studentId, totalMax) => {
    const raw = editingTotal[studentId];
    const val = Number(raw);

    if (raw === undefined || raw === "") return toast.error("Enter marks first");
    if (Number.isNaN(val)) return toast.error("Invalid marks");
    if (val < 0) return toast.error("Marks cannot be negative");
    if (val > Number(totalMax)) return toast.error(`Marks cannot exceed ${totalMax}`);

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

  // NEW per-question update
  // Backend endpoint expected:
  // PATCH /users/{userId}/evaluations/{evaluationId}/results/{studentId}/questions/{qNo}
  // body: { awarded_marks: number, note: "Teacher updated question mark" }
  const updateQuestionMarks = async (studentId, qNo, qMax) => {
    const key = `${studentId}_${qNo}`;
    const raw = editingQuestion[key];
    const val = Number(raw);

    if (raw === undefined || raw === "") return toast.error("Enter question marks first");
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
      if (sortBy === "name_desc") return (b.student_name || "").localeCompare(a.student_name || "");
      return (a.student_name || "").localeCompare(b.student_name || "");
    });

    return arr;
  }, [results, query, sortBy]);

  const stats = useMemo(() => {
    const totalStudents = results.length;
    if (!totalStudents) return { totalStudents: 0, avgMarks: "0.00", highest: "0.00" };

    const sum = results.reduce((acc, r) => acc + Number(r.total_marks || 0), 0);
    const highest = Math.max(...results.map((r) => Number(r.total_marks || 0)));

    return {
      totalStudents,
      avgMarks: (sum / totalStudents).toFixed(2),
      highest: highest.toFixed(2),
    };
  }, [results]);

  const toggleExpand = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  // Excel with per-question + aggregate; no created/updated time/date
  const downloadExcel = () => {
    if (!results.length) return toast.error("No results to export");
  
    // Find all question numbers
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
  
      return row;
    });
  
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "TeacherResults");
  
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
                  Question-wise breakdown + per-question and total mark update.
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

          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <StatCard icon={<Users size={16} />} label="Total Students" value={stats.totalStudents} />
            <StatCard icon={<Sigma size={16} />} label="Average Marks" value={stats.avgMarks} />
            <StatCard icon={<Trophy size={16} />} label="Highest Marks" value={stats.highest} />
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
                    <th className="px-4 py-3 text-left font-semibold">Override</th>
                    <th className="px-4 py-3 text-left font-semibold">Update Total</th>
                    <th className="px-4 py-3 text-left font-semibold">Details</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-700">
                        Loading results...
                      </td>
                    </tr>
                  ) : filteredSorted.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-700">
                        No results found.
                      </td>
                    </tr>
                  ) : (
                    filteredSorted.map((r) => {
                      const sid = getStudentId(r);
                      const rowKey = r.id || r._id || sid;
                      return (
                        <React.Fragment key={rowKey}>
                          <tr className="border-t border-slate-200 hover:bg-emerald-50/30">
                            <td className="px-4 py-3 font-medium text-slate-900">{r.student_name || "N/A"}</td>
                            <td className="px-4 py-3 font-medium text-slate-800">{sid}</td>
                            <td className="px-4 py-3 font-semibold text-emerald-700">{r.total_marks}</td>
                            <td className="px-4 py-3 text-slate-800">{r.total_max_marks}</td>
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
                              <td colSpan={7} className="px-4 py-4">
                                <div className="rounded-xl border border-emerald-200 bg-white p-3">
                                  <h4 className="mb-3 text-sm font-semibold text-slate-900">
                                    Question-wise Marks (Editable)
                                  </h4>

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