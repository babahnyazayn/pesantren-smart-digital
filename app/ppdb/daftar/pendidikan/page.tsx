"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { createBrowserClient } from "@supabase/ssr"

export default function PendidikanPage() {
  const [formData, setFormData] = useState({
    namaSekolah: "",
    jenjang: "",
    tahunLulus: "",
    npsn: "",
    nomorIjazah: "",
    alamatSekolah: "",
  })

  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  // =========================================================
  // LOAD DATA YANG SUDAH TERSIMPAN
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

        // Cari pendaftaran milik user yang sedang login
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
            `Gagal mengambil data pendaftaran: ${ppdbError.message}`
          )
        }

        if (!ppdb) {
          throw new Error(
            "Data pendaftaran belum ditemukan. Silakan selesaikan Tahap 1 terlebih dahulu."
          )
        }

        // Ambil data pendidikan jika sebelumnya sudah pernah disimpan
        const {
          data: education,
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

        if (education) {
          setFormData({
            namaSekolah: education.nama_sekolah || "",
            jenjang: education.jenjang || "",
            tahunLulus: education.tahun_lulus || "",
            npsn: education.npsn || "",
            nomorIjazah: education.nomor_ijazah || "",
            alamatSekolah: education.alamat_sekolah || "",
          })
        }
      } catch (err: any) {
        console.error("ERROR LOAD PENDIDIKAN:", err)

        setError(
          err?.message ||
            "Data pendidikan gagal dimuat."
        )
      } finally {
        setChecking(false)
      }
    }

    loadData()
  }, [supabase])

  // =========================================================
  // HANDLE CHANGE
  // =========================================================

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    setError("")
    setSuccess("")
  }

  // =========================================================
  // HANDLE SUBMIT
  // =========================================================

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault()

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // -----------------------------------------------------
      // CEK USER
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
        window.location.href = "/login"
        return
      }

      // -----------------------------------------------------
      // CARI DATA PPDB
      // -----------------------------------------------------

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
          `Gagal mengambil data pendaftaran: ${ppdbError.message}`
        )
      }

      if (!ppdb) {
        throw new Error(
          "Data pendaftaran calon santri belum ditemukan."
        )
      }

      // -----------------------------------------------------
      // VALIDASI
      // -----------------------------------------------------

      if (!formData.namaSekolah.trim()) {
        throw new Error(
          "Nama sekolah asal wajib diisi."
        )
      }

      if (!formData.jenjang) {
        throw new Error(
          "Jenjang pendidikan wajib dipilih."
        )
      }

      if (!formData.tahunLulus) {
        throw new Error(
          "Tahun lulus wajib dipilih."
        )
      }

      if (!/^\d{4}$/.test(formData.tahunLulus)) {
        throw new Error(
          "Tahun lulus harus terdiri dari 4 digit."
        )
      }

      if (formData.npsn.trim()) {
        if (!/^\d+$/.test(formData.npsn.trim())) {
          throw new Error(
            "NPSN hanya boleh berisi angka."
          )
        }
      }

      // -----------------------------------------------------
      // DATA UNTUK SUPABASE
      // -----------------------------------------------------

      const educationData = {
        ppdb_id: ppdb.id,

        nama_sekolah:
          formData.namaSekolah.trim(),

        jenjang:
          formData.jenjang,

        tahun_lulus:
          formData.tahunLulus,

        npsn:
          formData.npsn.trim() || null,

        nomor_ijazah:
          formData.nomorIjazah.trim() || null,

        alamat_sekolah:
          formData.alamatSekolah.trim() || null,

        updated_at:
          new Date().toISOString(),
      }

      // -----------------------------------------------------
      // CEK APAKAH SUDAH ADA
      // -----------------------------------------------------

      const {
        data: existingEducation,
        error: existingError,
      } = await supabase
        .from("ppdb_education")
        .select("id")
        .eq("ppdb_id", ppdb.id)
        .maybeSingle()

      if (existingError) {
        throw new Error(
          `Gagal memeriksa data pendidikan: ${existingError.message}`
        )
      }

      // -----------------------------------------------------
      // UPDATE
      // -----------------------------------------------------

      if (existingEducation) {
        const {
          error: updateError,
        } = await supabase
          .from("ppdb_education")
          .update(educationData)
          .eq("id", existingEducation.id)

        if (updateError) {
          throw new Error(
            `Data pendidikan gagal diperbarui: ${updateError.message}`
          )
        }
      }

      // -----------------------------------------------------
      // INSERT
      // -----------------------------------------------------

      else {
        const {
          error: insertError,
        } = await supabase
          .from("ppdb_education")
          .insert(educationData)

        if (insertError) {
          throw new Error(
            `Data pendidikan gagal disimpan: ${insertError.message}`
          )
        }
      }

      // -----------------------------------------------------
      // BERHASIL
      // -----------------------------------------------------

      setSuccess(
        "Data pendidikan berhasil disimpan."
      )

      setTimeout(() => {
        window.location.href =
          "/ppdb/daftar/berkas"
      }, 1000)

    } catch (err: any) {
      console.error(
        "ERROR SIMPAN PENDIDIKAN:",
        err
      )

      setError(
        err?.message ||
          "Data pendidikan gagal disimpan."
      )
    } finally {
      setLoading(false)
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
            Menyiapkan formulir...
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
        <div className="absolute left-[10%] top-[38%] h-20 w-20 rounded-full border border-white/60 bg-white/20 backdrop-blur-sm edu-pulse" />
        <div className="absolute right-[10%] top-[64%] h-14 w-14 rounded-full border border-blue-200/45 bg-blue-100/20 backdrop-blur-sm edu-pulse [animation-delay:1s]" />
      </div>


      {/* HEADER */}

      <header className="relative z-10 border-b border-white/60 bg-white/82 backdrop-blur-2xl shadow-[0_12px_38px_rgba(7,26,54,0.05)]">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">

          <Link
            href="/ppdb/daftar/orangtua"
            className="group flex items-center gap-3 rounded-2xl px-2 py-1.5 transition-all duration-300 hover:bg-white"
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-white p-1.5 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md">

              <Image
                src="/logo-imam.png"
                alt="Logo Imam Nawawi Islamic Boarding School"
                width={40}
                height={40}
                className="h-full w-full object-contain"
                priority
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

            <p className="mt-1 text-[11px] text-slate-400">
              Pendaftaran Santri Baru
            </p>

          </div>

        </div>

      </header>

      {/* PROGRESS */}

      <section className="relative z-10 border-b border-white/70 bg-white/78 backdrop-blur-xl shadow-sm">

        <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8">

          <div className="flex items-center">

            {/* STEP 1 */}

            <div className="flex items-center">

              <div className="edu-step-done flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#174f91] to-[#2675bd] text-white shadow-[0_8px_24px_rgba(23,79,145,0.22)]">

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

              <div className="ml-3 hidden sm:block">

                <p className="text-xs text-slate-400">
                  Tahap 1
                </p>

                <p className="text-sm font-black tracking-[0.06em] text-white">
                  Data Santri
                </p>

              </div>

            </div>

            <div className="mx-3 h-px flex-1 bg-blue-200 sm:mx-6" />

            {/* STEP 2 */}

            <div className="flex items-center">

              <div className="edu-step-done flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#174f91] to-[#2675bd] text-white shadow-[0_8px_24px_rgba(23,79,145,0.22)]">

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

              <div className="ml-3 hidden sm:block">

                <p className="text-xs text-slate-400">
                  Tahap 2
                </p>

                <p className="text-sm font-semibold text-slate-700">
                  Orang Tua/Wali
                </p>

              </div>

            </div>

            <div className="mx-3 h-px flex-1 bg-blue-200 sm:mx-6" />

            {/* STEP 3 */}

            <div className="flex items-center">

              <div className="edu-step-active flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#174f91] to-[#2675bd] text-sm font-black text-white shadow-[0_10px_28px_rgba(23,79,145,0.25)]">
                3
              </div>

              <div className="ml-3 hidden sm:block">

                <p className="text-xs text-blue-700">
                  Tahap 3
                </p>

                <p className="text-sm font-semibold text-slate-800">
                  Pendidikan
                </p>

              </div>

            </div>

            <div className="mx-3 h-px flex-1 bg-slate-200 sm:mx-6" />

            {/* STEP 4 */}

            <div className="flex items-center">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f8fc] text-sm font-black text-slate-400 ring-1 ring-slate-200">
                4
              </div>

              <div className="ml-3 hidden sm:block">

                <p className="text-xs text-slate-400">
                  Tahap 4
                </p>

                <p className="text-sm font-semibold text-slate-400">
                  Berkas
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* CONTENT */}

      <section className="relative z-10 mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">

        {/* TITLE */}

        <div className="mb-8 edu-reveal">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3.5 py-1.5 shadow-sm backdrop-blur-md">

            <span className="h-1.5 w-1.5 rounded-full bg-[#2675bd] edu-pulse" />

            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#245ea8]">
              Tahap 3 dari 6
            </span>

          </div>

          <h1 className="text-3xl font-black tracking-tight text-[#071a36] sm:text-4xl">
            Data Pendidikan
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#697787] sm:text-base">
            Lengkapi informasi pendidikan terakhir calon
            santri sesuai dengan data sekolah asal.
          </p>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* SEKOLAH ASAL */}

          <div className="edu-card-shine rounded-[1.95rem] border border-white/90 bg-white/94 p-6 shadow-[0_20px_60px_rgba(7,26,54,0.07)] backdrop-blur-xl sm:p-8">

            <div className="mb-7">

              <h2 className="text-lg font-black tracking-tight text-[#071a36]">
                Sekolah Asal
              </h2>

              <p className="mt-1 text-[10px] font-medium text-[#7b8a9b]">
                Informasi pendidikan terakhir calon santri
              </p>

            </div>

            <div className="grid gap-5 sm:grid-cols-2">

              {/* NAMA SEKOLAH */}

              <div className="sm:col-span-2">

                <label className="mb-2 block text-[13px] font-black tracking-tight text-[#34465a]">
                  Nama Sekolah Asal
                </label>

                <input
                  type="text"
                  name="namaSekolah"
                  value={formData.namaSekolah}
                  onChange={handleChange}
                  placeholder="Contoh: SMP Muhammadiyah 1 Banyuwangi"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-[#f8fbfe] px-4 py-3.5 text-sm outline-none transition-all duration-300 hover:border-blue-200 hover:bg-white focus:border-[#2675bd] focus:bg-white focus:ring-4 focus:ring-blue-100/80"
                />

              </div>

              {/* JENJANG */}

              <div>

                <label className="mb-2 block text-[13px] font-black tracking-tight text-[#34465a]">
                  Jenjang Pendidikan
                </label>

                <select
                  name="jenjang"
                  value={formData.jenjang}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-[#f8fbfe] px-4 py-3.5 text-sm outline-none transition-all duration-300 hover:border-blue-200 hover:bg-white focus:border-[#2675bd] focus:bg-white focus:ring-4 focus:ring-blue-100/80"
                >

                  <option value="">
                    Pilih jenjang
                  </option>

                  <option value="SD">
                    SD / MI
                  </option>

                  <option value="SMP">
                    SMP / MTs
                  </option>

                  <option value="SMA">
                    SMA / MA
                  </option>

                  <option value="SMK">
                    SMK
                  </option>

                  <option value="Paket A">
                    Paket A
                  </option>

                  <option value="Paket B">
                    Paket B
                  </option>

                  <option value="Paket C">
                    Paket C
                  </option>

                  <option value="Lainnya">
                    Lainnya
                  </option>

                </select>

              </div>

              {/* TAHUN LULUS */}

              <div>

                <label className="mb-2 block text-[13px] font-black tracking-tight text-[#34465a]">
                  Tahun Lulus
                </label>

                <select
                  name="tahunLulus"
                  value={formData.tahunLulus}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-[#f8fbfe] px-4 py-3.5 text-sm outline-none transition-all duration-300 hover:border-blue-200 hover:bg-white focus:border-[#2675bd] focus:bg-white focus:ring-4 focus:ring-blue-100/80"
                >

                  <option value="">
                    Pilih tahun
                  </option>

                  <option value="2025">
                    2025
                  </option>

                  <option value="2026">
                    2026
                  </option>

                  <option value="2027">
                    2027
                  </option>

                  <option value="2028">
                    2028
                  </option>

                </select>

              </div>

              {/* NPSN */}

              <div>

                <label className="mb-2 block text-[13px] font-black tracking-tight text-[#34465a]">
                  NPSN Sekolah
                </label>

                <input
                  type="text"
                  name="npsn"
                  value={formData.npsn}
                  onChange={handleChange}
                  placeholder="Masukkan NPSN"
                  inputMode="numeric"
                  maxLength={8}
                  className="w-full rounded-2xl border border-slate-200 bg-[#f8fbfe] px-4 py-3.5 text-sm outline-none transition-all duration-300 hover:border-blue-200 hover:bg-white focus:border-[#2675bd] focus:bg-white focus:ring-4 focus:ring-blue-100/80"
                />

              </div>

              {/* NOMOR IJAZAH */}

              <div>

                <label className="mb-2 block text-[13px] font-black tracking-tight text-[#34465a]">
                  Nomor Ijazah / STTB
                </label>

                <input
                  type="text"
                  name="nomorIjazah"
                  value={formData.nomorIjazah}
                  onChange={handleChange}
                  placeholder="Nomor ijazah atau STTB"
                  className="w-full rounded-2xl border border-slate-200 bg-[#f8fbfe] px-4 py-3.5 text-sm outline-none transition-all duration-300 hover:border-blue-200 hover:bg-white focus:border-[#2675bd] focus:bg-white focus:ring-4 focus:ring-blue-100/80"
                />

              </div>

              {/* ALAMAT */}

              <div className="sm:col-span-2">

                <label className="mb-2 block text-[13px] font-black tracking-tight text-[#34465a]">
                  Alamat Sekolah
                </label>

                <textarea
                  name="alamatSekolah"
                  value={formData.alamatSekolah}
                  onChange={handleChange}
                  placeholder="Masukkan alamat lengkap sekolah asal"
                  rows={4}
                  required
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-[#f8fbfe] px-4 py-3.5 text-sm outline-none transition-all duration-300 hover:border-blue-200 hover:bg-white focus:border-[#2675bd] focus:bg-white focus:ring-4 focus:ring-blue-100/80"
                />

              </div>

            </div>

          </div>

          {/* INFORMASI */}

          <div className="edu-note rounded-[1.45rem] border border-blue-100 bg-[#f7fbff] px-5 py-4 shadow-sm">

            <p className="text-sm font-black text-[#245ea8]">
              Perhatian
            </p>

            <p className="mt-1 text-xs leading-5 text-[#607a95]">
              Pastikan data pendidikan sesuai dengan
              dokumen resmi yang dimiliki calon santri.
              Data akan digunakan dalam proses verifikasi
              PPDB.
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div className="rounded-[1.35rem] border border-red-100 bg-red-50/90 px-5 py-4 shadow-sm animate-soft-slide">

              <p className="text-sm font-semibold text-red-700">
                Data belum dapat disimpan
              </p>

              <p className="mt-1 text-xs leading-5 text-red-600">
                {error}
              </p>

            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="rounded-[1.35rem] border border-emerald-100 bg-emerald-50/90 px-5 py-4 shadow-sm animate-soft-slide">

              <p className="text-sm font-semibold text-emerald-700">
                Berhasil
              </p>

              <p className="mt-1 text-xs leading-5 text-emerald-600">
                {success}
              </p>

            </div>
          )}

          {/* BUTTON */}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">

            <Link
              href="/ppdb/daftar/orangtua"
              className="group inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-100 hover:bg-[#f8fbfe] hover:shadow-md"
            >
              Kembali
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="group inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#0d3b72] via-[#174f91] to-[#2675bd] px-7 py-3.5 text-sm font-black text-white shadow-[0_14px_34px_rgba(23,79,145,0.24)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(23,79,145,0.30)] disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading
                ? "Menyimpan..."
                : "Simpan & Lanjutkan"}

              {!loading && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="ml-2 h-4 w-4"
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
              )}

            </button>

          </div>

        </form>

      </section>

      {/* FOOTER */}

      <footer className="relative z-10 border-t border-white/10 bg-[#071a36] text-white">

        <div className="mx-auto max-w-6xl px-5 py-7 text-center sm:px-8">

          <p className="text-sm font-semibold text-slate-700">
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