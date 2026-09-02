"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { createBrowserClient } from "@supabase/ssr"

type Category =
  | "MORNING"
  | "SCHOOL"
  | "AFTERNOON"
  | "EXTRACURRICULAR"
  | "EVENING"

type Activity = {
  id: string
  nama_kegiatan: string
  kategori: Category
  hari: string
  waktu_mulai: string
  waktu_selesai: string
  deskripsi: string | null
}

type Attendance = {
  activity_id: string
  ppdb_id: string
  tanggal: string
  status: "HADIR" | "IZIN" | "SAKIT" | "ALPHA"
  catatan: string | null
}

type Application = {
  id: string
  nama_lengkap: string | null
  nomor_pendaftaran: string | null
}

type DailySummary = {
  date: string
  expected: number
  present: number
  excused: number
  sick: number
  absent: number
  recorded: number
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

const CATEGORY_CONFIG: Record<
  Category,
  {
    title: string
    icon: ReactNode
    accent: string
  }
> = {
  MORNING: {
    title: "Morning",
    icon: <SunIcon />,
    accent: "blue",
  },
  SCHOOL: {
    title: "School",
    icon: <SchoolIcon />,
    accent: "indigo",
  },
  AFTERNOON: {
    title: "Afternoon",
    icon: <CloudSunIcon />,
    accent: "cyan",
  },
  EXTRACURRICULAR: {
    title: "Extracurricular",
    icon: <ActivityIcon />,
    accent: "blue",
  },
  EVENING: {
    title: "Evening",
    icon: <MoonIcon />,
    accent: "navy",
  },
}

export default function AttendancePage() {
  const [application, setApplication] = useState<Application | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState("")
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const loadData = useCallback(
    async (silent = false) => {
      try {
        silent ? setRefreshing(true) : setLoading(true)
        setError("")

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError) throw new Error(authError.message)

        if (!user) {
          window.location.href = "/login"
          return
        }

        const { data: applicationData, error: applicationError } =
          await supabase
            .from("ppdb_applications")
            .select("id,nama_lengkap,nomor_pendaftaran")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()

        if (applicationError) {
          throw new Error(
            `Gagal mengambil data santri: ${applicationError.message}`
          )
        }

        if (!applicationData) {
          setApplication(null)
          setActivities([])
          setAttendance([])
          return
        }

        setApplication(applicationData)

        const { start, end } = getMonthRange(selectedMonth)

        const [
          { data: activityData, error: activityError },
          { data: attendanceData, error: attendanceError },
        ] = await Promise.all([
          supabase
            .from("daily_activities")
            .select(
              "id,nama_kegiatan,kategori,hari,waktu_mulai,waktu_selesai,deskripsi"
            )
            .eq("aktif", true)
            .order("waktu_mulai", { ascending: true }),

          supabase
            .from("activity_attendance")
            .select("activity_id,ppdb_id,tanggal,status,catatan")
            .eq("ppdb_id", applicationData.id)
            .gte("tanggal", start)
            .lte("tanggal", end)
            .order("tanggal", { ascending: true }),
        ])

        if (activityError) {
          throw new Error(
            `Gagal mengambil jadwal aktivitas: ${activityError.message}`
          )
        }

        if (attendanceError) {
          throw new Error(
            `Gagal mengambil rekap kehadiran: ${attendanceError.message}`
          )
        }

        setActivities((activityData || []) as Activity[])
        setAttendance((attendanceData || []) as Attendance[])
      } catch (err) {
        console.error("ATTENDANCE MONTHLY ERROR:", err)
        setError(
          err instanceof Error
            ? err.message
            : "Rekap kehadiran gagal dimuat."
        )
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [selectedMonth]
  )

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 80)
    void loadData()
    return () => window.clearTimeout(timer)
  }, [loadData])

  const monthLabel = useMemo(
    () => formatMonthLabel(selectedMonth),
    [selectedMonth]
  )

  const dailySummaries = useMemo(
    () => buildDailySummaries(selectedMonth, activities, attendance),
    [selectedMonth, activities, attendance]
  )

  const selectedDaySummary = useMemo(
    () =>
      selectedDay
        ? dailySummaries.find((item) => item.date === selectedDay) || null
        : null,
    [dailySummaries, selectedDay]
  )

  const summary = useMemo(() => {
    const expected = dailySummaries.reduce((sum, item) => sum + item.expected, 0)
    const present = dailySummaries.reduce((sum, item) => sum + item.present, 0)
    const excused = dailySummaries.reduce((sum, item) => sum + item.excused, 0)
    const sick = dailySummaries.reduce((sum, item) => sum + item.sick, 0)
    const absent = dailySummaries.reduce((sum, item) => sum + item.absent, 0)
    const recorded = dailySummaries.reduce((sum, item) => sum + item.recorded, 0)
    const unrecorded = Math.max(expected - recorded, 0)

    return {
      expected,
      present,
      excused,
      sick,
      absent,
      recorded,
      unrecorded,
      rate: expected ? Math.round((present / expected) * 100) : 0,
      coverage: expected ? Math.round((recorded / expected) * 100) : 0,
    }
  }, [dailySummaries])

  const statusDays = useMemo(() => {
    const present = dailySummaries.filter(
      (item) => item.recorded > 0 && item.absent === 0 && item.sick === 0 && item.excused === 0
    ).length

    const hasExcused = dailySummaries.filter((item) => item.excused > 0).length
    const hasSick = dailySummaries.filter((item) => item.sick > 0).length
    const hasAbsent = dailySummaries.filter((item) => item.absent > 0).length

    return { present, hasExcused, hasSick, hasAbsent }
  }, [dailySummaries])

  if (loading) return <LoadingScreen />

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#f8fafc] text-[#10233f]">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_52%,#f2f7fc_100%)]" />
        <div className="absolute -left-28 top-20 h-72 w-72 rounded-full bg-blue-200/20 blur-3xl attendance-orb-one" />
        <div className="absolute right-[-5rem] top-28 h-80 w-80 rounded-full bg-cyan-200/15 blur-3xl attendance-orb-two" />
        <div className="absolute left-[36%] top-[44%] h-64 w-64 rounded-full bg-sky-100/20 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.10] [background-image:radial-gradient(rgba(36,94,168,0.09)_0.6px,transparent_0.6px)] [background-size:18px_18px]" />
      </div>

      <header
        className={`relative z-20 px-4 pt-4 sm:px-7 sm:pt-5 transition-all duration-1000 ${
          visible ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-[1480px]">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-[0_12px_34px_rgba(15,39,74,0.05)] backdrop-blur-2xl sm:px-5">
            <Link href="/walisantri" className="group flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:shadow-md">
                <DashboardIcon />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.24em] text-blue-700">
                  INIBS SMART DIGITAL
                </p>
                <p className="mt-0.5 truncate text-sm font-black text-[#071a36]">
                  Attendance
                </p>
              </div>
            </Link>

            <button
              type="button"
              disabled={refreshing}
              onClick={() => void loadData(true)}
              className="group flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black text-[#697787] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-wait disabled:opacity-60"
            >
              <RefreshIcon spinning={refreshing} />
              <span className="hidden sm:inline">
                {refreshing ? "Refreshing..." : "Refresh"}
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex max-w-[1480px] gap-7 px-3 pb-14 pt-5 sm:px-5 lg:px-7">
        <aside className="hidden w-[236px] shrink-0 lg:block">
          <div className="sticky top-5 overflow-hidden rounded-[1.8rem] border border-slate-200/80 bg-white/94 shadow-[0_18px_48px_rgba(15,39,74,0.06)] backdrop-blur-2xl">
            <div className="border-b border-slate-100 p-5">
              <Link href="/walisantri" className="group flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105">
                  <DashboardIcon />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.20em] text-[#b58a2f]">
                    INIBS SMART DIGITAL
                  </p>
                  <p className="mt-1 text-sm font-black text-[#071a36]">
                    Parent Portal
                  </p>
                </div>
              </Link>
            </div>

            <div className="p-4">
              <p className="mb-3 px-3 text-[9px] font-black uppercase tracking-[0.18em] text-[#8a9aac]">
                Student Life
              </p>

              <nav className="space-y-1.5">
                {[
                  ["/walisantri", "Dashboard", <DashboardIcon />],
                  ["/walisantri/aktivitas", "Daily Activity", <ActivityIcon />],
                  ["/walisantri/kehadiran", "Attendance", <AttendanceIcon />],
                  ["/walisantri/akademik", "Academic", <AcademicIcon />],
                  ["/walisantri/tahfizh", "Tahfizh", <QuranIcon />],
                ].map(([href, label, icon]) => (
                  <Link
                    key={href as string}
                    href={href as string}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[11px] font-black transition-all duration-300 ${
                      href === "/walisantri/kehadiran"
                        ? "bg-[#eef5ff] text-[#174f91] ring-1 ring-blue-100/80"
                        : "text-[#52677e] hover:-translate-y-0.5 hover:bg-[#f6faff] hover:text-[#174f91]"
                    }`}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f7fbff] text-[#245ea8] ring-1 ring-blue-100 transition-transform duration-300 group-hover:scale-105">
                      {icon}
                    </span>
                    <span className="truncate">{label as string}</span>
                  </Link>
                ))}
              </nav>

              <div className="my-5 h-px bg-slate-100" />

              <p className="mb-3 px-3 text-[9px] font-black uppercase tracking-[0.18em] text-[#b58a2f]">
                Parent Services
              </p>

              <nav className="space-y-1.5">
                {[
                  ["/walisantri/perizinan", "Permission", <PermissionIcon />],
                  ["/walisantri/pembinaan", "Student Conduct", <CharacterIcon />],
                  ["/walisantri/punishment", "Punishment / Discipline", <DisciplineIcon />],
                  ["/walisantri/kalender", "School Calendar", <CalendarIcon />],
                  ["/walisantri/tagihan", "School Billing", <BillingIcon />],
                  ["/walisantri/infaq", "Infaq & Contributions", <InfaqIcon />],
                  ["/walisantri/pengumuman", "Announcements", <AnnouncementIcon />],
                ].map(([href, label, icon]) => (
                  <Link
                    key={href as string}
                    href={href as string}
                    className="group flex items-center gap-3 rounded-xl px-3.5 py-3 text-[10px] font-bold text-[#52677e] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f6faff] hover:text-[#174f91]"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f7fbff] text-[#245ea8] ring-1 ring-blue-100 transition-transform duration-300 group-hover:scale-105">
                      {icon}
                    </span>
                    <span className="truncate">{label as string}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="border-t border-slate-100 bg-[#fbfdff] p-4">
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#edf5fc] text-[#245ea8] ring-1 ring-blue-100">
                  <UserIcon />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[#8a9aac]">
                    Wali Santri
                  </p>
                  <p className="truncate text-xs font-black text-[#071a36]">
                    Parent Account
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 max-w-[1160px]">
          <div className="mb-5 overflow-x-auto rounded-2xl border border-white/90 bg-white/92 p-2 shadow-[0_12px_34px_rgba(7,26,54,0.06)] backdrop-blur-xl lg:hidden">
            <div className="flex min-w-max gap-2">
              {[
                ["/walisantri", "Dashboard"],
                ["/walisantri/aktivitas", "Activity"],
                ["/walisantri/kehadiran", "Attendance"],
                ["/walisantri/akademik", "Academic"],
                ["/walisantri/tahfizh", "Tahfizh"],
                ["/walisantri/perizinan", "Permission"],
                ["/walisantri/punishment", "Discipline"],
                ["/walisantri/tagihan", "Billing"],
                ["/walisantri/infaq", "Infaq"],
                ["/walisantri/pengumuman", "Announcements"],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-xl border px-3 py-2 text-[9px] font-black shadow-sm transition-all duration-300 ${
                    href === "/walisantri/kehadiran"
                      ? "border-blue-100 bg-[#eef5ff] text-[#174f91]"
                      : "border-slate-100 bg-white text-[#52677e] hover:border-blue-100 hover:bg-[#f4f9fd] hover:text-[#174f91]"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 shadow-sm">
              <p className="text-sm font-black text-red-800">
                Attendance data could not be loaded
              </p>
              <p className="mt-1 text-xs leading-5 text-red-700">{error}</p>
            </div>
          )}

          {!application ? (
            <EmptyState />
          ) : (
            <>
              <section
                className={`relative overflow-hidden rounded-[2.4rem] border border-slate-200/80 bg-white shadow-[0_24px_70px_rgba(15,39,74,0.08)] transition-all duration-1000 ${
                  visible ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"
                }`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_84%_20%,rgba(96,165,250,0.14),transparent_26%),radial-gradient(circle_at_18%_84%,rgba(103,232,249,0.10),transparent_26%)]" />
                <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-100/30 blur-3xl attendance-hero-orb" />

                <div className="relative z-10 grid gap-8 p-7 sm:p-9 lg:grid-cols-[1.08fr_.92fr] lg:p-11">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-[#f7fbff] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-[#245ea8]">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2675bd]" />
                        Student Care
                      </span>
                      <span className="rounded-full border border-emerald-100 bg-emerald-50/80 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-emerald-700">
                        Monthly Overview
                      </span>
                    </div>

                    <p className="mt-7 text-sm font-semibold text-[#74869a]">
                      {monthLabel}
                    </p>

                    <h1 className="mt-1 bg-gradient-to-r from-[#0b2f63] via-[#174f91] to-[#2f77bd] bg-clip-text text-4xl font-black tracking-[-0.035em] text-transparent sm:text-6xl">
                      {application.nama_lengkap || "Santri"}
                    </h1>

                    <p className="mt-4 max-w-xl text-sm leading-7 text-[#607389]">
                      A clear monthly view of attendance consistency, recorded
                      participation, and days that may need attention.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.13em] text-[#6b7e94] shadow-sm">
                        {summary.expected} scheduled sessions
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-[#f3f8fd] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.13em] text-[#245ea8]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#2675bd]" />
                        {summary.coverage}% Recorded
                      </span>
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-blue-100/80 bg-gradient-to-br from-[#eff6ff] via-white to-[#ecfeff] p-5 shadow-[0_20px_55px_rgba(15,39,74,0.07)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#245ea8]">
                          Attendance Rate
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-400">
                          Present ÷ scheduled sessions
                        </p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#245ea8] ring-1 ring-blue-100 shadow-sm">
                        <ChartIcon />
                      </div>
                    </div>

                    <div className="mt-6 flex items-end gap-3">
                      <span className="text-6xl font-black tracking-[-0.05em] text-[#0d3b72]">
                        {summary.rate}
                      </span>
                      <span className="pb-2 text-lg font-black text-blue-600">%</span>
                    </div>

                    <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-blue-50">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 transition-all duration-1000 ease-[cubic-bezier(.22,1,.36,1)]"
                        style={{ width: `${Math.min(100, summary.rate)}%` }}
                      />
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <OverviewValue label="Present" value={summary.present} tone="green" />
                      <OverviewValue label="Recorded" value={summary.recorded} tone="blue" />
                      <OverviewValue label="Excused" value={summary.excused} tone="amber" />
                      <OverviewValue label="Absent" value={summary.absent} tone="red" />
                    </div>
                  </div>
                </div>
              </section>

              <section
                className={`mt-5 transition-all delay-100 duration-1000 ${
                  visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                }`}
              >
                <div className="rounded-[2rem] border border-white/95 bg-white/96 p-5 shadow-[0_18px_48px_rgba(7,26,54,0.06)] backdrop-blur-xl sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#245ea8]">
                        Attendance Period
                      </p>
                      <h2 className="mt-1 text-xl font-black text-[#071a36]">
                        Review another month
                      </h2>
                    </div>

                    <input
                      type="month"
                      value={selectedMonth}
                      onChange={(event) => {
                        setSelectedMonth(event.target.value)
                        setSelectedDay(null)
                      }}
                      className="h-11 cursor-pointer rounded-xl border border-slate-200 bg-[#f8fbfe] px-4 text-xs font-black text-[#40556d] outline-none transition-all duration-300 hover:border-blue-200 hover:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </section>

              <section
                className={`mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5 transition-all delay-150 duration-1000 ${
                  visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                }`}
              >
                <MetricCard label="Present" value={summary.present} tone="green" />
                <MetricCard label="Excused" value={summary.excused} tone="amber" />
                <MetricCard label="Sick" value={summary.sick} tone="blue" />
                <MetricCard label="Absent" value={summary.absent} tone="red" />
                <MetricCard label="Not Recorded" value={summary.unrecorded} />
              </section>

              <section
                className={`mt-5 rounded-[2rem] border border-white/95 bg-white/96 p-5 shadow-[0_18px_48px_rgba(7,26,54,0.06)] backdrop-blur-xl sm:p-7 transition-all delay-200 duration-1000 ${
                  visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                }`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#245ea8]">
                      Attendance Calendar
                    </p>
                    <h2 className="mt-1 text-xl font-black text-[#071a36]">
                      {monthLabel}
                    </h2>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Tap a day to inspect the daily attendance summary.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[8px] font-black uppercase tracking-wider">
                    <LegendDot tone="green" label="Present" />
                    <LegendDot tone="amber" label="Excused" />
                    <LegendDot tone="blue" label="Sick" />
                    <LegendDot tone="red" label="Absent" />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-7 gap-2 text-center">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <div key={day} className="pb-1 text-[8px] font-black uppercase tracking-wider text-slate-400">
                      {day}
                    </div>
                  ))}

                  {buildCalendarCells(selectedMonth).map((cell) => {
                    const item = cell.date
                      ? dailySummaries.find((day) => day.date === cell.date)
                      : null

                    const tone = item ? getCalendarTone(item) : "empty"

                    return (
                      <button
                        key={cell.key}
                        type="button"
                        disabled={!cell.date}
                        onClick={() => cell.date && setSelectedDay(cell.date)}
                        className={`min-h-[64px] rounded-2xl border p-2 text-left transition-[transform,box-shadow,border-color,background-color] duration-400 ease-[cubic-bezier(.22,1,.36,1)] ${
                          cell.date
                            ? "cursor-pointer hover:-translate-y-1 hover:shadow-md"
                            : "cursor-default"
                        } ${getCalendarCellClass(tone)} ${
                          selectedDay === cell.date
                            ? "ring-2 ring-blue-300 ring-offset-2"
                            : ""
                        }`}
                      >
                        {cell.date && (
                          <>
                            <p className="text-[9px] font-black text-[#344b63]">
                              {new Date(`${cell.date}T12:00:00`).getDate()}
                            </p>
                            <div className="mt-2 flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-current opacity-80" />
                              <span className="text-[7px] font-black uppercase tracking-wider opacity-75">
                                {getCalendarLabel(tone)}
                              </span>
                            </div>
                            {item && (
                              <p className="mt-1 text-[7px] font-semibold opacity-65">
                                {item.present}/{item.expected}
                              </p>
                            )}
                          </>
                        )}
                      </button>
                    )
                  })}
                </div>
              </section>

              <section className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
                <div className="rounded-[2rem] border border-white/95 bg-white/96 p-5 shadow-[0_18px_48px_rgba(7,26,54,0.06)] sm:p-7">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#245ea8]">
                      Attendance History
                    </p>
                    <h2 className="mt-1 text-xl font-black text-[#071a36]">
                      Daily record
                    </h2>
                    <p className="mt-1 text-[10px] text-slate-400">
                      A concise view of attendance across the month.
                    </p>
                  </div>

                  <div className="mt-5 space-y-2.5">
                    {dailySummaries.map((item) => (
                      <button
                        key={item.date}
                        type="button"
                        onClick={() => setSelectedDay(item.date)}
                        className={`group flex w-full items-center justify-between gap-3 rounded-2xl border p-3.5 text-left transition-all duration-400 ${
                          selectedDay === item.date
                            ? "border-blue-200 bg-blue-50/70 shadow-sm"
                            : "border-slate-100 bg-slate-50/60 hover:-translate-y-0.5 hover:border-blue-100 hover:bg-white hover:shadow-md"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getHistoryIconClass(item)}`}>
                            <span className="text-[10px] font-black">
                              {new Date(`${item.date}T12:00:00`).getDate()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[9px] font-black uppercase tracking-wider text-[#245ea8]">
                              {formatDayLabel(item.date)}
                            </p>
                            <p className="mt-0.5 truncate text-xs font-black text-[#071a36]">
                              {getHistoryLabel(item)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-black text-[#071a36]">
                            {item.present}/{item.expected}
                          </p>
                          <p className="text-[8px] font-semibold text-slate-400">
                            recorded
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-white/95 bg-white/96 p-5 shadow-[0_18px_48px_rgba(7,26,54,0.06)] sm:p-7">
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#245ea8]">
                    Selected Day
                  </p>
                  <h2 className="mt-1 text-xl font-black text-[#071a36]">
                    {selectedDaySummary
                      ? formatDayLabel(selectedDaySummary.date)
                      : "Choose a date"}
                  </h2>

                  {selectedDaySummary ? (
                    <>
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <OverviewValue label="Present" value={selectedDaySummary.present} tone="green" />
                        <OverviewValue label="Excused" value={selectedDaySummary.excused} tone="amber" />
                        <OverviewValue label="Sick" value={selectedDaySummary.sick} tone="blue" />
                        <OverviewValue label="Absent" value={selectedDaySummary.absent} tone="red" />
                      </div>

                      <div className="mt-5 rounded-[1.4rem] border border-blue-100 bg-[#f7fbff] p-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-blue-700">
                          Recorded Attendance
                        </p>
                        <p className="mt-1 text-sm font-black text-[#071a36]">
                          {selectedDaySummary.recorded} of {selectedDaySummary.expected} sessions
                        </p>
                        <p className="mt-1 text-[10px] leading-5 text-slate-400">
                          Use Daily Activity for the full activity-level detail of this day.
                        </p>

                        <Link
                          href={`/walisantri/aktivitas?tanggal=${selectedDaySummary.date}`}
                          className="group mt-4 inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-white px-3 py-2 text-[9px] font-black text-blue-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                        >
                          Open Daily Activity
                          <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                            →
                          </span>
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="mt-5 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 ring-1 ring-slate-100">
                        <CalendarEmptyIcon />
                      </div>
                      <p className="mt-4 text-sm font-black text-slate-600">
                        Select a date from the calendar
                      </p>
                      <p className="mt-1 text-[10px] leading-5 text-slate-400">
                        The selected day&apos;s attendance summary will appear here.
                      </p>
                    </div>
                  )}

                  <div className="mt-5 rounded-[1.4rem] border border-slate-100 bg-slate-50/60 p-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Month signals
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <SmallSignal label="Present days" value={statusDays.present} />
                      <SmallSignal label="Excused days" value={statusDays.hasExcused} />
                      <SmallSignal label="Sick days" value={statusDays.hasSick} />
                      <SmallSignal label="Absent days" value={statusDays.hasAbsent} />
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>

      <footer className="relative z-10 mt-2 pb-10 text-center">
        <div className="mx-auto mb-4 h-px max-w-xl bg-gradient-to-r from-transparent via-blue-200/80 to-transparent" />
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
          Imam Nawawi Islamic Boarding School
        </p>
        <p className="mt-2 text-[10px] text-slate-400">
          © 2026 INIBS Smart Digital
        </p>
      </footer>

      <style jsx global>{`
        .attendance-orb-one {
          animation: attendanceOrbOne 12s ease-in-out infinite;
        }

        .attendance-orb-two {
          animation: attendanceOrbTwo 14s ease-in-out infinite;
        }

        .attendance-hero-orb {
          animation: attendanceHeroOrb 10s ease-in-out infinite;
        }

        @keyframes attendanceOrbOne {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(10px,-8px,0) scale(1.06); }
        }

        @keyframes attendanceOrbTwo {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(-10px,8px,0) scale(1.05); }
        }

        @keyframes attendanceHeroOrb {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(-8px,10px,0) scale(1.08); }
        }

        @media (prefers-reduced-motion: reduce) {
          .attendance-orb-one,
          .attendance-orb-two,
          .attendance-hero-orb {
            animation: none !important;
          }
        }
      `}</style>
    </main>
  )
}

function buildDailySummaries(
  selectedMonth: string,
  activities: Activity[],
  attendance: Attendance[]
): DailySummary[] {
  const days = getDaysInMonth(selectedMonth)
  const scheduleByDay = new Map<string, Activity[]>()

  activities.forEach((activity) => {
    const key = activity.hari.toUpperCase()
    const bucket = scheduleByDay.get(key) || []
    bucket.push(activity)
    scheduleByDay.set(key, bucket)
  })

  const attendanceByDate = new Map<string, Attendance[]>()

  attendance.forEach((record) => {
    const bucket = attendanceByDate.get(record.tanggal) || []
    bucket.push(record)
    attendanceByDate.set(record.tanggal, bucket)
  })

  return days.map((date) => {
    const dayName = getIndonesianDay(date)
    const expectedActivities = scheduleByDay.get(dayName) || []
    const records = attendanceByDate.get(date) || []

    const present = records.filter((item) => item.status === "HADIR").length
    const excused = records.filter((item) => item.status === "IZIN").length
    const sick = records.filter((item) => item.status === "SAKIT").length
    const absent = records.filter((item) => item.status === "ALPHA").length

    return {
      date,
      expected: expectedActivities.length,
      present,
      excused,
      sick,
      absent,
      recorded: records.length,
    }
  })
}

function getMonthRange(month: string) {
  const [year, monthNumber] = month.split("-").map(Number)
  const start = `${year}-${String(monthNumber).padStart(2, "0")}-01`
  const lastDay = new Date(year, monthNumber, 0).getDate()
  const end = `${year}-${String(monthNumber).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`

  return { start, end }
}

function getDaysInMonth(month: string) {
  const [year, monthNumber] = month.split("-").map(Number)
  const total = new Date(year, monthNumber, 0).getDate()

  return Array.from({ length: total }, (_, index) => {
    const day = index + 1
    return `${year}-${String(monthNumber).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  })
}

function buildCalendarCells(month: string) {
  const days = getDaysInMonth(month)
  const first = new Date(`${days[0]}T12:00:00`)
  const offset = (first.getDay() + 6) % 7

  return [
    ...Array.from({ length: offset }, (_, index) => ({
      key: `empty-${index}`,
      date: null as string | null,
    })),
    ...days.map((date) => ({
      key: date,
      date,
    })),
  ]
}

function getCalendarTone(item: DailySummary) {
  if (item.absent > 0) return "red"
  if (item.sick > 0) return "blue"
  if (item.excused > 0) return "amber"
  if (item.recorded > 0 && item.present >= item.expected) return "green"
  if (item.recorded > 0) return "mixed"
  return "none"
}

function getCalendarCellClass(tone: string) {
  const classes: Record<string, string> = {
    green: "border-emerald-100 bg-emerald-50/60 text-emerald-700",
    amber: "border-amber-100 bg-amber-50/70 text-amber-700",
    blue: "border-blue-100 bg-blue-50/70 text-blue-700",
    red: "border-red-100 bg-red-50/70 text-red-700",
    mixed: "border-slate-200 bg-white text-slate-500",
    none: "border-slate-100 bg-slate-50 text-slate-400",
    empty: "border-transparent bg-transparent",
  }

  return classes[tone] || classes.none
}

function getCalendarLabel(tone: string) {
  const labels: Record<string, string> = {
    green: "Good",
    amber: "Excused",
    blue: "Sick",
    red: "Absent",
    mixed: "Recorded",
    none: "Pending",
  }

  return labels[tone] || "Pending"
}

function getHistoryLabel(item: DailySummary) {
  if (item.absent > 0) return "Absence recorded"
  if (item.sick > 0) return "Sick status recorded"
  if (item.excused > 0) return "Excused attendance"
  if (item.recorded > 0) return "Attendance recorded"
  return "No attendance recorded"
}

function getHistoryIconClass(item: DailySummary) {
  if (item.absent > 0) return "bg-red-50 text-red-700 ring-1 ring-red-100"
  if (item.sick > 0) return "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
  if (item.excused > 0) return "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
  if (item.recorded > 0) return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
  return "bg-slate-100 text-slate-400 ring-1 ring-slate-200"
}

function formatDayLabel(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date(`${date}T12:00:00`))
}

function formatMonthLabel(month: string) {
  const [year, monthNumber] = month.split("-").map(Number)
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthNumber - 1, 1))
}

function getCurrentMonth() {
  return formatInputDate(new Date()).slice(0, 7)
}

function getIndonesianDay(dateValue: string) {
  const date = new Date(`${dateValue}T12:00:00`)

  return (
    [
      "AHAD",
      "SENIN",
      "SELASA",
      "RABU",
      "KAMIS",
      "JUMAT",
      "SABTU",
    ][date.getDay()] || "AHAD"
  )
}

function formatInputDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function OverviewValue({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: "green" | "blue" | "amber" | "red"
}) {
  const styles = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    red: "bg-red-50 text-red-700 ring-red-100",
  }

  return (
    <div className="rounded-2xl border border-white/90 bg-white/80 p-3.5 shadow-sm">
      <div
        className={`inline-flex rounded-xl px-3 py-1.5 text-lg font-black ring-1 ${styles[tone]}`}
      >
        {value}
      </div>
      <p className="mt-2 text-[8px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
    </div>
  )
}

function MetricCard({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: number
  tone?: "default" | "green" | "amber" | "blue" | "red"
}) {
  const styles = {
    default: "bg-white text-slate-700 ring-slate-100",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    red: "bg-red-50 text-red-700 ring-red-100",
  }

  return (
    <div className="group rounded-2xl border border-white/95 bg-white/96 px-4 py-4 shadow-[0_12px_34px_rgba(7,26,54,0.05)] transition-all duration-500 hover:-translate-y-1 hover:border-blue-100 hover:shadow-[0_18px_44px_rgba(7,26,54,0.07)]">
      <div
        className={`inline-flex rounded-xl px-3 py-1.5 text-lg font-black ring-1 transition-transform duration-300 group-hover:scale-105 ${styles[tone]}`}
      >
        {value}
      </div>
      <p className="mt-2 text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
    </div>
  )
}

function LegendDot({
  tone,
  label,
}: {
  tone: "green" | "blue" | "amber" | "red"
  label: string
}) {
  const colors = {
    green: "text-emerald-600",
    blue: "text-blue-600",
    amber: "text-amber-600",
    red: "text-red-600",
  }

  return (
    <span className={`inline-flex items-center gap-1.5 ${colors[tone]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}

function SmallSignal({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3">
      <p className="text-lg font-black text-[#071a36]">{value}</p>
      <p className="mt-1 text-[8px] font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
    </div>
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
          Loading Attendance...
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Preparing monthly attendance overview
        </p>
      </div>
    </main>
  )
}

function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-10 text-center shadow-[0_18px_48px_rgba(7,26,54,0.05)]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-blue-50 text-blue-700 ring-1 ring-blue-100">
        <UserIcon />
      </div>
      <h2 className="mt-5 text-lg font-black text-[#071a36]">
        Student profile not found
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Belum ada profil santri yang terhubung dengan akun wali.
      </p>
    </div>
  )
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <rect x="4" y="4" width="6" height="6" rx="1.2" />
      <rect x="14" y="4" width="6" height="6" rx="1.2" />
      <rect x="4" y="14" width="6" height="6" rx="1.2" />
      <rect x="14" y="14" width="6" height="6" rx="1.2" />
    </svg>
  )
}

function AttendanceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" d="m8 12.3 2.5 2.5L16 9" />
    </svg>
  )
}

function AcademicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 9 8-4 8 4-8 4-8-4Z" />
      <path strokeLinecap="round" d="M7 11.5V16c2.8 2 7.2 2 10 0v-4.5M20 10v5" />
    </svg>
  )
}

function QuranIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 4.5h9.5A2.5 2.5 0 0 1 17 7v12H7.5A2.5 2.5 0 0 1 5 16.5v-12Z" />
      <path strokeLinecap="round" d="M17 19h1.5A1.5 1.5 0 0 0 20 17.5V7a2.5 2.5 0 0 0-2.5-2.5H14" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="12" cy="8" r="3.2" />
      <path strokeLinecap="round" d="M5.5 19c1.8-4 11.2-4 13 0" />
    </svg>
  )
}

function PermissionIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 4h8l3 3v13H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 4v4h4M9 13h6M9 16h4" />
    </svg>
  )
}

function CharacterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="12" cy="8" r="3" />
      <path strokeLinecap="round" d="M6 19c1.4-3.8 10.6-3.8 12 0M8 11.5a4.5 4.5 0 1 0 8 0" />
    </svg>
  )
}

function DisciplineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 4 7 3v5c0 4.5-3 7-7 8-4-1-7-3.5-7-8V7l7-3Z" />
      <path strokeLinecap="round" d="M12 8.5v4M12 15.5h.01" />
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

function BillingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path strokeLinecap="round" d="M8 9h8M8 13h5M8 16h3" />
    </svg>
  )
}

function InfaqIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20s-7-3.7-7-9a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.3-7 9-7 9Z" />
      <path strokeLinecap="round" d="M9.5 12h5M12 9.5v5" />
    </svg>
  )
}

function AnnouncementIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 14h3l8 4V6l-8 4H4v4Z" />
      <path strokeLinecap="round" d="M19 9a4 4 0 0 1 0 6M6.5 14v4" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2" />
    </svg>
  )
}

function SchoolIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 10 8-5 8 5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 10v8M10 10v8M14 10v8M18 10v8" />
      <path strokeLinecap="round" d="M4 18h16M3 21h18" />
    </svg>
  )
}

function CloudSunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" d="M8 16h9a4 4 0 0 0 .5-7.97A5.5 5.5 0 0 0 7.2 9.5 3.5 3.5 0 0 0 8 16Z" />
      <path strokeLinecap="round" d="M6 6V4M3.8 7.2 2.4 5.8M3 10H1" />
    </svg>
  )
}

function ActivityIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" d="M4 17h3l2-6 3 9 3-13 2 10h3" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 15.5A8 8 0 0 1 8.5 4a8.5 8.5 0 1 0 11.5 11.5Z" />
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

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" d="M5 18V10m7 8V6m7 12v-5" />
      <path strokeLinecap="round" d="M4 20h16" />
    </svg>
  )
}

function CalendarEmptyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path strokeLinecap="round" d="M8 3v4M16 3v4M4 9h16M9 13h6M9 16h4" />
    </svg>
  )
}
