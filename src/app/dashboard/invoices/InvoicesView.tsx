"use client";
import { useState, useRef, useEffect } from "react";
import {
  FileText, Plus, Search, MoreHorizontal, CheckCircle2,
  Send, Trash2, X, AlertCircle, Loader2, Calendar,
  DollarSign, User, Mail, Phone, Building2, Hash,
  Clock, TrendingUp, AlertTriangle, ChevronDown,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/app/lib/supabase/browser-client";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string | null;
  client_id: string | null;
  client_name: string;
  amount: number;
  due_date: string;
  status: "paid" | "pending" | "overdue";
  description: string | null;
  notes: string | null;
  created_at: string;
}

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

interface Props {
  initialInvoices: Invoice[];
  clients: Client[];
  userId: string;
}

// ── Colors ────────────────────────────────────────────────────────────────────
const C = {
  card:    "#0f1f18",
  border:  "rgba(255,255,255,0.06)",
  emerald: "#34d399",
  red:     "#f87171",
  amber:   "#fbbf24",
  blue:    "#60a5fa",
  gray500: "#6b7280",
  gray400: "#9ca3af",
};

const statusCfg = {
  paid:    { color: "#34d399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.25)",  label: "Paid",    icon: <CheckCircle2 size={11} /> },
  pending: { color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.25)",  label: "Pending", icon: <Clock size={11} /> },
  overdue: { color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.25)", label: "Overdue", icon: <AlertTriangle size={11} /> },
};

const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);

const autoInvoiceNumber = () => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `INV-${num}`;
};

