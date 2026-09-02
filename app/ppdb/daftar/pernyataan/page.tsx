"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PernyataanPage() {
  const router = useRouter();

  const [agreed, setAgreed] = useState(false);

  const handleContinue = () => {
    if (!agreed) {
      alert("Silakan centang pernyataan terlebih dahulu.");
      return;
    }

    router.push("/ppdb/daftar/selesai");
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#eef4fa] text-[#10233f] selection:bg-blue-100 selection:text-[#071a36]">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.98),transparent_36%),radial-gradient(circle_at_8%_34%,rgba(37,99,235,0.10),transparent_28%),radial-gradient(circle_at_94%_54%,rgba(6,182,212,0.08),transparent_30%)]" />
        <div className="absolute -left-48 top-20 h-96 w-96 rounded-full bg-blue-300/10 blur-3xl edu-float" />
        <div className="absolute -right-44 top-52 h-96 w-96 rounded-full bg-cyan-300/10 blur-3xl edu-float-reverse" />
        <div className="absolute left-[11%] top-[39%] h-20 w-20 rounded-full border border-white/60 bg-white/20 backdrop-blur-sm edu-pulse" />
        <div className="absolute right-[10%] top-[67%] h-14 w-14 rounded-full border border-blue-200/45 bg-blue-100/20 backdrop-blur-sm edu-pulse [animation-delay:1s]" />
      </div>

      {/* HEADER */}
      <header className="relative z-10 border-b border-white/70 bg-white/84 backdrop-blur-2xl shadow-[0_12px_38px_rgba(7,26,54,0.05)]">
        <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#245ea8]">
                INIBS SMART DIGITAL
              </p>

              <h1 className="mt-1 text-2xl font-black tracking-tight text-[#071a36] sm:text-3xl">
                PPDB 2027/2028
              </h1>
            </div>

            <div className="hidden text-right sm:block">
              <p className="text-sm font-black text-[#071a36]">
                Imam Nawawi Islamic Boarding School
              </p>

              <p className="mt-1 text-xs text-[#7a8a9a]">
                Pendaftaran Santri Baru
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* PROGRESS */}
      <section className="relative z-10 border-b border-white/70 bg-white/78 shadow-sm backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-5 py-7 sm:px-8">
          <div className="overflow-x-auto">
            <div className="flex min-w-[720px] items-center">

              {/* STEP 1 */}
              <div className="flex items-center">
                <div className="edu-step-done flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#174f91] to-[#2675bd] text-sm font-black text-white shadow-[0_8px_24px_rgba(23,79,145,0.20)]">
                  ✓
                </div>

                <div className="ml-3">
                  <p className="text-xs text-slate-400">Tahap 1</p>

                  <p className="text-sm font-black tracking-[0.06em] text-white">
                    Data Santri
                  </p>
                </div>
              </div>

              <div className="mx-5 h-px flex-1 bg-blue-200" />

              {/* STEP 2 */}
              <div className="flex items-center">
                <div className="edu-step-done flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#174f91] to-[#2675bd] text-sm font-black text-white shadow-[0_8px_24px_rgba(23,79,145,0.20)]">
                  ✓
                </div>

                <div className="ml-3">
                  <p className="text-xs text-slate-400">Tahap 2</p>

                  <p className="text-sm font-semibold text-slate-700">
                    Orang Tua / Wali
                  </p>
                </div>
              </div>

              <div className="mx-5 h-px flex-1 bg-blue-200" />

              {/* STEP 3 */}
              <div className="flex items-center">
                <div className="edu-step-done flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#174f91] to-[#2675bd] text-sm font-black text-white shadow-[0_8px_24px_rgba(23,79,145,0.20)]">
                  ✓
                </div>

                <div className="ml-3">
                  <p className="text-xs text-slate-400">Tahap 3</p>

                  <p className="text-sm font-semibold text-slate-700">
                    Pendidikan
                  </p>
                </div>
              </div>

              <div className="mx-5 h-px flex-1 bg-blue-200" />

              {/* STEP 4 */}
              <div className="flex items-center">
                <div className="edu-step-done flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#174f91] to-[#2675bd] text-sm font-black text-white shadow-[0_8px_24px_rgba(23,79,145,0.20)]">
                  ✓
                </div>

                <div className="ml-3">
                  <p className="text-xs text-slate-400">Tahap 4</p>

                  <p className="text-sm font-semibold text-slate-700">
                    Berkas
                  </p>
                </div>
              </div>

              <div className="mx-5 h-px flex-1 bg-blue-200" />

              {/* STEP 5 */}
              <div className="flex items-center">
                <div className="edu-step-active flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#174f91] to-[#2675bd] text-sm font-black text-white shadow-[0_10px_28px_rgba(23,79,145,0.25)]">
                  5
                </div>

                <div className="ml-3">
                  <p className="text-xs font-medium text-blue-600">
                    Tahap 5
                  </p>

                  <p className="text-sm font-bold text-slate-900">
                    Pernyataan
                  </p>
                </div>
              </div>

              <div className="mx-5 h-px flex-1 bg-slate-200" />

              {/* STEP 6 */}
              <div className="flex items-center opacity-50">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-[#f4f8fc] text-sm font-black text-slate-400 ring-1 ring-slate-100">
                  6
                </div>

                <div className="ml-3">
                  <p className="text-xs text-slate-400">Tahap 6</p>

                  <p className="text-sm font-semibold text-slate-600">
                    Selesai
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 py-10 sm:px-8">

        {/* TITLE */}
        <div className="animate-fade-up edu-reveal">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#245ea8]">
            Tahap 5 dari 6
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-tight text-[#071a36] sm:text-5xl">
            Pernyataan dan Persetujuan
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#697787] sm:text-base">
            Silakan membaca seluruh pernyataan berikut sebelum menyelesaikan
            proses pendaftaran.
          </p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8191a2]">
            Please review the declaration before completing your admission.
          </p>
        </div>

        {/* CARD PERNYATAAN */}
        <div className="edu-card-shine animate-fade-up-delay-1 mt-8 rounded-[2rem] border border-white/90 bg-white/94 p-6 shadow-[0_22px_65px_rgba(7,26,54,0.08)] backdrop-blur-xl sm:p-9">

          <div className="flex items-start gap-4">
            <div className="edu-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#edf4fb] text-[#245ea8] ring-1 ring-blue-100 shadow-sm transition-all duration-500">
              ✓
            </div>

            <div>
              <h3 className="text-lg font-black tracking-tight text-[#071a36]">
                Pernyataan Wali Santri
              </h3>

              <p className="mt-1 text-xs leading-5 text-[#7a8a9a]">
                Persetujuan atas data dan dokumen yang telah diberikan.
              </p>
            </div>
          </div>

          {/* ISI */}
          <div className="mt-7 rounded-[1.45rem] border border-slate-100 bg-[#fbfdff] p-5 text-sm leading-7 text-[#52657a] sm:p-6">

            <p>
              Saya selaku orang tua atau wali calon santri menyatakan bahwa
              seluruh data yang saya masukkan dalam formulir pendaftaran
              PPDB Imam Nawawi Islamic Boarding School adalah benar dan
              dapat dipertanggungjawabkan.
            </p>

            <p>
              Saya telah mengisi data calon santri, data orang tua atau wali,
              data pendidikan, serta mengunggah dokumen persyaratan sesuai
              dengan keadaan dan dokumen resmi yang dimiliki.
            </p>

            <p>
              Saya bersedia apabila pihak Imam Nawawi Islamic Boarding School
              melakukan verifikasi terhadap data dan dokumen yang telah saya
              berikan dalam proses penerimaan peserta didik baru.
            </p>

            <p>
              Apabila di kemudian hari ditemukan data atau dokumen yang tidak
              benar, saya bersedia menerima keputusan dan ketentuan yang
              ditetapkan oleh pihak Imam Nawawi Islamic Boarding School
              sesuai dengan peraturan yang berlaku.
            </p>

          </div>

          {/* CHECKBOX */}
          <div className="edu-agreement mt-8 border-t border-slate-100 pt-7">

            <label className="flex cursor-pointer items-start gap-4">

              <input
                type="checkbox"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
                className="mt-1 h-5 w-5 cursor-pointer rounded border-slate-300 text-[#174f91] focus:ring-2 focus:ring-blue-500/40"
              />

              <span className="text-sm font-bold leading-6 text-[#42566d]">
                Saya telah membaca, memahami, dan menyetujui seluruh
                pernyataan di atas. Saya memastikan bahwa data dan dokumen
                yang saya berikan adalah benar.
              </span>

            </label>

          </div>
        </div>

        {/* INFORMASI */}
        <div className="edu-note animate-fade-up-delay-2 mt-6 rounded-[1.5rem] border border-amber-100 bg-[#fffaf0] p-5 shadow-sm">

          <div className="flex gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white font-black text-amber-700 ring-1 ring-amber-100 shadow-sm">
              !
            </div>

            <div>
              <h3 className="font-black text-[#071a36]">
                Periksa kembali data Anda
              </h3>

              <p className="mt-1 text-sm leading-6 text-[#687687]">
                Setelah proses pendaftaran diselesaikan, data akan masuk ke
                dalam sistem PPDB untuk proses verifikasi oleh panitia.
              </p>
            </div>

          </div>

        </div>

        {/* NAVIGATION */}
        <div className="animate-fade-up-delay-3 mt-10 flex flex-col-reverse gap-3 border-t border-slate-200 pt-7 sm:flex-row sm:items-center sm:justify-between">

          <button
            type="button"
            onClick={() => router.push("/ppdb/daftar/berkas")}
            className="group rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-100 hover:bg-[#f8fbfe] hover:shadow-md active:scale-[0.98]"
          >
            ← Kembali
          </button>

          <button
            type="button"
            onClick={handleContinue}
            className={`group rounded-2xl px-7 py-3.5 text-sm font-black text-white shadow-[0_14px_34px_rgba(23,79,145,0.20)] transition-all duration-300 active:scale-[0.98] ${
              agreed
                ? "bg-gradient-to-r from-[#0d3b72] via-[#174f91] to-[#2675bd] hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(23,79,145,0.28)]"
                : "cursor-not-allowed bg-slate-300"
            }`}
          >
            Selesaikan Pendaftaran →
          </button>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 bg-[#071a36] text-white">

        <div className="mx-auto max-w-4xl px-5 py-7 text-center sm:px-8">

          <p className="text-sm font-semibold text-slate-700">
            INIBS Smart Digital
          </p>

          <p className="mt-1 text-xs text-blue-200">
            Imam Nawawi Islamic Boarding School
          </p>

          <p className="mt-3 text-[10px] text-blue-300">
            © 2026 Imam Nawawi Islamic Boarding School
          </p>

        </div>

      </footer>
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        .edu-float {
          animation: eduFloat 8s ease-in-out infinite;
        }

        .edu-float-reverse {
          animation: eduFloatReverse 9s ease-in-out infinite;
        }

        .edu-pulse {
          animation: eduPulse 4s ease-in-out infinite;
        }

        .edu-reveal {
          animation: eduReveal 900ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .edu-step-done {
          animation: eduStepDone 700ms ease-out both;
        }

        .edu-step-active {
          animation: eduStepActive 2.8s ease-in-out infinite;
        }

        .edu-success-ring {
          animation: eduSuccess 4.5s ease-in-out infinite;
        }

        .edu-card-shine {
          position: relative;
          overflow: hidden;
          transition:
            transform 650ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 650ms cubic-bezier(0.22, 1, 0.36, 1),
            border-color 450ms ease;
        }

        .edu-card-shine::after {
          content: "";
          position: absolute;
          top: -20%;
          bottom: -20%;
          left: -58%;
          width: 34%;
          transform: skewX(-18deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.32),
            transparent
          );
          transition: left 1s cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
        }

        .edu-card-shine:hover {
          transform: translateY(-5px);
          border-color: rgba(191,219,254,0.95);
          box-shadow: 0 30px 76px rgba(7,26,54,0.10);
        }

        .edu-card-shine:hover::after {
          left: 140%;
        }

        .edu-icon {
          transition:
            transform 500ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 500ms ease;
        }

        .edu-card-shine:hover .edu-icon {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 10px 26px rgba(38,117,189,0.12);
        }

        .edu-agreement {
          border-radius: 1.25rem;
          transition:
            background-color 300ms ease,
            border-color 300ms ease,
            box-shadow 300ms ease;
        }

        .edu-agreement:has(input:checked) {
          background: rgba(247,251,255,0.92);
          border-color: rgba(191,219,254,0.95);
          box-shadow: 0 12px 30px rgba(23,79,145,0.06);
        }

        .edu-note {
          animation: eduReveal 700ms 120ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes eduReveal {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes eduFloat {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -12px, 0); }
        }

        @keyframes eduFloatReverse {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, 10px, 0); }
        }

        @keyframes eduPulse {
          0%, 100% { opacity: 0.28; transform: scale(0.96); }
          50% { opacity: 0.84; transform: scale(1.08); }
        }

        @keyframes eduStepDone {
          from { opacity: 0; transform: scale(0.76); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes eduStepActive {
          0%, 100% {
            transform: translateY(0);
            box-shadow: 0 8px 24px rgba(23,79,145,0.20);
          }
          50% {
            transform: translateY(-2px);
            box-shadow: 0 12px 30px rgba(23,79,145,0.30);
          }
        }

        @keyframes eduSuccess {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

    </main>
  );
}