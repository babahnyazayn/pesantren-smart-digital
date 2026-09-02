"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { createBrowserClient } from "@supabase/ssr"

export default function OrangTuaPage() {
  const [formData, setFormData] = useState({
    namaAyah: "",
    nikAyah: "",
    pekerjaanAyah: "",
    pendidikanAyah: "",
    noHpAyah: "",

    namaIbu: "",
    nikIbu: "",
    pekerjaanIbu: "",
    pendidikanIbu: "",
    noHpIbu: "",

    namaWali: "",
    hubunganWali: "",
    pekerjaanWali: "",
    noHpWali: "",
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

        // Cari data PPDB milik user yang sedang login
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
          setError(
            "Data pendaftaran calon santri belum ditemukan. Silakan selesaikan Tahap 1 terlebih dahulu."
          )

          return
        }

        // Cari data orang tua berdasarkan ppdb_id
        const {
          data: parent,
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

        // Jika sudah pernah disimpan, tampilkan kembali
        if (parent) {
          setFormData({
            namaAyah: parent.nama_ayah || "",
            nikAyah: parent.nik_ayah || "",
            pekerjaanAyah: parent.pekerjaan_ayah || "",
            pendidikanAyah: parent.pendidikan_ayah || "",
            noHpAyah: parent.nomor_whatsapp || "",

            namaIbu: parent.nama_ibu || "",
            nikIbu: parent.nik_ibu || "",
            pekerjaanIbu: parent.pekerjaan_ibu || "",
            pendidikanIbu: parent.pendidikan_ibu || "",
            noHpIbu: "",

            namaWali: parent.nama_wali || "",
            hubunganWali: parent.hubungan_wali || "",
            pekerjaanWali: parent.pekerjaan_wali || "",
            noHpWali: "",
          })
        }
      } catch (err: any) {
        console.error("ERROR LOAD DATA:", err)

        const message =
          err?.message ||
          err?.details ||
          err?.hint ||
          "Terjadi kesalahan saat memuat data."

        setError(message)
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
      HTMLInputElement | HTMLSelectElement
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
          "Data pendaftaran calon santri belum ditemukan. Silakan isi Tahap 1 terlebih dahulu."
        )
      }

      // -----------------------------------------------------
      // VALIDASI AYAH
      // -----------------------------------------------------

      if (!formData.namaAyah.trim()) {
        throw new Error(
          "Nama lengkap ayah wajib diisi."
        )
      }

      if (!formData.nikAyah.trim()) {
        throw new Error(
          "NIK ayah wajib diisi."
        )
      }

      if (!/^\d{16}$/.test(formData.nikAyah.trim())) {
        throw new Error(
          "NIK ayah harus terdiri dari 16 digit angka."
        )
      }

      if (!formData.pekerjaanAyah.trim()) {
        throw new Error(
          "Pekerjaan ayah wajib diisi."
        )
      }

      if (!formData.pendidikanAyah) {
        throw new Error(
          "Pendidikan terakhir ayah wajib dipilih."
        )
      }

      if (!formData.noHpAyah.trim()) {
        throw new Error(
          "Nomor WhatsApp ayah wajib diisi."
        )
      }

      // -----------------------------------------------------
      // VALIDASI IBU
      // -----------------------------------------------------

      if (!formData.namaIbu.trim()) {
        throw new Error(
          "Nama lengkap ibu wajib diisi."
        )
      }

      if (!formData.nikIbu.trim()) {
        throw new Error(
          "NIK ibu wajib diisi."
        )
      }

      if (!/^\d{16}$/.test(formData.nikIbu.trim())) {
        throw new Error(
          "NIK ibu harus terdiri dari 16 digit angka."
        )
      }

      if (!formData.pekerjaanIbu.trim()) {
        throw new Error(
          "Pekerjaan ibu wajib diisi."
        )
      }

      if (!formData.pendidikanIbu) {
        throw new Error(
          "Pendidikan terakhir ibu wajib dipilih."
        )
      }

      // -----------------------------------------------------
      // DATA YANG AKAN DISIMPAN
      // -----------------------------------------------------

      const parentData = {
        ppdb_id: ppdb.id,

        nama_ayah: formData.namaAyah.trim(),
        nik_ayah: formData.nikAyah.trim(),
        pekerjaan_ayah:
          formData.pekerjaanAyah.trim(),
        pendidikan_ayah:
          formData.pendidikanAyah,

        nama_ibu: formData.namaIbu.trim(),
        nik_ibu: formData.nikIbu.trim(),
        pekerjaan_ibu:
          formData.pekerjaanIbu.trim(),
        pendidikan_ibu:
          formData.pendidikanIbu,

        nama_wali:
          formData.namaWali.trim() || null,

        nik_wali: null,

        hubungan_wali:
          formData.hubunganWali || null,

        pekerjaan_wali:
          formData.pekerjaanWali.trim() || null,

        nomor_whatsapp:
          formData.noHpAyah.trim(),

        email:
          user.email || null,

        alamat: null,

        updated_at:
          new Date().toISOString(),
      }

      // -----------------------------------------------------
      // CEK DATA ORANG TUA SUDAH ADA ATAU BELUM
      // -----------------------------------------------------

      const {
        data: existingParent,
        error: existingError,
      } = await supabase
        .from("ppdb_parents")
        .select("id")
        .eq("ppdb_id", ppdb.id)
        .maybeSingle()

      if (existingError) {
        throw new Error(
          `Gagal memeriksa data orang tua: ${existingError.message}`
        )
      }

      // -----------------------------------------------------
      // UPDATE JIKA SUDAH ADA
      // -----------------------------------------------------

      if (existingParent) {
        const {
          error: updateError,
        } = await supabase
          .from("ppdb_parents")
          .update(parentData)
          .eq("id", existingParent.id)

        if (updateError) {
          throw new Error(
            `Data orang tua gagal diperbarui: ${updateError.message}`
          )
        }
      }

      // -----------------------------------------------------
      // INSERT JIKA BELUM ADA
      // -----------------------------------------------------

      else {
        const {
          error: insertError,
        } = await supabase
          .from("ppdb_parents")
          .insert(parentData)

        if (insertError) {
          throw new Error(
            `Data orang tua gagal disimpan: ${insertError.message}`
          )
        }
      }

      // -----------------------------------------------------
      // BERHASIL
      // -----------------------------------------------------

      setSuccess(
        "Data orang tua/wali berhasil disimpan. Mengarahkan ke tahap berikutnya..."
      )

      setTimeout(() => {
        window.location.href =
          "/ppdb/daftar/pendidikan"
      }, 1000)

    } catch (err: any) {
      console.error(
        "ERROR SIMPAN DATA:",
        err
      )

      const message =
        err?.message ||
        err?.details ||
        err?.hint ||
        "Data orang tua/wali gagal disimpan."

      setError(message)

    } finally {
      setLoading(false)
    }
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8fafc]">

        <div className="text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">

            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-800" />

          </div>

          <p className="mt-4 text-sm text-slate-500">
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
    <main className="min-h-screen bg-[#f7f9fc] text-slate-800">

      {/* HEADER */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">

          <Link
            href="/ppdb/daftar"
            className="group flex items-center gap-3"
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white p-1.5 ring-1 ring-slate-200 transition group-hover:ring-blue-200">

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

              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-800">
                INIBS
              </p>

              <p className="text-sm font-semibold tracking-tight text-slate-800">
                Imam Nawawi Islamic Boarding School
              </p>

            </div>

          </Link>

          <div className="text-right">

            <p className="text-xs font-semibold text-slate-700">
              PPDB 2027/2028
            </p>

            <p className="mt-0.5 text-[11px] text-slate-400">
              Pendaftaran Santri Baru
            </p>

          </div>

        </div>

      </header>

      {/* PROGRESS */}

      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8">

          <div className="flex items-center">

            {/* TAHAP 1 */}

            <div className="flex items-center">

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-800 text-white">

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

              <div className="ml-2.5 hidden sm:block">

                <p className="text-[10px] text-slate-400">
                  Tahap 1
                </p>

                <p className="text-xs font-semibold text-slate-700">
                  Data Santri
                </p>

              </div>

            </div>

            <div className="mx-3 h-px flex-1 bg-blue-200 sm:mx-5" />

            {/* TAHAP 2 */}

            <div className="flex items-center">

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-800 text-xs font-bold text-white shadow-sm shadow-blue-800/20">
                2
              </div>

              <div className="ml-2.5 hidden sm:block">

                <p className="text-[10px] font-medium text-blue-700">
                  Tahap 2
                </p>

                <p className="text-xs font-semibold text-slate-800">
                  Orang Tua/Wali
                </p>

              </div>

            </div>

            <div className="mx-3 h-px flex-1 bg-slate-200 sm:mx-5" />

            {/* TAHAP 3 */}

            <div className="flex items-center">

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-400">
                3
              </div>

              <div className="ml-2.5 hidden sm:block">

                <p className="text-[10px] text-slate-400">
                  Tahap 3
                </p>

                <p className="text-xs font-semibold text-slate-400">
                  Pendidikan
                </p>

              </div>

            </div>

            <div className="mx-3 h-px flex-1 bg-slate-200 sm:mx-5" />

            {/* TAHAP 4 */}

            <div className="flex items-center">

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-400">
                4
              </div>

              <div className="ml-2.5 hidden sm:block">

                <p className="text-[10px] text-slate-400">
                  Tahap 4
                </p>

                <p className="text-xs font-semibold text-slate-400">
                  Berkas
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* MAIN */}

      <section className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">

        <div>

          {/* TITLE */}

          <div className="mb-8">

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5">

              <span className="h-1.5 w-1.5 rounded-full bg-blue-800" />

              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-800">
                Tahap 2 dari 6
              </span>

            </div>

            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Data Orang Tua/Wali
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Lengkapi data orang tua atau wali calon
              santri sesuai dengan dokumen resmi.
            </p>

          </div>

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* DATA AYAH */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_6px_25px_rgba(15,23,42,0.035)] sm:p-7">

              <div className="mb-6 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-800">

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="h-5 w-5"
                  >

                    <circle
                      cx="12"
                      cy="8"
                      r="3"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 20a7 7 0 0 1 14 0"
                    />

                  </svg>

                </div>

                <div>

                  <h3 className="text-base font-bold text-slate-800">
                    Data Ayah
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Informasi ayah kandung calon santri
                  </p>

                </div>

              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                <div className="sm:col-span-2">

                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Nama Lengkap Ayah
                  </label>

                  <input
                    type="text"
                    name="namaAyah"
                    value={formData.namaAyah}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap ayah"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    NIK Ayah
                  </label>

                  <input
                    type="text"
                    name="nikAyah"
                    value={formData.nikAyah}
                    onChange={handleChange}
                    placeholder="16 digit NIK"
                    maxLength={16}
                    inputMode="numeric"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Pekerjaan Ayah
                  </label>

                  <input
                    type="text"
                    name="pekerjaanAyah"
                    value={formData.pekerjaanAyah}
                    onChange={handleChange}
                    placeholder="Contoh: Wiraswasta"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Pendidikan Terakhir
                  </label>

                  <select
                    name="pendidikanAyah"
                    value={formData.pendidikanAyah}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  >

                    <option value="">
                      Pilih pendidikan
                    </option>

                    <option value="SD">
                      SD / Sederajat
                    </option>

                    <option value="SMP">
                      SMP / Sederajat
                    </option>

                    <option value="SMA">
                      SMA / Sederajat
                    </option>

                    <option value="D3">
                      D3
                    </option>

                    <option value="S1">
                      S1
                    </option>

                    <option value="S2">
                      S2
                    </option>

                    <option value="S3">
                      S3
                    </option>

                  </select>

                </div>

                <div>

                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Nomor WhatsApp Ayah
                  </label>

                  <input
                    type="tel"
                    name="noHpAyah"
                    value={formData.noHpAyah}
                    onChange={handleChange}
                    placeholder="08xxxxxxxxxx"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />

                </div>

              </div>

            </div>

            {/* DATA IBU */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_6px_25px_rgba(15,23,42,0.035)] sm:p-7">

              <div className="mb-6 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-800">

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="h-5 w-5"
                  >

                    <circle
                      cx="12"
                      cy="8"
                      r="3"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 20a7 7 0 0 1 14 0"
                    />

                  </svg>

                </div>

                <div>

                  <h3 className="text-base font-bold text-slate-800">
                    Data Ibu
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Informasi ibu kandung calon santri
                  </p>

                </div>

              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                <div className="sm:col-span-2">

                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Nama Lengkap Ibu
                  </label>

                  <input
                    type="text"
                    name="namaIbu"
                    value={formData.namaIbu}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap ibu"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    NIK Ibu
                  </label>

                  <input
                    type="text"
                    name="nikIbu"
                    value={formData.nikIbu}
                    onChange={handleChange}
                    placeholder="16 digit NIK"
                    maxLength={16}
                    inputMode="numeric"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Pekerjaan Ibu
                  </label>

                  <input
                    type="text"
                    name="pekerjaanIbu"
                    value={formData.pekerjaanIbu}
                    onChange={handleChange}
                    placeholder="Contoh: Ibu Rumah Tangga"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Pendidikan Terakhir
                  </label>

                  <select
                    name="pendidikanIbu"
                    value={formData.pendidikanIbu}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  >

                    <option value="">
                      Pilih pendidikan
                    </option>

                    <option value="SD">
                      SD / Sederajat
                    </option>

                    <option value="SMP">
                      SMP / Sederajat
                    </option>

                    <option value="SMA">
                      SMA / Sederajat
                    </option>

                    <option value="D3">
                      D3
                    </option>

                    <option value="S1">
                      S1
                    </option>

                    <option value="S2">
                      S2
                    </option>

                    <option value="S3">
                      S3
                    </option>

                  </select>

                </div>

                <div>

                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Nomor WhatsApp Ibu
                  </label>

                  <input
                    type="tel"
                    name="noHpIbu"
                    value={formData.noHpIbu}
                    onChange={handleChange}
                    placeholder="08xxxxxxxxxx"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />

                </div>

              </div>

            </div>

            {/* DATA WALI */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_6px_25px_rgba(15,23,42,0.035)] sm:p-7">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="h-5 w-5"
                  >

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3 4 7v5c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V7l-8-4Z"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m9 12 2 2 4-4"
                    />

                  </svg>

                </div>

                <div>

                  <h3 className="text-base font-bold text-slate-800">
                    Data Wali
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Opsional
                  </p>

                </div>

              </div>

              <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-xs leading-5 text-blue-800">

                Isi bagian ini apabila wali calon santri
                berbeda dengan ayah atau ibu.

              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                <div className="sm:col-span-2">

                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Nama Lengkap Wali
                  </label>

                  <input
                    type="text"
                    name="namaWali"
                    value={formData.namaWali}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap wali"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Hubungan dengan Santri
                  </label>

                  <select
                    name="hubunganWali"
                    value={formData.hubunganWali}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  >

                    <option value="">
                      Pilih hubungan
                    </option>

                    <option value="Kakek">
                      Kakek
                    </option>

                    <option value="Nenek">
                      Nenek
                    </option>

                    <option value="Paman">
                      Paman
                    </option>

                    <option value="Bibi">
                      Bibi
                    </option>

                    <option value="Kakak">
                      Kakak
                    </option>

                    <option value="Lainnya">
                      Lainnya
                    </option>

                  </select>

                </div>

                <div>

                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Pekerjaan Wali
                  </label>

                  <input
                    type="text"
                    name="pekerjaanWali"
                    value={formData.pekerjaanWali}
                    onChange={handleChange}
                    placeholder="Contoh: Wiraswasta"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Nomor WhatsApp Wali
                  </label>

                  <input
                    type="tel"
                    name="noHpWali"
                    value={formData.noHpWali}
                    onChange={handleChange}
                    placeholder="08xxxxxxxxxx"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />

                </div>

              </div>

            </div>

            {/* ERROR */}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm leading-6 text-red-700">

                <p className="font-semibold">
                  Terjadi kesalahan
                </p>

                <p className="mt-1">
                  {error}
                </p>

              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-700">

                <p className="font-semibold">
                  Berhasil
                </p>

                <p className="mt-1">
                  {success}
                </p>

              </div>
            )}

            {/* BUTTON */}

            <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-between">

              <Link
                href="/ppdb/daftar"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Kembali
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="group inline-flex items-center justify-center rounded-xl bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-blue-800/20 disabled:cursor-not-allowed disabled:opacity-60"
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
                    className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
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

        </div>

      </section>

      {/* FOOTER */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-6xl px-5 py-6 text-center sm:px-8">

          <div className="flex items-center justify-center gap-2">

            <Image
              src="/logo-imam.png"
              alt="Logo Imam Nawawi"
              width={25}
              height={25}
              className="object-contain"
            />

            <span className="text-xs font-semibold text-slate-600">
              INIBS Smart Digital
            </span>

          </div>

          <p className="mt-2 text-[11px] text-slate-400">
            Imam Nawawi Islamic Boarding School
          </p>

          <p className="mt-1 text-[10px] text-slate-400">
            © 2026 Imam Nawawi Islamic Boarding School
          </p>

        </div>

      </footer>

    </main>
  )
}