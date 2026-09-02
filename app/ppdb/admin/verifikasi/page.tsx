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
  nomor_pendaftaran: string | null
  status: string | null
  alamat: string | null
  created_at: string
  updated_at: string
}

export default function VerifikasiPage() {
  const router = useRouter()

  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [processingId, setProcessingId] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    loadData()
  }, [])

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
      // CEK ROLE ADMIN
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
          nomor_pendaftaran,
          status,
          alamat,
          created_at,
          updated_at
        `)
        .eq("status", "MENUNGGU")
        .order("created_at", {
          ascending: true,
        })

      if (applicationError) {
        throw new Error(
          `Gagal mengambil data verifikasi: ${applicationError.message}`
        )
      }

      setApplications(
        (data || []) as Application[]
      )
    } catch (err: any) {
      console.error(
        "ERROR VERIFIKASI:",
        err
      )

      setError(
        err?.message ||
          "Data verifikasi gagal dimuat."
      )
    } finally {
      setLoading(false)
    }
  }

  // =========================================================
  // TOLAK PENDAFTARAN
  // =========================================================

  async function rejectApplication(
    id: string
  ) {
    const confirmed =
      window.confirm(
        "Apakah Anda yakin ingin menolak pendaftaran ini?"
      )

    if (!confirmed) {
      return
    }

    try {
      setProcessingId(id)
      setError("")

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
        throw new Error(
          "Anda tidak memiliki akses sebagai admin."
        )
      }

      // -----------------------------------------------------
      // UPDATE STATUS
      // -----------------------------------------------------

      const {
        error: updateError,
      } = await supabase
        .from("ppdb_applications")
        .update({
          status: "DITOLAK",
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", id)

      if (updateError) {
        throw new Error(
          `Gagal menolak pendaftaran: ${updateError.message}`
        )
      }

      // Hapus dari daftar MENUNGGU
      setApplications((current) =>
        current.filter(
          (item) => item.id !== id
        )
      )
    } catch (err: any) {
      console.error(
        "ERROR MENOLAK PENDAFTAR:",
        err
      )

      setError(
        err?.message ||
          "Pendaftaran gagal ditolak."
      )
    } finally {
      setProcessingId(null)
    }
  }

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
          month: "long",
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
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-700" />

          <p className="mt-4 text-sm text-slate-500">
            Memuat data verifikasi...
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

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-xl font-bold text-red-600">
            !
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Verifikasi Tidak Dapat Dimuat
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={loadData}
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
    <main className="min-h-screen bg-slate-50 text-slate-800">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                INIBS SMART DIGITAL
              </p>

              <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                Verifikasi Pendaftar
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                Imam Nawawi Islamic Boarding School
              </p>

            </div>

            <div className="flex flex-wrap gap-2">

              <Link
                href="/ppdb/admin"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Dashboard
              </Link>

              <Link
                href="/ppdb/admin/pendaftar"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Semua Pendaftar
              </Link>

            </div>

          </div>

        </div>

      </header>

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav className="border-b border-slate-200 bg-white">

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
              className="whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
            >
              Pendaftar
            </Link>

            <Link
              href="/ppdb/admin/verifikasi"
              className="whitespace-nowrap rounded-xl bg-blue-50 px-4 py-2.5 text-xs font-semibold text-blue-700"
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

        {/* ===================================================
            TITLE
        =================================================== */}

        <div className="mb-7">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-600">
                Perlu Tindakan
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                Pendaftar Menunggu Verifikasi
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Periksa data calon santri, orang tua,
                pendidikan, dan dokumen sebelum
                melanjutkan proses verifikasi.
              </p>

            </div>

            <div className="w-fit rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3">

              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">
                Menunggu
              </p>

              <p className="mt-1 text-2xl font-bold text-amber-700">
                {applications.length}
              </p>

            </div>

          </div>

        </div>

        {/* ===================================================
            EMPTY
        =================================================== */}

        {applications.length === 0 ? (

          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-xl font-bold text-emerald-600">
              ✓
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              Tidak Ada Pendaftaran Menunggu
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Semua pendaftaran yang masuk sudah
              diproses atau belum ada pendaftaran
              baru.
            </p>

            <Link
              href="/ppdb/admin/pendaftar"
              className="mt-6 inline-flex rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Lihat Semua Pendaftar
            </Link>

          </div>

        ) : (

          /* =================================================
             LIST PENDAFTAR
          ================================================= */

          <div className="space-y-4">

            {applications.map(
              (application) => (

                <article
                  key={application.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-100 hover:shadow-md sm:p-7"
                >

                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                    {/* =======================================
                        DATA PENDAFTAR
                    ======================================= */}

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                        <div>

                          <p className="text-xs font-bold text-blue-700">
                            {application.nomor_pendaftaran ||
                              "-"}
                          </p>

                          <h3 className="mt-1 text-lg font-bold text-slate-900">
                            {application.nama_lengkap ||
                              "-"}
                          </h3>

                          <p className="mt-1 text-xs text-slate-400">
                            Diajukan{" "}
                            {formatDate(
                              application.created_at
                            )}
                          </p>

                        </div>

                        <span className="inline-flex w-fit rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-[10px] font-bold text-amber-700">
                          MENUNGGU
                        </span>

                      </div>

                      {/* DATA RINGKAS */}

                      <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">

                        <InfoItem
                          label="NIK"
                          value={
                            application.nik
                          }
                        />

                        <InfoItem
                          label="NISN"
                          value={
                            application.nisn
                          }
                        />

                        <InfoItem
                          label="Asal Sekolah"
                          value={
                            application.asal_sekolah
                          }
                        />

                        <InfoItem
                          label="NPSN"
                          value={
                            application.npsn
                          }
                        />

                      </div>

                    </div>

                    {/* =======================================
                        ACTION
                    ======================================= */}

                    <div className="flex flex-col gap-2 border-t border-slate-100 pt-5 lg:w-56 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">

                      {/* DETAIL */}

                      <Link
                        href={`/ppdb/admin/verifikasi/${application.id}`}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        Lihat Detail
                      </Link>

                      {/* VERIFIKASI */}

                      <Link
                        href={`/ppdb/admin/verifikasi/${application.id}`}
                        className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-4 py-3 text-xs font-semibold text-white transition hover:bg-blue-800"
                      >
                        Periksa Pendaftaran
                      </Link>

                      {/* TOLAK */}

                      <button
                        type="button"
                        disabled={
                          processingId ===
                          application.id
                        }
                        onClick={() =>
                          rejectApplication(
                            application.id
                          )
                        }
                        className="inline-flex items-center justify-center rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {processingId ===
                        application.id
                          ? "Memproses..."
                          : "Tolak Pendaftaran"}
                      </button>

                    </div>

                  </div>

                </article>

              )
            )}

          </div>

        )}

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
// INFO ITEM
// ===========================================================

function InfoItem({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <div>

      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm font-semibold text-slate-700">
        {value || "-"}
      </p>

    </div>
  )
}