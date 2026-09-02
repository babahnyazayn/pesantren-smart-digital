"use client"

import Image from "next/image"
import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"

type Application = {
  id: string
  nama_lengkap: string | null
  nomor_pendaftaran: string | null
}

type Activity = {
  id: string
  nama_kegiatan: string
  kategori: string
  hari: string
  waktu_mulai: string
  waktu_selesai: string
  deskripsi: string | null
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

type DisplayActivity = Activity & {
  academicSession?: AcademicSession
}

type AttendanceStatus = "HADIR" | "IZIN" | "SAKIT" | "ALPHA"

type AttendanceRow = {
  activity_id: string
  status: AttendanceStatus
  catatan: string | null
}

type PhotoRow = {
  id: string
  activity_id: string
  file_path: string
  nama_file: string
  caption: string | null
}

type NoteRow = {
  activity_id: string
  tanggal: string
  catatan: string
}

function DashboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="4" y="4" width="6" height="6" rx="1.25" />
      <rect x="14" y="4" width="6" height="6" rx="1.25" />
      <rect x="4" y="14" width="6" height="6" rx="1.25" />
      <rect x="14" y="14" width="6" height="6" rx="1.25" />
    </svg>
  )
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

const CATEGORY_META: Record<
  string,
  {
    label: string
    icon: React.ReactNode
    iconClass: string
    accent: string
  }
> = {
  MORNING: {
    label: "Morning",
    icon: <SunIcon />,
    iconClass: "bg-blue-50 text-blue-700 ring-blue-100",
    accent: "from-blue-700 via-blue-500 to-cyan-400",
  },
  SCHOOL: {
    label: "School",
    icon: <SchoolIcon />,
    iconClass: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    accent: "from-indigo-800 via-blue-700 to-cyan-400",
  },
  AFTERNOON: {
    label: "Afternoon",
    icon: <CloudSunIcon />,
    iconClass: "bg-cyan-50 text-cyan-700 ring-cyan-100",
    accent: "from-cyan-700 via-blue-600 to-cyan-400",
  },
  EXTRACURRICULAR: {
    label: "Extracurricular",
    icon: <ActivityIcon />,
    iconClass: "bg-sky-50 text-sky-700 ring-sky-100",
    accent: "from-sky-700 via-blue-600 to-cyan-400",
  },
  EVENING: {
    label: "Evening",
    icon: <MoonIcon />,
    iconClass: "bg-slate-100 text-[#061a36] ring-slate-200",
    accent: "from-[#061a36] via-blue-800 to-cyan-500",
  },
}

