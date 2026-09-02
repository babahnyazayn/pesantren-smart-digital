"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

type ApplicationData = {
  id: string
  nama_lengkap: string | null
  status: string | null
  nomor_pendaftaran: string | null
}

export default function SelesaiPage() {
  const router = useRouter()

  const [application, setApplication] =
    useState<ApplicationData | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  const supabase =
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )

  // =========================================================
  // LOAD DATA PENDAFTARAN
  // =========================================================

  useEffect(() => {
    async function loadApplication() {
      try {
        setLoading(true)
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
          router.replace("/login")
          return
        }

        const {
          data,
          error: applicationError,
        } = await supabase
          .from("ppdb_applications")
          .select(
            "id, nama_lengkap, status, nomor_pendaftaran"
          )
          .eq(
            "user_id",
            user.id
          )
          .maybeSingle()

        if (applicationError) {
          throw new Error(
            `Gagal mengambil data pendaftaran: ${applicationError.message}`
          )
        }

        if (!data) {
          throw new Error(
            "Data pendaftaran tidak ditemukan."
          )
        }

        setApplication(data)
      } catch (err: any) {
        console.error(
          "ERROR LOAD SELESAI:",
          err
        )

        setError(
          err?.message ||
            "Data pendaftaran gagal dimuat."
        )
      } finally {
        setLoading(false)
      }
    }

    loadApplication()
  }, [router, supabase])

  // =========================================================
  // NOMOR PENDAFTARAN
  // =========================================================

  function getRegistrationNumber() {
    if (!application) {
      return "-"
    }

    if (
      application.nomor_pendaftaran &&
      application.nomor_pendaftaran.trim() !== ""
    ) {
      return application.nomor_pendaftaran
    }

    return "Nomor belum tersedia"
  }

  // =========================================================
  // STATUS PENDAFTARAN
  // =========================================================

  function getStatusLabel() {
    const status =
      application?.status

    switch (status) {
      case "DRAFT":
        return "Draft"

      case "MENUNGGU":
        return "Menunggu Verifikasi"

      case "VERIFIKASI":
        return "Sedang Diverifikasi"

      case "SELEKSI":
        return "Tahap Seleksi"

      case "DITERIMA":
        return "Diterima"

      case "DITOLAK":
        return "Tidak Lolos"

      default:
        return status || "-"
    }
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef4fa]">

        <div className="relative z-10 text-center">

          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-[3px] border-blue-100 border-t-[#174f91] shadow-sm" />

          <p className="mt-4 text-sm font-semibold text-[#647489]">
            Memuat informasi pendaftaran...
          </p>

        </div>

      </main>
    )
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef4fa] px-5">

        <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/90 bg-white/94 p-8 text-center shadow-[0_24px_70px_rgba(7,26,54,0.08)] backdrop-blur-xl">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-red-50 text-xl font-black text-red-600 ring-1 ring-red-100 shadow-sm">
            !
          </div>

          <h1 className="mt-5 text-xl font-black tracking-tight text-[#071a36]">
            Data Tidak Ditemukan
          </h1>

          <p className="mt-2 text-sm leading-7 text-[#697787]">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/ppdb")
            }
            className="mt-6 rounded-2xl bg-gradient-to-r from-[#0d3b72] via-[#174f91] to-[#2675bd] px-6 py-3.5 text-sm font-black text-white shadow-[0_12px_30px_rgba(23,79,145,0.22)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(23,79,145,0.28)]"
          >
            Kembali ke PPDB
          </button>

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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.98),transparent_36%),radial-gradient(circle_at_8%_34%,rgba(37,99,235,0.10),transparent_28%),radial-gradient(circle_at_94%_52%,rgba(6,182,212,0.08),transparent_30%)]" />
        <div className="absolute -left-48 top-20 h-96 w-96 rounded-full bg-blue-300/10 blur-3xl edu-float" />
        <div className="absolute -right-44 top-52 h-96 w-96 rounded-full bg-cyan-300/10 blur-3xl edu-float-reverse" />
        <div className="absolute left-[12%] top-[30%] h-20 w-20 rounded-full border border-white/60 bg-white/20 backdrop-blur-sm edu-pulse" />
        <div className="absolute right-[10%] top-[62%] h-14 w-14 rounded-full border border-blue-200/45 bg-blue-100/20 backdrop-blur-sm edu-pulse [animation-delay:1s]" />
      </div>


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="relative z-10 border-b border-white/70 bg-white/84 backdrop-blur-2xl shadow-[0_12px_38px_rgba(7,26,54,0.05)]">

        <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8">

          <div className="flex items-center justify-between gap-6">

            <div>

              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#245ea8]">
                INIBS SMART DIGITAL
              </p>

              <h1 className="mt-1 text-2xl font-black tracking-tight text-[#071a36] sm:text-3xl">
                PPDB 2027/2028
              </h1>

            </div>

            <div className="hidden text-right sm:block">

              <p className="text-sm font-black text-[#071a36]">
                Imam Nawawi Islamic Boarding School
              </p>

              <p className="mt-1 text-xs text-[#7a8a9a]">
                Pendaftaran Santri Baru
              </p>

            </div>

          </div>

        </div>

      </header>

      {/* =====================================================
          PROGRESS
      ===================================================== */}

      <section className="relative z-10 border-b border-white/70 bg-white/78 shadow-sm backdrop-blur-xl">

        <div className="mx-auto max-w-6xl px-5 py-7 sm:px-8">

          <div className="overflow-x-auto">

            <div className="flex min-w-[720px] items-center">

              <ProgressStep
                number="1"
                title="Data Santri"
              />

              <ProgressLine />

              <ProgressStep
                number="2"
                title="Orang Tua / Wali"
              />

              <ProgressLine />

              <ProgressStep
                number="3"
                title="Pendidikan"
              />

              <ProgressLine />

              <ProgressStep
                number="4"
                title="Berkas"
              />

              <ProgressLine />

              <ProgressStep
                number="5"
                title="Pernyataan"
              />

              <ProgressLine />

              <div className="flex items-center">

                <div className="edu-complete flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#2c806a] to-[#3d9b7d] text-sm font-black text-white shadow-[0_10px_28px_rgba(61,155,125,0.22)]">
                  ✓
                </div>

                <div className="ml-3">

                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#3d8a72]">
                    Tahap 6
                  </p>

                  <p className="text-sm font-black text-[#071a36]">
                    Selesai
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="relative z-10 mx-auto max-w-4xl px-5 py-12 sm:px-8">

        {/* SUCCESS */}

        <div className="text-center edu-reveal">

          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] border border-emerald-100 bg-white/90 shadow-[0_18px_45px_rgba(61,155,125,0.12)] edu-success-ring">

            <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-[#2c806a] to-[#3d9b7d] text-2xl font-black text-white shadow-[0_10px_30px_rgba(61,155,125,0.22)]">
              ✓
            </div>

          </div>

          <p className="mt-7 text-[10px] font-black uppercase tracking-[0.22em] text-[#3d8a72]">
            Pendaftaran Berhasil
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#071a36] sm:text-5xl">
            Alhamdulillah, Pendaftaran Selesai
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#697787] sm:text-base">
            Data pendaftaran calon santri telah berhasil
            diterima oleh sistem. Simpan nomor pendaftaran
            untuk digunakan pada proses selanjutnya.
          </p>

        </div>

        {/* NOMOR PENDAFTARAN */}

        <div className="edu-card-shine mt-9 rounded-[2rem] border border-blue-100 bg-[#f7fbff]/95 p-6 text-center shadow-[0_22px_65px_rgba(23,79,145,0.08)] backdrop-blur-xl sm:p-9">

          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#245ea8]">
            Nomor Pendaftaran
          </p>

          <p className="mt-3 break-all text-2xl font-black tracking-[0.12em] text-[#071a36] sm:text-4xl">
            {getRegistrationNumber()}
          </p>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            Simpan nomor ini untuk memantau proses
            pendaftaran Anda.
          </p>

        </div>

        {/* DATA PENDAFTAR */}

        <div className="edu-card-shine mt-6 rounded-[1.9rem] border border-white/90 bg-white/94 p-6 shadow-[0_18px_55px_rgba(7,26,54,0.06)] backdrop-blur-xl sm:p-8">

          <h3 className="text-lg font-black tracking-tight text-[#071a36]">
            Informasi Pendaftaran
          </h3>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">

            <InfoItem
              label="Nama Calon Santri"
              value={
                application?.nama_lengkap
              }
            />

            <InfoItem
              label="Status Pendaftaran"
              value={getStatusLabel()}
            />

          </div>

        </div>

        {/* STATUS */}

        <div className="edu-card-shine mt-6 rounded-[1.9rem] border border-white/90 bg-white/94 p-6 shadow-[0_18px_55px_rgba(7,26,54,0.06)] backdrop-blur-xl sm:p-8">

          <h3 className="text-lg font-black tracking-tight text-[#071a36]">
            Status Pendaftaran
          </h3>

          <div className="mt-6 space-y-4">

            {/* FORMULIR */}

            <StatusItem
              number="1"
              active={true}
              title="Formulir Berhasil Diisi"
              description="Data calon santri telah diterima oleh sistem."
            />

            {/* VERIFIKASI */}

            <StatusItem
              number="2"
              active={
                application?.status ===
                  "MENUNGGU" ||
                application?.status ===
                  "VERIFIKASI" ||
                application?.status ===
                  "SELEKSI" ||
                application?.status ===
                  "DITERIMA"
              }
              title="Menunggu Verifikasi"
              description="Panitia akan memeriksa data dan dokumen pendaftaran."
            />

            {/* SELEKSI */}

            <StatusItem
              number="3"
              active={
                application?.status ===
                  "SELEKSI" ||
                application?.status ===
                  "DITERIMA"
              }
              title="Seleksi / Tahap Berikutnya"
              description="Informasi seleksi akan tersedia setelah proses verifikasi."
            />

            {/* DITERIMA */}

            {application?.status ===
              "DITERIMA" && (
              <StatusItem
                number="4"
                active={true}
                title="Diterima"
                description="Selamat. Calon santri dinyatakan diterima."
              />
            )}

            {/* DITOLAK */}

            {application?.status ===
              "DITOLAK" && (
              <StatusItem
                number="4"
                active={true}
                danger={true}
                title="Tidak Lolos"
                description="Pendaftaran tidak dilanjutkan berdasarkan hasil seleksi."
              />
            )}

          </div>

        </div>

        {/* INFORMASI PENTING */}

        <div className="edu-note mt-6 rounded-[1.55rem] border border-amber-100 bg-[#fffaf0] p-5 shadow-sm">

          <div className="flex gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white font-black text-amber-700 ring-1 ring-amber-100 shadow-sm">
              !
            </div>

            <div>

              <h3 className="font-semibold text-slate-900">
                Perhatian
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Simpan nomor pendaftaran Anda. Nomor tersebut
                akan digunakan untuk memantau perkembangan
                proses PPDB.
              </p>

            </div>

          </div>

        </div>

        {/* BUTTON */}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">

          <button
            type="button"
            onClick={() =>
              router.push("/ppdb")
            }
            className="group rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-100 hover:bg-[#f8fbfe] hover:shadow-md active:scale-[0.98]"
          >
            Kembali ke PPDB
          </button>

          <button
            type="button"
            onClick={() =>
              router.push("/")
            }
            className="group rounded-2xl bg-gradient-to-r from-[#0d3b72] via-[#174f91] to-[#2675bd] px-7 py-3.5 text-sm font-black text-white shadow-[0_14px_34px_rgba(23,79,145,0.24)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(23,79,145,0.30)] active:scale-[0.98]"
          >
            Kembali ke Beranda
          </button>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="relative z-10 border-t border-white/10 bg-[#071a36] text-white">

        <div className="mx-auto max-w-4xl px-5 py-8 text-center sm:px-8">

          <p className="text-sm font-black tracking-[0.06em] text-white">
            INIBS Smart Digital
          </p>

          <p className="mt-1 text-[10px] font-medium text-[#7b8a9b]">
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

        .edu-reveal {
          animation: eduReveal 900ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .edu-complete {
          animation: eduComplete 800ms ease-out both;
        }

        .edu-success-ring {
          animation: eduSuccess 4.5s ease-in-out infinite;
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
            rgba(255,255,255,0.34),
            transparent
          );
          transition: left 1s cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
        }

        .edu-card-shine:hover {
          transform: translateY(-5px);
          border-color: rgba(191,219,254,0.95);
          box-shadow: 0 30px 76px rgba(7,26,54,0.10);
        }

        .edu-card-shine:hover::after {
          left: 140%;
        }

        .edu-note {
          animation: eduReveal 700ms 120ms cubic-bezier(0.22, 1, 0.36, 1) both;
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

        @keyframes eduComplete {
          from { opacity: 0; transform: scale(0.76); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes eduSuccess {
          0%, 100% {
            transform: translateY(0);
            box-shadow: 0 18px 45px rgba(61,155,125,0.10);
          }
          50% {
            transform: translateY(-3px);
            box-shadow: 0 24px 55px rgba(61,155,125,0.17);
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

// ===========================================================
// PROGRESS STEP
// ===========================================================

function ProgressStep({
  number,
  title,
}: {
  number: string
  title: string
}) {
  return (
    <div className="flex items-center">

      <div className="edu-step-sub flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#174f91] to-[#2675bd] text-sm font-black text-white shadow-[0_8px_24px_rgba(23,79,145,0.18)]">
        ✓
      </div>

      <div className="ml-3">

        <p className="text-[10px] font-medium text-[#7b8a9b]">
          Tahap {number}
        </p>

        <p className="text-sm font-black text-[#34465a]">
          {title}
        </p>

      </div>

    </div>
  )
}

// ===========================================================
// PROGRESS LINE
// ===========================================================

function ProgressLine() {
  return (
    <div className="mx-5 h-px flex-1 bg-blue-200" />
  )
}

// ===========================================================
// INFO ITEM
// ===========================================================

function InfoItem({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <div>

      <p className="text-[11px] font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-700">
        {value || "-"}
      </p>

    </div>
  )
}

// ===========================================================
// STATUS ITEM
// ===========================================================

function StatusItem({
  number,
  active,
  danger = false,
  title,
  description,
}: {
  number: string
  active: boolean
  danger?: boolean
  title: string
  description: string
}) {

  if (active && danger) {
    return (
      <div className="flex items-center gap-4">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-sm font-black text-red-600 ring-1 ring-red-100 shadow-sm">
          !
        </div>

        <div>

          <p className="font-semibold text-red-700">
            {title}
          </p>

          <p className="text-xs text-slate-500">
            {description}
          </p>

        </div>

      </div>
    )
  }

  if (active) {
    return (
      <div className="flex items-center gap-4">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-sm font-black text-emerald-600 ring-1 ring-emerald-100 shadow-sm">
          ✓
        </div>

        <div>

          <p className="font-semibold text-slate-800">
            {title}
          </p>

          <p className="text-xs text-slate-500">
            {description}
          </p>

        </div>

      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f4f8fc] text-sm font-black text-slate-400 ring-1 ring-slate-200">
        {number}
      </div>

      <div>

        <p className="font-semibold text-slate-400">
          {title}
        </p>

        <p className="text-xs text-slate-400">
          {description}
        </p>

      </div>

    </div>
  )
}