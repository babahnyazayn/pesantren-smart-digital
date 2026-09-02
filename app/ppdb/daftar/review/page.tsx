"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"

type SantriData = {
  id: string
  nama_lengkap: string | null
  nik: string | null
  nisn: string | null
  tempat_lahir: string | null
  tanggal_lahir: string | null
  jenis_kelamin: string | null
  asal_sekolah: string | null
  npsn: string | null
  nomor_whatsapp: string | null
  alamat: string | null
  status: string | null
}

type ParentData = {
  id: string
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
  nama_sekolah: string | null
  jenjang: string | null
  tahun_lulus: string | null
  npsn: string | null
  nomor_ijazah: string | null
  alamat_sekolah: string | null
}

type DocumentData = {
  id: string
  jenis_dokumen: string
  nama_file: string
  file_size: number | null
  mime_type: string | null
  status: string
}

const DOCUMENT_LABELS: Record<string, string> = {
  "kartu-keluarga": "Kartu Keluarga",
  "akta-kelahiran": "Akta Kelahiran",
  "ktp-ayah": "KTP Ayah",
  "ktp-ibu": "KTP Ibu",
  ijazah: "Ijazah / SKL",
  "pas-foto": "Pas Foto",
}

export default function ReviewPage() {
  const [santri, setSantri] =
    useState<SantriData | null>(null)

  const [parent, setParent] =
    useState<ParentData | null>(null)

  const [education, setEducation] =
    useState<EducationData | null>(null)

  const [documents, setDocuments] =
    useState<DocumentData[]>([])

  const [ppdbId, setPpdbId] =
    useState<string | null>(null)

  const [checking, setChecking] =
    useState(true)

  const [submitting, setSubmitting] =
    useState(false)

  const [error, setError] =
    useState("")

  const [success, setSuccess] =
    useState("")

  const supabase =
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )

  // =========================================================
  // LOAD SEMUA DATA
  // =========================================================

  useEffect(() => {
    async function loadData() {
      try {
        setChecking(true)
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
          window.location.href = "/login"
          return
        }

        // -----------------------------------------------------
        // PPDB APPLICATION
        // -----------------------------------------------------

        const {
          data: ppdb,
          error: ppdbError,
        } = await supabase
          .from("ppdb_applications")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle()

        if (ppdbError) {
          throw new Error(
            `Gagal mengambil data PPDB: ${ppdbError.message}`
          )
        }

        if (!ppdb) {
          throw new Error(
            "Data pendaftaran belum ditemukan."
          )
        }

        setPpdbId(ppdb.id)
        setSantri(ppdb)

        // -----------------------------------------------------
        // ORANG TUA
        // -----------------------------------------------------

        const {
          data: parentData,
          error: parentError,
        } = await supabase
          .from("ppdb_parents")
          .select("*")
          .eq("ppdb_id", ppdb.id)
          .maybeSingle()

        if (parentError) {
          throw new Error(
            `Gagal mengambil data orang tua: ${parentError.message}`
          )
        }

        setParent(parentData)

        // -----------------------------------------------------
        // PENDIDIKAN
        // -----------------------------------------------------

        const {
          data: educationData,
          error: educationError,
        } = await supabase
          .from("ppdb_education")
          .select("*")
          .eq("ppdb_id", ppdb.id)
          .maybeSingle()

        if (educationError) {
          throw new Error(
            `Gagal mengambil data pendidikan: ${educationError.message}`
          )
        }

        setEducation(educationData)

        // -----------------------------------------------------
        // DOKUMEN
        // -----------------------------------------------------

        const {
          data: documentData,
          error: documentError,
        } = await supabase
          .from("ppdb_documents")
          .select("*")
          .eq("ppdb_id", ppdb.id)
          .order("created_at", {
            ascending: true,
          })

        if (documentError) {
          throw new Error(
            `Gagal mengambil data dokumen: ${documentError.message}`
          )
        }

        setDocuments(documentData || [])
      } catch (err: any) {
        console.error(
          "ERROR LOAD REVIEW:",
          err
        )

        setError(
          err?.message ||
            "Data review gagal dimuat."
        )
      } finally {
        setChecking(false)
      }
    }

    loadData()
  }, [supabase])

  // =========================================================
  // FORMAT TANGGAL
  // =========================================================

  function formatDate(
    date: string | null
  ) {
    if (!date) {
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
        new Date(date)
      )
    } catch {
      return date
    }
  }

  // =========================================================
  // FORMAT UKURAN FILE
  // =========================================================

  function formatFileSize(
    bytes: number | null
  ) {
    if (!bytes) {
      return "-"
    }

    if (bytes < 1024) {
      return `${bytes} B`
    }

    if (bytes < 1024 * 1024) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`
  }

  // =========================================================
  // CEK KELENGKAPAN
  // =========================================================

  const requiredDocuments = [
    "kartu-keluarga",
    "akta-kelahiran",
    "ktp-ayah",
    "ktp-ibu",
    "ijazah",
    "pas-foto",
  ]

  const uploadedDocumentKeys =
    documents.map(
      (document) =>
        document.jenis_dokumen
    )

  const missingDocuments =
    requiredDocuments.filter(
      (key) =>
        !uploadedDocumentKeys.includes(
          key
        )
    )

  const isComplete =
    !!santri &&
    !!parent &&
    !!education &&
    missingDocuments.length === 0

  // =========================================================
  // AJUKAN PENDAFTARAN
  // =========================================================

  async function handleSubmit() {
    if (submitting) {
      return
    }

    if (!ppdbId) {
      setError(
        "Data pendaftaran tidak ditemukan."
      )

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })

      return
    }

    if (!isComplete) {
      setError(
        "Data pendaftaran belum lengkap. Silakan periksa kembali setiap tahap."
      )

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })

      return
    }

    const confirmed =
      window.confirm(
        "Apakah Anda yakin seluruh data sudah benar dan ingin mengajukan pendaftaran?"
      )

    if (!confirmed) {
      return
    }

    try {
      setSubmitting(true)
      setError("")
      setSuccess("")

      // -----------------------------------------------------
      // UBAH STATUS DRAFT MENJADI MENUNGGU
      // -----------------------------------------------------

      const {
        error: updateError,
      } = await supabase
        .from("ppdb_applications")
        .update({
          status: "MENUNGGU",
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          ppdbId
        )

      if (updateError) {
        throw new Error(
          `Pendaftaran gagal diajukan: ${updateError.message}`
        )
      }

      setSuccess(
        "Pendaftaran berhasil diajukan. Data Anda sekarang menunggu pemeriksaan admin."
      )

      // -----------------------------------------------------
      // PINDAH KE HALAMAN SELESAI
      // -----------------------------------------------------

      setTimeout(() => {
        window.location.href =
          "/ppdb/daftar/selesai"
      }, 1500)

    } catch (err: any) {
      console.error(
        "ERROR SUBMIT PPDB:",
        err
      )

      setError(
        err?.message ||
          "Pendaftaran gagal diajukan."
      )

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (checking) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef4fa]">
        <div className="relative z-10 text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-[3px] border-blue-100 border-t-[#174f91] shadow-sm" />

          <p className="mt-4 text-sm font-semibold text-[#647489]">
            Menyiapkan ringkasan pendaftaran...
          </p>
        </div>
      </main>
    )
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#eef4fa] text-[#10233f] selection:bg-blue-100 selection:text-[#071a36]">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.97),transparent_36%),radial-gradient(circle_at_7%_34%,rgba(37,99,235,0.10),transparent_28%),radial-gradient(circle_at_94%_52%,rgba(6,182,212,0.08),transparent_30%)]" />
        <div className="absolute -left-48 top-24 h-96 w-96 rounded-full bg-blue-300/10 blur-3xl edu-float" />
        <div className="absolute -right-44 top-56 h-96 w-96 rounded-full bg-cyan-300/10 blur-3xl edu-float-reverse" />
        <div className="absolute left-[10%] top-[38%] h-20 w-20 rounded-full border border-white/60 bg-white/20 backdrop-blur-sm edu-pulse" />
        <div className="absolute right-[10%] top-[66%] h-14 w-14 rounded-full border border-blue-200/45 bg-blue-100/20 backdrop-blur-sm edu-pulse [animation-delay:1s]" />
      </div>


      {/* HEADER */}

      <header className="relative z-10 border-b border-white/70 bg-white/84 backdrop-blur-2xl shadow-[0_12px_38px_rgba(7,26,54,0.05)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">

          <Link
            href="/ppdb/daftar/berkas"
            className="group flex items-center gap-3 rounded-2xl px-2 py-1.5 transition-all duration-300 hover:bg-white"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-white p-1.5 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md">
              <img
                src="/logo-imam.png"
                alt="Logo Imam Nawawi Islamic Boarding School"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="hidden sm:block">
              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#245ea8]">
                INIBS
              </p>

              <p className="text-sm font-black text-[#071a36]">
                Imam Nawawi Islamic Boarding School
              </p>
            </div>
          </Link>

          <div className="text-right">
            <p className="text-xs font-black text-[#245ea8]">
              PPDB 2027/2028
            </p>

            <p className="mt-1 text-[11px] text-[#7a8a9a]">
              Pendaftaran Santri Baru
            </p>
          </div>

        </div>
      </header>

      {/* PROGRESS */}

      <section className="relative z-10 border-b border-white/70 bg-white/78 shadow-sm backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8">

          <div className="flex items-center">

            {[
              "Data Santri",
              "Orang Tua/Wali",
              "Pendidikan",
              "Berkas",
              "Review",
            ].map(
              (step, index) => (
                <div
                  key={step}
                  className="flex flex-1 items-center"
                >
                  <div
                    className={`edu-step flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      index === 4
                        ? "bg-gradient-to-br from-[#174f91] to-[#2675bd] text-white shadow-[0_10px_28px_rgba(23,79,145,0.25)]"
                        : "bg-gradient-to-br from-[#174f91] to-[#2675bd] text-white shadow-[0_8px_24px_rgba(23,79,145,0.20)]"
                    }`}
                  >
                    {index === 4 ? (
                      <span className="text-xs font-bold">
                        5
                      </span>
                    ) : (
                      <span className="text-xs font-bold">
                        ✓
                      </span>
                    )}
                  </div>

                  {index < 4 && (
                    <div className="mx-3 h-px flex-1 bg-blue-200 sm:mx-5" />
                  )}
                </div>
              )
            )}

          </div>

          <div className="mt-3 hidden grid-cols-5 text-center sm:grid">

            <span className="text-[11px] text-slate-500">
              Data Santri
            </span>

            <span className="text-[11px] text-slate-500">
              Orang Tua/Wali
            </span>

            <span className="text-[11px] text-slate-500">
              Pendidikan
            </span>

            <span className="text-[11px] text-slate-500">
              Berkas
            </span>

            <span className="text-[11px] font-black text-[#245ea8]">
              Review
            </span>

          </div>

        </div>
      </section>

      {/* CONTENT */}

      <section className="relative z-10 mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">

        {/* TITLE */}

        <div className="mb-8">

          <div className="edu-reveal mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3.5 py-1.5 shadow-sm backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2675bd] edu-pulse" />

            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#245ea8]">
              Tahap 5 dari 6
            </span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-[#071a36] sm:text-4xl">
            Review Pendaftaran
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#697787] sm:text-base">
            Periksa kembali seluruh data sebelum mengajukan pendaftaran PPDB.
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-[1.35rem] border border-red-100 bg-red-50/90 px-5 py-4 shadow-sm animate-soft-slide">

            <p className="text-sm font-semibold text-red-700">
              Perhatian
            </p>

            <p className="mt-1 text-xs leading-5 text-red-600">
              {error}
            </p>

          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mb-6 rounded-[1.35rem] border border-emerald-100 bg-emerald-50/90 px-5 py-4 shadow-sm animate-soft-slide">

            <p className="text-sm font-semibold text-emerald-700">
              Pendaftaran berhasil
            </p>

            <p className="mt-1 text-xs leading-5 text-emerald-600">
              {success}
            </p>

          </div>
        )}

        {/* STATUS */}

        <div className="edu-card-shine mb-6 rounded-[1.9rem] border border-white/90 bg-white/94 p-6 shadow-[0_20px_60px_rgba(7,26,54,0.07)] backdrop-blur-xl">

          <div className="flex items-center justify-between gap-4">

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#7b8a9b]">
                Status kelengkapan
              </p>

              <p className="mt-1 text-xl font-black tracking-tight text-[#071a36]">
                {isComplete
                  ? "Data Lengkap"
                  : "Data Belum Lengkap"}
              </p>
            </div>

            <div
              className={`rounded-full px-4 py-2 text-xs font-semibold ${
                isComplete
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {isComplete
                ? "Siap Diajukan"
                : "Perlu Diperiksa"}
            </div>

          </div>

        </div>

        {/* DATA SANTRI */}

        <div className="edu-card-shine group mb-5 rounded-[1.9rem] border border-white/90 bg-white/94 shadow-[0_18px_55px_rgba(7,26,54,0.065)] backdrop-blur-xl">

          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

            <div>
              <h2 className="text-base font-black tracking-tight text-[#071a36]">
                Data Calon Santri
              </h2>

              <p className="mt-1 text-[10px] font-medium text-[#7b8a9b]">
                Identitas calon santri
              </p>
            </div>

            <Link
              href="/ppdb/daftar"
              className="group/edit inline-flex items-center gap-1 rounded-full border border-blue-100 bg-[#f7fbff] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-[#245ea8] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-sm"
            >
              Perbaiki <span className="transition-transform duration-300 group-hover/edit:translate-x-0.5">→</span>
            </Link>

          </div>

          <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">

            <InfoItem
              label="Nama Lengkap"
              value={santri?.nama_lengkap}
            />

            <InfoItem
              label="NIK"
              value={santri?.nik}
            />

            <InfoItem
              label="NISN"
              value={santri?.nisn}
            />

            <InfoItem
              label="Jenis Kelamin"
              value={santri?.jenis_kelamin}
            />

            <InfoItem
              label="Tempat Lahir"
              value={santri?.tempat_lahir}
            />

            <InfoItem
              label="Tanggal Lahir"
              value={formatDate(
                santri?.tanggal_lahir || null
              )}
            />

            <InfoItem
              label="Asal Sekolah"
              value={santri?.asal_sekolah}
            />

            <InfoItem
              label="NPSN"
              value={santri?.npsn}
            />

            <InfoItem
              label="Nomor WhatsApp"
              value={santri?.nomor_whatsapp}
            />

            <div className="sm:col-span-2">
              <InfoItem
                label="Alamat"
                value={santri?.alamat}
              />
            </div>

          </div>

        </div>

        {/* ORANG TUA */}

        <div className="edu-card-shine group mb-5 rounded-[1.9rem] border border-white/90 bg-white/94 shadow-[0_18px_55px_rgba(7,26,54,0.065)] backdrop-blur-xl">

          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

            <div>
              <h2 className="text-base font-black tracking-tight text-[#071a36]">
                Data Orang Tua / Wali
              </h2>

              <p className="mt-1 text-[10px] font-medium text-[#7b8a9b]">
                Informasi orang tua atau wali
              </p>
            </div>

            <Link
              href="/ppdb/daftar/orangtua"
              className="group/edit inline-flex items-center gap-1 rounded-full border border-blue-100 bg-[#f7fbff] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-[#245ea8] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-sm"
            >
              Perbaiki <span className="transition-transform duration-300 group-hover/edit:translate-x-0.5">→</span>
            </Link>

          </div>

          <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">

            <InfoItem
              label="Nama Ayah"
              value={parent?.nama_ayah}
            />

            <InfoItem
              label="NIK Ayah"
              value={parent?.nik_ayah}
            />

            <InfoItem
              label="Pekerjaan Ayah"
              value={parent?.pekerjaan_ayah}
            />

            <InfoItem
              label="Pendidikan Ayah"
              value={parent?.pendidikan_ayah}
            />

            <InfoItem
              label="Nama Ibu"
              value={parent?.nama_ibu}
            />

            <InfoItem
              label="NIK Ibu"
              value={parent?.nik_ibu}
            />

            <InfoItem
              label="Pekerjaan Ibu"
              value={parent?.pekerjaan_ibu}
            />

            <InfoItem
              label="Pendidikan Ibu"
              value={parent?.pendidikan_ibu}
            />

            <InfoItem
              label="Nomor WhatsApp"
              value={parent?.nomor_whatsapp}
            />

            <InfoItem
              label="Email"
              value={parent?.email}
            />

            <div className="sm:col-span-2">
              <InfoItem
                label="Alamat"
                value={parent?.alamat}
              />
            </div>

          </div>

        </div>

        {/* PENDIDIKAN */}

        <div className="edu-card-shine group mb-5 rounded-[1.9rem] border border-white/90 bg-white/94 shadow-[0_18px_55px_rgba(7,26,54,0.065)] backdrop-blur-xl">

          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

            <div>
              <h2 className="text-base font-black tracking-tight text-[#071a36]">
                Data Pendidikan
              </h2>

              <p className="mt-1 text-[10px] font-medium text-[#7b8a9b]">
                Pendidikan terakhir calon santri
              </p>
            </div>

            <Link
              href="/ppdb/daftar/pendidikan"
              className="group/edit inline-flex items-center gap-1 rounded-full border border-blue-100 bg-[#f7fbff] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-[#245ea8] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-sm"
            >
              Perbaiki <span className="transition-transform duration-300 group-hover/edit:translate-x-0.5">→</span>
            </Link>

          </div>

          <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">

            <InfoItem
              label="Nama Sekolah"
              value={education?.nama_sekolah}
            />

            <InfoItem
              label="Jenjang"
              value={education?.jenjang}
            />

            <InfoItem
              label="Tahun Lulus"
              value={education?.tahun_lulus}
            />

            <InfoItem
              label="NPSN"
              value={education?.npsn}
            />

            <InfoItem
              label="Nomor Ijazah / STTB"
              value={education?.nomor_ijazah}
            />

            <div className="sm:col-span-2">
              <InfoItem
                label="Alamat Sekolah"
                value={education?.alamat_sekolah}
              />
            </div>

          </div>

        </div>

        {/* BERKAS */}

        <div className="edu-card-shine group mb-6 rounded-[1.9rem] border border-white/90 bg-white/94 shadow-[0_18px_55px_rgba(7,26,54,0.065)] backdrop-blur-xl">

          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

            <div>
              <h2 className="text-base font-black tracking-tight text-[#071a36]">
                Dokumen Pendaftaran
              </h2>

              <p className="mt-1 text-[10px] font-medium text-[#7b8a9b]">
                Dokumen yang telah diunggah
              </p>
            </div>

            <Link
              href="/ppdb/daftar/berkas"
              className="group/edit inline-flex items-center gap-1 rounded-full border border-blue-100 bg-[#f7fbff] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-[#245ea8] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-sm"
            >
              Perbaiki <span className="transition-transform duration-300 group-hover/edit:translate-x-0.5">→</span>
            </Link>

          </div>

          <div className="divide-y divide-slate-100">

            {requiredDocuments.map(
              (key) => {

                const document =
                  documents.find(
                    (item) =>
                      item.jenis_dokumen === key
                  )

                return (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-4 px-6 py-4"
                  >

                    <div className="min-w-0">

                      <p className="text-sm font-black text-[#071a36]">
                        {
                          DOCUMENT_LABELS[key] ||
                          key
                        }
                      </p>

                      {document && (
                        <p className="mt-1 truncate text-xs text-slate-400">
                          {document.nama_file} ·{" "}
                          {formatFileSize(
                            document.file_size
                          )}
                        </p>
                      )}

                    </div>

                    <div className="shrink-0">

                      {document ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-emerald-700 shadow-sm">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                          Lengkap
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-[10px] font-black text-red-700 shadow-sm">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                          Belum ada
                        </span>
                      )}

                    </div>

                  </div>
                )
              }
            )}

          </div>

        </div>

        {/* PERNYATAAN */}

        <div className="edu-card-shine mb-6 rounded-[1.55rem] border border-white/90 bg-white/94 px-5 py-5 shadow-[0_16px_45px_rgba(7,26,54,0.06)] backdrop-blur-xl">

          <p className="text-sm font-black tracking-[0.06em] text-white">
            Pernyataan
          </p>

          <p className="mt-2 text-xs leading-6 text-[#697787]">
            Dengan mengajukan pendaftaran, saya menyatakan
            bahwa data yang saya berikan benar dan dapat
            dipertanggungjawabkan. Saya memahami bahwa data
            dan dokumen akan melalui proses verifikasi oleh
            pihak sekolah.
          </p>

        </div>

        {/* ACTION */}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">

          <Link
            href="/ppdb/daftar/berkas"
            className="group inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-100 hover:bg-[#f8fbfe] hover:shadow-md"
          >
            Kembali
          </Link>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              submitting ||
              !isComplete
            }
            className="group inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#0d3b72] via-[#174f91] to-[#2675bd] px-7 py-3.5 text-sm font-black text-white shadow-[0_14px_34px_rgba(23,79,145,0.24)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(23,79,145,0.30)] disabled:cursor-not-allowed disabled:opacity-50"
          >

            {submitting
              ? "Mengajukan..."
              : "Ajukan Pendaftaran"}

            {!submitting && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m5 12 4 4L19 6"
                />
              </svg>
            )}

          </button>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="relative z-10 border-t border-white/10 bg-[#071a36] text-white">

        <div className="mx-auto max-w-6xl px-5 py-7 text-center sm:px-8">

          <p className="text-sm font-semibold text-slate-700">
            INIBS Smart Digital
          </p>

          <p className="mt-1 text-[10px] font-medium text-[#7b8a9b]">
            Imam Nawawi Islamic Boarding School
          </p>

          <p className="mt-3 text-[10px] text-blue-300">
            © 2026 Imam Nawawi Islamic Boarding School
          </p>

        </div>

      </footer>

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        .edu-float {
          animation: eduFloat 8s ease-in-out infinite;
        }

        .edu-float-reverse {
          animation: eduFloatReverse 9s ease-in-out infinite;
        }

        .edu-pulse {
          animation: eduPulse 4s ease-in-out infinite;
        }

        .edu-reveal {
          animation: eduReveal 800ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .edu-step {
          animation: eduStepActive 2.8s ease-in-out infinite;
        }

        .edu-card-shine {
          position: relative;
          overflow: hidden;
          transition:
            transform 650ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 650ms cubic-bezier(0.22, 1, 0.36, 1),
            border-color 450ms ease;
        }

        .edu-card-shine::after {
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

        .edu-card-shine:hover {
          transform: translateY(-5px);
          border-color: rgba(191,219,254,0.95);
          box-shadow: 0 30px 76px rgba(7,26,54,0.10);
        }

        .edu-card-shine:hover::after {
          left: 140%;
        }

        .animate-soft-slide {
          animation: eduReveal 450ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes eduReveal {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes eduFloat {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -12px, 0); }
        }

        @keyframes eduFloatReverse {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, 10px, 0); }
        }

        @keyframes eduPulse {
          0%, 100% { opacity: 0.28; transform: scale(0.96); }
          50% { opacity: 0.84; transform: scale(1.08); }
        }

        @keyframes eduStepActive {
          0%, 100% {
            transform: translateY(0);
            box-shadow: 0 8px 24px rgba(23,79,145,0.20);
          }
          50% {
            transform: translateY(-2px);
            box-shadow: 0 12px 30px rgba(23,79,145,0.30);
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
      `}</style>

    </main>
  )
}

// ===========================================================
// KOMPONEN INFORMASI
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
      <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#91a0ae]">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-bold text-[#3f536a]">
        {value || "-"}
      </p>
    </div>
  )
}