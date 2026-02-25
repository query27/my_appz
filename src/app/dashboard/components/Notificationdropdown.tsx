"use client";
import { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, Clock, AlertCircle, DollarSign, X } from "lucide-react";
import { getSupabaseBrowserClient } from "@/app/lib/supabase/browser-client";

// ── Types ─────────────────────────────────────────────────────────────────────
type NotifType = "paid" | "overdue" | "reminder" | "new";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// ── Icon + color per type ─────────────────────────────────────────────────────
const typeConfig: Record<NotifType, { icon: React.ReactNode; color: string; bg: string }> = {
  paid:     { icon: <DollarSign size={14} />, color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  overdue:  { icon: <AlertCircle size={14} />, color: "#f87171", bg: "rgba(248,113,113,0.12)" },
  reminder: { icon: <Clock size={14} />,       color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  new:      { icon: <Bell size={14} />,        color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
};

// ── Mock notifications (replace with real Supabase query later) ───────────────
const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "1", type: "paid",     title: "Invoice Paid",       message: "Acme Corp paid Invoice #1042 — $2,400",         time: "2 min ago",  read: false },
  { id: "2", type: "overdue",  title: "Invoice Overdue",    message: "Cedar Labs — Invoice #1040 is 3 days overdue",  time: "1 hr ago",   read: false },
  { id: "3", type: "reminder", title: "Reminder Sent",      message: "Auto-reminder sent to Bloom Studio",            time: "3 hr ago",   read: false },
  { id: "4", type: "new",      title: "New Client",         message: "Helix Inc just signed up",                      time: "Yesterday",  read: true  },
  { id: "5", type: "paid",     title: "Invoice Paid",       message: "Drift Agency paid Invoice #1038 — $1,950",      time: "2 days ago", read: true  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function NotificationDropdown() {
  const [open, setOpen]                   = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const dropdownRef                       = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  const dismiss = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>

      {/* ── Bell Button ── */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: open ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10, padding: "8px 10px",
          cursor: "pointer", color: "#9ca3af",
          display: "flex", alignItems: "center",
          transition: "background 0.15s",
          position: "relative",
        }}
      >
        <Bell size={16} color={open ? "#fff" : "#9ca3af"} />
        {unread > 0 && (
          <span style={{
            position: "absolute", top: 5, right: 5,
            width: 8, height: 8, borderRadius: "50%",
            background: "#34d399",
            border: "2px solid #0c1d16",
          }} />
        )}
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 10px)", right: 0,
          width: 340,
          background: "rgba(15,31,24,0.97)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          zIndex: 9999,
          isolation: "isolate",
          overflow: "hidden",
        }}>

          {/* Header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "16px 16px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Notifications</span>
              {unread > 0 && (
                <span style={{
                  background: "rgba(52,211,153,0.15)",
                  color: "#34d399",
                  border: "1px solid rgba(52,211,153,0.25)",
                  borderRadius: 999, fontSize: 11, fontWeight: 600,
                  padding: "1px 7px",
                }}>
                  {unread} new
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#34d399", fontSize: 12,
                  display: "flex", alignItems: "center", gap: 4,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center" }}>
                <Bell size={28} color="#374151" style={{ margin: "0 auto 8px" }} />
                <p style={{ fontSize: 13, color: "#6b7280" }}>No notifications</p>
              </div>
            ) : (
              notifications.map((n) => {
                const cfg = typeConfig[n.type];
                return (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 12,
                      padding: "12px 16px",
                      background: n.read ? "transparent" : "rgba(52,211,153,0.03)",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      cursor: "pointer",
                      transition: "background 0.15s",
                      position: "relative",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = n.read ? "transparent" : "rgba(52,211,153,0.03)")}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: cfg.bg,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: cfg.color,
                    }}>
                      {cfg.icon}
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: n.read ? 400 : 600, color: n.read ? "#9ca3af" : "#fff" }}>
                          {n.title}
                        </span>
                        <span style={{ fontSize: 11, color: "#4b5563", whiteSpace: "nowrap", marginLeft: 8 }}>{n.time}</span>
                      </div>
                      <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.4, margin: 0 }}>{n.message}</p>
                    </div>

                    {/* Unread dot */}
                    {!n.read && (
                      <span style={{
                        position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                        width: 6, height: 6, borderRadius: "50%", background: "#34d399", flexShrink: 0,
                      }} />
                    )}

                    {/* Dismiss */}
                    <button
                      onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "#374151", padding: 2, flexShrink: 0,
                        display: "flex", alignItems: "center",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#9ca3af")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#374151")}
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button style={{
              width: "100%", background: "none", border: "none",
              cursor: "pointer", color: "#6b7280", fontSize: 12,
              fontFamily: "Inter, sans-serif", padding: "4px 0",
              transition: "color 0.15s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#34d399")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
            >
              View all notifications →
            </button>
          </div>

        </div>
      )}
    </div>
  );
}