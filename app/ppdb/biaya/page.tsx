"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"

type Jenjang = "SMP/MTs" | "SMA/MA"

const feesByJenjang = {
  "SMP/MTs": {
    uangPangkal: 7_500_000,
    sppOptions: [650_000, 750_000, 850_000],
    outingClass: 650_000,
    extracurricular: 280_000,
    registration: 350_000,
  },
  "SMA/MA": {
    uangPangkal: 7_500_000,
    sppOptions: [650_000, 750_000, 850_000],
    outingClass: 650_000,
    extracurricular: 280_000,
    registration: 350_000,
  },
}

const uangPangkalIncludes = [
  "Seragam dan atribut santri",
  "Buku dan modul pembelajaran",
  "Ranjang atau bunk bed santri",
  "Loker pribadi santri",
  "Perlengkapan awal santri",
  "Fasilitas asrama AC",
  "Fasilitas kelas AC",
  "Program orientasi dan awal pendidikan",
]

const sppIncludes = [
  "Pembelajaran akademik",
  "Pendidikan keislaman",
  "Tahfizh Al-Qur'an",
  "Bahasa Arab dan Bahasa Inggris",
  "Pembelajaran ITIE",
  "Pendampingan dan pembinaan santri",
  "Layanan asrama",
  "Operasional pendidikan rutin",
]

const extracurricularChoices = [
  "Islamic Content Creator",
  "UI/UX Design",
  "Graphic Design",
  "AI & Digital Productivity",
  "English Club",
  "Futsal",
]

const outingDetails = [
  {
    quarter: "S1",
    title: "Outing Class Semester 1",
    text: "Kegiatan pembelajaran berbasis pengalaman pada semester pertama.",
  },
  {
    quarter: "S2",
    title: "Outing Class Semester 2",
    text: "Kegiatan pembelajaran berbasis pengalaman pada semester kedua.",
  },
]

