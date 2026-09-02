"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"

export default function LupaPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)
    setError("")
    setSuccess(false)

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    )

    if (error) {
      setError(
        "Email tidak dapat diproses. Silakan periksa kembali email Anda."
      )

      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  return (
    <main className="relative min-h-screen overflow-hidden">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/gedung-sekolah.png')",
        }}
      />

      {/* OVERLAY */}

      <div className="absolute inset-0 bg-slate-950/65" />


      {/* SOFT LIGHT */}

      <div className="absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-blue-500/10 blur-3xl" />

      <div className="absolute -bottom-40 -right-40 h-[450px] w-[450px] rounded-full bg-cyan-400/10 blur-3xl" />


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-8">

        <div className="w-full max-w-md">


          {/* =================================================
              LOGO
          ================================================= */}

          <div className="animate-fade-up mb-6 text-center text-white">

            <div className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-[22px] bg-white p-3 shadow-2xl">

              <Image
                src="/logo-imam.png"
                alt="Logo Imam Nawawi Islamic Boarding School"
                width={80}
                height={80}
                className="h-full w-full object-contain"
                priority
              />

            </div>


            <h1 className="mt-4 text-xl font-black tracking-[0.08em] sm:text-2xl">
              IMAM NAWAWI
            </h1>

            <p className="mt-1 text-[10px] font-medium tracking-[0.25em] text-blue-100 sm:text-xs">
              ISLAMIC BOARDING SCHOOL
            </p>

            <p className="mt-3 text-xs text-white/60">
              INIBS Smart Digital
            </p>

          </div>


          {/* =================================================
              CARD
          ================================================= */}

          <div className="animate-fade-up-delay-1 overflow-hidden rounded-[28px] border border-white/30 bg-white/[0.97] shadow-[0_25px_70px_rgba(0,0,0,0.30)] backdrop-blur-xl">


            {/* ACCENT */}

            <div className="h-1 bg-gradient-to-r from-blue-800 via-blue-600 to-cyan-400" />


            <div className="p-6 sm:p-8">


              {/* =================================================
                  BACK TO LOGIN
              ================================================= */}

              <Link
                href="/login"
                className="group mb-7 inline-flex items-center gap-2 text-xs font-semibold text-slate-400 transition hover:text-blue-600"
              >

                <span className="transition-transform duration-200 group-hover:-translate-x-1">
                  ←
                </span>

                Kembali ke Login

              </Link>


              {/* =================================================
                  HEADER
              ================================================= */}

              <div className="mb-7">

                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-6 w-6"
                  >

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 7.5 12 13l9-5.5M4.5 19.5h15A1.5 1.5 0 0 0 21 18V6a1.5 1.5 0 0 0-1.5-1.5h-15A1.5 1.5 0 0 0 3 6v12a1.5 1.5 0 0 0 1.5 1.5Z"
                    />

                  </svg>

                </div>


                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Pemulihan Akun
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                  Lupa Password?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Masukkan email yang Anda gunakan
                  saat membuat akun Walisantri.
                  Kami akan mengirimkan link untuk
                  membuat password baru.
                </p>

              </div>


              {/* =================================================
                  SUCCESS
              ================================================= */}

              {success ? (

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">

                  <div className="flex gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-lg text-white shadow-sm">
                      ✓
                    </div>


                    <div>

                      <h3 className="text-sm font-bold text-emerald-900">
                        Link Reset Password Terkirim
                      </h3>

                      <p className="mt-2 text-xs leading-5 text-emerald-700">
                        Silakan periksa email Anda.
                        Jika email terdaftar, Anda akan
                        menerima tautan untuk mengatur
                        ulang password.
                      </p>

                      <p className="mt-2 text-[11px] leading-5 text-emerald-600">
                        Jangan lupa memeriksa folder
                        Spam atau Promosi.
                      </p>

                    </div>

                  </div>


                  <Link
                    href="/login"
                    className="mt-5 flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                  >
                    Kembali ke Login
                  </Link>

                </div>

              ) : (

                /* =================================================
                   FORM
                ================================================= */

                <form
                  onSubmit={handleResetPassword}
                  className="space-y-5"
                >


                  {/* EMAIL */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Email Akun
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
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                        placeholder="nama@email.com"
                        required
                        autoComplete="email"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-800 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      />

                    </div>

                  </div>


                  {/* INFORMATION */}

                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">

                    <div className="flex gap-3">

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                        i
                      </div>

                      <p className="text-xs leading-5 text-blue-700">
                        Gunakan email yang sama dengan
                        email yang digunakan saat
                        mendaftarkan akun Walisantri.
                      </p>

                    </div>

                  </div>


                  {/* ERROR */}

                  {error && (

                    <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5">

                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 text-sm font-bold text-red-600">
                        !
                      </div>

                      <p className="text-xs leading-5 text-red-600">
                        {error}
                      </p>

                    </div>

                  )}


                  {/* BUTTON */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-800 to-blue-600 px-5 py-4 font-bold text-white shadow-lg shadow-blue-700/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-700/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    <span className="relative z-10">

                      {loading
                        ? "Mengirim..."
                        : "Kirim Link Reset Password"}

                    </span>


                    {!loading && (

                      <span className="relative z-10 ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>

                    )}

                  </button>

                </form>

              )}


              {/* =================================================
                  FOOTER
              ================================================= */}

              <div className="mt-7 border-t border-slate-100 pt-5 text-center">

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

          <p className="animate-fade-up-delay-2 mt-5 text-center text-[11px] text-white/55">
            © 2026 Imam Nawawi Islamic Boarding School
          </p>

        </div>

      </div>

    </main>
  )
}