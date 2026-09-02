"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"

type DocumentItem = {
  key: string
  label: string
  description: string
  required: boolean
  accept: string
}

const DOCUMENTS: DocumentItem[] = [
  {
    key: "kartu-keluarga",
    label: "Kartu Keluarga",
    description: "Kartu Keluarga calon santri",
    required: true,
    accept: ".pdf,.jpg,.jpeg,.png",
  },
  {
    key: "akta-kelahiran",
    label: "Akta Kelahiran",
    description: "Akta kelahiran calon santri",
    required: true,
    accept: ".pdf,.jpg,.jpeg,.png",
  },
  {
    key: "ktp-ayah",
    label: "KTP Ayah",
    description: "KTP ayah atau wali laki-laki",
    required: true,
    accept: ".pdf,.jpg,.jpeg,.png",
  },
  {
    key: "ktp-ibu",
    label: "KTP Ibu",
    description: "KTP ibu atau wali perempuan",
    required: true,
    accept: ".pdf,.jpg,.jpeg,.png",
  },
  {
    key: "ijazah",
    label: "Ijazah / SKL",
    description: "Ijazah atau surat keterangan lulus",
    required: true,
    accept: ".pdf,.jpg,.jpeg,.png",
  },
  {
    key: "pas-foto",
    label: "Pas Foto",
    description: "Pas foto terbaru calon santri",
    required: true,
    accept: ".jpg,.jpeg,.png",
  },
]

type UploadedFile = {
  id: string
  jenis_dokumen: string
  nama_file: string
  file_path: string
  file_size: number | null
  mime_type: string | null
  status: string
}

