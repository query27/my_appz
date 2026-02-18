"use client";

import { useState } from "react";
import Image from "next/image";

export default function HeroSection() {
  const [email, setEmail] = useState("");

  return (
    <section className="relative min-h-screen bg-[#0a1a14] flex items-center overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-900/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-teal-800/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-24 flex flex-col lg:flex-row items-center gap-16 w-full">

        {/* ── LEFT SIDE ── */}
        <div className="flex-1 flex flex-col gap-6">
          <h1 className="text-5xl lg:text-6xl font-extrabold text-white leading-tight">
            Automate Your <br /> Invoice Follow-Ups
          </h1>

          <p className="text-gray-400 text-lg max-w-md leading-relaxed">
            Recover unpaid invoices effortlessly with personalized email &amp; SMS
            reminders that get you paid faster.
          </p>

          {/* Email + CTA */}
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

        {/* ── RIGHT SIDE ── */}
        <div className="flex-1 flex flex-col gap-4 w-full max-w-md">

          {/* Main card — Pending Recovery */}
          <div className="bg-[#0f1f18] border border-gray-700/60 rounded-2xl p-6 relative overflow-hidden">
            {/* Floating icons top-right */}
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

            {/* Logo / brand name */}
            <div className="flex items-center gap-2 mb-6">
            <Image
                src="/navbar_logo.svg"
                alt="GentleChase Logo"
                width={24}
                height={20}
                className="w-6 h-6"
            />
            <span className="text-gray-300 font-medium text-sm">
                GentleChase
            </span>
            </div>


            {/* Big number */}
            <p className="text-5xl font-extrabold text-emerald-400 mb-1">$18,420</p>
            <p className="text-gray-400 text-sm mb-4">Pending Recovery</p>

            {/* Stats row */}
            <div className="flex items-center gap-4 text-gray-500 text-xs">
              <span><strong className="text-gray-300">27</strong> invoices</span>
              <span className="text-gray-700">•</span>
              <span><strong className="text-gray-300">8</strong> replies</span>
              <span className="text-gray-700">•</span>
              <span><strong className="text-gray-300">3</strong> paid this week</span>
            </div>
          </div>

          {/* Bottom stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "$42,380", label: "Recovered Total" },
              { value: "27",      label: "Active Follow-Ups" },
              { value: "$12,900", label: "Paid This Month" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-[#0f1f18] border border-gray-700/60 rounded-xl p-4 flex flex-col gap-1"
              >
                <p className="text-white font-bold text-lg">{stat.value}</p>
                <p className="text-gray-500 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}