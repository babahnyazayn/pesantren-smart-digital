"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"

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

export default function AcademicJPSessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [sessionId, setSessionId] = useState("")
  const [session, setSession] = useState<AcademicSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        setLoading(true)
        setError("")

        const { id } = await params

        if (!mounted) return
        setSessionId(id)

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError) throw new Error(authError.message)

        if (!user) {
          window.location.href = "/login"
          return
        }

        const { data, error: sessionError } = await supabase
          .from("academic_learning_sessions")
          .select(
            "id,tanggal,jp_number,waktu_mulai,waktu_selesai,subject_id,teacher_id,class_id"
          )
          .eq("id", id)
          .maybeSingle()

        if (sessionError) {
          throw new Error(
            `Unable to load academic session: ${sessionError.message}`
          )
        }

        if (!data) {
          throw new Error(
            "This academic learning session could not be found."
          )
        }

        if (mounted) {
          setSession(data as AcademicSession)
        }
      } catch (err) {
        console.error("ACADEMIC JP SESSION ERROR:", err)

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load academic learning session."
          )
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void load()

    return () => {
      mounted = false
    }
  }, [params])

  const title = useMemo(() => {
    if (!session) return "Academic Learning"
    return `Academic Learning ${session.jp_number}`
  }, [session])

  if (loading) {
    return <LoadingScreen />
  }

  if (error || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#edf4fb] px-4">
        <div className="w-full max-w-lg rounded-[2rem] border border-white bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertIcon />
          </div>

          <p className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-red-600">
            Academic Session
          </p>

          <h1 className="mt-2 text-xl font-black text-[#071a36]">
            Unable to open this JP
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error || "The selected academic session does not exist."}
          </p>

          <Link
            href="/walisantri/aktivitas"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#061a36] px-5 py-3 text-xs font-black text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-800 active:scale-95"
          >
            <ArrowLeftIcon />
            Back to Daily Activity
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#edf4fb] text-slate-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_5%,rgba(37,99,235,0.13),transparent_30%),radial-gradient(circle_at_88%_12%,rgba(14,165,233,0.11),transparent_28%),linear-gradient(135deg,#fbfdff,#edf4fb_55%,#e5eef8)]" />
        <div className="absolute -left-48 -top-48 h-[34rem] w-[34rem] rounded-full bg-blue-300/10 blur-3xl" />
        <div className="absolute -right-48 top-20 h-[34rem] w-[34rem] rounded-full bg-cyan-200/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 py-5 sm:px-7 sm:py-7">
        <header className="flex items-center justify-between rounded-[1.6rem] border border-white/90 bg-white/85 px-4 py-3 shadow-xl shadow-blue-950/5 backdrop-blur-2xl sm:px-5">
          <Link
            href="/walisantri/aktivitas"
            className="group flex items-center gap-2 text-xs font-black text-slate-500 transition-colors hover:text-blue-700"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition-all duration-300 group-hover:-translate-x-0.5 group-hover:border-blue-200 group-hover:text-blue-700">
              <ArrowLeftIcon />
            </span>
            <span className="hidden sm:inline">Back to Daily Activity</span>
          </Link>

          <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-blue-700">
            JP Session
          </span>
        </header>

        <section className="mt-6 overflow-hidden rounded-[2.3rem] bg-gradient-to-br from-[#061a36] via-[#0a2f63] to-blue-700 p-6 text-white shadow-2xl shadow-blue-950/20 sm:p-8">
          <div className="relative">
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-300/15 blur-3xl" />

            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-blue-50 backdrop-blur-md">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
                Student Learning Session
              </span>

              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                {title}
              </h1>

              <p className="mt-2 text-sm text-blue-100">
                {formatDate(session.tanggal)}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[9px] font-black text-blue-100">
                  {formatTime(session.waktu_mulai)} -{" "}
                  {formatTime(session.waktu_selesai)}
                </span>

                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[9px] font-black text-cyan-100">
                  45 Minutes
                </span>
              </div>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-blue-100">
                This session represents one period within the school learning
                schedule. Subject, teacher, attendance, documentation, and
                teaching records will be connected to this session.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-white/90 bg-white/90 p-6 shadow-xl shadow-blue-950/5 backdrop-blur-xl sm:p-7">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
            Session Overview
          </p>

          <h2 className="mt-1 text-xl font-black text-[#071a36]">
            Academic Learning {session.jp_number}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            The academic session is ready for the next integration stage.
            Teacher and subject assignment will be connected after the
            academic schedule is finalized.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <InfoCard
              icon={<HashIcon />}
              label="Period"
              value={`JP ${session.jp_number}`}
            />

            <InfoCard
              icon={<ClockIcon />}
              label="Time"
              value={`${formatTime(session.waktu_mulai)} - ${formatTime(
                session.waktu_selesai
              )}`}
            />

            <InfoCard
              icon={<CalendarIcon />}
              label="Date"
              value={formatDate(session.tanggal)}
            />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <PlaceholderCard
              icon={<AttendanceIcon />}
              title="Attendance"
              text="The student's attendance record will appear here."
            />

            <PlaceholderCard
              icon={<PhotoIcon />}
              title="Documentation"
              text="Teaching and classroom photos will appear here."
            />

            <PlaceholderCard
              icon={<NoteIcon />}
              title="Teaching Record"
              text="Teacher observation and learning notes will appear here."
            />
          </div>
        </section>

        <footer className="mt-8 pb-7 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/90">
            Imam Nawawi Islamic Boarding School
          </p>
          <p className="mt-2 text-[10px] text-white/60">
            INIBS Smart Digital
          </p>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </main>
  )
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-[1.4rem] border border-slate-100 bg-slate-50/70 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-700 ring-1 ring-blue-100 shadow-sm">
        {icon}
      </div>
      <p className="mt-3 text-[9px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 line-clamp-2 text-sm font-black text-[#071a36]">
        {value}
      </p>
    </div>
  )
}

function PlaceholderCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode
  title: string
  text: string
}) {
  return (
    <div className="rounded-[1.4rem] border border-dashed border-slate-200 bg-slate-50/60 p-5 transition-all duration-300 hover:border-blue-100 hover:bg-blue-50/30">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 ring-1 ring-slate-100">
        {icon}
      </div>
      <h3 className="mt-4 text-sm font-black text-slate-600">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-400">{text}</p>
    </div>
  )
}

function formatTime(value: string) {
  return value.slice(0, 5)
}

function formatDate(value: string) {
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

function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="text-center">
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white bg-white shadow-xl">
          <div className="absolute inset-0 animate-ping rounded-2xl bg-blue-100/50" />
          <div className="relative h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />
        </div>
        <p className="mt-5 text-sm font-black text-slate-700">
          Loading Academic Session...
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Preparing the selected JP
        </p>
      </div>
    </main>
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

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v5M12 17.5h.01" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.2 4.2 3.8 15.5A2 2 0 0 0 5.5 18.5h13a2 2 0 0 0 1.7-3L13.8 4.2a2 2 0 0 0-3.6 0Z" />
    </svg>
  )
}

function HashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" d="M9 4 7 20M17 4l-2 16M4 9h17M3 15h17" />
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

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path strokeLinecap="round" d="M8 3v4M16 3v4M4 9h16" />
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
