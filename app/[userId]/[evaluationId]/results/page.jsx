"use client";

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
  const [editing, setEditing] = useState({});
  const [savingId, setSavingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("marks_desc");

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

  const updateMarks = async (studentId, totalMax) => {
    const raw = editing[studentId];
    const val = Number(raw);

    if (raw === undefined || raw === "") return toast.error("Enter marks first");
    if (Number.isNaN(val)) return toast.error("Invalid marks");
    if (val < 0) return toast.error("Marks cannot be negative");
    if (val > Number(totalMax)) return toast.error(`Marks cannot exceed ${totalMax}`);

    try {
      setSavingId(studentId);
      await api.patch(`/users/${userId}/evaluations/${evaluationId}/results/${studentId}`, {
        total_marks: val,
        note: "Teacher updated",
      });
      toast.success("Marks updated");
      await load();
      setEditing((prev) => ({ ...prev, [studentId]: "" }));
    } catch (e) {
      console.error(e?.response?.data || e.message);
      toast.error("Update failed");
    } finally {
      setSavingId("");
    }
  };

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = [...results];

    if (q) {
      arr = arr.filter(
        (r) =>
          r.student_name?.toLowerCase().includes(q) ||
          r.student_id?.toLowerCase().includes(q)
      );
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
    if (!totalStudents) return { totalStudents: 0, avgMarks: 0, highest: 0 };

    const sum = results.reduce((acc, r) => acc + Number(r.total_marks || 0), 0);
    const highest = Math.max(...results.map((r) => Number(r.total_marks || 0)));

    return {
      totalStudents,
      avgMarks: (sum / totalStudents).toFixed(2),
      highest: highest.toFixed(2),
    };
  }, [results]);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const downloadExcel = () => {
    if (!results.length) {
      toast.error("No results to export");
      return;
    }

    // Summary sheet
    const summaryRows = results.map((r) => ({
      student_name: r.student_name || "", // file name
      student_id: r.student_id || "",
      total_marks: Number(r.total_marks || 0),
      total_max_marks: Number(r.total_max_marks || 0),
      manual_override: r.manual_override ? "Yes" : "No",
      created_at: r.created_at || "",
      updated_at: r.updated_at || "",
    }));

    // Question-wise sheet
    const questionWiseRows = [];
    results.forEach((r) => {
      if (Array.isArray(r.question_scores) && r.question_scores.length) {
        r.question_scores.forEach((q) => {
          questionWiseRows.push({
            student_name: r.student_name || "",
            student_id: r.student_id || "",
            q_no: q.q_no ?? "",
            awarded_marks: q.awarded_marks ?? "",
            max_marks: q.max_marks ?? "",
            keyword_score: q.keyword_score ?? "",
            semantic_score: q.semantic_score ?? "",
            feedback: q.feedback ?? "",
            total_marks: Number(r.total_marks || 0),
            total_max_marks: Number(r.total_max_marks || 0),
          });
        });
      } else {
        questionWiseRows.push({
          student_name: r.student_name || "",
          student_id: r.student_id || "",
          q_no: "",
          awarded_marks: "",
          max_marks: "",
          keyword_score: "",
          semantic_score: "",
          feedback: "No question-wise data",
          total_marks: Number(r.total_marks || 0),
          total_max_marks: Number(r.total_max_marks || 0),
        });
      }
    });

    const wb = XLSX.utils.book_new();
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    const wsQuestionWise = XLSX.utils.json_to_sheet(questionWiseRows);

    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
    XLSX.utils.book_append_sheet(wb, wsQuestionWise, "QuestionWise");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const fileBlob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(fileBlob, `evaluation_${evaluationId}_results.xlsx`);
    toast.success("Excel downloaded");
  };

  return (
    <Protected>
      <Navbar />
      <main className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-emerald-50 via-white to-white">
        <section className="mx-auto max-w-7xl px-4 py-6">
          {/* Header */}
          <div className="mb-6 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Evaluation Results
                </p>
                <h1 className="text-2xl font-semibold text-slate-900">Student Performance</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Question-wise breakdown + manual mark update.
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
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <StatCard icon={<Users size={16} />} label="Total Students" value={stats.totalStudents} />
            <StatCard icon={<Sigma size={16} />} label="Average Marks" value={stats.avgMarks} />
            <StatCard icon={<Trophy size={16} />} label="Highest Marks" value={stats.highest} />
          </div>

          {/* Toolbar */}
          <div className="mb-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_240px]">
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by student name or ID..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="relative">
              <SlidersHorizontal size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm font-medium text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              >
                <option className="bg-white text-slate-800" value="marks_desc">Marks: High to Low</option>
                <option className="bg-white text-slate-800" value="marks_asc">Marks: Low to High</option>
                <option className="bg-white text-slate-800" value="name_asc">Name: A to Z</option>
                <option className="bg-white text-slate-800" value="name_desc">Name: Z to A</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-slate-600">
                    <th className="px-4 py-3 text-left font-semibold">Student</th>
                    <th className="px-4 py-3 text-left font-semibold">Student ID</th>
                    <th className="px-4 py-3 text-left font-semibold">Total</th>
                    <th className="px-4 py-3 text-left font-semibold">Out Of</th>
                    <th className="px-4 py-3 text-left font-semibold">Override</th>
                    <th className="px-4 py-3 text-left font-semibold">Update</th>
                    <th className="px-4 py-3 text-left font-semibold">Details</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                        Loading results...
                      </td>
                    </tr>
                  ) : filteredSorted.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                        No results found.
                      </td>
                    </tr>
                  ) : (
                    filteredSorted.map((r) => (
                      <React.Fragment key={r.id}>
                        <tr className="border-t border-slate-100 hover:bg-emerald-50/30">
                          <td className="px-4 py-3 font-medium text-slate-800">{r.student_name}</td>
                          <td className="px-4 py-3 text-slate-600">{r.student_id}</td>
                          <td className="px-4 py-3 font-semibold text-emerald-700">{r.total_marks}</td>
                          <td className="px-4 py-3 text-slate-600">{r.total_max_marks}</td>
                          <td className="px-4 py-3">
                            {r.manual_override ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                                <CheckCircle2 size={13} /> Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
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
                                value={editing[r.student_id] ?? ""}
                                onChange={(e) =>
                                  setEditing((prev) => ({ ...prev, [r.student_id]: e.target.value }))
                                }
                                placeholder="new marks"
                                className="w-24 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                              />
                              <button
                                onClick={() => updateMarks(r.student_id, r.total_max_marks)}
                                disabled={savingId === r.student_id}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                              >
                                {savingId === r.student_id ? (
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
                              onClick={() => toggleExpand(r.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              {expanded[r.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              {expanded[r.id] ? "Hide" : "View"}
                            </button>
                          </td>
                        </tr>

                        {expanded[r.id] && (
                          <tr className="bg-emerald-50/40">
                            <td colSpan={7} className="px-4 py-4">
                              <div className="rounded-xl border border-emerald-100 bg-white p-3">
                                <h4 className="mb-2 text-sm font-semibold text-slate-800">
                                  Question-wise Marks
                                </h4>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full text-xs">
                                    <thead>
                                      <tr className="bg-slate-50 text-slate-600">
                                        <th className="px-3 py-2 text-left">Q No</th>
                                        <th className="px-3 py-2 text-left">Awarded</th>
                                        <th className="px-3 py-2 text-left">Max</th>
                                        <th className="px-3 py-2 text-left">Keyword</th>
                                        <th className="px-3 py-2 text-left">Semantic</th>
                                        <th className="px-3 py-2 text-left">Feedback</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(r.question_scores || []).map((q, idx) => (
                                        <tr key={idx} className="border-t">
                                          <td className="px-3 py-2">Q{q.q_no}</td>
                                          <td className="px-3 py-2 font-medium text-emerald-700">{q.awarded_marks}</td>
                                          <td className="px-3 py-2">{q.max_marks}</td>
                                          <td className="px-3 py-2">{q.keyword_score}</td>
                                          <td className="px-3 py-2">{q.semantic_score}</td>
                                          <td className="px-3 py-2">{q.feedback}</td>
                                        </tr>
                                      ))}
                                      {(!r.question_scores || r.question_scores.length === 0) && (
                                        <tr>
                                          <td colSpan={6} className="px-3 py-3 text-slate-500">
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
                    ))
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
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}