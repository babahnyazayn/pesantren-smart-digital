"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

type Application = {
  id: string
  user_id: string
  nama_lengkap: string | null
  nik: string | null
  nisn: string | null
  tempat_lahir: string | null
  tanggal_lahir: string | null
  jenis_kelamin: string | null
  asal_sekolah: string | null
  npsn: string | null
  whatsapp: string | null
  alamat: string | null
  status: string | null
  created_at: string
  updated_at: string | null
  nomor_pendaftaran: string | null
}

type Selection = {
  ppdb_id: string
  nilai_akhir: number | null
  keputusan: string | null
}

type ApplicationWithSelection = Application & {
  selection: Selection | null
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

export default function SeleksiPage() {
  const router = useRouter()

  const [applications, setApplications] = useState<ApplicationWithSelection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [search, setSearch] = useState("")
  const [genderFilter, setGenderFilter] = useState("SEMUA")
  const [resultFilter, setResultFilter] = useState("SEMUA")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadApplications() {
      try {
        setLoading(true)
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

        const { data: applicationData, error: applicationError } =
          await supabase
            .from("ppdb_applications")
            .select(`
              id,
              user_id,
              nama_lengkap,
              nik,
              nisn,
              tempat_lahir,
              tanggal_lahir,
              jenis_kelamin,
              asal_sekolah,
              npsn,
              whatsapp,
              alamat,
              status,
              created_at,
              updated_at,
              nomor_pendaftaran
            `)
            .eq("status", "VERIFIKASI")
            .order("updated_at", { ascending: false })

        if (applicationError) {
          throw new Error(
            `Gagal mengambil peserta seleksi: ${applicationError.message}`
          )
        }

        const apps = (applicationData || []) as Application[]
        const ids = apps.map((item) => item.id)

        let selectionMap = new Map<string, Selection>()

        if (ids.length > 0) {
          const { data: selectionData, error: selectionError } = await supabase
            .from("ppdb_selections")
            .select("ppdb_id, nilai_akhir, keputusan")
            .in("ppdb_id", ids)

          if (selectionError) {
            throw new Error(
              `Gagal mengambil hasil seleksi: ${selectionError.message}`
            )
          }

          selectionMap = new Map(
            ((selectionData || []) as Selection[]).map((item) => [
              item.ppdb_id,
              item,
            ])
          )
        }

        const merged = apps.map((application) => ({
          ...application,
          selection: selectionMap.get(application.id) || null,
        }))

        if (mounted) {
          setApplications(merged)
        }
      } catch (err) {
        console.error("ERROR HALAMAN SELEKSI:", err)

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Data peserta seleksi gagal dimuat."
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadApplications()

    return () => {
      mounted = false
    }
  }, [router])

  const maleCount = applications.filter(
    (item) => normalizeGender(item.jenis_kelamin) === "Laki-laki"
  ).length

  const femaleCount = applications.filter(
    (item) => normalizeGender(item.jenis_kelamin) === "Perempuan"
  ).length

  const scoredCount = applications.filter(
    (item) => item.selection?.nilai_akhir !== null &&
      item.selection?.nilai_akhir !== undefined
  ).length

  const unscoredCount = applications.length - scoredCount

  const acceptedCount = applications.filter(
    (item) => normalizeDecision(item.selection?.keputusan) === "DITERIMA"
  ).length

  const rejectedCount = applications.filter(
    (item) => normalizeDecision(item.selection?.keputusan) === "DITOLAK"
  ).length

  const rankedApplications = useMemo(() => {
    const withScore = applications
      .filter(
        (item) =>
          item.selection?.nilai_akhir !== null &&
          item.selection?.nilai_akhir !== undefined
      )
      .sort(
        (a, b) =>
          Number(b.selection?.nilai_akhir || 0) -
          Number(a.selection?.nilai_akhir || 0)
      )

    const rankMap = new Map<string, number>()

    withScore.forEach((item, index) => {
      rankMap.set(item.id, index + 1)
    })

    return rankMap
  }, [applications])

  const filteredApplications = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    return applications.filter((application) => {
      const searchableText = [
        application.nama_lengkap,
        application.nomor_pendaftaran,
        application.nik,
        application.nisn,
        application.asal_sekolah,
        application.npsn,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      const matchesSearch =
        !keyword || searchableText.includes(keyword)

      const normalizedGender = normalizeGender(
        application.jenis_kelamin
      )

      const matchesGender =
        genderFilter === "SEMUA" ||
        normalizedGender === genderFilter

      const decision = normalizeDecision(
        application.selection?.keputusan
      )

      const hasScore =
        application.selection?.nilai_akhir !== null &&
        application.selection?.nilai_akhir !== undefined

      let matchesResult = true

      if (resultFilter === "BELUM_DINILAI") {
        matchesResult = !hasScore
      } else if (resultFilter === "SUDAH_DINILAI") {
        matchesResult = hasScore
      } else if (resultFilter === "DITERIMA") {
        matchesResult = decision === "DITERIMA"
      } else if (resultFilter === "DITOLAK") {
        matchesResult = decision === "DITOLAK"
      }

      return matchesSearch && matchesGender && matchesResult
    })
  }, [
    applications,
    search,
    genderFilter,
    resultFilter,
  ])

  function formatDate(value: string | null) {
    if (!value) return "-"

    try {
      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    } catch {
      return value
    }
  }

  function formatScore(value: number | null | undefined) {
    if (value === null || value === undefined) return "-"
    return Number(value).toFixed(2)
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />
          <p className="mt-5 text-sm font-semibold text-slate-500">
            Memuat peserta seleksi...
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Mohon tunggu sebentar
          </p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-red-50/40 px-5">
        <div className="w-full max-w-lg rounded-3xl border border-red-200/80 bg-white p-8 text-center shadow-xl shadow-slate-200/50">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-2xl font-black text-red-600">
            !
          </div>

          <h1 className="mt-5 text-xl font-black text-slate-900">
            Data Seleksi Tidak Dapat Dimuat
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 cursor-pointer rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-lg active:scale-95"
          >
            Coba Lagi
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 text-slate-800">
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-950
          text-white shadow-2xl transition-all duration-300 ease-out
          ${sidebarOpen ? "w-64" : "w-[82px]"}
        `}
      >
        <div className="flex h-20 items-center border-b border-white/10 px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-blue-900 shadow-lg">
              IN
            </div>

            {sidebarOpen && (
              <div className="min-w-0">
                <p className="truncate text-sm font-black tracking-wide">
                  INIBS
                </p>
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
            open={sidebarOpen}
            icon={<DashboardIcon />}
          />

          <SidebarItem
            href="/ppdb/admin/pendaftar"
            label="Pendaftar"
            open={sidebarOpen}
            icon={<UsersIcon />}
          />

          <SidebarItem
            href="/ppdb/admin/verifikasi"
            label="Verifikasi"
            open={sidebarOpen}
            icon={<VerificationIcon />}
          />

          <SidebarItem
            href="/ppdb/admin/seleksi"
            label="Seleksi"
            open={sidebarOpen}
            active
            badge={applications.length}
            icon={<SelectionIcon />}
          />
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut()
              router.replace("/login")
            }}
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
        className={`
          min-h-screen transition-all duration-300
          ${sidebarOpen ? "ml-64" : "ml-[82px]"}
        `}
      >
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl">
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
                  Seleksi PPDB
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Tahap
                </p>
                <p className="text-xs font-black text-blue-700">
                  Seleksi Calon Santri
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-blue-700">
                A
              </div>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/70 p-6 shadow-lg shadow-slate-200/50 sm:p-8">
            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-blue-700 via-cyan-500 to-blue-700" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">
                    Tahap Seleksi Aktif
                  </span>
                </div>

                <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  Calon Santri Lolos Verifikasi
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Pantau proses penilaian, nilai akhir, ranking, dan keputusan calon santri dalam satu halaman.
                </p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-white/80 px-5 py-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Peserta Seleksi
                </p>
                <p className="mt-1 text-3xl font-black text-blue-700">
                  {applications.length}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              label="Total Peserta"
              value={applications.length}
              icon={<SelectionIcon />}
              iconClass="bg-blue-50 text-blue-700"
            />

            <StatCard
              label="Belum Dinilai"
              value={unscoredCount}
              icon={<ClockIcon />}
              iconClass="bg-amber-50 text-amber-700"
            />

            <StatCard
              label="Sudah Dinilai"
              value={scoredCount}
              icon={<CheckIcon />}
              iconClass="bg-emerald-50 text-emerald-700"
            />

            <StatCard
              label="Diterima"
              value={acceptedCount}
              icon={<SuccessIcon />}
              iconClass="bg-indigo-50 text-indigo-700"
            />

            <StatCard
              label="Ditolak"
              value={rejectedCount}
              icon={<RejectedIcon />}
              iconClass="bg-red-50 text-red-700"
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Laki-laki"
              value={maleCount}
              icon={<MaleIcon />}
              iconClass="bg-indigo-50 text-indigo-700"
            />

            <StatCard
              label="Perempuan"
              value={femaleCount}
              icon={<FemaleIcon />}
              iconClass="bg-pink-50 text-pink-700"
            />
          </div>

          <div className="mt-7 rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-sm backdrop-blur-sm">
            <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px_auto] lg:items-end">
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Cari Peserta
                </label>

                <div className="group relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-blue-600">
                    <SearchIcon />
                  </div>

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Nama, nomor pendaftaran, NIK, NISN, atau sekolah..."
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Jenis Kelamin
                </label>

                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="h-12 w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition-all duration-200 hover:border-slate-300 hover:bg-white focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                >
                  <option value="SEMUA">Semua</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Hasil Seleksi
                </label>

                <select
                  value={resultFilter}
                  onChange={(e) => setResultFilter(e.target.value)}
                  className="h-12 w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition-all duration-200 hover:border-slate-300 hover:bg-white focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                >
                  <option value="SEMUA">Semua</option>
                  <option value="BELUM_DINILAI">Belum Dinilai</option>
                  <option value="SUDAH_DINILAI">Sudah Dinilai</option>
                  <option value="DITERIMA">Diterima</option>
                  <option value="DITOLAK">Ditolak</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSearch("")
                  setGenderFilter("SEMUA")
                  setResultFilter("SEMUA")
                }}
                className="h-12 cursor-pointer rounded-xl border border-slate-200 bg-white px-5 text-xs font-bold text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:scale-95"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-black tracking-tight text-slate-900">
                  Daftar Peserta Seleksi
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Ranking dihitung otomatis berdasarkan nilai akhir tertinggi.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <span className="text-xs font-bold text-slate-500">
                    {filteredApplications.length}
                    <span className="mx-1 text-slate-300">/</span>
                    {applications.length} peserta
                  </span>
                </div>
              </div>
            </div>

            {filteredApplications.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <SearchIcon />
                </div>

                <h4 className="mt-5 text-sm font-bold text-slate-700">
                  Tidak ada peserta ditemukan
                </h4>

                <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
                  Belum ada peserta yang sesuai dengan pencarian atau filter yang dipilih.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1250px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                      <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Ranking
                      </th>
                      <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        No. Pendaftaran
                      </th>
                      <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Calon Santri
                      </th>
                      <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Asal Sekolah
                      </th>
                      <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Jenis Kelamin
                      </th>
                      <th className="px-5 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Nilai Akhir
                      </th>
                      <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Keputusan
                      </th>
                      <th className="px-5 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredApplications.map((application) => {
                      const score = application.selection?.nilai_akhir
                      const decision = normalizeDecision(
                        application.selection?.keputusan
                      )
                      const rank = rankedApplications.get(application.id)

                      return (
                        <tr
                          key={application.id}
                          className="border-b border-slate-100/80 transition-all duration-200 last:border-0 hover:bg-blue-50/40"
                        >
                          <td className="px-5 py-4">
                            {rank ? (
                              <div className="inline-flex h-9 min-w-9 items-center justify-center rounded-xl bg-blue-50 px-2 text-xs font-black text-blue-700 ring-1 ring-blue-100">
                                #{rank}
                              </div>
                            ) : (
                              <span className="text-sm font-bold text-slate-300">
                                -
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-black text-blue-700">
                              {application.nomor_pendaftaran || "-"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-sm font-black text-blue-700 ring-1 ring-blue-100">
                                {(application.nama_lengkap || "?")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-slate-800">
                                  {application.nama_lengkap || "-"}
                                </p>
                                <p className="mt-0.5 text-[10px] text-slate-400">
                                  NISN: {application.nisn || "-"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <p className="max-w-[220px] truncate text-xs font-semibold text-slate-700">
                              {application.asal_sekolah || "-"}
                            </p>
                            <p className="mt-1 text-[10px] text-slate-400">
                              NPSN: {application.npsn || "-"}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <span className="text-xs font-medium text-slate-600">
                              {normalizeGender(application.jenis_kelamin)}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-center">
                            {score !== null && score !== undefined ? (
                              <div className="inline-flex min-w-[78px] flex-col items-center rounded-xl bg-emerald-50 px-3 py-2 ring-1 ring-emerald-100">
                                <span className="text-base font-black text-emerald-700">
                                  {formatScore(score)}
                                </span>
                                <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-600/70">
                                  Nilai Akhir
                                </span>
                              </div>
                            ) : (
                              <span className="inline-flex rounded-xl bg-amber-50 px-3 py-2 text-[10px] font-black text-amber-700 ring-1 ring-amber-100">
                                BELUM DINILAI
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <DecisionBadge decision={decision} />
                          </td>

                          <td className="px-5 py-4 text-right">
                            <Link
                              href={`/ppdb/admin/seleksi/${application.id}`}
                              className="group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-lg active:scale-95"
                            >
                              {score !== null && score !== undefined
                                ? "Detail Seleksi"
                                : "Proses Seleksi"}

                              <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                                <ArrowIcon />
                              </span>
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
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

function normalizeDecision(value: string | null | undefined) {
  if (!value) return ""
  return value.trim().toUpperCase()
}

function DecisionBadge({
  decision,
}: {
  decision: string
}) {
  if (decision === "DITERIMA") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-emerald-700">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[9px] text-white">
          ✓
        </span>
        DITERIMA
      </span>
    )
  }

  if (decision === "DITOLAK") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-[10px] font-black text-red-700">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] text-white">
          ×
        </span>
        DITOLAK
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-black text-slate-500">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      BELUM DIPUTUSKAN
    </span>
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
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" />
    </svg>
  )
}

function SuccessIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 3 2.5 5.2 5.5.8-4 4 1 5.5-5-2.7-5 2.7 1-5.5-4-4 5.5-.8L12 3Z" />
    </svg>
  )
}

function RejectedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" d="m9 9 6 6M15 9l-6 6" />
    </svg>
  )
}

/* =============================================================
   SIDEBAR
   ============================================================= */

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
  icon: React.ReactNode
  active?: boolean
  open: boolean
  badge?: number
}) {
  return (
    <Link
      href={href}
      title={!open ? label : undefined}
      className={`
        group
        flex
        cursor-pointer
        items-center
        gap-3
        rounded-xl
        px-3
        py-3
        transition-all
        duration-200
        ${
          active
            ? "bg-white text-blue-900 shadow-lg"
            : "text-white/60 hover:bg-white/10 hover:text-white"
        }
      `}
    >

      <span className="shrink-0 transition-transform duration-200 group-hover:scale-110">
        {icon}
      </span>

      {open && (

        <span className="flex min-w-0 flex-1 items-center justify-between gap-2">

          <span className="truncate text-xs font-semibold">
            {label}
          </span>

          {typeof badge === "number" &&
            badge > 0 && (

              <span
                className={`
                  flex
                  h-5
                  min-w-5
                  items-center
                  justify-center
                  rounded-full
                  px-1.5
                  text-[9px]
                  font-black
                  ${
                    active
                      ? "bg-blue-100 text-blue-700"
                      : "bg-white/10 text-white"
                  }
                `}
              >
                {badge > 99
                  ? "99+"
                  : badge}
              </span>

            )}

        </span>

      )}

    </Link>
  )
}


/* =============================================================
   STAT CARD
   ============================================================= */

function StatCard({
  label,
  value,
  icon,
  iconClass,
}: {
  label: string
  value: number
  icon: React.ReactNode
  iconClass: string
}) {
  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">

      <div className="flex items-center justify-between gap-4">

        <div>

          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-3xl font-black text-slate-900">
            {value}
          </p>

        </div>

        <div
          className={`
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            transition-all
            duration-300
            group-hover:scale-110
            ${iconClass}
          `}
        >
          {icon}
        </div>

      </div>

    </div>
  )
}


/* =============================================================
   NORMALIZE GENDER
   ============================================================= */

function normalizeGender(
  value: string | null
) {
  if (!value) return "-"

  const normalized =
    value.trim().toLowerCase()

  if (
    normalized === "l" ||
    normalized === "laki-laki" ||
    normalized === "laki laki" ||
    normalized === "male"
  ) {
    return "Laki-laki"
  }

  if (
    normalized === "p" ||
    normalized === "perempuan" ||
    normalized === "female"
  ) {
    return "Perempuan"
  }

  return value
}


/* =============================================================
   ICONS
   ============================================================= */

function DashboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <rect
        x="3"
        y="3"
        width="7"
        height="7"
        rx="1"
      />
      <rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="1"
      />
      <rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="1"
      />
      <rect
        x="14"
        y="14"
        width="7"
        height="7"
        rx="1"
      />
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
      className="h-5 w-5"
    >
      <circle
        cx="9"
        cy="8"
        r="3"
      />
      <path
        strokeLinecap="round"
        d="M3 20a6 6 0 0 1 12 0"
      />
      <path
        strokeLinecap="round"
        d="M16 5a3 3 0 0 1 0 6"
      />
      <path
        strokeLinecap="round"
        d="M18 14a5 5 0 0 1 3 6"
      />
    </svg>
  )
}

function VerificationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3 4.5 6v5.5c0 4.7 3.1 7.9 7.5 9.5 4.4-1.6 7.5-4.8 7.5-9.5V6L12 3Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m9 12 2 2 4-4"
      />
    </svg>
  )
}

function SelectionIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        d="M4 19V5"
      />
      <path
        strokeLinecap="round"
        d="M4 5h12l-2 4 2 4H4"
      />
      <path
        strokeLinecap="round"
        d="M20 19h-7"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <circle
        cx="11"
        cy="11"
        r="6.5"
      />
      <path
        strokeLinecap="round"
        d="m16 16 5 5"
      />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12h13"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m13 6 6 6-6 6"
      />
    </svg>
  )
}

function MaleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <circle
        cx="10"
        cy="14"
        r="5"
      />
      <path
        strokeLinecap="round"
        d="m14 10 6-6"
      />
      <path
        strokeLinecap="round"
        d="M15 4h5v5"
      />
    </svg>
  )
}

function FemaleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <circle
        cx="12"
        cy="9"
        r="5"
      />
      <path
        strokeLinecap="round"
        d="M12 14v7"
      />
      <path
        strokeLinecap="round"
        d="M9 18h6"
      />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5 shrink-0"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 17l5-5-5-5"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12H3"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 19V5a2 2 0 0 0-2-2h-6"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        d="M6 6l12 12"
      />
      <path
        strokeLinecap="round"
        d="M18 6 6 18"
      />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        d="M4 7h16"
      />
      <path
        strokeLinecap="round"
        d="M4 12h16"
      />
      <path
        strokeLinecap="round"
        d="M4 17h16"
      />
    </svg>
  )
}