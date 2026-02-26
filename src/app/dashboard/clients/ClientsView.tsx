"use client";
import { useState, useEffect, useRef } from "react";
import {
  Users, Search, Plus, MoreHorizontal, Mail, Phone,
  Building2, TrendingUp, UserCheck, UserX, Trash2,
  Edit3, X, Check, ChevronLeft, AlertCircle, Loader2
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/app/lib/supabase/browser-client";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: "active" | "inactive";
  total_billed: number;
  created_at: string;
}

interface Props {
  initialClients: Client[];
  userId: string;
}

// ── Colors consistent with dashboard ─────────────────────────────────────────
const C = {
  bg:      "#0a1a14",
  sidebar: "#0c1d16",
  card:    "#0f1f18",
  border:  "rgba(255,255,255,0.06)",
  emerald: "#34d399",
  red:     "#f87171",
  amber:   "#fbbf24",
  gray500: "#6b7280",
  gray400: "#9ca3af",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const initials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const avatarColor = (name: string) => {
  const colors = [
    "linear-gradient(135deg,#34d399,#0d9488)",
    "linear-gradient(135deg,#60a5fa,#3b82f6)",
    "linear-gradient(135deg,#f472b6,#ec4899)",
    "linear-gradient(135deg,#fbbf24,#f59e0b)",
    "linear-gradient(135deg,#a78bfa,#8b5cf6)",
    "linear-gradient(135deg,#34d399,#059669)",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + hash * 31;
  return colors[Math.abs(hash) % colors.length];
};

const fmt = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`;

// ── Add/Edit Modal ────────────────────────────────────────────────────────────
function ClientModal({
  client,
  onClose,
  onSave,
}: {
  client?: Client | null;
  onClose: () => void;
  onSave: (data: Partial<Client>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: client?.name || "",
    email: client?.email || "",
    phone: client?.phone || "",
    company: client?.company || "",
    status: client?.status || "active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.name.trim()) { setError("Name is required"); return; }
    setLoading(true);
    setError("");
    try {
      await onSave(form);
      onClose();
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
    }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "#0f1f18",
        border: `1px solid ${C.border}`,
        borderRadius: 20,
        width: "100%", maxWidth: 460,
        boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "20px 24px",
          borderBottom: `1px solid ${C.border}`,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>
            {client ? "Edit Client" : "Add New Client"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.gray500 }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          {error && (
            <div style={{
              background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)",
              borderRadius: 10, padding: "10px 14px",
              display: "flex", alignItems: "center", gap: 8,
              color: C.red, fontSize: 13,
            }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {[
            { key: "name",    label: "Full Name *", placeholder: "John Smith",          icon: <Users size={14} /> },
            { key: "email",   label: "Email",       placeholder: "john@company.com",    icon: <Mail size={14} /> },
            { key: "phone",   label: "Phone",       placeholder: "+1 234 567 8900",     icon: <Phone size={14} /> },
            { key: "company", label: "Company",     placeholder: "Acme Corp",           icon: <Building2 size={14} /> },
          ].map(({ key, label, placeholder, icon }) => (
            <div key={key}>
              <label style={{ fontSize: 12, color: C.gray400, fontWeight: 500, display: "block", marginBottom: 6 }}>
                {label}
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.gray500 }}>
                  {icon}
                </span>
                <input
                  value={(form as any)[key]}
                  onChange={(e) => handle(key, e.target.value)}
                  placeholder={placeholder}
                  style={{
                    width: "100%", background: "rgba(255,255,255,0.05)",
                    border: `1px solid ${C.border}`, borderRadius: 10,
                    padding: "10px 12px 10px 36px",
                    fontSize: 13, color: "#fff", outline: "none",
                    fontFamily: "Inter, sans-serif",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(52,211,153,0.4)")}
                  onBlur={(e) => (e.target.style.borderColor = C.border)}
                />
              </div>
            </div>
          ))}

          {/* Status */}
          <div>
            <label style={{ fontSize: 12, color: C.gray400, fontWeight: 500, display: "block", marginBottom: 8 }}>
              Status
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              {["active", "inactive"].map((s) => (
                <button
                  key={s}
                  onClick={() => handle("status", s)}
                  style={{
                    flex: 1, padding: "8px 0", borderRadius: 10, cursor: "pointer",
                    fontSize: 13, fontWeight: 500, fontFamily: "Inter, sans-serif",
                    border: form.status === s
                      ? `1px solid ${s === "active" ? "rgba(52,211,153,0.5)" : "rgba(248,113,113,0.5)"}`
                      : `1px solid ${C.border}`,
                    background: form.status === s
                      ? s === "active" ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.12)"
                      : "rgba(255,255,255,0.03)",
                    color: form.status === s
                      ? s === "active" ? C.emerald : C.red
                      : C.gray500,
                    transition: "all 0.15s",
                  }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px",
          borderTop: `1px solid ${C.border}`,
          display: "flex", gap: 10, justifyContent: "flex-end",
        }}>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`,
              borderRadius: 10, padding: "9px 20px",
              fontSize: 13, fontWeight: 500, color: C.gray400,
              cursor: "pointer", fontFamily: "Inter, sans-serif",
            }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            style={{
              background: "linear-gradient(135deg,#34d399,#10b981)",
              border: "none", borderRadius: 10, padding: "9px 24px",
              fontSize: 13, fontWeight: 600, color: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              display: "flex", alignItems: "center", gap: 6,
              fontFamily: "Inter, sans-serif",
            }}
          >
            {loading && <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />}
            {client ? "Save Changes" : "Add Client"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm ────────────────────────────────────────────────────────────
function DeleteConfirm({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div style={{
        background: "#0f1f18", border: `1px solid ${C.border}`,
        borderRadius: 20, width: "100%", maxWidth: 380, padding: 28,
        boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        textAlign: "center",
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <Trash2 size={20} color={C.red} />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Delete Client</h3>
        <p style={{ fontSize: 13, color: C.gray400, marginBottom: 24, lineHeight: 1.5 }}>
          Are you sure you want to delete <strong style={{ color: "#fff" }}>{name}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`,
            borderRadius: 10, padding: "10px 0", fontSize: 13, fontWeight: 500,
            color: C.gray400, cursor: "pointer", fontFamily: "Inter, sans-serif",
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            flex: 1, background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.4)",
            borderRadius: 10, padding: "10px 0", fontSize: 13, fontWeight: 600,
            color: C.red, cursor: "pointer", fontFamily: "Inter, sans-serif",
          }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ClientsView({ initialClients, userId }: Props) {
  const supabase = getSupabaseBrowserClient();
  const [clients, setClients]         = useState<Client[]>(initialClients);
  const [search, setSearch]           = useState("");
  const [filter, setFilter]           = useState<"all" | "active" | "inactive">("all");
  const [showModal, setShowModal]     = useState(false);
  const [editClient, setEditClient]   = useState<Client | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [menuOpen, setMenuOpen]       = useState<string | null>(null);
  const menuRef                       = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(null);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── Filtered clients ──
  const filtered = clients.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.company || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || c.status === filter;
    return matchSearch && matchFilter;
  });

  // ── Stats ──
  const total    = clients.length;
  const active   = clients.filter((c) => c.status === "active").length;
  const inactive = clients.filter((c) => c.status === "inactive").length;
  const totalBilled = clients.reduce((sum, c) => sum + (c.total_billed || 0), 0);

  // ── Add client ──
  const handleAdd = async (data: Partial<Client>) => {
    const { data: inserted, error } = await supabase
      .from("clients")
      .insert([{ ...data, user_id: userId }])
      .select()
      .single();
    if (error) throw new Error(error.message);
    setClients((prev) => [inserted, ...prev]);
  };

  // ── Edit client ──
  const handleEdit = async (data: Partial<Client>) => {
    const { data: updated, error } = await supabase
      .from("clients")
      .update(data)
      .eq("id", editClient!.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  // ── Delete client ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("clients").delete().eq("id", deleteTarget.id);
    if (!error) setClients((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  // ── Toggle status ──
  const toggleStatus = async (client: Client) => {
    const newStatus = client.status === "active" ? "inactive" : "active";
    const { error } = await supabase.from("clients").update({ status: newStatus }).eq("id", client.id);
    if (!error) setClients((prev) => prev.map((c) => c.id === client.id ? { ...c, status: newStatus } : c));
    setMenuOpen(null);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        .cl-root *, .cl-root *::before, .cl-root *::after { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
        .cl-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 9px 12px 9px 36px; font-size: 13px; color: #e5e7eb; width: 100%; outline: none; transition: border 0.2s; }
        .cl-input::placeholder { color: #4b5563; }
        .cl-input:focus { border-color: rgba(52,211,153,0.4); }
        .cl-row:hover { background: rgba(52,211,153,0.03); }
        .cl-row { transition: background 0.15s; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .cl-menu-btn:hover { background: rgba(255,255,255,0.08) !important; }
        .cl-filter-btn { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 7px 14px; font-size: 12px; font-weight: 500; color: #6b7280; cursor: pointer; transition: all 0.15s; }
        .cl-filter-active { background: rgba(52,211,153,0.12) !important; border-color: rgba(52,211,153,0.3) !important; color: #34d399 !important; }
        .cl-filter-btn:hover { color: #fff; border-color: rgba(255,255,255,0.15); }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .cl-card { animation: fadeIn 0.3s ease forwards; }
      `}</style>

      <div className="cl-root" style={{ minHeight: "100vh", background: C.bg, color: "#fff", padding: 24 }}>

        {/* Background glows */}
        <div style={{ position: "fixed", top: "10%", left: "30%", width: 500, height: 500, background: "rgba(6,78,59,0.15)", borderRadius: "9999px", filter: "blur(100px)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "fixed", bottom: "20%", right: "10%", width: 350, height: 350, background: "rgba(17,78,60,0.1)", borderRadius: "9999px", filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>

          {/* ── Header ── */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>Clients</h1>
              <p style={{ fontSize: 13, color: C.gray500, marginTop: 4 }}>{total} total clients</p>
            </div>
            <button
              onClick={() => { setEditClient(null); setShowModal(true); }}
              style={{
                background: "linear-gradient(135deg,#34d399,#10b981)",
                border: "none", borderRadius: 10, padding: "10px 20px",
                fontSize: 13, fontWeight: 600, color: "#fff",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                boxShadow: "0 4px 20px rgba(52,211,153,0.25)",
              }}
            >
              <Plus size={15} /> Add Client
            </button>
          </div>

          {/* ── Stat Cards ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 24 }}>
            {[
              { label: "Total Clients",  value: total,          icon: <Users size={16} />,       color: "#60a5fa" },
              { label: "Active",         value: active,         icon: <UserCheck size={16} />,   color: C.emerald },
              { label: "Inactive",       value: inactive,       icon: <UserX size={16} />,       color: C.red },
              { label: "Total Billed",   value: fmt(totalBilled), icon: <TrendingUp size={16} />, color: C.amber },
            ].map((s) => (
              <div key={s.label} className="cl-card" style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 14, padding: 16,
                boxShadow: "0 2px 16px rgba(0,0,0,0.3)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ color: s.color }}>{s.icon}</div>
                  <span style={{ fontSize: 11, color: C.gray500, fontWeight: 500 }}>{s.label}</span>
                </div>
                <p style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* ── Search + Filter ── */}
          <div style={{
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 14, padding: "14px 16px",
            display: "flex", alignItems: "center", gap: 12,
            flexWrap: "wrap", marginBottom: 16,
          }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <Search size={14} color="#4b5563" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input
                className="cl-input"
                placeholder="Search by name, email or company…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {(["all", "active", "inactive"] as const).map((f) => (
                <button
                  key={f}
                  className={`cl-filter-btn ${filter === f ? "cl-filter-active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* ── Table ── */}
          <div style={{
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 16, overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
          }}>
            {/* Table header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "2fr 1.5fr 1fr 1fr 80px 48px",
              padding: "12px 20px",
              borderBottom: `1px solid ${C.border}`,
              gap: 12,
            }}>
              {["Client", "Contact", "Company", "Total Billed", "Status", ""].map((h) => (
                <span key={h} style={{ fontSize: 11, color: "#4b5563", fontWeight: 500 }}>{h}</span>
              ))}
            </div>

            {/* Rows */}
            {filtered.length === 0 ? (
              <div style={{ padding: 48, textAlign: "center" }}>
                <Users size={32} color="#1f2d27" style={{ margin: "0 auto 12px" }} />
                <p style={{ fontSize: 14, color: C.gray500 }}>
                  {search ? "No clients match your search" : "No clients yet — add your first one!"}
                </p>
              </div>
            ) : (
              filtered.map((client) => (
                <div
                  key={client.id}
                  className="cl-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1.5fr 1fr 1fr 80px 48px",
                    padding: "14px 20px",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  {/* Name + avatar */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                      background: avatarColor(client.name),
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700, color: "#fff",
                    }}>
                      {initials(client.name)}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{client.name}</p>
                      <p style={{ fontSize: 11, color: C.gray500, marginTop: 1 }}>
                        Added {new Date(client.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>

                  {/* Contact */}
                  <div>
                    {client.email && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <Mail size={11} color={C.gray500} />
                        <span style={{ fontSize: 12, color: C.gray400 }}>{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Phone size={11} color={C.gray500} />
                        <span style={{ fontSize: 12, color: C.gray400 }}>{client.phone}</span>
                      </div>
                    )}
                    {!client.email && !client.phone && (
                      <span style={{ fontSize: 12, color: "#374151" }}>—</span>
                    )}
                  </div>

                  {/* Company */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {client.company
                      ? <><Building2 size={11} color={C.gray500} /><span style={{ fontSize: 12, color: C.gray400 }}>{client.company}</span></>
                      : <span style={{ fontSize: 12, color: "#374151" }}>—</span>
                    }
                  </div>

                  {/* Total billed */}
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                    {client.total_billed > 0 ? `$${client.total_billed.toLocaleString()}` : "—"}
                  </p>

                  {/* Status badge */}
                  <span style={{
                    fontSize: 11, fontWeight: 500, padding: "4px 10px",
                    borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 4,
                    ...(client.status === "active"
                      ? { background: "rgba(52,211,153,0.12)", color: C.emerald, border: "1px solid rgba(52,211,153,0.25)" }
                      : { background: "rgba(248,113,113,0.12)", color: C.red,     border: "1px solid rgba(248,113,113,0.25)" }
                    ),
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
                    {client.status === "active" ? "Active" : "Inactive"}
                  </span>

                  {/* Actions menu */}
                  <div style={{ position: "relative" }} ref={menuOpen === client.id ? menuRef : null}>
                    <button
                      className="cl-menu-btn"
                      onClick={() => setMenuOpen(menuOpen === client.id ? null : client.id)}
                      style={{
                        background: "transparent", border: "none", cursor: "pointer",
                        color: C.gray500, borderRadius: 8, padding: 6,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "background 0.15s",
                      }}
                    >
                      <MoreHorizontal size={16} />
                    </button>

                    {menuOpen === client.id && (
                      <div style={{
                        position: "fixed",
                        top: "auto", right: "auto",
                        background: "#0f1f18",
                        border: `1px solid ${C.border}`,
                        borderRadius: 10,
                        width: 160,
                        boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
                        zIndex: 99999,
                        overflow: "hidden",
                        transform: "translateX(-120px) translateY(-10px)",
                      }}>
                        {[
                          { label: "Edit",          icon: <Edit3 size={13} />,   action: () => { setEditClient(client); setShowModal(true); setMenuOpen(null); }, color: "#e5e7eb" },
                          { label: client.status === "active" ? "Deactivate" : "Activate", icon: client.status === "active" ? <UserX size={13} /> : <UserCheck size={13} />, action: () => toggleStatus(client), color: client.status === "active" ? C.amber : C.emerald },
                          { label: "Delete",        icon: <Trash2 size={13} />,  action: () => { setDeleteTarget(client); setMenuOpen(null); }, color: C.red },
                        ].map((item) => (
                          <button
                            key={item.label}
                            onClick={item.action}
                            style={{
                              width: "100%", background: "none", border: "none",
                              padding: "10px 14px", cursor: "pointer",
                              display: "flex", alignItems: "center", gap: 8,
                              fontSize: 13, color: item.color,
                              textAlign: "left", transition: "background 0.1s",
                              fontFamily: "Inter, sans-serif",
                            }}
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
              ))
            )}

            {/* Footer count */}
            {filtered.length > 0 && (
              <div style={{
                padding: "12px 20px",
                borderTop: `1px solid ${C.border}`,
                fontSize: 12, color: C.gray500,
              }}>
                Showing {filtered.length} of {total} clients
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <ClientModal
          client={editClient}
          onClose={() => { setShowModal(false); setEditClient(null); }}
          onSave={editClient ? handleEdit : handleAdd}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          name={deleteTarget.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}