export default function WalisantriActivityPage() {
  const [profile, setProfile] = useState<Application | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [academicSessions, setAcademicSessions] = useState<AcademicSession[]>([])
  const [attendance, setAttendance] = useState<AttendanceRow[]>([])
  const [photos, setPhotos] = useState<PhotoRow[]>([])
  const [notes, setNotes] = useState<NoteRow[]>([])

  const [selectedDate, setSelectedDate] = useState(formatInputDate(new Date()))
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  )

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [clockTick, setClockTick] = useState(0)
  const [error, setError] = useState("")

  const dayName = useMemo(
    () => getIndonesianDay(selectedDate),
    [selectedDate]
  )

  const selectedAttendance = useMemo(
    () =>
      selectedActivity
        ? attendance.find(
            (item) => item.activity_id === selectedActivity.id
          ) || null
        : null,
    [attendance, selectedActivity]
  )

  const selectedNote = useMemo(
    () =>
      selectedActivity
        ? notes.find((item) => item.activity_id === selectedActivity.id) || null
        : null,
    [notes, selectedActivity]
  )

  const selectedPhotos = useMemo(
    () =>
      selectedActivity
        ? photos.filter((item) => item.activity_id === selectedActivity.id)
        : [],
    [photos, selectedActivity]
  )

  const currentActivity = useMemo(
    () => getCurrentActivity(activities),
    [activities, clockTick]
  )

  const displayActivities = useMemo(
    () => buildDisplayActivities(activities, academicSessions),
    [activities, academicSessions]
  )

  const groupedActivities = useMemo(() => {
    const groups: Record<DailyPeriodKey, DisplayActivity[]> = {
      MORNING: [],
      SCHOOL: [],
      AFTERNOON: [],
      EVENING: [],
    }

    displayActivities.forEach((activity) => {
      groups[getDailyPeriod(activity)]?.push(activity)
    })

    return groups
  }, [displayActivities])

  const completedCount = useMemo(() => {
    const now = getMinutesNow()

    return activities.filter((activity) => {
      const start = getMinutes(activity.waktu_mulai)
      const end = getMinutes(activity.waktu_selesai)

      if (end < start) return false
      return now >= end
    }).length
  }, [activities, clockTick])

  const progress = useMemo(() => {
    if (!activities.length) return 0
    return Math.round((completedCount / activities.length) * 100)
  }, [activities.length, completedCount])

  const loadDashboard = useCallback(
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

        const { data: profileData, error: profileError } = await supabase
          .from("ppdb_applications")
          .select("id,nama_lengkap,nomor_pendaftaran")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()

        if (profileError) {
          throw new Error(
            `Unable to load student profile: ${profileError.message}`
          )
        }

        if (!profileData) {
          setProfile(null)
          setActivities([])
          setAcademicSessions([])
          setAttendance([])
          setPhotos([])
          setNotes([])
          return
        }

        setProfile(profileData)

        const { data: activityData, error: activityError } = await supabase
          .from("daily_activities")
          .select(
            "id,nama_kegiatan,kategori,hari,waktu_mulai,waktu_selesai,deskripsi"
          )
          .eq("hari", dayName)
          .eq("aktif", true)

        if (activityError) {
          throw new Error(
            `Unable to load daily activities: ${activityError.message}`
          )
        }

        const sorted = [...((activityData || []) as Activity[])].sort(
          compareActivityTime
        )

        setActivities(sorted)

        const { data: sessionData, error: sessionError } = await supabase
          .from("academic_learning_sessions")
          .select(
            "id,tanggal,jp_number,waktu_mulai,waktu_selesai,subject_id,teacher_id,class_id"
          )
          .eq("tanggal", selectedDate)
          .order("jp_number", { ascending: true })

        if (sessionError) {
          throw new Error(
            `Unable to load academic sessions: ${sessionError.message}`
          )
        }

        setAcademicSessions((sessionData || []) as AcademicSession[])

        if (!sorted.length) {
          setAttendance([])
          setPhotos([])
          setNotes([])
          setSelectedActivity(null)
          return
        }

        const ids = sorted.map((activity) => activity.id)

        const [
          { data: attendanceData, error: attendanceError },
          { data: photoData, error: photoError },
          { data: noteData, error: noteError },
        ] = await Promise.all([
          supabase
            .from("activity_attendance")
            .select("activity_id,status,catatan")
            .eq("ppdb_id", profileData.id)
            .eq("tanggal", selectedDate)
            .in("activity_id", ids),

          supabase
            .from("activity_photos")
            .select("id,activity_id,file_path,nama_file,caption")
            .eq("tanggal", selectedDate)
            .in("activity_id", ids)
            .order("created_at", { ascending: true }),

          supabase
            .from("activity_notes")
            .select("activity_id,tanggal,catatan")
            .eq("tanggal", selectedDate)
            .in("activity_id", ids),
        ])

        if (attendanceError) {
          throw new Error(
            `Unable to load attendance: ${attendanceError.message}`
          )
        }

        if (photoError) {
          throw new Error(
            `Unable to load activity photos: ${photoError.message}`
          )
        }

        if (noteError) {
          throw new Error(
            `Unable to load activity notes: ${noteError.message}`
          )
        }

        setAttendance((attendanceData || []) as AttendanceRow[])
        setPhotos((photoData || []) as PhotoRow[])
        setNotes((noteData || []) as NoteRow[])

        setSelectedActivity((current) => {
          if (!current) return null
          return sorted.find((item) => item.id === current.id) || null
        })
      } catch (err) {
        console.error("WALISANTRI ACTIVITY ERROR:", err)
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load Daily Activity."
        )
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [dayName, selectedDate]
  )

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 80)
    void loadDashboard()

    return () => window.clearTimeout(timer)
  }, [loadDashboard])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClockTick((value) => value + 1)
    }, 30_000)

    return () => window.clearInterval(timer)
  }, [])

  const openActivity = async (activity: DisplayActivity) => {
    if (activity.academicSession) {
      const sessionId = activity.academicSession.id

      // Fallback Academic Learning slots are display-only schedules.
      // Never navigate with their synthetic ids to a UUID route.
      if (sessionId && !sessionId.startsWith("fallback-academic-")) {
        window.location.href = `/walisantri/akademik/session/${sessionId}`
        return
      }

      setSelectedActivity(activity)
      setDetailLoading(false)
      setError("")
      return
    }

    setSelectedActivity(activity)
    setDetailLoading(true)
    setError("")

    try {
      const [
        { data: attendanceData, error: attendanceError },
        { data: photoData, error: photoError },
        { data: noteData, error: noteError },
      ] = await Promise.all([
        profile
          ? supabase
              .from("activity_attendance")
              .select("activity_id,status,catatan")
              .eq("ppdb_id", profile.id)
              .eq("tanggal", selectedDate)
              .eq("activity_id", activity.id)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),

        supabase
          .from("activity_photos")
          .select("id,activity_id,file_path,nama_file,caption")
          .eq("activity_id", activity.id)
          .eq("tanggal", selectedDate)
          .order("created_at", { ascending: true }),

        supabase
          .from("activity_notes")
          .select("activity_id,tanggal,catatan")
          .eq("activity_id", activity.id)
          .eq("tanggal", selectedDate)
          .maybeSingle(),
      ])

      if (attendanceError) throw new Error(attendanceError.message)
      if (photoError) throw new Error(photoError.message)
      if (noteError) throw new Error(noteError.message)

      if (attendanceData) {
        setAttendance((current) => [
          ...current.filter((item) => item.activity_id !== activity.id),
          attendanceData as AttendanceRow,
        ])
      }

      setPhotos((current) => [
        ...current.filter((item) => item.activity_id !== activity.id),
        ...((photoData || []) as PhotoRow[]),
      ])

      if (noteData) {
        setNotes((current) => [
          ...current.filter((item) => item.activity_id !== activity.id),
          noteData as NoteRow,
        ])
      }
    } catch (err) {
      console.error("ACTIVITY DETAIL ERROR:", err)
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load activity details."
      )
    } finally {
      setDetailLoading(false)
    }
  }

  const handleDateChange = (value: string) => {
    setSelectedDate(value)
    setSelectedActivity(null)
    setAcademicSessions([])
    setAttendance([])
    setPhotos([])
    setNotes([])
    setError("")
  }

  if (loading) return <LoadingScreen />

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#edf4fb] px-4">
        <div className="w-full max-w-lg rounded-[2rem] border border-white bg-white p-10 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <UserIcon />
          </div>
          <h1 className="mt-5 text-xl font-black text-[#071a36]">
            Student Profile Not Found
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            This account does not have a connected student profile.
          </p>
          <Link
            href="/walisantri"
            className="mt-6 inline-flex rounded-xl bg-[#061a36] px-5 py-3 text-xs font-black text-white"
          >
            Back to Parent Portal
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#f8fafc] text-[#10233f]">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_48%,#f2f7fc_100%)]" />
        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-blue-200/20 blur-3xl apple-orb-one" />
        <div className="absolute right-[-7rem] top-32 h-96 w-96 rounded-full bg-cyan-200/15 blur-3xl apple-orb-two" />
        <div className="absolute left-[38%] top-[44%] h-64 w-64 rounded-full bg-sky-100/25 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.10] [background-image:radial-gradient(rgba(36,94,168,0.09)_0.55px,transparent_0.55px)] [background-size:18px_18px]" />
      </div>

      <header
        className={`relative z-30 px-4 pt-4 sm:px-7 sm:pt-5 transition-all duration-1000 ease-out ${
          visible ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-[1480px]">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/88 px-4 py-3 shadow-[0_12px_34px_rgba(15,39,74,0.05)] backdrop-blur-2xl sm:px-5">
            <Link href="/walisantri" className="group flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:shadow-md">
                <Image src="/logo-imam.png" alt="Imam Nawawi Islamic Boarding School" width={44} height={44} priority className="h-8 w-8 object-contain" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.24em] text-blue-700">
                  INIBS SMART DIGITAL
                </p>
                <p className="mt-0.5 truncate text-sm font-black text-[#071a36]">
                  Parent Portal
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void loadDashboard(true)}
                disabled={refreshing}
                className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black text-[#697787] shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:scale-[0.97] disabled:cursor-wait disabled:opacity-60"
              >
                <RefreshIcon spinning={refreshing} />
                <span className="hidden sm:inline">
                  {refreshing ? "Refreshing..." : "Refresh"}
                </span>
              </button>

              <span className="flex items-center gap-2 rounded-full border border-blue-100 bg-[#f3f8fd] px-3 py-2 ring-1 ring-blue-100 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
                </span>
                <span className="hidden text-[10px] font-black uppercase tracking-wider text-blue-700 sm:inline">
                  Connected
                </span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex max-w-[1480px] gap-7 px-3 pb-14 pt-5 sm:px-5 lg:px-7">
        <aside className="hidden w-[236px] shrink-0 lg:block">
          <div className="sticky top-5 overflow-hidden rounded-[1.8rem] border border-slate-200/80 bg-white/94 shadow-[0_18px_48px_rgba(15,39,74,0.06)] backdrop-blur-2xl">
            <div className="border-b border-slate-100 p-5">
              <Link href="/walisantri" className="group flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105">
                  <Image src="/logo-imam.png" alt="Imam Nawawi Islamic Boarding School" width={48} height={48} priority className="h-9 w-9 object-contain" />
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
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[11px] font-black transition-all duration-300 ease-out ${
                      href === "/walisantri/aktivitas"
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
                    className="group flex items-center gap-3 rounded-xl px-3.5 py-3 text-[10px] font-bold text-[#52677e] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#f6faff] hover:text-[#174f91]"
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
                    href === "/walisantri/aktivitas"
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
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/90 px-4 py-4 shadow-sm">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-100 text-sm font-black text-red-700">
                !
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-red-800">
                  Some information could not be loaded
                </p>
                <p className="mt-1 break-words text-xs leading-5 text-red-700">
                  {error}
                </p>
              </div>
            </div>
          )}

          <section
            className={`relative overflow-hidden rounded-[2.2rem] border border-slate-200/80 bg-white shadow-[0_24px_70px_rgba(15,39,74,0.08)] transition-all duration-1000 ${
              visible ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"
            }`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(96,165,250,0.12),transparent_26%),radial-gradient(circle_at_62%_88%,rgba(103,232,249,0.10),transparent_27%)]" />

            <div className="relative z-10 grid gap-8 p-6 sm:p-9 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:p-10">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-[#f7fbff] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-[#245ea8]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2675bd] animate-pulse" />
                    Student Life
                  </span>
                  <span className="rounded-full border border-amber-100 bg-[#fffaf0] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-[#a67a24]">
                    Daily Activity
                  </span>
                </div>

                <p className="mt-6 text-sm font-semibold text-[#728399]">
                  {profile.nama_lengkap || "Student"}
                </p>

                <h1 className="mt-1 text-4xl font-black tracking-[-0.035em] text-[#071a36] sm:text-6xl">
                  Daily Activity
                </h1>

                <p className="mt-3 text-base font-semibold text-[#245ea8]">
                  {formatLongDate(selectedDate)}
                </p>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#607389] sm:text-[15px]">
                  Follow your child&apos;s complete daily routine, participation,
                  documentation, and teacher observations in one calm view.
                </p>

                <div className="mt-7 flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm">
                    <CalendarIcon />
                    <span className="text-[10px] font-black uppercase tracking-[0.10em] text-[#52677e]">
                      {formatLongDate(selectedDate)}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/80 px-3.5 py-2.5 text-[10px] font-black uppercase tracking-[0.10em] text-[#318268]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#3ca17d]" />
                    Live tracking
                  </span>
                </div>

                <div className="mt-7 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
                  <HeroStat label="Activities" value={`${displayActivities.length}`} icon={<ActivityIcon />} />
                  <HeroStat label="Completed" value={`${completedCount}`} icon={<CheckIcon />} />
                  <HeroStat label="Progress" value={`${progress}%`} icon={<ChartIcon />} />
                  <HeroStat label="Day" value={dayName} icon={<CalendarIcon />} />
                </div>
              </div>

              <div className="relative">
                <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-[#f7fbff] p-1 shadow-[0_20px_55px_rgba(15,39,74,0.08)]">
                  <div className="relative overflow-hidden rounded-[1.8rem] border border-white/90 bg-white/88 p-5 shadow-sm backdrop-blur-xl sm:p-6">
                    <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-blue-100/60 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-cyan-100/50 blur-3xl" />

                    <div className="relative z-10">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#245ea8]">
                            Current Activity
                          </p>
                          <p className="mt-1 text-[10px] font-semibold text-[#8a9aac]">
                            Live student schedule
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-[8px] font-black uppercase tracking-wider text-emerald-700">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                          Live
                        </span>
                      </div>

                      {currentActivity ? (
                        <div className="mt-7">
                          <div className="flex items-start gap-3">
                            <div className="edu-floating flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#edf5fc] text-[#245ea8] ring-1 ring-blue-100">
                              <PlayIcon />
                            </div>

                            <div className="min-w-0">
                              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#245ea8]">
                                In Progress
                              </p>
                              <p className="mt-1 line-clamp-2 text-xl font-black leading-tight tracking-tight text-[#071a36]">
                                {currentActivity.nama_kegiatan}
                              </p>
                              <p className="mt-2 text-xs font-semibold text-[#8a9aac]">
                                {formatTime(currentActivity.waktu_mulai)} -{" "}
                                {formatTime(currentActivity.waktu_selesai)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-7">
                          <p className="text-xl font-black text-[#071a36]">
                            No Active Session
                          </p>
                          <p className="mt-2 text-xs leading-5 text-[#8a9aac]">
                            Explore the complete schedule below.
                          </p>
                        </div>
                      )}

                      <div className="mt-8">
                        <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-[0.16em]">
                          <span className="text-[#8a9aac]">Daily progress</span>
                          <span className="text-[#245ea8]">{progress}%</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-blue-50">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 transition-all duration-1000 ease-[cubic-bezier(.22,1,.36,1)]"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[9px] font-semibold text-[#8a9aac]">
                            Learning journey
                          </span>
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[8px] font-black text-blue-700">
                            {completedCount}/{activities.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            className={`mt-6 rounded-[2rem] border border-white/95 bg-white/96 p-4 shadow-[0_18px_48px_rgba(7,26,54,0.06)] backdrop-blur-xl transition-all delay-100 duration-1000 sm:p-5 ${
              visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
            }`}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#245ea8]">
                  Explore the day
                </p>
                <h2 className="mt-1 text-lg font-black text-[#071a36]">
                  Choose a date
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDateChange(addDays(selectedDate, -1))}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:scale-95"
                  aria-label="Previous day"
                >
                  <ArrowLeftIcon />
                </button>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => handleDateChange(event.target.value)}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-[#52677e] outline-none shadow-sm transition-all duration-300 focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60"
                />

                <button
                  type="button"
                  onClick={() => handleDateChange(formatInputDate(new Date()))}
                  className="h-10 rounded-xl border border-blue-100 bg-[#eef5ff] px-3.5 text-[9px] font-black uppercase tracking-wider text-[#245ea8] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-100 active:scale-[0.98]"
                >
                  Today
                </button>

                <button
                  type="button"
                  onClick={() => handleDateChange(addDays(selectedDate, 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:scale-95"
                  aria-label="Next day"
                >
                  <ArrowRightIcon />
                </button>
              </div>
            </div>
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.08fr_.92fr]">
            <section
              className={`rounded-[2rem] border border-white/95 bg-white/96 p-5 shadow-[0_18px_48px_rgba(7,26,54,0.06)] backdrop-blur-xl transition-all delay-150 duration-1000 sm:p-6 ${
                visible ? "translate-x-0 opacity-100" : "-translate-x-5 opacity-0"
              }`}
            >
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#245ea8]">
                    Complete Daily Journey
                  </p>
                  <h2 className="mt-1 text-xl font-black text-[#071a36]">
                    Today&apos;s Timeline
                  </h2>
                  <p className="mt-1 text-[10px] text-[#8a9aac]">
                    Morning to evening, with each learning session shown independently.
                  </p>
                </div>

                <span className="shrink-0 rounded-full border border-blue-100 bg-[#f7fbff] px-3 py-1.5 text-[9px] font-black text-[#245ea8]">
                  {displayActivities.length} activities
                </span>
              </div>

              {displayActivities.length === 0 ? (
                <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#7b8a9b] shadow-sm ring-1 ring-slate-100">
                    <CalendarIcon />
                  </div>
                  <h3 className="mt-4 text-sm font-black text-slate-600">
                    No Activities Scheduled
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-[#7b8a9b]">
                    There is no active Daily Activity schedule for this day.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-7 edu-stagger">
                  {DAILY_PERIODS.map((period) => {
                    const periodActivities = groupedActivities[period.key]
                    if (!periodActivities.length) return null

                    return (
                      <ActivityPeriod
                        key={period.key}
                        period={period}
                        activities={periodActivities}
                        currentActivity={currentActivity}
                        selectedActivity={selectedActivity}
                        attendance={attendance}
                        photos={photos}
                        notes={notes}
                        academicSessions={academicSessions}
                        onSelect={openActivity}
                      />
                    )
                  })}
                </div>
              )}
            </section>

            <section
              className={`overflow-hidden rounded-[2rem] border border-white/95 bg-white/96 shadow-[0_18px_48px_rgba(7,26,54,0.06)] backdrop-blur-xl transition-all delay-200 duration-1000 ${
                visible ? "translate-x-0 opacity-100" : "translate-x-5 opacity-0"
              }`}
            >
              {!selectedActivity ? (
                <div className="flex min-h-[620px] flex-col items-center justify-center px-7 text-center">
                  <div className="edu-floating flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-[#f7fbff] text-[#245ea8] shadow-xl shadow-blue-100 ring-1 ring-blue-100">
                    <ActivityIcon />
                  </div>
                  <p className="mt-6 text-[10px] font-black uppercase tracking-[0.22em] text-[#245ea8]">
                    Activity Detail
                  </p>
                  <h2 className="mt-2 text-xl font-black text-[#071a36]">
                    Select an activity
                  </h2>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-[#8a9aac]">
                    Select any activity from the timeline to view attendance,
                    activity photos, and the recorded observation.
                  </p>
                </div>
              ) : (
                <div className="animate-[fadeIn_.35s_ease-out]">
                  {detailLoading ? (
                    <div className="p-7">
                      <div className="h-6 w-40 animate-pulse rounded bg-slate-100" />
                      <div className="mt-4 h-20 rounded-2xl bg-slate-100" />
                      <div className="mt-4 h-44 rounded-2xl bg-slate-100" />
                    </div>
                  ) : (
                    <>
                      <div className="relative overflow-hidden border-b border-slate-100 px-5 py-6 sm:px-7">
                        <div
                          className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${
                            CATEGORY_META[selectedActivity.kategori]?.accent ||
                            CATEGORY_META.MORNING.accent
                          } opacity-[0.035]`}
                        />

                        <div className="relative z-10">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#245ea8]">
                                Activity Detail
                              </p>
                              <h2 className="mt-1 text-2xl font-black tracking-tight text-[#071a36]">
                                {selectedActivity.nama_kegiatan}
                              </h2>
                            </div>

                            <button
                              type="button"
                              onClick={() => setSelectedActivity(null)}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:scale-95"
                              aria-label="Close activity detail"
                            >
                              ×
                            </button>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-black text-slate-600">
                              {formatTime(selectedActivity.waktu_mulai)} -{" "}
                              {formatTime(selectedActivity.waktu_selesai)}
                            </span>

                            <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[9px] font-black text-blue-700">
                              {CATEGORY_META[selectedActivity.kategori]?.label ||
                                selectedActivity.kategori}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 sm:p-7">
                        <div className="grid grid-cols-2 gap-3">
                          <DetailStat
                            icon={<AttendanceIcon />}
                            label="Attendance"
                            value={getAttendanceLabel(selectedAttendance?.status)}
                          />
                          <DetailStat
                            icon={<PhotoIcon />}
                            label="Photos"
                            value={`${selectedPhotos.length}`}
                          />
                        </div>

                        <div className="mt-7">
                          <SectionLabel
                            eyebrow="Participation"
                            title="Attendance Record"
                          />
                          <div className="mt-4 rounded-[1.4rem] border border-slate-100 bg-slate-50/70 p-5">
                            <AttendanceDisplay status={selectedAttendance?.status} />

                            {selectedAttendance?.catatan && (
                              <p className="mt-4 border-t border-slate-200 pt-4 text-xs leading-6 text-slate-500">
                                {selectedAttendance.catatan}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-7">
                          <SectionLabel
                            eyebrow="Documentation"
                            title="Activity Photos"
                          />

                          {selectedPhotos.length > 0 ? (
                            <div className="mt-4 grid grid-cols-2 gap-3">
                              {selectedPhotos.map((photo) => (
                                <a
                                  key={photo.id}
                                  href={getPublicPhotoUrl(photo.file_path)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="group relative overflow-hidden rounded-[1.2rem] border border-slate-100 bg-slate-100"
                                >
                                  <img
                                    src={getPublicPhotoUrl(photo.file_path)}
                                    alt={
                                      photo.caption ||
                                      photo.nama_file ||
                                      selectedActivity.nama_kegiatan
                                    }
                                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
                                  />
                                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#061a36]/70 to-transparent p-3 pt-10">
                                    <p className="truncate text-[9px] font-semibold text-white">
                                      {photo.caption || photo.nama_file}
                                    </p>
                                  </div>
                                </a>
                              ))}
                            </div>
                          ) : (
                            <EmptyDetail
                              icon={<PhotoIcon />}
                              title="No photos yet"
                              text="Activity documentation will appear here when uploaded."
                            />
                          )}
                        </div>

                        <div className="mt-7">
                          <SectionLabel
                            eyebrow="Observation"
                            title="Teacher / Musyrif Note"
                          />

                          {selectedNote ? (
                            <div className="mt-4 rounded-[1.4rem] border border-blue-100 bg-[#f7fbff] p-5">
                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 ring-1 ring-blue-100 shadow-sm">
                                  <NoteIcon />
                                </div>
                                <p className="text-sm leading-7 text-slate-600">
                                  “{selectedNote.catatan}”
                                </p>
                              </div>
                            </div>
                          ) : (
                            <EmptyDetail
                              icon={<NoteIcon />}
                              title="No observation yet"
                              text="A teacher or musyrif observation will appear here when available."
                            />
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </section>
          </div>

          <footer
            className={`mt-9 text-center transition-all delay-500 duration-1000 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="mx-auto mb-4 h-px max-w-xl bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              Imam Nawawi Islamic Boarding School
            </p>
            <p className="mt-2 text-[10px] text-slate-400">
              © 2026 INIBS Smart Digital
            </p>
          </footer>
        </div>
      </div>

      <style jsx global>{`
        @keyframes eduFadeUp {
          from {
            opacity: 0;
            transform: translateY(10px) scale(.99);
            filter: blur(1px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes eduSoftPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(59,130,246,0);
          }
          50% {
            box-shadow: 0 0 0 7px rgba(59,130,246,.05);
          }
        }

        @keyframes eduFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        .edu-stagger > * {
          animation: eduFadeUp 520ms cubic-bezier(.22,.61,.36,1) both;
        }

        .edu-stagger > *:nth-child(1) { animation-delay: 40ms; }
        .edu-stagger > *:nth-child(2) { animation-delay: 80ms; }
        .edu-stagger > *:nth-child(3) { animation-delay: 120ms; }
        .edu-stagger > *:nth-child(4) { animation-delay: 160ms; }
        .edu-stagger > *:nth-child(5) { animation-delay: 200ms; }
        .edu-stagger > *:nth-child(6) { animation-delay: 240ms; }
        .edu-stagger > *:nth-child(7) { animation-delay: 280ms; }
        .edu-stagger > *:nth-child(8) { animation-delay: 320ms; }

        .edu-current {
          animation: eduSoftPulse 3.6s ease-in-out infinite;
        }

        .edu-floating {
          animation: eduFloat 5s ease-in-out infinite;
        }

        .apple-orb-one {
          animation: appleOrbOne 16s ease-in-out infinite;
        }

        .apple-orb-two {
          animation: appleOrbTwo 18s ease-in-out infinite;
        }

        @keyframes appleOrbOne {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(18px, 14px, 0) scale(1.04); }
        }

        @keyframes appleOrbTwo {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-16px, 10px, 0) scale(1.05); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .edu-stagger > *,
          .edu-current,
          .edu-floating,
          .apple-orb-one,
          .apple-orb-two {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </main>
  )
}


function HeroStat({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="group rounded-[1.35rem] border border-blue-100/90 bg-white/80 p-3.5 shadow-[0_10px_28px_rgba(37,99,235,0.04)] transition-[transform,box-shadow,border-color,background-color] duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-[0_16px_36px_rgba(37,99,235,0.07)]">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100 transition-transform duration-500 group-hover:scale-105">
        {icon}
      </div>
      <p className="mt-3 text-[8px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-black tracking-tight text-[#071a36]">
        {value}
      </p>
    </div>
  )
}

/* ---------- DAILY PERIODS ---------- */

type DailyPeriodKey = "MORNING" | "SCHOOL" | "AFTERNOON" | "EVENING"

const DAILY_PERIODS: Array<{
  key: DailyPeriodKey
  label: string
  subtitle: string
  icon: React.ReactNode
  tone: string
}> = [
  {
    key: "MORNING",
    label: "Morning",
    subtitle: "Spiritual routine & morning preparation",
    icon: <SunIcon />,
    tone: "bg-blue-50 text-blue-700 ring-blue-100",
  },
  {
    key: "SCHOOL",
    label: "School",
    subtitle: "Academic learning & school routine",
    icon: <SchoolIcon />,
    tone: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  },
  {
    key: "AFTERNOON",
    label: "Afternoon",
    subtitle: "Prayer, meals, rest & development",
    icon: <CloudSunIcon />,
    tone: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  },
  {
    key: "EVENING",
    label: "Evening",
    subtitle: "Qur'an, learning & rest",
    icon: <MoonIcon />,
    tone: "bg-slate-100 text-[#061a36] ring-slate-200",
  },
]

function ActivityPeriod({
  period,
  activities,
  currentActivity,
  selectedActivity,
  attendance,
  photos,
  notes,
  academicSessions,
  onSelect,
}: {
  period: (typeof DAILY_PERIODS)[number]
  activities: DisplayActivity[]
  currentActivity: Activity | null
  selectedActivity: Activity | null
  attendance: AttendanceRow[]
  photos: PhotoRow[]
  notes: NoteRow[]
  academicSessions: AcademicSession[]
  onSelect: (activity: Activity) => Promise<void>
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 shadow-sm ${period.tone}`}
        >
          {period.icon}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-[#071a36] sm:text-base">
              {period.label}
            </h3>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-slate-500">
              {activities.length}
            </span>
          </div>
          <p className="mt-0.5 text-[9px] text-slate-400">
            {period.subtitle}
          </p>
        </div>
      </div>

      <div className="relative pl-0 sm:pl-1">
        <div className="absolute bottom-5 left-[22px] top-5 w-px bg-slate-200 sm:left-[30px]" />

        <div className="space-y-2.5">
          {activities.map((activity, index) => (
            <ActivityTimelineItem
              key={`${activity.id}-${activity.waktu_mulai}-${activity.waktu_selesai}-${index}`}
              activity={activity}
              index={index}
              current={currentActivity?.id === activity.id}
              attendance={
                attendance.find(
                  (item) => item.activity_id === activity.id
                ) || null
              }
              photosCount={
                photos.filter(
                  (item) => item.activity_id === activity.id
                ).length
              }
              noteExists={notes.some(
                (item) => item.activity_id === activity.id
              )}
              academicSession={activity.academicSession}
              selected={selectedActivity?.id === activity.id}
              onClick={() => onSelect(activity)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- TIMELINE ---------- */

function ActivityTimelineItem({
  activity,
  index,
  current,
  attendance,
  photosCount,
  noteExists,
  academicSession,
  selected,
  onClick,
}: {
  activity: DisplayActivity
  index: number
  current: boolean
  attendance: AttendanceRow | null
  photosCount: number
  noteExists: boolean
  academicSession: AcademicSession | undefined
  selected: boolean
  onClick: () => void
}) {
  const meta =
    CATEGORY_META[activity.kategori] || CATEGORY_META.MORNING
  const state = getTimelineState(activity, current)

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex w-full cursor-pointer gap-3 rounded-[1.45rem] border p-3 text-left transition-all duration-300 sm:gap-4 sm:p-4 ${
        selected
          ? "border-blue-200 bg-blue-50/70 shadow-md shadow-blue-100/50"
          : "border-transparent bg-white hover:-translate-y-0.5 hover:border-slate-100 hover:bg-slate-50 hover:shadow-md"
      }`}
    >
      <div className="relative z-10 flex w-[42px] shrink-0 flex-col items-center sm:w-[60px]">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ring-1 shadow-sm transition-all duration-300 group-hover:scale-105 ${
            current
              ? "bg-blue-700 text-white ring-blue-700 shadow-blue-200"
              : state === "completed"
                ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                : meta.iconClass
          }`}
        >
          {current ? <PlayIcon /> : meta.icon}
        </div>
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[9px] font-black uppercase tracking-wider text-blue-600">
            {formatTime(activity.waktu_mulai)} -{" "}
            {formatTime(activity.waktu_selesai)}
          </p>

          {current && (
            <span className="rounded-full bg-blue-600 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-white">
              Now
            </span>
          )}

          {state === "completed" && !current && (
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-emerald-700">
              Completed
            </span>
          )}
        </div>

        <h3 className="mt-1 truncate text-sm font-black text-[#071a36] sm:text-base">
          {activity.nama_kegiatan}
        </h3>

        <p className="mt-1 hidden truncate text-[10px] text-slate-400 sm:block">
          {activity.deskripsi || meta.label}
        </p>

        {academicSession && (
          academicSession.id.startsWith("fallback-academic-") ? (
            <div className="mt-2 flex w-full items-center justify-between gap-3 rounded-xl border border-blue-100/80 bg-blue-50/50 px-3 py-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[8px] font-black text-blue-700 ring-1 ring-blue-100">
                  {academicSession.jp_number}
                </span>

                <div className="min-w-0 text-left">
                  <p className="truncate text-[9px] font-black uppercase tracking-wider text-blue-700">
                    Academic Learning {academicSession.jp_number}
                  </p>
                  <p className="mt-0.5 truncate text-[8px] font-semibold text-slate-400">
                    Learning period
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-white px-2 py-1 text-[7px] font-black uppercase tracking-wider text-slate-400 ring-1 ring-slate-100">
                Schedule
              </span>
            </div>
          ) : (
            <Link
              href={`/walisantri/akademik/session/${academicSession.id}`}
              onClick={(event) => event.stopPropagation()}
              className="group/jp mt-2 flex w-full items-center justify-between gap-3 rounded-xl border border-blue-100/80 bg-blue-50/50 px-3 py-2 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:shadow-sm active:scale-[0.99]"
              aria-label={`Open Academic Learning ${academicSession.jp_number}`}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[8px] font-black text-blue-700 ring-1 ring-blue-100">
                  {academicSession.jp_number}
                </span>

                <div className="min-w-0 text-left">
                  <p className="truncate text-[9px] font-black uppercase tracking-wider text-blue-700">
                    Academic Learning {academicSession.jp_number}
                  </p>
                  <p className="mt-0.5 truncate text-[8px] font-semibold text-slate-400">
                    Open this learning session
                  </p>
                </div>
              </div>

              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-slate-300 ring-1 ring-slate-100 transition-all duration-300 group-hover/jp:translate-x-0.5 group-hover/jp:text-blue-700">
                <ArrowIcon />
              </span>
            </Link>
          )
        )}

        <div className="mt-2 flex flex-wrap gap-1.5">
          {attendance && (
            <span
              className={`rounded-full border px-2.5 py-1 text-[8px] font-black ${
                attendance.status === "HADIR"
                  ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                  : attendance.status === "IZIN"
                    ? "border-amber-100 bg-amber-50 text-amber-700"
                    : attendance.status === "SAKIT"
                      ? "border-blue-100 bg-blue-50 text-blue-700"
                      : "border-red-100 bg-red-50 text-red-700"
              }`}
            >
              {getAttendanceLabel(attendance.status)}
            </span>
          )}

          {photosCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[8px] font-black text-blue-700">
              <PhotoIcon />
              {photosCount}
            </span>
          )}

          {noteExists && (
            <span className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[8px] font-black text-indigo-700">
              <NoteIcon />
              Note
            </span>
          )}
        </div>
      </div>

      <div className="flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-xl border border-slate-100 bg-white text-slate-300 shadow-sm transition-all duration-300 group-hover:translate-x-1 group-hover:text-blue-700">
        <ArrowIcon />
      </div>

      <span className="sr-only">
        Activity {index + 1}: {activity.nama_kegiatan}
      </span>
    </button>
  )
}

/* ---------- DETAIL UI ---------- */

function SectionLabel({
  eyebrow,
  title,
}: {
  eyebrow: string
  title: string
}) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600">
        {eyebrow}
      </p>
      <h3 className="mt-1 text-base font-black text-[#071a36]">{title}</h3>
    </div>
  )
}

function DetailStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-[1.3rem] border border-slate-100 bg-slate-50/70 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-700 ring-1 ring-blue-100 shadow-sm">
        {icon}
      </div>
      <p className="mt-3 text-[9px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-[#071a36]">{value}</p>
    </div>
  )
}

function AttendanceDisplay({
  status,
}: {
  status: AttendanceStatus | undefined
}) {
  if (!status) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 ring-1 ring-slate-200">
          <ClockIcon />
        </div>
        <div>
          <p className="text-sm font-black text-slate-600">Not recorded</p>
          <p className="mt-1 text-[10px] text-slate-400">
            Attendance has not been recorded for this activity.
          </p>
        </div>
      </div>
    )
  }

  const settings = {
    HADIR: {
      title: "Present",
      text: "Your child was recorded as present.",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    },
    IZIN: {
      title: "Excused",
      text: "Your child was recorded as excused.",
      className: "bg-amber-50 text-amber-700 ring-amber-100",
    },
    SAKIT: {
      title: "Sick",
      text: "Your child was recorded as sick.",
      className: "bg-blue-50 text-blue-700 ring-blue-100",
    },
    ALPHA: {
      title: "Absent",
      text: "Your child was recorded as absent.",
      className: "bg-red-50 text-red-700 ring-red-100",
    },
  }[status]

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${settings.className}`}
      >
        {status === "HADIR" ? <CheckIcon /> : <ClockIcon />}
      </div>
      <div>
        <p className="text-sm font-black text-slate-700">{settings.title}</p>
        <p className="mt-1 text-[10px] text-slate-400">{settings.text}</p>
      </div>
    </div>
  )
}

function EmptyDetail({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode
  title: string
  text: string
}) {
  return (
    <div className="mt-4 rounded-[1.4rem] border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 ring-1 ring-slate-100">
        {icon}
      </div>
      <p className="mt-3 text-sm font-black text-slate-600">{title}</p>
      <p className="mx-auto mt-1 max-w-xs text-[10px] leading-5 text-slate-400">
        {text}
      </p>
    </div>
  )
}

/* ---------- HELPERS ---------- */

function getDailyPeriod(activity: Activity): DailyPeriodKey {
  const start = getMinutes(activity.waktu_mulai)

  if (start >= 4 * 60 && start < 7 * 60) return "MORNING"
  if (start >= 7 * 60 && start < 14 * 60 + 30) return "SCHOOL"
  if (start >= 14 * 60 + 30 && start < 17 * 60 + 30) return "AFTERNOON"

  return "EVENING"
}

function findAcademicSessionForActivity(
  activity: Activity,
  sessions: AcademicSession[]
) {
  return sessions.find(
    (session) =>
      session.waktu_mulai.slice(0, 5) === activity.waktu_mulai.slice(0, 5) &&
      session.waktu_selesai.slice(0, 5) === activity.waktu_selesai.slice(0, 5)
  )
}

function buildDisplayActivities(
  activities: Activity[],
  sessions: AcademicSession[]
): DisplayActivity[] {
  const hasAcademicBlock = activities.some(
    (activity) =>
      activity.kategori === "SCHOOL" &&
      activity.nama_kegiatan.trim().toLowerCase() === "academic learning"
  )

  if (!hasAcademicBlock) {
    return [...activities].sort(compareActivityTime)
  }

  const fallbackSchedule: Record<number, { start: string; end: string }> = {
    1: { start: "07:15:00", end: "08:00:00" },
    2: { start: "08:00:00", end: "08:45:00" },
    3: { start: "08:45:00", end: "09:30:00" },
    4: { start: "09:45:00", end: "10:30:00" },
    5: { start: "10:30:00", end: "11:15:00" },
    6: { start: "11:15:00", end: "12:00:00" },
    7: { start: "13:15:00", end: "13:47:30" },
    8: { start: "13:47:30", end: "14:20:00" },
  }

  const template =
    activities.find(
      (activity) =>
        activity.kategori === "SCHOOL" &&
        activity.nama_kegiatan.trim().toLowerCase() === "academic learning"
    ) || activities[0]

  const realByNumber = new Map(
    [...sessions]
      .sort((a, b) => a.jp_number - b.jp_number)
      .map((session) => [session.jp_number, session])
  )

  const displaySessions: AcademicSession[] = Array.from(
    { length: 8 },
    (_, index) => {
      const number = index + 1
      const realSession = realByNumber.get(number)

      if (realSession) {
        return realSession
      }

      const fallback = fallbackSchedule[number]

      return {
        id: `fallback-academic-${number}`,
        tanggal: selectedDateForFallback(),
        jp_number: number,
        waktu_mulai: fallback.start,
        waktu_selesai: fallback.end,
        subject_id: null,
        teacher_id: null,
        class_id: null,
      }
    }
  )

  const result: DisplayActivity[] = []
  let academicBlockInserted = false

  for (const activity of activities) {
    const isAcademicBlock =
      activity.kategori === "SCHOOL" &&
      activity.nama_kegiatan.trim().toLowerCase() === "academic learning"

    if (!isAcademicBlock) {
      result.push(activity)
      continue
    }

    if (academicBlockInserted) continue
    academicBlockInserted = true

    for (const session of displaySessions) {
      result.push({
        ...activity,
        id: `academic-session-${session.id}`,
        nama_kegiatan: `Academic Learning ${session.jp_number}`,
        waktu_mulai: session.waktu_mulai,
        waktu_selesai: session.waktu_selesai,
        deskripsi:
          session.id.startsWith("fallback-academic-")
            ? "Academic learning period"
            : "Academic learning period",
        academicSession: session,
      })
    }
  }

  return result.sort(compareActivityTime)
}

function selectedDateForFallback() {
  return formatInputDate(new Date())
}

function getTimelineState(
  activity: Activity,
  current: boolean
): "completed" | "current" | "upcoming" {
  if (current) return "current"

  const now = getMinutesNow()
  const start = getMinutes(activity.waktu_mulai)
  const end = getMinutes(activity.waktu_selesai)

  if (end >= start && now >= end) return "completed"

  return "upcoming"
}

function getCurrentActivity(activities: DisplayActivity[]) {
  const now = getMinutesNow()

  for (const activity of activities) {
    const start = getMinutes(activity.waktu_mulai)
    const end = getMinutes(activity.waktu_selesai)

    if (end < start) {
      if (now >= start || now < end) return activity
    } else if (now >= start && now < end) {
      return activity
    }
  }

  return null
}

function compareActivityTime(a: Activity, b: Activity) {
  const aStart = getMinutes(a.waktu_mulai)
  const bStart = getMinutes(b.waktu_mulai)

  const aSleep =
    aStart >= 20 * 60 && getMinutes(a.waktu_selesai) < aStart
  const bSleep =
    bStart >= 20 * 60 && getMinutes(b.waktu_selesai) < bStart

  if (aSleep && !bSleep) return 1
  if (!aSleep && bSleep) return -1

  return aStart - bStart
}

function getAttendanceLabel(status: AttendanceStatus | undefined) {
  if (status === "HADIR") return "Present"
  if (status === "IZIN") return "Excused"
  if (status === "SAKIT") return "Sick"
  if (status === "ALPHA") return "Absent"
  return "Not recorded"
}

function getPublicPhotoUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/santri-activities/${path}`
}

function getIndonesianDay(value: string) {
  const date = new Date(`${value}T12:00:00`)

  return [
    "AHAD",
    "SENIN",
    "SELASA",
    "RABU",
    "KAMIS",
    "JUMAT",
    "SABTU",
  ][date.getDay()]
}


function addDays(value: string, amount: number) {
  const date = new Date(`${value}T12:00:00`)
  date.setDate(date.getDate() + amount)
  return formatInputDate(date)
}

function formatInputDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function formatLongDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(`${value}T12:00:00`))
  } catch {
    return value
  }
}

function formatTime(value: string) {
  return value.slice(0, 5)
}

function getMinutes(value: string) {
  const [hour, minute] = value.slice(0, 5).split(":").map(Number)
  return hour * 60 + minute
}

function getMinutesNow() {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
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
          Preparing Daily Activity...
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Loading your child&apos;s daily journey
        </p>
      </div>
    </main>
  )
}

/* ---------- ICONS ---------- */
function AcademicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 4 8 4-8 4-8-4 8-4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 10v5c2.5 2 9.5 2 12 0v-5" />
      <path strokeLinecap="round" d="M20 8v7" />
    </svg>
  )
}

function QuranIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 4.5h9a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3V4.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 7.5a3 3 0 0 1 3 3V20h-3" />
      <path strokeLinecap="round" d="M8.5 8h5M8.5 11h5M8.5 14h4" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" d="M5 19V10M12 19V6M19 19v-5" />
      <path strokeLinecap="round" d="M4 19.5h16" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <path strokeLinecap="round" d="M5 12h13" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m13 6 6 6-6 6" />
    </svg>
  )
}

function PermissionIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 4h8l3 3v13H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 4v4h4M9 13h6M9 16h4" />
    </svg>
  )
}

function BillingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path strokeLinecap="round" d="M8 9h8M8 13h5M8 16h3" />
    </svg>
  )
}

function InfaqIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20s-7-3.7-7-9a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.3-7 9-7 9Z" />
      <path strokeLinecap="round" d="M9.5 12h5M12 9.5v5" />
    </svg>
  )
}

function AnnouncementIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 14h3l8 4V6l-8 4H4v4Z" />
      <path strokeLinecap="round" d="M19 9a4 4 0 0 1 0 6M6.5 14v4" />
    </svg>
  )
}

function DisciplineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.5 19 6v5.5c0 4.3-2.8 7.4-7 9-4.2-1.6-7-4.7-7-9V6l7-2.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4M12 15.5h.01" />
    </svg>
  )
}

function CharacterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="7" r="3" />
      <path strokeLinecap="round" d="M5 20a7 7 0 0 1 14 0M8.5 13h7" />
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

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path strokeLinecap="round" d="M5 12h13" />
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <circle cx="12" cy="8" r="3.2" />
      <path strokeLinecap="round" d="M5 20a7 7 0 0 1 14 0" />
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

function ActivityIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" d="M4 17h3l2-6 3 9 3-13 2 10h3" />
    </svg>
  )
}

function AttendanceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path strokeLinecap="round" d="M8 3v4M16 3v4M4 9h16" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m8 14 2 2 5-5" />
    </svg>
  )
}

function SchoolIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 10 8-5 8 5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 10v8M10 10v8M14 10v8M18 10v8" />
      <path strokeLinecap="round" d="M4 18h16M3 21h18" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function CloudSunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <path strokeLinecap="round" d="M8 16h9a4 4 0 0 0 .5-7.97A5.5 5.5 0 0 0 7.2 9.5 3.5 3.5 0 0 0 8 16Z" />
      <path strokeLinecap="round" d="M6 6V4M3.8 7.2 2.4 5.8M3 10H1" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 15.5A8 8 0 0 1 8.5 4a8 8 0 1 0 11.5 11.5Z" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M8 5.6v12.8c0 .7.8 1.1 1.4.7l9.2-6.4a.9.9 0 0 0 0-1.4L9.4 4.9C8.8 4.5 8 4.9 8 5.6Z" />
    </svg>
  )
}

function PhotoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 17 4-4 3 3 2-2 3 3" />
    </svg>
  )
}

function NoteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <rect x="5" y="4" width="14" height="16" rx="2" />
      <path strokeLinecap="round" d="M8 9h8M8 12h8M8 15h5" />
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

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 12 4 4 8-8" />
    </svg>
  )
}
