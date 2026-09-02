"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { createBrowserClient } from "@supabase/ssr"

type Application = {
  id: string
  user_id: string
  nama_lengkap: string | null
  nisn: string | null
  tempat_lahir: string | null
  tanggal_lahir: string | null
  jenis_kelamin: string | null
  asal_sekolah: string | null
  status: string | null
  nomor_pendaftaran: string | null
  updated_at: string
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

type ActivityNote = {
  activity_id: string
  tanggal: string
  catatan: string
}

type ActivityPhoto = {
  id: string
  activity_id: string
  file_path: string
  nama_file: string
  caption: string | null
}

type ActivityAttendance = {
  activity_id: string
  status: "HADIR" | "IZIN" | "SAKIT" | "ALPHA"
}

type MenuItem = {
  href: string
  title: string
  subtitle: string
  icon: ReactNode
  tone: "blue" | "cyan" | "indigo" | "navy"
  eyebrow?: string
  badge?: string
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

const menuItems: MenuItem[] = [
  {
    href: "/walisantri/aktivitas",
    title: "Daily Activity",
    subtitle: "Explore the complete daily routine.",
    eyebrow: "Student Life",
    icon: <ActivityIcon />,
    tone: "blue",
  },
  {
    href: "/walisantri/kehadiran",
    title: "Attendance",
    subtitle: "Review attendance and participation.",
    eyebrow: "Student Care",
    icon: <AttendanceIcon />,
    tone: "cyan",
  },
  {
    href: "/walisantri/akademik",
    title: "Academic",
    subtitle: "Follow learning progress and results.",
    eyebrow: "Learning",
    icon: <AcademicIcon />,
    tone: "indigo",
  },
  {
    href: "/walisantri/tahfizh",
    title: "Tahfizh",
    subtitle: "Follow Qur'an memorization progress.",
    eyebrow: "Qur'anic Development",
    icon: <QuranIcon />,
    tone: "navy",
  },
  {
    href: "/walisantri/perizinan",
    title: "Permission",
    subtitle: "Submit and review student permission requests.",
    eyebrow: "Parent Service",
    icon: <PermissionIcon />,
    tone: "blue",
  },
  {
    href: "/walisantri/pembinaan",
    title: "Student Conduct",
    subtitle: "Review discipline, guidance, and character records.",
    eyebrow: "Character & Guidance",
    icon: <CharacterIcon />,
    tone: "indigo",
  },
  {
    href: "/walisantri/punishment",
    title: "Punishment / Discipline",
    subtitle: "Review discipline notes and follow-up information.",
    eyebrow: "Important Parent Update",
    badge: "IMPORTANT",
    icon: <DisciplineIcon />,
    tone: "indigo",
  },
  {
    href: "/walisantri/kalender",
    title: "School Calendar",
    subtitle: "View important academic and boarding events.",
    eyebrow: "School Information",
    icon: <CalendarIcon />,
    tone: "cyan",
  },
  {
    href: "/walisantri/tagihan",
    title: "School Billing",
    subtitle: "Review invoices, payment status, and due dates.",
    eyebrow: "Finance",
    icon: <BillingIcon />,
    tone: "navy",
  },
  {
    href: "/walisantri/infaq",
    title: "Infaq & Contributions",
    subtitle: "View and manage voluntary contributions to the school.",
    eyebrow: "Support the School",
    icon: <InfaqIcon />,
    tone: "blue",
  },
  {
    href: "/walisantri/pengumuman",
    title: "Announcements",
    subtitle: "Stay updated with important school information.",
    eyebrow: "Communication",
    icon: <AnnouncementIcon />,
    tone: "cyan",
  },
]

export default function WalisantriPage() {
  const [profile, setProfile] = useState<Application | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [attendance, setAttendance] = useState<ActivityAttendance[]>([])
  const [notes, setNotes] = useState<ActivityNote[]>([])
  const [photos, setPhotos] = useState<ActivityPhoto[]>([])

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState("")
  const [clockTick, setClockTick] = useState(0)

  const today = useMemo(() => formatInputDate(new Date()), [])
  const todayDay = useMemo(() => getIndonesianDay(today), [today])
  const todayDateLabel = useMemo(() => formatLongDate(today), [today])

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
          .select(
            "id,user_id,nama_lengkap,nisn,tempat_lahir,tanggal_lahir,jenis_kelamin,asal_sekolah,status,nomor_pendaftaran,updated_at"
          )
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
          setAttendance([])
          setNotes([])
          setPhotos([])
          return
        }

        setProfile(profileData)

        const { data: activityData, error: activityError } = await supabase
          .from("daily_activities")
          .select(
            "id,nama_kegiatan,kategori,hari,waktu_mulai,waktu_selesai,deskripsi"
          )
          .eq("hari", todayDay)
          .eq("aktif", true)

        if (activityError) {
          throw new Error(
            `Unable to load today's schedule: ${activityError.message}`
          )
        }

        const sortedActivities = [...((activityData || []) as Activity[])].sort(
          compareActivityTime
        )

        setActivities(sortedActivities)

        if (!sortedActivities.length) {
          setAttendance([])
          setNotes([])
          setPhotos([])
          return
        }

        const activityIds = sortedActivities.map((item) => item.id)

        const [
          { data: attendanceData, error: attendanceError },
          { data: noteData, error: noteError },
          { data: photoData, error: photoError },
        ] = await Promise.all([
          supabase
            .from("activity_attendance")
            .select("activity_id,status")
            .eq("ppdb_id", profileData.id)
            .eq("tanggal", today)
            .in("activity_id", activityIds),

          supabase
            .from("activity_notes")
            .select("activity_id,tanggal,catatan")
            .eq("tanggal", today)
            .in("activity_id", activityIds),

          supabase
            .from("activity_photos")
            .select("id,activity_id,file_path,nama_file,caption")
            .eq("tanggal", today)
            .in("activity_id", activityIds)
            .order("created_at", { ascending: true }),
        ])

        if (attendanceError) {
          throw new Error(
            `Unable to load today's attendance: ${attendanceError.message}`
          )
        }

        if (noteError) {
          throw new Error(
            `Unable to load today's activity notes: ${noteError.message}`
          )
        }

        if (photoError) {
          throw new Error(
            `Unable to load today's activity photos: ${photoError.message}`
          )
        }

        setAttendance((attendanceData || []) as ActivityAttendance[])
        setNotes((noteData || []) as ActivityNote[])
        setPhotos((photoData || []) as ActivityPhoto[])
      } catch (err) {
        console.error("ERROR WALISANTRI DASHBOARD:", err)

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load the student dashboard."
        )
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [today, todayDay]
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

  const currentActivity = useMemo(
    () => getCurrentActivity(activities),
    [activities, clockTick]
  )

  const currentIndex = useMemo(
    () => getCurrentActivityIndex(activities),
    [activities, clockTick]
  )

  const nextActivities = useMemo(() => {
    if (!activities.length) return []

    const now = getMinutesNow()
    return activities
      .filter((activity) => {
        const start = getMinutes(activity.waktu_mulai)
        const end = getMinutes(activity.waktu_selesai)

        if (end < start) return false
        return start > now
      })
      .slice(0, 3)
  }, [activities, clockTick])

  const latestNote = useMemo(() => {
    if (!notes.length) return null

    const activityMap = new Map(
      activities.map((activity) => [activity.id, activity])
    )

    const note = [...notes].reverse().find((item) => {
      return activityMap.has(item.activity_id)
    })

    if (!note) return null

    return {
      note,
      activity: activityMap.get(note.activity_id)!,
    }
  }, [activities, notes])

  const latestPhoto = useMemo(() => {
    if (!photos.length) return null

    const activityMap = new Map(
      activities.map((activity) => [activity.id, activity])
    )

    for (let index = photos.length - 1; index >= 0; index -= 1) {
      const activity = activityMap.get(photos[index].activity_id)
      if (activity) {
        return {
          photo: photos[index],
          activity,
        }
      }
    }

    return null
  }, [activities, photos])

  const attendanceToday = useMemo(() => {
    const present = attendance.filter((item) => item.status === "HADIR").length
    const recorded = attendance.length
    const total = activities.length

    return {
      present,
      recorded,
      total,
      percentage:
        total > 0 && recorded > 0
          ? Math.round((present / total) * 100)
          : null,
    }
  }, [activities.length, attendance])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()

    if (hour < 11) return "Assalamualaikum Abah/Umah"
    if (hour < 15) return "Assalamualaikum Abah/Umah"
    return "Assalamualaikum Abah/Umah"
  }, [clockTick])

  if (loading) return <LoadingScreen />

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#f8fafc] text-[#10233f]">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_48%,#f2f7fc_100%)]" />
        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-blue-200/20 blur-3xl apple-orb-one" />
        <div className="absolute right-[-7rem] top-32 h-96 w-96 rounded-full bg-cyan-200/15 blur-3xl apple-orb-two" />
        <div className="absolute left-[38%] top-[44%] h-64 w-64 rounded-full bg-sky-100/25 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(rgba(36,94,168,0.10)_0.6px,transparent_0.6px)] [background-size:18px_18px]" />
      </div>

      <header
        className={`relative z-30 px-4 pt-4 sm:px-7 sm:pt-5 transition-all duration-1000 ease-out ${
          visible ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-[1480px]">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/88 px-4 py-3 shadow-[0_12px_34px_rgba(15,39,74,0.05)] backdrop-blur-2xl sm:px-5">
            <Link href="/" className="group flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:shadow-md">
                <Image
                  src="/logo-imam.png"
                  alt="Imam Nawawi Islamic Boarding School"
                  width={44}
                  height={44}
                  priority
                  className="h-8 w-8 object-contain"
                />
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
                className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black text-[#697787] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:scale-95 disabled:cursor-wait disabled:opacity-60"
              >
                <RefreshIcon spinning={refreshing} />
                <span className="hidden sm:inline">
                  {refreshing ? "Refreshing..." : "Refresh"}
                </span>
              </button>

              <div className="flex items-center gap-2 rounded-full border border-blue-100 bg-[#f3f8fd] px-3 py-2 ring-1 ring-blue-100 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
                </span>
                <span className="hidden text-[10px] font-black uppercase tracking-wider text-blue-700 sm:inline">
                  Connected
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex max-w-[1480px] gap-7 px-3 pb-14 pt-5 sm:px-5 lg:px-7">
        <aside className="hidden w-[236px] shrink-0 lg:block">
          <div className="sticky top-5 overflow-hidden rounded-[1.8rem] border border-slate-200/80 bg-white/94 shadow-[0_18px_48px_rgba(15,39,74,0.06)] backdrop-blur-2xl">
            <div className="border-b border-slate-100 p-5">
              <Link href="/" className="group flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105">
                  <Image src="/logo-imam.png" alt="Imam Nawawi Islamic Boarding School" width={48} height={48} priority className="h-9 w-9 object-contain" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.20em] text-[#b58a2f]">INIBS SMART DIGITAL</p>
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
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[11px] font-black transition-all duration-300 ${
                      href === "/walisantri"
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
                  <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[#8a9aac]">Wali Santri</p>
                  <p className="truncate text-xs font-black text-[#071a36]">Parent Account</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 max-w-[1160px]">
        <div className="mobile-nav-rail mb-5 overflow-x-auto rounded-2xl border border-white/90 bg-white/92 p-2 shadow-[0_12px_34px_rgba(7,26,54,0.06)] backdrop-blur-xl lg:hidden">
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
                className="rounded-xl border border-slate-100 bg-white px-3 py-2 text-[9px] font-black text-[#52677e] shadow-sm transition-all duration-300 hover:border-blue-100 hover:bg-[#f4f9fd] hover:text-[#174f91]"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 shadow-sm">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-100 text-sm font-black text-red-700">
              !
            </div>
            <div>
              <p className="text-sm font-black text-red-800">
                Some information could not be loaded
              </p>
              <p className="mt-1 text-xs leading-5 text-red-700">{error}</p>
            </div>
          </div>
        )}

        {!profile ? (
          <EmptyState />
        ) : (
          <>
            {/* HERO */}
      {/* Required public asset: /public/background-inibs.jpg */}
            <section
              className={`relative overflow-hidden rounded-[2.4rem] border border-slate-200/80 bg-white shadow-[0_24px_70px_rgba(15,39,74,0.08)] ${
                visible ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"
              } transition-all duration-1000`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_26%,rgba(96,165,250,0.12),transparent_25%),radial-gradient(circle_at_65%_82%,rgba(103,232,249,0.09),transparent_28%)]" />

              <div className="relative z-10 grid min-h-[470px] gap-8 p-7 sm:p-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:p-12">
                <div className="max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-[#f7fbff] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-[#245ea8]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#2675bd] animate-pulse" />
                      INIBS SMART DIGITAL
                    </span>
                    <span className="rounded-full border border-amber-100 bg-[#fffaf0] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-[#a67a24]">
                      Parent Portal
                    </span>
                  </div>

                  <p className="mt-7 text-sm font-semibold text-[#728399]">
                    {greeting},
                  </p>

                  <h1 className="mt-2 max-w-2xl bg-gradient-to-r from-[#0b2f63] via-[#174f91] to-[#2f77bd] bg-clip-text text-5xl font-black tracking-[-0.035em] text-transparent sm:text-7xl">
                    {profile.nama_lengkap || "Student"}
                  </h1>

                  <p className="mt-5 max-w-xl text-sm leading-7 text-[#607389] sm:text-base">
                    A clear, calm view of your child&apos;s day, participation,
                    progress, and latest school updates.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.13em] text-[#6b7e94] shadow-sm">
                      {todayDateLabel}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50/70 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.13em] text-[#318268]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#3ca17d]" />
                      Live Parent View
                    </span>
                  </div>
                </div>

                <div className="relative min-h-[320px] lg:min-h-[390px]">
                  <div className="absolute inset-2 overflow-hidden rounded-[2rem] border border-slate-200/70 bg-gradient-to-br from-[#eff6ff] via-white to-[#ecfeff] shadow-[0_22px_60px_rgba(15,39,74,0.07)]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.95),transparent_35%),radial-gradient(circle_at_80%_72%,rgba(125,211,252,0.15),transparent_30%)]" />
                    <div className="absolute -left-16 -top-14 h-48 w-48 rounded-full bg-blue-200/15 blur-3xl apple-orb-one" />
                    <div className="absolute right-[-4rem] bottom-[-3rem] h-52 w-52 rounded-full bg-cyan-200/15 blur-3xl apple-orb-two" />

                    <div className="relative z-10 flex h-full items-center justify-center p-6">
                      <div className="w-full max-w-[300px] rounded-[1.8rem] border border-white/90 bg-white/86 p-5 shadow-[0_18px_45px_rgba(15,39,74,0.10)] backdrop-blur-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#7b8ca0]">
                              Current Activity
                            </p>
                            <p className="mt-1 text-lg font-black text-[#071a36]">
                              {currentActivity?.nama_kegiatan || "No active session"}
                            </p>
                          </div>
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf5fc] text-[#245ea8] ring-1 ring-blue-100">
                            <ClockIcon />
                          </div>
                        </div>

                        <div className="mt-5 rounded-2xl bg-[#f7fbff] px-4 py-3.5">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[10px] font-bold text-[#64788f]">
                              {currentActivity
                                ? `${formatTime(currentActivity.waktu_mulai)} - ${formatTime(currentActivity.waktu_selesai)}`
                                : "See the next activity below"}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase text-[#318268]">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#3ca17d]" />
                              Live
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-slate-100 bg-white px-3.5 py-3">
                            <p className="text-[8px] font-black uppercase tracking-[0.12em] text-[#8b9aad]">Today</p>
                            <p className="mt-1 text-sm font-black text-[#173d68]">{activities.length}</p>
                            <p className="text-[9px] text-[#8191a2]">activities</p>
                          </div>
                          <div className="rounded-2xl border border-slate-100 bg-white px-3.5 py-3">
                            <p className="text-[8px] font-black uppercase tracking-[0.12em] text-[#8b9aad]">Attendance</p>
                            <p className="mt-1 text-sm font-black text-[#173d68]">
                              {attendanceToday.percentage !== null ? `${attendanceToday.percentage}%` : "—"}
                            </p>
                            <p className="text-[9px] text-[#8191a2]">today</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -bottom-1 right-0 hidden rounded-[1.4rem] border border-white/90 bg-white/92 px-4 py-3 shadow-[0_16px_38px_rgba(15,39,74,0.08)] backdrop-blur-xl sm:block">
                    <p className="text-[8px] font-black uppercase tracking-[0.15em] text-[#b18a31]">
                      Family Connection
                    </p>
                    <p className="mt-1 text-[10px] font-bold text-[#4b6076]">
                      One portal, one view
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-5">
              <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/90 bg-white/82 px-4 py-3 shadow-[0_12px_34px_rgba(7,26,54,0.05)] backdrop-blur-xl">
                  <p className="text-[8px] font-black uppercase tracking-[0.15em] text-[#7b8a9b]">
                    Parent Control Center
                  </p>
                  <p className="mt-1 text-sm font-black text-[#071a36]">Monitor with clarity</p>
                </div>
                <div className="rounded-2xl border border-white/90 bg-white/82 px-4 py-3 shadow-[0_12px_34px_rgba(7,26,54,0.05)] backdrop-blur-xl">
                  <p className="text-[8px] font-black uppercase tracking-[0.15em] text-[#7b8a9b]">
                    Daily Visibility
                  </p>
                  <p className="mt-1 text-sm font-black text-[#071a36]">Stay connected every day</p>
                </div>
                <div className="rounded-2xl border border-white/90 bg-white/82 px-4 py-3 shadow-[0_12px_34px_rgba(7,26,54,0.05)] backdrop-blur-xl">
                  <p className="text-[8px] font-black uppercase tracking-[0.15em] text-[#7b8a9b]">
                    Family Connection
                  </p>
                  <p className="mt-1 text-sm font-black text-[#071a36]">One portal, one view</p>
                </div>
              </div>
            </section>

            {/* TODAY AT A GLANCE */}
            <section
              className={`inibs-reveal mt-6 transition-all delay-100 duration-1000 ${
                visible ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"
              }`}
            >
              <div className="inibs-panel rounded-[2rem] border border-white/95 bg-white/96 p-6 shadow-[0_18px_48px_rgba(7,26,54,0.06)] backdrop-blur-xl sm:p-7">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#245ea8]">
                    Today at a Glance
                  </p>
                  <h2 className="mt-1 text-xl font-black text-[#071a36]">
                    A quick view of student life
                  </h2>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <GlanceCard
                    icon={<ClockIcon />}
                    label="Current"
                    value={
                      currentActivity
                        ? currentActivity.nama_kegiatan
                        : "No active session"
                    }
                    text={
                      currentActivity
                        ? `${formatTime(currentActivity.waktu_mulai)} - ${formatTime(
                            currentActivity.waktu_selesai
                          )}`
                        : "See the next activity below"
                    }
                    tone="blue"
                  />

                  <GlanceCard
                    icon={<CalendarIcon />}
                    label="Today"
                    value={`${activities.length} activities`}
                    text="Scheduled in today's routine"
                    tone="cyan"
                  />

                  <GlanceCard
                    icon={<AttendanceIcon />}
                    label="Participation"
                    value={
                      attendanceToday.percentage !== null
                        ? `${attendanceToday.percentage}%`
                        : "Pending"
                    }
                    text={
                      attendanceToday.recorded
                        ? `${attendanceToday.recorded}/${attendanceToday.total} recorded`
                        : "Attendance not recorded yet"
                    }
                    tone="indigo"
                  />

                  <GlanceCard
                    icon={<PhotoIcon />}
                    label="Latest Update"
                    value={
                      latestPhoto
                        ? "Activity photo"
                        : latestNote
                          ? "Teacher observation"
                          : "No update yet"
                    }
                    text={
                      latestPhoto?.activity.nama_kegiatan ||
                      latestNote?.activity.nama_kegiatan ||
                      "New updates will appear here"
                    }
                    tone="navy"
                  />
                </div>
              </div>
            </section>

            {/* LATEST UPDATE + NEXT ACTIVITIES */}
            <section
              className={`mt-6 grid gap-6 lg:grid-cols-[1.15fr_.85fr] transition-all delay-200 duration-1000 ${
                visible ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"
              }`}
            >
              <div className="inibs-panel rounded-[2rem] border border-white/95 bg-white/96 p-6 shadow-[0_18px_48px_rgba(7,26,54,0.06)] backdrop-blur-xl sm:p-7">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#245ea8]">
                      Latest Update
                    </p>
                    <h2 className="mt-1 text-xl font-black text-[#071a36]">
                      A moment from today
                    </h2>
                  </div>

                  <Link
                    href="/walisantri/aktivitas"
                    className="hidden text-[9px] font-black uppercase tracking-wider text-blue-700 transition-colors hover:text-blue-900 sm:block"
                  >
                    View all
                  </Link>
                </div>

                <div className="mt-5">
                  {latestPhoto ? (
                    <div className="overflow-hidden rounded-[1.5rem] border border-slate-100 bg-slate-50">
                      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                        <img
                          src={getPublicPhotoUrl(latestPhoto.photo.file_path)}
                          alt={
                            latestPhoto.photo.caption ||
                            latestPhoto.photo.nama_file
                          }
                          className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#061a36]/80 to-transparent p-5 pt-12">
                          <p className="text-[9px] font-black uppercase tracking-wider text-[#217d9f]">
                            {latestPhoto.activity.nama_kegiatan}
                          </p>
                          <p className="mt-1 text-sm font-black text-[#071a36]">
                            Activity documentation
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 px-4 py-3">
                        <p className="truncate text-[10px] font-semibold text-[#697787]">
                          {latestPhoto.photo.caption ||
                            latestPhoto.photo.nama_file}
                        </p>
                        <Link
                          href="/walisantri/aktivitas"
                          className="shrink-0 text-[9px] font-black text-blue-700 hover:text-blue-900"
                        >
                          Open →
                        </Link>
                      </div>
                    </div>
                  ) : latestNote ? (
                    <div className="rounded-[1.5rem] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm ring-1 ring-blue-100">
                          <NoteIcon />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[9px] font-black uppercase tracking-wider text-blue-600">
                            {latestNote.activity.nama_kegiatan}
                          </p>
                          <p className="mt-3 text-sm leading-7 text-slate-600">
                            “{latestNote.note.catatan}”
                          </p>
                          <Link
                            href="/walisantri/aktivitas"
                            className="mt-4 inline-flex text-[9px] font-black uppercase tracking-wider text-blue-700"
                          >
                            View daily activity →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#7b8a9b] shadow-sm ring-1 ring-slate-100">
                        <PhotoIcon />
                      </div>
                      <h3 className="mt-4 text-sm font-black text-slate-600">
                        No update yet
                      </h3>
                      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#7b8a9b]">
                        Photos and teacher observations will appear here as the
                        day progresses.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="inibs-panel rounded-[2rem] border border-white/95 bg-white/96 p-6 shadow-[0_18px_48px_rgba(7,26,54,0.06)] backdrop-blur-xl sm:p-7">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#245ea8]">
                    Coming Up
                  </p>
                  <h2 className="mt-1 text-xl font-black text-[#071a36]">
                    Next activities
                  </h2>
                </div>

                <div className="mt-5 space-y-3">
                  {nextActivities.length ? (
                    nextActivities.map((activity, index) => (
                      <NextActivity
                        key={activity.id}
                        activity={activity}
                        primary={index === 0 && currentIndex === -1}
                      />
                    ))
                  ) : (
                    <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#7b8a9b] shadow-sm ring-1 ring-slate-100">
                        <CheckIcon />
                      </div>
                      <h3 className="mt-4 text-sm font-black text-slate-600">
                        No more scheduled activities
                      </h3>
                      <p className="mt-1 text-xs text-[#7b8a9b]">
                        The schedule for today is complete.
                      </p>
                    </div>
                  )}
                </div>

                <Link
                  href="/walisantri/aktivitas"
                  className="group mt-5 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition-all duration-300 hover:border-blue-100 hover:bg-blue-50"
                >
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#697787] group-hover:text-blue-700">
                    Open complete schedule
                  </span>
                  <span className="text-slate-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-blue-700">
                    <ArrowIcon />
                  </span>
                </Link>
              </div>
            </section>

            {/* STUDENT SNAPSHOT */}
            <section
              className={`inibs-reveal mt-6 transition-all delay-300 duration-1000 ${
                visible ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"
              }`}
            >
              <div className="inibs-panel rounded-[2rem] border border-white/95 bg-white/96 p-6 shadow-[0_18px_48px_rgba(7,26,54,0.06)] backdrop-blur-xl sm:p-7">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#245ea8]">
                      Student Profile
                    </p>
                    <h2 className="mt-1 text-xl font-black text-[#071a36]">
                      Student Snapshot
                    </h2>
                  </div>

                  <p className="text-[10px] font-semibold text-[#7b8a9b]">
                    Updated from INIBS records
                  </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Snapshot
                    icon={<UserIcon />}
                    label="Student"
                    value={profile.nama_lengkap}
                  />
                  <Snapshot
                    icon={<SchoolIcon />}
                    label="School"
                    value={profile.asal_sekolah}
                  />
                  <Snapshot
                    icon={<AcademicIcon />}
                    label="Gender"
                    value={profile.jenis_kelamin}
                  />
                  <Snapshot
                    icon={<CalendarIcon />}
                    label="Date of Birth"
                    value={
                      profile.tanggal_lahir
                        ? formatDate(profile.tanggal_lahir)
                        : null
                    }
                  />
                </div>
              </div>
            </section>

            <section className="mt-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Daily Life", text: "Aktivitas & jadwal", href: "/walisantri/aktivitas", icon: <ActivityIcon /> },
                  { label: "Student Care", text: "Kehadiran & pembinaan", href: "/walisantri/kehadiran", icon: <AttendanceIcon /> },
                  { label: "Family Service", text: "Izin & komunikasi", href: "/walisantri/perizinan", icon: <PermissionIcon /> },
                  { label: "Finance", text: "Tagihan & infaq", href: "/walisantri/tagihan", icon: <BillingIcon /> },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center gap-3 rounded-2xl border border-white/90 bg-white/92 p-4 shadow-[0_12px_34px_rgba(7,26,54,0.05)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-[0_18px_44px_rgba(7,26,54,0.08)]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf5fc] text-[#245ea8] ring-1 ring-blue-100 transition-transform duration-300 group-hover:scale-105">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#245ea8]">
                        {item.label}
                      </p>
                      <p className="mt-1 text-xs font-bold text-[#344b63]">
                        {item.text}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* SERVICES */}
            <section
              className={`mt-6 transition-all delay-400 duration-1000 ${
                visible ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"
              }`}
            >
              <div className="inibs-panel rounded-[2rem] border border-white/95 bg-white/96 p-6 shadow-[0_18px_48px_rgba(7,26,54,0.06)] backdrop-blur-xl sm:p-7">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#245ea8]">
                    Parent Services
                  </p>
                  <h2 className="mt-1 text-xl font-black text-[#071a36]">
                    Everything You Need as a Parent
                  </h2>
                  <p className="mt-1 text-[10px] font-semibold text-[#7b8a9b]">
                    Satu portal untuk memantau seluruh perjalanan santri.
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#7b8a9b]">
                    Monitor student life, important updates, permissions, discipline, finance, and school information from one portal.
                  </p>
                </div>

                <div className="mb-6 rounded-[1.5rem] border border-blue-100 bg-[#f7fbff] p-4 shadow-sm sm:p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#245ea8] ring-1 ring-blue-100 shadow-sm">
                        <AnnouncementIcon />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#245ea8]">
                          Important Parent Updates
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[#697787]">
                          Pusat informasi wali untuk mengikuti kabar, pembinaan, perizinan, keuangan, infaq, dan perkembangan santri.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link href="/walisantri/pengumuman" className="group inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-white px-3 py-2 text-[9px] font-black text-[#245ea8] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                        Announcements
                        <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                      </Link>
                      <Link href="/walisantri/punishment" className="group inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-[9px] font-black text-amber-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                        Discipline
                        <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                      </Link>
                      <Link href="/walisantri/perizinan" className="group inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-white px-3 py-2 text-[9px] font-black text-[#245ea8] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                        Permission
                        <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {menuItems.map((item) => (
                    <ServiceCard key={item.href} item={item} />
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        </div>

        <footer
          className={`mt-9 text-center transition-all delay-500 duration-1000 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
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

/* ---------- COMPONENTS ---------- */

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


function GlanceCard({
  icon,
  label,
  value,
  text,
  tone,
}: {
  icon: ReactNode
  label: string
  value: string
  text: string
  tone: "blue" | "cyan" | "indigo" | "navy"
}) {
  const styles = getTone(tone)

  return (
    <div className="group inibs-card-shine rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-blue-100 hover:shadow-[0_20px_48px_rgba(7,26,54,0.08)]">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-110 ${styles.iconBg} ${styles.iconText}`}
      >
        {icon}
      </div>

      <p className={`mt-4 text-[9px] font-black uppercase tracking-[0.17em] ${styles.label}`}>
        {label}
      </p>
      <p className="mt-1 line-clamp-2 text-sm font-black text-[#071a36]">
        {value}
      </p>
      <p className="mt-1 text-[10px] leading-5 text-[#7b8a9b]">{text}</p>
    </div>
  )
}

function NextActivity({
  activity,
  primary,
}: {
  activity: Activity
  primary: boolean
}) {
  return (
    <div
      className={`group rounded-[1.45rem] border p-4 transition-all duration-300 ${
        primary
          ? "border-blue-200 bg-blue-50/70 shadow-md shadow-blue-100/50"
          : "border-slate-100 bg-slate-50/70 hover:-translate-y-0.5 hover:border-blue-100 hover:bg-white hover:shadow-md"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-[72px] shrink-0 text-center">
          <p className="text-sm font-black text-[#071a36]">
            {formatTime(activity.waktu_mulai)}
          </p>
          <p className="mt-0.5 text-[9px] font-semibold text-[#7b8a9b]">
            {formatTime(activity.waktu_selesai)}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${getTone("blue").iconBg} ${getTone("blue").iconText}`}
        >
          <ClockIcon />
        </div>

        <div className="min-w-0">
          {primary && (
            <p className="text-[8px] font-black uppercase tracking-wider text-blue-700">
              Next
            </p>
          )}
          <p className="truncate text-sm font-black text-slate-700">
            {activity.nama_kegiatan}
          </p>
          <p className="mt-0.5 truncate text-[10px] text-[#7b8a9b]">
            {activity.deskripsi || activity.kategori}
          </p>
        </div>
      </div>
    </div>
  )
}

function Snapshot({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string | null
}) {
  return (
    <div className="group rounded-2xl border border-slate-100 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-100 hover:bg-white hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100 transition-transform duration-300 group-hover:scale-105">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-wider text-[#7b8a9b]">
            {label}
          </p>
          <p className="mt-1 truncate text-xs font-black text-slate-700">
            {value || "-"}
          </p>
        </div>
      </div>
    </div>
  )
}

function ServiceCard({ item }: { item: MenuItem }) {
  const tone = getTone(item.tone)

  return (
    <Link
      href={item.href}
      className="group combined-card-shine relative overflow-hidden rounded-[1.6rem] border border-slate-100 bg-gradient-to-br from-white to-slate-50/80 p-5 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r transition-transform duration-500 group-hover:scale-x-100 ${tone.gradient}`}
      />

      <div
        className={`absolute -right-12 -top-12 h-36 w-36 rounded-full blur-2xl transition-transform duration-700 group-hover:scale-150 ${tone.glow}`}
      />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ring-1 shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-2 ${tone.iconBg} ${tone.iconText}`}
        >
          {item.icon}
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-300 shadow-sm transition-all duration-300 group-hover:translate-x-1 group-hover:text-blue-700">
          <ArrowIcon />
        </div>
      </div>

      <div className="relative z-10 mt-5">
        <div className="flex flex-wrap items-center gap-2">
          <p className={`text-[9px] font-black uppercase tracking-[0.17em] ${tone.label}`}>
            {item.eyebrow || "INIBS SERVICE"}
          </p>
          {item.badge ? (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[8px] font-black uppercase tracking-[0.10em] text-amber-700">
              {item.badge}
            </span>
          ) : null}
        </div>

        <h3 className="mt-2 text-lg font-black text-[#071a36] sm:text-xl">
          {item.title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-[#697787]">
          {item.subtitle}
        </p>

        <div
          className={`mt-5 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] ${tone.label}`}
        >
          Open service
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            <ArrowIcon />
          </span>
        </div>
      </div>
    </Link>
  )
}

/* ---------- DATA / HELPERS ---------- */

function getCurrentActivity(activities: Activity[]) {
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

function getCurrentActivityIndex(activities: Activity[]) {
  const current = getCurrentActivity(activities)
  if (!current) return -1

  return activities.findIndex((activity) => activity.id === current.id)
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

function getTone(tone: MenuItem["tone"]) {
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

function getPublicPhotoUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/santri-activities/${path}`
}

function getIndonesianDay(value: string) {
  const date = new Date(`${value}T12:00:00`)
  return ["AHAD", "SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"][
    date.getDay()
  ]
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

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
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
          Preparing Parent Portal...
        </p>
        <p className="mt-1 text-xs text-[#7b8a9b]">
          Loading today&apos;s overview
        </p>
      </div>

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        .inibs-reveal {
          animation: inibsDashboardReveal 750ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .inibs-panel {
          transition:
            transform 600ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 600ms cubic-bezier(0.22, 1, 0.36, 1),
            border-color 450ms ease;
        }

        .inibs-panel:hover {
          transform: translateY(-3px);
          box-shadow: 0 26px 64px rgba(7,26,54,0.085);
        }

        .inibs-card-shine {
          position: relative;
          overflow: hidden;
        }

        .inibs-card-shine::after {
          content: "";
          position: absolute;
          top: -20%;
          bottom: -20%;
          left: -58%;
          width: 34%;
          transform: skewX(-18deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.30),
            transparent
          );
          transition: left 1s cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
        }

        .inibs-card-shine:hover::after {
          left: 140%;
        }

        @keyframes inibsDashboardReveal {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
              .combined-card-shine {
          position: relative;
          overflow: hidden;
        }

        .combined-card-shine::after {
          content: "";
          position: absolute;
          top: -20%;
          bottom: -20%;
          left: -58%;
          width: 34%;
          transform: skewX(-18deg);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent);
          transition: left 1s cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
        }

        .combined-card-shine:hover::after {
          left: 140%;
        }


        .academic-grid {
          background-image:
            linear-gradient(rgba(36,94,168,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(36,94,168,0.035) 1px, transparent 1px);
          background-size: 38px 38px;
        }

        .edu-orbit-slow {
          animation: orbitSlow 10s ease-in-out infinite;
        }

        .edu-orbit-reverse {
          animation: orbitReverse 8s ease-in-out infinite;
        }

        .edu-float-soft {
          animation: floatSoft 6s ease-in-out infinite;
        }

        @keyframes orbitSlow {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(10px, -12px, 0) rotate(6deg); }
        }

        @keyframes orbitReverse {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(-8px, 9px, 0) rotate(-5deg); }
        }

        @keyframes floatSoft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .edu-hero-orb {
          animation: eduHeroOrb 9s ease-in-out infinite;
        }

        .edu-hero-orb-reverse {
          animation: eduHeroOrbReverse 11s ease-in-out infinite;
        }

        @keyframes eduHeroOrb {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-10px, 12px, 0) scale(1.06); }
        }

        @keyframes eduHeroOrbReverse {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(12px, -8px, 0) scale(1.05); }
        }


        .bright-dashboard-hero {
          isolation: isolate;
        }

        .bright-dashboard-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 15% 85%, rgba(36,94,168,0.10), transparent 25%),
            radial-gradient(circle at 88% 12%, rgba(34,211,238,0.10), transparent 23%);
          pointer-events: none;
          z-index: 1;
        }

        .premium-scanline {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          opacity: 0.18;
        }

        .premium-scanline::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: -18%;
          width: 12%;
          transform: skewX(-16deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.9),
            transparent
          );
          animation: premiumScan 8s ease-in-out infinite;
        }

        .gold-accent {
          color: #b58a2f;
        }

        @keyframes premiumScan {
          0%, 58% { left: -18%; opacity: 0; }
          64% { opacity: 1; }
          78% { left: 118%; opacity: 1; }
          80%, 100% { left: 118%; opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .premium-scanline::after {
            animation: none !important;
          }
        }


        .sidebar-nav-rail {
          background:
            radial-gradient(circle at 10% 0%, rgba(37,99,235,0.05), transparent 28%),
            linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
        }

        .mobile-nav-rail {
          scrollbar-width: none;
        }

        .mobile-nav-rail::-webkit-scrollbar {
          display: none;
        }

        @keyframes campusDrift {
          0%, 100% { transform: scale(1) translate3d(0,0,0); }
          50% { transform: scale(1.018) translate3d(-4px,-2px,0); }
        }

        .campus-drift { animation: campusDrift 16s ease-in-out infinite; transform-origin: center; }\n\n
        .apple-orb-one {
          animation: appleOrbOne 12s ease-in-out infinite;
        }

        .apple-orb-two {
          animation: appleOrbTwo 14s ease-in-out infinite;
        }

        @keyframes appleOrbOne {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(10px, -8px, 0) scale(1.06); }
        }

        @keyframes appleOrbTwo {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-9px, 8px, 0) scale(1.05); }
        }

