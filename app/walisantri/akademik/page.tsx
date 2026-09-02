 "use client"

import Image from "next/image"
import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"

type Profile = {
  id: string
  nama_lengkap: string | null
  nomor_pendaftaran: string | null
}

type AcademicSession = {
  id: string
  tanggal: string
  jp_number: number
  waktu_mulai: string
  waktu_selesai: string
  subject_id: string | null
  teacher_id: string | null
  class_id: string | null
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

function DashboardIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
}
function ActivityIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path d="M4 12h3l2-6 4 12 2-6h5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function AttendanceIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><rect x="4" y="3" width="16" height="18" rx="2" /><path d="m8 12 2.3 2.3L16 8.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function AcademicIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path d="m3 9 9-5 9 5-9 5-9-5Z" /><path d="M7 11.5V16c2.6 2.3 7.4 2.3 10 0v-4.5M21 9v6" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function QuranIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 1-4-4V4Z" /><path d="M9 20V8a4 4 0 0 1 4-4M9 9h7" strokeLinecap="round" /></svg>
}
function PermissionIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path d="M7 3h10v18l-5-2.7L7 21V3Z" /><path d="m9.2 10 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function CharacterIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><circle cx="12" cy="7" r="3" /><path d="M5 21c.8-4.2 3.1-6 7-6s6.2 1.8 7 6" strokeLinecap="round" /></svg>
}
function DisciplineIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path d="M12 3 5 6v5c0 4.2 2.9 8 7 10 4.1-2 7-5.8 7-10V6l-7-3Z" /><path d="M9.5 12.5 11 14l3.5-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function CalendarIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 9h18" strokeLinecap="round" /></svg>
}
function BillingIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" /></svg>
}
function InfaqIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><circle cx="12" cy="12" r="9" /><path d="M12 7v10M15 9.5c-.6-.8-1.5-1.2-2.8-1.2-1.5 0-2.7.8-2.7 2s1.1 1.8 2.8 2.1c1.7.3 2.7 1 2.7 2.3 0 1.3-1.2 2.3-3 2.3-1.4 0-2.5-.5-3.1-1.4" strokeLinecap="round" /></svg>
}
function AnnouncementIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path d="m4 11 13-5v12L4 13v-2Z" /><path d="M7 14v4M17 8l3-2v12l-3-2" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function UserIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><circle cx="12" cy="8" r="3.2" /><path d="M5.5 20c.8-4.2 3-6.2 6.5-6.2s5.7 2 6.5 6.2" strokeLinecap="round" /></svg>
}
function BookIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M5 4.5h10a4 4 0 0 1 4 4V20H9a4 4 0 0 1-4-4V4.5Z" /><path d="M9 4.5V20" /></svg>
}
function ChartIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M5 19V9M12 19V5M19 19v-8" strokeLinecap="round" /><path d="M3 19h18" strokeLinecap="round" /></svg>
}
function ArrowIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5"><path d="M5 12h13M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function RefreshIcon({ spin }: { spin?: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`h-4 w-4 ${spin ? "animate-spin" : ""}`}><path d="M20 11a8 8 0 0 0-14-4.9L4 8" /><path d="M4 4v4h4M4 13a8 8 0 0 0 14 4.9l2-1.9" /><path d="M20 20v-4h-4" /></svg>
}

