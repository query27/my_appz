"use client";

// ─── Simple sparkline chart using SVG polyline ───────────────────────────────
const chartPoints = [
  { x: 0,   y: 210 },
  { x: 60,  y: 190 },
  { x: 110, y: 170 },
  { x: 160, y: 155 },
  { x: 200, y: 160 },
  { x: 250, y: 130 },
  { x: 300, y: 110 },
  { x: 350, y: 120 },
  { x: 390, y: 90  },
  { x: 430, y: 70  },
  { x: 470, y: 80  },
  { x: 510, y: 60  },
  { x: 550, y: 55  },
  { x: 590, y: 50  },
];

const polyline = chartPoints.map((p) => `${p.x},${p.y}`).join(" ");
const areaPath =
  `M${chartPoints[0].x},${chartPoints[0].y} ` +
  chartPoints.slice(1).map((p) => `L${p.x},${p.y}`).join(" ") +
  ` L${chartPoints[chartPoints.length - 1].x},260 L${chartPoints[0].x},260 Z`;

// ─── Feature cards data ───────────────────────────────────────────────────────
const features = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: "Automated Follow-Ups",
    desc: "Gentle reminders sent automatically via email & SMS to recover overdue invoices.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
    title: "Personalized & Friendly",
    desc: "Customize reminders that sound human and keep your client relationships positive.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6"  y1="20" x2="6"  y2="14" />
        <path d="M2 20h20" />
      </svg>
    ),
    title: "Real-Time Analytics",
    desc: "Track recovery rates, payment statuses, and see how much money GentleChase brings back.",
  },
];

// ─── Integration logos (text-based since we can't load external images) ───────
const integrations = [
  { name: "QuickBooks",  color: "#2CA01C" },
  { name: "Xero",        color: "#13B5EA" },
  { name: "Hostinger",   color: "#674BFF" },
  { name: "Twilio",      color: "#F22F46" },
];

