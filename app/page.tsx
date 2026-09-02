"use client"

import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

type CardId = "mengenal" | "ppdb" | "walisantri" | "locked"

export default function PilihLayananPage() {
  const [walisantriActive, setWalisantriActive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(true)
  const [visible, setVisible] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<CardId | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 100)

    void checkWalisantriAccess()

    return () => window.clearTimeout(timer)
  }, [])

  async function checkWalisantriAccess() {
    try {
      setChecking(true)

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        console.error("Gagal memeriksa login:", authError)
        return
      }

      if (!user) {
        window.location.href = "/login"
        return
      }

      /*
       * Portal Walisantri aktif jika akun yang sedang login
       * memiliki pendaftaran PPDB dengan status DITERIMA.
       *
       * Logika ini sengaja tidak bergantung pada
       * user_profiles.walisantri_active.
       */
      const { data, error } = await supabase
        .from("ppdb_applications")
        .select("id,status")
        .eq("user_id", user.id)
        .eq("status", "DITERIMA")
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error("Gagal memeriksa status PPDB:", error)
        setWalisantriActive(false)
        return
      }

      setWalisantriActive(Boolean(data))
    } catch (error) {
      console.error("ERROR CEK AKSES WALISANTRI:", error)
      setWalisantriActive(false)
    } finally {
      setChecking(false)
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#edf4fb] text-[#10233f]">
      {/* BACKGROUND */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/gedung-sekolah.png')" }}
      />

      <div className="absolute inset-0 bg-[#071a36]/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/76 to-[#071a36]/62" />

      {/* LIGHT / GLOW */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-24 h-96 w-96 rounded-full bg-blue-300/16 blur-3xl" />
        <div className="absolute -right-28 top-16 h-[28rem] w-[28rem] rounded-full bg-cyan-300/12 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-white/18 blur-3xl" />

        <div className="absolute left-[8%] top-[24%] h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600/55" />
        <div className="absolute right-[10%] top-[22%] h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-500/50 [animation-delay:500ms]" />
        <div className="absolute right-[18%] top-[42%] h-2 w-2 animate-pulse rounded-full bg-blue-400/45 [animation-delay:1000ms]" />

        <div className="absolute inset-x-0 top-24 mx-auto h-px max-w-6xl bg-gradient-to-r from-transparent via-white/70 to-transparent" />
      </div>

      {/* HEADER */}
      <header
        className={`relative z-20 transition-all duration-1000 ease-out ${
          visible ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-6xl px-5 pt-7 sm:px-8 sm:pt-9">
          <div className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/78 px-4 py-3 shadow-lg shadow-[#071a36]/8 backdrop-blur-xl sm:px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e3e9ef] bg-white shadow-sm">
                <Image
                  src="/logo-imam.png"
                  alt="Logo Imam Nawawi Islamic Boarding School"
                  width={42}
                  height={42}
                  priority
                  className="h-8 w-8 object-contain"
                />
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#245ea8]">
                  INIBS Smart Digital
                </p>
                <p className="text-xs font-black text-[#10233f] sm:text-sm">
                  Layanan Digital Resmi
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#397564]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#697787]">
                Sistem Aktif
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="relative z-10 mx-auto max-w-6xl px-5 pb-10 pt-10 sm:px-8 sm:pb-14 sm:pt-12">
        <div className="pointer-events-none absolute left-1/2 top-72 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-blue-200/20 blur-3xl" />
        {/* HERO */}
        <section
          className={`text-center transition-all delay-100 duration-1000 ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"
          }`}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/85 bg-white/75 px-4 py-2 shadow-md backdrop-blur-xl">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#edf4fb] text-[#245ea8]">
              <SparkIcon />
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#153b70]">
              Pilih Layanan
            </span>
          </div>

          <div className="relative mx-auto mt-6 flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32">
            <div className="absolute inset-0 rounded-[2rem] bg-white/50 blur-2xl" />
            <div className="absolute inset-3 animate-pulse rounded-[1.75rem] border border-white/85 bg-white/40" />

            <div className="relative flex h-24 w-24 items-center justify-center rounded-[1.9rem] border border-white bg-white/95 p-3 shadow-2xl shadow-[#071a36]/10 transition-all duration-500 hover:-translate-y-1 hover:rotate-1 hover:scale-105 sm:h-28 sm:w-28">
              <Image
                src="/logo-imam.png"
                alt="Logo Imam Nawawi Islamic Boarding School"
                width={112}
                height={112}
                priority
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-[#245ea8] sm:text-xs">
            Selamat Datang
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#071a36] sm:text-4xl lg:text-5xl">
            INIBS Smart Digital
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#5c6b7c] sm:text-base">
            Satu pintu untuk mengakses layanan digital Imam Nawawi Islamic
            Boarding School.
          </p>

          <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/55 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.18em] text-[#56708d] backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2675bd]" />
            Ekosistem Pendidikan Terintegrasi
          </div>

          <div className="mx-auto mt-5 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-blue-500 sm:w-16" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600 shadow-lg shadow-blue-300" />
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-blue-500 sm:w-16" />
          </div>
        </section>

        {/* SERVICES */}
        <section
          className={`mt-9 grid gap-6 md:grid-cols-3 transition-all delay-200 duration-1000 ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <ServiceCard
            id="mengenal"
            href="/mengenal-inibs"
            hoveredCard={hoveredCard}
            onHover={setHoveredCard}
            accent="blue"
            badge="LAYANAN 01"
            title="Mengenal INIBS"
            subtitle="Pendidikan • Program • Fasilitas"
            description="Kenali visi, kurikulum ITIE, program unggulan, fasilitas, kehidupan santri, dan arah pendidikan Imam Nawawi Islamic Boarding School."
            buttonText="Kenali INIBS"
            icon={<SchoolIcon />}
          />

          <ServiceCard
            id="ppdb"
            href="/ppdb"
            hoveredCard={hoveredCard}
            onHover={setHoveredCard}
            accent="blue"
            badge="LAYANAN 02"
            title="Penerimaan Peserta Didik Baru"
            subtitle="Tahun Ajaran 2027/2028"
            description="Informasi dan layanan Penerimaan Peserta Didik Baru Imam Nawawi Islamic Boarding School dalam satu alur yang terstruktur."
            buttonText="Masuk PPDB"
            icon={<ClipboardIcon />}
          />

          {walisantriActive ? (
            <ServiceCard
              id="walisantri"
              href="/walisantri"
              hoveredCard={hoveredCard}
              onHover={setHoveredCard}
              accent="emerald"
              badge="LAYANAN 03"
              status="AKTIF"
              title="Portal Walisantri"
              subtitle="Akses telah dibuka"
              description="Pantau aktivitas harian, akademik, tahfizh, agenda, kehadiran, dan informasi perkembangan santri melalui satu portal."
              buttonText="Buka Portal"
              icon={<UsersIcon />}
            />
          ) : (
            <LockedServiceCard
              hoveredCard={hoveredCard}
              checking={checking}
              onHover={setHoveredCard}
            />
          )}
        </section>

        {/* INFORMATION */}
        <section
          className={`mt-7 transition-all delay-400 duration-1000 ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"
          }`}
        >
          <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-xl shadow-[#071a36]/10 backdrop-blur-xl">
            <div className="grid md:grid-cols-3">
              <Benefit
                icon={<ShieldIcon />}
                title="Aman & Terpercaya"
                description="Data layanan diproses melalui sistem digital yang terintegrasi."
                tone="blue"
              />
              <Benefit
                icon={<ClockIcon />}
                title="Informasi Terkini"
                description="Akses informasi sesuai status dan data terbaru yang tersedia."
                tone="emerald"
              />
              <Benefit
                icon={<DeviceIcon />}
                title="Mudah Diakses"
                description="Gunakan layanan dari laptop, tablet, maupun smartphone."
                tone="violet"
              />
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer
          className={`mt-8 pb-2 text-center transition-all delay-500 duration-1000 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="mx-auto mb-4 h-px max-w-xl bg-gradient-to-r from-transparent via-white/80 to-transparent" />

          <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-white/20 bg-blue-950/80 px-5 py-2.5 text-[10px] text-white shadow-xl backdrop-blur-md sm:text-xs">
            <span className="font-black">INIBS Smart Digital</span>
            <span className="text-white/30">•</span>
            <span className="text-white/75">
              Mendidik dengan Ilmu, Membina dengan Akhlak
            </span>
          </div>

          <p className="mt-3 text-[10px] text-white/80">
            © 2026 Imam Nawawi Islamic Boarding School
          </p>
        </footer>
      </div>
    </main>
  )
}

function ServiceCard({
  id,
  href,
  hoveredCard,
  onHover,
  accent,
  badge,
  status,
  title,
  subtitle,
  description,
  buttonText,
  icon,
}: {
  id: "mengenal" | "ppdb" | "walisantri"
  href: string
  hoveredCard: CardId | null
  onHover: (id: CardId | null) => void
  accent: "blue" | "emerald"
  badge: string
  status?: string
  title: string
  subtitle: string
  description: string
  buttonText: string
  icon: ReactNode
}) {
  const isHovered = hoveredCard === id
  const blue = accent === "blue"

  return (
    <Link
      href={href}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      className={`group relative overflow-hidden rounded-[2.25rem] border bg-white/92 p-7 shadow-[0_24px_70px_rgba(7,26,54,0.10)] backdrop-blur-xl transition-all duration-500 ease-out sm:p-9 ${
        blue
          ? "border-white/85 shadow-[#071a36]/10"
          : "border-[#d5e8e1]/90 shadow-emerald-950/10"
      } ${
        isHovered
          ? `-translate-y-2 ${blue ? "ring-2 ring-blue-200/80" : "ring-2 ring-emerald-200/80"}`
          : "hover:-translate-y-1"
      }`}
    >
      <div
        className={`absolute -right-16 -top-16 h-48 w-48 rounded-full transition-transform duration-700 ${
          blue ? "bg-blue-100/70" : "bg-[#dff2ec]/75"
        } ${isHovered ? "scale-150" : ""}`}
      />

      <div
        className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r transition-transform duration-500 group-hover:scale-x-100 ${
          blue
            ? "from-[#0d3b72] via-[#2675bd] to-[#55a9d8]"
            : "from-[#2f6858] via-[#4f8d78] to-[#6bb0a0]"
        }`}
      />

      <div
        className={`absolute bottom-0 ${
          blue ? "left-1/3 bg-cyan-50/60" : "right-1/3 bg-[#edf7f3]/70"
        } h-28 w-28 rounded-full blur-2xl`}
      />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm ring-1 transition-all duration-500 group-hover:scale-110 group-hover:rotate-2 group-hover:shadow-md ${
            blue
              ? "bg-[#edf4fb] text-[#245ea8] ring-[#d6e4f4]"
              : "bg-[#edf7f3] text-[#397564] ring-[#cde4db]"
          }`}
        >
          {icon}
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition-all duration-300 group-hover:translate-x-1 group-hover:text-white ${
            blue
              ? "border-[#dbe3eb] text-[#8995a2] group-hover:border-[#174f91] group-hover:bg-[#174f91]"
              : "border-[#d5e8e1] text-emerald-500 group-hover:border-[#397564] group-hover:bg-[#397564]"
          }`}
        >
          <ArrowIcon />
        </div>
      </div>

      <div className="relative z-10 mt-7">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={`text-[10px] font-black uppercase tracking-[0.2em] ${
              blue ? "text-blue-600" : "text-[#4a806d]"
            }`}
          >
            {badge}
          </p>

          {status && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d5e8e1] bg-[#edf7f3] px-2.5 py-1 text-[9px] font-black text-[#397564]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#397564]" />
              {status}
            </span>
          )}
        </div>

        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h2>

        <p
          className={`mt-2 text-sm font-black ${
            blue ? "text-blue-800" : "text-[#397564]"
          }`}
        >
          {subtitle}
        </p>

        <p className="mt-4 max-w-md text-sm leading-7 text-[#5c6b7c] sm:text-base">
          {description}
        </p>
      </div>

      <div
        className={`relative z-10 mt-7 flex items-center justify-between rounded-2xl px-5 py-4 font-black text-white shadow-lg transition-all duration-300 group-hover:shadow-xl ${
          blue
            ? "bg-gradient-to-r from-[#0d3b72] to-[#2675bd] shadow-[#123f78]/20"
            : "bg-gradient-to-r from-[#2f6858] to-[#4f8d78] shadow-[#2f6858]/18"
        }`}
      >
        <span>{buttonText}</span>
        <span className="transition-transform duration-300 group-hover:translate-x-1">
          <ArrowIcon />
        </span>
      </div>
    </Link>
  )
}

