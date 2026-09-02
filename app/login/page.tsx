"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [adminMode, setAdminMode] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()

    if (loading) {
      return
    }

    setLoading(true)
    setError("")

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

      if (loginError) {
        setError(
          "Email atau password salah. Jika baru mendaftar, pastikan email Anda sudah diverifikasi."
        )
        setLoading(false)
        return
      }

      if (!data.user) {
        setError("Akun tidak ditemukan.")
        setLoading(false)
        return
      }

      /*
       * =====================================================
       * LOGIN ADMINISTRATOR
       * =====================================================
       */

      if (adminMode) {
        const {
          data: roleData,
          error: roleError,
        } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .maybeSingle()

        if (roleError) {
          await supabase.auth.signOut()

          setError(
            `Gagal memeriksa hak akses: ${roleError.message}`
          )

          setLoading(false)
          return
        }

        if (
          !roleData ||
          roleData.role !== "ADMIN"
        ) {
          await supabase.auth.signOut()

          setError(
            "Akun ini tidak memiliki akses sebagai Administrator."
          )

          setLoading(false)
          return
        }

        window.location.href = "/ppdb/admin"
        return
      }

      /*
       * =====================================================
       * LOGIN WALISANTRI
       * =====================================================
       */

      window.location.href = "/pilih-layanan"

    } catch (err) {
      console.error("ERROR LOGIN:", err)

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat login."
      )

      setLoading(false)
    }
  }

  function toggleAdminMode() {
    setAdminMode((current) => !current)
    setError("")
    setPassword("")
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950">

      {/* =====================================================
          BACKGROUND
          ===================================================== */}

      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/gedung-sekolah.png')",
        }}
      />

      <div className="absolute inset-0 bg-white/15" />

      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-slate-900/10 to-cyan-950/25" />

      {/* Background glow */}

      <div className="pointer-events-none absolute -left-40 -top-40 h-[420px] w-[420px] animate-pulse rounded-full bg-blue-400/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[420px] w-[420px] animate-pulse rounded-full bg-cyan-300/20 blur-3xl" />


      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">

        <div className="w-full max-w-md">


          {/* =====================================================
              LOGO
              ===================================================== */}

          <div className="mb-6 text-center text-white">

            <div
              className="
                mx-auto
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-[26px]
                bg-white
                p-3
                shadow-2xl
                transition-all
                duration-500
                ease-out
                hover:-translate-y-1
                hover:rotate-1
                hover:scale-105
                hover:shadow-blue-500/40
              "
            >

              <Image
                src="/logo-imam.png"
                alt="Logo Imam Nawawi Islamic Boarding School"
                width={90}
                height={90}
                priority
                className="
                  h-full
                  w-full
                  object-contain
                  transition-transform
                  duration-500
                  hover:scale-105
                "
              />

            </div>


            <h1 className="mt-4 text-xl font-black tracking-[0.12em] sm:text-2xl">
              IMAM NAWAWI
            </h1>


            <p className="mt-1 text-[10px] font-medium tracking-[0.28em] text-blue-100 sm:text-xs">
              ISLAMIC BOARDING SCHOOL
            </p>


            <p className="mt-3 text-xs text-white/60">
              INIBS Smart Digital
            </p>

          </div>


          {/* =====================================================
              LOGIN CARD
              ===================================================== */}

          <div
            className="
              overflow-hidden
              rounded-[30px]
              border
              border-white/30
              bg-white
              shadow-[0_30px_90px_rgba(0,0,0,0.35)]
              transition-all
              duration-500
              hover:shadow-[0_35px_110px_rgba(0,0,0,0.45)]
            "
          >

            {/* Top accent */}

            <div className="h-1.5 bg-gradient-to-r from-blue-950 via-blue-600 to-cyan-400" />


            <div className="p-6 sm:p-8">


              {/* =====================================================
                  HEADER
                  ===================================================== */}

              <div className="mb-7">

                <div className="flex items-center gap-3">


                  {/* Header icon */}

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      bg-blue-50
                      text-blue-600
                      transition-all
                      duration-300
                    "
                  >

                    {adminMode ? (

                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                      >

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 3 4.5 6v5.5c0 4.7 3.1 7.9 7.5 9.5 4.4-1.6 7.5-4.8 7.5-9.5V6L12 3Z"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m9 12 2 2 4-4"
                        />

                      </svg>

                    ) : (

                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                      >

                        <circle
                          cx="12"
                          cy="7"
                          r="4"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 21a8 8 0 0 1 16 0"
                        />

                      </svg>

                    )}

                  </div>


                  {/* Header text */}

                  <div>

                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">
                      {adminMode
                        ? "Administrator"
                        : "Portal Walisantri"}
                    </p>

                    <h2 className="text-2xl font-black tracking-tight text-slate-900">
                      {adminMode
                        ? "Login Administrator"
                        : "Selamat Datang"}
                    </h2>

                  </div>

                </div>


                <p className="mt-4 text-sm leading-6 text-slate-500">
                  {adminMode
                    ? "Masuk ke panel administrasi PPDB INIBS Smart Digital."
                    : "Masuk untuk mengakses layanan INIBS Smart Digital."}
                </p>

              </div>


              {/* =====================================================
                  FORM
                  ===================================================== */}

              <form
                onSubmit={handleLogin}
                className="space-y-5"
              >


                {/* =====================================================
                    EMAIL
                    ===================================================== */}

                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email
                  </label>


                  <div className="group relative">

                    <div
                      className="
                        pointer-events-none
                        absolute
                        left-4
                        top-1/2
                        z-10
                        -translate-y-1/2
                        text-slate-400
                        transition-all
                        duration-300
                        group-focus-within:text-blue-600
                      "
                    >

                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="
                          h-5
                          w-5
                          transition-transform
                          duration-300
                          group-focus-within:scale-110
                        "
                      >

                        <rect
                          x="3"
                          y="4.5"
                          width="18"
                          height="15"
                          rx="2"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m3 7.5 9 5.5 9-5.5"
                        />

                      </svg>

                    </div>


                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      placeholder="nama@email.com"
                      required
                      autoComplete="email"
                      className="
                        h-[52px]
                        w-full
                        rounded-2xl
                        border
                        border-slate-200
                        bg-slate-50
                        py-3.5
                        pl-12
                        pr-4
                        text-sm
                        text-slate-800
                        outline-none
                        transition-all
                        duration-300
                        placeholder:text-slate-400
                        hover:border-slate-300
                        hover:bg-white
                        hover:shadow-md
                        focus:border-blue-600
                        focus:bg-white
                        focus:shadow-lg
                        focus:shadow-blue-100
                        focus:ring-4
                        focus:ring-blue-100
                      "
                    />

                  </div>

                </div>


                {/* =====================================================
                    PASSWORD
                    ===================================================== */}

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="password"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Password
                    </label>


                    <Link
                      href="/lupa-password"
                      className="
                        cursor-pointer
                        text-xs
                        font-semibold
                        text-blue-600
                        transition-all
                        duration-200
                        hover:text-blue-800
                        hover:underline
                      "
                    >
                      Lupa password?
                    </Link>

                  </div>


                  {/* PASSWORD FIELD */}

                  <div
                    className="
                      group
                      relative
                      flex
                      h-[52px]
                      w-full
                      items-center
                      overflow-hidden
                      rounded-2xl
                      border
                      border-slate-200
                      bg-slate-50
                      shadow-sm
                      transition-all
                      duration-300
                      ease-out
                      hover:border-slate-300
                      hover:bg-white
                      hover:shadow-md
                      focus-within:border-blue-600
                      focus-within:bg-white
                      focus-within:shadow-lg
                      focus-within:shadow-blue-100
                      focus-within:ring-4
                      focus-within:ring-blue-100
                    "
                  >


                    {/* KUNCI */}

                    <div
                      className="
                        pointer-events-none
                        flex
                        h-full
                        w-[50px]
                        shrink-0
                        items-center
                        justify-center
                        border-r
                        border-slate-200
                        text-slate-400
                        transition-all
                        duration-300
                        group-focus-within:border-blue-100
                        group-focus-within:bg-blue-50/40
                        group-focus-within:text-blue-600
                      "
                    >

                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="
                          h-5
                          w-5
                          transition-transform
                          duration-300
                          group-focus-within:scale-110
                        "
                      >

                        <rect
                          x="4.5"
                          y="10"
                          width="15"
                          height="10.5"
                          rx="2"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 10V7a4 4 0 0 1 8 0v3"
                        />

                      </svg>

                    </div>


                    {/* INPUT */}

                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="Masukkan password"
                      required
                      autoComplete="current-password"
                      className="
                        h-full
                        min-w-0
                        flex-1
                        border-0
                        bg-transparent
                        px-4
                        text-sm
                        text-slate-800
                        outline-none
                        placeholder:text-slate-400
                      "
                    />


                    {/* MATA */}

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (current) => !current
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Sembunyikan password"
                          : "Tampilkan password"
                      }
                      className="
                        mr-1.5
                        flex
                        h-10
                        w-10
                        shrink-0
                        cursor-pointer
                        items-center
                        justify-center
                        rounded-xl
                        text-slate-400
                        transition-all
                        duration-200
                        ease-out
                        hover:scale-105
                        hover:bg-blue-50
                        hover:text-blue-600
                        active:scale-90
                        active:bg-blue-100
                      "
                    >

                      {showPassword ? (

                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-5 w-5"
                        >

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 3l18 18"
                          />

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10.5 10.5a2 2 0 0 0 3 3"
                          />

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.8 5.3A10.7 10.7 0 0 1 12 5c5.3 0 8.7 4.3 9.8 6.2a1.5 1.5 0 0 1 0 1.6 15.5 15.5 0 0 1-3.2 3.7"
                          />

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.2 6.3A15.5 15.5 0 0 0 2.2 11.2a1.5 1.5 0 0 0 0 1.6C3.3 14.7 6.7 19 12 19c1 0 2-.2 2.9-.5"
                          />

                        </svg>

                      ) : (

                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-5 w-5"
                        >

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
                          />

                          <circle
                            cx="12"
                            cy="12"
                            r="2.5"
                          />

                        </svg>

                      )}

                    </button>

                  </div>

                </div>


                {/* =====================================================
                    REMEMBER ME
                    ===================================================== */}

                <label
                  className="
                    group
                    flex
                    cursor-pointer
                    items-center
                    gap-2.5
                    text-sm
                    text-slate-500
                  "
                >

                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(
                        e.target.checked
                      )
                    }
                    className="
                      h-4
                      w-4
                      cursor-pointer
                      rounded
                      border-slate-300
                      text-blue-600
                      focus:ring-blue-500
                      focus:ring-offset-0
                    "
                  />

                  <span className="transition-colors duration-200 group-hover:text-slate-700">
                    Ingat saya
                  </span>

                </label>


                {/* =====================================================
                    ERROR
                    ===================================================== */}

                {error && (

                  <div
                    className="
                      flex
                      items-start
                      gap-3
                      rounded-2xl
                      border
                      border-red-100
                      bg-red-50
                      px-4
                      py-3.5
                    "
                  >

                    <div
                      className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-red-100
                        font-black
                        text-red-600
                      "
                    >
                      !
                    </div>

                    <p className="pt-1 text-xs leading-5 text-red-600">
                      {error}
                    </p>

                  </div>

                )}


                {/* =====================================================
                    LOGIN BUTTON
                    ===================================================== */}

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    group
                    relative
                    flex
                    w-full
                    cursor-pointer
                    items-center
                    justify-center
                    gap-2
                    overflow-hidden
                    rounded-2xl
                    bg-gradient-to-r
                    from-blue-950
                    via-blue-700
                    to-blue-600
                    px-5
                    py-4
                    font-bold
                    text-white
                    shadow-lg
                    shadow-blue-700/20
                    transition-all
                    duration-300
                    ease-out
                    hover:-translate-y-1
                    hover:shadow-xl
                    hover:shadow-blue-700/30
                    active:translate-y-0
                    active:scale-[0.98]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  {/* Shine */}

                  <span
                    className="
                      pointer-events-none
                      absolute
                      inset-y-0
                      left-0
                      w-1/3
                      -translate-x-[180%]
                      skew-x-[-20deg]
                      bg-white/10
                      transition-transform
                      duration-700
                      group-hover:translate-x-[420%]
                    "
                  />


                  <span className="relative flex items-center gap-2">

                    {loading ? (

                      <>

                        <span
                          className="
                            h-5
                            w-5
                            animate-spin
                            rounded-full
                            border-2
                            border-white/30
                            border-t-white
                          "
                        />

                        <span>
                          {adminMode
                            ? "Memeriksa akses..."
                            : "Memproses..."}
                        </span>

                      </>

                    ) : (

                      <>

                        <span>
                          {adminMode
                            ? "Masuk sebagai Administrator"
                            : "Masuk"}
                        </span>

                        <span className="transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>

                      </>

                    )}

                  </span>

                </button>

              </form>


              {/* =====================================================
                  ADMINISTRATOR
                  ===================================================== */}

              <div className="relative my-7">

                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100" />
                </div>

                <div className="relative flex justify-center">

                  <span className="bg-white px-4 text-[11px] font-medium text-slate-400">
                    {adminMode
                      ? "Akses umum"
                      : "Akses khusus administrator"}
                  </span>

                </div>

              </div>


              <button
                type="button"
                onClick={toggleAdminMode}
                className="
                  group
                  flex
                  w-full
                  cursor-pointer
                  items-center
                  justify-center
                  gap-3
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  px-5
                  py-3.5
                  text-sm
                  font-bold
                  text-slate-700
                  shadow-sm
                  transition-all
                  duration-300
                  ease-out
                  hover:-translate-y-1
                  hover:border-blue-300
                  hover:bg-blue-50
                  hover:text-blue-700
                  hover:shadow-lg
                  active:translate-y-0
                  active:scale-[0.98]
                "
              >

                <span
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-xl
                    bg-slate-100
                    text-slate-500
                    transition-all
                    duration-300
                    group-hover:scale-110
                    group-hover:bg-blue-100
                    group-hover:text-blue-600
                  "
                >

                  {adminMode ? (

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-4 w-4"
                    >

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m15 18-6-6 6-6"
                      />

                    </svg>

                  ) : (

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-4 w-4"
                    >

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 3 4.5 6v5.5c0 4.7 3.1 7.9 7.5 9.5 4.4-1.6 7.5-4.8 7.5-9.5V6L12 3Z"
                      />

                    </svg>

                  )}

                </span>


                <span>
                  {adminMode
                    ? "Kembali ke Login Walisantri"
                    : "Masuk sebagai Administrator"}
                </span>


                {!adminMode && (

                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>

                )}

              </button>


              {/* =====================================================
                  REGISTER
                  ===================================================== */}

              {!adminMode && (

                <>

                  <div className="relative my-7">

                    <div className="absolute inset-0 flex items-center">

                      <div className="w-full border-t border-slate-100" />

                    </div>


                    <div className="relative flex justify-center">

                      <span className="bg-white px-4 text-[11px] font-medium text-slate-400">
                        Belum memiliki akun?
                      </span>

                    </div>

                  </div>


                  <Link
                    href="/daftar"
                    className="
                      group
                      flex
                      w-full
                      cursor-pointer
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      px-5
                      py-3.5
                      text-sm
                      font-bold
                      text-slate-700
                      shadow-sm
                      transition-all
                      duration-300
                      ease-out
                      hover:-translate-y-1
                      hover:border-blue-300
                      hover:bg-blue-50
                      hover:text-blue-700
                      hover:shadow-lg
                      active:translate-y-0
                      active:scale-[0.98]
                    "
                  >

                    <span>
                      Daftar sebagai Walisantri
                    </span>

                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>

                  </Link>

                </>

              )}


              {/* =====================================================
                  FOOTER
                  ===================================================== */}

              <div className="mt-7 border-t border-slate-100 pt-6 text-center">

                <p className="text-[11px] font-bold tracking-wide text-slate-400">
                  INIBS Smart Digital
                </p>

                <p className="mt-1 text-[10px] text-slate-400">
                  Mendidik dengan Ilmu, Membina dengan Akhlak
                </p>

              </div>

            </div>

          </div>


          {/* COPYRIGHT */}

          <p className="mt-5 text-center text-[10px] font-medium text-white/45">
            © 2026 Imam Nawawi Islamic Boarding School
          </p>

        </div>

      </div>

    </main>
  )
}