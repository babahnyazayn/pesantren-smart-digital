"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"

export default function PendaftaranPage() {
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [namaLengkap, setNamaLengkap] = useState("")
  const [nik, setNik] = useState("")
  const [nisn, setNisn] = useState("")
  const [tempatLahir, setTempatLahir] = useState("")
  const [tanggalLahir, setTanggalLahir] = useState("")
  const [jenisKelamin, setJenisKelamin] = useState("")
  const [asalSekolah, setAsalSekolah] = useState("")
  const [npsn, setNpsn] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [alamat, setAlamat] = useState("")

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
    async function loadApplication() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          window.location.href = "/login"
          return
        }

        const { data, error } = await supabase
          .from("ppdb_applications")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle()

        if (error) {
          console.error(error)
        }

        if (data) {
          setNamaLengkap(data.nama_lengkap || "")
          setNik(data.nik || "")
          setNisn(data.nisn || "")
          setTempatLahir(data.tempat_lahir || "")
          setTanggalLahir(data.tanggal_lahir || "")
          setJenisKelamin(data.jenis_kelamin || "")
          setAsalSekolah(data.asal_sekolah || "")
          setNpsn(data.npsn || "")
          setWhatsapp(data.whatsapp || "")
          setAlamat(data.alamat || "")
        }
      } catch (error) {
        console.error(error)
        setError("Data gagal dimuat. Silakan coba kembali.")
      } finally {
        setChecking(false)
      }
    }

    loadApplication()
  }, [])


  /*
   * =========================================================
   * SIMPAN DATA CALON SANTRI
   * =========================================================
   */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setError("")
    setSuccess("")

    /*
     * VALIDASI
     */

    if (!namaLengkap.trim()) {
      setError("Nama lengkap calon santri wajib diisi.")
      return
    }

    if (!nik.trim()) {
      setError("NIK wajib diisi.")
      return
    }

    if (nik.length !== 16) {
      setError("NIK harus terdiri dari 16 digit.")
      return
    }

    if (!tempatLahir.trim()) {
      setError("Tempat lahir wajib diisi.")
      return
    }

    if (!tanggalLahir) {
      setError("Tanggal lahir wajib diisi.")
      return
    }

    if (!jenisKelamin) {
      setError("Silakan pilih jenis kelamin.")
      return
    }

    if (!asalSekolah.trim()) {
      setError("Asal sekolah wajib diisi.")
      return
    }

    if (!whatsapp.trim()) {
      setError("Nomor WhatsApp wajib diisi.")
      return
    }

    if (!alamat.trim()) {
      setError("Alamat lengkap wajib diisi.")
      return
    }

    setLoading(true)

    try {
      /*
       * CEK USER LOGIN
       */

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = "/login"
        return
      }


      /*
       * CEK APAKAH USER SUDAH MEMILIKI DATA PPDB
       */

      const { data: existingData, error: existingError } =
        await supabase
          .from("ppdb_applications")
          .select("id, status")
          .eq("user_id", user.id)
          .maybeSingle()

      if (existingError) {
        throw existingError
      }


      /*
       * DATA YANG AKAN DISIMPAN
       */

      const applicationData = {
        user_id: user.id,

        nama_lengkap: namaLengkap.trim(),
        nik: nik.trim(),
        nisn: nisn.trim() || null,

        tempat_lahir: tempatLahir.trim(),
        tanggal_lahir: tanggalLahir,
        jenis_kelamin: jenisKelamin,

        asal_sekolah: asalSekolah.trim(),
        npsn: npsn.trim() || null,

        whatsapp: whatsapp.trim(),
        alamat: alamat.trim(),

        status: "DRAFT",

        updated_at: new Date().toISOString(),
      }


      /*
       * UPDATE DATA JIKA SUDAH ADA
       */

      if (existingData) {
        const { error: updateError } = await supabase
          .from("ppdb_applications")
          .update(applicationData)
          .eq("id", existingData.id)

        if (updateError) {
          throw updateError
        }
      }


      /*
       * INSERT DATA JIKA BELUM ADA
       */

      else {
        const { error: insertError } = await supabase
          .from("ppdb_applications")
          .insert({
            ...applicationData,
            created_at: new Date().toISOString(),
          })

        if (insertError) {
          throw insertError
        }
      }


      /*
       * DATA BERHASIL DISIMPAN
       */

      setSuccess(
        "Data calon santri berhasil disimpan. Mengarahkan ke tahap berikutnya..."
      )


      /*
       * =====================================================
       * PINDAH KE TAHAP 2
       * =====================================================
       *
       * Jangan menggunakan router.push di sini.
       * Kita menggunakan window.location.href agar
       * halaman benar-benar berpindah dan session
       * Supabase tetap terbaca.
       */

      setTimeout(() => {
        window.location.href = "/ppdb/daftar/orangtua"
      }, 700)

    } catch (error: any) {
      console.error("PPDB ERROR:", error)

      setError(
        error?.message ||
          "Data gagal disimpan. Silakan coba kembali."
      )

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
            Memuat formulir...
          </p>

        </div>

      </main>
    )
  }


  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#eef4fa] text-[#10233f] selection:bg-blue-100 selection:text-[#071a36]">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.96),transparent_38%),radial-gradient(circle_at_8%_35%,rgba(37,99,235,0.10),transparent_28%),radial-gradient(circle_at_92%_48%,rgba(6,182,212,0.08),transparent_30%)]" />
        <div className="absolute -left-48 top-20 h-96 w-96 rounded-full bg-blue-300/12 blur-3xl inibs-float" />
        <div className="absolute -right-44 top-56 h-96 w-96 rounded-full bg-cyan-300/10 blur-3xl inibs-float-reverse" />
        <div className="absolute left-[12%] top-[34%] h-20 w-20 rounded-full border border-white/60 bg-white/20 backdrop-blur-sm inibs-soft-pulse" />
        <div className="absolute right-[12%] top-[56%] h-14 w-14 rounded-full border border-blue-200/45 bg-blue-100/20 backdrop-blur-sm inibs-soft-pulse [animation-delay:900ms]" />
      </div>

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="relative z-10 border-b border-white/15 bg-gradient-to-br from-[#071a36] via-[#123e70] to-[#2675bd] text-white shadow-[0_20px_60px_rgba(7,26,54,0.18)]">

        <div className="relative mx-auto max-w-5xl px-5 py-10 sm:px-8">

          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl inibs-glow" />

          <Link
            href="/ppdb"
            className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/15 hover:shadow-lg animate-fade-up"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-0.5">←</span> Kembali ke PPDB
          </Link>

          <div className="mt-10 max-w-3xl animate-fade-up-delay-1">

            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-200 sm:text-xs">
              PPDB INIBS 2027/2028
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
              Pendaftaran Calon Santri • Student Admission
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
              Silakan lengkapi data calon santri dengan benar dan sesuai
              dokumen resmi.
            </p>

          </div>

        </div>

      </header>


      {/* =====================================================
          CONTENT
      ====================================================== */}

      <section className="relative z-10 mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">


        {/* =================================================
            PROGRESS
        ================================================== */}

        <div className="mb-8 animate-fade-up-delay-1 rounded-[1.5rem] border border-white/90 bg-white/80 p-4 shadow-[0_14px_40px_rgba(7,26,54,0.05)] backdrop-blur-xl">

          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">

            <span className="text-blue-700">
              01 Data Calon Santri
            </span>

            <span>
              1 dari 6 tahap
            </span>

          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">

            <div className="h-full w-1/6 rounded-full bg-gradient-to-r from-[#174f91] via-[#2675bd] to-[#55a9d8] shadow-[0_0_18px_rgba(38,117,189,0.30)] transition-all duration-700" />

          </div>

        </div>


        {/* =================================================
            FORM CARD
        ================================================== */}

        <div className="animate-fade-up-delay-2 inibs-form-card rounded-[2rem] border border-white/90 bg-white/94 p-6 shadow-[0_24px_70px_rgba(7,26,54,0.08)] backdrop-blur-xl sm:p-9">

          <div className="mb-8">

            <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-[#edf4fb] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#245ea8]">
              STEP 01 • TAHAP 1
            </span>

            <h2 className="mt-4 text-2xl font-bold text-slate-900">
              Data Calon Santri
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Masukkan identitas calon santri sesuai dengan dokumen resmi.
            </p>

          </div>


          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >


            {/* NAMA */}

            <div>

              <label className="mb-2 block text-[13px] font-black tracking-tight text-[#34465a]">
                Nama Lengkap
              </label>

              <input
                type="text"
                value={namaLengkap}
                onChange={(e) =>
                  setNamaLengkap(e.target.value)
                }
                placeholder="Masukkan nama lengkap"
                required
                className="w-full rounded-2xl border border-slate-200 bg-[#f8fbfe] px-4 py-3.5 text-sm outline-none transition-all duration-300 hover:border-blue-200 hover:bg-white focus:border-[#2675bd] focus:bg-white focus:ring-4 focus:ring-blue-100/80"
              />

            </div>


            {/* NIK & NISN */}

            <div className="grid gap-6 sm:grid-cols-2">

              <div>

                <label className="mb-2 block text-[13px] font-black tracking-tight text-[#34465a]">
                  NIK
                </label>

                <input
                  type="text"
                  value={nik}
                  onChange={(e) =>
                    setNik(
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 16)
                    )
                  }
                  placeholder="16 digit NIK"
                  inputMode="numeric"
                  maxLength={16}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-[#f8fbfe] px-4 py-3.5 text-sm outline-none transition-all duration-300 hover:border-blue-200 hover:bg-white focus:border-[#2675bd] focus:bg-white focus:ring-4 focus:ring-blue-100/80"
                />

              </div>


              <div>

                <label className="mb-2 block text-[13px] font-black tracking-tight text-[#34465a]">
                  NISN
                </label>

                <input
                  type="text"
                  value={nisn}
                  onChange={(e) =>
                    setNisn(
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10)
                    )
                  }
                  placeholder="10 digit NISN"
                  inputMode="numeric"
                  maxLength={10}
                  className="w-full rounded-2xl border border-slate-200 bg-[#f8fbfe] px-4 py-3.5 text-sm outline-none transition-all duration-300 hover:border-blue-200 hover:bg-white focus:border-[#2675bd] focus:bg-white focus:ring-4 focus:ring-blue-100/80"
                />

              </div>

            </div>


            {/* TEMPAT & TANGGAL LAHIR */}

            <div className="grid gap-6 sm:grid-cols-2">

              <div>

                <label className="mb-2 block text-[13px] font-black tracking-tight text-[#34465a]">
                  Tempat Lahir
                </label>

                <input
                  type="text"
                  value={tempatLahir}
                  onChange={(e) =>
                    setTempatLahir(e.target.value)
                  }
                  placeholder="Contoh: Banyuwangi"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-[#f8fbfe] px-4 py-3.5 text-sm outline-none transition-all duration-300 hover:border-blue-200 hover:bg-white focus:border-[#2675bd] focus:bg-white focus:ring-4 focus:ring-blue-100/80"
                />

              </div>


              <div>

                <label className="mb-2 block text-[13px] font-black tracking-tight text-[#34465a]">
                  Tanggal Lahir
                </label>

                <input
                  type="date"
                  value={tanggalLahir}
                  onChange={(e) =>
                    setTanggalLahir(e.target.value)
                  }
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-[#f8fbfe] px-4 py-3.5 text-sm outline-none transition-all duration-300 hover:border-blue-200 hover:bg-white focus:border-[#2675bd] focus:bg-white focus:ring-4 focus:ring-blue-100/80"
                />

              </div>

            </div>


            {/* JENIS KELAMIN */}

            <div>

              <label className="mb-2 block text-[13px] font-black tracking-tight text-[#34465a]">
                Jenis Kelamin
              </label>

              <select
                value={jenisKelamin}
                onChange={(e) =>
                  setJenisKelamin(e.target.value)
                }
                required
                className="w-full rounded-2xl border border-slate-200 bg-[#f8fbfe] px-4 py-3.5 text-sm outline-none transition-all duration-300 hover:border-blue-200 hover:bg-white focus:border-[#2675bd] focus:bg-white focus:ring-4 focus:ring-blue-100/80"
              >

                <option value="" disabled>
                  Pilih jenis kelamin
                </option>

                <option value="laki-laki">
                  Laki-laki
                </option>

                <option value="perempuan">
                  Perempuan
                </option>

              </select>

            </div>


            {/* ASAL SEKOLAH */}

            <div>

              <label className="mb-2 block text-[13px] font-black tracking-tight text-[#34465a]">
                Asal Sekolah
              </label>

              <input
                type="text"
                value={asalSekolah}
                onChange={(e) =>
                  setAsalSekolah(e.target.value)
                }
                placeholder="Nama sekolah asal"
                required
                className="w-full rounded-2xl border border-slate-200 bg-[#f8fbfe] px-4 py-3.5 text-sm outline-none transition-all duration-300 hover:border-blue-200 hover:bg-white focus:border-[#2675bd] focus:bg-white focus:ring-4 focus:ring-blue-100/80"
              />

            </div>


            {/* NPSN */}

            <div>

              <label className="mb-2 block text-[13px] font-black tracking-tight text-[#34465a]">
                NPSN Sekolah
              </label>

              <input
                type="text"
                value={npsn}
                onChange={(e) =>
                  setNpsn(
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 8)
                  )
                }
                placeholder="Masukkan NPSN sekolah"
                inputMode="numeric"
                maxLength={8}
                className="w-full rounded-2xl border border-slate-200 bg-[#f8fbfe] px-4 py-3.5 text-sm outline-none transition-all duration-300 hover:border-blue-200 hover:bg-white focus:border-[#2675bd] focus:bg-white focus:ring-4 focus:ring-blue-100/80"
              />

            </div>


            {/* WHATSAPP */}

            <div>

              <label className="mb-2 block text-[13px] font-black tracking-tight text-[#34465a]">
                Nomor WhatsApp
              </label>

              <input
                type="tel"
                value={whatsapp}
                onChange={(e) =>
                  setWhatsapp(e.target.value)
                }
                placeholder="Contoh: 081234567890"
                required
                className="w-full rounded-2xl border border-slate-200 bg-[#f8fbfe] px-4 py-3.5 text-sm outline-none transition-all duration-300 hover:border-blue-200 hover:bg-white focus:border-[#2675bd] focus:bg-white focus:ring-4 focus:ring-blue-100/80"
              />

            </div>


            {/* ALAMAT */}

            <div>

              <label className="mb-2 block text-[13px] font-black tracking-tight text-[#34465a]">
                Alamat Lengkap
              </label>

              <textarea
                rows={4}
                value={alamat}
                onChange={(e) =>
                  setAlamat(e.target.value)
                }
                placeholder="Masukkan alamat lengkap calon santri"
                required
                className="w-full resize-none rounded-2xl border border-slate-200 bg-[#f8fbfe] px-4 py-3.5 text-sm outline-none transition-all duration-300 hover:border-blue-200 hover:bg-white focus:border-[#2675bd] focus:bg-white focus:ring-4 focus:ring-blue-100/80"
              />

            </div>


            {/* ERROR */}

            {error && (

              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm leading-6 text-red-600">
                {error}
              </div>

            )}


            {/* SUCCESS */}

            {success && (

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3.5 text-sm leading-6 text-emerald-700">
                {success}
              </div>

            )}


            {/* BUTTON */}

            <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-between">

              <Link
                href="/ppdb"
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
                  <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
                )}

              </button>

            </div>

          </form>

        </div>


        {/* INFO */}

        <div className="mt-6 animate-fade-up-delay-3 rounded-[1.5rem] border border-blue-100 bg-white/80 px-5 py-4 text-sm leading-6 text-[#245ea8] shadow-sm backdrop-blur-xl">

          <strong>Catatan:</strong> Data yang Anda masukkan akan digunakan
          sebagai bagian dari proses pendaftaran PPDB Imam Nawawi Islamic
          Boarding School.

        </div>

      </section>

    </main>
  )
}