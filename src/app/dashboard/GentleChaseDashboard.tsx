"use client";
import { useState } from "react";
import {
  LayoutDashboard, Users, FileText, CreditCard, BarChart2,
  Settings, Bell, Search, Plus, ChevronLeft, ChevronRight,
  TrendingUp, TrendingDown, ArrowUpRight, MoreHorizontal,
  Send, UserPlus, Menu, LogOut, Zap
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import NotificationDropdown from "./components/Notificationdropdown";

// ─── Colors (all inline to bypass Tailwind scanner) ──────────────────────────
const C = {
  bg:        "#0a1a14",
  sidebar:   "#0c1d16",
  card:      "#0f1f18",
  tooltip:   "#111c17",
  border:    "rgba(255,255,255,0.06)",
  emerald:   "#34d399",
  amber:     "#fbbf24",
  red:       "#f87171",
  gray500:   "#6b7280",
  gray400:   "#9ca3af",
  gray200:   "#e5e7eb",
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const revenueData = [
  { month: "Aug", revenue: 12400, target: 10000 },
  { month: "Sep", revenue: 15800, target: 13000 },
  { month: "Oct", revenue: 13200, target: 14000 },
  { month: "Nov", revenue: 18900, target: 15000 },
  { month: "Dec", revenue: 21500, target: 17000 },
  { month: "Jan", revenue: 19200, target: 18000 },
  { month: "Feb", revenue: 24800, target: 20000 },
];

const topClients = [
  { name: "Acme Corp",     value: 8200 },
  { name: "Bloom Studio",  value: 6100 },
  { name: "Nexus Media",   value: 5400 },
  { name: "Cedar Labs",    value: 4200 },
  { name: "Drift Agency",  value: 3800 },
];

const paymentStatus = [
  { name: "Paid",    value: 68 },
  { name: "Pending", value: 21 },
  { name: "Overdue", value: 11 },
];
const PIE_COLORS = ["#34d399", "#fbbf24", "#f87171"];

const transactions = [
  { id: "INV-1042", client: "Acme Corp",    amount: "$2,400", date: "Feb 24, 2026", status: "Paid" },
  { id: "INV-1041", client: "Bloom Studio", amount: "$1,200", date: "Feb 23, 2026", status: "Pending" },
  { id: "PAY-0318", client: "Nexus Media",  amount: "$3,600", date: "Feb 22, 2026", status: "Paid" },
  { id: "INV-1040", client: "Cedar Labs",   amount: "$800",   date: "Feb 21, 2026", status: "Overdue" },
  { id: "PAY-0317", client: "Drift Agency", amount: "$1,950", date: "Feb 20, 2026", status: "Paid" },
  { id: "INV-1039", client: "Helix Inc",    amount: "$5,100", date: "Feb 19, 2026", status: "Pending" },
];

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Users,           label: "Clients" },
  { icon: FileText,        label: "Invoices" },
  { icon: CreditCard,      label: "Payments" },
  { icon: BarChart2,       label: "Reports" },
  { icon: Settings,        label: "Settings" },
];

const statusStyle: Record<string, React.CSSProperties> = {
  Paid:    { background: "rgba(52,211,153,0.12)",  color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" },
  Pending: { background: "rgba(251,191,36,0.12)",  color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" },
  Overdue: { background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" },
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#111c17", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 10, padding: "10px 14px" }}>
      <p style={{ color: "#34d399", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color, fontSize: 13, fontWeight: 700 }}>${p.value.toLocaleString()}</p>
      ))}
    </div>
  );
};

// ─── Card wrapper ─────────────────────────────────────────────────────────────
const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{
    background: "#0f1f18",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 0 0 1px rgba(52,211,153,0.05), 0 4px 24px rgba(0,0,0,0.4)",
    ...style,
  }}>
    {children}
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
interface Props {
  userName: string;
  userEmail: string;
  businessName: string;
}

