"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { ChangeEvent, ReactNode } from "react"
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

type Student = {
  id: string
  nama_lengkap: string | null
  nomor_pendaftaran: string | null
  status: string | null
}

type AttendanceStatus = "HADIR" | "IZIN" | "SAKIT" | "ALPHA"
type AttendanceState = Partial<Record<string, AttendanceStatus>>

type PhotoRow = {
  id: string
  file_path: string
  nama_file: string
  caption: string | null
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

const CATEGORY_META: Record<
  Category,
  {
    label: string
    subtitle: string
    icon: ReactNode
    iconClass: string
    glowClass: string
  }
> = {
  MORNING: {
    label: "Morning Routine",
    subtitle: "Spiritual routine & morning preparation",
    icon: <SunIcon />,
    iconClass: "bg-blue-50 text-blue-700 ring-blue-100",
    glowClass: "from-blue-700/10 via-cyan-400/5 to-transparent",
  },
  SCHOOL: {
    label: "School",
    subtitle: "Academic learning session",
    icon: <SchoolIcon />,
    iconClass: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    glowClass: "from-indigo-700/10 via-blue-400/5 to-transparent",
  },
  AFTERNOON: {
    label: "Afternoon",
    subtitle: "Rest, meals & personal time",
    icon: <CloudSunIcon />,
    iconClass: "bg-cyan-50 text-cyan-700 ring-cyan-100",
    glowClass: "from-cyan-600/10 via-blue-400/5 to-transparent",
  },
  EXTRACURRICULAR: {
    label: "Extracurricular",
    subtitle: "Physical activity & student development",
    icon: <ActivityIcon />,
    iconClass: "bg-sky-50 text-sky-700 ring-sky-100",
    glowClass: "from-sky-700/10 via-blue-400/5 to-transparent",
  },
  EVENING: {
    label: "Evening Routine",
    subtitle: "Worship, learning & rest",
    icon: <MoonIcon />,
    iconClass: "bg-slate-100 text-[#061a36] ring-slate-200",
    glowClass: "from-[#061a36]/10 via-blue-500/5 to-transparent",
  },
}

export default function TeacherActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  )

  const [attendance, setAttendance] = useState<AttendanceState>({})
  const [note, setNote] = useState("")
  const [photos, setPhotos] = useState<PhotoRow[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [selectedDate, setSelectedDate] = useState(formatInputDate(new Date()))

  const [loading, setLoading] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [savingAttendance, setSavingAttendance] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [savingNote, setSavingNote] = useState(false)
  const [visible, setVisible] = useState(false)

  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [searchStudent, setSearchStudent] = useState("")
  const [activePhoto, setActivePhoto] = useState<PhotoRow | null>(null)

  const dayName = useMemo(
    () => getIndonesianDay(selectedDate),
    [selectedDate]
  )

  const loadActivityDetail = useCallback(
    async (activityId: string, date: string) => {
      try {
        setLoadingDetail(true)
        setError("")

        const [
          { data: attendanceData, error: attendanceError },
          { data: photoData, error: photoError },
          { data: noteData, error: noteError },
        ] = await Promise.all([
          supabase
            .from("activity_attendance")
            .select("ppdb_id,status,catatan")
            .eq("activity_id", activityId)
            .eq("tanggal", date),

          supabase
            .from("activity_photos")
            .select("id,file_path,nama_file,caption")
            .eq("activity_id", activityId)
            .eq("tanggal", date)
            .order("created_at", { ascending: true }),

          supabase
            .from("activity_notes")
            .select("catatan")
            .eq("activity_id", activityId)
            .eq("tanggal", date)
            .maybeSingle(),
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
          throw new Error(`Unable to load activity note: ${noteError.message}`)
        }

        const nextAttendance: AttendanceState = {}

        for (const row of attendanceData || []) {
          nextAttendance[row.ppdb_id] = row.status as AttendanceStatus
        }

        setAttendance(nextAttendance)
        setPhotos((photoData || []) as PhotoRow[])
        setNote(noteData?.catatan || "")
      } catch (err) {
        console.error("ACTIVITY DETAIL ERROR:", err)
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load activity detail."
        )
      } finally {
        setLoadingDetail(false)
      }
    },
    []
  )

  const loadPage = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      setMessage("")

const {
  data: { user },
  error: authError,
} = await supabase.auth.getUser()

      if (authError) throw new Error(authError.message)

      if (!user) {
        window.location.href = "/login"
        return
      }

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle()

      if (roleError) {
        throw new Error(`Unable to verify your role: ${roleError.message}`)
      }

      const role = String(roleData?.role || "").trim().toUpperCase()

      if (!["GURU", "ADMIN"].includes(role)) {
        throw new Error(
          "This workspace is restricted to teachers and administrators."
        )
      }

      const [
        { data: activityData, error: activityError },
        { data: studentData, error: studentError },
      ] = await Promise.all([
        supabase
          .from("daily_activities")
          .select(
            "id,nama_kegiatan,kategori,hari,waktu_mulai,waktu_selesai,deskripsi"
          )
          .eq("hari", dayName)
          .eq("aktif", true),

        supabase
          .from("ppdb_applications")
          .select("id,nama_lengkap,nomor_pendaftaran,status")
          .eq("status", "DITERIMA")
          .order("nama_lengkap", { ascending: true }),
      ])

      if (activityError) {
        throw new Error(`Unable to load activities: ${activityError.message}`)
      }

      if (studentError) {
        throw new Error(`Unable to load students: ${studentError.message}`)
      }

      const sortedActivities = [...((activityData || []) as Activity[])].sort(
        compareActivityTime
      )

      setActivities(sortedActivities)
      setStudents((studentData || []) as Student[])

      setSelectedActivity((current) => {
        if (!current) return null
        return (
          sortedActivities.find((activity) => activity.id === current.id) ||
          null
        )
      })
    } catch (err) {
      console.error("TEACHER ACTIVITY ERROR:", err)
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load teacher activity."
      )
    } finally {
      setLoading(false)
    }
  }, [dayName])

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 80)
    void loadPage()
    return () => window.clearTimeout(timer)
  }, [loadPage])

  useEffect(() => {
    if (!selectedActivity) return
    void loadActivityDetail(selectedActivity.id, selectedDate)
  }, [selectedActivity, selectedDate, loadActivityDetail])

  const selectActivity = (activity: Activity) => {
    setMessage("")
    setError("")
    setSearchStudent("")
    setSelectedActivity(activity)
  }

  const handleDateChange = (value: string) => {
    setSelectedDate(value)
    setSelectedActivity(null)
    setAttendance({})
    setPhotos([])
    setNote("")
    setSelectedFiles([])
    setMessage("")
    setError("")
  }

  const updateAttendance = (
    studentId: string,
    status: AttendanceStatus
  ) => {
    setAttendance((current) => ({
      ...current,
      [studentId]: status,
    }))
  }

  const markAllPresent = () => {
    const next: AttendanceState = {}

    students.forEach((student) => {
      next[student.id] = "HADIR"
    })

    setAttendance(next)
    setMessage(`${students.length} students marked as Present.`)
    setError("")
  }

  const saveAttendance = async () => {
    if (!selectedActivity || students.length === 0) return

    try {
      setSavingAttendance(true)
      setMessage("")
      setError("")

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Your session has expired. Please log in again.")
      }

      const unmarked = students.filter((student) => !attendance[student.id])

      if (unmarked.length > 0) {
        throw new Error(
          `${unmarked.length} student(s) are still not marked. Please select a status for every student.`
        )
      }

      const rows = students.map((student) => ({
        activity_id: selectedActivity.id,
        ppdb_id: student.id,
        tanggal: selectedDate,
        status: attendance[student.id] as AttendanceStatus,
        recorded_by: user.id,
      }))

      const { error: upsertError } = await supabase
        .from("activity_attendance")
        .upsert(rows, {
          onConflict: "activity_id,ppdb_id,tanggal",
        })

      if (upsertError) {
        throw new Error(
          `Unable to save attendance: ${upsertError.message}`
        )
      }

      setMessage("Attendance has been saved successfully.")
      await loadActivityDetail(selectedActivity.id, selectedDate)
    } catch (err) {
      console.error("SAVE ATTENDANCE ERROR:", err)
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save attendance."
      )
    } finally {
      setSavingAttendance(false)
    }
  }

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])

    if (files.length > 12) {
      setSelectedFiles(files.slice(0, 12))
      setError("A maximum of 12 photos can be selected at once.")
      return
    }

    const invalidType = files.find(
      (file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    )

    if (invalidType) {
      setSelectedFiles([])
      setError("Only JPG, PNG and WEBP images are accepted.")
      return
    }

    const oversized = files.find(
      (file) => file.size > 10 * 1024 * 1024
    )

    if (oversized) {
      setSelectedFiles([])
      setError(`"${oversized.name}" exceeds the 10 MB limit.`)
      return
    }

    setError("")
    setSelectedFiles(files)
  }

  const uploadPhotos = async () => {
    if (!selectedActivity || selectedFiles.length === 0) return

    try {
      setUploading(true)
      setMessage("")
      setError("")

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Your session has expired. Please log in again.")
      }

      let uploadedCount = 0

      for (const file of selectedFiles) {
        const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"
        const safeName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[^a-zA-Z0-9-_]/g, "-")
          .toLowerCase()

        const dateObj = new Date(`${selectedDate}T12:00:00`)

        const path =
          `${dateObj.getFullYear()}/` +
          `${String(dateObj.getMonth() + 1).padStart(2, "0")}/` +
          `${selectedActivity.id}/` +
          `${safeName || "activity"}-${crypto.randomUUID()}.${extension}`

        const { error: uploadError } = await supabase.storage
          .from("santri-activities")
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          })

        if (uploadError) {
          throw new Error(
            `Unable to upload ${file.name}: ${uploadError.message}`
          )
        }

        const { error: insertError } = await supabase
          .from("activity_photos")
          .insert({
            activity_id: selectedActivity.id,
            tanggal: selectedDate,
            file_path: path,
            nama_file: file.name,
            file_size: file.size,
            mime_type: file.type,
            uploaded_by: user.id,
          })

        if (insertError) {
          await supabase.storage.from("santri-activities").remove([path])

          throw new Error(
            `Photo uploaded but metadata could not be saved: ${insertError.message}`
          )
        }

        uploadedCount += 1
      }

      setSelectedFiles([])
      setMessage(`${uploadedCount} photo(s) uploaded successfully.`)
      await loadActivityDetail(selectedActivity.id, selectedDate)
    } catch (err) {
      console.error("UPLOAD PHOTO ERROR:", err)
      setError(
        err instanceof Error
          ? err.message
          : "Unable to upload photos."
      )
    } finally {
      setUploading(false)
    }
  }

  const saveNote = async () => {
    if (!selectedActivity) return

    const cleanNote = note.trim()

    if (!cleanNote) {
      setError("Please write an observation before saving.")
      return
    }

    if (cleanNote.length > 2000) {
      setError("Observation cannot exceed 2000 characters.")
      return
    }

    try {
      setSavingNote(true)
      setMessage("")
      setError("")

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Your session has expired. Please log in again.")
      }

      const { error: noteError } = await supabase
        .from("activity_notes")
        .upsert(
          {
            activity_id: selectedActivity.id,
            tanggal: selectedDate,
            catatan: cleanNote,
            created_by: user.id,
          },
          {
            onConflict: "activity_id,tanggal",
          }
        )

      if (noteError) {
        throw new Error(
          `Unable to save activity observation: ${noteError.message}`
        )
      }

      setNote(cleanNote)
      setMessage("Teacher observation has been saved successfully.")
    } catch (err) {
      console.error("SAVE NOTE ERROR:", err)
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save activity observation."
      )
    } finally {
      setSavingNote(false)
    }
  }

  const stats = useMemo(() => {
    const values = Object.values(attendance)

    return {
      present: values.filter((status) => status === "HADIR").length,
      excused: values.filter((status) => status === "IZIN").length,
      sick: values.filter((status) => status === "SAKIT").length,
      absent: values.filter((status) => status === "ALPHA").length,
      total: students.length,
      marked: values.length,
    }
  }, [attendance, students.length])

  const filteredStudents = useMemo(() => {
    const keyword = searchStudent.trim().toLowerCase()

    if (!keyword) return students

    return students.filter((student) => {
      return (
        student.nama_lengkap?.toLowerCase().includes(keyword) ||
        student.nomor_pendaftaran?.toLowerCase().includes(keyword)
      )
    })
  }, [searchStudent, students])

  const completion = useMemo(() => {
    if (!students.length) return 0
    return Math.round((stats.marked / students.length) * 100)
  }, [stats.marked, students.length])

  if (loading) return <LoadingScreen />

  return (
    <main className="min-h-screen overflow-hidden bg-[#edf4fb] text-slate-900">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_5%,rgba(37,99,235,0.13),transparent_28%),radial-gradient(circle_at_88%_12%,rgba(14,165,233,0.11),transparent_26%),linear-gradient(135deg,#f9fbff,#edf4fb_55%,#e6eef8)]" />
        <div className="absolute -left-52 -top-52 h-[36rem] w-[36rem] rounded-full bg-blue-300/10 blur-3xl" />
        <div className="absolute -right-52 top-20 h-[36rem] w-[36rem] rounded-full bg-cyan-200/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-7 sm:py-7">
        <header
          className={`rounded-[1.8rem] border border-white/90 bg-white/85 px-5 py-4 shadow-2xl shadow-blue-950/5 backdrop-blur-2xl transition-all duration-700 ${
            visible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#061a36] text-white shadow-lg shadow-blue-950/15">
                <ActivityIcon />
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-blue-700">
                  INIBS SMART DIGITAL
                </p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-[#071a36]">
                  Teacher Activity Center
                </h1>
                <p className="mt-1 text-xs text-slate-400">
                  Daily supervision, attendance & learning observations
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                  Activity Date
                </p>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) =>
                    handleDateChange(event.target.value)
                  }
                  className="mt-0.5 w-[145px] cursor-pointer bg-transparent text-xs font-black text-slate-700 outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => void loadPage()}
                className="group flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-[#061a36] px-4 text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-blue-950/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-800 active:scale-95"
              >
                <RefreshIcon />
                Refresh
              </button>
            </div>
          </div>
        </header>

        {(error || message) && (
          <div
            className={`mt-5 rounded-2xl border px-4 py-4 shadow-sm transition-all duration-500 ${
              error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            <p className="text-xs font-black">
              {error ? "Action required" : "Success"}
            </p>
            <p className="mt-1 text-xs leading-5">{error || message}</p>
          </div>
        )}

        <section
          className={`relative mt-6 overflow-hidden rounded-[2.2rem] bg-gradient-to-br from-[#061a36] via-[#0a2d5d] to-blue-700 p-6 text-white shadow-2xl shadow-blue-950/20 transition-all duration-900 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"
          }`}
        >
          <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-cyan-300/15 blur-3xl" />
          <div className="absolute bottom-[-10rem] left-1/3 h-72 w-72 rounded-full bg-blue-300/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-md">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                  {dayName} • Teacher Workspace
                </span>
              </div>

              <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                Shape Every Student Day
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
                Record attendance, preserve meaningful activity moments, and
                leave concise observations that support student development.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <HeroMetric label="Activities" value={activities.length} />
              <HeroMetric label="Students" value={students.length} />
              <HeroMetric label="Recorded" value={`${completion}%`} />
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
          <section
            className={`rounded-[2rem] border border-white/90 bg-white/90 p-5 shadow-xl shadow-blue-950/5 backdrop-blur-xl transition-all delay-100 duration-900 ${
              visible ? "translate-x-0 opacity-100" : "-translate-x-5 opacity-0"
            }`}
          >
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                  {formatLongDate(selectedDate)}
                </p>
                <h2 className="mt-1 text-xl font-black text-[#071a36]">
                  Today&apos;s Activities
                </h2>
              </div>

              <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[9px] font-black text-blue-700">
                {activities.length}
              </span>
            </div>

            <div className="mt-5 space-y-2.5">
              {activities.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-7 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-400 ring-1 ring-slate-100">
                    <CalendarEmptyIcon />
                  </div>
                  <p className="mt-4 text-sm font-black text-slate-600">
                    No active activities
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Configure an active Daily Activity for this day.
                  </p>
                </div>
              ) : (
                activities.map((activity, index) => {
                  const active = selectedActivity?.id === activity.id
                  const meta = CATEGORY_META[activity.kategori]

                  return (
                    <button
                      key={activity.id}
                      type="button"
                      onClick={() => selectActivity(activity)}
                      className={`group relative w-full cursor-pointer overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${
                        active
                          ? "border-blue-200 bg-blue-50/90 shadow-lg shadow-blue-100/50"
                          : "border-slate-100 bg-slate-50/55 hover:-translate-y-0.5 hover:border-blue-100 hover:bg-white hover:shadow-md"
                      }`}
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      {active && (
                        <div className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-blue-800 via-blue-500 to-cyan-400" />
                      )}

                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 transition-all duration-300 group-hover:scale-105 ${
                            active
                              ? "bg-blue-700 text-white ring-blue-700"
                              : meta.iconClass
                          }`}
                        >
                          {meta.icon}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] font-black uppercase tracking-wider text-blue-600">
                            {formatTime(activity.waktu_mulai)} -{" "}
                            {formatTime(activity.waktu_selesai)}
                          </p>
                          <p className="mt-1 truncate text-sm font-black text-[#071a36]">
                            {activity.nama_kegiatan}
                          </p>
                          <p className="mt-0.5 truncate text-[10px] text-slate-400">
                            {meta.label}
                          </p>
                        </div>

                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                            active
                              ? "bg-blue-700 text-white"
                              : "bg-white text-slate-300 ring-1 ring-slate-100 group-hover:translate-x-1 group-hover:text-blue-700"
                          }`}
                        >
                          <ArrowIcon />
                        </span>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </section>

          <section
            className={`overflow-hidden rounded-[2rem] border border-white/90 bg-white/90 shadow-xl shadow-blue-950/5 backdrop-blur-xl transition-all delay-150 duration-900 ${
              visible ? "translate-x-0 opacity-100" : "translate-x-5 opacity-0"
            }`}
          >
            {!selectedActivity ? (
              <div className="flex min-h-[640px] flex-col items-center justify-center px-8 text-center">
                <div className="relative flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-blue-50 to-white text-blue-700 shadow-xl shadow-blue-100 ring-1 ring-blue-100">
                  <div className="absolute inset-0 animate-pulse rounded-[2rem] bg-blue-100/30" />
                  <div className="relative">
                    <ActivityIcon />
                  </div>
                </div>

                <p className="mt-7 text-[10px] font-black uppercase tracking-[0.25em] text-blue-600">
                  Activity Management
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-[#071a36]">
                  Select an activity
                </h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
                  Choose a schedule from the left panel to record attendance,
                  document the activity, and add a teacher observation.
                </p>
              </div>
            ) : (
              <div className="animate-[fadeIn_.35s_ease-out]">
                <div className="relative overflow-hidden border-b border-slate-100 px-5 py-6 sm:px-7">
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${
                      CATEGORY_META[selectedActivity.kategori].glowClass
                    }`}
                  />

                  <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                        Activity Editor
                      </p>

                      <h2 className="mt-1 text-2xl font-black tracking-tight text-[#071a36]">
                        {selectedActivity.nama_kegiatan}
                      </h2>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-black text-slate-600 shadow-sm">
                          {formatTime(selectedActivity.waktu_mulai)} -{" "}
                          {formatTime(selectedActivity.waktu_selesai)}
                        </span>
                        <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[9px] font-black text-blue-700">
                          {CATEGORY_META[selectedActivity.kategori].label}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                      <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                        Attendance Progress
                      </p>

                      <div className="mt-2 flex items-end gap-2">
                        <span className="text-2xl font-black text-[#071a36]">
                          {completion}%
                        </span>
                        <span className="pb-1 text-[10px] font-semibold text-slate-400">
                          marked
                        </span>
                      </div>

                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-800 via-blue-600 to-cyan-400 transition-all duration-700"
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-7">
                  {/* ATTENDANCE SUMMARY */}
                  <div className="grid gap-3 sm:grid-cols-4">
                    <Metric label="Present" value={stats.present} tone="green" />
                    <Metric label="Excused" value={stats.excused} tone="amber" />
                    <Metric label="Sick" value={stats.sick} tone="blue" />
                    <Metric label="Absent" value={stats.absent} tone="red" />
                  </div>

                  {/* ATTENDANCE */}
                  <div className="mt-8">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                          Attendance
                        </p>
                        <h3 className="mt-1 text-lg font-black text-[#071a36]">
                          Student Attendance
                        </h3>
                        <p className="mt-1 text-xs text-slate-400">
                          Mark every student before saving the session.
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <button
                          type="button"
                          onClick={markAllPresent}
                          className="cursor-pointer rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-100 active:scale-95"
                        >
                          Mark All Present
                        </button>

                        <div className="relative">
                          <SearchIcon />
                          <input
                            value={searchStudent}
                            onChange={(event) =>
                              setSearchStudent(event.target.value)
                            }
                            placeholder="Search student..."
                            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-semibold text-slate-700 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 sm:w-56"
                          />
                        </div>
                      </div>
                    </div>

                    {loadingDetail ? (
                      <div className="mt-4 space-y-2">
                        {[1, 2, 3, 4, 5].map((item) => (
                          <div
                            key={item}
                            className="h-16 animate-pulse rounded-2xl bg-slate-100"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-slate-100">
                        <div className="max-h-[450px] overflow-y-auto">
                          {filteredStudents.length === 0 ? (
                            <div className="p-8 text-center">
                              <p className="text-sm font-black text-slate-600">
                                No students found
                              </p>
                            </div>
                          ) : (
                            filteredStudents.map((student) => {
                              const status = attendance[student.id]

                              return (
                                <div
                                  key={student.id}
                                  className={`group border-b border-slate-100 p-4 transition-all duration-200 last:border-b-0 ${
                                    status
                                      ? "bg-white hover:bg-blue-50/20"
                                      : "bg-amber-50/30 hover:bg-amber-50/50"
                                  }`}
                                >
                                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex min-w-0 items-center gap-3">
                                      <div
                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[10px] font-black ring-1 ${
                                          status
                                            ? "bg-slate-50 text-slate-400 ring-slate-100"
                                            : "bg-amber-50 text-amber-700 ring-amber-100"
                                        }`}
                                      >
                                        {students.findIndex(
                                          (item) => item.id === student.id
                                        ) + 1}
                                      </div>

                                      <div className="min-w-0">
                                        <p className="truncate text-xs font-black text-slate-700">
                                          {student.nama_lengkap || "-"}
                                        </p>
                                        <p className="mt-0.5 truncate text-[9px] text-slate-400">
                                          {student.nomor_pendaftaran || "-"}
                                        </p>
                                      </div>

                                      {!status && (
                                        <span className="hidden rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-amber-700 sm:inline-flex">
                                          Not Marked
                                        </span>
                                      )}
                                    </div>

                                    <div className="grid grid-cols-4 gap-1.5 sm:flex">
                                      <AttendanceButton
                                        active={status === "HADIR"}
                                        label="P"
                                        title="Present"
                                        tone="green"
                                        onClick={() =>
                                          updateAttendance(student.id, "HADIR")
                                        }
                                      />
                                      <AttendanceButton
                                        active={status === "IZIN"}
                                        label="I"
                                        title="Excused"
                                        tone="amber"
                                        onClick={() =>
                                          updateAttendance(student.id, "IZIN")
                                        }
                                      />
                                      <AttendanceButton
                                        active={status === "SAKIT"}
                                        label="S"
                                        title="Sick"
                                        tone="blue"
                                        onClick={() =>
                                          updateAttendance(student.id, "SAKIT")
                                        }
                                      />
                                      <AttendanceButton
                                        active={status === "ALPHA"}
                                        label="A"
                                        title="Absent"
                                        tone="red"
                                        onClick={() =>
                                          updateAttendance(student.id, "ALPHA")
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>
                              )
                            })
                          )}
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => void saveAttendance()}
                      disabled={savingAttendance || students.length === 0}
                      className="mt-4 w-full cursor-pointer rounded-xl bg-blue-700 px-5 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-blue-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {savingAttendance
                        ? "Saving Attendance..."
                        : `Save Attendance • ${stats.marked}/${students.length} Marked`}
                    </button>
                  </div>

                  {/* PHOTOS */}
                  <div className="mt-9 border-t border-slate-100 pt-8">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                        Activity Documentation
                      </p>
                      <h3 className="mt-1 text-lg font-black text-[#071a36]">
                        Capture the Learning Moment
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        Upload up to 12 JPG, PNG or WEBP photos. Maximum 10 MB
                        per image.
                      </p>
                    </div>

                    <label className="group mt-4 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 text-center transition-all duration-500 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-lg">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2">
                        <PhotoIcon />
                      </div>

                      <span className="mt-3 text-sm font-black text-slate-600">
                        Choose Activity Photos
                      </span>

                      <span className="mt-1 text-[10px] text-slate-400">
                        JPG, PNG or WEBP • Multiple selection supported
                      </span>

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleFiles}
                        className="hidden"
                      />
                    </label>

                    {selectedFiles.length > 0 && (
                      <div className="mt-4 rounded-[1.5rem] border border-blue-100 bg-blue-50/60 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-black text-blue-800">
                            {selectedFiles.length} file(s) selected
                          </p>

                          <button
                            type="button"
                            onClick={() => setSelectedFiles([])}
                            className="cursor-pointer text-[10px] font-black text-blue-600 transition-colors hover:text-blue-800"
                          >
                            Clear
                          </button>
                        </div>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {selectedFiles.map((file) => (
                            <div
                              key={`${file.name}-${file.size}`}
                              className="truncate rounded-xl border border-blue-100 bg-white px-3 py-2 text-[10px] font-semibold text-blue-700"
                            >
                              {file.name}
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => void uploadPhotos()}
                          disabled={uploading}
                          className="mt-4 w-full cursor-pointer rounded-xl bg-[#061a36] px-5 py-3 text-xs font-black uppercase tracking-wider text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-800 active:scale-[0.99] disabled:cursor-wait disabled:opacity-50"
                        >
                          {uploading
                            ? "Uploading Photos..."
                            : `Upload ${selectedFiles.length} Photo${
                                selectedFiles.length > 1 ? "s" : ""
                              }`}
                        </button>
                      </div>
                    )}

                    {photos.length > 0 && (
                      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {photos.map((photo) => (
                          <button
                            key={photo.id}
                            type="button"
                            onClick={() => setActivePhoto(photo)}
                            className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                          >
                            <div className="relative">
                              <img
                                src={getPublicPhotoUrl(photo.file_path)}
                                alt={photo.caption || photo.nama_file}
                                className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-[#061a36]/0 transition-all duration-300 group-hover:bg-[#061a36]/10" />
                            </div>

                            <p className="truncate px-3 py-2.5 text-[9px] font-semibold text-slate-500">
                              {photo.nama_file}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* NOTE */}
                  <div className="mt-9 border-t border-slate-100 pt-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                      Teacher Observation
                    </p>

                    <h3 className="mt-1 text-lg font-black text-[#071a36]">
                      Activity Note
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Record a factual, concise observation about participation,
                      discipline, learning attitude, or activity outcomes.
                    </p>

                    <textarea
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      maxLength={2000}
                      placeholder="Write an academic observation..."
                      rows={5}
                      className="mt-4 w-full resize-none rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4 text-sm leading-6 text-slate-700 outline-none transition-all duration-300 placeholder:text-slate-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />

                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-[9px] text-slate-400">
                        {note.length}/2000 • Student-centered documentation
                      </p>

                      <button
                        type="button"
                        onClick={() => void saveNote()}
                        disabled={savingNote || !note.trim()}
                        className="cursor-pointer rounded-xl bg-[#061a36] px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingNote ? "Saving Note..." : "Save Observation"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* PHOTO LIGHTBOX */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020b19]/85 p-4 backdrop-blur-md animate-[fadeIn_.2s_ease-out]"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl animate-[scaleIn_.25s_ease-out]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActivePhoto(null)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-black/50 text-white backdrop-blur-md transition-all hover:bg-black/70 active:scale-95"
              aria-label="Close photo"
            >
              <XIcon />
            </button>

            <div className="flex max-h-[78vh] items-center justify-center bg-slate-950">
              <img
                src={getPublicPhotoUrl(activePhoto.file_path)}
                alt={activePhoto.caption || activePhoto.nama_file}
                className="max-h-[78vh] w-full object-contain"
              />
            </div>

            <div className="p-5">
              <p className="truncate text-sm font-black text-[#071a36]">
                {activePhoto.caption || activePhoto.nama_file}
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.97);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </main>
  )
}

/* ---------- UI ---------- */

function HeroMetric({
  label,
  value,
}: {
  label: string
  value: number | string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
      <p className="text-[8px] font-black uppercase tracking-wider text-blue-200">
        {label}
      </p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  )
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: "green" | "amber" | "blue" | "red"
}) {
  const styles = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    red: "bg-red-50 text-red-700 ring-red-100",
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
      <div
        className={`inline-flex rounded-xl px-3 py-1.5 text-lg font-black ring-1 ${styles[tone]}`}
      >
        {value}
      </div>
      <p className="mt-2 text-[9px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>
    </div>
  )
}

function AttendanceButton({
  active,
  label,
  title,
  tone,
  onClick,
}: {
  active: boolean
  label: string
  title: string
  tone: "green" | "amber" | "blue" | "red"
  onClick: () => void
}) {
  const styles = {
    green: active
      ? "border-emerald-500 bg-emerald-500 text-white shadow-emerald-100"
      : "border-emerald-100 bg-emerald-50 text-emerald-700",
    amber: active
      ? "border-amber-500 bg-amber-500 text-white shadow-amber-100"
      : "border-amber-100 bg-amber-50 text-amber-700",
    blue: active
      ? "border-blue-600 bg-blue-600 text-white shadow-blue-100"
      : "border-blue-100 bg-blue-50 text-blue-700",
    red: active
      ? "border-red-500 bg-red-500 text-white shadow-red-100"
      : "border-red-100 bg-red-50 text-red-700",
  }

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border text-[10px] font-black shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${styles[tone]}`}
    >
      {label}
    </button>
  )
}

/* ---------- HELPERS ---------- */

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

function formatTime(value: string) {
  return value.slice(0, 5)
}

function getMinutes(value: string) {
  const [hour, minute] = value.slice(0, 5).split(":").map(Number)
  return hour * 60 + minute
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

function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="text-center">
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white bg-white shadow-xl">
          <div className="absolute inset-0 animate-ping rounded-2xl bg-blue-100/50" />
          <div className="relative h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />
        </div>
        <p className="mt-5 text-sm font-black text-slate-700">
          Loading Teacher Activity...
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Preparing today&apos;s workspace
        </p>
      </div>
    </main>
  )
}

/* ---------- ICONS ---------- */

function ActivityIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <path strokeLinecap="round" d="M4 17h3l2-6 3 9 3-13 2 10h3" />
    </svg>
  )
}

function AttendanceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path strokeLinecap="round" d="M8 3v4M16 3v4M4 9h16" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m8 14 2 2 5-5" />
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

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 15.5A8 8 0 0 1 8.5 4a8 8 0 1 0 11.5 11.5Z" />
    </svg>
  )
}

function PhotoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 17 4-4 3 3 2-2 3 3" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
      <circle cx="10.5" cy="10.5" r="5.5" />
      <path strokeLinecap="round" d="m15 15 4.5 4.5" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180">
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

function CalendarEmptyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path strokeLinecap="round" d="M8 3v4M16 3v4M4 9h16M9 13h6M9 16h4" />
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
