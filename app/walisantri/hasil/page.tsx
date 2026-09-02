"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"

type Application = {
  id: string
  user_id: string
  nama_lengkap: string | null
  nomor_pendaftaran: string | null
  asal_sekolah: string | null
  jenis_kelamin: string | null
  status: string | null
  created_at: string
  updated_at: string
}

type Selection = {
  id: string
  ppdb_id: string
  nilai_akhir: number | null
  keputusan: string | null
  created_at: string
  updated_at: string
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

export default function WalisantriHasilPage() {
  const [application, setApplication] = useState<Application | null>(null)
  const [selection, setSelection] = useState<Selection | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState("")

  const loadData = useCallback(async (silent = false) => {
    try {
      silent ? setRefreshing(true) : setLoading(true)
      setError("")

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        throw new Error(`Gagal memeriksa akun: ${authError.message}`)
      }

      if (!user) {
        window.location.href = "/login"
        return
      }

      const { data: applicationData, error: applicationError } =
        await supabase
          .from("ppdb_applications")
          .select(
            "id,user_id,nama_lengkap,nomor_pendaftaran,asal_sekolah,jenis_kelamin,status,created_at,updated_at"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()

      if (applicationError) {
        throw new Error(
          `Gagal mengambil data pendaftaran: ${applicationError.message}`
        )
      }

      if (!applicationData) {
        setApplication(null)
        setSelection(null)
        return
      }

      setApplication(applicationData)

      const { data: selectionData, error: selectionError } = await supabase
        .from("ppdb_selections")
        .select(
          "id,ppdb_id,nilai_akhir,keputusan,created_at,updated_at"
        )
        .eq("ppdb_id", applicationData.id)
        .maybeSingle()

      if (selectionError) {
        throw new Error(
          `Gagal mengambil hasil seleksi: ${selectionError.message}`
        )
      }

      setSelection(selectionData)
    } catch (err) {
      console.error("ERROR HASIL PPDB WALISANTRI:", err)
      setError(
        err instanceof Error
          ? err.message
          : "Hasil PPDB gagal dimuat."
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 80)
    void loadData()

    return () => window.clearTimeout(timer)
  }, [loadData])

  const decision = normalize(selection?.keputusan)
  const isAccepted = decision === "DITERIMA"
  const isRejected = decision === "DITOLAK"
  const isDecided = isAccepted || isRejected

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eef4fb] text-slate-900">
      {/* PREMIUM BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(37,99,235,0.12),transparent_30%),radial-gradient(circle_at_88%_16%,rgba(14,165,233,0.10),transparent_28%),linear-gradient(135deg,#f8fbff_0%,#eef4fb_55%,#e7f0fb_100%)]" />
        <div className="absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-blue-300/20 blur-3xl" />
        <div className="absolute -right-40 top-20 h-[30rem] w-[30rem] rounded-full bg-cyan-200/20 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-[26rem] bg-gradient-to-t from-[#061a36] via-[#061a36]/70 to-transparent" />
      </div>

      {/* HEADER */}
      <header
        className={`relative z-20 px-4 pt-4 sm:px-7 sm:pt-6 transition-all duration-1000 ease-out ${
          visible ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between rounded-[1.5rem] border border-white/90 bg-white/80 px-4 py-3 shadow-xl shadow-blue-950/5 backdrop-blur-2xl sm:px-5">
            <div className="flex items-center gap-3">
              <Link
                href="/walisantri"
                className="group flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:-translate-x-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:scale-95"
                aria-label="Kembali ke dashboard"
              >
                <BackIcon />
              </Link>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-white shadow-sm">
                  <Image
                    src="/logo-imam.png"
                    alt="Logo Imam Nawawi Islamic Boarding School"
                    width={40}
                    height={40}
                    priority
                    className="h-8 w-8 object-contain"
                  />
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-blue-700">
                    INIBS SMART DIGITAL
                  </p>
                  <p className="mt-0.5 text-sm font-black text-[#071a36]">
                    Hasil PPDB
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={refreshing}
              onClick={() => void loadData(true)}
              className="group flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-black text-slate-500 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-wait disabled:opacity-60"
            >
              <RefreshIcon spinning={refreshing} />
              <span className="hidden sm:inline">
                {refreshing ? "Memuat..." : "Refresh"}
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-10 pt-7 sm:px-7 sm:pb-14 sm:pt-9">
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 shadow-sm">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-100 text-sm font-black text-red-700">
              !
            </div>
            <div>
              <p className="text-sm font-black text-red-800">
                Hasil belum dapat dimuat
              </p>
              <p className="mt-1 text-xs leading-5 text-red-700">{error}</p>
            </div>
          </div>
        )}

        {!application ? (
          <EmptyState />
        ) : (
          <>
            {/* HERO */}
            <section
              className={`relative overflow-hidden rounded-[2.3rem] bg-gradient-to-br from-[#061a36] via-[#0b2e61] to-blue-700 p-6 text-white shadow-2xl shadow-blue-950/20 transition-all duration-1000 ease-out sm:p-9 ${
                visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/15 blur-3xl" />
              <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-blue-200/10 blur-3xl" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-50">
                    Pengumuman Resmi PPDB
                  </span>
                </div>

                <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                  Hasil Seleksi PPDB
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
                  Informasi hasil seleksi calon santri berdasarkan data yang
                  telah ditetapkan oleh panitia PPDB INIBS.
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <InfoChip
                    label="Nama Calon Santri"
                    value={application.nama_lengkap || "-"}
                  />
                  <InfoChip
                    label="Nomor Pendaftaran"
                    value={application.nomor_pendaftaran || "-"}
                  />
                </div>
              </div>
            </section>

            {/* RESULT */}
            <section
              className={`mt-6 transition-all delay-100 duration-1000 ${
                visible ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"
              }`}
            >
              <div
                className={`relative overflow-hidden rounded-[2.2rem] border bg-white p-6 shadow-2xl shadow-blue-950/10 sm:p-9 ${
                  isAccepted
                    ? "border-emerald-100"
                    : isRejected
                      ? "border-red-100"
                      : "border-blue-100"
                }`}
              >
                <div
                  className={`absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl ${
                    isAccepted
                      ? "bg-emerald-100/60"
                      : isRejected
                        ? "bg-red-100/50"
                        : "bg-blue-100/60"
                  }`}
                />

                <div className="relative z-10 text-center">
                  <div
                    className={`mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] shadow-sm ring-1 transition-all duration-500 hover:scale-105 ${
                      isAccepted
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                        : isRejected
                          ? "bg-red-50 text-red-700 ring-red-100"
                          : "bg-blue-50 text-blue-700 ring-blue-100"
                    }`}
                  >
                    {isAccepted ? (
                      <CheckCircleIcon />
                    ) : isRejected ? (
                      <XCircleIcon />
                    ) : (
                      <ClockIcon />
                    )}
                  </div>

                  <p className="mt-6 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                    Keputusan Panitia
                  </p>

                  <h2
                    className={`mt-2 text-4xl font-black tracking-tight sm:text-5xl ${
                      isAccepted
                        ? "text-emerald-700"
                        : isRejected
                          ? "text-red-700"
                          : "text-blue-700"
                    }`}
                  >
                    {isDecided ? decision : selection ? "BELUM DIPUTUSKAN" : "SEDANG DIPROSES"}
                  </h2>

                  <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-500">
                    {isAccepted
                      ? "Selamat. Calon santri dinyatakan diterima dalam proses Penerimaan Peserta Didik Baru INIBS."
                      : isRejected
                        ? "Terima kasih telah mengikuti seluruh tahapan Penerimaan Peserta Didik Baru INIBS."
                        : "Hasil seleksi belum ditetapkan oleh panitia."}
                  </p>

                  <div className="mx-auto mt-7 max-w-xs rounded-[1.7rem] border border-slate-100 bg-slate-50/80 p-5 shadow-inner">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Nilai Akhir
                    </p>

                    <p className="mt-2 text-5xl font-black tracking-tight text-[#071a36]">
                      {selection?.nilai_akhir !== null &&
                      selection?.nilai_akhir !== undefined
                        ? Number(selection.nilai_akhir).toFixed(2)
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* APPLICATION SUMMARY */}
            <section
              className={`mt-6 grid gap-6 md:grid-cols-2 transition-all delay-200 duration-1000 ${
                visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              <div className="rounded-[2rem] border border-white/90 bg-white/90 p-6 shadow-xl shadow-blue-950/5 backdrop-blur-xl sm:p-7">
                <SectionTitle
                  eyebrow="Identitas"
                  title="Data Pendaftaran"
                  icon={<UserIcon />}
                />

                <div className="mt-6 space-y-3">
                  <SummaryRow
                    label="Nama Lengkap"
                    value={application.nama_lengkap}
                  />
                  <SummaryRow
                    label="Nomor Pendaftaran"
                    value={application.nomor_pendaftaran}
                    highlight
                  />
                  <SummaryRow
                    label="Asal Sekolah"
                    value={application.asal_sekolah}
                  />
                  <SummaryRow
                    label="Jenis Kelamin"
                    value={application.jenis_kelamin}
                  />
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/90 bg-white/90 p-6 shadow-xl shadow-blue-950/5 backdrop-blur-xl sm:p-7">
                <SectionTitle
                  eyebrow="Status"
                  title="Informasi Keputusan"
                  icon={<AwardIcon />}
                />

                <div className="mt-6 space-y-3">
                  <SummaryRow
                    label="Status Pendaftaran"
                    value={application.status}
                    badge
                  />

                  <SummaryRow
                    label="Keputusan Seleksi"
                    value={selection?.keputusan}
                    badge
                  />

                  <SummaryRow
                    label="Nilai Akhir"
                    value={
                      selection?.nilai_akhir !== null &&
                      selection?.nilai_akhir !== undefined
                        ? Number(selection.nilai_akhir).toFixed(2)
                        : "-"
                    }
                    highlight
                  />

                  <SummaryRow
                    label="Diperbarui"
                    value={
                      selection?.updated_at
                        ? formatDateTime(selection.updated_at)
                        : application.updated_at
                          ? formatDateTime(application.updated_at)
                          : "-"
                    }
                  />
                </div>
              </div>
            </section>

            {/* TIMELINE */}
            <section
              className={`mt-6 transition-all delay-300 duration-1000 ${
                visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              <div className="rounded-[2rem] border border-white/90 bg-white/90 p-6 shadow-xl shadow-blue-950/5 backdrop-blur-xl sm:p-7">
                <SectionTitle
                  eyebrow="Perjalanan"
                  title="Tahapan PPDB"
                  icon={<TimelineIcon />}
                />

                <div className="mt-7 grid gap-3 sm:grid-cols-4">
                  <TimelineStep title="Pendaftaran" active />
                  <TimelineStep
                    title="Verifikasi"
                    active={isVerificationCompleted(application.status)}
                  />
                  <TimelineStep title="Seleksi" active={Boolean(selection)} />
                  <TimelineStep
                    title="Keputusan"
                    active={isDecided}
                    success={isAccepted}
                    danger={isRejected}
                  />
                </div>
              </div>
            </section>

            <div
              className={`mt-7 text-center transition-all delay-400 duration-1000 ${
                visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
              }`}
            >
              <Link
                href="/walisantri"
                className="group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#071a36] px-5 py-3 text-xs font-black text-white shadow-lg shadow-blue-950/20 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-800 hover:shadow-xl active:scale-95"
              >
                <BackIcon />
                Kembali ke Dashboard
              </Link>
            </div>
          </>
        )}

        <footer className="mt-9 text-center">
          <div className="mx-auto mb-4 h-px max-w-xl bg-gradient-to-r from-transparent via-white/70 to-transparent" />
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/90">
            Imam Nawawi Islamic Boarding School
          </p>
          <p className="mt-2 text-[10px] text-white/60">
            © 2026 INIBS Smart Digital
          </p>
        </footer>
      </div>
    </main>
  )
}

function normalize(value: string | null | undefined) {
  return String(value || "").trim().toUpperCase()
}

function isVerificationCompleted(status: string | null) {
  const value = normalize(status)

  return [
    "VERIFIKASI",
    "TERVERIFIKASI",
    "SELEKSI",
    "DITERIMA",
    "DITOLAK",
  ].includes(value)
}

function formatDateTime(value: string) {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value))
  } catch {
    return value
  }
}