function formatTime(value: string | null) {
  if (!value) return "-"
  return value.slice(0, 5)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`))
}

function getInitials(name: string | null) {
  if (!name) return "?"
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function labelValue(value: string | null) {
  return value || "Belum tersedia"
}

function SessionCard({ session }: { session: AcademicSession }) {
  return (
    <Link
      href={`/walisantri/akademik/session/${session.id}?tanggal=${session.tanggal}`}
      className="group block rounded-[1.4rem] border border-slate-100 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-950/5"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
          <span className="text-[7px] font-black uppercase tracking-[0.12em] text-blue-400">Period</span>
          <span className="text-sm font-black leading-none">{session.jp_number}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black text-blue-700">
              {formatTime(session.waktu_mulai)} - {formatTime(session.waktu_selesai)}
            </span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[7px] font-black uppercase tracking-wider text-emerald-700">
              Scheduled
            </span>
          </div>

          <p className="mt-1.5 truncate text-sm font-black text-[#071a36]">
            {session.subject_id || `Academic Learning ${session.jp_number}`}
          </p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-slate-50 px-2 py-1 text-[8px] font-semibold text-slate-500">
              Teacher: <span className="font-black text-slate-700">{session.teacher_id || "-"}</span>
            </span>
            <span className="rounded-full bg-slate-50 px-2 py-1 text-[8px] font-semibold text-slate-500">
              Class: <span className="font-black text-slate-700">{session.class_id || "-"}</span>
            </span>
          </div>
        </div>

        <span className="mt-1 flex h-8 shrink-0 items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-2.5 text-[8px] font-black text-blue-700 transition-transform group-hover:translate-x-0.5">
          Detail <ArrowIcon />
        </span>
      </div>
    </Link>
  )
}

function EmptyAcademicBlock({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/70 p-5">
      <p className="text-sm font-black text-[#071a36]">{title}</p>
      <p className="mt-1.5 max-w-2xl text-xs leading-6 text-slate-500">{description}</p>
    </div>
  )
}

export default function WalisantriAcademicPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sessions, setSessions] = useState<AcademicSession[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  )

  const loadAcademic = useCallback(async () => {
    try {
      setRefreshing(true)
      setError("")

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = "/login"
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from("ppdb_applications")
        .select("id,nama_lengkap,nomor_pendaftaran")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (profileError) throw profileError

      if (!profileData) {
        throw new Error("Data santri belum ditemukan.")
      }

      setProfile(profileData as Profile)

      const { data: sessionData, error: sessionError } = await supabase
        .from("academic_learning_sessions")
        .select(
          "id,tanggal,jp_number,waktu_mulai,waktu_selesai,subject_id,teacher_id,class_id"
        )
        .eq("tanggal", selectedDate)
        .order("jp_number", { ascending: true })

      if (sessionError) {
        throw sessionError
      }

      setSessions((sessionData || []) as AcademicSession[])
    } catch (err) {
      let message = "Unable to load Academic. Please refresh and try again."

      if (err instanceof Error && err.message) {
        message = err.message
      } else if (typeof err === "object" && err !== null) {
        const candidate = err as {
          message?: unknown
          details?: unknown
          hint?: unknown
          code?: unknown
        }

        const parts = [
          candidate.message,
          candidate.details,
          candidate.hint,
          candidate.code ? `code: ${candidate.code}` : null,
        ].filter(Boolean)

        if (parts.length) {
          message = parts.join(" · ")
        }
      }

      console.error("WALISANTRI ACADEMIC ERROR:", message, err)
      setError(message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [selectedDate])

  useEffect(() => {
    void loadAcademic()
  }, [loadAcademic])

  const stats = useMemo(
    () => [
      {
        label: "Academic Average",
        value: "--",
        note: "Assessment data not connected",
      },
      {
        label: "Subjects",
        value: sessions.length ? String(new Set(sessions.map((item) => item.subject_id).filter(Boolean)).size) : "0",
        note: "Scheduled today",
      },
      {
        label: "Assessments",
        value: "--",
        note: "Assessment module not connected",
      },
      {
        label: "Learning Progress",
        value: "--",
        note: "Competency data not connected",
      },
    ],
    [sessions]
  )

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.10),transparent_24%),linear-gradient(to_bottom,#f7fbff_0%,#ffffff_34%,#f7faff_100%)] text-[#071a36]">
      <div className="mx-auto flex min-h-screen max-w-[1500px] gap-5 px-3 py-3 sm:px-5 lg:px-6">
        <aside className="hidden w-[250px] shrink-0 overflow-hidden rounded-[1.8rem] border border-white/90 bg-white/90 shadow-[0_18px_50px_rgba(7,26,54,0.07)] backdrop-blur-xl lg:block">
          <div className="border-b border-slate-100 p-5">
            <Link href="/walisantri" className="group flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:shadow-md">
                <Image
                  src="/logo-imam.png"
                  alt="Imam Nawawi Islamic Boarding School"
                  width={48}
                  height={48}
                  priority
                  className="h-9 w-9 object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.20em] text-[#b58a2f]">
                  INIBS SMART DIGITAL
                </p>
                <p className="mt-1 text-sm font-black text-[#071a36]">Parent Portal</p>
              </div>
            </Link>
          </div>

          <div className="p-4">
            <p className="mb-3 px-3 text-[9px] font-black uppercase tracking-[0.18em] text-[#b58a2f]">
              Parent Portal
            </p>

            <nav className="space-y-1.5">
              {[
                ["/walisantri", "Dashboard", <DashboardIcon key="dashboard" />],
                ["/walisantri/aktivitas", "Daily Activity", <ActivityIcon key="activity" />],
                ["/walisantri/kehadiran", "Attendance", <AttendanceIcon key="attendance" />],
                ["/walisantri/akademik", "Academic", <AcademicIcon key="academic" />],
                ["/walisantri/tahfizh", "Tahfizh", <QuranIcon key="quran" />],
                ["/walisantri/perizinan", "Permission", <PermissionIcon key="permission" />],
                ["/walisantri/pembinaan", "Student Conduct", <CharacterIcon key="character" />],
                ["/walisantri/punishment", "Punishment / Discipline", <DisciplineIcon key="discipline" />],
                ["/walisantri/kalender", "School Calendar", <CalendarIcon key="calendar" />],
                ["/walisantri/tagihan", "School Billing", <BillingIcon key="billing" />],
                ["/walisantri/infaq", "Infaq & Contributions", <InfaqIcon key="infaq" />],
                ["/walisantri/pengumuman", "Announcements", <AnnouncementIcon key="announcement" />],
              ].map(([href, label, icon]) => {
                const active = href === "/walisantri/akademik"
                return (
                  <Link
                    key={href as string}
                    href={href as string}
                    className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-[10px] font-bold transition-all duration-300 ${
                      active
                        ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100"
                        : "text-[#52677e] hover:-translate-y-0.5 hover:bg-[#f6faff] hover:text-[#174f91]"
                    }`}
                  >
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg ring-1 transition-transform duration-300 group-hover:scale-105 ${
                      active
                        ? "bg-white text-blue-700 ring-blue-100"
                        : "bg-[#f7fbff] text-[#245ea8] ring-blue-100"
                    }`}>
                      {icon}
                    </span>
                    <span className="truncate">{label as string}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="border-t border-slate-100 bg-[#fbfdff] p-4">
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#edf5fc] text-[#245ea8] ring-1 ring-blue-100">
                <UserIcon />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[#8a9aac]">Wali Santri</p>
                <p className="truncate text-xs font-black text-[#071a36]">Parent Account</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-4 overflow-x-auto rounded-2xl border border-white/90 bg-white/90 p-2 shadow-sm backdrop-blur-xl lg:hidden">
            <div className="flex min-w-max gap-2">
              {[
                ["/walisantri", "Dashboard"],
                ["/walisantri/aktivitas", "Daily Activity"],
                ["/walisantri/kehadiran", "Attendance"],
                ["/walisantri/akademik", "Academic"],
                ["/walisantri/tahfizh", "Tahfizh"],
                ["/walisantri/perizinan", "Permission"],
                ["/walisantri/punishment", "Discipline"],
                ["/walisantri/tagihan", "Billing"],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-xl px-3 py-2 text-[9px] font-black ${
                    href === "/walisantri/akademik"
                      ? "bg-blue-700 text-white"
                      : "bg-slate-50 text-slate-500"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <header className="flex flex-col gap-4 rounded-[1.8rem] border border-white/90 bg-white/85 px-5 py-4 shadow-[0_14px_40px_rgba(7,26,54,0.05)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600">Parent Portal · Learning</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-[#071a36] sm:text-3xl">Academic</h1>
              <p className="mt-1 text-xs text-slate-500">Follow learning progress, academic sessions, and future assessment results.</p>
            </div>

            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[9px] font-black text-slate-600">
                <CalendarIcon />
                <span className="hidden sm:inline">Date</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="bg-transparent text-[10px] font-black outline-none"
                />
              </label>

              <button
                type="button"
                onClick={() => void loadAcademic()}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[9px] font-black text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <RefreshIcon spin={refreshing} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </header>

          <section className="mt-5 overflow-hidden rounded-[2.3rem] bg-gradient-to-br from-[#071b38] via-[#0d356d] to-blue-600 p-6 text-white shadow-2xl shadow-blue-950/15 sm:p-8">
            <div className="relative">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-300/15 blur-3xl" />
              <div className="relative z-10 grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-end">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-blue-50 backdrop-blur-md">
                    <span className="h-2 w-2 rounded-full bg-cyan-300" />
                    Learning Overview
                  </span>

                  <h2 className="mt-5 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">
                    {profile?.nama_lengkap || "Student Academic Journey"}
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-7 text-blue-100">
                    Pantau aktivitas pembelajaran anak pada hari yang dipilih. Modul penilaian, kompetensi, dan feedback guru dapat disambungkan pada tahap integrasi akademik berikutnya.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[9px] font-black text-blue-100">
                      {formatDate(selectedDate)}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[9px] font-black text-cyan-100">
                      {profile?.nomor_pendaftaran || "Registration unavailable"}
                    </span>
                  </div>
                </div>

                <div className="rounded-[1.7rem] border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-cyan-100 ring-1 ring-white/10">
                      <BookIcon />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-200">Today&apos;s Academic Sessions</p>
                      <p className="mt-1 text-2xl font-black">{sessions.length}</p>
                    </div>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-white"
                      style={{ width: `${Math.min(100, sessions.length * 12.5)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[9px] text-blue-100">Based on academic learning sessions available for this date.</p>
                </div>
              </div>
            </div>
          </section>

          {error ? (
            <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
              {error}
            </div>
          ) : null}

          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item, index) => (
              <div key={item.label} className="rounded-[1.5rem] border border-white/90 bg-white/90 p-5 shadow-[0_12px_35px_rgba(7,26,54,0.05)] backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    index === 0 ? "bg-blue-50 text-blue-700" :
                    index === 1 ? "bg-cyan-50 text-cyan-700" :
                    index === 2 ? "bg-indigo-50 text-indigo-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {index === 0 ? <ChartIcon /> : <BookIcon />}
                  </span>
                </div>
                <p className="mt-4 text-3xl font-black tracking-tight text-[#071a36]">
                  {loading ? "…" : item.value}
                </p>
                <p className="mt-1 text-[10px] font-semibold text-slate-400">{item.note}</p>
              </div>
            ))}
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="rounded-[2rem] border border-white/90 bg-white/90 p-6 shadow-[0_16px_44px_rgba(7,26,54,0.05)] backdrop-blur-xl sm:p-7">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Academic Schedule</p>
                  <h2 className="mt-1 text-xl font-black text-[#071a36]">Today&apos;s Learning Sessions</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Each academic period can be opened for its session-level detail.</p>
                </div>

                <Link
                  href={`/walisantri/aktivitas?tanggal=${selectedDate}`}
                  className="hidden items-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-[9px] font-black text-blue-700 sm:inline-flex"
                >
                  Open Daily Activity <ArrowIcon />
                </Link>
              </div>

              <div className="mt-5 space-y-3">
                {loading ? (
                  [1, 2, 3].map((item) => (
                    <div key={item} className="h-24 animate-pulse rounded-[1.4rem] bg-slate-100" />
                  ))
                ) : sessions.length ? (
                  sessions.map((session) => <SessionCard key={session.id} session={session} />)
                ) : (
                  <EmptyAcademicBlock
                    title="No academic sessions found"
                    description="Belum ada academic learning session yang tersimpan untuk tanggal ini."
                  />
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/90 bg-white/90 p-6 shadow-[0_16px_44px_rgba(7,26,54,0.05)] backdrop-blur-xl sm:p-7">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Student Snapshot</p>
              <h2 className="mt-1 text-xl font-black text-[#071a36]">Academic Identity</h2>

              <div className="mt-5 rounded-[1.5rem] border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sm font-black text-blue-700 shadow-sm ring-1 ring-blue-100">
                    {getInitials(profile?.nama_lengkap || null)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-[#071a36]">{profile?.nama_lengkap || "Student"}</p>
                    <p className="mt-0.5 text-[10px] text-slate-500">{profile?.nomor_pendaftaran || "Registration number unavailable"}</p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3">
                <div className="rounded-xl border border-white/90 bg-white/80 p-3">
                  <p className="text-[8px] font-black uppercase tracking-[0.14em] text-slate-400">Registration</p>
                  <p className="mt-1 text-xs font-black text-[#071a36]">{labelValue(profile?.nomor_pendaftaran || null)}</p>
                </div>
              </div>
              </div>

              <div className="mt-5">
                <EmptyAcademicBlock
                  title="Assessment & Learning Progress"
                  description="Belum ada sumber data assessment, nilai, kompetensi, atau teacher feedback yang teridentifikasi pada source database yang kita gunakan. Komponen UI sudah disiapkan agar bisa disambungkan setelah struktur tabel akademik ditetapkan."
                />
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-[2rem] border border-white/90 bg-white/90 p-6 shadow-[0_16px_44px_rgba(7,26,54,0.05)] backdrop-blur-xl sm:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-700 ring-1 ring-blue-100">
                <ChartIcon />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Next Integration</p>
                <h2 className="mt-1 text-xl font-black text-[#071a36]">Academic Assessment Layer</h2>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
                  Tahap berikutnya adalah menyambungkan nilai per mata pelajaran, assessment formative dan summative, kompetensi/learning outcomes, serta teacher feedback. Kita sengaja belum membuat query tabel baru agar tidak menebak struktur Supabase yang belum terverifikasi.
                </p>
              </div>
            </div>
          </section>

          <footer className="py-8 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Imam Nawawi Islamic Boarding School</p>
            <p className="mt-1 text-[10px] text-slate-400">INIBS Smart Digital · Walisantri Portal</p>
          </footer>
        </div>
      </div>
    </main>
  )
}
