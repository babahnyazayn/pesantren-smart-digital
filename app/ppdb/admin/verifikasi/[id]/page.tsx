"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"

type RecordData = Record<string, any>

type DocumentStatus =
  | "uploaded"
  | "verified"
  | "rejected"

export default function DetailVerifikasiPage() {
  const router = useRouter()
  const params = useParams()

  const id =
    typeof params.id === "string"
      ? params.id
      : ""

  const [application, setApplication] =
    useState<RecordData | null>(null)

  const [parent, setParent] =
    useState<RecordData | null>(null)

  const [education, setEducation] =
    useState<RecordData | null>(null)

  const [documents, setDocuments] =
    useState<RecordData[]>([])

  const [loading, setLoading] =
    useState(true)

  const [processing, setProcessing] =
    useState(false)

  const [error, setError] =
    useState("")

  const [success, setSuccess] =
    useState("")

  const [previewDocument, setPreviewDocument] =
    useState<RecordData | null>(null)

  const [previewUrl, setPreviewUrl] =
    useState("")

  const [previewLoading, setPreviewLoading] =
    useState(false)

  const [documentProcessing, setDocumentProcessing] =
    useState<string | null>(null)

  const [documentNotes, setDocumentNotes] =
    useState<Record<string, string>>({})

  const supabase =
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )

  /*
   * ============================================================
   * LOAD DATA
   * ============================================================
   */

  useEffect(() => {
    if (!id) {
      setError(
        "ID pendaftaran tidak ditemukan."
      )

      setLoading(false)

      return
    }

    loadData()
  }, [id])

  async function loadData() {
    try {
      setLoading(true)
      setError("")
      setSuccess("")

      /*
       * CEK LOGIN
       */

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

      /*
       * CEK ROLE ADMIN
       */

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

      /*
       * DATA PENDAFTAR
       */

      const {
        data: applicationData,
        error: applicationError,
      } = await supabase
        .from("ppdb_applications")
        .select("*")
        .eq("id", id)
        .maybeSingle()

      if (applicationError) {
        throw new Error(
          `Gagal mengambil data pendaftar: ${applicationError.message}`
        )
      }

      if (!applicationData) {
        throw new Error(
          "Data pendaftar tidak ditemukan."
        )
      }

      setApplication(
        applicationData
      )

      /*
       * DATA ORANG TUA
       */

      const {
        data: parentData,
        error: parentError,
      } = await supabase
        .from("ppdb_parents")
        .select("*")
        .eq("ppdb_id", id)
        .maybeSingle()

      if (parentError) {
        console.error(
          "DATA ORANG TUA:",
          parentError
        )
      }

      setParent(
        parentData || null
      )

      /*
       * DATA PENDIDIKAN
       */

      const {
        data: educationData,
        error: educationError,
      } = await supabase
        .from("ppdb_education")
        .select("*")
        .eq("ppdb_id", id)
        .maybeSingle()

      if (educationError) {
        console.error(
          "DATA PENDIDIKAN:",
          educationError
        )
      }

      setEducation(
        educationData || null
      )

      /*
       * DATA DOKUMEN
       */

      const {
        data: documentData,
        error: documentError,
      } = await supabase
        .from("ppdb_documents")
        .select("*")
        .eq("ppdb_id", id)
        .order("created_at", {
          ascending: true,
        })

      if (documentError) {
        console.error(
          "DATA DOKUMEN:",
          documentError
        )

        setDocuments([])
      } else {
        setDocuments(
          documentData || []
        )

        /*
         * Isi catatan awal dari database
         */

        const notes: Record<
          string,
          string
        > = {}

        ;(documentData || []).forEach(
          (document) => {
            notes[document.id] =
              document.catatan || ""
          }
        )

        setDocumentNotes(notes)
      }
    } catch (err: any) {
      console.error(
        "ERROR DETAIL VERIFIKASI:",
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

  /*
   * ============================================================
   * UPDATE STATUS PENDAFTARAN
   * ============================================================
   */

  async function updateStatus(
    status:
      | "VERIFIKASI"
      | "DITOLAK"
  ) {
    if (!application) {
      return
    }

    const confirmation =
      status === "VERIFIKASI"
        ? "Data pendaftar sudah diperiksa dan akan diteruskan ke tahap seleksi. Lanjutkan?"
        : "Apakah Anda yakin ingin menolak pendaftaran ini?"

    const confirmed =
      window.confirm(
        confirmation
      )

    if (!confirmed) {
      return
    }

    try {
      setProcessing(true)
      setError("")
      setSuccess("")

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace("/login")
        return
      }

      /*
       * CEK ADMIN
       */

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
          "Anda tidak memiliki hak akses admin."
        )
      }

      /*
       * UPDATE STATUS
       */

      const {
        error: updateError,
      } = await supabase
        .from("ppdb_applications")
        .update({
          status,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", id)

      if (updateError) {
        throw new Error(
          `Gagal memperbarui status: ${updateError.message}`
        )
      }

      setApplication(
        (current) =>
          current
            ? {
                ...current,
                status,
              }
            : current
      )

      setSuccess(
        status === "VERIFIKASI"
          ? "Pendaftaran berhasil lolos verifikasi dan diteruskan ke tahap seleksi."
          : "Pendaftaran berhasil ditolak."
      )
    } catch (err: any) {
      console.error(
        "ERROR UPDATE STATUS:",
        err
      )

      setError(
        err?.message ||
          "Status gagal diperbarui."
      )
    } finally {
      setProcessing(false)
    }
  }

  /*
   * ============================================================
   * PREVIEW DOKUMEN
   * ============================================================
   */

  async function openDocument(
    document: RecordData
  ) {
    if (!document?.file_path) {
      setError(
        "File dokumen tidak memiliki file_path."
      )

      return
    }

    try {
      setPreviewLoading(true)
      setError("")
      setPreviewDocument(document)
      setPreviewUrl("")

      const {
        data,
        error: storageError,
      } = await supabase.storage
        .from("ppdb-documents")
        .createSignedUrl(
          document.file_path,
          60 * 60
        )

      if (storageError) {
        throw new Error(
          `Dokumen tidak dapat dibuka: ${storageError.message}`
        )
      }

      if (!data?.signedUrl) {
        throw new Error(
          "URL dokumen tidak berhasil dibuat."
        )
      }

      setPreviewUrl(
        data.signedUrl
      )
    } catch (err: any) {
      console.error(
        "ERROR PREVIEW DOKUMEN:",
        err
      )

      setPreviewDocument(null)
      setPreviewUrl("")

      setError(
        err?.message ||
          "Dokumen gagal dibuka."
      )
    } finally {
      setPreviewLoading(false)
    }
  }

  function closeDocument() {
    setPreviewDocument(null)
    setPreviewUrl("")
    setPreviewLoading(false)
  }

  function isImageDocument(
    document: RecordData
  ) {
    const mime =
      String(
        document?.mime_type || ""
      ).toLowerCase()

    return mime.startsWith(
      "image/"
    )
  }

  function isPdfDocument(
    document: RecordData
  ) {
    const mime =
      String(
        document?.mime_type || ""
      ).toLowerCase()

    return (
      mime ===
        "application/pdf" ||
      String(
        document?.nama_file || ""
      )
        .toLowerCase()
        .endsWith(".pdf")
    )
  }

  function formatFileSize(
    bytes: any
  ) {
    const size = Number(bytes)

    if (
      !Number.isFinite(size) ||
      size <= 0
    ) {
      return "-"
    }

    if (size < 1024) {
      return `${size} B`
    }

    if (
      size <
      1024 * 1024
    ) {
      return `${(
        size / 1024
      ).toFixed(1)} KB`
    }

    return `${(
      size /
      (1024 * 1024)
    ).toFixed(2)} MB`
  }

  /*
   * ============================================================
   * UPDATE STATUS DOKUMEN
   *
   * DATABASE:
   *
   * uploaded
   * verified
   * rejected
   * ============================================================
   */

  async function updateDocumentReview(
    documentId: string,
    status: DocumentStatus
  ) {
    try {
      setDocumentProcessing(
        documentId
      )

      setError("")
      setSuccess("")

      const {
        data: { user },
        error: authError,
      } =
        await supabase.auth.getUser()

      if (authError) {
        throw new Error(
          `Gagal memeriksa akun: ${authError.message}`
        )
      }

      if (!user) {
        router.replace("/login")
        return
      }

      /*
       * CEK ROLE ADMIN
       */

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
          "Anda tidak memiliki hak akses admin."
        )
      }

      /*
       * UPDATE DATABASE
       */

      const {
        error: updateError,
      } = await supabase
        .from("ppdb_documents")
        .update({
          status,
          catatan:
            documentNotes[
              documentId
            ] || null,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", documentId)
        .eq("ppdb_id", id)

      if (updateError) {
        throw new Error(
          `Gagal menyimpan pemeriksaan dokumen: ${updateError.message}`
        )
      }

      /*
       * UPDATE UI
       */

      setDocuments(
        (current) =>
          current.map(
            (document) =>
              document.id ===
              documentId
                ? {
                    ...document,
                    status,
                    catatan:
                      documentNotes[
                        documentId
                      ] || null,
                  }
                : document
          )
      )

      setSuccess(
        status === "verified"
          ? "Dokumen berhasil dinyatakan valid."
          : "Dokumen dinyatakan tidak valid."
      )
    } catch (err: any) {
      console.error(
        "ERROR UPDATE DOKUMEN:",
        err
      )

      setError(
        err?.message ||
          "Pemeriksaan dokumen gagal disimpan."
      )
    } finally {
      setDocumentProcessing(null)
    }
  }

  /*
   * ============================================================
   * STATUS DOKUMEN
   * ============================================================
   */

  function getDocumentStatusLabel(
    status:
      | string
      | null
      | undefined
  ) {
    switch (status) {
      case "verified":
        return "VALID"

      case "rejected":
        return "TIDAK VALID"

      case "uploaded":
      default:
        return "BELUM DIPERIKSA"
    }
  }

  function getDocumentStatusStyle(
    status:
      | string
      | null
      | undefined
  ) {
    switch (status) {
      case "verified":
        return "border-emerald-200 bg-emerald-50 text-emerald-700"

      case "rejected":
        return "border-red-200 bg-red-50 text-red-700"

      case "uploaded":
      default:
        return "border-amber-200 bg-amber-50 text-amber-700"
    }
  }

  /*
   * ============================================================
   * FORMAT LABEL
   * ============================================================
   */

  function formatLabel(
    key: string
  ) {
    return key
      .replace(/_/g, " ")
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      )
  }

  /*
   * ============================================================
   * FORMAT VALUE
   * ============================================================
   */

  function formatValue(
    value: any
  ): string {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "-"
    }

    if (
      typeof value === "boolean"
    ) {
      return value
        ? "Ya"
        : "Tidak"
    }

    if (
      typeof value === "object"
    ) {
      return JSON.stringify(
        value,
        null,
        2
      )
    }

    return String(value)
  }

  /*
   * ============================================================
   * HIDDEN COLUMNS
   * ============================================================
   */

  function shouldHide(
    key: string
  ) {
    const hidden = [
      "id",
      "user_id",
      "ppdb_id",
    ]

    return hidden.includes(
      key.toLowerCase()
    )
  }

  /*
   * ============================================================
   * STATUS PENDAFTARAN
   * ============================================================
   */

  function statusClass(
    status: any
  ) {
    switch (
      String(
        status || ""
      ).toUpperCase()
    ) {
      case "MENUNGGU":
        return "border-amber-200 bg-amber-50 text-amber-700"

      case "VERIFIKASI":
        return "border-blue-200 bg-blue-50 text-blue-700"

      case "SELEKSI":
        return "border-purple-200 bg-purple-50 text-purple-700"

      case "DITERIMA":
        return "border-emerald-200 bg-emerald-50 text-emerald-700"

      case "DITOLAK":
        return "border-red-200 bg-red-50 text-red-700"

      case "DRAFT":
        return "border-slate-200 bg-slate-50 text-slate-600"

      default:
        return "border-slate-200 bg-slate-50 text-slate-600"
    }
  }

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/40">

        <div className="text-center animate-in fade-in duration-500">

          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />

          <p className="mt-5 text-sm font-bold text-slate-600">
            Memuat data verifikasi...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Mohon tunggu sebentar
          </p>

        </div>

      </main>
    )
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (
    error &&
    !application
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/40 px-5">

        <div className="w-full max-w-lg rounded-3xl border border-red-200/80 bg-white p-8 text-center shadow-xl shadow-slate-200/50 animate-in fade-in zoom-in-95 duration-500">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-2xl font-black text-red-600">
            !
          </div>

          <h1 className="mt-5 text-xl font-black text-slate-900">
            Data Tidak Dapat Dimuat
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <div className="mt-6 flex justify-center gap-3">

            <Link
              href="/ppdb/admin/verifikasi"
              className="cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md active:scale-95"
            >
              Kembali
            </Link>

            <button
              type="button"
              onClick={loadData}
              className="cursor-pointer rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:bg-blue-800 hover:shadow-lg active:scale-95"
            >
              Coba Lagi
            </button>

          </div>

        </div>

      </main>
    )
  }

  if (!application) {
    return null
  }

  /*
   * ============================================================
   * DATA YANG DITAMPILKAN
   * ============================================================
   */

  const applicationFields =
    Object.entries(
      application
    ).filter(
      ([key]) =>
        !shouldHide(key)
    )

  const parentFields =
    parent
      ? Object.entries(
          parent
        ).filter(
          ([key]) =>
            !shouldHide(key)
        )
      : []

  const educationFields =
    education
      ? Object.entries(
          education
        ).filter(
          ([key]) =>
            !shouldHide(key)
        )
      : []

  /*
   * ============================================================
   * HITUNG DOKUMEN
   * ============================================================
   */

  const verifiedDocuments =
    documents.filter(
      (document) =>
        document.status ===
        "verified"
    ).length

  const rejectedDocuments =
    documents.filter(
      (document) =>
        document.status ===
        "rejected"
    ).length

  const uploadedDocuments =
    documents.filter(
      (document) =>
        !document.status ||
        document.status ===
          "uploaded"
    ).length

  const allDocumentsVerified =
    documents.length > 0 &&
    verifiedDocuments ===
      documents.length

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 text-slate-800">

      {/* HEADER */}

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl">

        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">
                INIBS SMART DIGITAL
              </p>

              <h1 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
                Pemeriksaan Pendaftar
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                Imam Nawawi Islamic Boarding School
              </p>

            </div>

            <div className="flex flex-wrap gap-2">

              <Link
                href="/ppdb/admin/verifikasi"
                className="group cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md active:scale-95"
              >
                <span className="mr-2 transition-transform duration-300 group-hover:-translate-x-1">
                  ←
                </span>
                Kembali
              </Link>

              <Link
                href="/ppdb/admin"
                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md active:scale-95"
              >
                Dashboard
              </Link>

            </div>

          </div>

        </div>

      </header>

      {/* CONTENT */}

      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8">

        {/* HERO */}

        <div className="relative overflow-hidden rounded-3xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/70 p-6 shadow-lg shadow-slate-200/50 animate-in fade-in slide-in-from-bottom-3 duration-500 sm:p-8">

          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-blue-700 via-cyan-500 to-blue-700" />

          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-100/40 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-700">
                Detail Pendaftaran
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                {application.nama_lengkap ||
                  application.nama ||
                  "Calon Santri"}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Nomor pendaftaran:{" "}
                <span className="font-black text-blue-700">
                  {application.nomor_pendaftaran ||
                    "-"}
                </span>
              </p>

            </div>

            <div className="flex flex-col items-start gap-3 sm:items-end">

              <span
                className={`inline-flex rounded-full border px-4 py-2 text-xs font-black ${statusClass(
                  application.status
                )}`}
              >
                {application.status ||
                  "-"}
              </span>

              <div className="flex flex-wrap gap-2">

                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700">
                  {verifiedDocuments} Valid
                </span>

                <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-[10px] font-bold text-amber-700">
                  {uploadedDocuments} Belum Diperiksa
                </span>

                <span className="rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-[10px] font-bold text-red-700">
                  {rejectedDocuments} Tidak Valid
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* SUCCESS */}

        {success && (
          <div className="mt-5 flex animate-in fade-in slide-in-from-top-2 items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 shadow-sm duration-300">

            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-emerald-700">
              ✓
            </div>

            <p className="pt-1 text-sm font-bold text-emerald-700">
              {success}
            </p>

          </div>
        )}

        {/* ERROR */}

        {error && application && (
          <div className="mt-5 flex animate-in fade-in slide-in-from-top-2 items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 shadow-sm duration-300">

            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-black text-red-700">
              !
            </div>

            <p className="pt-1 text-sm font-bold text-red-700">
              {error}
            </p>

          </div>
        )}

        {/* DATA CALON SANTRI */}

        <DataSection
          title="Data Calon Santri"
          description="Seluruh data yang tersimpan pada formulir utama pendaftaran."
          data={applicationFields}
          formatLabel={formatLabel}
          formatValue={formatValue}
        />

        {/* DATA ORANG TUA */}

        <DataSection
          title="Data Orang Tua / Wali"
          description="Data orang tua atau wali yang tersimpan pada pendaftaran."
          data={parentFields}
          formatLabel={formatLabel}
          formatValue={formatValue}
          emptyText="Data orang tua atau wali belum tersedia."
        />

        {/* DATA PENDIDIKAN */}

        <DataSection
          title="Data Pendidikan"
          description="Data pendidikan yang tersimpan dalam sistem."
          data={educationFields}
          formatLabel={formatLabel}
          formatValue={formatValue}
          emptyText="Data pendidikan belum tersedia."
        />

        {/* DOKUMEN */}

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-sm animate-in fade-in slide-in-from-bottom-3 duration-700">

          <div className="border-b border-slate-100 bg-gradient-to-r from-white to-blue-50/50 px-6 py-6 sm:px-8">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-700">
                  Pemeriksaan
                </p>

                <h3 className="mt-1.5 text-lg font-black tracking-tight text-slate-900">
                  Berkas Pendaftaran
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Periksa setiap dokumen sebelum pendaftaran diteruskan ke tahap seleksi.
                </p>

              </div>

              <div className="flex flex-wrap gap-2">

                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-500">
                  {documents.length} Dokumen
                </span>

                <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-blue-700">
                  Bucket: ppdb-documents
                </span>

              </div>

            </div>

          </div>

          {documents.length === 0 ? (

            <div className="px-6 py-12 sm:px-8">

              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                  📄
                </div>

                <p className="mt-4 text-sm font-black text-slate-700">
                  Belum ada dokumen
                </p>

                <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-400">
                  Tidak ditemukan berkas yang terhubung dengan pendaftaran ini.
                </p>

              </div>

            </div>

          ) : (

            <div className="divide-y divide-slate-100">

              {documents.map(
                (
                  document,
                  index
                ) => {

                  const documentStatus =
                    (document.status ||
                      "uploaded") as DocumentStatus

                  const statusText =
                    getDocumentStatusLabel(
                      documentStatus
                    )

                  const statusStyle =
                    getDocumentStatusStyle(
                      documentStatus
                    )

                  return (
                    <div
                      key={
                        document.id ||
                        index
                      }
                      className="group p-5 transition-all duration-300 hover:bg-blue-50/30 sm:p-7"
                    >

                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                        <div className="flex min-w-0 gap-4">

                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 text-xl shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-105 group-hover:shadow-md">

                            {isImageDocument(
                              document
                            )
                              ? "🖼️"
                              : isPdfDocument(
                                    document
                                  )
                                ? "📕"
                                : "📄"}

                          </div>

                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                              <h4 className="text-sm font-black text-slate-900">
                                {document.jenis_dokumen ||
                                  "Dokumen Pendaftaran"}
                              </h4>

                              <span
                                className={`rounded-full border px-2.5 py-1 text-[9px] font-black tracking-wide transition-all duration-300 ${statusStyle}`}
                              >
                                {statusText}
                              </span>

                            </div>

                            <p className="mt-1 break-all text-sm font-bold text-slate-700">
                              {document.nama_file ||
                                "Nama file tidak tersedia"}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">

                              <span>
                                {formatFileSize(
                                  document.file_size
                                )}
                              </span>

                              <span>
                                {document.mime_type ||
                                  "Tipe file tidak diketahui"}
                              </span>

                              {document.created_at && (
                                <span>
                                  Diunggah{" "}
                                  {new Date(
                                    document.created_at
                                  ).toLocaleDateString(
                                    "id-ID",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )}
                                </span>
                              )}

                            </div>

                          </div>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            openDocument(
                              document
                            )
                          }
                          className="group/view inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-xs font-black text-blue-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-50 hover:shadow-lg active:scale-95 lg:min-w-[150px]"
                        >

                          <span className="transition-transform duration-300 group-hover/view:scale-125">
                            👁
                          </span>

                          Lihat Dokumen

                        </button>

                      </div>

                      {/* CATATAN DAN TOMBOL */}

                      <div className="mt-5 grid gap-4 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-4 lg:grid-cols-[1fr_auto] lg:items-end">

                        <div>

                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Catatan Pemeriksaan
                          </label>

                          <textarea
                            value={
                              documentNotes[
                                document.id
                              ] ??
                              document.catatan ??
                              ""
                            }
                            onChange={(
                              event
                            ) =>
                              setDocumentNotes(
                                (
                                  current
                                ) => ({
                                  ...current,
                                  [document.id]:
                                    event.target.value,
                                })
                              )
                            }
                            placeholder="Tulis catatan jika diperlukan..."
                            rows={2}
                            className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-700 outline-none transition-all duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          />

                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row lg:min-w-[180px] lg:flex-col">

                          {/* VALID */}

                          {documentStatus === "verified" ? (
                            <div className="inline-flex min-h-[46px] cursor-default items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-xs font-black text-emerald-700 shadow-sm">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-black text-white">
                                ✓
                              </span>
                              Dokumen Valid
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={
                                documentProcessing ===
                                document.id
                              }
                              onClick={() =>
                                updateDocumentReview(
                                  document.id,
                                  "verified"
                                )
                              }
                              className="group/valid inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-black text-white shadow-md shadow-emerald-100 transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-700 hover:shadow-xl active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/30 bg-white/10 text-xs transition-transform duration-300 group-hover/valid:scale-125">
                                {documentProcessing ===
                                document.id
                                  ? "..."
                                  : "✓"}
                              </span>

                              {documentProcessing ===
                              document.id
                                ? "Menyimpan..."
                                : "Valid"}
                            </button>
                          )}

                          {/* TIDAK VALID */}

                          {documentStatus === "rejected" ? (
                            <div className="inline-flex min-h-[46px] cursor-default items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-xs font-black text-red-700 shadow-sm">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[11px] font-black text-white">
                                ×
                              </span>
                              Dokumen Tidak Valid
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={
                                documentProcessing ===
                                document.id
                              }
                              onClick={() =>
                                updateDocumentReview(
                                  document.id,
                                  "rejected"
                                )
                              }
                              className="group/rejected inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-xs font-black text-red-600 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-red-300 hover:bg-red-50 hover:shadow-lg active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-red-100 bg-red-50 text-sm transition-transform duration-300 group-hover/rejected:scale-125">
                                ×
                              </span>

                              Tidak Valid
                            </button>
                          )}

                        </div>

                      </div>

                    </div>
                  )
                }
              )}

            </div>

          )}

        </section>

        {/* KEPUTUSAN */}

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-sm animate-in fade-in slide-in-from-bottom-3 duration-1000">

          <div className="border-b border-slate-100 bg-gradient-to-r from-white to-blue-50/40 p-6 sm:p-8">

            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-700">
              Keputusan
            </p>

            <h3 className="mt-2 text-lg font-black tracking-tight text-slate-900">
              Proses Verifikasi
            </h3>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Pastikan seluruh data dan dokumen sudah diperiksa sebelum meneruskan pendaftaran ke tahap seleksi.
            </p>

          </div>

          <div className="p-6 sm:p-8">

            {/* STATUS DOKUMEN */}

            <div
              className={`rounded-2xl border p-5 transition-all duration-300 ${
                allDocumentsVerified
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >

              <div className="flex items-start gap-3">

                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
                    allDocumentsVerified
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {allDocumentsVerified
                    ? "✓"
                    : "!"}
                </div>

                <div>

                  <p
                    className={`text-sm font-black ${
                      allDocumentsVerified
                        ? "text-emerald-800"
                        : "text-amber-800"
                    }`}
                  >
                    {allDocumentsVerified
                      ? "Semua dokumen sudah valid"
                      : "Dokumen belum seluruhnya valid"}
                  </p>

                  <p
                    className={`mt-1 text-xs leading-5 ${
                      allDocumentsVerified
                        ? "text-emerald-700"
                        : "text-amber-700"
                    }`}
                  >
                    {allDocumentsVerified
                      ? "Pendaftar dapat diteruskan ke tahap seleksi."
                      : "Periksa seluruh dokumen terlebih dahulu sebelum meluluskan verifikasi."}
                  </p>

                </div>

              </div>

            </div>

            {/* TOMBOL KEPUTUSAN */}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">

              <button
                type="button"
                disabled={
                  processing ||
                  application.status ===
                    "VERIFIKASI" ||
                  !allDocumentsVerified
                }
                onClick={() =>
                  updateStatus(
                    "VERIFIKASI"
                  )
                }
                title={
                  !allDocumentsVerified
                    ? "Semua dokumen harus valid terlebih dahulu."
                    : undefined
                }
                className="group cursor-pointer rounded-2xl bg-blue-700 px-5 py-4 text-sm font-black text-white shadow-lg shadow-blue-100 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-800 hover:shadow-xl active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
              >

                <span className="flex items-center justify-center gap-2">

                  <span className="transition-transform duration-300 group-hover:scale-125">
                    ✓
                  </span>

                  {processing
                    ? "Memproses..."
                    : application.status ===
                        "VERIFIKASI"
                      ? "Sudah Diverifikasi"
                      : "Lulus Verifikasi"}

                </span>

              </button>

              <button
                type="button"
                disabled={
                  processing ||
                  application.status ===
                    "DITOLAK"
                }
                onClick={() =>
                  updateStatus(
                    "DITOLAK"
                  )
                }
                className="group cursor-pointer rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-black text-red-600 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-red-300 hover:bg-red-100 hover:shadow-lg active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
              >

                <span className="flex items-center justify-center gap-2">

                  <span className="transition-transform duration-300 group-hover:scale-125">
                    ×
                  </span>

                  {processing
                    ? "Memproses..."
                    : application.status ===
                        "DITOLAK"
                      ? "Sudah Ditolak"
                      : "Tolak Pendaftaran"}

                </span>

              </button>

            </div>

            {!allDocumentsVerified &&
              documents.length > 0 && (
                <p className="mt-4 text-center text-[11px] font-semibold text-amber-600">
                  Semua dokumen harus berstatus VALID sebelum pendaftaran diteruskan ke tahap seleksi.
                </p>
              )}

          </div>

        </section>

        {/* FOOTER */}

        <footer className="py-8 text-center">

          <p className="text-sm font-bold text-slate-700">
            INIBS Smart Digital
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Imam Nawawi Islamic Boarding School
          </p>

          <p className="mt-3 text-[10px] text-slate-400">
            © 2026 Imam Nawawi Islamic Boarding School
          </p>

        </footer>

      </section>

      {/* ========================================================
          PREVIEW DOKUMEN
          ======================================================== */}

      {previewDocument && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-md animate-in fade-in duration-200 sm:p-6"
          onClick={closeDocument}
        >

          <div
            className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">

              <div className="min-w-0">

                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-700">
                  Preview Dokumen
                </p>

                <h3 className="mt-1 truncate text-sm font-black text-slate-900">
                  {previewDocument.jenis_dokumen ||
                    previewDocument.nama_file ||
                    "Dokumen"}
                </h3>

              </div>

              <div className="flex shrink-0 items-center gap-2">

                {previewUrl && (
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hidden cursor-pointer rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-black text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md sm:inline-flex"
                  >
                    Buka Tab Baru
                  </a>
                )}

                <button
                  type="button"
                  onClick={
                    closeDocument
                  }
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-semibold text-slate-500 transition-all duration-300 hover:-translate-y-1 hover:bg-slate-100 hover:text-slate-800 hover:shadow-md active:scale-90"
                  aria-label="Tutup preview"
                >
                  ×
                </button>

              </div>

            </div>

            {/* PREVIEW CONTENT */}

            <div className="min-h-[420px] flex-1 overflow-auto bg-slate-100 p-3 sm:p-5">

              {previewLoading ? (

                <div className="flex min-h-[420px] items-center justify-center">

                  <div className="text-center">

                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />

                    <p className="mt-4 text-sm font-bold text-slate-600">
                      Membuka dokumen...
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Membuat akses aman ke file.
                    </p>

                  </div>

                </div>

              ) : previewUrl ? (

                isImageDocument(
                  previewDocument
                ) ? (

                  <div className="flex min-h-[420px] items-center justify-center">

                    <img
                      src={previewUrl}
                      alt={
                        previewDocument.nama_file ||
                        "Preview dokumen"
                      }
                      className="max-h-[78vh] max-w-full rounded-2xl bg-white object-contain shadow-xl"
                    />

                  </div>

                ) : isPdfDocument(
                    previewDocument
                  ) ? (

                  <iframe
                    src={previewUrl}
                    title={
                      previewDocument.nama_file ||
                      "Preview PDF"
                    }
                    className="h-[75vh] min-h-[500px] w-full rounded-2xl border border-slate-200 bg-white shadow-lg"
                  />

                ) : (

                  <div className="flex min-h-[420px] items-center justify-center">

                    <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">

                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                        📄
                      </div>

                      <h4 className="mt-4 text-base font-black text-slate-900">
                        File siap dibuka
                      </h4>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Format file ini tidak dapat dipreview langsung di halaman.
                      </p>

                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-flex cursor-pointer rounded-xl bg-blue-700 px-5 py-3 text-xs font-black text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-blue-800 hover:shadow-lg active:scale-95"
                      >
                        Buka File
                      </a>

                    </div>

                  </div>

                )

              ) : (

                <div className="flex min-h-[420px] items-center justify-center">

                  <p className="text-sm font-bold text-slate-500">
                    Preview dokumen tidak tersedia.
                  </p>

                </div>

              )}

            </div>

          </div>

        </div>
      )}

    </main>
  )
}


/*
 * ==============================================================
 * DATA SECTION
 * ==============================================================
 */

function DataSection({
  title,
  description,
  data,
  formatLabel,
  formatValue,
  emptyText = "Data belum tersedia.",
}: {
  title: string
  description: string
  data: [string, any][]
  formatLabel: (
    value: string
  ) => string
  formatValue: (
    value: any
  ) => string
  emptyText?: string
}) {
  return (
    <section className="mt-6 rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-sm animate-in fade-in slide-in-from-bottom-3 duration-500 sm:p-8">

      <div className="border-b border-slate-100 pb-5">

        <h3 className="text-lg font-black tracking-tight text-slate-900">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          {description}
        </p>

      </div>

      {data.length === 0 ? (

        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">

          <p className="text-sm font-bold text-slate-600">
            {emptyText}
          </p>

        </div>

      ) : (

        <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">

          {data.map(
            ([
              key,
              value,
            ]) => (

              <div
                key={key}
                className={
                  typeof value ===
                    "string" &&
                  value.length >
                    150
                    ? "sm:col-span-2 lg:col-span-3"
                    : ""
                }
              >

                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {formatLabel(
                    key
                  )}
                </p>

                <p className="mt-1.5 break-words whitespace-pre-wrap text-sm font-semibold leading-6 text-slate-700">
                  {formatValue(
                    value
                  )}
                </p>

              </div>

            )
          )}

        </div>

      )}

    </section>
  )
}