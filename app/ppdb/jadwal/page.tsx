"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

type Jenjang = "SMP/MTs" | "SMA/MA"

const admission = {
  registrationStart: "01 September 2026",
  registrationEnd: "20 Desember 2026",
  selectionStart: "21 Desember 2026",
  selectionEnd: "30 Desember 2026",
  announcementDate: "31 Desember 2026",
}

export default function PPDBSchedulePage() {
  const [mounted, setMounted] = useState(false)
  const [jenjang, setJenjang] = useState<Jenjang>("SMP/MTs")
  const [countdown, setCountdown] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  } | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 60)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const target = new Date("2026-12-20T23:59:59+07:00").getTime()

    const updateCountdown = () => {
      const diff = Math.max(0, target - Date.now())
      const totalSeconds = Math.floor(diff / 1000)

      setCountdown({
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
      })
    }

    updateCountdown()
    const interval = window.setInterval(updateCountdown, 1000)

    return () => window.clearInterval(interval)
  }, [])

  const steps = useMemo(
    () => [
      {
        number: "01",
        title: "Pendaftaran",
        period: `${admission.registrationStart} - ${admission.registrationEnd}`,
        description:
          `Kesempatan untuk mendaftarkan calon siswa ${jenjang} melalui sistem PPDB resmi INIBS.`,
        icon: <RegistrationIcon />,
        tone: "blue",
      },
      {
        number: "02",
        title: "Seleksi",
        period: `${admission.selectionStart} - ${admission.selectionEnd}`,
        description:
          "Calon siswa mengikuti tahapan seleksi dan verifikasi yang ditetapkan oleh panitia.",
        icon: <AssessmentIcon />,
        tone: "indigo",
      },
      {
        number: "03",
        title: "Pengumuman",
        period: admission.announcementDate,
        description:
          "Hasil seleksi Gelombang 1 diumumkan melalui kanal resmi PPDB INIBS.",
        icon: <AnnouncementIcon />,
        tone: "navy",
      },
    ],
    [jenjang]
  )

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#edf4fb] text-[#10233f] selection:bg-blue-100 selection:text-[#071a36]">
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <Image
          src="/images/ppdb-background.png"
          alt="Imam Nawawi Islamic Boarding School"
          fill
          priority
          className="object-cover object-center opacity-90 grayscale-[3%]"
        />
        <div className="absolute inset-0 bg-white/63" />
        <div className="absolute inset-0 bg-[#071a36]/8" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(248,251,255,0.10)_0%,rgba(235,244,252,0.35)_42%,rgba(237,245,251,0.99)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.78),transparent_38%),radial-gradient(circle_at_8%_38%,rgba(37,99,235,0.09),transparent_28%),radial-gradient(circle_at_92%_42%,rgba(6,182,212,0.08),transparent_30%)]" />

        <div className="absolute -left-44 top-20 h-96 w-96 rounded-full bg-blue-300/10 blur-3xl animate-pulse" />
        <div className="absolute -right-40 top-44 h-96 w-96 rounded-full bg-cyan-300/10 blur-3xl animate-pulse [animation-delay:900ms]" />

        <div className="absolute left-[11%] top-[22%] h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600/45" />
        <div className="absolute right-[14%] top-[34%] h-2 w-2 animate-pulse rounded-full bg-cyan-500/35 [animation-delay:600ms]" />
      </div>

      <div className="relative z-10">
        {/* HEADER */}
        <header
          className={`sticky top-0 z-50 border-b border-white/70 bg-white/76 backdrop-blur-2xl transition-all duration-700 ${
            mounted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <Link
              href="/ppdb"
              className="group flex items-center gap-3 rounded-2xl px-2 py-1.5 transition-all duration-300 hover:bg-white/75"
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
                  Jadwal PPDB
                </p>
              </div>
            </Link>

            <Link
              href="/ppdb"
              className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-blue-100 bg-white/82 px-4 py-2.5 text-xs font-black text-[#174f91] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg active:scale-95"
            >
              <ArrowLeftIcon />
              <span className="hidden sm:inline">Kembali ke PPDB</span>
            </Link>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
          {/* HERO */}
          <section
            className={`mx-auto max-w-5xl text-center transition-all duration-1000 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-[1.8rem] border border-white/90 bg-white/92 p-3 shadow-2xl shadow-blue-950/10 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:scale-105">
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
              Jadwal Pendaftaran
            </h1>

            <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-[#607086] sm:text-base">
              Informasi tahapan Gelombang 1 untuk calon siswa{" "}
              {jenjang}. Setiap tahap memiliki jadwal yang jelas agar
              proses pendaftaran lebih mudah dipersiapkan.
            </p>

            <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/72 px-3.5 py-1.5 text-[8px] font-black uppercase tracking-[0.18em] text-[#5e7895] shadow-sm backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2675bd]" />
              Gelombang 1 • Early Admission
            </div>
          </section>

          {/* LEVEL SWITCHER */}
          <section
            className={`mx-auto mt-10 max-w-3xl transition-all delay-100 duration-1000 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="rounded-[1.7rem] border border-white/90 bg-white/88 p-2 shadow-xl shadow-blue-950/5 backdrop-blur-xl">
              <div className="grid grid-cols-2 gap-2">
                {(["SMP/MTs", "SMA/MA"] as Jenjang[]).map((item) => {
                  const active = jenjang === item

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setJenjang(item)}
                      className={`group cursor-pointer rounded-[1.25rem] px-5 py-4 text-left transition-all duration-400 ${
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

          {/* HIGHLIGHT */}
          <section
            className={`mx-auto mt-7 max-w-5xl transition-all delay-150 duration-1000 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#071a36] via-[#123e70] to-[#2675bd] p-7 text-white shadow-2xl shadow-blue-950/20 sm:p-9">
              <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />
              <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-200">
                    Gelombang 1
                  </p>
                  <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                    Pendaftaran Dibuka
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-blue-100">
                    {admission.registrationStart} - {admission.registrationEnd}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-md">
                  <p className="text-[8px] font-black uppercase tracking-[0.18em] text-blue-200">
                    Tahapan
                  </p>
                  <p className="mt-1 text-sm font-black">
                    Pendaftaran → Seleksi → Pengumuman
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* COUNTDOWN */}
          <section
            className={`mx-auto mt-7 max-w-5xl transition-all delay-175 duration-1000 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="rounded-[2rem] border border-blue-100/90 bg-white/88 p-5 shadow-xl shadow-blue-950/5 backdrop-blur-xl sm:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#245ea8]">
                    Batas Pendaftaran Gelombang 1
                  </p>
                  <h2 className="mt-2 text-xl font-black text-[#071a36] sm:text-2xl">
                    20 Desember 2026
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-[#697787]">
                    Lengkapi pendaftaran sebelum batas waktu berakhir.
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  <CountdownCell label="Hari" value={countdown?.days ?? 0} />
                  <CountdownCell label="Jam" value={countdown?.hours ?? 0} />
                  <CountdownCell label="Menit" value={countdown?.minutes ?? 0} />
                  <CountdownCell label="Detik" value={countdown?.seconds ?? 0} />
                </div>
              </div>
            </div>
          </section>

          {/* TIMELINE */}
          <section
            className={`mx-auto mt-10 max-w-5xl transition-all delay-200 duration-1000 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="mb-7 text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#245ea8]">
                Rangkaian Gelombang 1
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-[#071a36] sm:text-3xl">
                Tiga Tahap Utama
              </h2>
            </div>

            <div className="relative">
              <div className="absolute left-[27px] top-9 bottom-9 hidden w-px bg-gradient-to-b from-blue-300 via-blue-200 to-transparent sm:block" />

              <div className="space-y-5">
                {steps.map((step, index) => (
                  <TimelineStep key={step.number} step={step} index={index} />
                ))}
              </div>
            </div>
          </section>

          {/* PREPARATION */}
          <section
            className={`mx-auto mt-10 max-w-5xl transition-all delay-300 duration-1000 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="rounded-[2rem] border border-white/90 bg-white/88 p-7 shadow-xl shadow-blue-950/5 backdrop-blur-xl sm:p-9">
              <div className="text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#245ea8]">
                  Persiapan
                </p>
                <h2 className="mt-2 text-2xl font-black text-[#071a36]">
                  Siapkan Diri Sebelum Mendaftar
                </h2>
                <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#697787]">
                  Pastikan data calon siswa dan dokumen persyaratan telah siap
                  sebelum mengisi formulir.
                </p>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-3">
                <PreparationItem
                  number="01"
                  title="Data"
                  text="Siapkan data calon siswa dan orang tua/wali."
                />
                <PreparationItem
                  number="02"
                  title="Dokumen"
                  text="Pastikan dokumen pendukung tersedia dan mudah dibaca."
                />
                <PreparationItem
                  number="03"
                  title="Pendaftaran"
                  text="Lengkapi formulir secara teliti sebelum dikirim."
                />
              </div>
            </div>
          </section>

          {/* PREPARATION */}
          <section
            className={`mx-auto mt-10 max-w-5xl transition-all delay-350 duration-1000 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"
            }`}
          >
            <div className="rounded-[2rem] border border-white/90 bg-white/88 p-7 shadow-xl shadow-blue-950/5 backdrop-blur-xl sm:p-9">
              <div className="text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#245ea8]">
                  Sebelum Pendaftaran
                </p>
                <h2 className="mt-2 text-2xl font-black text-[#071a36]">
                  Siapkan Tiga Hal Ini
                </h2>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-3">
                <PreparationCard
                  number="01"
                  title="Data Calon Siswa"
                  text="Siapkan identitas calon siswa dan data orang tua atau wali."
                />
                <PreparationCard
                  number="02"
                  title="Dokumen"
                  text="Pastikan dokumen persyaratan tersedia, jelas, dan mudah dibaca."
                />
                <PreparationCard
                  number="03"
                  title="Formulir"
                  text="Isi formulir dengan teliti sebelum mengirimkan pendaftaran."
                />
              </div>
            </div>
          </section>

          {/* CTA */}
          <section
            className={`mx-auto mt-8 max-w-5xl text-center transition-all delay-400 duration-1000 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"
            }`}
          >
            <Link
              href="/ppdb/daftar"
              className="group inline-flex cursor-pointer items-center justify-center gap-3 rounded-2xl bg-[#071a36] px-7 py-4 text-sm font-black text-white shadow-xl shadow-blue-950/15 transition-all duration-300 hover:-translate-y-1 hover:bg-[#174f91] hover:shadow-2xl active:scale-95"
            >
              Mulai Pendaftaran
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                <ArrowIcon />
              </span>
            </Link>

            <p className="mx-auto mt-4 max-w-2xl text-[10px] leading-5 text-[#7a8795]">
              Jadwal di atas merupakan rancangan operasional Gelombang 1 dan perlu
              disahkan oleh panitia sebelum dipublikasikan sebagai jadwal resmi.
            </p>
          </section>
        </section>

        <footer className="border-t border-blue-900/15 bg-[#071a36] text-white">
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
        @keyframes ppdbFadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        a,
        button {
          -webkit-tap-highlight-color: transparent;
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

function CountdownCell({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="min-w-[58px] rounded-xl border border-blue-100 bg-[#f7fbff] px-2.5 py-2.5 text-center shadow-sm sm:min-w-[68px]">
      <div className="text-lg font-black tabular-nums text-[#174f91] sm:text-xl">
        {String(value).padStart(2, "0")}
      </div>
      <div className="mt-0.5 text-[7px] font-black uppercase tracking-[0.14em] text-[#8593a3]">
        {label}
      </div>
    </div>
  )
}

function PreparationCard({
  number,
  title,
  text,
}: {
  number: string
  title: string
  text: string
}) {
  return (
    <div className="group rounded-[1.5rem] border border-[#e1e9f1] bg-[#f8fbfe]/80 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-blue-100 hover:bg-white hover:shadow-lg">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[9px] font-black text-[#245ea8] ring-1 ring-blue-100 shadow-sm transition-transform duration-300 group-hover:scale-110">
        {number}
      </div>
      <h3 className="mt-4 text-sm font-black text-[#071a36]">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-[#697787]">{text}</p>
    </div>
  )
}

function TimelineStep({
  step,
  index,
}: {
  step: {
    number: string
    title: string
    period: string
    description: string
    icon: React.ReactNode
    }
  index: number
}) {
  return (
    <article
      className="group relative sm:pl-14"
      style={{
        animation: "ppdbFadeUp 700ms ease-out both",
        animationDelay: `${index * 90}ms`,
      }}
    >
      <div className="absolute left-[27px] top-7 z-10 hidden h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border-4 border-[#edf4fb] bg-[#2675bd] shadow-md sm:flex">
        {index === 0 && (
          <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-white/75" />
        )}
        <span className="relative h-1.5 w-1.5 rounded-full bg-white" />
      </div>

      <div className="relative overflow-hidden rounded-[1.85rem] border border-white/90 bg-white/92 p-6 shadow-xl shadow-blue-950/6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl sm:p-7">
        <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-[#0d3b72] via-[#2675bd] to-[#55a9d8] transition-transform duration-500 group-hover:scale-x-100" />

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#edf4fb] text-[#245ea8] ring-1 ring-blue-100 shadow-sm transition-all duration-500 group-hover:scale-105 group-hover:rotate-1">
              {step.icon}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[8px] font-black tracking-[0.18em] text-slate-400">
                  {step.number}
                </span>
                <span className="rounded-full bg-[#f4f8fc] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.15em] text-[#607b95]">
                  {step.title}
                </span>
              </div>

              <h3 className="mt-2 text-xl font-black tracking-tight text-[#071a36]">
                {step.title}
              </h3>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#647489]">
                {step.description}
              </p>
            </div>
          </div>

          <div className="shrink-0 rounded-2xl border border-blue-100 bg-[#f7fbff] px-4 py-3 lg:min-w-[250px]">
            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#7b8ca0]">
              Waktu Pelaksanaan
            </p>
            <p className="mt-1 text-sm font-black leading-6 text-[#174f91]">
              {step.period}
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}

function PreparationItem({
  number,
  title,
  text,
}: {
  number: string
  title: string
  text: string
}) {
  return (
    <div className="group rounded-[1.45rem] border border-slate-100 bg-[#f7fbff]/75 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-blue-100 hover:bg-white hover:shadow-lg">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[9px] font-black text-[#245ea8] ring-1 ring-blue-100 shadow-sm transition-transform duration-300 group-hover:scale-110">
        {number}
      </div>
      <h3 className="mt-4 text-sm font-black text-[#071a36]">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-[#697787]">{text}</p>
    </div>
  )
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
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

function SchoolIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 9 8-4 8 4-8 4-8-4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 10.5V18h10v-7.5M4 19.5h16" />
    </svg>
  )
}

function RegistrationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path strokeLinecap="round" d="M9 4.5V3h6v1.5M8.5 9h7M8.5 13h7M8.5 17h4" />
    </svg>
  )
}

function AssessmentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path strokeLinecap="round" d="M8 9h8M8 13h3M8 17h5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.5 14.5 1.5 1.5 3-3" />
    </svg>
  )
}

function AnnouncementIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 10 10-4v12L5 14v-4Z" />
      <path strokeLinecap="round" d="M15 9.5 19 8v8l-4-1.5M7 14l1.5 4" />
    </svg>
  )
}