function LockedServiceCard({
  hoveredCard,
  checking,
  onHover,
}: {
  hoveredCard: CardId | null
  checking: boolean
  onHover: (id: CardId | null) => void
}) {
  const isHovered = hoveredCard === "locked"

  return (
    <div
      onMouseEnter={() => onHover("locked")}
      onMouseLeave={() => onHover(null)}
      className={`group relative overflow-hidden rounded-[2rem] border border-[#d8e0e8]/90 bg-white/85 p-6 shadow-2xl shadow-[#071a36]/10 backdrop-blur-xl transition-all duration-500 sm:p-9 ${
        isHovered ? "-translate-y-1 shadow-2xl" : ""
      }`}
    >
      <div
        className={`absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#f2f5f8] transition-transform duration-700 ${
          isHovered ? "scale-150" : ""
        }`}
      />

      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-300 to-slate-200" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f2f5f8] text-[#697787] shadow-sm ring-1 ring-slate-200 transition-all duration-500 group-hover:scale-105">
          <UsersIcon />
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dbe3eb] bg-[#f2f5f8] text-[#8995a2]">
          <LockIcon />
        </div>
      </div>

      <div className="relative z-10 mt-7">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8995a2]">
            LAYANAN 02
          </p>

          <span className="rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[9px] font-black text-amber-700">
            BELUM AKTIF
          </span>
        </div>

        <h2 className="mt-2 text-2xl font-black tracking-tight text-[#697787] sm:text-3xl">
          Portal Walisantri
        </h2>

        <p className="mt-2 text-sm font-black text-[#8995a2]">
          Menunggu hasil PPDB
        </p>

        <p className="mt-4 max-w-md text-sm leading-7 text-[#697787] sm:text-base">
          Dashboard Walisantri akan aktif setelah calon santri dinyatakan
          diterima melalui proses PPDB.
        </p>
      </div>

      <div className="relative z-10 mt-7 flex items-center justify-between rounded-2xl border border-[#dbe3eb] bg-[#f2f5f8]/90 px-5 py-4 font-black text-[#697787] transition-all duration-300 group-hover:bg-[#f2f5f8]">
        <span>{checking ? "Memeriksa akses..." : "Belum Aktif"}</span>
        <LockIcon />
      </div>
    </div>
  )
}