`}</style>

    </main>
  )
}

function EmptyState() {
  return (
    <section className="rounded-[2rem] border border-white/90 bg-white/90 p-10 text-center shadow-xl backdrop-blur-xl sm:p-14">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        <DocumentIcon />
      </div>

      <h1 className="mt-5 text-xl font-black text-[#071a36]">
        Student Profile Not Found
      </h1>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#697787]">
        This account does not have a connected student profile.
      </p>

      <Link
        href="/"
        className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-xs font-black text-[#071a36] shadow-lg transition-all hover:-translate-y-0.5 hover:bg-blue-800 active:scale-95"
      >
        Back to Home
        <ArrowIcon />
      </Link>
    </section>
  )
}

/* ---------- ICONS ---------- */

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

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h13" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m13 6 6 6-6 6" />
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

function SchoolIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 10 8-5 8 5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 10v8M10 10v8M14 10v8M18 10v8" />
      <path strokeLinecap="round" d="M4 18h16M3 21h18" />
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

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <rect x="4" y="4" width="6" height="6" rx="1.2" />
      <rect x="14" y="4" width="6" height="6" rx="1.2" />
      <rect x="4" y="14" width="6" height="6" rx="1.2" />
      <rect x="14" y="14" width="6" height="6" rx="1.2" />
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

function AcademicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 4 8 4-8 4-8-4 8-4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 10v5c2.5 2 9.5 2 12 0v-5" />
      <path strokeLinecap="round" d="M20 8v7" />
    </svg>
  )
}

function QuranIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 4.5h9a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3V4.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 7.5a3 3 0 0 1 3 3V20h-3" />
      <path strokeLinecap="round" d="M8.5 8h5M8.5 11h5M8.5 14h4" />
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

function PhotoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 17 4-4 3 3 2-2 3 3" />
    </svg>
  )
}

function NoteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <rect x="5" y="4" width="14" height="16" rx="2" />
      <path strokeLinecap="round" d="M8 9h8M8 12h8M8 15h5" />
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

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path strokeLinecap="round" d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  )
}
