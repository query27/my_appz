import Link from "next/link";
import Image from "next/image";

const productLinks = [
  { label: "How It Works", href: "/Features" },
  { label: "Pricing",      href: "/Pricing" },
  { label: "Docs",         href: "/Docs" },
  { label: "Changelog",    href: "/changelog" },
];

const companyLinks = [
  { label: "About",   href: "/about" },
  { label: "Blog",    href: "/blog" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="relative bg-[#0a1a14] overflow-hidden">

      {/* Same glow blobs as hero */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-900/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-teal-800/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">

        {/* ── TOP: logo + nav columns ── */}
        <div className="pt-16 pb-12 border-b border-gray-700/40 flex flex-col lg:flex-row gap-16 justify-between">

          {/* Logo + tagline */}
          <div className="flex flex-col gap-4 max-w-xs">
            <div className="flex items-center gap-3">
              <Image src="/navbar_logo.svg" alt="GentleChase Logo" width={40} height={40} />
              <span className="text-white font-bold text-lg">GentleChase</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Recover unpaid invoices effortlessly with personalized reminders that get you paid faster.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex gap-16 flex-wrap">

            {/* Product */}
            <div className="flex flex-col gap-3">
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">Product</p>
              {productLinks.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-gray-500 hover:text-gray-200 transition-colors text-sm"
                >
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Company */}
            <div className="flex flex-col gap-3">
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">Company</p>
              {companyLinks.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-gray-500 hover:text-gray-200 transition-colors text-sm"
                >
                  {l.label}
                </Link>
              ))}
            </div>

          </div>
        </div>

        {/* ── BOTTOM: copyright + legal ── */}
        <div className="py-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} GentleChase. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service"].map((label) => (
              <Link
                key={label}
                href="#"
                className="text-gray-600 hover:text-gray-400 transition-colors text-xs"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}