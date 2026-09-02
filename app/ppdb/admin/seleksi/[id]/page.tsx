"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

type Application = {
  id: string
  nama_lengkap: string | null
  nomor_pendaftaran: string | null
  nik: string | null
  nisn: string | null
  asal_sekolah: string | null
  jenis_kelamin: string | null
  status: string | null
}

type Selection = {
  id?: string
  ppdb_id: string
  nilai_akademik: number | null
  nilai_alquran: number | null
  nilai_bahasa_arab: number | null
  nilai_wawancara: number | null
  nilai_adab: number | null
  nilai_akhir: number | null
  catatan: string
  keputusan: "DITERIMA" | "DITOLAK" | null
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

const SCORE_FIELDS = [
  { key: "nilai_akademik", label: "Nilai Akademik", weight: 20, icon: "A" },
  { key: "nilai_alquran", label: "Tes Al-Qur'an", weight: 25, icon: "Q" },
  { key: "nilai_bahasa_arab", label: "Bahasa Arab", weight: 20, icon: "ع" },
  { key: "nilai_wawancara", label: "Wawancara", weight: 20, icon: "W" },
  { key: "nilai_adab", label: "Adab & Kepribadian", weight: 15, icon: "✓" },
] as const

type ScoreField = (typeof SCORE_FIELDS)[number]["key"]

export default function SeleksiDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : ""

  const [application, setApplication] = useState<Application | null>(null)
  const [selection, setSelection] = useState<Selection>(() => emptySelection(id))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const finalScore = useMemo(() => calculateFinalScore(selection), [selection])

  const loadData = useCallback(async () => {
    if (!id) {
      setError("ID pendaftaran tidak ditemukan.")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError("")
      setSuccess("")

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) throw new Error(`Gagal memeriksa akun: ${authError.message}`)
      if (!user) {
        router.replace("/login")
        return
      }

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle()

      if (roleError) throw new Error(`Gagal memeriksa hak akses: ${roleError.message}`)
      if (!roleData || roleData.role !== "ADMIN") {
        router.replace("/ppdb")
        return
      }

      const { data: applicationData, error: applicationError } = await supabase
        .from("ppdb_applications")
        .select(
          "id,nama_lengkap,nomor_pendaftaran,nik,nisn,asal_sekolah,jenis_kelamin,status"
        )
        .eq("id", id)
        .maybeSingle()

      if (applicationError) {
        throw new Error(`Gagal mengambil data pendaftar: ${applicationError.message}`)
      }

      if (!applicationData) throw new Error("Data pendaftar tidak ditemukan.")

      setApplication(applicationData)

      const { data: selectionData, error: selectionError } = await supabase
        .from("ppdb_selections")
        .select("*")
        .eq("ppdb_id", id)
        .maybeSingle()

      if (selectionError) {
        throw new Error(`Gagal mengambil data penilaian: ${selectionError.message}`)
      }

      if (selectionData) {
        setSelection({
          id: selectionData.id,
          ppdb_id: id,
          nilai_akademik: toNumberOrNull(selectionData.nilai_akademik),
          nilai_alquran: toNumberOrNull(selectionData.nilai_alquran),
          nilai_bahasa_arab: toNumberOrNull(selectionData.nilai_bahasa_arab),
          nilai_wawancara: toNumberOrNull(selectionData.nilai_wawancara),
          nilai_adab: toNumberOrNull(selectionData.nilai_adab),
          nilai_akhir: toNumberOrNull(selectionData.nilai_akhir),
          catatan: selectionData.catatan || "",
          keputusan: normalizeDecision(selectionData.keputusan),
        })
      } else {
        setSelection(emptySelection(id))
      }
    } catch (err) {
      console.error("ERROR DETAIL SELEKSI:", err)
      setError(err instanceof Error ? err.message : "Data seleksi gagal dimuat.")
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    void loadData()
  }, [loadData])

  function updateScore(field: ScoreField, rawValue: string) {
    if (rawValue === "") {
      setSelection((current) => ({ ...current, [field]: null }))
      return
    }

    const parsed = Number(rawValue)
    if (!Number.isFinite(parsed)) return

    const value = Math.min(100, Math.max(0, parsed))

    setSelection((current) => ({
      ...current,
      [field]: value,
      nilai_akhir: calculateFinalScore({ ...current, [field]: value }),
    }))
    setError("")
    setSuccess("")
  }

  function updateNote(value: string) {
    setSelection((current) => ({ ...current, catatan: value }))
    setError("")
  }

  async function saveSelection() {
    if (!application) return

    try {
      setSaving(true)
      setError("")
      setSuccess("")

      if (!allScoresFilled(selection)) {
        throw new Error("Semua komponen nilai harus diisi sebelum disimpan.")
      }

      const nilaiAkhir = calculateFinalScore(selection)
      if (nilaiAkhir === null) {
        throw new Error("Nilai akhir belum dapat dihitung.")
      }

      const payload = {
        ppdb_id: id,
        nilai_akademik: selection.nilai_akademik,
        nilai_alquran: selection.nilai_alquran,
        nilai_bahasa_arab: selection.nilai_bahasa_arab,
        nilai_wawancara: selection.nilai_wawancara,
        nilai_adab: selection.nilai_adab,
        nilai_akhir: nilaiAkhir,
        catatan: selection.catatan.trim() || null,
        keputusan: selection.keputusan,
        updated_at: new Date().toISOString(),
      }

      const { data, error: saveError } = await supabase
        .from("ppdb_selections")
        .upsert(payload, { onConflict: "ppdb_id" })
        .select("*")
        .single()

      if (saveError) {
        throw new Error(`Gagal menyimpan penilaian: ${saveError.message}`)
      }

      setSelection((current) => ({
        ...current,
        id: data.id,
        nilai_akhir: toNumberOrNull(data.nilai_akhir),
      }))

      setSuccess("Penilaian berhasil disimpan.")
    } catch (err) {
      console.error("ERROR SIMPAN SELEKSI:", err)
      setError(err instanceof Error ? err.message : "Penilaian gagal disimpan.")
    } finally {
      setSaving(false)
    }
  }

  async function saveDecision(decision: "DITERIMA" | "DITOLAK") {
    if (!application) return

    if (!allScoresFilled(selection)) {
      setError("Lengkapi seluruh nilai terlebih dahulu.")
      return
    }

    const nilaiAkhir = calculateFinalScore(selection)
    if (nilaiAkhir === null) {
      setError("Nilai akhir belum dapat dihitung.")
      return
    }

    const label = decision === "DITERIMA" ? "DITERIMA" : "DITOLAK"
    const confirmed = window.confirm(
      `Tetapkan ${application.nama_lengkap || "calon santri"} sebagai ${label}?`
    )

    if (!confirmed) return

    try {
      setSaving(true)
      setError("")
      setSuccess("")

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) throw new Error(`Gagal memeriksa akun: ${authError.message}`)
      if (!user) {
        router.replace("/login")
        return
      }

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle()

      if (roleError) throw new Error(`Gagal memeriksa hak akses: ${roleError.message}`)
      if (!roleData || roleData.role !== "ADMIN") {
        throw new Error("Anda tidak memiliki akses sebagai admin.")
      }

      const { data: savedSelection, error: selectionError } = await supabase
        .from("ppdb_selections")
        .upsert(
          {
            ppdb_id: id,
            nilai_akademik: selection.nilai_akademik,
            nilai_alquran: selection.nilai_alquran,
            nilai_bahasa_arab: selection.nilai_bahasa_arab,
            nilai_wawancara: selection.nilai_wawancara,
            nilai_adab: selection.nilai_adab,
            nilai_akhir: nilaiAkhir,
            catatan: selection.catatan.trim() || null,
            keputusan: decision,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "ppdb_id" }
        )
        .select("*")
        .single()

      if (selectionError) {
        throw new Error(`Gagal menyimpan keputusan: ${selectionError.message}`)
      }

      const { error: applicationError } = await supabase
        .from("ppdb_applications")
        .update({
          status: decision,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (applicationError) {
        throw new Error(
          `Hasil seleksi tersimpan, tetapi status pendaftaran gagal diperbarui: ${applicationError.message}`
        )
      }

      setSelection((current) => ({
        ...current,
        id: savedSelection.id,
        nilai_akhir: toNumberOrNull(savedSelection.nilai_akhir),
        keputusan: decision,
      }))

      setApplication((current) =>
        current ? { ...current, status: decision } : current
      )

      setSuccess(
        decision === "DITERIMA"
          ? "Calon santri berhasil ditetapkan sebagai DITERIMA."
          : "Calon santri berhasil ditetapkan sebagai DITOLAK."
      )
    } catch (err) {
      console.error("ERROR KEPUTUSAN SELEKSI:", err)
      setError(err instanceof Error ? err.message : "Keputusan gagal disimpan.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingScreen />

  if (error && !application) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-5">
        <div className="w-full max-w-lg rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl shadow-slate-200/50">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-2xl font-black text-red-600">
            !
          </div>
          <h1 className="mt-5 text-xl font-black text-slate-900">
            Data Seleksi Tidak Dapat Dimuat
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{error}</p>
          <Link
            href="/ppdb/admin/seleksi"
            className="mt-6 inline-flex cursor-pointer rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-800"
          >
            Kembali ke Seleksi
          </Link>
        </div>
      </main>
    )
  }

  if (!application) return null

  const completedCount = SCORE_FIELDS.filter(({ key }) => selection[key] !== null).length
  const progress = (completedCount / SCORE_FIELDS.length) * 100
  const isFinalized = selection.keputusan !== null

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/50 text-slate-800">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-xs font-black text-white shadow-lg shadow-blue-200">
              IN
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-700">
                INIBS SMART DIGITAL
              </p>
              <h1 className="truncate text-lg font-black text-slate-900 sm:text-xl">
                Seleksi Calon Santri
              </h1>
            </div>
          </div>

          <Link
            href="/ppdb/admin/seleksi"
            className="group inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
            <span className="hidden sm:inline">Kembali ke Seleksi</span>
            <span className="sm:hidden">Kembali</span>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-7 sm:px-8 sm:py-9">
        <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-white via-white to-blue-50/80 p-6 shadow-xl shadow-slate-200/50 sm:p-8">
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-blue-700 via-cyan-500 to-indigo-600" />
          <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-blue-100/50 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">
                  Tahap Penilaian
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                {application.nama_lengkap || "Calon Santri"}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Nomor pendaftaran{" "}
                <span className="font-black text-blue-700">
                  {application.nomor_pendaftaran || "-"}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-[330px]">
              <MiniStat label="Komponen" value={`${completedCount}/5`} />
              <MiniStat label="Nilai Akhir" value={finalScore === null ? "-" : finalScore.toFixed(2)} />
            </div>
          </div>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}

        {success && <Alert type="success" message={success} onClose={() => setSuccess("")} />}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
              <SectionHeading
                eyebrow="Data Calon Santri"
                title="Informasi Pendaftar"
                description="Periksa kembali identitas calon santri sebelum memberikan penilaian."
              />

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <Info label="Nama Lengkap" value={application.nama_lengkap} />
                <Info label="Nomor Pendaftaran" value={application.nomor_pendaftaran} highlight />
                <Info label="NIK" value={application.nik} />
                <Info label="NISN" value={application.nisn} />
                <Info label="Jenis Kelamin" value={application.jenis_kelamin} />
                <Info label="Asal Sekolah" value={application.asal_sekolah} />
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
              <SectionHeading
                eyebrow="Penilaian"
                title="Komponen Seleksi"
                description="Masukkan nilai 0 sampai 100. Nilai akhir dihitung otomatis berdasarkan bobot."
              />

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                {SCORE_FIELDS.map((item) => (
                  <ScoreInput
                    key={item.key}
                    label={item.label}
                    weight={item.weight}
                    icon={item.icon}
                    value={selection[item.key]}
                    onChange={(value) => updateScore(item.key, value)}
                  />
                ))}
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Kelengkapan Penilaian
                  </span>
                  <span className="text-xs font-black text-blue-700">
                    {completedCount} dari 5
                  </span>
                </div>
                <div className="h-1.5 bg-slate-200">
                  <div
                    className="h-full rounded-r-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">
                      Nilai Akhir
                    </p>
                    <p className="mt-1 text-xs leading-5 text-blue-700/70">
                      20% Akademik + 25% Al-Qur&apos;an + 20% Bahasa Arab + 20% Wawancara + 15% Adab
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white px-6 py-3 text-center shadow-sm ring-1 ring-blue-100">
                    <span className="text-4xl font-black tracking-tight text-blue-800">
                      {finalScore === null ? "-" : finalScore.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="catatan" className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Catatan Panitia
                </label>
                <textarea
                  id="catatan"
                  value={selection.catatan}
                  onChange={(event) => updateNote(event.target.value)}
                  rows={5}
                  placeholder="Tuliskan catatan hasil seleksi..."
                  className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-300 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <button
                type="button"
                disabled={saving || !allScoresFilled(selection)}
                onClick={() => void saveSelection()}
                className="mt-5 w-full cursor-pointer rounded-2xl bg-blue-700 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-xl active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Simpan Penilaian"}
              </button>
            </section>
          </div>

          <aside className="h-fit space-y-6 lg:sticky lg:top-28">
            <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <SectionHeading
                eyebrow="Keputusan Panitia"
                title="Hasil Seleksi"
                description="Tetapkan keputusan setelah seluruh komponen nilai terisi."
              />

              <div className="mt-6 space-y-3">
                <DecisionCard
                  active={selection.keputusan === "DITERIMA"}
                  disabled={saving || !allScoresFilled(selection)}
                  type="accepted"
                  onClick={() => void saveDecision("DITERIMA")}
                />
                <DecisionCard
                  active={selection.keputusan === "DITOLAK"}
                  disabled={saving || !allScoresFilled(selection)}
                  type="rejected"
                  onClick={() => void saveDecision("DITOLAK")}
                />
              </div>

              <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Status Pendaftaran</span>
                  <StatusBadge status={application.status} />
                </div>
              </div>

              {isFinalized && (
                <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-blue-500">
                    Keputusan Tersimpan
                  </p>
                  <p className="mt-1 text-sm font-black text-blue-800">
                    {selection.keputusan}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-blue-700/70">
                    Anda masih dapat memperbarui hasil dengan memilih keputusan lainnya.
                  </p>
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Panduan Bobot
              </p>
              <div className="mt-4 space-y-3">
                {SCORE_FIELDS.map((item) => (
                  <div key={item.key} className="flex items-center justify-between gap-4">
                    <span className="text-xs font-semibold text-slate-600">{item.label}</span>
                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500">
                      {item.weight}%
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>

        <footer className="py-8 text-center">
          <p className="text-xs font-bold text-slate-500">INIBS Smart Digital</p>
          <p className="mt-1 text-[10px] text-slate-400">Imam Nawawi Islamic Boarding School</p>
        </footer>
      </section>
    </main>
  )
}

function emptySelection(id: string): Selection {
  return {
    ppdb_id: id,
    nilai_akademik: null,
    nilai_alquran: null,
    nilai_bahasa_arab: null,
    nilai_wawancara: null,
    nilai_adab: null,
    nilai_akhir: null,
    catatan: "",
    keputusan: null,
  }
}

function calculateFinalScore(data: Partial<Selection>): number | null {
  const values = SCORE_FIELDS.map(({ key }) => data[key])

  if (values.some((value) => value === null || value === undefined)) return null

  const result =
    Number(data.nilai_akademik) * 0.2 +
    Number(data.nilai_alquran) * 0.25 +
    Number(data.nilai_bahasa_arab) * 0.2 +
    Number(data.nilai_wawancara) * 0.2 +
    Number(data.nilai_adab) * 0.15

  return Number(result.toFixed(2))
}

function allScoresFilled(data: Partial<Selection>) {
  return SCORE_FIELDS.every(({ key }) => {
    const value = data[key]
    return value !== null && value !== undefined && Number.isFinite(Number(value))
  })
}

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function normalizeDecision(value: unknown): Selection["keputusan"] {
  const normalized = String(value || "").trim().toUpperCase()
  if (normalized === "DITERIMA") return "DITERIMA"
  if (normalized === "DITOLAK") return "DITOLAK"
  return null
}

function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/50 px-5">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />
        <p className="mt-5 text-sm font-black text-slate-600">Memuat data seleksi...</p>
        <p className="mt-1 text-xs text-slate-400">Mohon tunggu sebentar</p>
      </div>
    </main>
  )
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-700">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-lg font-black text-slate-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  )
}

function Info({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string | null | undefined
  highlight?: boolean
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition-all duration-200 hover:border-blue-100 hover:bg-blue-50/40">
      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-1.5 break-words text-sm font-bold ${highlight ? "text-blue-700" : "text-slate-700"}`}>
        {value || "-"}
      </p>
    </div>
  )
}

function ScoreInput({
  label,
  weight,
  icon,
  value,
  onChange,
}: {
  label: string
  weight: number
  icon: string
  value: number | null
  onChange: (value: string) => void
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-black text-blue-700 transition-transform duration-300 group-focus-within:scale-105">
            {icon}
          </div>
          <div className="min-w-0">
            <label className="block truncate text-sm font-black text-slate-700">{label}</label>
            <span className="text-[10px] text-slate-400">Skala 0 - 100</span>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black text-slate-500">
          {weight}%
        </span>
      </div>

      <div className="relative">
        <input
          type="number"
          min="0"
          max="100"
          step="0.01"
          inputMode="decimal"
          value={value === null ? "" : value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="0 - 100"
          className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-16 text-lg font-black text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-300 hover:border-slate-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-wider text-slate-300">
          Nilai
        </span>
      </div>
    </div>
  )
}

function DecisionCard({
  type,
  active,
  disabled,
  onClick,
}: {
  type: "accepted" | "rejected"
  active: boolean
  disabled: boolean
  onClick: () => void
}) {
  const accepted = type === "accepted"

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "group w-full cursor-pointer rounded-2xl border p-4 text-left transition-all duration-300 active:scale-[0.99]",
        disabled ? "cursor-not-allowed opacity-50" : "hover:-translate-y-0.5",
        accepted
          ? active
            ? "border-emerald-300 bg-emerald-50 shadow-lg shadow-emerald-100"
            : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/50"
          : active
            ? "border-red-300 bg-red-50 shadow-lg shadow-red-100"
            : "border-slate-200 bg-white hover:border-red-200 hover:bg-red-50/50",
      ].join(" ")}
    >
      <div className="flex items-center gap-4">
        <div
          className={[
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-black transition-transform duration-300 group-hover:scale-105",
            accepted ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700",
          ].join(" ")}
        >
          {accepted ? "✓" : "×"}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-black ${accepted ? "text-emerald-800" : "text-red-800"}`}>
            {accepted ? "DITERIMA" : "DITOLAK"}
          </p>
          <p className="mt-0.5 text-[11px] leading-5 text-slate-400">
            {accepted ? "Tetapkan calon santri sebagai peserta yang diterima." : "Tetapkan calon santri sebagai peserta yang ditolak."}
          </p>
        </div>
        {active && (
          <span className={`rounded-full px-2.5 py-1 text-[9px] font-black ${accepted ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
            AKTIF
          </span>
        )}
      </div>
    </button>
  )
}

function StatusBadge({ status }: { status: string | null }) {
  const normalized = String(status || "").toUpperCase()
  const accepted = normalized === "DITERIMA"
  const rejected = normalized === "DITOLAK"

  return (
    <span
      className={[
        "rounded-full px-2.5 py-1 text-[9px] font-black",
        accepted
          ? "bg-emerald-50 text-emerald-700"
          : rejected
            ? "bg-red-50 text-red-700"
            : "bg-amber-50 text-amber-700",
      ].join(" ")}
    >
      {normalized || "VERIFIKASI"}
    </span>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 shadow-sm">
      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-black text-slate-900">{value}</p>
    </div>
  )
}

function Alert({
  type,
  message,
  onClose,
}: {
  type: "error" | "success"
  message: string
  onClose: () => void
}) {
  const success = type === "success"

  return (
    <div
      className={[
        "mt-5 flex items-start gap-3 rounded-2xl border px-4 py-4 shadow-sm",
        success ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black text-white",
          success ? "bg-emerald-600" : "bg-red-600",
        ].join(" ")}
      >
        {success ? "✓" : "!"}
      </div>
      <p className={`flex-1 text-sm font-semibold leading-6 ${success ? "text-emerald-700" : "text-red-700"}`}>
        {message}
      </p>
      <button
        type="button"
        onClick={onClose}
        className="cursor-pointer rounded-lg px-2 py-1 text-xs font-black text-slate-400 transition hover:bg-white hover:text-slate-700"
        aria-label="Tutup pesan"
      >
        ×
      </button>
    </div>
  )
}
