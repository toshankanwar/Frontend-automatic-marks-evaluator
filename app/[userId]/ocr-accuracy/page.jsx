"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Upload, FileText, History, BarChart3, ChevronDown, ChevronUp } from "lucide-react";

export default function OcrAccuracyPage() {
  const { userid } = useParams();
  const router = useRouter();

  const [file, setFile] = useState(null);
  const [groundTruth, setGroundTruth] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [expandedRows, setExpandedRows] = useState({});

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    loadHistory(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadHistory = async (token) => {
    try {
      setError("");
      const res = await fetch(`${API_BASE}/ocr-accuracy/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.detail || "Failed to load history");

      const rows = Array.isArray(data?.results) ? data.results : [];
      setHistory(rows);
    } catch (e) {
      console.error(e);
      setHistory([]);
      setError(e.message || "Could not load history");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please choose a file");
    if (!groundTruth.trim()) return alert("Please paste real (ground-truth) text");

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const form = new FormData();
    form.append("file", file);
    form.append("ground_truth_text", groundTruth);

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/ocr-accuracy/test`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Request failed");

      setResult(data);
      setGroundTruth("");
      setFile(null);
      await loadHistory(token);
    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const toPct = (val) => {
    const n = Number(val);
    if (Number.isNaN(n)) return "0.00%";
    return `${(n * 100).toFixed(2)}%`;
  };

  const toDate = (val) => {
    if (!val) return "-";
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return "-";
  
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(d);
  };
  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-emerald-50/40 to-white text-gray-900">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
          {/* Header */}
          <div className="mb-6 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-emerald-700">OCR Accuracy Lab</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Compare OCR output against ground-truth text, with visual diff per history row.
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-100">
                User: {userid}
              </span>
            </div>
          </div>

          {/* Form */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
              <Upload size={18} className="text-emerald-600" />
              Run New Test
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Upload PDF/Image</label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-emerald-700"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Ground Truth Text</label>
                <textarea
                  rows={10}
                  placeholder="Paste expected/actual text..."
                  value={groundTruth}
                  onChange={(e) => setGroundTruth(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Testing..." : "Run OCR Accuracy Test"}
              </button>
            </form>
          </section>

          {/* Latest */}
          {result?.metrics && (
            <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
                <BarChart3 size={18} className="text-emerald-600" />
                Latest Result
              </h2>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard label="CER" value={result.metrics?.cer ?? 0} />
                <MetricCard label="WER" value={result.metrics?.wer ?? 0} />
                <MetricCard label="Character Accuracy" value={toPct(result.metrics?.char_accuracy)} highlight />
                <MetricCard label="Word Accuracy" value={toPct(result.metrics?.word_accuracy)} highlight />
              </div>

              <h3 className="mt-5 mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FileText size={16} className="text-emerald-600" />
                Extracted Text
              </h3>
              <pre className="max-h-80 overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800 whitespace-pre-wrap">
                {result.extracted_text || "No text extracted"}
              </pre>
            </section>
          )}

          {/* History + Dropdown Diff */}
          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
              <History size={18} className="text-emerald-600" />
              Test History
            </h2>

            {error && (
              <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                {error}
              </p>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-gray-700">
                    <th className="px-3 py-2 font-semibold">File</th>
                    <th className="px-3 py-2 font-semibold">Char Accuracy</th>
                    <th className="px-3 py-2 font-semibold">Word Accuracy</th>
                    <th className="px-3 py-2 font-semibold">Date</th>
                    <th className="px-3 py-2 font-semibold">Compare</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length > 0 ? (
                    history.map((row, idx) => {
                      const rowId = row?.id ? String(row.id) : `idx-${idx}`;
                      const open = !!expandedRows[rowId];

                      const gt = row?.ground_truth_text || row?.groundTruthText || "";
                      const ex = row?.extracted_text || row?.extractedText || "";

                      return (
                        <React.Fragment key={`frag-${rowId}`}>
                          <tr className="border-b border-gray-100 text-gray-800 hover:bg-gray-50">
                            <td className="px-3 py-2">{row?.file_name || "Unknown file"}</td>
                            <td className="px-3 py-2">{toPct(row?.metrics?.char_accuracy)}</td>
                            <td className="px-3 py-2">{toPct(row?.metrics?.word_accuracy)}</td>
                            <td className="px-3 py-2">{toDate(row?.created_at)}</td>
                            <td className="px-3 py-2">
                              <button
                                onClick={() => toggleRow(rowId)}
                                className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                              >
                                {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                {open ? "Hide" : "Show"} Diff
                              </button>
                            </td>
                          </tr>

                          {open && (
                            <tr className="border-b border-gray-100">
                              <td colSpan={5} className="px-3 py-4 bg-gray-50/60">
                                <DiffView groundTruth={gt} extracted={ex} />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center text-gray-500">
                        No history yet. Run your first OCR accuracy test above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function MetricCard({ label, value, highlight = false }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`mt-1 text-base font-semibold ${highlight ? "text-emerald-700" : "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}

function normalizeToken(t) {
  return (t || "").toLowerCase().replace(/[^\w]/g, "");
}

function buildDiffTokens(groundTruth, extracted) {
  const gtTokens = (groundTruth || "").split(/\s+/).filter(Boolean);
  const exTokens = (extracted || "").split(/\s+/).filter(Boolean);

  const gtNormSet = new Set(gtTokens.map(normalizeToken).filter(Boolean));

  const extractedWithFlags = exTokens.map((tok) => ({
    token: tok,
    diff: !gtNormSet.has(normalizeToken(tok)),
  }));

  return { extractedWithFlags };
}

function DiffView({ groundTruth, extracted }) {
  const { extractedWithFlags } = useMemo(
    () => buildDiffTokens(groundTruth, extracted),
    [groundTruth, extracted]
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div>
        <h4 className="mb-2 text-sm font-semibold text-gray-700">Ground Truth (Actual)</h4>
        <pre className="max-h-80 overflow-auto rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-gray-800 whitespace-pre-wrap">
          {groundTruth || "No ground truth stored"}
        </pre>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-gray-700">OCR Extracted (Differences highlighted)</h4>
        <div className="max-h-80 overflow-auto rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-gray-800 leading-7">
          {extractedWithFlags.length ? (
            extractedWithFlags.map((item, i) => (
              <span
                key={`tok-${i}-${item.token}`}
                className={
                  item.diff
                    ? "bg-red-200 text-red-900 px-1 py-0.5 rounded mr-1 inline-block"
                    : "mr-1 inline-block"
                }
                title={item.diff ? "Different from ground truth token set" : "Matched"}
              >
                {item.token}
              </span>
            ))
          ) : (
            <span>No extracted text stored</span>
          )}
        </div>

        <p className="mt-2 text-xs text-gray-600">
          <span className="inline-block rounded bg-red-200 px-1.5 py-0.5 text-red-900 mr-1">Highlighted</span>
          tokens are found in OCR text but not found in ground-truth token set.
        </p>
      </div>
    </div>
  );
}