function InfoChip({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-blue-200">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-black text-white">{value}</p>
    </div>
  )
}

function SectionTitle({
  eyebrow,
  title,
  icon,
}: {
  eyebrow: string
  title: string
  icon: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-xl font-black text-[#071a36]">{title}</h2>
      </div>

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
        {icon}
      </div>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  highlight = false,
  badge = false,
}: {
  label: string
  value: string | number | null | undefined
  highlight?: boolean
  badge?: boolean
}) {
  const normalized = normalize(String(value || ""))

  if (badge && value) {
    const accepted = normalized === "DITERIMA"
    const rejected = normalized === "DITOLAK"

    return (
      <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
        <span className="text-xs font-semibold text-slate-400">{label}</span>

        <span
          className={`rounded-full border px-2.5 py-1 text-[9px] font-black ${
            accepted
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : rejected
                ? "border-red-100 bg-red-50 text-red-700"
                : "border-blue-100 bg-blue-50 text-blue-700"
          }`}
        >
          {normalized}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-5 rounded-xl bg-slate-50 px-4 py-3">
      <span className="text-xs font-semibold text-slate-400">{label}</span>
      <span
        className={`max-w-[60%] text-right text-xs font-black ${
          highlight ? "text-blue-700" : "text-slate-700"
        }`}
      >
        {value || "-"}
      </span>
    </div>
  )
}

function TimelineStep({
  title,
  active,
  success = false,
  danger = false,
}: {
  title: string
  active: boolean
  success?: boolean
  danger?: boolean
}) {
  const classes = danger
    ? "bg-red-50 text-red-700 ring-red-100"
    : success
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
      : active
        ? "bg-blue-50 text-blue-700 ring-blue-100"
        : "bg-slate-50 text-slate-300 ring-slate-100"

  return (
    <div className="relative rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`mx-auto flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${classes}`}
      >
        {success ? <CheckIcon /> : danger ? <XIcon /> : active ? <CheckIcon /> : <DotIcon />}
      </div>

      <p className="mt-3 text-xs font-black text-slate-700">{title}</p>
      <p className="mt-1 text-[10px] text-slate-400">
        {danger ? "Tidak diterima" : success ? "Diterima" : active ? "Selesai" : "Menunggu"}
      </p>
    </div>
  )
}

function EmptyState() {
  return (
    <section className="rounded-[2rem] border border-white/90 bg-white/90 p-10 text-center shadow-xl backdrop-blur-xl sm:p-14">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        <DocumentIcon />
      </div>

      <h1 className="mt-5 text-xl font-black text-[#071a36]">
        Data Pendaftaran Tidak Ditemukan
      </h1>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Akun ini belum memiliki data pendaftaran PPDB yang terhubung.
      </p>

      <Link
        href="/ppdb"
        className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-xs font-black text-white shadow-lg shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-800 active:scale-95"
      >
        Buka PPDB
        <ArrowIcon />
      </Link>
    </section>
  )
}

function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="text-center">
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white bg-white shadow-xl">
          <div className="absolute inset-0 animate-ping rounded-2xl bg-blue-100/50" />
          <div className="relative h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />
        </div>

        <p className="mt-5 text-sm font-black text-slate-700">
          Menyiapkan Hasil PPDB...
        </p>

        <p className="mt-1 text-xs text-slate-400">Mohon tunggu sebentar</p>
      </div>
    </main>
  )
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m11 6-6 6 6 6" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h13" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m13 6 6 6-6 6" />
    </svg>
  )
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={`h-4 w-4 ${spinning ? "animate-spin" : ""}`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 11a8 8 0 0 0-14.9-3M4 5v4h4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 13a8 8 0 0 0 14.9 3M20 19v-4h-4" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="12" cy="8" r="3.2" />
      <path strokeLinecap="round" d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  )
}

function AwardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="12" cy="9" r="5" />
      <path strokeLinecap="round" d="m9.5 13.5-1 6 3.5-2 3.5 2-1-6" />
      <path strokeLinecap="round" d="M12 6.5v5M9.5 9h5" />
    </svg>
  )
}

function TimelineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="12" r="2" />
      <circle cx="6" cy="18" r="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h4a4 4 0 0 1 4 4v0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 14a4 4 0 0 1-4 4H8" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 12 4 4 8-8" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path strokeLinecap="round" d="m7 7 10 10M17 7 7 17" />
    </svg>
  )
}

function DotIcon() {
  return (
    <span className="h-2.5 w-2.5 rounded-full bg-current" />
  )
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-10 w-10">
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.5 12 2.2 2.2 4.8-5" />
    </svg>
  )
}

function XCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-10 w-10">
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" d="m9 9 6 6" />
      <path strokeLinecap="round" d="m15 9-6 6" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-10 w-10">
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" d="M12 7v5l3 2" />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path strokeLinecap="round" d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  )
}
