"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"

export default function DaftarPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(false)

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  const passwordStrength =
    password.length === 0
      ? 0
      : password.length < 6
        ? 1
        : password.length < 10
          ? 2
          : 3

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()

    setError("")
    setSuccess("")

    if (!name.trim()) {
      setError("Silakan masukkan nama lengkap.")
      return
    }

    if (!email.trim()) {
      setError("Silakan masukkan email.")
      return
    }

    if (!whatsapp.trim()) {
      setError("Silakan masukkan nomor WhatsApp.")
      return
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.")
      return
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak sesuai.")
      return
    }

    if (!agree) {
      setError("Silakan menyetujui ketentuan pendaftaran.")
      return
    }

    setLoading(true)

    try {
      const { data, error: signUpError } =
        await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              full_name: name.trim(),
              whatsapp: whatsapp.trim(),
              role: "WALISANTRI",
            },
          },
        })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      if (!data.user) {
        setError("Akun gagal dibuat. Silakan coba kembali.")
        setLoading(false)
        return
      }

      setSuccess(
        "Akun berhasil dibuat. Silakan periksa email Anda dan klik tautan verifikasi sebelum masuk."
      )

      setLoading(false)

    } catch {
      setError(
        "Terjadi kesalahan. Silakan coba kembali."
      )

      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden">

      {/* =========================================================
          BACKGROUND
      ========================================================= */}

      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/gedung-sekolah.png')",
        }}
      />

      {/* DARK OVERLAY */}

      <div className="absolute inset-0 bg-slate-950/65" />

      {/* BLUE LIGHT */}

      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />


      {/* =========================================================
          PAGE
      ========================================================= */}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:py-12">

        <div className="w-full max-w-xl">


          {/* =====================================================
              BRAND
          ===================================================== */}

          <div className="animate-fade-up mb-6 text-center text-white">

            <div className="mx-auto mb-4 flex h-[78px] w-[78px] items-center justify-center rounded-[24px] border border-white/40 bg-white/95 p-3 shadow-2xl shadow-black/20">

              <Image
                src="/logo-imam.png"
                alt="Logo Imam Nawawi Islamic Boarding School"
                width={80}
                height={80}
                className="h-full w-full object-contain"
                priority
              />

            </div>


            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-blue-100 sm:text-xs">
              Imam Nawawi Islamic Boarding School
            </p>

            <h1 className="mt-1.5 text-2xl font-black tracking-tight sm:text-3xl">
              INIBS Smart Digital
            </h1>

            <p className="mt-1 text-xs text-white/65 sm:text-sm">
              Portal Digital Walisantri
            </p>

          </div>


          {/* =====================================================
              CARD
          ===================================================== */}

          <div className="animate-fade-up-delay-1 overflow-hidden rounded-[30px] border border-white/30 bg-white/[0.97] shadow-[0_25px_80px_rgba(0,0,0,0.30)] backdrop-blur-2xl">


            {/* TOP LINE */}

            <div className="h-1.5 bg-gradient-to-r from-blue-900 via-blue-600 to-cyan-400" />


            <div className="p-6 sm:p-9">


              {/* =================================================
                  HEADER
              ================================================= */}

              <div className="mb-7">

                <div className="mb-4 flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-600/20">
                    01
                  </div>

                  <div>

                    <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
                      Pendaftaran
                    </p>

                    <p className="text-xs text-slate-400">
                      Langkah pertama
                    </p>

                  </div>

                </div>


                <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-[30px]">
                  Buat Akun Walisantri
                </h2>

                <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                  Daftarkan akun Anda untuk memulai proses
                  PPDB dan mengakses layanan digital
                  Imam Nawawi Islamic Boarding School.
                </p>

              </div>


              {/* =================================================
                  EMAIL VERIFICATION
              ================================================= */}

              <div className="mb-6 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50">

                <div className="flex gap-3 p-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
                    
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 7.5 12 13l9-5.5M4.5 19.5h15A1.5 1.5 0 0 0 21 18V6a1.5 1.5 0 0 0-1.5-1.5h-15A1.5 1.5 0 0 0 3 6v12a1.5 1.5 0 0 0 1.5 1.5Z"
                      />
                    </svg>

                  </div>


                  <div>

                    <p className="text-sm font-bold text-slate-800">
                      Verifikasi Email
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Setelah akun dibuat, kami akan mengirimkan
                      tautan verifikasi ke email Anda.
                    </p>

                    <p className="mt-1.5 text-xs font-semibold leading-5 text-blue-700">
                      Pastikan Anda menggunakan email yang aktif.
                    </p>

                  </div>

                </div>

              </div>


              {/* =================================================
                  FORM
              ================================================= */}

              <form
                onSubmit={handleRegister}
                className="space-y-5"
              >


                {/* NAMA */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Nama Lengkap
                  </label>

                  <div className="group relative">

                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600">

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                      >

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
                        />

                      </svg>

                    </div>


                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama lengkap"
                      required
                      autoComplete="name"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-800 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />

                  </div>

                </div>


                {/* EMAIL */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email Aktif
                  </label>

                  <div className="group relative">

                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600">

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                      >

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 7.5 12 13l9-5.5M4.5 19.5h15A1.5 1.5 0 0 0 21 18V6a1.5 1.5 0 0 0-1.5-1.5h-15A1.5 1.5 0 0 0 3 6v12a1.5 1.5 0 0 0 1.5 1.5Z"
                        />

                      </svg>

                    </div>


                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      required
                      autoComplete="email"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-800 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />

                  </div>

                  <p className="mt-1.5 text-[11px] text-slate-400">
                    Email digunakan untuk verifikasi akun.
                  </p>

                </div>


                {/* WHATSAPP */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Nomor WhatsApp
                  </label>

                  <div className="group relative">

                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600">

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                      >

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.5 4.5h-2A2.5 2.5 0 0 0 4 7c0 7.18 5.82 13 13 13a2.5 2.5 0 0 0 2.5-2.5v-2l-3.2-1.2-1.8 1.8a10.7 10.7 0 0 1-5.1-5.1l1.8-1.8L10 4.5H8.5Z"
                        />

                      </svg>

                    </div>


                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      required
                      autoComplete="tel"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-800 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />

                  </div>

                  <p className="mt-1.5 text-[11px] text-slate-400">
                    Digunakan untuk informasi penting dari pesantren.
                  </p>

                </div>


                {/* PASSWORD */}

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label className="text-sm font-semibold text-slate-700">
                      Password
                    </label>

                    <span className="text-[11px] font-medium text-slate-400">
                      Minimal 6 karakter
                    </span>

                  </div>


                  <div className="group relative">

                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600">

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                      >

                        <rect
                          width="15"
                          height="11"
                          x="4.5"
                          y="10"
                          rx="2"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 10V7a4 4 0 0 1 8 0v3"
                        />

                      </svg>

                    </div>


                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Buat password"
                      required
                      autoComplete="new-password"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-12 text-sm text-slate-800 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />


                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-blue-600"
                    >

                      {showPassword ? "🙈" : "👁"}

                    </button>

                  </div>


                  {/* PASSWORD STRENGTH */}

                  {password.length > 0 && (

                    <div className="mt-3">

                      <div className="flex gap-1.5">

                        {[1, 2, 3].map((level) => (

                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                              passwordStrength >= level
                                ? "bg-blue-600"
                                : "bg-slate-200"
                            }`}
                          />

                        ))}

                      </div>


                      <div className="mt-1.5 flex justify-between">

                        <p className="text-[11px] text-slate-400">

                          {passwordStrength === 1 &&
                            "Masih terlalu pendek"}

                          {passwordStrength === 2 &&
                            "Cukup baik"}

                          {passwordStrength === 3 &&
                            "Password kuat"}

                        </p>

                      </div>

                    </div>

                  )}

                </div>


                {/* KONFIRMASI PASSWORD */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Konfirmasi Password
                  </label>

                  <div className="group relative">

                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600">

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                      >

                        <rect
                          width="15"
                          height="11"
                          x="4.5"
                          y="10"
                          rx="2"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 10V7a4 4 0 0 1 8 0v3"
                        />

                      </svg>

                    </div>


                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      placeholder="Ulangi password"
                      required
                      autoComplete="new-password"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-12 text-sm text-slate-800 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />


                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-blue-600"
                    >

                      {showConfirmPassword ? "🙈" : "👁"}

                    </button>

                  </div>


                  {confirmPassword.length > 0 && (

                    <p
                      className={`mt-1.5 text-[11px] ${
                        password === confirmPassword
                          ? "text-emerald-600"
                          : "text-red-500"
                      }`}
                    >

                      {password === confirmPassword
                        ? "✓ Password sesuai"
                        : "Password belum sesuai"}

                    </p>

                  )}

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                  <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5">

                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                      !
                    </div>

                    <p className="text-sm leading-5 text-red-600">
                      {error}
                    </p>

                  </div>

                )}


                {/* =================================================
                    SUCCESS
                ================================================= */}

                {success && (

                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">

                    <div className="flex gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-lg text-white shadow-sm">
                        ✓
                      </div>

                      <div>

                        <p className="text-sm font-bold text-emerald-900">
                          Pendaftaran Berhasil
                        </p>

                        <p className="mt-1 text-xs leading-5 text-emerald-700">
                          {success}
                        </p>

                        <Link
                          href="/login"
                          className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 underline hover:text-emerald-900"
                        >
                          Lanjut ke Login
                          <span>→</span>
                        </Link>

                      </div>

                    </div>

                  </div>

                )}


                {/* =================================================
                    ACCOUNT INFORMATION
                ================================================= */}

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">

                  <div className="flex gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm ring-1 ring-slate-100">

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                      >

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 3 4.5 6v5.5c0 4.4 3.1 7.9 7.5 9.5 4.4-1.6 7.5-5.1 7.5-9.5V6L12 3Z"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m9 12 2 2 4-4"
                        />

                      </svg>

                    </div>


                    <div>

                      <p className="text-xs font-bold text-slate-700">
                        Satu akun untuk perjalanan Anda
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-slate-500">
                        Akun ini digunakan untuk proses PPDB.
                        Setelah dinyatakan diterima, akun yang sama
                        dapat digunakan untuk mengakses Dashboard
                        Walisantri.
                      </p>

                    </div>

                  </div>

                </div>


                {/* =================================================
                    AGREEMENT
                ================================================= */}

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-transparent p-1 transition hover:border-slate-100">

                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) =>
                      setAgree(e.target.checked)
                    }
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />

                  <span className="text-xs leading-5 text-slate-500">

                    Saya menyetujui penggunaan data untuk
                    keperluan pendaftaran dan layanan
                    INIBS Smart Digital.

                  </span>

                </label>


                {/* =================================================
                    BUTTON
                ================================================= */}

                <button
                  type="submit"
                  disabled={!agree || loading}
                  className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 px-5 py-4 font-bold text-white shadow-xl shadow-blue-700/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-700/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  <span className="relative z-10">

                    {loading
                      ? "Membuat Akun..."
                      : "Buat Akun Walisantri"}

                  </span>


                  {!loading && (

                    <span className="relative z-10 ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>

                  )}

                </button>

              </form>


              {/* =================================================
                  LOGIN
              ================================================= */}

              <div className="mt-7 border-t border-slate-100 pt-6 text-center">

                <p className="text-sm text-slate-500">
                  Sudah memiliki akun?
                </p>

                <Link
                  href="/login"
                  className="group mt-2 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-blue-600 transition hover:bg-blue-50 hover:text-blue-800"
                >

                  Kembali ke Login

                  <span className="transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>

                </Link>

              </div>


              {/* =================================================
                  FOOTER
              ================================================= */}

              <div className="mt-5 text-center">

                <p className="text-[11px] font-medium text-slate-400">
                  INIBS Smart Digital
                </p>

                <p className="mt-1 text-[10px] text-slate-400">
                  Mendidik dengan Ilmu, Membina dengan Akhlak
                </p>

              </div>

            </div>

          </div>


          {/* COPYRIGHT */}

          <p className="animate-fade-up-delay-2 mt-5 text-center text-[11px] text-white/60">
            © 2026 Imam Nawawi Islamic Boarding School
          </p>

        </div>

      </div>

    </main>
  )
}