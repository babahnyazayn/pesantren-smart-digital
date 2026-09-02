"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

type RequirementGroup = {
  number: string
  title: string
  description: string
  icon: React.ReactNode
  tone: "blue" | "cyan" | "indigo" | "navy"
  items: string[]
}

const requirementGroups: RequirementGroup[] = [
  {
    number: "01",
    title: "Data Calon Siswa",
    description:
      "Data identitas dasar calon siswa yang perlu disiapkan sebelum mengisi formulir PPDB.",
    icon: <StudentIcon />,
    tone: "blue",
    items: [
      "Nama lengkap sesuai dokumen resmi",
      "NIK",
      "Nomor Kartu Keluarga",
      "Tempat dan tanggal lahir",
      "Jenis kelamin",
      "Alamat lengkap",
      "Nomor HP yang aktif",
      "Asal SD/MI",
      "Tahun lulus",
    ],
  },
  {
    number: "02",
    title: "Data Orang Tua / Wali",
    description:
      "Informasi orang tua atau wali yang dibutuhkan untuk keperluan administrasi dan komunikasi PPDB.",
    icon: <ParentIcon />,
    tone: "cyan",
    items: [
      "Nama lengkap ayah dan ibu",
      "NIK orang tua atau wali",
      "Nomor HP orang tua atau wali",
      "Pekerjaan orang tua",
      "Alamat orang tua atau wali",
      "Data wali apabila berbeda dengan orang tua",
    ],
  },
  {
    number: "03",
    title: "Data Pendidikan",
    description:
      "Informasi pendidikan calon siswa untuk melengkapi profil akademik pada proses penerimaan.",
    icon: <EducationIcon />,
    tone: "indigo",
    items: [
      "Nama sekolah asal",
      "NPSN sekolah, apabila diperlukan",
      "Kelas terakhir",
      "Tahun lulus",
      "Data nilai atau rapor sesuai ketentuan PPDB",
      "Prestasi akademik, apabila ada",
      "Prestasi nonakademik, apabila ada",
    ],
  },
  {
    number: "04",
    title: "Dokumen Wajib",
    description:
      "Dokumen administrasi yang perlu dipersiapkan dan diunggah sesuai ketentuan panitia PPDB.",
    icon: <DocumentIcon />,
    tone: "navy",
    items: [
      "Kartu Keluarga",
      "Akta Kelahiran",
      "Ijazah SD/MI atau Surat Keterangan Lulus",
      "Rapor sesuai ketentuan sekolah",
      "Pas foto terbaru",
      "Identitas orang tua atau wali",
    ],
  },
  {
    number: "05",
    title: "Dokumen Tambahan",
    description:
      "Dokumen tambahan dapat disertakan apabila calon siswa memiliki dokumen pendukung yang relevan.",
    icon: <AwardIcon />,
    tone: "cyan",
    items: [
      "Sertifikat prestasi akademik",
      "Sertifikat prestasi nonakademik",
      "Sertifikat tahfizh",
      "Piagam penghargaan",
      "Dokumen pendukung lain sesuai ketentuan panitia",
    ],
  },
  {
    number: "06",
    title: "Ketentuan Pengunggahan",
    description:
      "Pastikan dokumen yang dikirim melalui sistem memiliki kualitas yang baik dan sesuai ketentuan.",
    icon: <UploadIcon />,
    tone: "blue",
    items: [
      "Data harus benar dan sesuai dokumen asli",
      "Dokumen harus jelas dan dapat dibaca",
      "File tidak boleh rusak atau buram",
      "Unggah dokumen pada kolom yang sesuai",
      "Ikuti format dan ukuran file yang ditentukan sistem",
    ],
  },
]

const registrationPrinciples = [
  {
    title: "Data Akurat",
    description:
      "Pastikan seluruh data sesuai dengan dokumen resmi yang dimiliki calon siswa.",
    icon: <CheckCircleIcon />,
  },
  {
    title: "Berkas Jelas",
    description:
      "Gunakan hasil scan atau foto dokumen yang terang, utuh, dan mudah dibaca.",
    icon: <FileCheckIcon />,
  },
  {
    title: "Siapkan Lebih Awal",
    description:
      "Lengkapi data dan dokumen sebelum membuka formulir agar proses lebih lancar.",
    icon: <ClockIcon />,
  },
]

