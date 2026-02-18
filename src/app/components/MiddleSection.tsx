"use client";

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

const integrations = [
  { name: "QuickBooks", color: "#2CA01C" },
  { name: "Xero",       color: "#13B5EA" },
  { name: "Hostinger",  color: "#674BFF" },
  { name: "Twilio",     color: "#F22F46" },
];

export default function MiddleSection() {
  return (
    <section style={{ backgroundColor: "#f3f4f6", padding: "72px 48px 60px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        <h2 style={{
          fontSize: "clamp(2rem, 4vw, 2.75rem)",
          fontWeight: 800,
          color: "#111827",
          margin: "0 0 48px 0",
        }}>
          Recover Your Money Faster
        </h2>

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

        {/* Integrations */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px", flexWrap: "wrap" }}>
          <span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>Integrates seamlessly with</span>
          {integrations.map((brand) => (
            <div key={brand.name} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "20px", height: "20px", borderRadius: "4px", backgroundColor: brand.color }} />
              <span style={{ color: "#374151", fontWeight: 600, fontSize: "0.9rem" }}>{brand.name}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}