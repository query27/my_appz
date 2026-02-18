import Link from "next/link";


export default function Home() {
  return (
    // <div className="min-h-screen bg-gradient-to-br from-[#02050b] via-[#050c1d] to-[#071426] text-slate-100">
    //   <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-16">
    //     <header className="space-y-4">
    //       <p className="text-sm uppercase tracking-[0.25em] text-emerald-300/90">
    //         Supabase × Next.js
    //       </p>
    //       <h1 className="text-4xl font-semibold text-white drop-shadow-sm">
    //         Two auth flows.
    //       </h1>
    //       <p className="text-base text-slate-400">
    //         Production-ready Supabase auth blueprints with real session listeners.
    //       </p>
    //     </header>
    //     <section className="grid gap-6 md:grid-cols-3">
    //       {demos.map((demo) => {
    //         const theme = demo.theme;
    //         return (
    //           <Link
    //             key={demo.href}
    //             href={demo.href}
    //             className={`group relative isolate flex flex-col overflow-hidden rounded-[32px] p-6 transition hover:-translate-y-1 ${
    //               theme?.card ??
    //               "border border-white/5 bg-slate-900/60 shadow-[0_30px_70px_rgba(2,6,23,0.65)] hover:border-emerald-300/50"
    //             }`}
    //           >
    //             {theme?.overlays?.map((overlayClass, index) => (
    //               <span key={index} className={overlayClass} aria-hidden="true" />
    //             ))}
    //             <div className="flex items-center justify-between">
    //               <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Flow</p>
    //               <span className={`text-sm font-semibold ${theme?.open ?? "text-emerald-300"}`}>
    //                 Open ↗
    //               </span>
    //             </div>
    //             <h3
    //               className={`mt-4 text-xl font-semibold ${
    //                 theme?.title ?? "text-white"
    //               } transition group-hover:opacity-95`}
    //             >
    //               {demo.title}
    //             </h3>
    //             <p className="mt-2 text-sm text-slate-300">{demo.description}</p>
    //             <ul className={`mt-4 space-y-1 text-xs ${theme?.bullets ?? "text-slate-400"}`}>
    //               {demo.highlights.map((highlight) => (
    //                 <li key={highlight}>• {highlight}</li>
    //               ))}
    //             </ul>
    //           </Link>
    //         );
    //       })}
    //     </section>
    //   </div>
    // </div>
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-3 max-w-3x1">
        <h1 className="text-5xl font-semibold">Home Page</h1>
        <p className="text-black">Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt culpa cumque tenetur consectetur eius quaerat est, delectus quibusdam accusamus eveniet ipsa quod, perspiciatis facilis vero inventore a error nam. Natus?</p>
      </div>

    </div>

  );
}

// import UnifiedAuthDemo from "./auth/Unifiedauthdemo";
// import { createSupabaseServerClient } from "./lib/supabase/server-client";

// export default async function AuthPage() {
//   const supabase = await createSupabaseServerClient();
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   return <UnifiedAuthDemo user={user} />;
// }