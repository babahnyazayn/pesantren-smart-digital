"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
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

  /*
   * =========================================================
   * CEK LOGIN DAN AMBIL DATA YANG SUDAH TERSIMPAN
   * =========================================================
   */

  useEffect(() => {
    async function loadData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          window.location.href = "/login"
          return
        }

        const { data: ppdb, error: ppdbError } = await supabase
          .from("ppdb_applications")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle()

        if (ppdbError) {
          throw ppdbError
        }

        if (!ppdb) {
          setError(
            "Data pendaftaran calon santri belum ditemukan. Silakan isi Tahap 1 terlebih dahulu."
          )
          setChecking(false)
          return
        }

        const { data: parent, error: parentError } = await supabase
          .from("ppdb_parents")
          .select("*")
          .eq("ppdb_id", ppdb.id)
          .maybeSingle()

        if (parentError) {
          throw parentError
        }

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
        console.error(err)

        setError(
          err?.message ||
            "Data gagal dimuat. Silakan coba kembali."
        )
      } finally {
        setChecking(false)
      }
    }

    loadData()
  }, [supabase])


  /*
   * =========================================================
   * HANDLE CHANGE
   * =========================================================
   */

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


  /*
   * =========================================================
   * SIMPAN DATA ORANG TUA
   * =========================================================
   */

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault()

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = "/login"
        return
      }

      /*
       * Ambil PPDB milik user yang sedang login.
       */

      const { data: ppdb, error: ppdbError } = await supabase
        .from("ppdb_applications")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle()

      if (ppdbError) {
        throw ppdbError
      }

      if (!ppdb) {
        throw new Error(
          "Data pendaftaran calon santri belum ditemukan. Silakan isi Tahap 1 terlebih dahulu."
        )
      }


      /*
       * Validasi data ayah.
       */

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

      if (formData.nikAyah.length !== 16) {
        throw new Error(
          "NIK ayah harus terdiri dari 16 digit."
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


      /*
       * Validasi data ibu.
       */

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

      if (formData.nikIbu.length !== 16) {
        throw new Error(
          "NIK ibu harus terdiri dari 16 digit."
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


      /*
       * Validasi WhatsApp.
       *
       * Karena tabel ppdb_parents saat ini
       * memiliki satu kolom nomor_whatsapp,
       * kita menggunakan nomor ayah sebagai
       * kontak utama.
       */

      const nomorWhatsApp =
        formData.noHpAyah.trim() ||
        formData.noHpIbu.trim() ||
        formData.noHpWali.trim()

      if (!nomorWhatsApp) {
        throw new Error(
          "Minimal satu nomor WhatsApp harus diisi."
        )
      }


      /*
       * Cek apakah data orang tua sudah ada.
       */

      const { data: existingParent, error: existingError } =
        await supabase
          .from("ppdb_parents")
          .select("id")
          .eq("ppdb_id", ppdb.id)
          .maybeSingle()

      if (existingError) {
        throw existingError
      }


      /*
       * Data yang akan disimpan.
       */

      const parentData = {
        ppdb_id: ppdb.id,

        nama_ayah: formData.namaAyah.trim(),
        nik_ayah: formData.nikAyah.trim(),
        pekerjaan_ayah: formData.pekerjaanAyah.trim(),
        pendidikan_ayah: formData.pendidikanAyah,

        nama_ibu: formData.namaIbu.trim(),
        nik_ibu: formData.nikIbu.trim(),
        pekerjaan_ibu: formData.pekerjaanIbu.trim(),
        pendidikan_ibu: formData.pendidikanIbu,

        nama_wali: formData.namaWali.trim() || null,
        nik_wali: null,
        hubungan_wali:
          formData.hubunganWali || null,
        pekerjaan_wali:
          formData.pekerjaanWali.trim() || null,

        nomor_whatsapp: nomorWhatsApp,

        email: user.email || null,

        alamat: null,

        updated_at: new Date().toISOString(),
      }


      /*
       * UPDATE jika sudah ada.
       */

      if (existingParent) {
        const { error } = await supabase
          .from("ppdb_parents")
          .update(parentData)
          .eq("id", existingParent.id)

        if (error) {
          throw error
        }

      } else {

        /*
         * INSERT jika belum ada.
         */

        const { error } = await supabase
          .from("ppdb_parents")
          .insert(parentData)

        if (error) {
          throw error
        }
      }


      /*
       * Berhasil.
       */

      setSuccess(
        "Data orang tua/wali berhasil disimpan."
      )

      /*
       * Tunggu sebentar agar user melihat
       * pesan berhasil.
       */

      setTimeout(() => {
        window.location.href =
          "/ppdb/daftar/pendidikan"
      }, 700)

    } catch (err: any) {
      console.error(err)

      setError(
        err?.message ||
          "Data orang tua/wali gagal disimpan. Silakan coba kembali."
      )

    } finally {
      setLoading(false)
    }
  }


  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-slate-500">
            Memuat data orang tua/wali...
          </p>

        </div>

      </main>
    )
  }


  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#eef4fa] text-[#10233f] selection:bg-blue-100 selection:text-[#071a36]">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.96),transparent_36%),radial-gradient(circle_at_8%_34%,rgba(37,99,235,0.10),transparent_28%),radial-gradient(circle_at_94%_52%,rgba(6,182,212,0.08),transparent_30%)]" />
        <div className="absolute -left-48 top-24 h-96 w-96 rounded-full bg-blue-300/10 blur-3xl edu-float" />
        <div className="absolute -right-44 top-56 h-96 w-96 rounded-full bg-cyan-300/10 blur-3xl edu-float-reverse" />
        <div className="absolute left-[10%] top-[37%] h-20 w-20 rounded-full border border-white/55 bg-white/20 backdrop-blur-sm edu-pulse" />
        <div className="absolute right-[10%] top-[64%] h-14 w-14 rounded-full border border-blue-200/45 bg-blue-100/20 backdrop-blur-sm edu-pulse [animation-delay:1s]" />
      </div>

      {/* HEADER */}

      <header className="relative z-10 border-b border-white/15 bg-gradient-to-br from-[#071a36] via-[#123e70] to-[#2675bd] text-white shadow-[0_18px_55px_rgba(7,26,54,0.16)]">

        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl edu-glow" />

        <div className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">

          <div>

            <p className="text-[9px] font-black uppercase tracking-[0.24em] text-cyan-200">
              INIBS Smart Digital
            </p>

            <h1 className="mt-1 text-xl font-black tracking-tight text-white sm:text-2xl">
              PPDB 2027/2028
            </h1>

          </div>

          <div className="hidden text-right sm:block">

            <p className="text-sm font-black text-white">
              Imam Nawawi Islamic Boarding School
            </p>

            <p className="mt-1 text-xs text-blue-100/75">
              Sistem Pendaftaran Santri Baru
            </p>

          </div>

        </div>

      </header>


      {/* PROGRESS */}

      <section className="relative z-10 border-b border-white/80 bg-white/78 shadow-sm backdrop-blur-xl">

        <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8">

          <div className="flex items-center justify-between">

            <div className="flex flex-1 items-center">

              {/* STEP 1 */}

              <div className="flex items-center">

                <div className="edu-step-done flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-black text-[#245ea8] ring-1 ring-blue-100 shadow-md">
                  ✓
                </div>

                <div className="ml-3 hidden sm:block">

                  <p className="text-[10px] font-medium text-[#7a899a]">
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

                <div className="edu-step-active flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#174f91] to-[#2675bd] text-sm font-black text-white shadow-[0_8px_24px_rgba(23,79,145,0.25)]">
                  2
                </div>

                <div className="ml-3 hidden sm:block">

                  <p className="text-xs text-blue-600">
                    Tahap 2
                  </p>

                  <p className="text-sm font-semibold text-slate-800">
                    Orang Tua/Wali
                  </p>

                </div>

              </div>


              <div className="mx-3 h-px flex-1 bg-slate-200 sm:mx-6" />


              {/* STEP 3 */}

              <div className="flex items-center">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f8fc] text-sm font-black text-slate-400 ring-1 ring-slate-200">
                  3
                </div>

                <div className="ml-3 hidden sm:block">

                  <p className="text-[10px] font-medium text-[#7a899a]">
                    Tahap 3
                  </p>

                  <p className="text-sm font-semibold text-slate-400">
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

                  <p className="text-[10px] font-medium text-[#7a899a]">
                    Tahap 4
                  </p>

                  <p className="text-sm font-semibold text-slate-400">
                    Berkas
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* CONTENT */}

      <section className="relative z-10 mx-auto max-w-4xl px-5 py-10 sm:px-8">

        <div className="animate-fade-up">


          {/* TITLE */}

          <div className="mb-8 edu-reveal">

            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#245ea8]">
              TAHAP 2 DARI 6
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#071a36] sm:text-4xl">
              Data Orang Tua/Wali
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#697787] sm:text-base">
              Lengkapi data ayah, ibu, atau wali calon santri dengan data
              yang benar dan sesuai dokumen resmi.
            </p>

          </div>


          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >


            {/* DATA AYAH */}

            <div className="animate-fade-up-delay-1 edu-card-shine rounded-[1.9rem] border border-white/90 bg-white/94 p-6 shadow-[0_18px_55px_rgba(7,26,54,0.07)] backdrop-blur-xl sm:p-8">

              <div className="mb-6">

                <div className="flex items-center gap-3">

                  <div className="edu-icon flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf4fb] text-lg text-[#245ea8] ring-1 ring-blue-100 shadow-sm">
                    <FatherIcon />
                  </div>

                  <div>

                    <h3 className="text-lg font-black tracking-tight text-[#071a36]">
                      Data Ayah
                    </h3>

                    <p className="text-[10px] font-medium text-[#7a899a]">
                      Informasi ayah kandung calon santri
                    </p>

                  </div>

                </div>

              </div>


              <div className="grid gap-5 sm:grid-cols-2">


                {/* NAMA AYAH */}

                <div className="sm:col-span-2">

                  <label className="mb-2 block text-[13px] font-black tracking-tight text-[#34465a]">
                    Nama Lengkap Ayah
                  </label>

                  <input
                    type="text"
                    name="namaAyah"
                    value={formData.namaAyah}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap ayah"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-[#f8fbfe] px-4 py-3.5 text-sm outline-none transition-all duration-300 hover:border-blue-200 hover:bg-white focus:border-[#2675bd] focus:bg-white focus:ring-4 focus:ring-blue-100/80"
                  />

                </div>


                {/* NIK AYAH */}

                <div>

                  <label className="mb-2 block text-[13px] font-black tracking-tight text-[#34465a]">
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
                    className="w-full rounded-2xl border border-slate-200 bg-[#f8fbfe] px-4 py-3.5 text-sm outline-none transition-all duration-300 hover:border-blue-200 hover:bg-white focus:border-[#2675bd] focus:bg-white focus:ring-4 focus:ring-blue-100/80"
                  />

                </div>


                {/* PEKERJAAN AYAH */}

                <div>

                  <label className="mb-2 block text-[13px] font-black tracking-tight text-[#34465a]">
                    Pekerjaan Ayah
                  </label>

                  <input
                    type="text"
                    name="pekerjaanAyah"
                    value={formData.pekerjaanAyah}
                    onChange={handleChange}
                    placeholder="Contoh: Wiraswasta"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-[#f8fbfe] px-4 py-3.5 text-sm outline-none transition-all duration-300 hover:border-blue-200 hover:bg-white focus:border-[#2675bd] focus:bg-white focus:ring-4 focus:ring-blue-100/80"
                  />

                </div>


                {/* PENDIDIKAN AYAH */}

                <div>

                  <label className="mb-2 block text-[13px] font-black tracking-tight text-[#34465a]">
                    Pendidikan Terakhir
                  </label>

                  <select
                    name="pendidikanAyah"
                    value={formData.pendidikanAyah}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-[#f8fbfe] px-4 py-3.5 text-sm outline-none transition-all duration-300 hover:border-blue-200 hover:bg-white focus:border-[#2675bd] focus:bg-white focus:ring-4 focus:ring-blue-100/80"
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


                {/* HP AYAH */}

                <div>

                  <label className="mb-2 block text-[13px] font-black tracking-tight text-[#34465a]">
                    Nomor WhatsApp Ayah
                  </label>

                  <input
                    type="tel"
                    name="noHpAyah"
                    value={formData.noHpAyah}
                    onChange={handleChange}
                    placeholder="08xxxxxxxxxx"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-[#f8fbfe] px-4 py-3.5 text-sm outline-none transition-all duration-300 hover:border-blue-200 hover:bg-white focus:border-[#2675bd] focus:bg-white focus:ring-4 focus:ring-blue-100/80"
                  />

                </div>

              </div>

            </div>


            {/* DATA IBU */}

            <div className="animate-fade-up-delay-2 edu-card-shine rounded-[1.9rem] border border-white/90 bg-white/94 p-6 shadow-[0_18px_55px_rgba(7,26,54,0.07)] backdrop-blur-xl sm:p-8">

              <div className="mb-6">

                <div className="flex items-center gap-3">

                  <div className="edu-icon flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf4fb] text-lg text-[#245ea8] ring-1 ring-blue-100 shadow-sm">
                    <MotherIcon />
                  </div>

                  <div>

                    <h3 className="text-lg font-black tracking-tight text-[#071a36]">
                      Data Ibu
                    </h3>

                    <p className="text-[10px] font-medium text-[#7a899a]">
                      Informasi ibu kandung calon santri
                    </p>

                  </div>

                </div>

              </div>


              <div className="grid gap-5 sm:grid-cols-2">


                {/* NAMA IBU */}

                <div className="sm:col-span-2">

                  <label className="mb-2 block text-[13px] font-black tracking-tight text-[#34465a]">
                    Nama Lengkap Ibu
                  </label>

                  <input
                    type="text"
                    name="namaIbu"
                    value={formData.namaIbu}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap ibu"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-[#f8fbfe] px-4 py-3.5 text-sm outline-none transition-all duration-300 hover:border-blue-200 hover:bg-white focus:border-[#2675bd] focus:bg-white focus:ring-4 focus:ring-blue-100/80"
                  />

                </div>


                {/* NIK IBU */}

                <div>

                  <label className="mb-2 block text-[13px] font-black tracking-tight text-[#34465a]">
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
                    className="w-full rounded-2xl border border-slate-200 bg-[#f8fbfe] px-4 py-3.5 text-sm outline-none transition-all duration-300 hover:border-blue-200 hover:bg-white focus:border-[#2675bd] focus:bg-white focus:ring-4 focus:ring-blue-100/80"
                  />

                </div>


                {/* PEKERJAAN IBU */}

                <div>

                  <label className="mb-2 block text-[13px] font-black tracking-tight text-[#34465a]">
                    Pekerjaan Ibu
                  </label>

                  <input
                    type="text"
                    name="pekerjaanIbu"
                    value={formData.pekerjaanIbu}
                    onChange={handleChange}
                    placeholder="Contoh: Ibu Rumah Tangga"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-[#f8fbfe] px-4 py-3.5 text-sm outline-none transition-all duration-300 hover:border-blue-200 hover:bg-white focus:border-[#2675bd] focus:bg-white focus:ring-4 focus:ring-blue-100/80"
                  />

                </div>


                {/* PENDIDIKAN IBU */}

                <div>

                  <label className="mb-2 block text-[13px] font-black tracking-tight text-[#34465a]">
                    Pendidikan Terakhir
                  </label>

                  <select
                    name="pendidikanIbu"
                    value={formData.pendidikanIbu}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-[#f8fbfe] px-4 py-3.5 text-sm outline-none transition-all duration-300 hover:border-blue-200 hover:bg-white focus:border-[#2675bd] focus:bg-white focus:ring-4 focus:ring-blue-100/80"
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


                {/* HP IBU */}

                <div>

                  <label className="mb-2 block text-[13px] font-black tracking-tight text-[#34465a]">
                    Nomor WhatsApp Ibu
                  </label>

                  <input
                    type="tel"
                    name="noHpIbu"
                    value={formData.noHpIbu}
                    onChange={handleChange}
                    placeholder="08xxxxxxxxxx"
                    className="w-full rounded-2xl border border-slate-200 bg-[#f8fbfe] px-4 py-3.5 text-sm outline-none transition-all duration-300 hover:border-blue-200 hover:bg-white focus:border-[#2675bd] focus:bg-white focus:ring-4 focus:ring-blue-100/80"
                  />

                </div>

              </div>

            </div>


            {/* DATA WALI */}

            <div className="animate-fade-up-delay-3 edu-card-shine rounded-[1.9rem] border border-white/90 bg-white/94 p-6 shadow-[0_18px_55px_rgba(7,26,54,0.07)] backdrop-blur-xl sm:p-8">

              <div className="mb-6">

                <div className="flex items-center gap-3">

                  <div className="edu-icon flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf4fb] text-lg text-[#245ea8] ring-1 ring-blue-100 shadow-sm">
                    <GuardianIcon />
                  </div>

                  <div>

                    <h3 className="text-lg font-black tracking-tight text-[#071a36]">
                      Data Wali
                    </h3>

                    <p className="text-[10px] font-medium text-[#7a899a]">
                      Diisi jika calon santri memiliki wali
                    </p>

                  </div>

                </div>

              </div>


              <div className="edu-note mb-6 rounded-[1.35rem] border border-blue-100 bg-[#f7fbff] px-4 py-3.5 text-sm leading-6 text-[#245ea8] shadow-sm">

                Data wali bersifat opsional. Silakan isi apabila wali
                calon santri berbeda dengan ayah atau ibu.

              </div>


              <div className="grid gap-5 sm:grid-cols-2">


                {/* NAMA WALI */}

                <div className="sm:col-span-2">

                  <label className="mb-2 block text-[13px] font-black tracking-tight text-[#34465a]">
                    Nama Lengkap Wali
                  </label>

                  <input
                    type="text"
                    name="namaWali"
                    value={formData.namaWali}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap wali"
                    className="w-full rounded-2xl border border-slate-200 bg-[#f8fbfe] px-4 py-3.5 text-sm outline-none transition-all duration-300 hover:border-blue-200 hover:bg-white focus:border-[#2675bd] focus:bg-white focus:ring-4 focus:ring-blue-100/80"
                  />

                </div>


                {/* HUBUNGAN */}

                <div>

                  <label className="mb-2 block text-[13px] font-black tracking-tight text-[#34465a]">
                    Hubungan dengan Santri
                  </label>

                  <select
                    name="hubunganWali"
                    value={formData.hubunganWali}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-[#f8fbfe] px-4 py-3.5 text-sm outline-none transition-all duration-300 hover:border-blue-200 hover:bg-white focus:border-[#2675bd] focus:bg-white focus:ring-4 focus:ring-blue-100/80"
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


                {/* PEKERJAAN WALI */}

                <div>

                  <label className="mb-2 block text-[13px] font-black tracking-tight text-[#34465a]">
                    Pekerjaan Wali
                  </label>

                  <input
                    type="text"
                    name="pekerjaanWali"
                    value={formData.pekerjaanWali}
                    onChange={handleChange}
                    placeholder="Contoh: Wiraswasta"
                    className="w-full rounded-2xl border border-slate-200 bg-[#f8fbfe] px-4 py-3.5 text-sm outline-none transition-all duration-300 hover:border-blue-200 hover:bg-white focus:border-[#2675bd] focus:bg-white focus:ring-4 focus:ring-blue-100/80"
                  />

                </div>


                {/* HP WALI */}

                <div>

                  <label className="mb-2 block text-[13px] font-black tracking-tight text-[#34465a]">
                    Nomor WhatsApp Wali
                  </label>

                  <input
                    type="tel"
                    name="noHpWali"
                    value={formData.noHpWali}
                    onChange={handleChange}
                    placeholder="08xxxxxxxxxx"
                    className="w-full rounded-2xl border border-slate-200 bg-[#f8fbfe] px-4 py-3.5 text-sm outline-none transition-all duration-300 hover:border-blue-200 hover:bg-white focus:border-[#2675bd] focus:bg-white focus:ring-4 focus:ring-blue-100/80"
                  />

                </div>

              </div>

            </div>


            {/* ERROR */}

            {error && (

              <div className="rounded-[1.35rem] border border-red-100 bg-red-50/90 px-4 py-4 text-sm leading-6 text-red-600 shadow-sm animate-soft-slide">
                {error}
              </div>

            )}


            {/* SUCCESS */}

            {success && (

              <div className="rounded-[1.35rem] border border-emerald-100 bg-emerald-50/90 px-4 py-4 text-sm leading-6 text-emerald-700 shadow-sm animate-soft-slide">
                {success}
              </div>

            )}


            {/* BUTTON */}

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">

              <Link
                href="/ppdb/daftar"
                className="group flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-100 hover:bg-[#f8fbfe] hover:shadow-md"
              >
                ← Kembali
              </Link>


              <button
                type="submit"
                disabled={loading}
                className="group flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#0d3b72] via-[#174f91] to-[#2675bd] px-7 py-3.5 text-sm font-black text-white shadow-[0_14px_34px_rgba(23,79,145,0.24)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(23,79,145,0.30)] disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading
                  ? "Menyimpan..."
                  : "Lanjut ke Data Pendidikan"}

                {!loading && (
                  <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                )}

              </button>

            </div>

          </form>

        </div>

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
            transform 600ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 600ms cubic-bezier(0.22, 1, 0.36, 1),
            border-color 450ms ease;
        }

        .edu-card-shine::after {
          content: "";
          position: absolute;
          top: -20%;
          bottom: -20%;
          left: -55%;
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
          border-color: rgba(191, 219, 254, 0.95);
          box-shadow: 0 28px 72px rgba(7, 26, 54, 0.10);
        }

        .edu-card-shine:hover::after {
          left: 140%;
        }

        .edu-icon svg {
          transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .edu-card-shine:hover .edu-icon svg {
          transform: scale(1.06);
        }

        .edu-icon {
          transition:
            transform 500ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 500ms ease;
        }

        .edu-card-shine:hover .edu-icon {
          transform: translateY(-2px) scale(1.05) rotate(1deg);
          box-shadow: 0 10px 26px rgba(38, 117, 189, 0.12);
        }

        .edu-note {
          animation: eduReveal 700ms 120ms cubic-bezier(0.22, 1, 0.36, 1) both;
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
          0%, 100% { opacity: 0.30; transform: scale(0.96); }
          50% { opacity: 0.85; transform: scale(1.08); }
        }

        @keyframes eduGlow {
          0%, 100% { opacity: 0.32; transform: scale(1); }
          50% { opacity: 0.78; transform: scale(1.08); }
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

function FatherIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <circle cx="12" cy="7.5" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 20a6.5 6.5 0 0 1 13 0" />
      <path strokeLinecap="round" d="M8.5 4.5h7" />
    </svg>
  )
}

function MotherIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <circle cx="12" cy="7.5" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 20a6.5 6.5 0 0 1 13 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5.2 10 3.5M16 5.2 14 3.5" />
    </svg>
  )
}

function GuardianIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <circle cx="12" cy="7.5" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 20a6.5 6.5 0 0 1 13 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.5v-1M7.8 5.1 7 4.3M16.2 5.1l.8-.8" />
    </svg>
  )
}