// ── Invoice Modal ─────────────────────────────────────────────────────────────
function InvoiceModal({ invoice, clients, onClose, onSave }: {
  invoice?: Invoice | null;
  clients: Client[];
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}) {
  const [form, setForm] = useState({
    invoice_number: invoice?.invoice_number || autoInvoiceNumber(),
    client_name:    invoice?.client_name    || "",
    client_id:      invoice?.client_id      || "",
    amount:         invoice?.amount?.toString() || "",
    due_date:       invoice?.due_date        || "",
    status:         invoice?.status          || "pending",
    description:    invoice?.description     || "",
    notes:          invoice?.notes           || "",
    // extra client fields for new clients
    client_email:   "",
    client_phone:   "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [clientMode, setClientMode] = useState<"existing" | "new">(
    clients.length > 0 ? "existing" : "new"
  );

  const h = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const selectClient = (id: string) => {
    const c = clients.find((c) => c.id === id);
    if (c) {
      setForm((p) => ({ ...p, client_id: c.id, client_name: c.name, client_email: c.email || "", client_phone: c.phone || "" }));
    }
  };

  const submit = async () => {
    if (!form.client_name.trim()) { setError("Client name is required"); return; }
    if (!form.amount || isNaN(Number(form.amount))) { setError("Valid amount is required"); return; }
    if (!form.due_date) { setError("Due date is required"); return; }
    setLoading(true); setError("");
    try {
      await onSave({
        invoice_number: form.invoice_number,
        client_name:    form.client_name,
        client_id:      form.client_id || null,
        amount:         parseFloat(form.amount),
        due_date:       form.due_date,
        status:         form.status,
        description:    form.description || null,
        notes:          form.notes || null,
      });
      onClose();
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.05)",
    border: `1px solid ${C.border}`, borderRadius: 10,
    padding: "10px 12px", fontSize: 13, color: "#fff",
    outline: "none", fontFamily: "Inter,sans-serif",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12, color: C.gray400, fontWeight: 500,
    display: "block", marginBottom: 6,
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#0c1d16", border: `1px solid ${C.border}`, borderRadius: 24, width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 32px 100px rgba(0,0,0,0.7)" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 28px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>
              {invoice ? "Edit Invoice" : "New Invoice"}
            </h2>
            <p style={{ fontSize: 12, color: C.gray500, marginTop: 2 }}>
              {invoice ? `Editing ${invoice.invoice_number}` : `Invoice # ${form.invoice_number}`}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, borderRadius: 8, padding: 7, cursor: "pointer", color: C.gray500, display: "flex" }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
          {error && (
            <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, color: C.red, fontSize: 13 }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {/* Invoice number */}
          <div>
            <label style={labelStyle}>Invoice Number</label>
            <div style={{ position: "relative" }}>
              <Hash size={14} color={C.gray500} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input value={form.invoice_number} onChange={(e) => h("invoice_number", e.target.value)}
                style={{ ...inputStyle, paddingLeft: 36 }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(52,211,153,0.4)")}
                onBlur={(e) => (e.target.style.borderColor = C.border)} />
            </div>
          </div>

          {/* Client section */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Client</label>
              {clients.length > 0 && (
                <div style={{ display: "flex", gap: 6 }}>
                  {(["existing", "new"] as const).map((m) => (
                    <button key={m} onClick={() => setClientMode(m)} style={{
                      fontSize: 11, padding: "3px 10px", borderRadius: 6, cursor: "pointer",
                      border: clientMode === m ? "1px solid rgba(52,211,153,0.4)" : `1px solid ${C.border}`,
                      background: clientMode === m ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.03)",
                      color: clientMode === m ? C.emerald : C.gray500,
                      fontFamily: "Inter,sans-serif",
                    }}>
                      {m === "existing" ? "Existing" : "New"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {clientMode === "existing" && clients.length > 0 ? (
              <div style={{ position: "relative" }}>
                <User size={14} color={C.gray500} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", zIndex: 1 }} />
                <ChevronDown size={14} color={C.gray500} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", zIndex: 1 }} />
                <select
                  value={form.client_id}
                  onChange={(e) => selectClient(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: 36, paddingRight: 36, appearance: "none", cursor: "pointer" }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(52,211,153,0.4)")}
                  onBlur={(e) => (e.target.style.borderColor = C.border)}
                >
                  <option value="" style={{ background: "#0c1d16" }}>Select a client…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id} style={{ background: "#0c1d16" }}>{c.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { key: "client_name",  placeholder: "Full name *",       icon: <User size={13} /> },
                  { key: "client_email", placeholder: "Email address",     icon: <Mail size={13} /> },
                  { key: "client_phone", placeholder: "Phone number",      icon: <Phone size={13} /> },
                ].map(({ key, placeholder, icon }) => (
                  <div key={key} style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.gray500 }}>{icon}</span>
                    <input value={(form as any)[key]} onChange={(e) => h(key, e.target.value)} placeholder={placeholder}
                      style={{ ...inputStyle, paddingLeft: 36 }}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(52,211,153,0.4)")}
                      onBlur={(e) => (e.target.style.borderColor = C.border)} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Amount + Due date */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Amount</label>
              <div style={{ position: "relative" }}>
                <DollarSign size={14} color={C.gray500} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input type="number" value={form.amount} onChange={(e) => h("amount", e.target.value)} placeholder="0.00"
                  style={{ ...inputStyle, paddingLeft: 36 }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(52,211,153,0.4)")}
                  onBlur={(e) => (e.target.style.borderColor = C.border)} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Due Date</label>
              <div style={{ position: "relative" }}>
                <Calendar size={14} color={C.gray500} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input type="date" value={form.due_date} onChange={(e) => h("due_date", e.target.value)}
                  style={{ ...inputStyle, paddingLeft: 36, colorScheme: "dark" }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(52,211,153,0.4)")}
                  onBlur={(e) => (e.target.style.borderColor = C.border)} />
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label style={labelStyle}>Status</label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["pending", "paid", "overdue"] as const).map((s) => {
                const cfg = statusCfg[s];
                return (
                  <button key={s} onClick={() => h("status", s)} style={{
                    flex: 1, padding: "8px 0", borderRadius: 10, cursor: "pointer",
                    fontSize: 12, fontWeight: 500, fontFamily: "Inter,sans-serif",
                    border: form.status === s ? `1px solid ${cfg.border}` : `1px solid ${C.border}`,
                    background: form.status === s ? cfg.bg : "rgba(255,255,255,0.03)",
                    color: form.status === s ? cfg.color : C.gray500,
                    transition: "all 0.15s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                  }}>
                    {cfg.icon} {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={form.description} onChange={(e) => h("description", e.target.value)}
              placeholder="What is this invoice for? e.g. Website redesign, 3 months consulting…"
              rows={3}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(52,211,153,0.4)")}
              onBlur={(e) => (e.target.style.borderColor = C.border)} />
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes <span style={{ color: C.gray500, fontWeight: 400 }}>(optional)</span></label>
            <textarea value={form.notes} onChange={(e) => h("notes", e.target.value)}
              placeholder="Payment terms, bank details, additional info…"
              rows={2}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(52,211,153,0.4)")}
              onBlur={(e) => (e.target.style.borderColor = C.border)} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "18px 28px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 10, justifyContent: "flex-end", flexShrink: 0 }}>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 500, color: C.gray400, cursor: "pointer", fontFamily: "Inter,sans-serif" }}>
            Cancel
          </button>
          <button onClick={submit} disabled={loading} style={{ background: "linear-gradient(135deg,#34d399,#10b981)", border: "none", borderRadius: 10, padding: "10px 28px", fontSize: 13, fontWeight: 600, color: "#fff", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", gap: 6, fontFamily: "Inter,sans-serif" }}>
            {loading && <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />}
            {invoice ? "Save Changes" : "Create Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm ────────────────────────────────────────────────────────────
function DeleteConfirm({ invoice, onConfirm, onCancel }: { invoice: Invoice; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#0c1d16", border: `1px solid ${C.border}`, borderRadius: 20, width: "100%", maxWidth: 380, padding: 28, textAlign: "center", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Trash2 size={20} color={C.red} />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Delete Invoice</h3>
        <p style={{ fontSize: 13, color: C.gray400, marginBottom: 6, lineHeight: 1.5 }}>
          Delete <strong style={{ color: "#fff" }}>{invoice.invoice_number || "this invoice"}</strong> for <strong style={{ color: "#fff" }}>{invoice.client_name}</strong>?
        </p>
        <p style={{ fontSize: 12, color: C.gray500, marginBottom: 24 }}>This cannot be undone.</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 0", fontSize: 13, fontWeight: 500, color: C.gray400, cursor: "pointer", fontFamily: "Inter,sans-serif" }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.4)", borderRadius: 10, padding: "10px 0", fontSize: 13, fontWeight: 600, color: C.red, cursor: "pointer", fontFamily: "Inter,sans-serif" }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Reminder Modal ────────────────────────────────────────────────────────────
function ReminderModal({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    setLoading(true);
    // TODO: wire up to /api/send-reminder when you build the email API
    await new Promise((r) => setTimeout(r, 1200)); // simulate
    setSent(true);
    setLoading(false);
    setTimeout(onClose, 1500);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#0c1d16", border: `1px solid ${C.border}`, borderRadius: 20, width: "100%", maxWidth: 400, padding: 28, textAlign: "center", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          {sent ? <CheckCircle2 size={20} color={C.emerald} /> : <Send size={20} color={C.blue} />}
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
          {sent ? "Reminder Sent!" : "Send Reminder"}
        </h3>
        {!sent ? (
          <>
            <p style={{ fontSize: 13, color: C.gray400, marginBottom: 6, lineHeight: 1.5 }}>
              Send a payment reminder to <strong style={{ color: "#fff" }}>{invoice.client_name}</strong>
            </p>
            <p style={{ fontSize: 13, color: C.amber, marginBottom: 24, fontWeight: 600 }}>
              {fmt(invoice.amount)} due {new Date(invoice.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
            <p style={{ fontSize: 11, color: C.gray500, marginBottom: 20 }}>
              📧 Email reminders will be connected when you set up your email API
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onClose} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 0", fontSize: 13, fontWeight: 500, color: C.gray400, cursor: "pointer", fontFamily: "Inter,sans-serif" }}>Cancel</button>
              <button onClick={send} disabled={loading} style={{ flex: 1, background: "rgba(96,165,250,0.15)", border: "1px solid rgba(96,165,250,0.4)", borderRadius: 10, padding: "10px 0", fontSize: 13, fontWeight: 600, color: C.blue, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "Inter,sans-serif" }}>
                {loading ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={13} />}
                {loading ? "Sending…" : "Send Now"}
              </button>
            </div>
          </>
        ) : (
          <p style={{ fontSize: 13, color: C.emerald }}>Reminder queued successfully ✓</p>
        )}
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function InvoicesView({ initialInvoices, clients, userId }: Props) {
  const supabase = getSupabaseBrowserClient();
  const [invoices, setInvoices]         = useState<Invoice[]>(initialInvoices);
  const [search, setSearch]             = useState("");
  const [filter, setFilter]             = useState<"all" | "paid" | "pending" | "overdue">("all");
  const [showModal, setShowModal]       = useState(false);
  const [editInvoice, setEditInvoice]   = useState<Invoice | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);
  const [reminderTarget, setReminderTarget] = useState<Invoice | null>(null);
  const [menuOpen, setMenuOpen]         = useState<string | null>(null);
  const menuRef                         = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(null);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── Filtered ──
  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    const matchSearch = inv.client_name.toLowerCase().includes(q) ||
      (inv.invoice_number || "").toLowerCase().includes(q) ||
      (inv.description || "").toLowerCase().includes(q);
    const matchFilter = filter === "all" || inv.status === filter;
    return matchSearch && matchFilter;
  });

  // ── Stats ──
  const total    = invoices.length;
  const paid     = invoices.filter((i) => i.status === "paid");
  const pending  = invoices.filter((i) => i.status === "pending");
  const overdue  = invoices.filter((i) => i.status === "overdue");
  const totalRev = paid.reduce((s, i) => s + i.amount, 0);
  const outstanding = [...pending, ...overdue].reduce((s, i) => s + i.amount, 0);

  // ── CRUD ──
  const handleCreate = async (data: any) => {
    const { data: inserted, error } = await supabase
      .from("invoices").insert([{ ...data, user_id: userId }]).select().single();
    if (error) throw new Error(error.message);
    setInvoices((p) => [inserted, ...p]);
  };

  const handleEdit = async (data: any) => {
    const { data: updated, error } = await supabase
      .from("invoices").update(data).eq("id", editInvoice!.id).select().single();
    if (error) throw new Error(error.message);
    setInvoices((p) => p.map((i) => i.id === updated.id ? updated : i));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("invoices").delete().eq("id", deleteTarget.id);
    if (!error) setInvoices((p) => p.filter((i) => i.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const markPaid = async (invoice: Invoice) => {
    const { data: updated, error } = await supabase
      .from("invoices").update({ status: "paid" }).eq("id", invoice.id).select().single();
    if (!error) setInvoices((p) => p.map((i) => i.id === updated.id ? updated : i));
    setMenuOpen(null);
  };

  const isOverdue = (inv: Invoice) =>
    inv.status === "pending" && new Date(inv.due_date) < new Date();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        .inv * { box-sizing: border-box; font-family: 'Inter', sans-serif; }
        .inv-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 9px 12px 9px 36px; font-size: 13px; color: #e5e7eb; width: 100%; outline: none; transition: border 0.2s; }
        .inv-input::placeholder { color: #4b5563; }
        .inv-input:focus { border-color: rgba(52,211,153,0.4); }
        .inv-row { transition: background 0.15s; border-bottom: 1px solid rgba(255,255,255,0.04); cursor: default; }
        .inv-row:hover { background: rgba(52,211,153,0.03); }
        .inv-filter { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 7px 14px; font-size: 12px; font-weight: 500; color: #6b7280; cursor: pointer; transition: all 0.15s; font-family: Inter,sans-serif; }
        .inv-filter:hover { color: #fff; }
        .inv-filter-active { background: rgba(52,211,153,0.12) !important; border-color: rgba(52,211,153,0.3) !important; color: #34d399 !important; }
        .inv-scrollbar::-webkit-scrollbar { width: 4px; }
        .inv-scrollbar::-webkit-scrollbar-thumb { background: #1a3a26; border-radius: 2px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .inv-fade { animation: fadeUp 0.25s ease forwards; }
      `}</style>

      <div className="inv" style={{ padding: 24, flex: 1, color: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* ── Header ── */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>Invoices</h1>
              <p style={{ fontSize: 13, color: C.gray500, marginTop: 4 }}>{total} total invoices</p>
            </div>
            <button
              onClick={() => { setEditInvoice(null); setShowModal(true); }}
              style={{ background: "linear-gradient(135deg,#34d399,#10b981)", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 20px rgba(52,211,153,0.25)" }}
            >
              <Plus size={15} /> New Invoice
            </button>
          </div>

          {/* ── Stat Cards ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 24 }}>
            {[
              { label: "Total Invoices",  value: total,              icon: <FileText size={15} />,      color: C.blue,    sub: "all time" },
              { label: "Paid",            value: paid.length,        icon: <CheckCircle2 size={15} />,  color: C.emerald, sub: fmt(totalRev) },
              { label: "Pending",         value: pending.length,     icon: <Clock size={15} />,         color: C.amber,   sub: fmt(outstanding) + " outstanding" },
              { label: "Overdue",         value: overdue.length,     icon: <AlertTriangle size={15} />, color: C.red,     sub: overdue.length > 0 ? "needs attention" : "all clear" },
              { label: "Revenue Collected", value: fmt(totalRev),   icon: <TrendingUp size={15} />,    color: C.emerald, sub: "from paid invoices" },
            ].map((s) => (
              <div key={s.label} className="inv-fade" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, boxShadow: "0 2px 16px rgba(0,0,0,0.3)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ color: s.color }}>{s.icon}</div>
                  <span style={{ fontSize: 11, color: C.gray500, fontWeight: 500 }}>{s.label}</span>
                </div>
                <p style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", marginBottom: 4 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: C.gray500 }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Search + Filter ── */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <Search size={14} color="#4b5563" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input className="inv-input" placeholder="Search by client, invoice #, description…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {(["all", "paid", "pending", "overdue"] as const).map((f) => (
                <button key={f} className={`inv-filter ${filter === f ? "inv-filter-active" : ""}`} onClick={() => setFilter(f)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {f !== "all" && (
                    <span style={{ marginLeft: 5, fontSize: 10, opacity: 0.7 }}>
                      ({f === "paid" ? paid.length : f === "pending" ? pending.length : overdue.length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Table ── */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "120px 1.5fr 1fr 1fr 90px 90px 48px", padding: "12px 20px", borderBottom: `1px solid ${C.border}`, gap: 12 }}>
              {["Invoice #", "Client", "Amount", "Due Date", "Status", "Actions", ""].map((h) => (
                <span key={h} style={{ fontSize: 11, color: "#4b5563", fontWeight: 500 }}>{h}</span>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: 56, textAlign: "center" }}>
                <FileText size={36} color="#1f2d27" style={{ margin: "0 auto 12px" }} />
                <p style={{ fontSize: 15, fontWeight: 600, color: "#374151", marginBottom: 4 }}>
                  {search ? "No invoices match your search" : "No invoices yet"}
                </p>
                <p style={{ fontSize: 13, color: C.gray500, marginBottom: 20 }}>
                  {!search && "Create your first invoice to get started"}
                </p>
                {!search && (
                  <button
                    onClick={() => { setEditInvoice(null); setShowModal(true); }}
                    style={{ background: "linear-gradient(135deg,#34d399,#10b981)", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    <Plus size={14} /> Create Invoice
                  </button>
                )}
              </div>
            ) : (
              filtered.map((inv) => {
                const cfg = statusCfg[inv.status] || statusCfg.pending;
                const overdue = isOverdue(inv);
                return (
                  <div key={inv.id} className="inv-row" style={{ display: "grid", gridTemplateColumns: "120px 1.5fr 1fr 1fr 90px 90px 48px", padding: "14px 20px", alignItems: "center", gap: 12 }}>

                    {/* Invoice # */}
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#fff", fontFamily: "monospace" }}>{inv.invoice_number || "—"}</p>
                      <p style={{ fontSize: 11, color: C.gray500, marginTop: 2 }}>
                        {new Date(inv.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>

                    {/* Client */}
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{inv.client_name}</p>
                      {inv.description && (
                        <p style={{ fontSize: 11, color: C.gray500, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>
                          {inv.description}
                        </p>
                      )}
                    </div>

                    {/* Amount */}
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{fmt(inv.amount)}</p>

                    {/* Due date */}
                    <div>
                      <p style={{ fontSize: 12, color: overdue ? C.red : C.gray400 }}>
                        {new Date(inv.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                      {overdue && <p style={{ fontSize: 10, color: C.red, fontWeight: 600, marginTop: 1 }}>OVERDUE</p>}
                    </div>

                    {/* Status badge */}
                    <span style={{ fontSize: 11, fontWeight: 500, padding: "4px 10px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 4, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, whiteSpace: "nowrap" }}>
                      {cfg.icon} {cfg.label}
                    </span>

                    {/* Quick actions */}
                    <div style={{ display: "flex", gap: 6 }}>
                      {inv.status !== "paid" && (
                        <button
                          onClick={() => markPaid(inv)}
                          title="Mark as paid"
                          style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 7, padding: "5px 8px", cursor: "pointer", color: C.emerald, display: "flex", alignItems: "center", fontSize: 11, gap: 4, fontFamily: "Inter,sans-serif", transition: "all 0.15s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(52,211,153,0.18)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(52,211,153,0.08)")}
                        >
                          <CheckCircle2 size={11} /> Paid
                        </button>
                      )}
                    </div>

                    {/* Menu */}
                    <div style={{ position: "relative" }} ref={menuOpen === inv.id ? menuRef : undefined}>
                      <button
                        onClick={() => setMenuOpen(menuOpen === inv.id ? null : inv.id)}
                        style={{ background: "transparent", border: "none", cursor: "pointer", color: C.gray500, borderRadius: 8, padding: 6, display: "flex" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {menuOpen === inv.id && (
                        <div style={{ position: "fixed", background: "#0c1d16", border: `1px solid ${C.border}`, borderRadius: 10, width: 170, boxShadow: "0 12px 40px rgba(0,0,0,0.5)", zIndex: 99999, overflow: "hidden", transform: "translateX(-130px) translateY(-10px)" }}>
                          {[
                            { label: "Edit",          icon: <FileText size={13} />,     action: () => { setEditInvoice(inv); setShowModal(true); setMenuOpen(null); }, color: "#e5e7eb" },
                            ...(inv.status !== "paid" ? [{ label: "Mark as Paid", icon: <CheckCircle2 size={13} />, action: () => markPaid(inv), color: C.emerald }] : []),
                            { label: "Send Reminder", icon: <Send size={13} />,         action: () => { setReminderTarget(inv); setMenuOpen(null); }, color: C.blue },
                            { label: "Delete",        icon: <Trash2 size={13} />,       action: () => { setDeleteTarget(inv); setMenuOpen(null); }, color: C.red },
                          ].map((item) => (
                            <button key={item.label} onClick={item.action}
                              style={{ width: "100%", background: "none", border: "none", padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: item.color, textAlign: "left", fontFamily: "Inter,sans-serif" }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                            >
                              {item.icon} {item.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {filtered.length > 0 && (
              <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.gray500, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Showing {filtered.length} of {total} invoices</span>
                <span style={{ color: C.emerald, fontWeight: 600 }}>Total: {fmt(filtered.reduce((s, i) => s + i.amount, 0))}</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {showModal && (
        <InvoiceModal
          invoice={editInvoice}
          clients={clients}
          onClose={() => { setShowModal(false); setEditInvoice(null); }}
          onSave={editInvoice ? handleEdit : handleCreate}
        />
      )}
      {deleteTarget && <DeleteConfirm invoice={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}
      {reminderTarget && <ReminderModal invoice={reminderTarget} onClose={() => setReminderTarget(null)} />}
    </>
  );
}