export default function BerkasPage() {
  const [ppdbId, setPpdbId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const [files, setFiles] = useState<
    Record<string, File | null>
  >({})

  const [uploaded, setUploaded] = useState<
    Record<string, UploadedFile>
  >({})

  const [checking, setChecking] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  // =========================================================
  // LOAD DATA
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

        setUserId(user.id)

        const {
          data: ppdb,
          error: ppdbError,
        } = await supabase
          .from("ppdb_applications")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle()

        if (ppdbError) {
          throw new Error(
            `Gagal mengambil data PPDB: ${ppdbError.message}`
          )
        }

        if (!ppdb) {
          throw new Error(
            "Data pendaftaran belum ditemukan. Silakan selesaikan tahap sebelumnya."
          )
        }

        setPpdbId(ppdb.id)

        const {
          data: documents,
          error: documentsError,
        } = await supabase
          .from("ppdb_documents")
          .select("*")
          .eq("ppdb_id", ppdb.id)

        if (documentsError) {
          throw new Error(
            `Gagal mengambil data berkas: ${documentsError.message}`
          )
        }

        const uploadedMap: Record<
          string,
          UploadedFile
        > = {}

        for (const document of documents || []) {
          uploadedMap[
            document.jenis_dokumen
          ] = document
        }

        setUploaded(uploadedMap)
      } catch (err: any) {
        console.error(
          "ERROR LOAD BERKAS:",
          err
        )

        setError(
          err?.message ||
            "Data berkas gagal dimuat."
        )
      } finally {
        setChecking(false)
      }
    }

    loadData()
  }, [supabase])

  // =========================================================
  // PILIH FILE
  // =========================================================

  function handleFileChange(
    key: string,
    file: File | null
  ) {
    setError("")
    setSuccess("")

    if (!file) {
      setFiles((prev) => ({
        ...prev,
        [key]: null,
      }))

      return
    }

    const maxSize =
      5 * 1024 * 1024

    if (file.size > maxSize) {
      setError(
        `${file.name} terlalu besar. Maksimal ukuran file adalah 5 MB.`
      )

      return
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ]

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Format file tidak didukung. Gunakan PDF, JPG, JPEG, atau PNG."
      )

      return
    }

    setFiles((prev) => ({
      ...prev,
      [key]: file,
    }))
  }

  // =========================================================
  // UPLOAD DOKUMEN
  // =========================================================

  async function uploadDocument(
    document: DocumentItem
  ) {
    const file = files[document.key]

    if (!file) {
      setError(
        `Silakan pilih ${document.label} terlebih dahulu.`
      )

      return
    }

    if (!ppdbId || !userId) {
      setError(
        "Data pendaftaran belum siap."
      )

      return
    }

    try {
      setUploading(document.key)
      setError("")
      setSuccess("")

      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() ||
        "file"

      const safeName =
        `${document.key}-${Date.now()}.${extension}`

      const filePath =
        `${userId}/${ppdbId}/${document.key}/${safeName}`

      // -----------------------------------------------------
      // UPLOAD FILE KE STORAGE
      // -----------------------------------------------------

      const {
        error: uploadError,
      } = await supabase.storage
        .from("ppdb-documents")
        .upload(
          filePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
          }
        )

      if (uploadError) {
        throw new Error(
          `Upload file gagal: ${uploadError.message}`
        )
      }

      // -----------------------------------------------------
      // CEK METADATA
      // -----------------------------------------------------

      const {
        data: existingDocument,
        error: existingError,
      } = await supabase
        .from("ppdb_documents")
        .select(
          "id, file_path"
        )
        .eq(
          "ppdb_id",
          ppdbId
        )
        .eq(
          "jenis_dokumen",
          document.key
        )
        .maybeSingle()

      if (existingError) {
        await supabase.storage
          .from("ppdb-documents")
          .remove([filePath])

        throw new Error(
          `Gagal memeriksa dokumen: ${existingError.message}`
        )
      }

      // -----------------------------------------------------
      // UPDATE DOKUMEN LAMA
      // -----------------------------------------------------

      if (existingDocument) {
        const oldFilePath =
          existingDocument.file_path

        const {
          data: updatedDocument,
          error: updateError,
        } = await supabase
          .from("ppdb_documents")
          .update({
            nama_file:
              file.name,

            file_path:
              filePath,

            file_size:
              file.size,

            mime_type:
              file.type,

            status:
              "uploaded",

            catatan:
              null,

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            existingDocument.id
          )
          .select()
          .single()

        if (updateError) {
          await supabase.storage
            .from("ppdb-documents")
            .remove([filePath])

          throw new Error(
            `Data dokumen gagal diperbarui: ${updateError.message}`
          )
        }

        // Hapus file lama setelah metadata baru berhasil
        if (oldFilePath) {
          await supabase.storage
            .from("ppdb-documents")
            .remove([
              oldFilePath,
            ])
        }

        setUploaded((prev) => ({
          ...prev,
          [document.key]:
            updatedDocument,
        }))
      }

      // -----------------------------------------------------
      // INSERT DOKUMEN BARU
      // -----------------------------------------------------

      else {
        const {
          data: newDocument,
          error: insertError,
        } = await supabase
          .from("ppdb_documents")
          .insert({
            ppdb_id:
              ppdbId,

            jenis_dokumen:
              document.key,

            nama_file:
              file.name,

            file_path:
              filePath,

            file_size:
              file.size,

            mime_type:
              file.type,

            status:
              "uploaded",
          })
          .select()
          .single()

        if (insertError) {
          await supabase.storage
            .from("ppdb-documents")
            .remove([filePath])

          throw new Error(
            `Data dokumen gagal disimpan: ${insertError.message}`
          )
        }

        setUploaded((prev) => ({
          ...prev,
          [document.key]:
            newDocument,
        }))
      }

      setFiles((prev) => ({
        ...prev,
        [document.key]: null,
      }))

      setSuccess(
        `${document.label} berhasil diunggah.`
      )
    } catch (err: any) {
      console.error(
        "ERROR UPLOAD:",
        err
      )

      setError(
        err?.message ||
          "File gagal diunggah."
      )
    } finally {
      setUploading(null)
    }
  }

  // =========================================================
  // HAPUS DOKUMEN
  // =========================================================

  async function deleteDocument(
    document: DocumentItem
  ) {
    const existing =
      uploaded[document.key]

    if (!existing) {
      return
    }

    const confirmed =
      window.confirm(
        `Apakah Anda yakin ingin menghapus ${document.label}?`
      )

    if (!confirmed) {
      return
    }

    try {
      setUploading(document.key)
      setError("")
      setSuccess("")

      const {
        error: storageError,
      } = await supabase.storage
        .from("ppdb-documents")
        .remove([
          existing.file_path,
        ])

      if (storageError) {
        throw new Error(
          `File gagal dihapus: ${storageError.message}`
        )
      }

      const {
        error: databaseError,
      } = await supabase
        .from("ppdb_documents")
        .delete()
        .eq(
          "id",
          existing.id
        )

      if (databaseError) {
        throw new Error(
          `Data dokumen gagal dihapus: ${databaseError.message}`
        )
      }

      setUploaded((prev) => {
        const next = {
          ...prev,
        }

        delete next[
          document.key
        ]

        return next
      })

      setSuccess(
        `${document.label} berhasil dihapus.`
      )
    } catch (err: any) {
      console.error(
        "ERROR DELETE DOCUMENT:",
        err
      )

      setError(
        err?.message ||
          "Dokumen gagal dihapus."
      )
    } finally {
      setUploading(null)
    }
  }

  // =========================================================
  // LANJUT KE TAHAP BERIKUTNYA
  // =========================================================

  function handleContinue() {
    setError("")
    setSuccess("")

    const missingDocuments =
      DOCUMENTS.filter(
        (document) =>
          document.required &&
          !uploaded[document.key]
      )

    if (
      missingDocuments.length > 0
    ) {
      const daftarDokumen =
        missingDocuments
          .map(
            (document) =>
              document.label
          )
          .join(", ")

      setError(
        `Dokumen belum lengkap. Silakan unggah: ${daftarDokumen}.`
      )

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })

      return
    }

    setSuccess(
      "Seluruh dokumen sudah lengkap. Melanjutkan ke tahap berikutnya..."
    )

    setTimeout(() => {
      window.location.href =
        "/ppdb/daftar/pernyataan"
    }, 1000)
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

    if (
      bytes <
      1024 * 1024
    ) {
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
  // LOADING
  // =========================================================

  if (checking) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef4fa]">

        <div className="relative z-10 text-center">

          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-[3px] border-blue-100 border-t-[#174f91] shadow-sm" />

          <p className="mt-4 text-sm font-semibold text-[#647489]">
            Menyiapkan halaman berkas...
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.96),transparent_36%),radial-gradient(circle_at_7%_34%,rgba(37,99,235,0.10),transparent_28%),radial-gradient(circle_at_94%_54%,rgba(6,182,212,0.08),transparent_30%)]" />
        <div className="absolute -left-48 top-24 h-96 w-96 rounded-full bg-blue-300/10 blur-3xl edu-float" />
        <div className="absolute -right-44 top-56 h-96 w-96 rounded-full bg-cyan-300/10 blur-3xl edu-float-reverse" />
        <div className="absolute left-[10%] top-[40%] h-20 w-20 rounded-full border border-white/60 bg-white/20 backdrop-blur-sm edu-pulse" />
        <div className="absolute right-[10%] top-[67%] h-14 w-14 rounded-full border border-blue-200/45 bg-blue-100/20 backdrop-blur-sm edu-pulse [animation-delay:1s]" />
      </div>


      {/* HEADER */}

      <header className="relative z-10 border-b border-white/70 bg-white/84 backdrop-blur-2xl shadow-[0_12px_38px_rgba(7,26,54,0.05)]">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">

          <Link
            href="/ppdb/daftar/pendidikan"
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

            {/* STEP 1 */}

            <div className="edu-step-done flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#174f91] to-[#2675bd] text-white shadow-[0_8px_24px_rgba(23,79,145,0.22)]">

              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
              >

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m5 12 4 4L19 6"
                />

              </svg>

            </div>

            <div className="mx-3 h-px flex-1 bg-blue-200 sm:mx-5" />

            {/* STEP 2 */}

            <div className="edu-step-done flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#174f91] to-[#2675bd] text-white shadow-[0_8px_24px_rgba(23,79,145,0.22)]">

              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
              >

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m5 12 4 4L19 6"
                />

              </svg>

            </div>

            <div className="mx-3 h-px flex-1 bg-blue-200 sm:mx-5" />

            {/* STEP 3 */}

            <div className="edu-step-done flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#174f91] to-[#2675bd] text-white shadow-[0_8px_24px_rgba(23,79,145,0.22)]">

              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
              >

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m5 12 4 4L19 6"
                />

              </svg>

            </div>

            <div className="mx-3 h-px flex-1 bg-blue-200 sm:mx-5" />

            {/* STEP 4 */}

            <div className="edu-step-active flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#174f91] to-[#2675bd] text-sm font-black text-white shadow-[0_10px_28px_rgba(23,79,145,0.25)]">
              4
            </div>

          </div>

          <div className="mt-3 hidden grid-cols-4 text-center sm:grid">

            <span className="text-[11px] text-slate-500">
              Data Santri
            </span>

            <span className="text-[11px] text-slate-500">
              Orang Tua/Wali
            </span>

            <span className="text-[11px] text-slate-500">
              Pendidikan
            </span>

            <span className="text-[11px] font-black text-[#245ea8]">
              Berkas
            </span>

          </div>

        </div>

      </section>

      {/* CONTENT */}

      <section className="relative z-10 mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">

        {/* TITLE */}

        <div className="mb-8">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3.5 py-1.5 shadow-sm backdrop-blur-md">

            <span className="h-1.5 w-1.5 rounded-full bg-[#2675bd] edu-pulse" />

            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#245ea8]">
              Tahap 4 dari 6
            </span>

          </div>

          <h1 className="text-3xl font-black tracking-tight text-[#071a36] sm:text-4xl">
            Dokumen Pendaftaran
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#697787] sm:text-base">
            Unggah dokumen yang diperlukan
            untuk proses verifikasi PPDB.
          </p>

        </div>

        {/* INFO */}

        <div className="edu-note mb-6 rounded-[1.5rem] border border-blue-100 bg-[#f7fbff] px-5 py-4 shadow-sm">

          <p className="text-sm font-black text-[#245ea8]">
            Ketentuan Berkas
          </p>

          <ul className="mt-2 space-y-1.5 text-xs leading-5 text-[#607a95]">

            <li>
              Maksimal ukuran setiap file 5 MB.
            </li>

            <li>
              Format yang diterima: PDF, JPG, JPEG, dan PNG.
            </li>

            <li>
              Pastikan dokumen terlihat jelas dan mudah dibaca.
            </li>

          </ul>

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
              Berhasil
            </p>

            <p className="mt-1 text-xs leading-5 text-emerald-600">
              {success}
            </p>

          </div>
        )}

        {/* DOCUMENT LIST */}

        <div className="space-y-4">

          {DOCUMENTS.map(
            (
              document,
              index
            ) => {

              const existing =
                uploaded[
                  document.key
                ]

              const selected =
                files[
                  document.key
                ]

              const isUploading =
                uploading ===
                document.key

              return (
                <div
                  key={
                    document.key
                  }
                  className="edu-card-shine group rounded-[1.9rem] border border-white/90 bg-white/94 p-5 shadow-[0_18px_55px_rgba(7,26,54,0.07)] backdrop-blur-xl sm:p-6"
                >

                  <div className="flex flex-col gap-5">

                    {/* INFO DOKUMEN */}

                    <div className="flex items-start gap-4">

                      <div className="edu-doc-number flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#edf4fb] text-[10px] font-black text-[#245ea8] ring-1 ring-blue-100 shadow-sm transition-all duration-500 group-hover:scale-105 group-hover:-rotate-1">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <h2 className="text-sm font-black tracking-tight text-[#071a36]">
                            {
                              document.label
                            }
                          </h2>

                          {document.required && (
                            <span className="rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-red-600">
                              Wajib
                            </span>
                          )}

                          {existing && (
                            <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-emerald-600">
                              Sudah diunggah
                            </span>
                          )}

                        </div>

                        <p className="mt-1 text-[10px] font-medium text-[#7b8a9b]">
                          {
                            document.description
                          }
                        </p>

                        {existing && (
                          <div className="mt-3 rounded-[1.15rem] border border-slate-100 bg-[#f8fbfe] px-3.5 py-3 transition-all duration-300 group-hover:border-blue-100">

                            <p className="truncate text-xs font-bold text-[#465b72]">
                              {
                                existing.nama_file
                              }
                            </p>

                            <p className="mt-0.5 text-[10px] text-slate-400">
                              {formatFileSize(
                                existing.file_size
                              )}
                            </p>

                          </div>
                        )}

                      </div>

                    </div>

                    {/* UPLOAD */}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                      <label className="flex-1 cursor-pointer">

                        <div className="rounded-[1.35rem] border border-dashed border-blue-200/80 bg-[#f8fbfe] px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2675bd] hover:bg-blue-50/45 hover:shadow-sm">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#245ea8] ring-1 ring-blue-100 shadow-sm transition-transform duration-300 group-hover:scale-105">

                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                className="h-4 w-4"
                              >

                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 16V4"
                                />

                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m8 8 4-4 4 4"
                                />

                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M4 16.5v1.25A2.25 2.25 0 0 0 6.25 20h11.5A2.25 2.25 0 0 0 20 17.75V16.5"
                                />

                              </svg>

                            </div>

                            <div className="min-w-0">

                              <p className="truncate text-xs font-black text-[#34465a]">

                                {selected
                                  ? selected.name
                                  : "Pilih file"}

                              </p>

                              <p className="mt-0.5 text-[10px] text-slate-400">
                                Maksimal 5 MB
                              </p>

                            </div>

                          </div>

                        </div>

                        <input
                          type="file"
                          accept={
                            document.accept
                          }
                          className="hidden"
                          onChange={(e) =>
                            handleFileChange(
                              document.key,
                              e.target
                                .files?.[0] ||
                                null
                            )
                          }
                        />

                      </label>

                      {/* UPLOAD BUTTON */}

                      <button
                        type="button"
                        disabled={
                          !selected ||
                          isUploading
                        }
                        onClick={() =>
                          uploadDocument(
                            document
                          )
                        }
                        className="group/upload rounded-2xl bg-gradient-to-r from-[#0d3b72] via-[#174f91] to-[#2675bd] px-5 py-3.5 text-xs font-black text-white shadow-[0_10px_28px_rgba(23,79,145,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(23,79,145,0.25)] disabled:cursor-not-allowed disabled:opacity-40"
                      >

                        {isUploading
                          ? "Memproses..."
                          : existing
                          ? "Ganti File"
                          : "Unggah"}

                      </button>

                      {/* DELETE */}

                      {existing && (
                        <button
                          type="button"
                          disabled={
                            isUploading
                          }
                          onClick={() =>
                            deleteDocument(
                              document
                            )
                          }
                          className="rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-xs font-bold text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 hover:text-red-600 hover:shadow-sm disabled:opacity-40"
                        >
                          Hapus
                        </button>
                      )}

                    </div>

                  </div>

                </div>
              )
            }
          )}

        </div>

        {/* NAVIGATION */}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">

          <Link
            href="/ppdb/daftar/pendidikan"
            className="group inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-100 hover:bg-[#f8fbfe] hover:shadow-md"
          >
            Kembali
          </Link>

          <button
            type="button"
            onClick={
              handleContinue
            }
            className="group inline-flex cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-[#0d3b72] via-[#174f91] to-[#2675bd] px-7 py-3.5 text-sm font-black text-white shadow-[0_14px_34px_rgba(23,79,145,0.24)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(23,79,145,0.30)] active:scale-[0.98]"
          >

            Simpan & Lanjutkan ke Pernyataan

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
                d="M5 12h14"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m13 6 6 6-6 6"
              />

            </svg>

          </button>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="relative z-10 border-t border-white/10 bg-[#071a36] text-white">

        <div className="mx-auto max-w-6xl px-5 py-7 text-center sm:px-8">

          <p className="text-sm font-black tracking-[0.06em] text-white">
            INIBS Smart Digital
          </p>

          <p className="mt-1 text-xs text-blue-200">
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

        .edu-glow {
          animation: eduGlow 7s ease-in-out infinite;
        }

        .edu-reveal {
          animation: eduReveal 800ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .edu-step-done {
          animation: eduStepDone 700ms ease-out both;
        }

        .edu-step-active {
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
          transform: translateY(-6px);
          border-color: rgba(191,219,254,0.95);
          box-shadow: 0 30px 76px rgba(7,26,54,0.11);
        }

        .edu-card-shine:hover::after {
          left: 140%;
        }

        .edu-note {
          animation: eduReveal 700ms 100ms cubic-bezier(0.22, 1, 0.36, 1) both;
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

        @keyframes eduGlow {
          0%, 100% { opacity: 0.30; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(1.08); }
        }

        @keyframes eduStepDone {
          from { opacity: 0; transform: scale(0.75); }
          to { opacity: 1; transform: scale(1); }
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