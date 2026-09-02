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

type Photo = {
  id: string
  activity_id: string
  tanggal: string
  file_path: string
  nama_file: string
  caption: string | null
}

type Application = {
  id: string
  nama_lengkap: string | null
  nomor_pendaftaran: string | null
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

const CATEGORY_CONFIG: Record<
  Category,
  {
    title: string
    subtitle: string
    icon: ReactNode
    accent: string
  }
> = {
  MORNING: {
    title: "Morning Routine",
    subtitle: "Pagi • Morning Activities",
    icon: <SunIcon />,
    accent: "blue",
  },
  SCHOOL: {
    title: "School",
    subtitle: "Pembelajaran Akademik",
    icon: <SchoolIcon />,
    accent: "indigo",
  },
  AFTERNOON: {
    title: "Afternoon",
    subtitle: "Siang • Recovery & Personal Time",
    icon: <CloudSunIcon />,
    accent: "cyan",
  },
  EXTRACURRICULAR: {
    title: "Afternoon & Extracurricular",
    subtitle: "Aktivitas Fisik & Pengembangan Diri",
    icon: <ActivityIcon />,
    accent: "blue",
  },
  EVENING: {
    title: "Evening Routine",
    subtitle: "Malam • Evening Activities",
    icon: <MoonIcon />,
    accent: "navy",
  },
}

export default function DailyActivityPage() {
  const [application, setApplication] = useState<Application | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedDate, setSelectedDate] = useState(formatInputDate(new Date()))
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState("")
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

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
          setPhotos([])
          return
        }

        setApplication(applicationData)

        const dayName = getIndonesianDay(selectedDate)

        const { data: activityData, error: activityError } = await supabase
          .from("daily_activities")
          .select(
            "id,nama_kegiatan,kategori,hari,waktu_mulai,waktu_selesai,deskripsi"
          )
          .eq("hari", dayName)
          .eq("aktif", true)
          .order("waktu_mulai", { ascending: true })

        if (activityError) {
          throw new Error(
            `Gagal mengambil agenda harian: ${activityError.message}`
          )
        }

        const nextActivities = (activityData || []) as Activity[]
        setActivities(nextActivities)

        if (nextActivities.length === 0) {
          setAttendance([])
          setPhotos([])
          return
        }

        const activityIds = nextActivities.map((item) => item.id)

        const [
          { data: attendanceData, error: attendanceError },
          { data: photoData, error: photoError },
        ] = await Promise.all([
          supabase
            .from("activity_attendance")
            .select("activity_id,ppdb_id,tanggal,status,catatan")
            .eq("ppdb_id", applicationData.id)
            .eq("tanggal", selectedDate)
            .in("activity_id", activityIds),

          supabase
            .from("activity_photos")
            .select("id,activity_id,tanggal,file_path,nama_file,caption")
            .eq("tanggal", selectedDate)
            .in("activity_id", activityIds)
            .order("created_at", { ascending: true }),
        ])

        if (attendanceError) {
          throw new Error(
            `Gagal mengambil kehadiran: ${attendanceError.message}`
          )
        }

        if (photoError) {
          throw new Error(
            `Gagal mengambil foto kegiatan: ${photoError.message}`
          )
        }

        setAttendance((attendanceData || []) as Attendance[])
        setPhotos((photoData || []) as Photo[])
      } catch (err) {
        console.error("ERROR DAILY ACTIVITY:", err)
        setError(
          err instanceof Error
            ? err.message
            : "Aktivitas harian gagal dimuat."
        )
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [selectedDate]
  )

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 80)
    void loadData()
    return () => window.clearTimeout(timer)
  }, [loadData])

  const grouped = useMemo(() => {
    const map = new Map<Category, Activity[]>()

    activities.forEach((activity) => {
      const existing = map.get(activity.kategori) || []
      existing.push(activity)
      map.set(activity.kategori, existing)
    })

    return Array.from(map.entries())
  }, [activities])

  const attendanceMap = useMemo(
    () => new Map(attendance.map((item) => [item.activity_id, item])),
    [attendance]
  )

  const photosMap = useMemo(() => {
    const map = new Map<string, Photo[]>()
    photos.forEach((photo) => {
      const existing = map.get(photo.activity_id) || []
      existing.push(photo)
      map.set(photo.activity_id, existing)
    })
    return map
  }, [photos])

  const summary = useMemo(() => {
    const total = activities.length
    const hadirs = attendance.filter((item) => item.status === "HADIR").length
    const izin = attendance.filter((item) => item.status === "IZIN").length
    const sakit = attendance.filter((item) => item.status === "SAKIT").length
    const alpha = attendance.filter((item) => item.status === "ALPHA").length
    const belum = Math.max(total - attendance.length, 0)

    return { total, hadirs, izin, sakit, alpha, belum }
  }, [activities.length, attendance])

  const formattedDate = useMemo(
    () => formatLongDate(selectedDate),
    [selectedDate]
  )

  if (loading) return <LoadingScreen />

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#edf4fb] text-slate-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_8%,rgba(37,99,235,0.11),transparent_30%),radial-gradient(circle_at_90%_16%,rgba(14,165,233,0.10),transparent_28%),linear-gradient(135deg,#f8fbff_0%,#edf4fb_55%,#e6eff8_100%)]" />
        <div className="absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-blue-300/15 blur-3xl" />
        <div className="absolute -right-40 top-20 h-[30rem] w-[30rem] rounded-full bg-cyan-200/15 blur-3xl" />
        <div className="absolute bottom-0 inset-x-0 h-80 bg-gradient-to-t from-[#061a36] via-[#061a36]/45 to-transparent" />
      </div>

      <header
        className={`relative z-20 px-4 pt-4 sm:px-7 sm:pt-6 transition-all duration-1000 ${
          visible ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between rounded-[1.5rem] border border-white/90 bg-white/80 px-4 py-3 shadow-xl shadow-blue-950/5 backdrop-blur-2xl sm:px-5">
            <div className="flex items-center gap-3">
              <Link
                href="/walisantri"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:-translate-x-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:scale-95"
              >
                <BackIcon />
              </Link>

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-blue-700">
                  INIBS SMART DIGITAL
                </p>
                <p className="mt-0.5 text-sm font-black text-[#071a36]">
                  Daily Student Activity
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={refreshing}
              onClick={() => void loadData(true)}
              className="group flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black text-slate-500 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-wait disabled:opacity-60"
            >
              <RefreshIcon spinning={refreshing} />
              <span className="hidden sm:inline">
                {refreshing ? "Refreshing..." : "Refresh"}
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-12 pt-7 sm:px-7 sm:pt-9">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 shadow-sm">
            <p className="font-black">Data belum dapat dimuat</p>
            <p className="mt-1 text-xs leading-5">{error}</p>
          </div>
        )}

        {!application ? (
          <EmptyState />
        ) : (
          <>
            <section
              className={`relative overflow-hidden rounded-[2.35rem] bg-gradient-to-br from-[#061a36] via-[#0b2f63] to-blue-700 p-6 text-white shadow-2xl shadow-blue-950/20 sm:p-8 transition-all duration-1000 ${
                visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/15 blur-3xl" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                    Student Daily Life
                  </span>
                </div>

                <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-100">
                      {formattedDate}
                    </p>
                    <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                      {application.nama_lengkap || "Santri"}
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
                      Pantau aktivitas harian santri dari pagi hingga malam
                      melalui satu timeline.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <SummaryPill label="Activities" value={summary.total} />
                    <SummaryPill label="Present" value={summary.hadirs} />
                    <SummaryPill label="Photos" value={photos.length} />
                  </div>
                </div>
              </div>
            </section>

            <section
              className={`mt-6 transition-all delay-100 duration-1000 ${
                visible ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"
              }`}
            >
              <div className="rounded-[1.8rem] border border-white/90 bg-white/90 p-4 shadow-xl shadow-blue-950/5 backdrop-blur-xl sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                      Date
                    </p>
                    <p className="mt-1 text-sm font-black text-[#071a36]">
                      Choose activity date
                    </p>
                  </div>

                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    className="h-11 cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-black text-slate-700 outline-none transition-all hover:border-blue-200 hover:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>
            </section>

            <section
              className={`mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5 transition-all delay-150 duration-1000 ${
                visible ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"
              }`}
            >
              <MiniMetric label="Total" value={summary.total} />
              <MiniMetric label="Present" value={summary.hadirs} tone="green" />
              <MiniMetric label="Excused" value={summary.izin} tone="amber" />
              <MiniMetric label="Sick" value={summary.sakit} tone="blue" />
              <MiniMetric label="Absent" value={summary.alpha} tone="red" />
            </section>

            {grouped.length === 0 ? (
              <div className="mt-6 rounded-[2rem] border border-white/90 bg-white/90 p-10 text-center shadow-xl">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <CalendarEmptyIcon />
                </div>
                <h2 className="mt-5 text-lg font-black text-[#071a36]">
                  No Activity Scheduled
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Belum ada agenda aktif untuk hari yang dipilih.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                {grouped.map(([category, categoryActivities], index) => {
                  const config = CATEGORY_CONFIG[category]

                  return (
                    <section
                      key={category}
                      className={`transition-all duration-1000 ${
                        visible
                          ? "translate-y-0 opacity-100"
                          : "translate-y-8 opacity-0"
                      }`}
                      style={{ transitionDelay: `${250 + index * 80}ms` }}
                    >
                      <div className="overflow-hidden rounded-[2rem] border border-white/90 bg-white/90 shadow-xl shadow-blue-950/5 backdrop-blur-xl">
                        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${getCategoryIconClass(
                                config.accent
                              )}`}
                            >
                              {config.icon}
                            </div>

                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">
                                Daily Activity
                              </p>
                              <h2 className="mt-1 text-lg font-black text-[#071a36]">
                                {config.title}
                              </h2>
                              <p className="mt-0.5 text-[10px] text-slate-400">
                                {config.subtitle}
                              </p>
                            </div>
                          </div>

                          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-slate-500">
                            {categoryActivities.length} Activities
                          </span>
                        </div>

                        <div className="p-4 sm:p-6">
                          <div className="relative">
                            <div className="absolute bottom-6 left-[22px] top-6 w-px bg-gradient-to-b from-blue-100 via-slate-200 to-transparent" />

                            <div className="space-y-4">
                              {categoryActivities.map((activity) => {
                                const record = attendanceMap.get(activity.id)
                                const activityPhotos =
                                  photosMap.get(activity.id) || []

                                return (
                                  <div
                                    key={activity.id}
                                    className="group relative grid gap-4 rounded-[1.5rem] border border-slate-100 bg-slate-50/60 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-100 hover:bg-white hover:shadow-lg sm:grid-cols-[120px_1fr_auto] sm:items-center sm:p-5"
                                  >
                                    <div className="relative z-10 flex items-center gap-3">
                                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white bg-white text-blue-700 shadow-sm ring-1 ring-slate-100">
                                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-black text-[#071a36]">
                                          {formatTime(activity.waktu_mulai)}
                                        </p>
                                        <p className="text-[10px] font-semibold text-slate-400">
                                          {formatTime(activity.waktu_selesai)}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="min-w-0">
                                      <h3 className="text-sm font-black text-slate-800 sm:text-base">
                                        {activity.nama_kegiatan}
                                      </h3>
                                      <p className="mt-1 text-xs leading-5 text-slate-500">
                                        {activity.deskripsi ||
                                          "Scheduled student activity."}
                                      </p>

                                      <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <AttendanceBadge status={record?.status} />

                                        {activityPhotos.length > 0 && (
                                          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[9px] font-black text-blue-700">
                                            <PhotoIcon />
                                            {activityPhotos.length} Photos
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex gap-2 sm:justify-end">
                                      {activityPhotos.slice(0, 3).map((photo) => (
                                        <button
                                          key={photo.id}
                                          type="button"
                                          onClick={() => setSelectedPhoto(photo)}
                                          className="group/photo relative h-16 w-16 cursor-pointer overflow-hidden rounded-xl border border-white bg-slate-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                                        >
                                          <ActivityPhoto
                                            path={photo.file_path}
                                            alt={
                                              photo.caption || photo.nama_file
                                            }
                                          />
                                          <span className="absolute inset-0 bg-blue-950/0 transition-all group-hover/photo:bg-blue-950/10" />
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  )
                })}
              </div>
            )}

            <div className="mt-7 rounded-[1.8rem] border border-white/15 bg-[#061a36]/95 p-5 text-white shadow-2xl backdrop-blur-xl sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-300">
                  <InfoIcon />
                </div>
                <div>
                  <p className="text-sm font-black">Student Daily Activity</p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">
                    Kehadiran, foto, dan catatan aktivitas akan muncul setelah
                    dicatat oleh guru atau pembina.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020b19]/80 p-4 backdrop-blur-md"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-black/50 text-white backdrop-blur-md transition-all hover:bg-black/70 active:scale-95"
            >
              <XIcon />
            </button>

            <div className="flex max-h-[76vh] items-center justify-center bg-slate-950">
              <ActivityPhoto
                path={selectedPhoto.file_path}
                alt={selectedPhoto.caption || selectedPhoto.nama_file}
                large
              />
            </div>

            {selectedPhoto.caption && (
              <div className="p-5">
                <p className="text-sm font-black text-[#071a36]">
                  {selectedPhoto.caption}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

function ActivityPhoto({
  path,
  alt,
  large = false,
}: {
  path: string
  alt: string
  large?: boolean
}) {
  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/santri-activities/${path}`

  return (
    <img
      src={publicUrl}
      alt={alt}
      className={
        large ? "max-h-[76vh] w-full object-contain" : "h-full w-full object-cover"
      }
    />
  )
}

function SummaryPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
      <p className="text-[8px] font-black uppercase tracking-wider text-blue-200">
        {label}
      </p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  )
}

function MiniMetric({
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
    <div className="rounded-2xl border border-white/90 bg-white/90 px-4 py-4 shadow-lg shadow-blue-950/5">
      <div
        className={`inline-flex rounded-xl px-3 py-1.5 text-lg font-black ring-1 ${styles[tone]}`}
      >
        {value}
      </div>
      <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>
    </div>
  )
}

function AttendanceBadge({
  status,
}: {
  status: Attendance["status"] | undefined
}) {
  const normalized = status || "BELUM DICATAT"

  const styles =
    normalized === "HADIR"
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : normalized === "IZIN"
        ? "border-amber-100 bg-amber-50 text-amber-700"
        : normalized === "SAKIT"
          ? "border-blue-100 bg-blue-50 text-blue-700"
          : normalized === "ALPHA"
            ? "border-red-100 bg-red-50 text-red-700"
            : "border-slate-200 bg-white text-slate-400"

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-black ${styles}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {normalized.replaceAll("_", " ")}
    </span>
  )
}

function getCategoryIconClass(accent: string) {
  const classes: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
    indigo: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100",
    cyan: "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100",
    navy: "bg-slate-100 text-[#061a36] ring-1 ring-slate-200",
  }

  return classes[accent] || classes.blue
}

function getIndonesianDay(dateValue: string) {
  const date = new Date(`${dateValue}T12:00:00`)
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

function formatTime(value: string) {
  return value.slice(0, 5)
}

/* ICONS */

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
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

function CloudSunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <path strokeLinecap="round" d="M8 16h9a4 4 0 0 0 .5-7.97A5.5 5.5 0 0 0 7.2 9.5 3.5 3.5 0 0 0 8 16Z" />
      <path strokeLinecap="round" d="M6 6V4M3.8 7.2 2.4 5.8M3 10H1" />
    </svg>
  )
}

function ActivityIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <path strokeLinecap="round" d="M4 17h3l2-6 3 9 3-13 2 10h3" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 15.5A8 8 0 0 1 8.5 4a8.5 8.5 0 1 0 11.5 11.5Z" />
    </svg>
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

function PhotoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 17 4-4 3 3 2-2 3 3" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" d="M12 10.5v5M12 7.5h.01" />
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

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path strokeLinecap="round" d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" d="m7 7 10 10M17 7 7 17" />
    </svg>
  )
}
