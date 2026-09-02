"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

type Application = {
  id: string
  nama_lengkap: string | null
  nomor_pendaftaran: string | null
  asal_sekolah: string | null
  status: string | null
  created_at: string
}

type Selection = {
  id: string
  ppdb_id: string
  nilai_akhir: number | null
  keputusan: string | null
  catatan: string | null
}

type ResultRow = Application & {
  selection: Selection | null
  rank: number | null
}

type FilterType = "SEMUA" | "DITERIMA" | "DITOLAK" | "BELUM"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

export default function HasilPPDBPage() {
  const router = useRouter()

  const [data, setData] = useState<ResultRow[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterType>("SEMUA")

  const loadData = useCallback(async (silent = false) => {
    try {
      silent ? setRefreshing(true) : setLoading(true)
      setError("")

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) throw new Error(authError.message)

      if (!user) {
        router.replace("/login")
        return
      }

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle()

      if (roleError) throw new Error(roleError.message)

      if (!roleData || roleData.role !== "ADMIN") {
        router.replace("/ppdb")
        return
      }

      const [applicationsResult, selectionsResult] = await Promise.all([
        supabase
          .from("ppdb_applications")
          .select(
            "id,nama_lengkap,nomor_pendaftaran,asal_sekolah,status,created_at"
          )
          .order("created_at", { ascending: false }),

        supabase
          .from("ppdb_selections")
          .select("id,ppdb_id,nilai_akhir,keputusan,catatan"),
      ])

      if (applicationsResult.error) {
        throw new Error(applicationsResult.error.message)
      }

      if (selectionsResult.error) {
        throw new Error(selectionsResult.error.message)
      }

      const selectionMap = new Map<string, Selection>()

      ;(selectionsResult.data || []).forEach((selection) => {
        selectionMap.set(selection.ppdb_id, selection)
      })

      const results = (applicationsResult.data || []).map((application) => ({
        ...application,
        selection: selectionMap.get(application.id) || null,
        rank: null,
      }))

      const ranked = [...results]
        .filter(
          (item) =>
            item.selection?.nilai_akhir !== null &&
            item.selection?.nilai_akhir !== undefined &&
            Number.isFinite(Number(item.selection.nilai_akhir))
        )
        .sort(
          (a, b) =>
            Number(b.selection?.nilai_akhir) -
            Number(a.selection?.nilai_akhir)
        )

      const rankMap = new Map<string, number>()

      ranked.forEach((item, index) => {
        rankMap.set(item.id, index + 1)
      })

      setData(
        results.map((item) => ({
          ...item,
          rank: rankMap.get(item.id) || null,
        }))
      )
    } catch (err) {
      console.error("ERROR HASIL PPDB:", err)

      setError(
        err instanceof Error
          ? err.message
          : "Data hasil PPDB gagal dimuat."
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [router])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const statistics = useMemo(() => {
    const diterima = data.filter(
      (item) => normalize(item.selection?.keputusan) === "DITERIMA"
    ).length

    const ditolak = data.filter(
      (item) => normalize(item.selection?.keputusan) === "DITOLAK"
    ).length

    const belum = data.filter(
      (item) => normalize(item.selection?.keputusan) !== "DITERIMA" &&
        normalize(item.selection?.keputusan) !== "DITOLAK"
    ).length

    const dinilai = data.filter(
      (item) =>
        item.selection?.nilai_akhir !== null &&
        item.selection?.nilai_akhir !== undefined
    ).length

    return {
      total: data.length,
      dinilai,
      diterima,
      ditolak,
      belum,
    }
  }, [data])

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    return [...data]
      .filter((item) => {
        const decision = normalize(item.selection?.keputusan)

        if (filter === "DITERIMA") return decision === "DITERIMA"
        if (filter === "DITOLAK") return decision === "DITOLAK"

        if (filter === "BELUM") {
          return decision !== "DITERIMA" && decision !== "DITOLAK"
        }

        return true
      })
      .filter((item) => {
        if (!keyword) return true

        return (
          String(item.nama_lengkap || "")
            .toLowerCase()
            .includes(keyword) ||
          String(item.nomor_pendaftaran || "")
            .toLowerCase()
            .includes(keyword) ||
          String(item.asal_sekolah || "")
            .toLowerCase()
            .includes(keyword)
        )
      })
      .sort((a, b) => {
        if (a.rank !== null && b.rank !== null) return a.rank - b.rank
        if (a.rank !== null) return -1
        if (b.rank !== null) return 1
        return String(a.nama_lengkap || "").localeCompare(
          String(b.nama_lengkap || ""),
          "id"
        )
      })
  }, [data, filter, search])

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
            Gagal Memuat Hasil PPDB
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() => void loadData()}
            className="mt-6 cursor-pointer rounded-xl bg-blue-700 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-800 active:scale-95"
          >
            Coba Lagi
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 text-slate-800">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/ppdb/admin"
              className="group flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:-translate-x-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:scale-95"
              aria-label="Kembali ke dashboard"
            >
              <span className="text-lg transition-transform duration-200 group-hover:-translate-x-0.5">
                ←
              </span>
            </Link>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-700">
                PPDB Admin
              </p>

              <h1 className="mt-0.5 text-lg font-black text-slate-900 sm:text-xl">
                Hasil Seleksi PPDB
              </h1>
            </div>
          </div>

          <button
            type="button"
            disabled={refreshing}
            onClick={() => void loadData(true)}
            className="group flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshIcon spinning={refreshing} />
            <span className="hidden sm:inline">
              {refreshing ? "Memuat..." : "Refresh"}
            </span>
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-7 sm:px-8 sm:py-9">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-800 to-cyan-700 p-6 text-white shadow-xl shadow-blue-200/40 sm:p-8">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 right-48 h-48 w-48 rounded-full bg-cyan-300/10 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-50">
                Rekapitulasi Seleksi
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Hasil Seleksi Calon Santri
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
                  Pantau peringkat, nilai akhir, dan keputusan seluruh calon
                  santri dalam satu halaman.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-sm">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-blue-100">
                  Peserta Dinilai
                </p>
                <p className="mt-1 text-3xl font-black">
                  {statistics.dinilai}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Total Pendaftar"
            value={statistics.total}
            icon="P"
            tone="blue"
          />

          <StatCard
            label="Sudah Dinilai"
            value={statistics.dinilai}
            icon="S"
            tone="purple"
          />

          <StatCard
            label="Diterima"
            value={statistics.diterima}
            icon="✓"
            tone="green"
          />

          <StatCard
            label="Ditolak"
            value={statistics.ditolak}
            icon="×"
            tone="red"
          />

          <StatCard
            label="Belum Diputuskan"
            value={statistics.belum}
            icon="?"
            tone="amber"
          />
        </div>

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">
                  Daftar Peserta
                </p>

                <h2 className="mt-1 text-lg font-black text-slate-900">
                  Ranking & Hasil Seleksi
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Ranking dihitung otomatis berdasarkan nilai akhir tertinggi.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <SearchIcon />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cari nama, nomor, sekolah..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs font-semibold text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-300 hover:border-slate-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 sm:w-[280px]"
                  />
                </div>

                <select
                  value={filter}
                  onChange={(event) =>
                    setFilter(event.target.value as FilterType)
                  }
                  className="h-11 cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-black text-slate-600 outline-none transition-all duration-200 hover:border-blue-200 hover:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="SEMUA">Semua Hasil</option>
                  <option value="DITERIMA">Diterima</option>
                  <option value="DITOLAK">Ditolak</option>
                  <option value="BELUM">Belum Diputuskan</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <FilterButton
                active={filter === "SEMUA"}
                onClick={() => setFilter("SEMUA")}
                label="Semua"
                count={statistics.total}
              />

              <FilterButton
                active={filter === "DITERIMA"}
                onClick={() => setFilter("DITERIMA")}
                label="Diterima"
                count={statistics.diterima}
              />

              <FilterButton
                active={filter === "DITOLAK"}
                onClick={() => setFilter("DITOLAK")}
                label="Ditolak"
                count={statistics.ditolak}
              />

              <FilterButton
                active={filter === "BELUM"}
                onClick={() => setFilter("BELUM")}
                label="Belum Diputuskan"
                count={statistics.belum}
              />
            </div>
          </div>

          {filteredData.length === 0 ? (
            <EmptyState search={search} filter={filter} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-left">
                    <th className="w-24 px-6 py-4 text-center text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Ranking
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Calon Santri
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Nomor Pendaftaran
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Asal Sekolah
                    </th>

                    <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Nilai Akhir
                    </th>

                    <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Keputusan
                    </th>

                    <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredData.map((item) => (
                    <ResultTableRow key={item.id} item={item} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="py-8 text-center">
          <p className="text-xs font-semibold text-slate-500">
            INIBS Smart Digital
          </p>
          <p className="mt-1 text-[10px] text-slate-400">
            Imam Nawawi Islamic Boarding School
          </p>
        </footer>
      </section>
    </main>
  )
}

function ResultTableRow({ item }: { item: ResultRow }) {
  const decision = normalize(item.selection?.keputusan)
  const score =
    item.selection?.nilai_akhir !== null &&
    item.selection?.nilai_akhir !== undefined
      ? Number(item.selection.nilai_akhir)
      : null

  return (
    <tr className="group border-b border-slate-50 transition-all duration-200 last:border-0 hover:bg-blue-50/30">
      <td className="px-6 py-4 text-center">
        <RankBadge rank={item.rank} />
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-500 transition-all duration-200 group-hover:scale-105 group-hover:bg-blue-100 group-hover:text-blue-700">
            {(item.nama_lengkap || "?").charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-black text-slate-800">
              {item.nama_lengkap || "-"}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-400">
              ID {item.id.slice(0, 8)}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <span className="text-xs font-black text-blue-700">
          {item.nomor_pendaftaran || "-"}
        </span>
      </td>

      <td className="max-w-[220px] px-5 py-4">
        <p className="truncate text-xs text-slate-500">
          {item.asal_sekolah || "-"}
        </p>
      </td>

      <td className="px-5 py-4 text-center">
        {score !== null && Number.isFinite(score) ? (
          <span className="inline-flex min-w-[76px] items-center justify-center rounded-xl bg-blue-50 px-3 py-2 text-sm font-black text-blue-800 transition-all duration-200 group-hover:bg-blue-100">
            {score.toFixed(2)}
          </span>
        ) : (
          <span className="text-xs font-bold text-slate-300">Belum dinilai</span>
        )}
      </td>

      <td className="px-5 py-4 text-center">
        <DecisionBadge decision={decision} />
      </td>

      <td className="px-6 py-4 text-right">
        <Link
          href={`/ppdb/admin/seleksi/${item.id}`}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-black text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:scale-95"
        >
          Detail
          <span className="transition-transform duration-200 group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </td>
    </tr>
  )
}

function RankBadge({ rank }: { rank: number | null }) {
  if (rank === null) {
    return (
      <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-xl bg-slate-100 px-2 text-xs font-black text-slate-400">
        -
      </span>
    )
  }

  if (rank === 1) {
    return (
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-sm font-black text-amber-700 shadow-sm transition-all duration-200 hover:scale-110">
        1
      </div>
    )
  }

  if (rank === 2) {
    return (
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-sm font-black text-slate-700 shadow-sm transition-all duration-200 hover:scale-110">
        2
      </div>
    )
  }

  if (rank === 3) {
    return (
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-sm font-black text-orange-700 shadow-sm transition-all duration-200 hover:scale-110">
        3
      </div>
    )
  }

  return (
    <span className="text-xs font-black text-slate-400">
      {rank}
    </span>
  )
}

function FilterButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2 text-[10px] font-black transition-all duration-200 active:scale-95 ${
        active
          ? "bg-blue-700 text-white shadow-md shadow-blue-200"
          : "border border-slate-200 bg-white text-slate-500 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      }`}
    >
      {label}
      <span
        className={`rounded-full px-1.5 py-0.5 text-[9px] ${
          active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-400"
        }`}
      >
        {count}
      </span>
    </button>
  )
}


function normalize(value: string | null | undefined) {
  return String(value || "").trim().toUpperCase()
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string
  value: number
  icon: string
  tone: "blue" | "purple" | "green" | "red" | "amber"
}) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
  }[tone]

  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${toneClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

function DecisionBadge({ decision }: { decision: string }) {
  if (decision === "DITERIMA") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        DITERIMA
      </span>
    )
  }

  if (decision === "DITOLAK") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-[10px] font-black text-red-700">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        DITOLAK
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-[10px] font-black text-amber-700">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      BELUM DIPUTUSKAN
    </span>
  )
}

function EmptyState({
  search,
  filter,
}: {
  search: string
  filter: FilterType
}) {
  const hasFilter = search.trim() || filter !== "SEMUA"

  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <DocumentIcon />
      </div>

      <h3 className="mt-5 text-sm font-black text-slate-700">
        {hasFilter ? "Data tidak ditemukan" : "Belum ada hasil seleksi"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-400">
        {hasFilter
          ? "Coba ubah kata pencarian atau pilih filter yang berbeda."
          : "Hasil akan muncul setelah calon santri memiliki data seleksi."}
      </p>
    </div>
  )
}

function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />
        <p className="mt-5 text-sm font-black text-slate-700">
          Memuat hasil PPDB...
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Mengambil data hasil seleksi
        </p>
      </div>
    </main>
  )
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path strokeLinecap="round" d="m16 16 4 4" />
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
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 11a8 8 0 0 0-14.9-3M4 5v4h4"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 13a8 8 0 0 0 14.9 3M20 19v-4h-4"
      />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-7 w-7"
    >
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path strokeLinecap="round" d="M8 8h8" />
      <path strokeLinecap="round" d="M8 12h8" />
      <path strokeLinecap="round" d="M8 16h5" />
    </svg>
  )
}