export default function PPDBFeesPage() {
  const [mounted, setMounted] = useState(false)
  const [jenjang, setJenjang] = useState<Jenjang>("SMP/MTs")
  const [selectedSpp, setSelectedSpp] = useState(650_000)
  const [openSection, setOpenSection] = useState<
    "initial" | "monthly" | "outing" | "extracurricular" | null
  >(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 60)
    return () => window.clearTimeout(timer)
  }, [])

  const fees = feesByJenjang[jenjang]

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
        <div className="absolute inset-0 bg-white/64" />
        <div className="absolute inset-0 bg-[#071a36]/8" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(248,251,255,0.08)_0%,rgba(235,244,252,0.38)_42%,rgba(237,245,251,0.99)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.80),transparent_38%),radial-gradient(circle_at_8%_40%,rgba(37,99,235,0.09),transparent_28%),radial-gradient(circle_at_92%_43%,rgba(6,182,212,0.07),transparent_30%)]" />
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
                  Biaya PPDB
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
          <section
            className={`mx-auto max-w-4xl text-center transition-all duration-1000 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.9rem] border border-white/90 bg-white/92 p-3 shadow-[0_24px_70px_rgba(7,26,54,0.11)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:scale-105">
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
              Biaya Pendidikan
            </h1>

            <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-[#607086] sm:text-base">
              Rencanakan pendidikan terbaik untuk putra-putri Anda dengan
              struktur biaya yang jelas, terarah, dan disiapkan untuk mendukung
              seluruh proses pendidikan di INIBS.
            </p>

            <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/72 px-3.5 py-1.5 text-[8px] font-black uppercase tracking-[0.18em] text-[#5e7895] shadow-sm backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2675bd]" />
              Pendidikan Terarah • Fasilitas Lengkap • Transparan
            </div>
          </section>

          <section className="mx-auto mt-10 max-w-3xl">
            <div className="rounded-[1.8rem] border border-white/90 bg-white/88 p-2 shadow-[0_18px_55px_rgba(7,26,54,0.07)] backdrop-blur-xl">
              <div className="grid grid-cols-2 gap-2">
                {(["SMP/MTs", "SMA/MA"] as Jenjang[]).map((item) => {
                  const active = jenjang === item

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setJenjang(item)
                        setSelectedSpp(650_000)
                      }}
                      className={`group cursor-pointer rounded-[1.25rem] px-5 py-4 text-left transition-all duration-300 ${
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

          <section className="mx-auto mt-7 max-w-5xl">
            <div className="grid gap-4 lg:grid-cols-2">
              <FeeCard
                variant="featured"
                label="SATU KALI"
                title="Uang Pangkal"
                amount={fees.uangPangkal}
                description="Biaya awal pendidikan dan perlengkapan santri yang dibayarkan satu kali."
                icon={<BuildingIcon />}
                open={openSection === "initial"}
                onClick={() =>
                  setOpenSection(
                    openSection === "initial" ? null : "initial"
                  )
                }
              />

              <SPPCard
                options={fees.sppOptions}
                selected={selectedSpp}
                onSelect={setSelectedSpp}
                open={openSection === "monthly"}
                onToggle={() =>
                  setOpenSection(
                    openSection === "monthly" ? null : "monthly"
                  )
                }
              />
            </div>
          </section>

          {openSection === "initial" && (
            <DetailPanel
              eyebrow="Sudah Termasuk"
              title="Uang Pangkal"
              icon={<CheckCircleIcon />}
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {uangPangkalIncludes.map((item) => (
                  <IncludedItem key={item} text={item} />
                ))}
              </div>
            </DetailPanel>
          )}

          {openSection === "monthly" && (
            <DetailPanel
              eyebrow="Cakupan SPP"
              title={`SPP Rp ${formatRupiah(selectedSpp)} / bulan`}
              icon={<CheckCircleIcon />}
            >
              <div className="rounded-[1.35rem] border border-blue-100 bg-[#f7fbff] p-4">
                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#7b8ca0]">
                  Pilihan SPP Bulanan
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {fees.sppOptions.map((option, index) => {
                    const active = selectedSpp === option

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSelectedSpp(option)}
                        className={`rounded-2xl border px-4 py-4 text-left transition-all duration-300 ${
                          active
                            ? "border-blue-200 bg-[#edf4fb] text-[#174f91] shadow-sm ring-1 ring-blue-100"
                            : "border-[#e0e8f0] bg-white text-[#647489] hover:border-blue-200 hover:bg-[#f8fbfe]"
                        }`}
                      >
                        <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[#7b8ca0]">
                          Pilihan {index + 1}
                        </p>
                        <p className="mt-1 text-base font-black">
                          Rp {formatRupiah(option)}
                        </p>
                        <p className="mt-1 text-[9px] font-semibold text-[#7a8795]">
                          per bulan
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {sppIncludes.map((item) => (
                  <IncludedItem key={item} text={item} />
                ))}
              </div>
            </DetailPanel>
          )}

          <section className="mx-auto mt-8 max-w-5xl">
            <div className="grid gap-4 lg:grid-cols-2">
              <InteractiveProgramCard
                title="Outing Class"
                eyebrow="Experiential Learning"
                amount={fees.outingClass}
                unit="per tahun"
                icon={<MapIcon />}
                summary="2 kegiatan dalam setahun, satu kali setiap semester."
                open={openSection === "outing"}
                onClick={() =>
                  setOpenSection(openSection === "outing" ? null : "outing")
                }
              />

              <InteractiveProgramCard
                title="Pengembangan Minat & Bakat"
                eyebrow="Character & Future Skills"
                amount={fees.extracurricular}
                unit="per bulan"
                icon={<ActivityIcon />}
                summary="1 program wajib + 1 program pilihan."
                open={openSection === "extracurricular"}
                onClick={() =>
                  setOpenSection(
                    openSection === "extracurricular"
                      ? null
                      : "extracurricular"
                  )
                }
              />
            </div>

            {openSection === "outing" && (
              <DetailPanel
                eyebrow="Rincian Program"
                title="Outing Class"
                icon={<MapIcon />}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {outingDetails.map((item) => (
                    <OutingItem key={item.quarter} {...item} />
                  ))}
                </div>
                <div className="mt-5 rounded-2xl border border-blue-100 bg-[#f7fbff] px-4 py-3">
                  <p className="text-xs font-black text-[#174f91]">
                    Rp {formatRupiah(fees.outingClass)} / tahun
                  </p>
                  <p className="mt-1 text-[10px] leading-5 text-[#7a8795]">
                    Mencakup 2 kegiatan Outing Class selama satu tahun, satu kali setiap semester.
                  </p>
                </div>
              </DetailPanel>
            )}

            {openSection === "extracurricular" && (
              <DetailPanel
                eyebrow="Rincian Program"
                title="Pengembangan Minat & Bakat"
                icon={<ActivityIcon />}
              >
                <div className="rounded-[1.35rem] border border-blue-100 bg-[#f7fbff] p-4">
                  <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#7b8ca0]">
                    Program Wajib
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#174f91] ring-1 ring-blue-100 shadow-sm">
                      <ShieldIcon />
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#071a36]">
                        Taekwondo
                      </p>
                      <p className="mt-1 text-[10px] leading-5 text-[#697787]">
                        Pembinaan disiplin, kebugaran, keberanian, kontrol diri,
                        dan karakter.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#7b8ca0]">
                    Pilih 1 Program Pilihan
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {extracurricularChoices.map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 rounded-xl border border-[#e0e8f0] bg-white px-3 py-2.5 text-xs font-semibold text-[#647489] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-sm"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#2675bd]" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-blue-100 bg-[#f7fbff] px-4 py-3">
                  <p className="text-xs font-black text-[#174f91]">
                    Rp {formatRupiah(fees.extracurricular)} / Bulan
                  </p>
                  <p className="mt-1 text-[10px] leading-5 text-[#7a8795]">
                    Setiap santri mengikuti Taekwondo + 1 program pilihan.
                  </p>
                </div>
              </DetailPanel>
            )}
          </section>

          <section className="mx-auto mt-8 max-w-5xl">
            <div className="rounded-[1.9rem] border border-white/90 bg-white/90 p-6 shadow-[0_18px_55px_rgba(7,26,54,0.07)] backdrop-blur-xl sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf4fb] text-[#245ea8] ring-1 ring-blue-100 shadow-sm">
                    <ClipboardIcon />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#245ea8]">
                      Administrasi Awal
                    </p>
                    <h2 className="mt-1 text-xl font-black text-[#071a36]">
                      Pendaftaran PPDB
                    </h2>
                    <p className="mt-1 text-xs text-[#748397]">
                      Dibayarkan satu kali saat melakukan pendaftaran.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-[#f7fbff] px-5 py-4">
                  <p className="text-2xl font-black text-[#174f91]">
                    Rp {formatRupiah(fees.registration)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto mt-7 max-w-5xl">
            <div className="rounded-[1.9rem] border border-blue-100 bg-[#f7fbff]/85 p-6 shadow-sm">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#245ea8] ring-1 ring-blue-100 shadow-sm">
                  <InfoIcon />
                </div>
                <div>
                  <p className="text-sm font-black text-[#071a36]">
                    One Payment, Clear Purpose
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#697787]">
                    Setiap pembayaran memiliki tujuan yang jelas untuk mendukung perjalanan pendidikan santri.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto mt-7 max-w-5xl">
            <div className="rounded-[2.1rem] bg-gradient-to-br from-[#071a36] via-[#174f91] to-[#2675bd] p-7 text-white shadow-2xl shadow-blue-950/20 sm:p-9">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-200">
                    Mulai Perjalanan Pendidikan
                  </p>
                  <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                    Siap Bergabung Bersama INIBS?
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
                    Kenali program pendidikan, siapkan data, dan mulai proses
                    pendaftaran calon santri melalui INIBS Smart Digital.
                  </p>
                </div>

                <Link
                  href="/ppdb/daftar"
                  className="group inline-flex min-w-[210px] cursor-pointer items-center justify-center gap-3 rounded-2xl bg-white px-7 py-4 text-sm font-black text-[#071a36] shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:scale-95"
                >
                  Mulai Pendaftaran
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    <ArrowIcon />
                  </span>
                </Link>
              </div>
            </div>
          </section>

          <p className="mx-auto mt-5 max-w-5xl text-center text-[10px] leading-5 text-[#7a8795]">
            Nominal dan cakupan biaya mengikuti keputusan resmi panitia PPDB
            INIBS.
          </p>
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
        @keyframes feeExpand {
          from {
            opacity: 0;
            transform: translateY(-8px);
            max-height: 0;
          }
          to {
            opacity: 1;
            transform: translateY(0);
            max-height: 1000px;
          }
        }

        .animate-fee-expand {
          animation: feeExpand 420ms ease-out both;
        }


        @keyframes ppdbPremiumFloat {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -7px, 0); }
        }

        @keyframes ppdbSoftGlow {
          0%, 100% { opacity: .18; }
          50% { opacity: .32; }
        }

        .ppdb-float {
          animation: ppdbPremiumFloat 7s ease-in-out infinite;
        }

        .ppdb-soft-glow {
          animation: ppdbSoftGlow 5s ease-in-out infinite;
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

function SPPCard({
  options,
  selected,
  onSelect,
  open,
  onToggle,
}: {
  options: number[]
  selected: number
  onSelect: (value: number) => void
  open: boolean
  onToggle: () => void
}) {
  return (
    <div className="relative overflow-hidden rounded-[2.1rem] border border-white/90 bg-white/92 p-7 text-left shadow-xl shadow-blue-950/5 backdrop-blur-xl sm:p-8">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0d3b72] via-[#2675bd] to-[#55a9d8]" />
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-200/15 blur-3xl" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf4fb] text-[#245ea8] ring-1 ring-blue-100 shadow-sm">
          <AcademicIcon />
        </div>

        <button
          type="button"
          aria-expanded={open}
          onClick={onToggle}
          className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border bg-white shadow-sm transition-all duration-300 ${
            open
              ? "rotate-180 border-blue-200 bg-blue-50 text-[#245ea8]"
              : "border-slate-100 text-slate-400 hover:border-blue-100 hover:text-[#245ea8]"
          }`}
          aria-label={open ? "Tutup rincian SPP" : "Buka rincian SPP"}
        >
          <ChevronIcon />
        </button>
      </div>

      <div className="relative z-10 mt-7">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#245ea8]">
          BULANAN
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-[#071a36] sm:text-3xl">
          SPP
        </h2>
        <p className="mt-3 max-w-lg text-sm leading-6 text-[#697787]">
          Pilihan SPP bulanan dapat disesuaikan dengan paket yang dipilih keluarga santri.
        </p>

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          {options.map((option, index) => {
            const active = selected === option

            return (
              <button
                key={option}
                type="button"
                onClick={() => onSelect(option)}
                className={`cursor-pointer rounded-2xl border px-4 py-4 text-left transition-all duration-300 hover:-translate-y-0.5 ${
                  active
                    ? "border-blue-200 bg-[#edf4fb] text-[#174f91] shadow-sm ring-1 ring-blue-100"
                    : "border-[#e0e8f0] bg-white text-[#647489] hover:border-blue-200 hover:bg-[#f8fbfe] hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[#7b8ca0]">
                    Pilihan {index + 1}
                  </p>
                  {active && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#174f91] text-white">
                      <CheckIcon />
                    </span>
                  )}
                </div>
                <p className="mt-2 text-base font-black">
                  Rp {formatRupiah(option)}
                </p>
                <p className="mt-1 text-[9px] font-semibold text-[#7a8795]">
                  per bulan
                </p>
              </button>
            )
          })}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.17em] text-[#6b839e]">
              SPP Dipilih
            </p>
            <p className="mt-1 text-2xl font-black text-[#174f91]">
              Rp {formatRupiah(selected)} <span className="text-xs font-bold text-[#7b8ca0]">/ bulan</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="cursor-pointer text-[8px] font-black uppercase tracking-[0.17em] text-[#245ea8]"
          >
            {open ? "Tutup rincian" : "Lihat rincian"}
          </button>
        </div>
      </div>
    </div>
  )
}

function FeeCard({
  variant,
  label,
  title,
  amount,
  normalAmount,
  saving,
  suffix = "",
  description,
  icon,
  open,
  onClick,
}: {
  variant?: "featured"
  label: string
  title: string
  amount: number
  normalAmount?: number
  saving?: number
  suffix?: string
  description: string
  icon: React.ReactNode
  open: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={onClick}
      className={`group relative cursor-pointer overflow-hidden rounded-[2.1rem] border bg-white/92 p-7 text-left shadow-xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl sm:p-8 ${
        variant === "featured"
          ? "border-blue-200 shadow-blue-950/10"
          : "border-white/90 shadow-blue-950/5"
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-[#0d3b72] via-[#2675bd] to-[#55a9d8] transition-transform duration-500 group-hover:scale-x-100" />
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-200/15 blur-3xl transition-transform duration-700 group-hover:scale-150" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf4fb] text-[#245ea8] ring-1 ring-blue-100 shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-1">
          {icon}
        </div>

        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl border bg-white shadow-sm transition-all duration-300 ${
            open
              ? "rotate-180 border-blue-200 bg-blue-50 text-[#245ea8]"
              : "border-slate-100 text-slate-400 group-hover:text-[#245ea8]"
          }`}
        >
          <ChevronIcon />
        </span>
      </div>

      <div className="relative z-10 mt-7">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#245ea8]">
          {label}
        </p>

        <h2 className="mt-2 text-2xl font-black tracking-tight text-[#071a36] sm:text-3xl">
          {title}
        </h2>

        {normalAmount && saving ? (
          <div className="mt-5 rounded-[1.45rem] border border-blue-100 bg-[#f7fbff] p-4 transition-all duration-300 group-hover:bg-[#eef6fd]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#91a0ae] line-through">
                Rp {formatRupiah(normalAmount)}
              </span>
              <span className="rounded-full bg-[#e8f2fb] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-[#245ea8]">
                Harga Khusus
              </span>
            </div>

            <div className="mt-2 flex items-end gap-2">
              <span className="text-3xl font-black tracking-tight text-[#174f91] sm:text-4xl">
                Rp {formatRupiah(amount)}
              </span>
            </div>

            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#eaf4ff] px-3 py-1.5 text-[9px] font-black text-[#1b609e] ring-1 ring-blue-100">
              <SparkleIcon />
              Hemat Rp {formatRupiah(saving)}
            </div>
          </div>
        ) : (
          <div className="mt-5 flex items-end gap-2">
            <span className="text-3xl font-black tracking-tight text-[#174f91] sm:text-4xl">
              Rp {formatRupiah(amount)}
            </span>
            {suffix && (
              <span className="mb-1 text-xs font-bold text-[#7b8ca0]">
                {suffix}
              </span>
            )}
          </div>
        )}

        <p className="mt-3 max-w-lg text-sm leading-6 text-[#697787]">
          {description}
        </p>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-[8px] font-black uppercase tracking-[0.17em] text-[#6b839e]">
            {open ? "Tutup rincian" : "Lihat rincian"}
          </span>
          <span className="text-[#245ea8] transition-transform duration-300 group-hover:translate-x-0.5">
            <ArrowIcon />
          </span>
        </div>
      </div>
    </button>
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
    <section className="mx-auto mt-4 max-w-5xl animate-fee-expand rounded-[1.9rem] border border-blue-100 bg-white/92 p-6 shadow-[0_18px_55px_rgba(7,26,54,0.07)] backdrop-blur-xl sm:p-8">
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

function InteractiveProgramCard({
  title,
  eyebrow,
  amount,
  unit,
  icon,
  summary,
  open,
  onClick,
}: {
  title: string
  eyebrow: string
  amount: number
  unit: string
  icon: React.ReactNode
  summary: string
  open: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-[1.9rem] border border-white/90 bg-white/90 p-6 text-left shadow-[0_18px_55px_rgba(7,26,54,0.07)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl sm:p-7"
    >
      <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-[#0d3b72] via-[#2675bd] to-[#55a9d8] transition-transform duration-500 group-hover:scale-x-100" />

      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf4fb] text-[#245ea8] ring-1 ring-blue-100 shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-1">
          {icon}
        </div>
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl border bg-white shadow-sm transition-all duration-300 ${
            open
              ? "rotate-180 border-blue-200 bg-blue-50 text-[#245ea8]"
              : "border-slate-100 text-slate-400 group-hover:text-[#245ea8]"
          }`}
        >
          <ChevronIcon />
        </span>
      </div>

      <p className="mt-5 text-[9px] font-black uppercase tracking-[0.2em] text-[#245ea8]">
        {eyebrow}
      </p>
      <h3 className="mt-1 text-xl font-black text-[#071a36]">{title}</h3>

      <div className="mt-4 flex items-end gap-2">
        <p className="text-2xl font-black text-[#174f91]">
          Rp {formatRupiah(amount)}
        </p>
        <span className="mb-0.5 text-[10px] font-bold text-[#7b8ca0]">
          {unit}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-[#697787]">{summary}</p>

      <p className="mt-4 text-[8px] font-black uppercase tracking-[0.17em] text-[#6b839e]">
        {open ? "Tutup rincian" : "Lihat rincian"}
      </p>
    </button>
  )
}

function OutingItem({
  quarter,
  title,
  text,
}: {
  quarter: string
  title: string
  text: string
}) {
  return (
    <div className="group rounded-[1.25rem] border border-[#e1e9f1] bg-[#f8fbfe]/80 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-100 hover:bg-white hover:shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[8px] font-black text-[#245ea8] ring-1 ring-blue-100 shadow-sm">
          {quarter}
        </span>
        <div>
          <p className="text-sm font-black text-[#071a36]">{title}</p>
          <p className="mt-1 text-[10px] leading-5 text-[#697787]">{text}</p>
        </div>
      </div>
    </div>
  )
}

function IncludedItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#e0e8f0] bg-[#f7fbff]/80 px-3.5 py-3 transition-all duration-300 hover:border-blue-200 hover:bg-white hover:shadow-sm">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[#245ea8] ring-1 ring-blue-100 shadow-sm">
        <CheckIcon />
      </span>
      <span className="text-xs font-medium leading-5 text-[#647489]">
        {text}
      </span>
    </div>
  )
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID").format(value)
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

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
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

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-7 w-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 20V5.5A1.5 1.5 0 0 1 6.5 4h11A1.5 1.5 0 0 1 19 5.5V20" />
      <path strokeLinecap="round" d="M3.5 20h17M8 8h2M14 8h2M8 12h2M14 12h2M8 16h2M14 16h2" />
    </svg>
  )
}

function AcademicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-7 w-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 9 8-4 8 4-8 4-8-4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 10.5V18h10v-7.5" />
      <path strokeLinecap="round" d="M20 9v7" />
    </svg>
  )
}

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 6 5-2 6 2 5-2v14l-5 2-6-2-5 2V6Z" />
      <path strokeLinecap="round" d="M9 4v14M15 6v14" />
    </svg>
  )
}

function ActivityIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 12h4l2-5 3 10 2.2-7 1.8 2h4" />
    </svg>
  )
}

function ClipboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path strokeLinecap="round" d="M9 4.5V3h6v1.5M8.5 9h7M8.5 13h7M8.5 17h4" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.5 19 6v5.5c0 4.5-2.8 7.3-7 9-4.2-1.7-7-4.5-7-9V6l7-2.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
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

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path strokeLinecap="round" d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      <path strokeLinecap="round" d="m5.6 5.6 2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
      <circle cx="12" cy="12" r="3.4" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" d="M12 10.5v5M12 7.5h.01" />
    </svg>
  )
}