export default function PPDBRequirementsPage() {
  const [mounted, setMounted] = useState(false)
  const [openGroup, setOpenGroup] = useState<string | null>("01")

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 60)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#edf4fb] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.78),transparent_42%),linear-gradient(135deg,#f3f8fd,#e8f1f9)] text-[#1f344d] selection:bg-blue-100 selection:text-[#071a36]">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <Image
          src="/images/ppdb-background.png"
          alt="Imam Nawawi Islamic Boarding School"
          fill
          priority
          className="object-cover object-center grayscale-[4%]"
        />

        <div className="absolute inset-0 bg-white/58" />
        <div className="absolute inset-0 bg-[#071a36]/10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(247,251,255,0.12)_0%,rgba(236,245,252,0.38)_38%,rgba(237,245,251,0.98)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.65),transparent_42%),radial-gradient(circle_at_10%_35%,rgba(37,99,235,0.08),transparent_28%),radial-gradient(circle_at_90%_45%,rgba(6,43,80,0.08),transparent_30%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-blue-500/25" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-blue-100/45 to-transparent" />

        <div className="absolute -left-48 top-20 h-96 w-96 rounded-full bg-blue-300/10 blur-3xl animate-pulse" />
        <div className="absolute -right-44 top-40 h-96 w-96 rounded-full bg-cyan-300/10 blur-3xl animate-pulse [animation-delay:900ms]" />

        <div className="absolute left-[7%] top-[20%] h-px w-20 bg-blue-600/15" />
        <div className="absolute right-[8%] top-[31%] h-px w-24 bg-blue-600/15" />
        <div className="absolute left-[18%] bottom-[23%] h-px w-16 bg-blue-600/10" />

        <div className="absolute left-[11%] top-[25%] h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500/35" />
        <div className="absolute right-[13%] top-[37%] h-2 w-2 animate-pulse rounded-full bg-blue-500/25 [animation-delay:700ms]" />
      </div>

      <div className="pointer-events-none fixed right-6 top-1/2 z-50 hidden md:block">
        <div className="relative h-2.5 w-2.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-blue-500/25" />
          <span className="relative block h-2.5 w-2.5 rounded-full border border-white/80 bg-blue-600/80 shadow-lg shadow-blue-500/20" />
        </div>
      </div>

      <div className="relative z-10">
        <header
          className={`sticky top-0 z-50 border-b border-white/70 bg-white/72 backdrop-blur-2xl transition-all duration-700 ${
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
                  Persyaratan PPDB
                </p>
              </div>
            </Link>

            <Link
              href="/ppdb"
              className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2.5 text-xs font-black text-blue-900 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-xl active:scale-95"
            >
              <ArrowLeftIcon />
              <span className="hidden sm:inline">Kembali ke PPDB</span>
            </Link>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
          <div
            className={`mx-auto max-w-4xl text-center transition-all duration-1000 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.8rem] border border-white/90 bg-white/92 p-3 shadow-2xl shadow-blue-950/10 backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:-rotate-1">
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

            <div className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/65 px-3.5 py-1.5 text-[8px] font-black uppercase tracking-[0.16em] text-[#5e7895] backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2675bd]" />
              Persiapan Pendaftaran SMP
            </div>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-[#061a36] sm:text-5xl">
              Persyaratan Pendaftaran
            </h1>

            <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              Persiapkan data dan dokumen berikut sebelum memulai proses
              pendaftaran calon siswa Imam Nawawi Islamic Boarding School.
            </p>

            <div className="mx-auto mt-6 flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-blue-500/35" />
              <div className="h-2.5 w-2.5 rounded-full border border-[#c6ab79] bg-white shadow-sm">
                <span className="block h-1 w-1 rounded-full bg-[#8c6d3f]" />
              </div>
              <div className="h-px w-12 bg-blue-500/35" />
            </div>
          </div>

          <section
            className={`mx-auto mt-10 max-w-5xl transition-all delay-100 duration-1000 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="relative overflow-hidden rounded-[2.2rem] border border-white/90 bg-white/90 p-7 shadow-2xl shadow-blue-950/8 backdrop-blur-2xl sm:p-9">
              <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-200/25 blur-3xl" />

              <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#edf4fb] to-white text-[#245ea8] ring-1 ring-blue-100 shadow-sm">
                  <InfoIcon />
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#245ea8]">
                    Panduan Singkat
                  </p>

                  <h2 className="mt-2 text-2xl font-black tracking-tight text-[#071a36]">
                    Apa yang perlu dipersiapkan?
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Halaman ini merangkum data umum dan dokumen yang perlu
                    dipersiapkan untuk pendaftaran SMP. Rincian akhir mengikuti
                    ketentuan resmi panitia PPDB INIBS.
                  </p>
                </div>
              </div>

              <div className="relative z-10 mt-6 grid gap-3 sm:grid-cols-3">
                <MiniStat icon={<StudentIcon />} label="Identitas" value="Calon Siswa" />
                <MiniStat icon={<ParentIcon />} label="Administrasi" value="Orang Tua / Wali" />
                <MiniStat icon={<DocumentIcon />} label="Dokumen" value="Berkas PPDB" />
              </div>
            </div>
          </section>

          <section
            className={`mx-auto mt-7 max-w-5xl transition-all delay-200 duration-1000 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="grid gap-4">
              {requirementGroups.map((group, index) => {
                const isOpen = openGroup === group.number
                const tone = getTone(group.tone)

                return (
                  <div
                    key={group.number}
                    className="group overflow-hidden rounded-[1.65rem] border border-white/90 bg-white/90 shadow-lg shadow-blue-950/5 backdrop-blur-xl transition-all duration-500 hover:shadow-2xl"
                    style={{ transitionDelay: `${index * 45}ms` }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenGroup((current) =>
                          current === group.number ? null : group.number
                        )
                      }
                      className="group/row flex w-full cursor-pointer items-center gap-4 p-5 text-left transition-colors duration-300 hover:bg-[#f7fbff] sm:p-6"
                      aria-expanded={isOpen}
                    >
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 shadow-sm transition-all duration-500 group-hover:scale-105 ${tone.iconBg} ${tone.iconText}`}
                      >
                        {group.icon}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[8px] font-black tracking-[0.18em] text-slate-400">
                            {group.number}
                          </span>

                          <span
                            className={`text-[8px] font-black uppercase tracking-[0.16em] ${tone.label}`}
                          >
                            Persiapan PPDB
                          </span>
                        </div>

                        <h2 className="mt-1 text-base font-black text-[#071a36] sm:text-lg">
                          {group.title}
                        </h2>

                        <p className="mt-1 max-w-3xl text-xs leading-5 text-[#647489]">
                          {group.description}
                        </p>
                      </div>

                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e0e8f0] bg-white text-slate-400 shadow-sm transition-all duration-300 ${
                          isOpen
                            ? "rotate-180 border-blue-100 bg-[#edf4fb] text-[#245ea8]"
                            : "group-hover:translate-y-0.5 group-hover:text-[#245ea8]"
                        }`}
                      >
                        <ChevronIcon />
                      </span>
                    </button>

                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-500 ${
                        isOpen
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div className="border-t border-[#e0e8f0] px-5 pb-6 pt-5 sm:px-6">
                          <div className="grid gap-2 sm:grid-cols-2">
                            {group.items.map((item) => (
                              <div
                                key={item}
                                className="flex items-start gap-3 rounded-xl border border-[#e0e8f0] bg-[#f6f9fc]/82 px-3.5 py-3 transition-all duration-300 hover:border-blue-200 hover:bg-white hover:shadow-sm"
                              >
                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[#245ea8] ring-1 ring-blue-100 shadow-sm transition-all duration-300 group-hover/row:scale-105">
                                  <CheckIcon />
                                </span>
                                <span className="text-xs font-medium leading-5 text-slate-600">
                                  {item}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section
            className={`mx-auto mt-10 max-w-5xl transition-all delay-300 duration-1000 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="rounded-[2rem] border border-white/90 bg-white/90 p-7 shadow-xl shadow-blue-950/5 backdrop-blur-xl sm:p-8">
              <div className="text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#245ea8]">
                  Persiapan Pendaftaran
                </p>

                <h2 className="mt-2 text-2xl font-black text-[#071a36]">
                  Tiga Hal yang Perlu Diperhatikan
                </h2>
              </div>

              <div className="mt-7 grid gap-4 lg:grid-cols-3">
                {registrationPrinciples.map((item, index) => (
                  <div
                    key={item.title}
                    className="group rounded-[1.45rem] border border-[#e0e8f0] bg-[#f6f9fc]/82 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-xl"
                    style={{ transitionDelay: `${index * 60}ms` }}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#245ea8] ring-1 ring-blue-100 shadow-sm transition-transform duration-300 group-hover:scale-110">
                      {item.icon}
                    </div>

                    <h3 className="mt-4 text-sm font-black text-[#071a36]">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-[#647489]">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section
            className={`mx-auto mt-10 max-w-5xl transition-all delay-400 duration-1000 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="relative overflow-hidden rounded-[2.3rem] bg-gradient-to-br from-[#102b46] via-[#123e70] to-[#2675bd] p-7 text-white shadow-2xl shadow-blue-950/20 sm:p-10">
              <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />
              <div className="absolute -left-20 bottom-[-8rem] h-64 w-64 rounded-full bg-blue-300/10 blur-3xl" />

              <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d9c59e]">
                    Langkah Berikutnya
                  </p>

                  <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                    Data Sudah Siap?
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-[#eadfca]">
                    Lanjutkan ke formulir PPDB dan lengkapi data calon siswa
                    secara bertahap.
                  </p>
                </div>

                <Link
                  href="/ppdb/daftar"
                  className="group inline-flex min-w-[210px] cursor-pointer items-center justify-center gap-3 rounded-2xl bg-white px-7 py-4 text-sm font-black text-[#061a36] shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:scale-95"
                >
                  Mulai Pendaftaran
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    <ArrowIcon />
                  </span>
                </Link>
              </div>
            </div>
          </section>

          <p
            className={`mx-auto mt-7 max-w-5xl text-center text-[10px] leading-5 text-slate-400 transition-opacity delay-500 duration-1000 ${
              mounted ? "opacity-100" : "opacity-0"
            }`}
          >
            Catatan: daftar dokumen dan ketentuan spesifik dapat disesuaikan
            dengan keputusan resmi panitia PPDB INIBS.
          </p>
        </section>

        <footer className="border-t border-blue-900/20 bg-[#071a36] text-white">
          <div className="mx-auto max-w-6xl px-4 py-8 text-center sm:px-6">
            <p className="text-sm font-black tracking-[0.08em]">INIBS Smart Digital</p>
            <p className="mt-1 text-xs text-blue-200">
              Imam Nawawi Islamic Boarding School
            </p>
            <p className="mt-3 text-[10px] text-blue-200">
              © 2026 Imam Nawawi Islamic Boarding School
            </p>
          </div>
        </footer>
      </div>
    </main>
  )
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-[1.2rem] border border-[#e0e8f0] bg-[#f6f9fc]/82 p-4 transition-all duration-300 hover:bg-white hover:shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#245ea8] ring-1 ring-blue-100 shadow-sm">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="mt-0.5 truncate text-xs font-black text-[#071a36]">
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

function getTone(tone: RequirementGroup["tone"]) {
  const tones = {
    blue: {
      iconBg: "bg-[#edf4fb] ring-blue-100",
      iconText: "text-[#245ea8]",
      label: "text-[#245ea8]",
    },
    cyan: {
      iconBg: "bg-cyan-50 ring-cyan-100",
      iconText: "text-cyan-700",
      label: "text-cyan-700",
    },
    indigo: {
      iconBg: "bg-indigo-50 ring-indigo-100",
      iconText: "text-indigo-700",
      label: "text-indigo-700",
    },
    navy: {
      iconBg: "bg-slate-100 ring-slate-200",
      iconText: "text-[#061a36]",
      label: "text-[#061a36]",
    },
  }

  return tones[tone]
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

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-3 w-3">
      <path strokeLinecap="round" strokeLinejoin="round" d="m7 12 3 3 7-7" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" d="M12 10.5v5" />
      <path strokeLinecap="round" d="M12 7.5h.01" />
    </svg>
  )
}

function StudentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="12" cy="8" r="3.2" />
      <path strokeLinecap="round" d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  )
}

function ParentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="9" cy="8" r="2.8" />
      <circle cx="16" cy="9" r="2.3" />
      <path strokeLinecap="round" d="M4 19a5 5 0 0 1 10 0M13 19a4 4 0 0 1 7 0" />
    </svg>
  )
}

function EducationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 4 8 4-8 4-8-4 8-4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 10v5c2.5 2 9.5 2 12 0v-5" />
      <path strokeLinecap="round" d="M20 8v7" />
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

function AwardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="12" cy="8.5" r="4.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9.5 12.5-1 7 3.5-2 3.5 2-1-7" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15V4m0 0-4 4m4-4 4 4" />
      <path strokeLinecap="round" d="M5 14v4.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V14" />
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.5 12 2.3 2.3 4.7-5" />
    </svg>
  )
}

function FileCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 3.5h8l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V3.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 14 2 2 4-4" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" d="M12 7v5l3 2" />
    </svg>
  )
}