export default function MiddleSection() {
  return (
    <div>
      {/* ════════════════════════════════════════════════════════
          TOP — dark section with chart + invoice notification
      ════════════════════════════════════════════════════════ */}
      <section
        style={{
          backgroundColor: "#0a1a14",
          padding: "60px 48px 100px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow */}
        <div style={{
          position: "absolute", top: "20%", left: "10%",
          width: "400px", height: "300px",
          backgroundColor: "rgba(6,78,59,0.25)",
          borderRadius: "9999px", filter: "blur(80px)", pointerEvents: "none",
        }} />

        <div style={{
          maxWidth: "1200px", margin: "0 auto",
          display: "flex", flexDirection: "row", gap: "32px",
          alignItems: "flex-start", flexWrap: "wrap",
          position: "relative", zIndex: 1,
        }}>

          {/* ── Chart card ── */}
          <div style={{
            flex: 2, minWidth: "300px",
            backgroundColor: "#0c1d16",
            border: "1px solid rgba(55,65,81,0.5)",
            borderRadius: "16px",
            padding: "24px",
          }}>
            <p style={{ color: "#e5e7eb", fontWeight: 700, fontSize: "0.95rem", marginBottom: "4px" }}>
              Recovery Trend{" "}
              <span style={{ color: "#6b7280", fontWeight: 400, fontSize: "0.85rem" }}>(Last 30 Days)</span>
            </p>

            <svg
              viewBox="0 0 600 270"
              style={{ width: "100%", height: "auto", display: "block", marginTop: "16px" }}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Y-axis labels */}
              {[{ y: 55, label: "$15k" }, { y: 120, label: "$10k" }, { y: 185, label: "$5k" }].map((row) => (
                <g key={row.label}>
                  <text x="0" y={row.y + 4} fill="#6b7280" fontSize="11">{row.label}</text>
                  <line x1="40" y1={row.y} x2="600" y2={row.y} stroke="#1f2d27" strokeWidth="1" strokeDasharray="4,4" />
                </g>
              ))}

              {/* Area fill */}
              <path d={areaPath} fill="url(#chartGrad)" transform="translate(40,0)" />

              {/* Line */}
              <polyline
                points={chartPoints.map((p) => `${p.x + 40},${p.y}`).join(" ")}
                fill="none"
                stroke="#34d399"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Dots */}
              {chartPoints.map((p, i) => (
                <circle key={i} cx={p.x + 40} cy={p.y} r="3.5" fill="#34d399" />
              ))}
            </svg>
          </div>

          {/* ── Invoice notification card ── */}
          <div style={{
            flex: 1, minWidth: "260px", maxWidth: "360px",
            display: "flex", flexDirection: "column", gap: "12px",
          }}>
            {/* Top part — invoice info */}
            <div style={{
              backgroundColor: "#0c1d16",
              border: "1px solid rgba(55,65,81,0.5)",
              borderRadius: "16px",
              padding: "20px",
            }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "9999px",
                    backgroundColor: "#1e40af",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "14px", fontWeight: 700, color: "white",
                  }}>O</div>
                  <span style={{ color: "#e5e7eb", fontWeight: 600, fontSize: "0.9rem" }}>Officer, Inc.</span>
                </div>
                <span style={{ color: "#6b7280", letterSpacing: "3px", fontSize: "0.85rem" }}>···</span>
              </div>

              {/* Invoice details */}
              <p style={{ color: "#e5e7eb", fontWeight: 700, fontSize: "1rem", margin: "0 0 2px 0" }}>Invoice #40562</p>
              <p style={{ color: "#9ca3af", fontSize: "0.85rem", margin: "0 0 16px 0" }}>is now 7 days overdue</p>

              <div style={{
                backgroundColor: "#111c17",
                borderRadius: "10px",
                padding: "12px 16px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>Pending :</span>
                <span style={{ color: "#e5e7eb", fontWeight: 800, fontSize: "1.2rem" }}>$2,150.00</span>
              </div>
            </div>

            {/* Bottom part — email preview */}
            <div style={{
              backgroundColor: "#f9fafb",
              borderRadius: "16px",
              padding: "18px",
              border: "1px solid #e5e7eb",
            }}>
              <p style={{ color: "#111827", fontSize: "0.85rem", margin: "0 0 8px 0" }}>Hi Alex,</p>
              <p style={{ color: "#374151", fontSize: "0.82rem", lineHeight: 1.6, margin: "0 0 12px 0" }}>
                This is a friendly reminder that{" "}
                <span style={{ color: "#059669", textDecoration: "underline" }}>Invoice #40562</span>{" "}
                is overdue, could you please let us know when we can expect payment!
              </p>
              <p style={{ color: "#374151", fontSize: "0.82rem", margin: "0 0 8px 0" }}>Thank you!</p>
              <p style={{ color: "#111827", fontWeight: 700, fontSize: "0.82rem", margin: 0 }}>Sarah Davis</p>
              <p style={{ color: "#6b7280", fontSize: "0.78rem", margin: 0 }}>GentleChase</p>
            </div>
          </div>

        </div>

        {/* Wave transition to light section */}
        <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", lineHeight: 0 }}>
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "80px" }}>
            <path d="M0,80 C360,0 1080,0 1440,80 L1440,80 L0,80 Z" fill="#f3f4f6" />
          </svg>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          BOTTOM — light section with features + integrations
      ════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: "#f3f4f6", padding: "72px 48px 60px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

          {/* Heading */}
          <h2 style={{
            fontSize: "clamp(2rem, 4vw, 2.75rem)",
            fontWeight: 800,
            color: "#111827",
            margin: "0 0 48px 0",
          }}>
            Recover Your Money Faster
          </h2>

          {/* 3 feature cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
            marginBottom: "60px",
          }}>
            {features.map((f) => (
              <div
                key={f.title}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "16px",
                  padding: "28px 24px",
                  border: "1px solid #e5e7eb",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {/* Icon badge */}
                <div style={{
                  width: "52px", height: "52px",
                  backgroundColor: "#ecfdf5",
                  borderRadius: "12px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {f.icon}
                </div>
                <p style={{ color: "#111827", fontWeight: 700, fontSize: "1rem", margin: 0 }}>{f.title}</p>
                <p style={{ color: "#6b7280", fontSize: "0.875rem", lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Integrations bar */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "32px",
            flexWrap: "wrap",
          }}>
            <span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
              Integrates seamlessly with
            </span>
            {integrations.map((brand) => (
              <div key={brand.name} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{
                  width: "20px", height: "20px", borderRadius: "4px",
                  backgroundColor: brand.color,
                }} />
                <span style={{ color: "#374151", fontWeight: 600, fontSize: "0.9rem" }}>{brand.name}</span>
              </div>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
}