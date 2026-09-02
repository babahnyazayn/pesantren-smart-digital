"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"

type Jenjang = "SMP/MTs" | "SMA/MA"

const selectionSteps = [
  {
    number: "01",
    title: "Tes Al-Qur'an",
    eyebrow: "QURAN ASSESSMENT",
    description:
      "Mengenal kemampuan membaca Al-Qur'an, hafalan, dan dasar tajwid calon santri.",
    points: ["Bacaan Al-Qur'an", "Hafalan", "Tajwid dasar"],
    icon: <QuranIcon />,
  },
  {
    number: "02",
    title: "Bahasa Arab",
    eyebrow: "ARABIC ASSESSMENT",
    description:
      "Melihat kemampuan dasar Bahasa Arab dan kesiapan mengikuti pembelajaran bahasa di INIBS.",
    points: ["Kosakata dasar", "Pemahaman sederhana", "Percakapan dasar"],
    icon: <ArabicIcon />,
  },
  {
    number: "03",
    title: "Islam",
    eyebrow: "ISLAMIC ASSESSMENT",
    description:
      "Menilai pemahaman dasar keislaman dan kesiapan calon santri mengikuti pendidikan Diniyyah.",
    points: ["Aqidah dasar", "Fiqih dasar", "Akhlak & adab"],
    icon: <IslamicIcon />,
  },
  {
    number: "04",
    title: "Wawancara",
    eyebrow: "STUDENT & PARENT INTERVIEW",
    description:
      "Wawancara bersama calon santri dan wali santri untuk mengenal motivasi, kesiapan, dan harapan keluarga.",
    points: ["Calon santri", "Wali santri", "Kesiapan boarding"],
    icon: <InterviewIcon />,
  },
]

