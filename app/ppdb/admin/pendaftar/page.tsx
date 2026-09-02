"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
  nomor_pendaftaran: string | null
  status: string | null
  created_at: string
  updated_at: string
}

export default function PendaftarPage() {
  const router = useRouter()

  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("SEMUA")

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  // =========================================================
  // CEK ADMIN DAN LOAD DATA
  // =========================================================

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError("")

        // -----------------------------------------------------
        // CEK LOGIN
        // -----------------------------------------------------

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError) {
          throw new Error(
            `Gagal memeriksa akun: ${authError.message}`
          )
        }

        if (!user) {
          router.replace("/login")
          return
        }

        // -----------------------------------------------------
        // CEK ROLE
        // -----------------------------------------------------

        const {
          data: roleData,
          error: roleError,
        } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle()

        if (roleError) {
          throw new Error(
            `Gagal memeriksa hak akses: ${roleError.message}`
          )
        }

        if (
          !roleData ||
          roleData.role !== "ADMIN"
        ) {
          router.replace("/ppdb")
          return
        }

        // -----------------------------------------------------
        // LOAD PENDAFTAR
        // -----------------------------------------------------

        const {
          data,
          error: applicationError,
        } = await supabase
          .from("ppdb_applications")
          .select("*")
          .order("created_at", {
            ascending: false,
          })

        if (applicationError) {
          throw new Error(
            `Gagal mengambil data pendaftar: ${applicationError.message}`
          )
        }

        setApplications(
          (data || []) as Application[]
        )
      } catch (err: any) {
        console.error(
          "ERROR LOAD PENDAFTAR:",
          err
        )

        setError(
          err?.message ||
            "Data pendaftar gagal dimuat."
        )
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router, supabase])

  // =========================================================
  // FORMAT TANGGAL
  // =========================================================

  function formatDate(
    value: string
  ) {
    try {
      return new Intl.DateTimeFormat(
        "id-ID",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      ).format(
        new Date(value)
      )
    } catch {
      return value
    }
  }

  // =========================================================
  // STATUS BADGE
  // =========================================================

  function getStatusClass(
    status: string | null
  ) {
    switch (status) {
      case "MENUNGGU":
        return "border-amber-100 bg-amber-50 text-amber-700"

      case "VERIFIKASI":
        return "border-blue-100 bg-blue-50 text-blue-700"

      case "SELEKSI":
        return "border-purple-100 bg-purple-50 text-purple-700"

      case "DITERIMA":
        return "border-emerald-100 bg-emerald-50 text-emerald-700"

      case "DITOLAK":
        return "border-red-100 bg-red-50 text-red-700"

      case "DRAFT":
        return "border-slate-200 bg-slate-50 text-slate-600"

      default:
        return "border-slate-200 bg-slate-50 text-slate-600"
    }
  }

  // =========================================================
  // FILTER
  // =========================================================

  const filteredApplications =
    applications.filter(
      (application) => {
        const keyword =
          search
            .trim()
            .toLowerCase()

        const matchesSearch =
          !keyword ||
          application.nama_lengkap
            ?.toLowerCase()
            .includes(keyword) ||
          application.nomor_pendaftaran
            ?.toLowerCase()
            .includes(keyword) ||
          application.nik
            ?.toLowerCase()
            .includes(keyword) ||
          application.nisn
            ?.toLowerCase()
            .includes(keyword)

        const matchesStatus =
          statusFilter === "SEMUA" ||
          application.status ===
            statusFilter

        return (
          matchesSearch &&
          matchesStatus
        )
      }
    )

  // =========================================================
  // STATISTIK
  // =========================================================

  const total =
    applications.length

  const menunggu =
    applications.filter(
      (item) =>
        item.status === "MENUNGGU"
    ).length

  const verifikasi =
    applications.filter(
      (item) =>
        item.status === "VERIFIKASI"
    ).length

  const seleksi =
    applications.filter(
      (item) =>
        item.status === "SELEKSI"
    ).length

  const diterima =
    applications.filter(
      (item) =>
        item.status === "DITERIMA"
    ).length

  const ditolak =
    applications.filter(
      (item) =>
        item.status === "DITOLAK"
    ).length

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-700" />

          <p className="mt-4 text-sm text-slate-500">
            Memuat data pendaftar...
          </p>

        </div>

      </main>
    )
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">

        <div className="w-full max-w-lg rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-xl font-bold text-red-600">
            !
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Data Pendaftar Tidak Dapat Dimuat
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-6 rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Coba Lagi
          </button>

        </div>

      </main>
    )
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 text-slate-800">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">

        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8">

          <div className="flex items-center justify-between gap-5">

            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-blue-700 via-cyan-500 to-blue-700" />

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                INIBS SMART DIGITAL
              </p>

              <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                Data Pendaftar PPDB
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                Imam Nawawi Islamic Boarding School
              </p>

            </div>

            <div className="flex items-center gap-3">

              <Link
                href="/ppdb/admin"
                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:scale-95"
              >
                Dashboard
              </Link>

              <button
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut()
                  router.replace("/login")
                }}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:scale-95"
              >
                Keluar
              </button>

            </div>

          </div>

        </div>

      </header>

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav className="border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">

        <div className="mx-auto max-w-7xl px-5 sm:px-8">

          <div className="flex gap-1 overflow-x-auto py-2">

            <Link
              href="/ppdb/admin"
              className="whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
            >
              Dashboard
            </Link>

            <Link
              href="/ppdb/admin/pendaftar"
              className="whitespace-nowrap rounded-xl bg-blue-50 px-4 py-2.5 text-xs font-semibold text-blue-700"
            >
              Pendaftar
            </Link>

            <Link
              href="/ppdb/admin/verifikasi"
              className="whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
            >
              Verifikasi
            </Link>

            <Link
              href="/ppdb/admin/seleksi"
              className="whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
            >
              Seleksi
            </Link>

          </div>

        </div>

      </nav>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">

        {/* TITLE */}

        <div className="relative mb-7 overflow-hidden rounded-3xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/70 p-6 shadow-sm sm:p-7">

          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-700">
            Administrasi PPDB
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Daftar Seluruh Pendaftar
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Kelola dan pantau data calon santri yang telah terdaftar.
          </p>

        </div>

        {/* ===================================================
            STATISTIK
        =================================================== */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">

          <MiniStat
            title="Total"
            value={total}
          />

          <MiniStat
            title="Menunggu"
            value={menunggu}
          />

          <MiniStat
            title="Verifikasi"
            value={verifikasi}
          />

          <MiniStat
            title="Seleksi"
            value={seleksi}
          />

          <MiniStat
            title="Diterima"
            value={diterima}
          />

          <MiniStat
            title="Ditolak"
            value={ditolak}
          />

        </div>

        {/* ===================================================
            FILTER
        =================================================== */}

        <div className="mt-7 rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-sm backdrop-blur-sm">

          <div className="grid gap-4 md:grid-cols-[1fr_220px]">

            <div>

              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Cari Pendaftar
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Cari nama, nomor pendaftaran, NIK, atau NISN..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />

            </div>

            <div>

              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Filter Status
              </label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
              >

                <option value="SEMUA">
                  Semua Status
                </option>

                <option value="MENUNGGU">
                  Menunggu
                </option>

                <option value="VERIFIKASI">
                  Verifikasi
                </option>

                <option value="SELEKSI">
                  Seleksi
                </option>

                <option value="DITERIMA">
                  Diterima
                </option>

                <option value="DITOLAK">
                  Ditolak
                </option>

                <option value="DRAFT">
                  Draft
                </option>

              </select>

            </div>

          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">

            <p className="text-xs text-slate-400">
              Menampilkan{" "}
              <span className="font-semibold text-slate-600">
                {filteredApplications.length}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-slate-600">
                {applications.length}
              </span>{" "}
              pendaftar
            </p>

            {(search ||
              statusFilter !==
                "SEMUA") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("")
                  setStatusFilter(
                    "SEMUA"
                  )
                }}
                className="text-xs font-semibold text-blue-700 hover:text-blue-800"
              >
                Reset Filter
              </button>
            )}

          </div>

        </div>

        {/* ===================================================
            TABLE
        =================================================== */}

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-6 py-5">

            <h3 className="text-base font-bold text-slate-900">
              Data Pendaftar
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Daftar calon santri yang tersimpan dalam sistem.
            </p>

          </div>

          {filteredApplications.length === 0 ? (
            <div className="px-6 py-16 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl font-bold text-slate-400">
                -
              </div>

              <p className="mt-5 text-sm font-semibold text-slate-700">
                Tidak ada data
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Tidak ditemukan pendaftar sesuai pencarian.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1080px]">

                <thead>

                  <tr className="border-b border-slate-100 bg-slate-50/70 text-left">

                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      No. Pendaftaran
                    </th>

                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Calon Santri
                    </th>

                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Asal Sekolah
                    </th>

                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      WhatsApp
                    </th>

                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </th>

                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Tanggal
                    </th>

                    <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Aksi
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredApplications.map(
                    (application) => (
                      <tr
                        key={
                          application.id
                        }
                        className="border-b border-slate-100/80 last:border-0 transition-all duration-200 hover:bg-blue-50/40"
                      >

                        <td className="px-6 py-5">

                          <p className="text-xs font-bold text-blue-700">
                            {application.nomor_pendaftaran ||
                              "-"}
                          </p>

                        </td>

                        <td className="px-6 py-5">

                          <p className="text-sm font-semibold text-slate-800">
                            {application.nama_lengkap ||
                              "-"}
                          </p>

                          <p className="mt-1 text-[11px] text-slate-400">
                            NIK:{" "}
                            {application.nik ||
                              "-"}
                          </p>

                        </td>

                        <td className="px-6 py-5">

                          <p className="text-xs text-slate-600">
                            {application.asal_sekolah ||
                              "-"}
                          </p>

                          <p className="mt-1 text-[11px] text-slate-400">
                            NPSN:{" "}
                            {application.npsn ||
                              "-"}
                          </p>

                        </td>

                        <td className="px-6 py-5">

                          <p className="text-xs text-slate-600">
                            {application.whatsapp ||
                              "-"}
                          </p>

                        </td>

                        <td className="px-6 py-5">

                          <span
                            className={`inline-flex rounded-full border px-3 py-1.5 text-[10px] font-semibold ${getStatusClass(
                              application.status
                            )}`}
                          >
                            {application.status ||
                              "-"}
                          </span>

                        </td>

                        <td className="px-6 py-5">

                          <p className="text-xs text-slate-500">
                            {formatDate(
                              application.created_at
                            )}
                          </p>

                        </td>

                        <td className="px-6 py-5 text-right">

                          <Link
                            href={`/ppdb/admin/pendaftar/${application.id}`}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md active:scale-95"
                          >
                            Detail
                          </Link>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-5 py-7 text-center sm:px-8">

          <p className="text-sm font-semibold text-slate-700">
            INIBS Smart Digital
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Imam Nawawi Islamic Boarding School
          </p>

          <p className="mt-3 text-[11px] text-slate-400">
            © 2026 Imam Nawawi Islamic Boarding School
          </p>

        </div>

      </footer>

    </main>
  )
}

// ===========================================================
// MINI STAT
// ===========================================================

function MiniStat({
  title,
  value,
}: {
  title: string
  value: number
}) {
  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">

      <p className="text-[11px] font-medium text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  )
}