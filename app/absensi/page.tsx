import { createClient } from "@/lib/supabase/server"

export default async function AbsensiPage() {
  const supabase = await createClient()

  const { data: attendance, error } = await supabase
    .from("attendance")
    .select("attendance_date, status")
    .eq("student_id", 1)
    .order("attendance_date", { ascending: true })

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <h1 className="text-2xl font-bold text-red-600">
          Terjadi kesalahan
        </h1>

        <p className="mt-3 text-slate-600">
          {error.message}
        </p>
      </main>
    )
  }

  const total = attendance?.length ?? 0

  const hadir =
    attendance?.filter((item) => item.status === "hadir").length ?? 0

  const persentase =
    total > 0 ? Math.round((hadir / total) * 100) : 0

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-blue-700 text-white">
        <div className="mx-auto max-w-4xl px-6 py-5">
          <p className="text-sm text-blue-100">
            INIBS SMART DIGITAL
          </p>

          <h1 className="mt-1 text-2xl font-bold">
            Absensi Santri
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-8">

        {/* Summary */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Kehadiran Bulan Ini
          </p>

          <div className="mt-2 flex items-end gap-2">
            <h2 className="text-4xl font-bold text-blue-700">
              {persentase}%
            </h2>

            <p className="mb-1 text-sm text-slate-500">
              {hadir} dari {total} hari
            </p>
          </div>
        </section>

        {/* Attendance List */}
        <section className="mt-6">
          <h2 className="mb-4 text-lg font-bold text-slate-800">
            Riwayat Kehadiran
          </h2>

          <div className="space-y-3">
            {attendance?.map((item) => (
              <div
                key={item.attendance_date}
                className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm"
              >
                <div>
                  <p className="font-semibold text-slate-800">
                    {new Date(
                      item.attendance_date
                    ).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <span
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    item.status === "hadir"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {item.status === "hadir"
                    ? "✓ Hadir"
                    : "Izin"}
                </span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  )
}