export default function PPDBSelectionPage() {
  const [mounted, setMounted] = useState(false)
  const [jenjang, setJenjang] = useState<Jenjang>("SMP/MTs")

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 60)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#eef4fa] text-[#10233f] selection:bg-blue-100 selection:text-[#071a36]">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <Image
          src="/images/ppdb-background.png"
          alt="Imam Nawawi Islamic Boarding School"
          fill
          priority
          className="object-cover object-center opacity-90 grayscale-[3%]"
        />
        <div className="absolute inset-0 bg-white/65" />
        <div className="absolute inset-0 bg-[#071a36]/8" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(248,251,255,0.09)_0%,rgba(235,244,252,0.38)_43%,rgba(238,246,252,0.99)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.82),transparent_38%),radial-gradient(circle_at_8%_40%,rgba(37,99,235,0.10),transparent_28%),radial-gradient(circle_at_92%_45%,rgba(6,182,212,0.08),transparent_30%)]" />
        <div className="absolute -left-48 top-16 h-96 w-96 rounded-full bg-blue-300/10 blur-3xl animate-pulse" />
        <div className="absolute -right-44 top-44 h-96 w-96 rounded-full bg-cyan-300/10 blur-3xl animate-pulse [animation-delay:900ms]" />
        <div className="absolute left-[10%] top-[24%] h-24 w-24 rounded-full border border-white/40 bg-white/10 ppdb-float backdrop-blur-sm" />
        <div className="absolute right-[9%] top-[58%] h-16 w-16 rounded-full border border-blue-200/35 bg-blue-200/10 ppdb-float [animation-delay:1200ms]" />
      </div>

      <div className="relative z-10">
        <header
          className={`sticky top-0 z-50 border-b border-white/70 bg-white/82 backdrop-blur-2xl transition-all duration-700 ${
            mounted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <Link
              href="/ppdb"
              className="group flex items-center gap-3 rounded-2xl px-2 py-1.5 transition-all duration-300 hover:bg-white/80"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-white p-1.5 shadow-sm transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/logo-imam.png"
                  alt="Logo Imam Nawawi"
                  width={45}
                  height={45}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#245ea8]">
                  INIBS SMART DIGITAL
                </p>
                <p className="truncate text-sm font-black text-[#071a36]">
                  Proses Seleksi PPDB
                </p>
              </div>
            </Link>

            <Link
              href="/ppdb"
              className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-blue-100 bg-white/82 px-4 py-2.5 text-xs font-black text-[#174f91] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-xl active:scale-[0.98]"
            >
              <ArrowLeftIcon />
              <span className="hidden sm:inline">Kembali ke PPDB</span>
            </Link>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
          <section
            className={`mx-auto max-w-4xl text-center transition-all duration-1000 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2.1rem] border border-white/90 bg-white/94 p-3 shadow-[0_24px_70px_rgba(7,26,54,0.10)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:scale-105">
              <Image
                src="/logo-imam.png"
                alt="Imam Nawawi Islamic Boarding School"
                width={80}
                height={80}
                className="h-full w-full object-contain"
                priority
              />
            </div>

            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-[#245ea8] sm:text-xs">
              PPDB 2027/2028
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-[#071a36] sm:text-5xl">
              Proses Seleksi
            </h1>

            <div className="mx-auto mt-4 flex max-w-fit items-center gap-2 rounded-full border border-blue-100 bg-white/72 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.18em] text-[#6b7f95] shadow-sm backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2675bd]" />
              {jenjang} • Seleksi Calon Santri
            </div>

            <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-[#607086] sm:text-base">
              Kami mengenal calon santri secara utuh melalui penilaian
              Al-Qur'an, Bahasa Arab, pendidikan Islam, serta wawancara bersama
              calon santri dan wali santri.
            </p>
          </section>

          <section className="mx-auto mt-10 max-w-3xl">
            <div className="rounded-[1.8rem] border border-white/90 bg-white/88 p-2 shadow-[0_18px_55px_rgba(7,26,54,0.07)] backdrop-blur-xl">
              <div className="grid grid-cols-2 gap-2">
                {(["SMP/MTs", "SMA/MA"] as Jenjang[]).map((item) => {
                  const active = item === jenjang
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setJenjang(item)}
                      className={`group cursor-pointer rounded-[1.3rem] px-5 py-4 text-left transition-all duration-300 ${
                        active
                          ? "bg-gradient-to-r from-[#0d3b72] via-[#174f91] to-[#2675bd] text-white shadow-lg shadow-blue-900/15"
                          : "bg-white text-[#607086] hover:bg-[#f4f8fc] hover:text-[#174f91]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p
                            className={`text-[8px] font-black uppercase tracking-[0.18em] ${
                              active ? "text-blue-100" : "text-slate-400"
                            }`}
                          >
                            Jenjang Pendidikan
                          </p>
                          <p className="mt-1 text-base font-black sm:text-lg">
                            {item}
                          </p>
                        </div>
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${
                            active
                              ? "bg-white/12 text-white"
                              : "bg-blue-50 text-[#2675bd]"
                          }`}
                        >
                          <SchoolIcon />
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          <section
            className={`mx-auto mt-9 max-w-5xl transition-all delay-150 duration-1000 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="relative overflow-hidden rounded-[2.1rem] bg-gradient-to-br from-[#071a36] via-[#123e70] to-[#2675bd] p-7 text-white shadow-[0_24px_70px_rgba(7,26,54,0.16)] sm:p-9">
              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />

              <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-200">
                    Seleksi INIBS
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                    Mengenal Calon Santri Secara Utuh
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100">
                    Seleksi tidak hanya melihat satu kemampuan. Kami melihat
                    kesiapan calon santri dari sisi Al-Qur'an, Bahasa Arab,
                    pendidikan Islam, dan hasil wawancara.
                  </p>
                </div>

                <div className="shrink-0 rounded-2xl border border-white/12 bg-white/10 px-5 py-4 backdrop-blur-md">
                  <p className="text-[8px] font-black uppercase tracking-[0.18em] text-blue-200">
                    Format
                  </p>
                  <p className="mt-1 text-sm font-black">
                    Tes + Wawancara
                  </p>
                  <p className="mt-1 text-[10px] text-blue-100">
                    Santri & Wali Santri
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto mt-10 max-w-5xl">
            <div className="mb-7 text-center">
              <div className="mx-auto mb-3 h-px w-16 bg-gradient-to-r from-transparent via-[#2675bd]/45 to-transparent" />
              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#245ea8]">
                Materi Seleksi
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-[#071a36] sm:text-3xl">
                Empat Tahap Penilaian
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {selectionSteps.map((step, index) => (
                <SelectionCard key={step.number} step={step} index={index} />
              ))}
            </div>
          </section>

          <section className="mx-auto mt-8 max-w-5xl">
            <div className="rounded-[2rem] border border-white/90 bg-white/90 p-7 shadow-[0_18px_55px_rgba(7,26,54,0.07)] backdrop-blur-xl sm:p-9">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#edf4fb] text-[#245ea8] ring-1 ring-blue-100 shadow-sm">
                  <InterviewIcon />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#245ea8]">
                    Wawancara
                  </p>
                  <h2 className="mt-1 text-xl font-black text-[#071a36]">
                    Calon Santri & Wali Santri
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[#697787]">
                    Wawancara menjadi ruang untuk mengenal motivasi calon santri,
                    kesiapan menjalani kehidupan boarding school, karakter,
                    kebiasaan belajar, harapan orang tua, serta pemahaman keluarga
                    terhadap program dan aturan INIBS.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <InterviewPoint title="Motivasi" text="Alasan dan tujuan memilih INIBS." />
                <InterviewPoint title="Kesiapan" text="Kesiapan belajar dan hidup di asrama." />
                <InterviewPoint title="Keluarga" text="Harapan dan dukungan wali santri." />
              </div>
            </div>
          </section>

          <section className="mx-auto mt-8 max-w-5xl">
            <div className="rounded-[2rem] border border-blue-100 bg-[#f7fbff]/85 p-7 shadow-sm sm:p-9">
              <div className="text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#245ea8]">
                  Setelah Seleksi
                </p>
                <h2 className="mt-2 text-2xl font-black text-[#071a36]">
                  Hasil Seleksi
                </h2>
                <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#697787]">
                  Hasil penilaian tes dan wawancara menjadi bahan pertimbangan
                  panitia untuk menentukan hasil akhir calon santri.
                </p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <ResultCard title="Diterima" text="Calon santri dinyatakan diterima." />
                <ResultCard title="Diterima dengan Catatan" text="Diterima dengan arahan atau catatan tertentu." />
                <ResultCard title="Belum Direkomendasikan" text="Belum memenuhi kriteria penerimaan pada periode ini." />
              </div>
            </div>
          </section>

          <section className="mx-auto mt-8 max-w-5xl text-center">
            <Link
              href="/ppdb/daftar"
              className="group inline-flex cursor-pointer items-center justify-center gap-3 rounded-2xl bg-[#071a36] px-7 py-4 text-sm font-black text-white shadow-[0_14px_40px_rgba(7,26,54,0.16)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#174f91] hover:shadow-2xl active:scale-[0.98]"
            >
              Mulai Pendaftaran
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                <ArrowIcon />
              </span>
            </Link>

            <p className="mx-auto mt-4 max-w-2xl text-[10px] leading-5 text-[#7a8795]">
              Materi dan tingkat kesulitan seleksi dapat disesuaikan dengan
              jenjang SMP/MTs dan SMA/MA serta ketetapan panitia PPDB.
            </p>
          </section>
        </section>

        <footer className="border-t border-white/10 bg-[#071a36] text-white shadow-[0_-10px_35px_rgba(7,26,54,0.14)]">
          <div className="mx-auto max-w-6xl px-4 py-8 text-center sm:px-6">
            <p className="text-sm font-black tracking-[0.08em]">
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
      </div>

      <style jsx global>{`
        @keyframes ppdbSelectionFadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ppdbPremiumFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -7px, 0);
          }
        }

        .ppdb-float {
          animation: ppdbPremiumFloat 7s ease-in-out infinite;
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
  )
}

function SelectionCard({
  step,
  index,
}: {
  step: (typeof selectionSteps)[number]
  index: number
}) {
  return (
    <article
      className="group relative overflow-hidden rounded-[1.9rem] border border-white/90 bg-white/94 p-6 shadow-[0_18px_55px_rgba(7,26,54,0.07)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_26px_70px_rgba(7,26,54,0.10)]"
      style={{
        animation: "ppdbSelectionFadeUp 700ms ease-out both",
        animationDelay: `${index * 80}ms`,
      }}
    >
      <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-[#0d3b72] via-[#2675bd] to-[#55a9d8] transition-transform duration-500 group-hover:scale-x-100" />

      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf4fb] text-[#245ea8] ring-1 ring-blue-100 shadow-sm transition-all duration-500 group-hover:scale-105 group-hover:rotate-1">
          {step.icon}
        </div>
        <span className="rounded-full bg-[#f4f8fc] px-2.5 py-1 text-[8px] font-black tracking-[0.14em] text-[#6c8095]">
          {step.number}
        </span>
      </div>

      <p className="mt-5 text-[8px] font-black uppercase tracking-[0.2em] text-[#245ea8]">
        {step.eyebrow}
      </p>
      <h3 className="mt-1 text-xl font-black text-[#071a36]">{step.title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#697787]">
        {step.description}
      </p>

      <div className="mt-5 space-y-2">
        {step.points.map((point) => (
          <div key={point} className="flex items-center gap-2 text-xs font-semibold text-[#647489]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f0f6fc] text-[#245ea8] ring-1 ring-blue-100">
              <CheckIcon />
            </span>
            {point}
          </div>
        ))}
      </div>
    </article>
  )
}

function DetailPanel({
  eyebrow,
  title,
  icon,
  children,
}: {
  eyebrow: string
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="mx-auto mt-4 max-w-5xl rounded-[1.9rem] border border-blue-100 bg-white/92 p-6 shadow-[0_18px_55px_rgba(7,26,54,0.07)] backdrop-blur-xl sm:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf4fb] text-[#245ea8] ring-1 ring-blue-100 shadow-sm">
          {icon}
        </div>
        <div>
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#245ea8]">
            {eyebrow}
          </p>
          <h3 className="mt-1 text-xl font-black text-[#071a36]">{title}</h3>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  )
}

function InterviewPoint({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[1.35rem] border border-slate-100 bg-[#f8fbfe]/80 p-4 transition-all duration-300 hover:border-blue-100 hover:bg-white hover:shadow-sm">
      <p className="text-sm font-black text-[#071a36]">{title}</p>
      <p className="mt-1 text-[10px] leading-5 text-[#697787]">{text}</p>
    </div>
  )
}

function ResultCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[1.35rem] border border-slate-100 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-sm">
      <p className="text-sm font-black text-[#071a36]">{title}</p>
      <p className="mt-1 text-[10px] leading-5 text-[#697787]">{text}</p>
    </div>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path strokeLinecap="round" d="M5 12h13" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m13 6 6 6-6 6" />
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path strokeLinecap="round" d="M19 12H5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m11 6-6 6 6 6" />
    </svg>
  )
}

function SchoolIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 9 8-4 8 4-8 4-8-4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 10.5V18h10v-7.5M4 19.5h16" />
    </svg>
  )
}

function QuranIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5.5A2.5 2.5 0 0 1 7.5 3H18v17H7.5A2.5 2.5 0 0 0 5 22V5.5Z" />
      <path strokeLinecap="round" d="M5 5.5V22M9 7h5M9 10h6M9 13h4" />
    </svg>
  )
}

function ArabicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" d="M8 9.5h8M8 14h5M14.5 14h1" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m10 17 2-2 2 2" />
    </svg>
  )
}

function IslamicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.5 19 7v5c0 4.4-2.8 7.2-7 8.5C7.8 19.2 5 16.4 5 12V7l7-3.5Z" />
      <path strokeLinecap="round" d="M9 12h6M12 9v6" />
    </svg>
  )
}

function InterviewIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
      <circle cx="9" cy="8" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 5.5a2.5 2.5 0 1 1 0 5M16.5 14.5a4.5 4.5 0 0 1 3.5 4.3" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-3 w-3">
      <path strokeLinecap="round" strokeLinejoin="round" d="m7 12 3 3 7-7" />
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.5 12 2.3 2.3 4.7-5" />
    </svg>
  )
}
