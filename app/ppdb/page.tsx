"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

type InfoCard = {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  tone: "blue" | "cyan" | "indigo" | "navy"
}

const informationCards: InfoCard[] = [
  {
    title: "Persyaratan Pendaftaran",
    description:
      "Lihat dokumen dan persyaratan yang perlu dipersiapkan sebelum mendaftar.",
    href: "/ppdb/persyaratan",
    icon: <DocumentIcon />,
    tone: "blue",
  },
  {
    title: "Jadwal PPDB",
    description:
      "Pantau jadwal pendaftaran, verifikasi, seleksi, hingga pengumuman hasil.",
    href: "/ppdb/jadwal",
    icon: <CalendarIcon />,
    tone: "cyan",
  },
  {
    title: "Biaya Pendaftaran",
    description:
      "Lihat informasi biaya pendaftaran dan ketentuan pembayaran calon santri.",
    href: "/ppdb/biaya",
    icon: <WalletIcon />,
    tone: "indigo",
  },
  {
    title: "Proses Seleksi",
    description:
      "Pahami tahapan serta persiapan yang diperlukan dalam proses seleksi.",
    href: "/ppdb/seleksi",
    icon: <AssessmentIcon />,
    tone: "navy",
  },
]

const admissionSteps = [
  ["01", "Pendaftaran", "Isi data calon santri."],
  ["02", "Berkas", "Lengkapi dokumen yang dipersyaratkan."],
  ["03", "Verifikasi", "Tim memeriksa data dan berkas yang dikirimkan."],
  ["04", "Seleksi", "Ikuti tahapan penilaian penerimaan santri."],
  ["05", "Pengumuman", "Lihat hasil penerimaan secara resmi."],
]

