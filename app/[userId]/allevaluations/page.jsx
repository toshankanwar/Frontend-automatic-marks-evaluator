"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, ClipboardList, BookOpenCheck } from "lucide-react";
import api from "@/lib/api";
import Protected from "@/components/Protected";
import Navbar from "@/components/Navbar";
import EvalCard from "@/components/EvalCard";
import toast from "react-hot-toast";
export const runtime = "edge";
export default function AllEvaluationsPage() {
  const params = useParams();
  const router = useRouter();

  const userId = useMemo(() => {
    const u = params?.userId;
    return Array.isArray(u) ? u[0] : u;
  }, [params]);

  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: "", subject: "" });
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const getEvalId = (ev) => ev?.id || ev?._id || "";
  const normalizeItems = (arr) => (Array.isArray(arr) ? arr.map((ev) => ({ ...ev, id: getEvalId(ev) })) : []);

  const loadData = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const { data } = await api.get(`/users/${userId}/evaluations`);
      setItems(normalizeItems(data));
    } catch (e) {
      console.error("loadData error:", e?.response?.status, e?.response?.data || e?.message);
      toast.error(e?.response?.data?.detail || "Failed to load evaluations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const createEval = async (e) => {
    e?.preventDefault?.();
    if (!userId) return toast.error("User not found");
    if (!form.title.trim()) return toast.error("Please enter evaluation title");
    if (!form.subject.trim()) return toast.error("Please enter subject");

    const payload = {
      title: form.title.trim(),
      subject: form.subject.trim(),
      question_schema: [
        { q_no: 1, max_marks: 5 },
        { q_no: 2, max_marks: 5 },
      ],
    };

    try {
      setCreating(true);
      await api.post(`/users/${userId}/evaluations`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      toast.success("Evaluation created");
      setForm({ title: "", subject: "" });
      await loadData();
    } catch (e) {
      console.error("createEval error:", e?.response?.status, e?.response?.data || e?.message);
      toast.error(e?.response?.data?.detail || e?.response?.data?.message || "Create failed");
    } finally {
      setCreating(false);
    }
  };

  const deleteEval = async (evaluationId) => {
    if (!userId || !evaluationId) return;

    const ok = window.confirm("Delete this evaluation and all related results?");
    if (!ok) return;

    try {
      setDeletingId(evaluationId);
      await api.delete(`/users/${userId}/evaluations/${evaluationId}`);

      toast.success("Evaluation deleted");
      setItems((prev) => prev.filter((x) => (x.id || x._id) !== evaluationId));
    } catch (e) {
      console.error("deleteEval full error:", e);
      console.error("deleteEval status:", e?.response?.status);
      console.error("deleteEval data:", e?.response?.data);
      console.error("deleteEval message:", e?.message);

      toast.error(
        e?.response?.data?.detail ||
          (e?.response?.status === 404
            ? "Delete API not found / evaluation not found"
            : e?.response?.status === 405
            ? "DELETE method not allowed"
            : "Delete failed")
      );
    } finally {
      setDeletingId("");
    }
  };

  return (
    <Protected>
      <Navbar />

      <main className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-emerald-50 via-green-50 to-white">
        <section className="mx-auto max-w-6xl px-4 pb-10 pt-6">
          <div className="mb-6 rounded-3xl border border-emerald-100 bg-white/85 p-6 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                  <BookOpenCheck size={14} />
                  Evaluation Dashboard
                </p>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 md:text-3xl">
                  All Evaluations
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Create, upload answer sheets, and view final results from one place.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm">
                <span className="font-semibold">{items.length}</span> total evaluations
              </div>
            </div>
          </div>

          <form onSubmit={createEval} className="mb-8 rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                <Plus size={18} />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Create New Evaluation</h2>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
            <input
  className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-800 caret-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 autofill:shadow-[inset_0_0_0px_1000px_white] autofill:[-webkit-text-fill-color:#1e293b]"
  placeholder="Evaluation title (e.g. Mid Sem AI)"
  value={form.title}
  onChange={(e) => setForm({ ...form, title: e.target.value })}
/>

<input
  className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-800 caret-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 autofill:shadow-[inset_0_0_0px_1000px_white] autofill:[-webkit-text-fill-color:#1e293b]"
  placeholder="Subject (e.g. Machine Learning)"
  value={form.subject}
  onChange={(e) => setForm({ ...form, subject: e.target.value })}
/>
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus size={16} />
                {creating ? "Creating..." : "Create Evaluation"}
              </button>
            </div>
          </form>

          {loading ? (
            <div className="rounded-2xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-slate-500">Loading evaluations...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-emerald-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto mb-3 w-fit rounded-full bg-emerald-100 p-3 text-emerald-700">
                <ClipboardList size={22} />
              </div>
              <p className="text-base font-semibold text-slate-700">No evaluations yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Create your first evaluation using the form above.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((ev) => {
                const evId = getEvalId(ev);
                return (
                  <EvalCard
                    key={evId}
                    ev={ev}
                    onOpenUpload={() => router.push(`/${userId}/${evId}/upload`)}
                    onOpenResults={() => router.push(`/${userId}/${evId}/results`)}
                    onDelete={() => deleteEval(evId)}
                    deleting={deletingId === evId}
                  />
                );
              })}
            </div>
          )}
        </section>
      </main>
    </Protected>
  );
}