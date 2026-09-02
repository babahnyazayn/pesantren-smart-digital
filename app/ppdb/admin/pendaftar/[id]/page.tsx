"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
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

type ParentData = {
  id: string
  ppdb_id: string
  nama_ayah: string | null
  nik_ayah: string | null
  pekerjaan_ayah: string | null
  pendidikan_ayah: string | null
  nama_ibu: string | null
  nik_ibu: string | null
  pekerjaan_ibu: string | null
  pendidikan_ibu: string | null
  nama_wali: string | null
  nik_wali: string | null
  hubungan_wali: string | null
  pekerjaan_wali: string | null
  nomor_whatsapp: string | null
  email: string | null
  alamat: string | null
}

type EducationData = {
  id: string
  ppdb_id: string
  nama_sekolah: string | null
  npsn: string | null
  kelas: string | null
  tahun_lulus: string | null
  alamat_sekolah: string | null
}

export default function DetailPendaftarPage() {
  const router = useRouter()
  const params = useParams()

  const applicationId =
    typeof params.id === "string"
      ? params.id
      : ""

  const [application, setApplication] =
    useState<Application | null>(null)

  const [parent, setParent] =
    useState<ParentData | null>(null)

  const [education, setEducation] =
    useState<EducationData | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  const supabase =
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError("")

        // ---------------------------------------------------
        // CEK LOGIN
        // ---------------------------------------------------

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

        // ---------------------------------------------------
        // CEK ROLE ADMIN
        // ---------------------------------------------------

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

        // ---------------------------------------------------
        // CEK ID
        // ---------------------------------------------------

        if (!applicationId) {
          throw new Error(
            "ID pendaftaran tidak ditemukan."
          )
        }

        // ---------------------------------------------------
        // LOAD DATA SANTRI
        // ---------------------------------------------------

        const {
          data: applicationData,
          error: applicationError,
        } = await supabase
          .from("ppdb_applications")
          .select("*")
          .eq("id", applicationId)
          .maybeSingle()

        if (applicationError) {
          throw new Error(
            `Gagal mengambil data calon santri: ${applicationError.message}`
          )
        }

        if (!applicationData) {
          throw new Error(
            "Data calon santri tidak ditemukan."
          )
        }

        setApplication(
          applicationData as Application
        )

        // ---------------------------------------------------
        // LOAD DATA ORANG TUA
        // ---------------------------------------------------

        const {
          data: parentData,
          error: parentError,
        } = await supabase
          .from("ppdb_parents")
          .select("*")
          .eq(
            "ppdb_id",
            applicationId
          )
          .maybeSingle()

        if (parentError) {
          console.error(
            "Gagal mengambil data orang tua:",
            parentError
          )
        }

        setParent(
          parentData as ParentData | null
        )

        // ---------------------------------------------------
        // LOAD DATA PENDIDIKAN
        // ---------------------------------------------------

        const {
          data: educationData,
          error: educationError,
        } = await supabase
          .from("ppdb_education")
          .select("*")
          .eq(
            "ppdb_id",
            applicationId
          )
          .maybeSingle()

        if (educationError) {
          console.error(
            "Gagal mengambil data pendidikan:",
            educationError
          )
        }

        setEducation(
          educationData as EducationData | null
        )
      } catch (err: any) {
        console.error(
          "ERROR DETAIL PENDAFTAR:",
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
  }, [
    applicationId,
    router,
    supabase,
  ])

  // =========================================================
  // FORMAT TANGGAL
  // =========================================================

  function formatDate(
    value: string | null
  ) {
    if (!value) {
      return "-"
    }

    try {
      return new Intl.DateTimeFormat(
        "id-ID",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      ).format(
        new Date(value)
      )
    } catch {
      return value
    }
  }

  // =========================================================
  // STATUS
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

      default:
        return "border-slate-200 bg-slate-50 text-slate-600"
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
            Memuat detail pendaftar...
          </p>

        </div>

      </main>
    )
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error || !application) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">

        <div className="w-full max-w-lg rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-xl font-bold text-red-600">
            !
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Data Tidak Ditemukan
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {error ||
              "Data pendaftar tidak tersedia."}
          </p>

          <Link
            href="/ppdb/admin/pendaftar"
            className="mt-6 inline-flex cursor-pointer rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-lg active:scale-95"
          >
            Kembali ke Pendaftar
          </Link>

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

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                INIBS SMART DIGITAL
              </p>

              <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                Detail Pendaftar
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                Imam Nawawi Islamic Boarding School
              </p>

            </div>

            <div className="flex items-center gap-3">

              <Link
                href="/ppdb/admin/pendaftar"
                className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md active:scale-95"
              >
                Kembali
              </Link>

              <button
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut()
                  router.replace("/login")
                }}
                className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md active:scale-95"
              >
                Keluar
              </button>

            </div>

          </div>

        </div>

      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">

        {/* ===================================================
            PROFILE HEADER
        =================================================== */}

        <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-sm transition-all duration-300 hover:shadow-md sm:p-8">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                Nomor Pendaftaran
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-blue-700 sm:text-3xl">
                {application.nomor_pendaftaran ||
                  "-"}
              </h2>

              <p className="mt-3 text-lg font-semibold text-slate-900">
                {application.nama_lengkap ||
                  "-"}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Terdaftar pada{" "}
                {formatDate(
                  application.created_at
                )}
              </p>

            </div>

            <div>

              <span
                className={`inline-flex rounded-full border px-4 py-2 text-xs font-bold ${getStatusClass(
                  application.status
                )}`}
              >
                {application.status ||
                  "-"}
              </span>

            </div>

          </div>

        </div>

        {/* ===================================================
            DATA CALON SANTRI
        =================================================== */}

        <SectionCard
          title="Data Calon Santri"
          description="Identitas calon santri yang tercatat dalam formulir PPDB."
        >

          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">

            <InfoItem
              label="Nama Lengkap"
              value={
                application.nama_lengkap
              }
            />

            <InfoItem
              label="NIK"
              value={application.nik}
            />

            <InfoItem
              label="NISN"
              value={application.nisn}
            />

            <InfoItem
              label="Tempat Lahir"
              value={
                application.tempat_lahir
              }
            />

            <InfoItem
              label="Tanggal Lahir"
              value={formatDate(
                application.tanggal_lahir
              )}
            />

            <InfoItem
              label="Jenis Kelamin"
              value={
                application.jenis_kelamin
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
              value={application.npsn}
            />

            <InfoItem
              label="Nomor WhatsApp"
              value={
                application.whatsapp
              }
            />

            <div className="sm:col-span-2 lg:col-span-3">

              <InfoItem
                label="Alamat"
                value={application.alamat}
              />

            </div>

          </div>

        </SectionCard>

        {/* ===================================================
            DATA AYAH
        =================================================== */}

        <SectionCard
          title="Data Ayah"
          description="Informasi ayah calon santri."
        >

          {parent ? (
            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">

              <InfoItem
                label="Nama Ayah"
                value={
                  parent.nama_ayah
                }
              />

              <InfoItem
                label="NIK Ayah"
                value={
                  parent.nik_ayah
                }
              />

              <InfoItem
                label="Pekerjaan"
                value={
                  parent.pekerjaan_ayah
                }
              />

              <InfoItem
                label="Pendidikan"
                value={
                  parent.pendidikan_ayah
                }
              />

            </div>
          ) : (
            <EmptyData
              text="Data ayah belum tersedia."
            />
          )}

        </SectionCard>

        {/* ===================================================
            DATA IBU
        =================================================== */}

        <SectionCard
          title="Data Ibu"
          description="Informasi ibu calon santri."
        >

          {parent ? (
            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">

              <InfoItem
                label="Nama Ibu"
                value={
                  parent.nama_ibu
                }
              />

              <InfoItem
                label="NIK Ibu"
                value={
                  parent.nik_ibu
                }
              />

              <InfoItem
                label="Pekerjaan"
                value={
                  parent.pekerjaan_ibu
                }
              />

              <InfoItem
                label="Pendidikan"
                value={
                  parent.pendidikan_ibu
                }
              />

            </div>
          ) : (
            <EmptyData
              text="Data ibu belum tersedia."
            />
          )}

        </SectionCard>

        {/* ===================================================
            DATA WALI
        =================================================== */}

        <SectionCard
          title="Data Wali"
          description="Informasi wali calon santri jika tersedia."
        >

          {parent ? (
            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">

              <InfoItem
                label="Nama Wali"
                value={
                  parent.nama_wali
                }
              />

              <InfoItem
                label="NIK Wali"
                value={
                  parent.nik_wali
                }
              />

              <InfoItem
                label="Hubungan dengan Santri"
                value={
                  parent.hubungan_wali
                }
              />

              <InfoItem
                label="Pekerjaan"
                value={
                  parent.pekerjaan_wali
                }
              />

              <InfoItem
                label="WhatsApp"
                value={
                  parent.nomor_whatsapp
                }
              />

              <InfoItem
                label="Email"
                value={
                  parent.email
                }
              />

              <div className="sm:col-span-2 lg:col-span-3">

                <InfoItem
                  label="Alamat"
                  value={
                    parent.alamat
                  }
                />

              </div>

            </div>
          ) : (
            <EmptyData
              text="Data wali belum tersedia."
            />
          )}

        </SectionCard>

        {/* ===================================================
            DATA PENDIDIKAN
        =================================================== */}

        <SectionCard
          title="Data Pendidikan"
          description="Riwayat pendidikan calon santri."
        >

          {education ? (
            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">

              <InfoItem
                label="Nama Sekolah"
                value={
                  education.nama_sekolah
                }
              />

              <InfoItem
                label="NPSN"
                value={
                  education.npsn
                }
              />

              <InfoItem
                label="Kelas"
                value={
                  education.kelas
                }
              />

              <InfoItem
                label="Tahun Lulus"
                value={
                  education.tahun_lulus
                }
              />

              <div className="sm:col-span-2">

                <InfoItem
                  label="Alamat Sekolah"
                  value={
                    education.alamat_sekolah
                  }
                />

              </div>

            </div>
          ) : (
            <EmptyData
              text="Data pendidikan belum tersedia."
            />
          )}

        </SectionCard>

        {/* ===================================================
            ACTION
        =================================================== */}

        <div className="mt-8 flex flex-col gap-3 rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-sm sm:flex-row sm:justify-between">

          <Link
            href="/ppdb/admin/pendaftar"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            ← Kembali ke Daftar Pendaftar
          </Link>

          <button
            type="button"
            onClick={() => {
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }}
            className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Kembali ke Atas
          </button>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-6xl px-5 py-7 text-center sm:px-8">

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
// SECTION CARD
// ===========================================================

function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-6 rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-sm transition-all duration-300 hover:shadow-md sm:p-8">

      <div className="mb-7 border-b border-slate-100 pb-5">

        <h3 className="text-lg font-black text-slate-900">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          {description}
        </p>

      </div>

      {children}

    </section>
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
    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3.5 transition-all duration-200 hover:border-blue-100 hover:bg-blue-50/40">

      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-semibold leading-6 text-slate-700">
        {value || "-"}
      </p>

    </div>
  )
}

// ===========================================================
// EMPTY DATA
// ===========================================================

function EmptyData({
  text,
}: {
  text: string
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-5 py-10 text-center">

      <p className="text-sm font-medium text-slate-500">
        {text}
      </p>

    </div>
  )
}