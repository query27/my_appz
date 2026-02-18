"use client";

import { useState } from "react";
import Image from "next/image";

// ── Chart data ────────────────────────────────────────────────────────────────
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

const areaPath =
  `M${chartPoints[0].x},${chartPoints[0].y} ` +
  chartPoints.slice(1).map((p) => `L${p.x},${p.y}`).join(" ") +
  ` L${chartPoints[chartPoints.length - 1].x},260 L${chartPoints[0].x},260 Z`;

export default function HeroSection() {
  const [email, setEmail] = useState("");

  return (
    <section className="relative bg-[#0a1a14] overflow-hidden">

      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-900/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-teal-800/20 rounded-full blur-3xl pointer-events-none" />
      <div style={{
        position: "absolute", top: "60%", left: "10%",
        width: "400px", height: "300px",
        backgroundColor: "rgba(6,78,59,0.2)",
        borderRadius: "9999px", filter: "blur(80px)", pointerEvents: "none",
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">

        {/* ══════════════════════════════════════
            TOP PART — headline + email + dashboard cards
        ══════════════════════════════════════ */}
        <div className="pt-36 pb-16 flex flex-col lg:flex-row items-center gap-16">

          {/* ── LEFT: headline + CTA ── */}
          <div className="flex-1 flex flex-col gap-6">
            <h1 className="text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              Automate Your <br /> Invoice Follow-Ups
            </h1>

            <p className="text-gray-400 text-lg max-w-md leading-relaxed">
              Recover unpaid invoices effortlessly with personalized email &amp; SMS
              reminders that get you paid faster.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <div className="flex items-center gap-2 bg-[#111c17] border border-gray-700 rounded-lg px-4 py-3 flex-1">
                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent text-gray-300 placeholder-gray-600 outline-none flex-1 text-sm"
                />
              </div>
              <button className="bg-emerald-700 hover:bg-emerald-600 transition-colors text-white font-semibold px-6 py-3 rounded-lg whitespace-nowrap text-sm">
                Get Started Free
              </button>
            </div>

            <p className="text-gray-600 text-sm">
              No credit card required &bull; 30 days free trial
            </p>
          </div>

          {/* ── RIGHT: dashboard card + stat tiles ── */}
          <div className="flex-1 flex flex-col gap-4 w-full max-w-md">

            {/* Pending recovery card */}
            <div className="bg-[#0f1f18] border border-gray-700/60 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-4 right-4 flex gap-2">
                <div className="w-9 h-9 bg-emerald-700/80 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="w-9 h-9 bg-emerald-900/60 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-6">
                <Image src="/navbar_logo.svg" alt="GentleChase Logo" width={24} height={20} className="w-6 h-6" />
                <span className="text-gray-300 font-medium text-sm">GentleChase</span>
              </div>

              <p className="text-5xl font-extrabold text-emerald-400 mb-1">$18,420</p>
              <p className="text-gray-400 text-sm mb-4">Pending Recovery</p>

              <div className="flex items-center gap-4 text-gray-500 text-xs">
                <span><strong className="text-gray-300">27</strong> invoices</span>
                <span className="text-gray-700">•</span>
                <span><strong className="text-gray-300">8</strong> replies</span>
                <span className="text-gray-700">•</span>
                <span><strong className="text-gray-300">3</strong> paid this week</span>
              </div>
            </div>

            {/* Stat tiles */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "$42,380", label: "Recovered Total" },
                { value: "27",      label: "Active Follow-Ups" },
                { value: "$12,900", label: "Paid This Month" },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#0f1f18] border border-gray-700/60 rounded-xl p-4 flex flex-col gap-1">
                  <p className="text-white font-bold text-lg">{stat.value}</p>
                  <p className="text-gray-500 text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════
            BOTTOM PART — chart + invoice card
        ══════════════════════════════════════ */}
        <div className="pb-24 flex flex-col lg:flex-row gap-8 items-start">

          {/* Chart card */}
          <div className="flex-[2] min-w-0 bg-[#0c1d16] border border-gray-700/50 rounded-2xl p-6">
            <p className="text-gray-200 font-bold text-sm mb-1">
              Recovery Trend{" "}
              <span className="text-gray-500 font-normal">(Last 30 Days)</span>
            </p>

            <svg
              viewBox="0 0 600 270"
              className="w-full h-auto mt-4"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                </linearGradient>
              </defs>

              {[{ y: 55, label: "$15k" }, { y: 120, label: "$10k" }, { y: 185, label: "$5k" }].map((row) => (
                <g key={row.label}>
                  <text x="0" y={row.y + 4} fill="#6b7280" fontSize="11">{row.label}</text>
                  <line x1="40" y1={row.y} x2="600" y2={row.y} stroke="#1f2d27" strokeWidth="1" strokeDasharray="4,4" />
                </g>
              ))}

              <path d={areaPath} fill="url(#chartGrad)" transform="translate(40,0)" />

              <polyline
                points={chartPoints.map((p) => `${p.x + 40},${p.y}`).join(" ")}
                fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinejoin="round"
              />

              {chartPoints.map((p, i) => (
                <circle key={i} cx={p.x + 40} cy={p.y} r="3.5" fill="#34d399" />
              ))}
            </svg>
          </div>

          {/* Invoice notification + email preview */}
          <div className="flex-1 flex flex-col gap-3 min-w-0 max-w-sm w-full">

            {/* Invoice card */}
            <div className="bg-[#0c1d16] border border-gray-700/50 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-sm">O</div>
                  <span className="text-gray-200 font-semibold text-sm">Officer, Inc.</span>
                </div>
                <span className="text-gray-600 tracking-widest text-sm">···</span>
              </div>

              <p className="text-gray-100 font-bold text-base mb-1">Invoice #40562</p>
              <p className="text-gray-400 text-sm mb-4">is now 7 days overdue</p>

              <div className="bg-[#111c17] rounded-xl px-4 py-3 flex justify-between items-center">
                <span className="text-gray-400 text-xs">Pending :</span>
                <span className="text-gray-100 font-extrabold text-xl">$2,150.00</span>
              </div>
            </div>

            {/* Email preview */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <p className="text-gray-900 text-sm mb-2">Hi Alex,</p>
              <p className="text-gray-600 text-xs leading-relaxed mb-3">
                This is a friendly reminder that{" "}
                <span className="text-emerald-600 underline">Invoice #40562</span>{" "}
                is overdue, could you please let us know when we can expect payment!
              </p>
              <p className="text-gray-600 text-xs mb-2">Thank you!</p>
              <p className="text-gray-900 font-bold text-xs">Sarah Davis</p>
              <p className="text-gray-400 text-xs">GentleChase</p>
            </div>

          </div>
        </div>

      </div>

      {/* Wave into next light section */}
      <div style={{ lineHeight: 0 }}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "80px" }}>
          <path d="M0,80 C360,0 1080,0 1440,80 L1440,80 L0,80 Z" fill="#f3f4f6" />
        </svg>
      </div>

    </section>
  );
}