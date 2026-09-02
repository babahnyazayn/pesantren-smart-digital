"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  async function handleUpdatePassword(
    e: React.FormEvent
  ) {
    e.preventDefault()

    setError("")

    if (password.length < 6) {
      setError("Password minimal 6 karakter.")
      return
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak sesuai.")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      setError(
        "Password gagal diperbarui. Silakan minta link reset password yang baru."
      )

      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  return (
    <main className="relative min-h-screen overflow-hidden">

      {/* BACKGROUND */}

      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/gedung-sekolah.png')",
        }}
      />

      {/* OVERLAY */}

      <div className="absolute inset-0 bg-slate-950/65" />

      {/* LIGHT */}

      <div className="absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-blue-500/10 blur-3xl" />

      <div className="absolute -bottom-40 -right-40 h-[450px] w-[450px] rounded-full bg-cyan-400/10 blur-3xl" />


      {/* CONTENT */}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-8">

        <div className="w-full max-w-md">


          {/* LOGO */}

          <div className="mb-6 text-center text-white">

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


          {/* CARD */}

          <div className="overflow-hidden rounded-[28px] border border-white/30 bg-white/[0.97] shadow-[0_25px_70px_rgba(0,0,0,0.30)] backdrop-blur-xl">

            {/* ACCENT */}

            <div className="h-1 bg-gradient-to-r from-blue-800 via-blue-600 to-cyan-400" />

            <div className="p-6 sm:p-8">


              {!success ? (

                <>

                  {/* BACK */}

                  <Link
                    href="/login"
                    className="group mb-7 inline-flex items-center gap-2 text-xs font-semibold text-slate-400 transition hover:text-blue-600"
                  >

                    <span className="transition-transform duration-200 group-hover:-translate-x-1">
                      ←
                    </span>

                    Kembali ke Login

                  </Link>


                  {/* HEADER */}

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

                        <rect
                          width="18"
                          height="14"
                          x="3"
                          y="5"
                          rx="2"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m3 7 9 6 9-6"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 13v6"
                        />

                      </svg>

                    </div>

                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                      Keamanan Akun
                    </p>

                    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                      Buat Password Baru
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Silakan buat password baru untuk
                      mengamankan akun Walisantri Anda.
                    </p>

                  </div>


                  {/* FORM */}

                  <form
                    onSubmit={handleUpdatePassword}
                    className="space-y-5"
                  >

                    {/* PASSWORD */}

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Password Baru
                      </label>

                      <div className="relative">

                        <input
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          value={password}
                          onChange={(e) =>
                            setPassword(e.target.value)
                          }
                          placeholder="Minimal 6 karakter"
                          required
                          autoComplete="new-password"
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-4 pr-12 text-sm text-slate-800 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(
                              !showPassword
                            )
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
                        >
                          {showPassword ? "🙈" : "👁"}
                        </button>

                      </div>

                    </div>


                    {/* CONFIRM */}

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Konfirmasi Password
                      </label>

                      <div className="relative">

                        <input
                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          value={confirmPassword}
                          onChange={(e) =>
                            setConfirmPassword(
                              e.target.value
                            )
                          }
                          placeholder="Ulangi password baru"
                          required
                          autoComplete="new-password"
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-4 pr-12 text-sm text-slate-800 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(
                              !showConfirmPassword
                            )
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
                        >
                          {showConfirmPassword
                            ? "🙈"
                            : "👁"}
                        </button>

                      </div>

                    </div>


                    {/* ERROR */}

                    {error && (

                      <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs leading-5 text-red-600">
                        {error}
                      </div>

                    )}


                    {/* BUTTON */}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-2xl bg-gradient-to-r from-blue-800 to-blue-600 px-5 py-4 font-bold text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      {loading
                        ? "Menyimpan..."
                        : "Simpan Password Baru"}

                    </button>

                  </form>

                </>

              ) : (

                /* SUCCESS */

                <div className="py-5 text-center">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-2xl text-emerald-600">
                    ✓
                  </div>

                  <h2 className="mt-5 text-2xl font-black text-slate-900">
                    Password Berhasil Diubah
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Password akun Anda telah berhasil
                    diperbarui. Sekarang Anda dapat
                    masuk menggunakan password baru.
                  </p>

                  <Link
                    href="/login"
                    className="mt-6 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-800 to-blue-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    Masuk ke INIBS Smart Digital
                  </Link>

                </div>

              )}


              {/* FOOTER */}

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

          <p className="mt-5 text-center text-[11px] text-white/55">
            © 2026 Imam Nawawi Islamic Boarding School
          </p>

        </div>

      </div>

    </main>
  )
}