function Benefit({
  icon,
  title,
  description,
  tone,
}: {
  icon: ReactNode
  title: string
  description: string
  tone: "blue" | "emerald" | "violet"
}) {
  const classes = {
    blue: "bg-[#edf4fb] text-[#245ea8] group-hover:bg-[#e3eef9]",
    emerald: "bg-[#edf7f3] text-[#397564] group-hover:bg-[#e5f2ed]",
    violet: "bg-[#f0f3fa] text-[#526b9a] group-hover:bg-[#e7ecf7]",
  }

  return (
    <div className="group flex items-center gap-4 border-b border-[#dbe3eb]/70 px-6 py-5 transition-all duration-300 hover:bg-[#f8fbfe]/80 md:border-b-0 md:border-r md:last:border-r-0 sm:px-8">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:-rotate-2 ${classes[tone]}`}
      >
        {icon}
      </div>

      <div>
        <h3 className="text-sm font-black text-[#10233f] transition-colors duration-300 group-hover:text-[#245ea8]">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-[#697787]">
          {description}
        </p>
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="text-center">
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white bg-white shadow-xl">
          <div className="absolute inset-0 animate-ping rounded-2xl bg-blue-100/60" />
          <div className="relative h-8 w-8 animate-spin rounded-full border-4 border-[#dbe3eb] border-t-blue-700" />
        </div>

        <p className="mt-5 text-sm font-black text-slate-700">
          Memeriksa akses layanan...
        </p>

        <p className="mt-1 text-xs text-[#8995a2]">
          Mohon tunggu sebentar
        </p>
      </div>
    </main>
  )
}

function SchoolIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-7 w-7"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 9 8-4 8 4-8 4-8-4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 10.5V18h10v-7.5M4 19.5h16" />
    </svg>
  )
}

function ClipboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-7 w-7"
    >
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path strokeLinecap="round" d="M9 4.5V3h6v1.5" />
      <path strokeLinecap="round" d="M8.5 9h7M8.5 13h7M8.5 17h4" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-7 w-7"
    >
      <circle cx="9" cy="8" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path strokeLinecap="round" d="M16 5.5a2.8 2.8 0 0 1 0 5.5" />
      <path strokeLinecap="round" d="M17 14.5a4.8 4.8 0 0 1 3.5 4.5" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h13" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m13 6 6 6-6 6" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path strokeLinecap="round" d="M8 10V7a4 4 0 0 1 8 0v3" />
      <path strokeLinecap="round" d="M12 14v2" />
    </svg>
  )
}

function SparkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-3.5 w-3.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z"
      />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3 5 6v5c0 4.4 2.7 8 7 10 4.3-2 7-5.6 7-10V6l-7-3Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-6 w-6"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" d="M12 7v5l3 2" />
    </svg>
  )
}

function DeviceIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-6 w-6"
    >
      <rect x="7" y="3.5" width="10" height="17" rx="2" />
      <path strokeLinecap="round" d="M10 6h4" />
      <path strokeLinecap="round" d="M11 17.5h2" />
    </svg>
  )
}
