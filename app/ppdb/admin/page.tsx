"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import type { ReactNode } from "react"

type Application = {
  id: string
  user_id: string
  nama_lengkap: string | null
  status: string | null
  nomor_pendaftaran: string | null
  created_at: string
}

type Selection = {
  ppdb_id: string
  nilai_akhir: number | null
  keputusan: string | null
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

export default function AdminDashboardPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<Application[]>([])
  const [selections, setSelections] = useState<Selection[]>([])
  const [error, setError] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadDashboard = useCallback(async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setError("")

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        throw new Error(`Gagal memeriksa akun: ${authError.message}`)
      }

      if (!user) {
        router.replace("/login")
        return
      }

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle()

      if (roleError) {
        throw new Error(`Gagal memeriksa hak akses: ${roleError.message}`)
      }

      if (!roleData || roleData.role !== "ADMIN") {
        router.replace("/ppdb")
        return
      }

      const [applicationsResult, selectionsResult] = await Promise.all([
        supabase
          .from("ppdb_applications")
          .select(
            "id,user_id,nama_lengkap,status,nomor_pendaftaran,created_at"
          )
          .order("created_at", { ascending: false }),

        supabase
          .from("ppdb_selections")
          .select("ppdb_id,nilai_akhir,keputusan"),
      ])

      if (applicationsResult.error) {
        throw new Error(
          `Gagal mengambil data pendaftar: ${applicationsResult.error.message}`
        )
      }

      if (selectionsResult.error) {
        throw new Error(
          `Gagal mengambil data seleksi: ${selectionsResult.error.message}`
        )
      }

      setApplications(applicationsResult.data || [])
      setSelections(selectionsResult.data || [])
    } catch (err) {
      console.error("ERROR ADMIN DASHBOARD:", err)
      setError(err instanceof Error ? err.message : "Dashboard gagal dimuat.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [router])

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard])

  const selectionMap = useMemo(() => {
    return new Map(selections.map((item) => [item.ppdb_id, item]))
  }, [selections])

  const total = applications.length

  const menunggu = applications.filter(
    (item) => normalizeStatus(item.status) === "MENUNGGU"
  ).length

  const verifikasi = applications.filter(
    (item) => normalizeStatus(item.status) === "VERIFIKASI"
  ).length

  const seleksiStatus = applications.filter(
    (item) => normalizeStatus(item.status) === "SELEKSI"
  ).length

  const sudahDinilai = selections.filter((item) => {
    return item.nilai_akhir !== null && Number.isFinite(Number(item.nilai_akhir))
  }).length

  const diterima = selections.filter(
    (item) => normalizeStatus(item.keputusan) === "DITERIMA"
  ).length

  const ditolak = selections.filter(
    (item) => normalizeStatus(item.keputusan) === "DITOLAK"
  ).length

  const perluSeleksi = applications.filter((application) => {
    const selection = selectionMap.get(application.id)
    const status = normalizeStatus(application.status)

    return (
      (status === "SELEKSI" || status === "VERIFIKASI") &&
      (!selection || selection.nilai_akhir === null)
    )
  }).length

  const pipeline = [
    {
      label: "Pendaftar",
      value: total,
      href: "/ppdb/admin/pendaftar",
      tone: "blue",
    },
    {
      label: "Verifikasi",
      value: verifikasi,
      href: "/ppdb/admin/verifikasi",
      tone: "cyan",
    },
    {
      label: "Seleksi",
      value: seleksiStatus || perluSeleksi,
      href: "/ppdb/admin/seleksi",
      tone: "purple",
    },
    {
      label: "Sudah Dinilai",
      value: sudahDinilai,
      href: "/ppdb/admin/seleksi",
      tone: "indigo",
    },
    {
      label: "Diterima",
      value: diterima,
      href: "/ppdb/admin/seleksi",
      tone: "emerald",
    },
  ]

  const recentApplications = applications.slice(0, 10)

  function formatDate(value: string) {
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

  async function signOut() {
    await supabase.auth.signOut()
    router.replace("/login")
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-5">
        <div className="w-full max-w-lg rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl shadow-slate-200/50">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-2xl font-black text-red-600">
            !
          </div>
          <h1 className="mt-5 text-xl font-black text-slate-900">
            Dashboard Tidak Dapat Dimuat
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{error}</p>
          <button
            type="button"
            onClick={() => void loadDashboard()}
            className="mt-6 cursor-pointer rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-800 active:scale-95"
          >
            Coba Lagi
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-950 text-white shadow-2xl transition-all duration-300 ease-out ${
          sidebarOpen ? "w-64" : "w-[82px]"
        }`}
      >
        <div className="flex h-20 items-center border-b border-white/10 px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-blue-900 shadow-lg">
              IN
            </div>

            {sidebarOpen && (
              <div className="min-w-0">
                <p className="truncate text-sm font-black tracking-wide">INIBS</p>
                <p className="truncate text-[9px] uppercase tracking-[0.18em] text-white/45">
                  Smart Digital
                </p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-6">
          <SidebarItem
            href="/ppdb/admin"
            label="Dashboard"
            active
            open={sidebarOpen}
            icon={<DashboardIcon />}
          />

          <SidebarItem
            href="/ppdb/admin/pendaftar"
            label="Pendaftar"
            open={sidebarOpen}
            badge={total}
            icon={<UsersIcon />}
          />

          <SidebarItem
            href="/ppdb/admin/verifikasi"
            label="Verifikasi"
            open={sidebarOpen}
            badge={menunggu}
            icon={<VerifyIcon />}
          />

          <SidebarItem
            href="/ppdb/admin/seleksi"
            label="Seleksi"
            open={sidebarOpen}
            badge={perluSeleksi}
            icon={<SelectionIcon />}
          />

          <SidebarItem
            href="/ppdb/admin/hasil"
            label="Hasil PPDB"
            open={sidebarOpen}
            badge={diterima + ditolak}
            icon={<ResultIcon />}
          />

          <div className="my-5 border-t border-white/10" />

          <SidebarItem
            href="/ppdb"
            label="Portal PPDB"
            open={sidebarOpen}
            icon={<HomeIcon />}
          />
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => void signOut()}
            className="group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-white/60 transition-all duration-200 hover:bg-white/10 hover:text-white"
          >
            <LogoutIcon />
            {sidebarOpen && (
              <span className="text-xs font-semibold">Keluar</span>
            )}
          </button>
        </div>
      </aside>

      <div
        className={`min-h-screen transition-all duration-300 ease-out ${
          sidebarOpen ? "ml-64" : "ml-[82px]"
        }`}
      >
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
          <div className="flex h-20 items-center justify-between px-5 sm:px-8">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setSidebarOpen((value) => !value)}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:scale-95"
                aria-label="Buka atau tutup sidebar"
              >
                {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
              </button>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
                  Administrator
                </p>
                <h1 className="text-lg font-black text-slate-900 sm:text-xl">
                  Dashboard PPDB
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void loadDashboard(true)}
              disabled={refreshing}
              className="group flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-wait disabled:opacity-60"
              title="Muat ulang data"
            >
              <RefreshIcon spinning={refreshing} />
              <span className="hidden sm:inline">
                {refreshing ? "Memuat..." : "Refresh"}
              </span>
            </button>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <div className="relative mb-7 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-800 to-cyan-700 p-6 text-white shadow-xl sm:p-8">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-20 right-32 h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl" />

            <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-50">
                    PPDB Admin
                  </span>
                </div>

                <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
                  Selamat datang di Dashboard Admin
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
                  Pantau pendaftaran, verifikasi, dan seleksi calon santri
                  dari satu tempat.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-sm">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-blue-100">
                  Total Pendaftar
                </p>
                <p className="mt-1 text-3xl font-black">{total}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              title="Total Pendaftar"
              value={total}
              description="Seluruh pendaftaran"
              type="total"
            />
            <StatCard
              title="Menunggu"
              value={menunggu}
              description="Menunggu verifikasi"
              type="waiting"
            />
            <StatCard
              title="Verifikasi"
              value={verifikasi}
              description="Sedang diperiksa"
              type="verification"
            />
            <StatCard
              title="Seleksi"
              value={seleksiStatus}
              description="Masuk tahap seleksi"
              type="selection"
            />
            <StatCard
              title="Diterima"
              value={diterima}
              description="Hasil seleksi diterima"
              type="accepted"
            />
            <StatCard
              title="Ditolak"
              value={ditolak}
              description="Hasil seleksi ditolak"
              type="rejected"
            />
          </div>

          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">
                Alur PPDB
              </p>
              <h3 className="mt-1 text-lg font-black text-slate-900">
                Pipeline Pendaftaran
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Ringkasan posisi peserta dalam proses PPDB.
              </p>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-5">
              {pipeline.map((item, index) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group relative rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:bg-white hover:shadow-lg"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      0{index + 1}
                    </span>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${pipelineTone(item.tone)}`}
                    />
                  </div>
                  <p className="mt-4 text-2xl font-black text-slate-900">
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {item.label}
                  </p>

                  {index < pipeline.length - 1 && (
                    <span className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 text-slate-300 md:block">
                      →
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_330px]">
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-700">
                    Monitoring
                  </p>
                  <h3 className="mt-1 text-lg font-black text-slate-900">
                    Pendaftar Terbaru
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Maksimal 10 pendaftaran terakhir.
                  </p>
                </div>

                <Link
                  href="/ppdb/admin/pendaftar"
                  className="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-100"
                >
                  Lihat semua
                  <span className="transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>

              {recentApplications.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Nomor
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Calon Santri
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Status
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Nilai
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Tanggal
                        </th>
                        <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentApplications.map((application) => {
                        const selection = selectionMap.get(application.id)
                        const decision = normalizeStatus(selection?.keputusan)

                        return (
                          <tr
                            key={application.id}
                            className="border-b border-slate-50 transition-colors duration-200 last:border-0 hover:bg-blue-50/30"
                          >
                            <td className="px-6 py-4">
                              <p className="text-xs font-black text-blue-700">
                                {application.nomor_pendaftaran || "-"}
                              </p>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-500">
                                  {(application.nama_lengkap || "?")
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                                <p className="text-sm font-bold text-slate-800">
                                  {application.nama_lengkap || "-"}
                                </p>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <StatusBadge
                                status={decision || application.status}
                              />
                            </td>

                            <td className="px-6 py-4">
                              <p className="text-sm font-black text-slate-700">
                                {selection?.nilai_akhir !== null &&
                                selection?.nilai_akhir !== undefined
                                  ? Number(selection.nilai_akhir).toFixed(2)
                                  : "-"}
                              </p>
                            </td>

                            <td className="px-6 py-4">
                              <p className="text-xs text-slate-500">
                                {formatDate(application.created_at)}
                              </p>
                            </td>

                            <td className="px-6 py-4 text-right">
                              <Link
                                href={
                                  normalizeStatus(application.status) ===
                                    "SELEKSI" ||
                                  selection
                                    ? `/ppdb/admin/seleksi/${application.id}`
                                    : `/ppdb/admin/pendaftar/${application.id}`
                                }
                                className="inline-flex cursor-pointer items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                              >
                                Detail
                              </Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <aside className="space-y-6">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-600">
                  Perlu Tindakan
                </p>
                <h3 className="mt-1 text-lg font-black text-slate-900">
                  Prioritas Admin
                </h3>

                <div className="mt-5 space-y-3">
                  <ActionAlert
                    count={menunggu}
                    title="Pendaftaran menunggu verifikasi"
                    href="/ppdb/admin/verifikasi"
                    tone="amber"
                  />

                  <ActionAlert
                    count={perluSeleksi}
                    title="Peserta belum selesai dinilai"
                    href="/ppdb/admin/seleksi"
                    tone="purple"
                  />

                  {menunggu === 0 && perluSeleksi === 0 && (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-sm font-black text-emerald-700">
                          ✓
                        </div>
                        <div>
                          <p className="text-xs font-black text-emerald-800">
                            Tidak ada tugas mendesak
                          </p>
                          <p className="mt-0.5 text-[10px] text-emerald-700/70">
                            Data PPDB sudah tertangani.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">
                  Akses Cepat
                </p>

                <div className="mt-4 space-y-2">
                  <QuickLink
                    href="/ppdb/admin/pendaftar"
                    label="Kelola Pendaftar"
                    icon={<UsersIcon />}
                  />
                  <QuickLink
                    href="/ppdb/admin/verifikasi"
                    label="Periksa Verifikasi"
                    icon={<VerifyIcon />}
                  />
                  <QuickLink
                    href="/ppdb/admin/seleksi"
                    label="Proses Seleksi"
                    icon={<SelectionIcon />}
                  />

                  <QuickLink
                    href="/ppdb/admin/hasil"
                    label="Lihat Hasil PPDB"
                    icon={<ResultIcon />}
                  />
                </div>
              </section>
            </aside>
          </div>

          <footer className="py-8 text-center">
            <p className="text-xs font-semibold text-slate-500">
              INIBS Smart Digital
            </p>
            <p className="mt-1 text-[10px] text-slate-400">
              Imam Nawawi Islamic Boarding School
            </p>
          </footer>
        </section>
      </div>
    </main>
  )
}

function normalizeStatus(value: string | null | undefined) {
  return String(value || "").trim().toUpperCase()
}

function pipelineTone(tone: string) {
  const classes: Record<string, string> = {
    blue: "bg-blue-600",
    cyan: "bg-cyan-500",
    purple: "bg-purple-600",
    indigo: "bg-indigo-600",
    emerald: "bg-emerald-500",
  }

  return classes[tone] || classes.blue
}

function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />
        <p className="mt-5 text-sm font-black text-slate-600">
          Memuat dashboard admin...
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Mengambil data PPDB terbaru
        </p>
      </div>
    </main>
  )
}

function SidebarItem({
  href,
  label,
  icon,
  active = false,
  open,
  badge,
}: {
  href: string
  label: string
  icon: ReactNode
  active?: boolean
  open: boolean
  badge?: number
}) {
  return (
    <Link
      href={href}
      title={!open ? label : undefined}
      className={`group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 ${
        active
          ? "bg-white text-blue-900 shadow-lg"
          : "text-white/60 hover:bg-white/10 hover:text-white"
      }`}
    >
      <span className="shrink-0 transition-transform duration-200 group-hover:scale-110">
        {icon}
      </span>

      {open && (
        <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
          <span className="truncate text-xs font-semibold">{label}</span>

          {typeof badge === "number" && badge > 0 && (
            <span
              className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[9px] font-black ${
                active
                  ? "bg-blue-100 text-blue-700"
                  : "bg-white/10 text-white"
              }`}
            >
              {badge > 99 ? "99+" : badge}
            </span>
          )}
        </span>
      )}
    </Link>
  )
}

function StatCard({
  title,
  value,
  description,
  type,
}: {
  title: string
  value: number
  description: string
  type:
    | "total"
    | "waiting"
    | "verification"
    | "selection"
    | "accepted"
    | "rejected"
}) {
  const iconClass = {
    total: "bg-blue-50 text-blue-700",
    waiting: "bg-amber-50 text-amber-700",
    verification: "bg-cyan-50 text-cyan-700",
    selection: "bg-purple-50 text-purple-700",
    accepted: "bg-emerald-50 text-emerald-700",
    rejected: "bg-red-50 text-red-700",
  }[type]

  const icon = {
    total: <DashboardIcon />,
    waiting: <ClockIcon />,
    verification: <VerifyIcon />,
    selection: <SelectionIcon />,
    accepted: <CheckCircleIcon />,
    rejected: <XCircleIcon />,
  }[type]

  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-400">{description}</p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string | null | undefined }) {
  const normalized = normalizeStatus(status)

  const className =
    normalized === "MENUNGGU"
      ? "bg-amber-50 text-amber-700 border-amber-100"
      : normalized === "VERIFIKASI"
        ? "bg-blue-50 text-blue-700 border-blue-100"
        : normalized === "SELEKSI"
          ? "bg-purple-50 text-purple-700 border-purple-100"
          : normalized === "DITERIMA"
            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
            : normalized === "DITOLAK"
              ? "bg-red-50 text-red-700 border-red-100"
              : "bg-slate-50 text-slate-600 border-slate-200"

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-[10px] font-black ${className}`}
    >
      {normalized || "BELUM ADA"}
    </span>
  )
}

function ActionAlert({
  count,
  title,
  href,
  tone,
}: {
  count: number
  title: string
  href: string
  tone: "amber" | "purple"
}) {
  const isAmber = tone === "amber"

  return (
    <Link
      href={href}
      className={`group flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        isAmber
          ? "border-amber-100 bg-amber-50/70 hover:bg-amber-50"
          : "border-purple-100 bg-purple-50/70 hover:bg-purple-50"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
          isAmber
            ? "bg-amber-100 text-amber-700"
            : "bg-purple-100 text-purple-700"
        }`}
      >
        {count}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`text-xs font-black ${
            isAmber ? "text-amber-800" : "text-purple-800"
          }`}
        >
          {title}
        </p>
        <p
          className={`mt-0.5 text-[10px] ${
            isAmber ? "text-amber-700/60" : "text-purple-700/60"
          }`}
        >
          Buka sekarang
        </p>
      </div>

      <span className="text-sm text-slate-300 transition-transform duration-200 group-hover:translate-x-1">
        →
      </span>
    </Link>
  )
}

function QuickLink({
  href,
  label,
  icon,
}: {
  href: string
  label: string
  icon: ReactNode
}) {
  return (
    <Link
      href={href}
      className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-100 hover:bg-blue-50"
    >
      <span className="text-slate-400 transition-colors duration-200 group-hover:text-blue-700">
        {icon}
      </span>
      <span className="flex-1 text-xs font-bold text-slate-600 transition-colors duration-200 group-hover:text-blue-700">
        {label}
      </span>
      <span className="text-xs text-slate-300 transition-transform duration-200 group-hover:translate-x-1">
        →
      </span>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <DocumentIcon />
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-600">
        Belum ada pendaftar
      </p>
      <p className="mt-1 text-xs text-slate-400">
        Data akan muncul ketika calon santri mengajukan pendaftaran.
      </p>
    </div>
  )
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="9" cy="8" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 20a6 6 0 0 1 12 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 5a3 3 0 0 1 0 6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 14a5 5 0 0 1 3 6" />
    </svg>
  )
}

function VerifyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 4.5 6v5.5c0 4.7 3.1 7.9 7.5 9.5 4.4-1.6 7.5-4.8 7.5-9.5V6L12 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
    </svg>
  )
}

function SelectionIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h12l-2 4 2 4H4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 19h-7" />
    </svg>
  )
}

function ResultIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m8 12 2.5 2.5L16 9" />
      <path strokeLinecap="round" d="M8 7h8" />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 3l9 7.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 9.5V21h14V9.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21v-6h6v6" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 17l5-5-5-5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 19V5a2 2 0 0 0-2-2h-6" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinecap="round" d="M4 7h16" />
      <path strokeLinecap="round" d="M4 12h16" />
      <path strokeLinecap="round" d="M4 17h16" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" d="M6 6l12 12" />
      <path strokeLinecap="round" d="M18 6 6 18" />
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

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="12" cy="12" r="8" />
      <path strokeLinecap="round" d="M12 8v4l2.5 2" />
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="12" cy="12" r="8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.5 12 2.2 2.2 4.8-5" />
    </svg>
  )
}

function XCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="12" cy="12" r="8" />
      <path strokeLinecap="round" d="m9 9 6 6" />
      <path strokeLinecap="round" d="m15 9-6 6" />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path strokeLinecap="round" d="M8 8h8" />
      <path strokeLinecap="round" d="M8 12h8" />
      <path strokeLinecap="round" d="M8 16h5" />
    </svg>
  )
}