export default function PPDBPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 60)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <main className="group/page relative min-h-screen cursor-default overflow-x-hidden bg-[#eef4fb] text-slate-800 selection:bg-blue-100 selection:text-blue-950">
      {/* BACKDROP */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <Image
          src="/images/ppdb-background.png"
          alt="Imam Nawawi Islamic Boarding School"
          fill
          priority
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-white/40" />
        <div className="absolute inset-0 bg-blue-950/10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(248,251,255,0.08)_0%,rgba(239,246,255,0.18)_48%,rgba(238,244,251,0.96)_100%)]" />

        <div className="absolute -left-40 top-16 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl animate-pulse" />
        <div className="absolute -right-36 top-40 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl animate-pulse [animation-delay:800ms]" />
        <div className="absolute bottom-[-12rem] left-1/3 h-96 w-96 rounded-full bg-indigo-300/10 blur-3xl" />

        <div className="absolute left-[8%] top-[18%] h-1.5 w-1.5 animate-pulse rounded-full bg-white/80" />
        <div className="absolute right-[15%] top-[32%] h-2 w-2 animate-pulse rounded-full bg-cyan-200/80 [animation-delay:600ms]" />
        <div className="absolute left-[23%] top-[48%] h-1.5 w-1.5 animate-pulse rounded-full bg-blue-300/70 [animation-delay:1200ms]" />
      </div>

      <div className="relative z-10">
        {/* HEADER */}
        <header
          className={`sticky top-0 z-40 border-b border-white/40 bg-white/70 backdrop-blur-2xl transition-all duration-700 ${
            mounted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="group flex items-center gap-3 rounded-2xl px-2 py-1.5 transition-all duration-300 hover:bg-white/70"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-white/95 p-1.5 shadow-sm transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/logo-imam.png"
                  alt="Logo Imam Nawawi"
                  width={45}
                  height={45}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-blue-700">
                  INIBS SMART DIGITAL
                </p>
                <p className="truncate text-sm font-black text-[#071a36]">
                  Penerimaan Peserta Didik Baru
                </p>
              </div>
            </Link>

            <Link
              href="/"
              className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2.5 text-xs font-black text-blue-900 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-lg active:scale-95"
            >
              <ArrowLeftIcon />
              <span className="hidden sm:inline">Kembali ke Beranda</span>
            </Link>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-4 pb-4 pt-10 sm:px-6 sm:pt-14 lg:px-8">
          {/* HERO */}
          <div
            className={`mx-auto max-w-5xl text-center transition-all duration-1000 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="relative mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/90 bg-white/90 p-4 shadow-2xl shadow-blue-950/10 backdrop-blur-xl transition-transform duration-700 hover:scale-105">
              <div className="absolute inset-0 rounded-[2rem] bg-blue-100/30 blur-xl" />
              <Image
                src="/logo-imam.png"
                alt="Imam Nawawi Islamic Boarding School"
                width={90}
                height={90}
                className="relative h-full w-full object-contain"
                priority
              />
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.34em] text-blue-700 sm:text-xs">
              Imam Nawawi Islamic Boarding School
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-tight text-[#061a36] sm:text-6xl">
              PPDB 2027/2028
            </h1>

            <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              Penerimaan Peserta Didik Baru through the INIBS Smart Digital platform.
              Lihat Detail the admission process, requirements, schedule, and fees
              before starting your application.
            </p>

            <div className="mx-auto mt-7 flex items-center justify-center gap-3">
              <div className="h-px w-14 bg-blue-600/40" />
              <div className="flex h-3 w-3 items-center justify-center rounded-full border border-blue-300 bg-white shadow-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              </div>
              <div className="h-px w-14 bg-blue-600/40" />
            </div>
          </div>

          {/* WELCOME */}
          <section
            className={`mx-auto mt-10 max-w-5xl transition-all delay-100 duration-1000 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="relative overflow-hidden rounded-[2.2rem] border border-white/90 bg-white/88 p-7 shadow-2xl shadow-blue-950/5 backdrop-blur-2xl sm:p-9">
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-200/25 blur-3xl" />
              <div className="relative z-10 max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-blue-700">
                  <SparkleIcon />
                  Informasi PPDB
                </span>

                <h2 className="mt-5 text-2xl font-black tracking-tight text-[#071a36] sm:text-3xl">
                  Selamat Datang di PPDB INIBS
                </h2>

                <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                  This page is the official starting point for prospective
                  students and parents who are preparing for admission to
                  Imam Nawawi Islamic Boarding School.
                </p>
              </div>
            </div>
          </section>

          {/* INFORMATION CARDS */}
          <section
            className={`mx-auto mt-7 max-w-5xl transition-all delay-200 duration-1000 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {informationCards.map((card, index) => (
                <InformationCard
                  key={card.href}
                  card={card}
                  delay={index * 70}
                />
              ))}
            </div>
          </section>

          {/* PRIMARY ACTION */}
          <section
            className={`mx-auto mt-10 max-w-5xl transition-all delay-300 duration-1000 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="relative overflow-hidden rounded-[2.3rem] bg-gradient-to-br from-[#061a36] via-[#0a2f63] to-blue-700 p-7 text-white shadow-2xl shadow-blue-950/20 sm:p-10">
              <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />
              <div className="absolute -left-24 bottom-[-8rem] h-72 w-72 rounded-full bg-blue-300/10 blur-3xl" />

              <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">
                    Mulai Pendaftaran
                  </p>

                  <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                    Mulai Perjalanan Pendaftaran
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-blue-100">
                    Prepare the required information and begin your official
                    application through the INIBS admission system.
                  </p>
                </div>

                <Link
                  href="/ppdb/daftar"
                  className="group inline-flex min-w-[210px] cursor-pointer items-center justify-center gap-3 rounded-2xl bg-white px-7 py-4 text-sm font-black text-[#061a36] shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:scale-95"
                >
                  Daftar Sekarang
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    <ArrowIcon />
                  </span>
                </Link>
              </div>
            </div>
          </section>

          {/* PROCESS */}
          <section
            className={`mx-auto mt-12 max-w-5xl transition-all delay-400 duration-1000 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-700">
                Alur Pendaftaran
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-[#071a36] sm:text-3xl">
                Lima Tahap Pendaftaran
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                A structured admission flow designed to keep the process clear
                for students and parents.
              </p>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {admissionSteps.map(([number, title, description], index) => (
                <div
                  key={number}
                  className="group rounded-[1.5rem] border border-white/90 bg-white/88 p-5 shadow-lg shadow-blue-950/5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:bg-white hover:shadow-xl"
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[10px] font-black text-blue-700 ring-1 ring-blue-100 transition-transform duration-300 group-hover:scale-110">
                      {number}
                    </span>
                    {index < admissionSteps.length - 1 && (
                      <ArrowIcon className="hidden text-slate-200 lg:block" />
                    )}
                  </div>

                  <h3 className="mt-4 text-sm font-black text-[#071a36]">
                    {title}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* TRUST */}
          <section
            className={`mx-auto mt-12 max-w-5xl pb-10 transition-all delay-500 duration-1000 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="grid overflow-hidden rounded-[2rem] border border-white/90 bg-white/88 shadow-2xl shadow-blue-950/5 backdrop-blur-xl sm:grid-cols-3">
              <TrustCard
                icon={<ShieldIcon />}
                title="Aman & Terpercaya"
                text="Dirancang untuk memberikan pengalaman pendaftaran yang aman dan terpercaya."
              />
              <TrustCard
                icon={<PulseIcon />}
                title="Informasi Terpusat"
                text="Akses informasi dan perkembangan proses PPDB dalam satu tempat."
                bordered
              />
              <TrustCard
                icon={<DeviceIcon />}
                title="Akses Mudah"
                text="Gunakan platform melalui komputer, tablet, maupun ponsel."
              />
            </div>
          </section>
        </section>

        {/* FOOTER */}
        <footer className="relative border-t border-white/10 bg-[#061a36] text-white">
          <div className="mx-auto max-w-5xl px-4 py-9 text-center sm:px-6">
            <p className="text-sm font-black tracking-wide">
              INIBS Smart Digital
            </p>
            <p className="mt-1 text-xs text-blue-200">
              Imam Nawawi Islamic Boarding School
            </p>
            <p className="mt-3 text-[10px] font-medium text-blue-300">
              © 2026 Imam Nawawi Islamic Boarding School
            </p>
          </div>
        </footer>
      </div>

      <div className="pointer-events-none fixed bottom-6 right-6 z-50 hidden h-3 w-3 rounded-full bg-blue-600/50 shadow-[0_0_0_6px_rgba(37,99,235,0.08)] md:block">
        <span className="absolute inset-0 animate-ping rounded-full bg-cyan-400/40" />
      </div>

      <style jsx global>{`
        html { scroll-behavior: smooth; }\n\n        a, button { cursor: pointer; }\n\n        @keyframes softPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.08);
            opacity: 1;
          }
        }
      `}</style>
    </main>
  )
}

function InformationCard({
  card,
  delay,
}: {
  card: InfoCard
  delay: number
}) {
  const tone = getTone(card.tone)

  return (
    <Link
      href={card.href}
      style={{ transitionDelay: `${delay}ms` }}
      className="group relative overflow-hidden rounded-[1.65rem] border border-white/90 bg-white/88 p-5 shadow-lg shadow-blue-950/5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:bg-white hover:shadow-2xl"
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r transition-transform duration-500 group-hover:scale-x-100 ${tone.gradient}`}
      />

      <div
        className={`absolute -right-12 -top-12 h-36 w-36 rounded-full blur-2xl transition-transform duration-700 group-hover:scale-150 ${tone.glow}`}
      />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-2 ${tone.iconBg} ${tone.iconText}`}
        >
          {card.icon}
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-300 shadow-sm transition-all duration-300 group-hover:translate-x-1 group-hover:text-blue-700">
          <ArrowIcon />
        </div>
      </div>

      <div className="relative z-10 mt-5">
        <p
          className={`text-[8px] font-black uppercase tracking-[0.18em] ${tone.label}`}
        >
          Layanan PPDB
        </p>

        <h3 className="mt-2 text-base font-black leading-6 text-[#071a36]">
          {card.title}
        </h3>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          {card.description}
        </p>

        <div
          className={`mt-4 inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.14em] ${tone.label}`}
        >
          Lihat Detail
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            <ArrowIcon />
          </span>
        </div>
      </div>
    </Link>
  )
}

function TrustCard({
  icon,
  title,
  text,
  bordered = false,
}: {
  icon: React.ReactNode
  title: string
  text: string
  bordered?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-4 p-6 ${
        bordered ? "border-y border-slate-200 sm:border-x sm:border-y-0" : ""
      }`}
    >
      <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
        {icon}
      </div>

      <div>
        <h3 className="text-sm font-black text-[#071a36]">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
      </div>
    </div>
  )
}

