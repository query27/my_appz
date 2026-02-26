"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, FileText, CreditCard,
  BarChart2, Settings, ChevronLeft, ChevronRight,
  LogOut, Zap, Menu, X
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/app/lib/supabase/browser-client";
import { useRouter } from "next/navigation";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Users,           label: "Clients",   href: "/dashboard/clients" },
  { icon: FileText,        label: "Invoices",  href: "/dashboard/invoices" },
  { icon: CreditCard,      label: "Payments",  href: "/dashboard/payments" },
  { icon: BarChart2,       label: "Reports",   href: "/dashboard/reports" },
  { icon: Settings,        label: "Settings",  href: "/dashboard/settings" },
];

interface Props {
  userName: string;
  userEmail: string;
}

export default function Sidebar({ userName, userEmail }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const sidebarW = collapsed ? 64 : 240;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <style>{`
        .gc-sidebar-link { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; text-decoration: none; transition: background 0.15s; color: inherit; }
        .gc-sidebar-link:hover { background: rgba(52,211,153,0.07); }
        .gc-sidebar-active { background: rgba(52,211,153,0.12) !important; }
        .gc-collapse-btn { position: absolute; right: -12px; top: 72px; width: 24px; height: 24px; background: #0f2318; border: 1px solid rgba(52,211,153,0.2); border-radius: 50%; display: none; align-items: center; justify-content: center; cursor: pointer; transition: border-color 0.2s; z-index: 10; }
        .gc-collapse-btn:hover { border-color: rgba(52,211,153,0.5); }
        @media (min-width: 1024px) { .gc-collapse-btn { display: flex !important; } .gc-mobile-trigger { display: none !important; } }
        .gc-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 40; display: none; }
        .gc-overlay-show { display: block !important; }
        @media (max-width: 1023px) { .gc-sidebar-aside { transform: translateX(-100%) !important; } .gc-sidebar-aside-open { transform: translateX(0) !important; } }
        .gc-signout:hover { color: #f87171 !important; }
        .gc-scrollbar::-webkit-scrollbar { width: 4px; }
        .gc-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .gc-scrollbar::-webkit-scrollbar-thumb { background: #1a3a26; border-radius: 2px; }
      `}</style>

      {/* Mobile overlay */}
      <div
        className={`gc-overlay ${mobileOpen ? "gc-overlay-show" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile trigger button */}
      <button
        className="gc-mobile-trigger"
        onClick={() => setMobileOpen(true)}
        style={{
          position: "fixed", top: 16, left: 16, zIndex: 60,
          background: "#0c1d16", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10, padding: 8, cursor: "pointer",
          display: "none", color: "#9ca3af",
        }}
      >
        <Menu size={18} />
      </button>

      {/* Sidebar */}
      <aside
        className={`gc-sidebar-aside ${mobileOpen ? "gc-sidebar-aside-open" : ""} gc-scrollbar`}
        style={{
          position: "fixed", top: 0, left: 0,
          height: "100vh", width: sidebarW,
          background: "#0c1d16",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex", flexDirection: "column",
          zIndex: 60,
          transition: "width 0.3s ease, transform 0.3s ease",
          fontFamily: "Inter, sans-serif",
          overflowX: "hidden",
        }}
      >
        {/* Logo */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "0 16px", height: 64,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          justifyContent: collapsed ? "center" : "flex-start",
          overflow: "hidden", flexShrink: 0,
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
            <span style={{ fontSize: 17, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", letterSpacing: "-0.3px" }}>
              GentleChase
            </span>
          )}
          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }} className="gc-scrollbar">
          {navItems.map(({ icon: Icon, label, href }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`gc-sidebar-link ${active ? "gc-sidebar-active" : ""}`}
                style={{ justifyContent: collapsed ? "center" : "flex-start" }}
              >
                <Icon size={18} color={active ? "#34d399" : "#6b7280"} style={{ flexShrink: 0 }} />
                {!collapsed && (
                  <span style={{ fontSize: 13, fontWeight: 500, color: active ? "#6ee7b7" : "#6b7280", flex: 1 }}>
                    {label}
                  </span>
                )}
                {!collapsed && active && (
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", flexShrink: 0 }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User + sign out */}
        <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: collapsed ? "center" : "flex-start" }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, #34d399, #0d9488)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "#fff",
            }}>
              {initials}
            </div>
            {!collapsed && (
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {userName}
                  </p>
                  <p style={{ fontSize: 11, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {userEmail}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="gc-signout"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#4b5563", flexShrink: 0, transition: "color 0.15s", padding: 2 }}
                  title="Sign out"
                >
                  <LogOut size={14} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Collapse toggle (desktop only) */}
        <button className="gc-collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed
            ? <ChevronRight size={12} color="#34d399" />
            : <ChevronLeft  size={12} color="#34d399" />
          }
        </button>
      </aside>
    </>
  );
}