export default function GentleChaseDashboard({ userName, userEmail, businessName }: Props) {
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarW = collapsed ? 64 : 240;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        .gc-root *, .gc-root *::before, .gc-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .gc-root { font-family: 'Inter', sans-serif; }
        .gc-display { font-family: 'Inter', sans-serif; letter-spacing: -0.5px; }
        .gc-scrollbar::-webkit-scrollbar { width: 4px; }
        .gc-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .gc-scrollbar::-webkit-scrollbar-thumb { background: #1a3a26; border-radius: 2px; }
        .gc-nav-btn { width: 100%; display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; border: none; cursor: pointer; background: transparent; transition: background 0.15s; color: inherit; }
        .gc-nav-btn:hover { background: rgba(52,211,153,0.07); }
        .gc-nav-active { background: rgba(52,211,153,0.12) !important; }
        .gc-btn-primary { background: linear-gradient(135deg, #34d399, #10b981); border: none; cursor: pointer; color: #fff; font-weight: 600; font-size: 13px; display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 10px; transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s; font-family: 'Inter', sans-serif; }
        .gc-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(52,211,153,0.3); }
        .gc-btn-ghost { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); cursor: pointer; color: #9ca3af; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 10px; transition: background 0.15s, color 0.15s; font-family: 'Inter', sans-serif; }
        .gc-btn-ghost:hover { background: rgba(255,255,255,0.09); color: #fff; }
        .gc-metric { transition: box-shadow 0.2s, transform 0.2s; }
        .gc-metric:hover { box-shadow: 0 0 0 1px rgba(52,211,153,0.2), 0 8px 32px rgba(0,0,0,0.5) !important; transform: translateY(-2px); }
        .gc-tr { transition: background 0.15s; }
        .gc-tr:hover { background: rgba(52,211,153,0.04); }
        .gc-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 8px 12px 8px 36px; font-size: 13px; color: #d1d5db; width: 100%; outline: none; transition: border 0.2s, background 0.2s; font-family: 'Inter', sans-serif; }
        .gc-input::placeholder { color: #4b5563; }
        .gc-input:focus { border-color: rgba(52,211,153,0.4); background: rgba(255,255,255,0.08); }
        .gc-collapse-btn { position: absolute; right: -12px; top: 72px; width: 24px; height: 24px; background: #0f2318; border: 1px solid rgba(52,211,153,0.2); border-radius: 50%; display: none; align-items: center; justify-content: center; cursor: pointer; transition: border-color 0.2s; z-index: 10; }
        .gc-collapse-btn:hover { border-color: rgba(52,211,153,0.5); }
        @media (min-width: 1024px) { .gc-collapse-btn { display: flex !important; } .gc-mobile-menu { display: none !important; } }
        @media (max-width: 1023px) { .gc-mobile-menu { display: block !important; } .gc-sidebar { transform: translateX(-100%); } .gc-sidebar-open { transform: translateX(0) !important; } .gc-main { margin-left: 0 !important; } }
        .gc-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 40; display: none; }
        .gc-overlay-show { display: block !important; }
      `}</style>

      <div
        className="gc-root gc-scrollbar"
        style={{ minHeight: "100vh", background: "#0a1a14", color: "#fff", display: "flex", overflow: "hidden", position: "relative" }}
      >
        {/* Mobile overlay */}
        <div
          className={`gc-overlay ${mobileOpen ? "gc-overlay-show" : ""}`}
          onClick={() => setMobileOpen(false)}
        />

        {/* Background glows matching landing page */}
        <div style={{ position: "fixed", top: "15%", left: "35%", width: 500, height: 500, background: "rgba(6,78,59,0.18)", borderRadius: "9999px", filter: "blur(100px)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "fixed", bottom: "20%", right: "15%", width: 380, height: 380, background: "rgba(17,78,60,0.13)", borderRadius: "9999px", filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "fixed", top: "60%", left: "5%", width: 300, height: 300, background: "rgba(6,78,59,0.1)", borderRadius: "9999px", filter: "blur(70px)", pointerEvents: "none", zIndex: 0 }} />

        {/* ── Sidebar ── */}
        <aside
          className={`gc-sidebar ${mobileOpen ? "gc-sidebar-open" : ""}`}
          style={{
            position: "fixed", top: 0, left: 0,
            height: "100vh",
            width: sidebarW,
            background: "#0c1d16",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            display: "flex", flexDirection: "column",
            zIndex: 50,
            transition: "width 0.3s ease, transform 0.3s ease",
            flexShrink: 0,
          }}
        >
          {/* Logo */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "0 16px", height: 64,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            justifyContent: collapsed ? "center" : "flex-start",
            overflow: "hidden",
          }}>
            <div style={{
              width: 32, height: 32, flexShrink: 0,
              background: "rgba(52,211,153,0.15)",
              border: "1px solid rgba(52,211,153,0.35)",
              borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Zap size={16} color="#34d399" />
            </div>
            {!collapsed && (
              <span className="gc-display" style={{ fontSize: 17, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>
                GentleChase
              </span>
            )}
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }} className="gc-scrollbar">
            {navItems.map(({ icon: Icon, label, active }) => (
              <button
                key={label}
                className={`gc-nav-btn ${active ? "gc-nav-active" : ""}`}
                style={{ justifyContent: collapsed ? "center" : "flex-start" }}
              >
                <Icon size={18} color={active ? "#34d399" : "#6b7280"} style={{ flexShrink: 0 }} />
                {!collapsed && (
                  <span style={{ fontSize: 13, fontWeight: 500, color: active ? "#6ee7b7" : "#6b7280", flex: 1, textAlign: "left" }}>
                    {label}
                  </span>
                )}
                {!collapsed && active && (
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", flexShrink: 0 }} />
                )}
              </button>
            ))}
          </nav>

          {/* User */}
          <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: collapsed ? "center" : "flex-start" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, #34d399, #0d9488)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "#fff",
              }}>{userName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0,2)}</div>
              {!collapsed && (
                <>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName}</p>
                    <p style={{ fontSize: 11, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userEmail}</p>
                  </div>
                  <LogOut size={14} color="#4b5563" style={{ cursor: "pointer", flexShrink: 0 }} />
                </>
              )}
            </div>
          </div>

          {/* Collapse toggle */}
          <button className="gc-collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed
              ? <ChevronRight size={12} color="#34d399" />
              : <ChevronLeft  size={12} color="#34d399" />
            }
          </button>
        </aside>

        {/* ── Main Content ── */}
        <div
          className="gc-main"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            marginLeft: sidebarW,
            transition: "margin-left 0.3s ease",
            minWidth: 0,
            minHeight: "100vh",
          }}
        >
          {/* Top Bar */}
          <header style={{
            height: 64, flexShrink: 0,
            background: "#0c1d16",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center",
            padding: "0 24px", gap: 16,
          }}>
            <button
              className="gc-mobile-menu gc-btn-ghost"
              style={{ display: "none", padding: "8px 10px" }}
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={18} />
            </button>

            <div style={{ position: "relative", maxWidth: 280, flex: 1 }}>
              <Search size={14} color="#4b5563" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input className="gc-input" placeholder="Search clients, invoices…" />
            </div>

            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
              <NotificationDropdown/>
              <button className="gc-btn-primary">
                <Plus size={15} />
                <span>New Invoice</span>
              </button>
            </div>
          </header>

          {/* Page Body */}
          <main style={{ flex: 1, overflowY: "auto", padding: 24 }} className="gc-scrollbar">
            <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>

              {/* Title row */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h1 className="gc-display" style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>Welcome back, {userName.split(" ")[0]} 👋</h1>
                  <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>Thursday, Feb 26, 2026</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="gc-btn-ghost"><UserPlus size={14} /><span>Add Client</span></button>
                  <button className="gc-btn-ghost"><Send size={14} /><span>Send Reminder</span></button>
                </div>
              </div>

              {/* Metric Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
                {[
                  { label: "Total Clients",        value: "148",     change: "+12%", up: true,  sub: "vs last month" },
                  { label: "Outstanding Invoices", value: "23",      change: "-5%",  up: false, sub: "$18,400 total" },
                  { label: "Monthly Revenue",      value: "$24,800", change: "+29%", up: true,  sub: "vs Jan 2026" },
                  { label: "Recent Payments",      value: "41",      change: "+8%",  up: true,  sub: "last 30 days" },
                ].map((m) => (
                  <div key={m.label} className="gc-metric" style={{
                    background: "rgba(15,31,24,0.8)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 16, padding: 20,
                    boxShadow: "0 0 0 1px rgba(52,211,153,0.05), 0 4px 24px rgba(0,0,0,0.4)",
                  }}>
                    <p style={{ fontSize: 11, color: "#6b7280", fontWeight: 500, marginBottom: 12 }}>{m.label}</p>
                    <p className="gc-display" style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 10 }}>{m.value}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      {m.up
                        ? <TrendingUp  size={13} color="#34d399" />
                        : <TrendingDown size={13} color="#f87171" />
                      }
                      <span style={{ fontSize: 12, fontWeight: 600, color: m.up ? "#34d399" : "#f87171" }}>{m.change}</span>
                      <span style={{ fontSize: 11, color: "#4b5563" }}>{m.sub}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)", gap: 16 }}>
                {/* Revenue */}
                <Card>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div>
                      <h2 className="gc-display" style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Revenue Trends</h2>
                      <p style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>Aug 2025 – Feb 2026</p>
                    </div>
                    <button className="gc-btn-ghost" style={{ padding: "6px 8px" }}><MoreHorizontal size={15} /></button>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="revenue" stroke="#34d399" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#34d399" }} />
                      <Line type="monotone" dataKey="target" stroke="#374151" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 16, height: 2, background: "#34d399", borderRadius: 2, display: "inline-block" }} />
                      <span style={{ fontSize: 11, color: "#6b7280" }}>Actual</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 16, height: 2, background: "#374151", borderRadius: 2, display: "inline-block" }} />
                      <span style={{ fontSize: 11, color: "#6b7280" }}>Target</span>
                    </div>
                  </div>
                </Card>

                {/* Pie */}
                <Card>
                  <h2 className="gc-display" style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Payment Status</h2>
                  <p style={{ fontSize: 12, color: "#6b7280", marginTop: 3, marginBottom: 16 }}>This month</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={paymentStatus} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value">
                        {paymentStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                      </Pie>
                      <Tooltip
                        formatter={(v) => [`${v}%`]}
                        contentStyle={{ background: "#111c17", border: "1px solid #134229", borderRadius: 8, color: "#fff", fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                    {paymentStatus.map((s, i) => (
                      <div key={s.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 10, height: 10, borderRadius: "50%", background: PIE_COLORS[i], flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: "#9ca3af" }}>{s.name}</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{s.value}%</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Bottom row */}
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,2fr)", gap: 16 }}>
                {/* Bar chart */}
                <Card>
                  <h2 className="gc-display" style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Top Clients</h2>
                  <p style={{ fontSize: 12, color: "#6b7280", marginTop: 3, marginBottom: 20 }}>By revenue this month</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={topClients} layout="vertical" barCategoryGap="25%">
                      <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} width={76} />
                      <Tooltip
                        formatter={(v) => [`$${Number(v).toLocaleString()}`]}
                        contentStyle={{ background: "#111c17", border: "1px solid #134229", borderRadius: 8, color: "#fff", fontSize: 12 }}
                      />
                      <Bar dataKey="value" fill="#34d399" radius={[0, 4, 4, 0]} opacity={0.85} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                {/* Table */}
                <Card>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div>
                      <h2 className="gc-display" style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Recent Activity</h2>
                      <p style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>Latest invoices & payments</p>
                    </div>
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: "#34d399", fontSize: 12, display: "flex", alignItems: "center", gap: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      View all <ArrowUpRight size={12} />
                    </button>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                          {["ID", "Client", "Amount", "Date", "Status"].map(h => (
                            <th key={h} style={{ textAlign: "left", fontSize: 11, color: "#4b5563", fontWeight: 500, paddingBottom: 12, paddingRight: 16 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((t) => (
                          <tr key={t.id} className="gc-tr" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                            <td style={{ padding: "12px 16px 12px 0", fontFamily: "monospace", fontSize: 11, color: "#6b7280" }}>{t.id}</td>
                            <td style={{ padding: "12px 16px 12px 0", fontWeight: 500, color: "#e5e7eb", whiteSpace: "nowrap" }}>{t.client}</td>
                            <td style={{ padding: "12px 16px 12px 0", fontWeight: 700, color: "#fff" }}>{t.amount}</td>
                            <td style={{ padding: "12px 16px 12px 0", fontSize: 11, color: "#6b7280", whiteSpace: "nowrap" }}>{t.date}</td>
                            <td style={{ padding: "12px 0" }}>
                              <span style={{ fontSize: 11, fontWeight: 500, padding: "4px 10px", borderRadius: 999, ...statusStyle[t.status] }}>
                                {t.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

            </div>
          </main>
        </div>
      </div>
    </>
  );
}