function getTone(tone: InfoCard["tone"]) {
  const tones = {
    blue: {
      gradient: "from-blue-800 via-blue-600 to-cyan-500",
      glow: "bg-blue-100/80",
      iconBg: "bg-blue-50 ring-blue-100",
      iconText: "text-blue-700",
      label: "text-blue-700",
    },
    cyan: {
      gradient: "from-cyan-700 via-blue-600 to-cyan-400",
      glow: "bg-cyan-100/80",
      iconBg: "bg-cyan-50 ring-cyan-100",
      iconText: "text-cyan-700",
      label: "text-cyan-700",
    },
    indigo: {
      gradient: "from-indigo-800 via-blue-700 to-violet-500",
      glow: "bg-indigo-100/80",
      iconBg: "bg-indigo-50 ring-indigo-100",
      iconText: "text-indigo-700",
      label: "text-indigo-700",
    },
    navy: {
      gradient: "from-[#061a36] via-blue-800 to-cyan-500",
      glow: "bg-blue-100/70",
      iconBg: "bg-slate-100 ring-slate-200",
      iconText: "text-[#061a36]",
      label: "text-[#061a36]",
    },
  }

  return tones[tone]
}

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={`h-4 w-4 ${className}`}
    >
      <path strokeLinecap="round" d="M5 12h13" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m13 6 6 6-6 6" />
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <path strokeLinecap="round" d="M19 12H5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m11 6-6 6 6 6" />
    </svg>
  )
}

function SparkleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-3.5 w-3.5"
    >
      <path strokeLinecap="round" d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      <path strokeLinecap="round" d="m5.6 5.6 2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
      <circle cx="12" cy="12" r="3.4" />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 3.5h8l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V3.5Z" />
      <path strokeLinecap="round" d="M14 3.5V8h4M9 12h6M9 15h6M9 18h4" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path strokeLinecap="round" d="M8 3v4M16 3v4M4 9h16" />
    </svg>
  )
}

function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v10.5a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 17V7.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h13a2 2 0 0 1 2 2v1H4" />
      <circle cx="16.5" cy="14.5" r="1" />
    </svg>
  )
}

function AssessmentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3.5h10A1.5 1.5 0 0 1 18.5 5v14A1.5 1.5 0 0 1 17 20.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5Z" />
      <path strokeLinecap="round" d="M9 8h6M9 12h6M9 16h3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m15 15 1.3 1.3L19 13.6" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.5 19 6v5.5c0 4.5-2.8 7.3-7 9-4.2-1.7-7-4.5-7-9V6l7-2.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
    </svg>
  )
}

function PulseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 12h4l2-5 3.3 10 2.4-7 1.7 2h3.6" />
    </svg>
  )
}

function DeviceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <rect x="3.5" y="4.5" width="17" height="12" rx="2" />
      <path strokeLinecap="round" d="M8 20h8M12 16.5V20" />
    </svg>
  )
}
