"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"

const pillars = [
  {
    number: "01",
    title: "Islamic Foundation",
    focus: "Aqidah, Al-Qur'an, Fiqih, Akhlak, Hadits, Sirah & Islamic Studies",
    icon: <IslamIcon />,
  },
  {
    number: "02",
    title: "Academic Foundation",
    focus: "Pendidikan umum, Bahasa Arab, Bahasa Inggris, ilmu pengetahuan & wawasan akademik",
    icon: <AcademicIcon />,
  },
  {
    number: "03",
    title: "Technology Integration",
    focus: "Digital Literacy, AI, Coding, Data, Digital Creation & Technology-Integrated Learning",
    icon: <TechnologyIcon />,
  },
  {
    number: "04",
    title: "Character & Future Skills",
    focus: "Adab, Critical Thinking, Communication, Creativity, Leadership, Entrepreneurship & Life Skills",
    icon: <FutureIcon />,
  },
]

const flagshipPrograms = [
  {
    title: "One Student, One Device",
    subtitle: "Technology Integration",
    text: "Setiap santri wajib membawa laptop pribadi dari rumah sebagai bagian dari pembelajaran berbasis teknologi.",
    icon: <LaptopIcon />,
  },
  {
    title: "Nawawi Fikr",
    subtitle: "Critical Thinking & World Literacy",
    text: "Forum intelektual pekanan untuk membahas persoalan keislaman, ilmu pengetahuan, teknologi, ekonomi, sosial, budaya, dan isu dunia.",
    icon: <IdeaIcon />,
  },
  {
    title: "Tahfizh, Arabic & Islamic Studies",
    subtitle: "Islamic Foundation",
    text: "Penguatan Al-Qur'an, Tahfizh, Bahasa Arab, Fiqih, Aqidah, Akhlak, Hadits, Sirah, dan kajian keislaman.",
    icon: <QuranIcon />,
  },
  {
    title: "English for Global Communication",
    subtitle: "Academic & Global Communication",
    text: "Pengembangan Bahasa Inggris sebagai bekal komunikasi dan wawasan global.",
    icon: <GlobeIcon />,
  },
  {
    title: "Life Skills",
    subtitle: "Sport & Martial Arts",
    text: "Pembiasaan hidup mandiri, disiplin, sehat, tangguh, dan bertanggung jawab.",
    icon: <ActivityIcon />,
  },
  {
    title: "Leadership",
    subtitle: "Public Speaking",
    text: "Membangun keberanian berbicara, komunikasi, kerja sama, kepemimpinan, dan tanggung jawab.",
    icon: <LeadershipIcon />,
  },
]

const facilities = [
  {
    title: "Kelas Ber-AC",
    text: "Ruang belajar yang nyaman untuk mendukung fokus dan proses pembelajaran.",
    icon: <ClassroomIcon />,
  },
  {
    title: "Asrama Ber-AC",
    text: "Lingkungan asrama yang nyaman untuk istirahat dan pembinaan kehidupan santri.",
    icon: <DormIcon />,
  },
  {
    title: "Bunk Bed",
    text: "Ranjang susun yang tertata untuk mendukung kerapian dan efisiensi ruang.",
    icon: <BedIcon />,
  },
  {
    title: "Personal Locker",
    text: "Setiap santri memiliki ruang penyimpanan pribadi untuk menjaga kerapian dan tanggung jawab.",
    icon: <LockerIcon />,
  },
  {
    title: "Laundry Santri",
    text: "Layanan laundry untuk membantu menjaga kebersihan dan kerapian pakaian santri.",
    icon: <LaundryIcon />,
  },
  {
    title: "Digital Learning Environment",
    text: "Lingkungan belajar yang mendukung ITIE dan penggunaan teknologi secara terarah.",
    icon: <TechnologyIcon />,
  },
]

const outingPrograms = [
  {
    term: "T1",
    title: "Taman Nasional Baluran",
    text: "Eksplorasi alam, lingkungan, dan keanekaragaman hayati.",
    icon: <NatureIcon />,
  },
  {
    term: "T2",
    title: "GWD / Bangsring & Snorkeling",
    text: "Pengalaman belajar ekosistem pesisir dan laut.",
    icon: <OceanIcon />,
  },
  {
    term: "T3",
    title: "Pulau Merah & Djawatan",
    text: "Eksplorasi alam dan pembelajaran berbasis pengalaman.",
    icon: <ExploreIcon />,
  },
  {
    term: "T4",
    title: "Destinasi Edukatif Pilihan",
    text: "Disesuaikan dengan tema pembelajaran dan kesiapan kegiatan.",
    icon: <CompassIcon />,
  },
]

const outcomes = [
  "Minimal 5 Juz Al-Qur'an",
  "Bahasa Arab aktif dan pasif",
  "Matan Fiqh & Aqidah Klasik",
  "Hadits Arbain Nawawiyah",
  "Literasi teknologi dan keterampilan masa depan",
  "Karakter, adab, kemandirian, dan kepemimpinan",
]


const dailySchedule = [
  ["04.00 – 04.30", "Wake Up & Tahajjud"],
  ["04.30 – 05.00", "Congregational Fajr Prayer"],
  ["05.00 – 06.00", "Morning Tahfizh"],
  ["06.00 – 07.00", "Breakfast & School Preparation"],
  ["07.00 – 07.15", "Morning Assembly"],
  ["07.15 – 14.20", "Academic Learning"],
  ["14.20 – 15.30", "Prayer, Lunch & Rest"],
  ["15.30 – 17.00", "Extracurricular Activities & Physical Training"],
  ["17.00 – 17.45", "Shower, Preparation & Maghrib Prayer"],
  ["17.45 – 18.30", "Tahfizh & Qur'an Study"],
  ["18.30 – 18.45", "Congregational Isha Prayer"],
  ["18.45 – 20.05", "Evening Learning Program"],
  ["20.05 – 21.00", "Independent Study"],
  ["21.00 – 04.00", "Rest & Sleep"],
]


const nightPrograms = [
  "Kajian Islam",
  "Bahasa Arab",
  "Hifdz al-Mutun",
  "Teknologi & AI",
  "Majlis Nawawi Fikr",
  "Leadership & Muhadharah",
  "Kepemimpinan & Kecakapan Hidup",
]

const educationPartnership = {
  title: "Education Pathway",
  subtitle: "Jalur Pendidikan & Kelulusan",
  organization: "PKBM Alizah Banyuwangi",
  accreditation: "Akreditasi B",
  text:
    "INIBS bekerja sama dengan PKBM Alizah Banyuwangi untuk mendukung jalur pendidikan kesetaraan bagi santri, sehingga proses pendidikan di pesantren tetap memiliki arah kelulusan yang jelas.",
  pathways: [
    {
      level: "SMP/MTs",
      equivalency: "Paket B",
      icon: <SchoolPathIcon />,
    },
    {
      level: "SMA/MA",
      equivalency: "Paket C",
      icon: <GraduationIcon />,
    },
  ],
}

export default function MengenalINIBSPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 60)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#edf4fa] text-[#10233f] selection:bg-blue-100 selection:text-[#071a36]">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <Image
          src="/images/ppdb-background.png"
          alt="Imam Nawawi Islamic Boarding School"
          fill
          priority
          className="object-cover object-center opacity-[0.88]"
        />
        <div className="absolute inset-0 bg-white/70" />
        <div className="absolute inset-0 bg-[#071a36]/[0.06]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(248,251,255,0.05),rgba(238,246,252,0.45)_43%,rgba(238,246,252,0.99)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.9),transparent_38%),radial-gradient(circle_at_8%_35%,rgba(37,99,235,0.10),transparent_28%),radial-gradient(circle_at_92%_46%,rgba(6,182,212,0.08),transparent_30%)]" />
        <div className="absolute -left-48 top-16 h-96 w-96 rounded-full bg-blue-300/10 blur-3xl animate-pulse" />
        <div className="absolute -right-44 top-44 h-96 w-96 rounded-full bg-cyan-300/10 blur-3xl animate-pulse [animation-delay:900ms]" />
        <div className="absolute left-[10%] top-[23%] h-24 w-24 rounded-full border border-white/50 bg-white/15 ppdb-float backdrop-blur-sm" />
        <div className="absolute right-[9%] top-[57%] h-16 w-16 rounded-full border border-blue-200/35 bg-blue-200/10 ppdb-float [animation-delay:1200ms]" />
      </div>

      <div className="relative z-10">
        <header
          className={`sticky top-0 z-50 border-b border-white/70 bg-white/84 backdrop-blur-2xl transition-all duration-700 ${
            mounted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <Link
              href="/pilih-layanan"
              className="group flex items-center gap-3 rounded-2xl px-2 py-1.5 transition-all duration-300 hover:bg-white/80"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-white p-1.5 shadow-sm transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/logo-imam.png"
                  alt="Logo Imam Nawawi"
                  width={45}
                  height={45}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#245ea8]">
                  INIBS SMART DIGITAL
                </p>
                <p className="truncate text-sm font-black text-[#071a36]">
                  Mengenal INIBS
                </p>
              </div>
            </Link>

            <Link
              href="/pilih-layanan"
              className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-blue-100 bg-white/82 px-4 py-2.5 text-xs font-black text-[#174f91] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-xl active:scale-[0.98]"
            >
              <ArrowLeftIcon />
              <span className="hidden sm:inline">Kembali ke Beranda</span>
            </Link>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
          <section
            className={`mx-auto max-w-5xl text-center transition-all duration-1000 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2.1rem] border border-white/90 bg-white/94 p-3 shadow-[0_24px_70px_rgba(7,26,54,0.10)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:scale-105 inibs-logo-breathe">
              <Image
                src="/logo-imam.png"
                alt="Imam Nawawi Islamic Boarding School"
                width={80}
                height={80}
                className="h-full w-full object-contain"
                priority
              />
            </div>

            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-[#245ea8] sm:text-xs">
              Imam Nawawi Islamic Boarding School
            </p>

            <h1 className="mt-3 bg-gradient-to-r from-[#071a36] via-[#123e70] to-[#2675bd] bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-6xl">
              Mengenal INIBS
            </h1>

            <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-[#5d7895] sm:text-sm">
              Islamic Technology Integrated Education
            </p>

            <div className="mx-auto mt-4 flex max-w-fit items-center gap-2 rounded-full border border-blue-100 bg-white/72 px-3.5 py-1.5 text-[8px] font-black uppercase tracking-[0.18em] text-[#6b7f95] shadow-sm backdrop-blur-md">
              Faith • Knowledge • Technology • Future Skills
            </div>

            <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-[#586b81] sm:text-base">
              Pendidikan boarding school yang memadukan pendidikan Islam,
              pendidikan umum, teknologi, karakter, dan keterampilan masa depan
              dalam satu lingkungan pembinaan.
            </p>
            <div className="mx-auto mt-5 flex items-center justify-center gap-3">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-blue-500/60 sm:w-16" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#2675bd] inibs-soft-pulse" />
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-blue-500/60 sm:w-16" />
            </div>

          </section>

          <section className="mx-auto mt-10 max-w-5xl">
            <div className="relative overflow-hidden rounded-[2.1rem] bg-gradient-to-br from-[#071a36] via-[#123e70] to-[#2675bd] p-7 inibs-hero-glow text-white shadow-[0_24px_70px_rgba(7,26,54,0.16)] sm:p-10">
              <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />
              <div className="relative z-10 grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-200">
                    Educational Direction
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">
                    Membentuk Santri Berilmu, Beradab, dan Cakap Teknologi
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100">
                    INIBS membangun lingkungan pendidikan yang menguatkan iman,
                    memperluas ilmu, membentuk adab, mengembangkan keterampilan,
                    dan mempersiapkan santri menghadapi perubahan zaman.
                  </p>
                </div>

                <div className="rounded-[1.7rem] border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                  <p className="text-[8px] font-black uppercase tracking-[0.18em] text-blue-200">
                    ITIE
                  </p>
                  <p className="mt-2 text-xl font-black">
                    Integrating Faith, Knowledge, Technology & Future Skills
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto mt-10 max-w-5xl">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 h-px w-16 bg-gradient-to-r from-transparent via-[#2675bd]/45 to-transparent inibs-rule" />
              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#245ea8]">
                Four Pillars of ITIE
              </p>
              <p className="mt-1 text-[10px] font-semibold text-[#6c8095]">
                4 Pilar ITIE
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-[#071a36] sm:text-3xl">
                Empat Fondasi Pendidikan INIBS
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {pillars.map((pillar, index) => (
                <article
                  key={pillar.title}
                  className="group inibs-card-shine inibs-premium-card rounded-[1.9rem] border border-white/90 bg-white/94 p-6 shadow-[0_18px_55px_rgba(7,26,54,0.07)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_78px_rgba(7,26,54,0.12)]"
                  style={{
                    animation: "inibsFadeUp 700ms ease-out both",
                    animationDelay: `${index * 90}ms`,
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf4fb] text-[#245ea8] ring-1 ring-blue-100 shadow-sm transition-all duration-500 group-hover:scale-105 group-hover:rotate-1">
                      {pillar.icon}
                    </div>
                    <span className="rounded-full bg-[#f4f8fc] px-2.5 py-1 text-[8px] font-black tracking-[0.15em] text-[#6c8095]">
                      {pillar.number}
                    </span>
                  </div>
                  <p className="mt-5 text-[8px] font-black uppercase tracking-[0.2em] text-[#245ea8]">
                    Pilar ITIE
                  </p>
                  <h3 className="mt-1 text-xl font-black text-[#071a36]">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#697787]">
                    {pillar.focus}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="mx-auto mt-10 max-w-5xl">
            <div className="inibs-card-shine inibs-premium-card inibs-scroll-glow rounded-[2rem] border border-white/90 bg-white/94 p-7 shadow-[0_18px_55px_rgba(7,26,54,0.07)] backdrop-blur-xl sm:p-9">
              <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf4fb] text-[#245ea8] ring-1 ring-blue-100 shadow-sm">
                    <BookStackIcon />
                  </div>
                  <p className="mt-5 text-[9px] font-black uppercase tracking-[0.22em] text-[#245ea8]">
                    Integrated Curriculum
                  </p>
                <p className="mt-1 text-[10px] font-semibold text-[#6c8095]">
                  Kurikulum Terintegrasi
                </p>
                  <h2 className="mt-2 text-2xl font-black text-[#071a36] sm:text-3xl">
                    Umum + Agama + Teknologi
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[#697787]">
                    Kurikulum pendidikan umum dan pendidikan agama berjalan
                    bersama. ITIE menghubungkan proses belajar dengan teknologi
                    agar santri mampu belajar, meneliti, membuat karya, dan
                    menggunakan teknologi secara produktif dan beretika.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "Pendidikan umum",
                    "Pendidikan keislaman",
                    "Bahasa Arab",
                    "Bahasa Inggris",
                    "Tahfizh Al-Qur'an",
                    "ITIE & Digital Learning",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-[1.25rem] border border-slate-100 bg-[#f8fbfe]/80 px-4 py-3 transition-all duration-300 hover:border-blue-100 hover:bg-white hover:shadow-sm"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[#245ea8] ring-1 ring-blue-100">
                        <CheckIcon />
                      </span>
                      <span className="text-xs font-semibold text-[#647489]">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 rounded-[1.7rem] border border-blue-100 bg-[#f7fbff] p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#245ea8] ring-1 ring-blue-100 shadow-sm">
                    <LaptopIcon />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#245ea8]">
                      One Student, One Device
                    </p>
                    <h3 className="mt-1 text-lg font-black text-[#071a36]">
                      Laptop Menjadi Bagian dari Pembelajaran
                    </h3>
                    <p className="mt-1 text-xs leading-6 text-[#697787]">
                      Setiap santri wajib membawa laptop pribadi dari rumah.
                      Perangkat digunakan sesuai kebutuhan pembelajaran dan
                      program ITIE.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto mt-10 max-w-5xl">
            <div className="relative overflow-hidden rounded-[2.1rem] border border-white/90 bg-white/94 p-7 shadow-[0_22px_65px_rgba(7,26,54,0.08)] backdrop-blur-xl sm:p-9">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-100/45 blur-3xl inibs-glow" />
              <div className="pointer-events-none absolute -left-20 -bottom-24 h-56 w-56 rounded-full bg-cyan-100/30 blur-3xl" />

              <div className="relative z-10 grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
                <div>
                  <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#edf4fb] text-[#245ea8] ring-1 ring-blue-100 shadow-sm">
                    <GraduationIcon />
                  </div>

                  <p className="mt-5 text-[9px] font-black uppercase tracking-[0.22em] text-[#245ea8]">
                    Education Pathway
                  </p>
                  <p className="mt-1 text-[10px] font-semibold text-[#6c8095]">
                    Jalur Pendidikan & Kelulusan
                  </p>

                  <h2 className="mt-2 text-2xl font-black tracking-tight text-[#071a36] sm:text-3xl">
                    {educationPartnership.title}
                  </h2>
                  <p className="mt-1 text-[10px] font-semibold text-[#6c8095]">
                    Jalur Pendidikan & Kelulusan
                  </p>

                  <p className="mt-3 text-sm leading-7 text-[#697787]">
                    {educationPartnership.text}
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-[#f7fbff] px-3.5 py-2 text-[9px] font-black uppercase tracking-[0.16em] text-[#245ea8]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2675bd]" />
                    Partnership • Jalur Pendidikan yang Terarah
                  </div>
                </div>

                <div className="rounded-[1.7rem] border border-blue-100 bg-[#f7fbff] p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#7b8ca0]">
                        Education Partner
                      </p>
                      <h3 className="mt-1 text-lg font-black text-[#071a36]">
                        {educationPartnership.organization}
                      </h3>
                    </div>

                    <span className="rounded-full border border-[#cfe3d9] bg-[#edf7f3] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-[#397564]">
                      {educationPartnership.accreditation}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {educationPartnership.pathways.map((pathway, index) => (
                      <div
                        key={pathway.level}
                        className="group rounded-[1.35rem] border border-white bg-white p-5 shadow-[0_10px_32px_rgba(7,26,54,0.045)] ring-1 ring-blue-100 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(7,26,54,0.08)]"
                        style={{
                          animation: "inibsFadeUp 700ms ease-out both",
                          animationDelay: `${index * 90}ms`,
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf4fb] text-[#245ea8] ring-1 ring-blue-100 transition-transform duration-300 group-hover:scale-105">
                            {pathway.icon}
                          </div>
                          <span className="text-[8px] font-black text-[#9aa8b6]">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </div>

                        <p className="mt-4 text-[8px] font-black uppercase tracking-[0.18em] text-[#245ea8]">
                          {pathway.level}
                        </p>

                        <h4 className="mt-1 text-xl font-black text-[#071a36]">
                          {pathway.equivalency}
                        </h4>

                        <p className="mt-2 text-[10px] leading-5 text-[#697787]">
                          Jalur pendidikan kesetaraan untuk mendukung penyelesaian pendidikan sesuai jenjang.
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex items-start gap-3 rounded-[1.25rem] border border-blue-100 bg-white px-4 py-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#edf4fb] text-[#245ea8] ring-1 ring-blue-100">
                      <CheckIcon />
                    </div>
                    <p className="text-xs leading-5 text-[#647489]">
                      Pendidikan di INIBS tetap berorientasi pada pembentukan
                      iman, ilmu, adab, dan keterampilan, dengan jalur
                      pendidikan kesetaraan yang terarah.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto mt-10 max-w-5xl">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 h-px w-16 bg-gradient-to-r from-transparent via-[#2675bd]/45 to-transparent inibs-rule" />
              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#245ea8]">
                Signature Programs
              </p>
              <p className="mt-1 text-[10px] font-semibold text-[#6c8095]">
                Program Unggulan
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-[#071a36] sm:text-3xl">
                Program ITIE INIBS
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {flagshipPrograms.map((program, index) => (
                <article
                  key={program.title}
                  className="group inibs-card-shine inibs-premium-card rounded-[1.8rem] border border-white/90 bg-white/94 p-5 shadow-[0_16px_45px_rgba(7,26,54,0.06)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(7,26,54,0.09)]"
                  style={{
                    animation: "inibsFadeUp 700ms ease-out both",
                    animationDelay: `${index * 70}ms`,
                  }}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf4fb] text-[#245ea8] ring-1 ring-blue-100 transition-transform duration-300 group-hover:scale-105">
                    {program.icon}
                  </div>
                  <p className="mt-4 text-[8px] font-black uppercase tracking-[0.18em] text-[#245ea8]">
                    {program.subtitle}
                  </p>
                  <h3 className="mt-1 text-sm font-black text-[#071a36]">
                    {program.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-[#697787]">
                    {program.text}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="mx-auto mt-10 max-w-5xl">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 h-px w-16 bg-gradient-to-r from-transparent via-[#2675bd]/45 to-transparent inibs-rule" />
              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#245ea8]">
                Learning Facilities
              </p>
              <p className="mt-1 text-[10px] font-semibold text-[#6c8095]">
                Fasilitas
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-[#071a36] sm:text-3xl">
                Lingkungan yang Mendukung Pendidikan
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {facilities.map((facility, index) => (
                <article
                  key={facility.title}
                  className="group inibs-card-shine inibs-premium-card rounded-[1.8rem] border border-white/90 bg-white/94 p-5 shadow-[0_16px_45px_rgba(7,26,54,0.06)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(7,26,54,0.09)]"
                  style={{
                    animation: "inibsFadeUp 700ms ease-out both",
                    animationDelay: `${index * 65}ms`,
                  }}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf4fb] text-[#245ea8] ring-1 ring-blue-100 transition-transform duration-300 group-hover:scale-105">
                    {facility.icon}
                  </div>
                  <h3 className="mt-4 text-sm font-black text-[#071a36]">
                    {facility.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-[#697787]">
                    {facility.text}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="mx-auto mt-10 max-w-5xl">
            <div className="inibs-card-shine relative overflow-hidden rounded-[2rem] border border-white/90 bg-white/94 p-7 shadow-[0_22px_65px_rgba(7,26,54,0.08)] backdrop-blur-xl sm:p-9">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-100/35 blur-3xl inibs-glow" />
              <div className="absolute -left-20 -bottom-24 h-56 w-56 rounded-full bg-cyan-100/25 blur-3xl" />

              <div className="relative z-10 grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf4fb] text-[#245ea8] ring-1 ring-blue-100 shadow-sm">
                    <MapPinIcon />
                  </div>

                  <p className="mt-5 text-[9px] font-black uppercase tracking-[0.22em] text-[#245ea8]">
                    Campus Location
                  </p>
                  <p className="mt-1 text-[10px] font-semibold text-[#6c8095]">
                    Lokasi Kampus INIBS
                  </p>

                  <h2 className="mt-2 text-2xl font-black tracking-tight text-[#071a36] sm:text-3xl">
                    Imam Nawawi Islamic Boarding School
                  </h2>

                  <p className="mt-3 text-sm font-semibold leading-7 text-[#586b81]">
                    Lemahbang Kulon, Banyuwangi, Jawa Timur, Indonesia
                  </p>

                  <p className="mt-4 text-xs leading-6 text-[#697787]">
                    A peaceful environment for learning, growth, and character building.
                  </p>
                  <p className="mt-1 text-[10px] font-medium leading-5 text-[#7b8b9c]">
                    Lingkungan pendidikan yang mendukung proses belajar, pembinaan karakter, dan kehidupan santri.
                  </p>

                  <a
                    href="https://maps.app.goo.gl/8FtNckkSnoXQZisM6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0d3b72] via-[#174f91] to-[#2675bd] px-5 py-3.5 text-xs font-black text-white shadow-[0_14px_34px_rgba(23,79,145,0.20)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(23,79,145,0.28)]"
                  >
                    <MapPinIcon />
                    Open in Google Maps
                    <ArrowIcon />
                  </a>
                </div>

                <div className="overflow-hidden rounded-[1.7rem] border border-blue-100 bg-[#f7fbff] shadow-sm">
                  <div className="flex min-h-[260px] items-center justify-center bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.98),transparent_42%),linear-gradient(135deg,rgba(237,244,251,0.95),rgba(247,251,255,0.98))] p-6 sm:min-h-[310px]">
                    <div className="text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-white text-[#245ea8] ring-1 ring-blue-100 shadow-[0_12px_35px_rgba(7,26,54,0.07)] inibs-map-pin-float">
                        <MapPinIcon />
                      </div>
                      <p className="mt-5 text-[9px] font-black uppercase tracking-[0.18em] text-[#245ea8]">
                        INIBS Campus
                      </p>
                      <p className="mt-2 text-sm font-black text-[#071a36]">
                        Lemahbang Kulon
                      </p>
                      <p className="mt-1 text-xs font-medium text-[#7b8b9c]">
                        Banyuwangi, Jawa Timur
                      </p>
                      <p className="mt-4 text-[9px] font-semibold text-[#91a0ae]">
                        Buka Google Maps untuk melihat rute dan navigasi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto mt-10 max-w-5xl">
            <div className="inibs-card-shine relative overflow-hidden rounded-[2rem] border border-white/90 bg-white/94 p-7 shadow-[0_22px_65px_rgba(7,26,54,0.08)] backdrop-blur-xl sm:p-9">
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-100/30 blur-3xl inibs-glow" />
              <div className="pointer-events-none absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-blue-100/25 blur-3xl" />

              <div className="relative z-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf4fb] text-[#245ea8] ring-1 ring-blue-100 shadow-sm">
                      <ExploreIcon />
                    </div>

                    <p className="mt-5 text-[9px] font-black uppercase tracking-[0.22em] text-[#245ea8]">
                      Experiential Learning
                    </p>
                    <p className="mt-1 text-[10px] font-semibold text-[#6c8095]">
                      Belajar di Luar Kelas • Outing Class
                    </p>

                    <h2 className="mt-2 text-2xl font-black tracking-tight text-[#071a36] sm:text-3xl">
                      Learning Beyond the Classroom
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-[#566a80]">
                      Pengalaman belajar langsung melalui alam dan lingkungan sekitar.
                    </p>
                  </div>

                  <div className="rounded-full border border-blue-100 bg-[#f7fbff] px-4 py-2 text-center text-[9px] font-black uppercase tracking-[0.14em] text-[#245ea8] shadow-sm">
                    4x per tahun • Setiap triwulan
                  </div>
                </div>

                <p className="mt-5 max-w-3xl text-sm leading-7 text-[#697787]">
                  Outing Class menjadi bagian dari proses pendidikan INIBS. Santri
                  belajar melalui pengalaman nyata, observasi, eksplorasi, dan
                  interaksi langsung dengan lingkungan.
                </p>

                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  {outingPrograms.map((program, index) => (
                    <article
                      key={program.term}
                      className="group inibs-card-shine rounded-[1.5rem] border border-slate-100 bg-[#f8fbfe]/80 p-5 transition-all duration-500 hover:-translate-y-1.5 hover:border-blue-100 hover:bg-white hover:shadow-[0_18px_42px_rgba(7,26,54,0.08)]"
                      style={{
                        animation: "inibsFadeUp 700ms ease-out both",
                        animationDelay: `${index * 90}ms`,
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#245ea8] ring-1 ring-blue-100 shadow-sm transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-1">
                          {program.icon}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <span className="rounded-full bg-[#edf4fb] px-2.5 py-1 text-[8px] font-black tracking-[0.12em] text-[#245ea8]">
                              {program.term}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-[0.10em] text-[#9aa8b6]">
                              Field Learning
                            </span>
                          </div>

                          <h3 className="mt-3 text-base font-black text-[#071a36] sm:text-lg">
                            {program.title}
                          </h3>

                          <p className="mt-2 text-xs leading-5 text-[#697787]">
                            {program.text}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-3 rounded-[1.5rem] border border-blue-100 bg-[#f7fbff] p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#245ea8]">
                      Educational Experience
                    </p>
                    <p className="mt-1 text-sm font-black text-[#071a36]">
                      Observe • Explore • Reflect • Grow
                    </p>
                    <p className="mt-1 text-[10px] leading-5 text-[#7b8b9c]">
                      Mengamati, mengeksplorasi, merefleksikan, dan bertumbuh melalui pengalaman langsung.
                    </p>
                  </div>

                  <div className="shrink-0 rounded-2xl bg-white px-4 py-3 text-center ring-1 ring-blue-100 shadow-sm">
                    <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[#7b8b9c]">
                      Program Tahunan
                    </p>
                    <p className="mt-1 text-sm font-black text-[#245ea8]">
                      4 Outing Class
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto mt-10 max-w-5xl">
            <div className="inibs-premium-card rounded-[2rem] border border-white/90 bg-white/94 p-7 shadow-[0_18px_55px_rgba(7,26,54,0.07)] backdrop-blur-xl sm:p-9">
              <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#245ea8]">
                    Student Life
                  </p>
                  <p className="mt-1 text-[10px] font-semibold text-[#6c8095]">
                    Kehidupan Santri
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-[#071a36] sm:text-3xl">
                    Setiap Hari Adalah Bagian dari Pendidikan
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[#697787]">
                    Kehidupan boarding dibangun melalui pembiasaan ibadah,
                    Tahfizh, belajar, aktivitas fisik, pembelajaran malam,
                    kemandirian, dan tanggung jawab.
                  </p>

                  <div className="mt-6 grid gap-3">
                    {[
                      "Asrama Ber-AC",
                      "Monthly Home Leave: Sabtu ba’da Dzuhur – Ahad ba’da Ashar",
                      "Taekwondo & Aktivitas Fisik",
                      "Pembelajaran Malam",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 rounded-[1.25rem] bg-[#f7fbff] px-4 py-3 ring-1 ring-blue-100"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[#245ea8] ring-1 ring-blue-100">
                          <CheckIcon />
                        </span>
                        <span className="text-xs font-semibold text-[#647489]">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="overflow-hidden rounded-[1.7rem] border border-blue-100">
                  <div className="bg-[#071a36] px-5 py-4 text-white">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-200">
                      Daily Student Schedule
                    </p>
                    <h3 className="mt-1 text-lg font-black">
                      Agenda Harian Santri
                    </h3>
                  </div>

                  <div className="max-h-[590px] overflow-y-auto bg-white">
                    {dailySchedule.map(([time, agenda], index) => (
                      <div
                        key={time}
                        className="grid grid-cols-[100px_1fr] gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0"
                      >
                        <span className="text-[10px] font-black text-[#245ea8]">
                          {time}
                        </span>
                        <span className="text-xs font-semibold leading-5 text-[#647489]">
                          {agenda}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>


          <section className="mx-auto mt-8 max-w-5xl">
            <div className="inibs-card-shine relative overflow-hidden rounded-[2rem] border border-white/90 bg-white/94 p-7 shadow-[0_18px_55px_rgba(7,26,54,0.07)] backdrop-blur-xl sm:p-9">
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-100/30 blur-3xl inibs-glow" />
              <div className="relative z-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf4fb] text-[#245ea8] ring-1 ring-blue-100 shadow-sm">
                    <GlobeIcon />
                  </div>
                  <p className="mt-5 text-[9px] font-black uppercase tracking-[0.22em] text-[#245ea8]">
                    Language Day
                  </p>
                  <p className="mt-1 text-[10px] font-semibold text-[#6c8095]">
                    Hari Bahasa
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-[#071a36] sm:text-3xl">
                    Weekly Language Immersion
                  </h2>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-[#f7fbff] px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-[#245ea8] shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2675bd] inibs-soft-pulse" />
                    1x setiap pekan
                  </div>
                  <p className="mt-1 text-sm font-semibold text-[#566a80]">
                    Pembiasaan Bahasa Arab & Bahasa Inggris
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[#697787]">
                    Satu hari setiap pekan didedikasikan untuk pembiasaan Bahasa Arab dan Bahasa Inggris dalam komunikasi dan aktivitas santri.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "Arabic Communication",
                    "English Communication",
                    "Daily Vocabulary",
                    "Speaking Practice",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="group rounded-[1.3rem] border border-slate-100 bg-[#f8fbfe]/80 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:bg-white hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[8px] font-black text-[#245ea8] ring-1 ring-blue-100">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <p className="text-xs font-black text-[#071a36]">{item}</p>
                          <p className="mt-1 text-[9px] font-medium text-[#7b8b9c]">
                            Pembiasaan komunikasi aktif
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto mt-8 max-w-5xl">
            <div className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-white/94 p-7 shadow-[0_18px_55px_rgba(7,26,54,0.07)] backdrop-blur-xl sm:p-9">
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-100/30 blur-3xl" />

              <div className="relative z-10 grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#245ea8]">
                    Family Connection Benefit
                  </p>
                  <p className="mt-1 text-[10px] font-semibold text-[#6c8095]">
                    Koneksi Keluarga
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-[#071a36] sm:text-3xl">
                    Monthly Home Leave
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[#697787]">
                    Setiap akhir bulan, santri mendapatkan waktu pulang untuk
                    beristirahat dan berkumpul bersama keluarga sebelum kembali
                    melanjutkan pembinaan di pesantren.
                  </p>
                </div>

                <div className="rounded-[1.6rem] border border-blue-100 bg-[#f7fbff] p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#245ea8] ring-1 ring-blue-100 shadow-sm">
                      <HomeIcon />
                    </div>
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#7b8ca0]">
                        Jadwal Libur Bulanan (Akhir Bulan)
                      </p>
                      <p className="mt-1 text-base font-black text-[#071a36]">
                        Sabtu Setelah Dzuhur
                      </p>
                      <p className="mt-1 text-xs font-semibold text-[#245ea8]">
                        Sampai Ahad Setelah Ashar
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <BenefitPoint title="Family Time" />
                    <BenefitPoint title="Rest & Recharge" />
                    <BenefitPoint title="Return Ready" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto mt-8 max-w-5xl">
            <div className="inibs-premium-card rounded-[2rem] border border-white/90 bg-white/94 p-7 shadow-[0_18px_55px_rgba(7,26,54,0.07)] backdrop-blur-xl sm:p-9">
              <div className="grid gap-8 lg:grid-cols-2">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#245ea8]">
                    Night Learning Program
                  </p>
                  <p className="mt-1 text-[10px] font-semibold text-[#6c8095]">
                    Program Pembelajaran Malam
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-[#071a36]">
                    Pembelajaran Malam yang Variatif
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[#697787]">
                    Program malam diisi secara bergantian untuk menjaga
                    kedalaman belajar sekaligus memberi ruang bagi berbagai
                    bidang pengembangan santri.
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {nightPrograms.map((program, index) => (
                    <div
                      key={program}
                      className="flex items-center gap-3 rounded-[1.2rem] border border-slate-100 bg-[#f8fbfe]/80 px-4 py-3"
                    >
                      <span className="text-[8px] font-black text-[#245ea8]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-xs font-semibold text-[#647489]">
                        {program}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto mt-8 max-w-5xl">
            <div className="rounded-[2.1rem] bg-gradient-to-br from-[#071a36] via-[#174f91] to-[#2675bd] p-7 text-white shadow-[0_24px_70px_rgba(7,26,54,0.16)] sm:p-10">
              <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-200">
                    Educational Philosophy
                  </p>
                  <p className="mt-1 text-[10px] font-semibold text-blue-200">
                    Filosofi Pendidikan
                  </p>
                  <h2 className="mt-3 text-2xl font-black leading-tight sm:text-4xl">
                    الإيمان أساس، والعلم بناء، والأدب زينة، والمهارة قوة، والإبداع أثر، والقيادة مسؤولية
                  </h2>
                </div>
                <div>
                  <p className="text-sm font-semibold leading-7 text-blue-100 sm:text-base">
                    Iman adalah fondasi. Ilmu adalah bangunan. Adab adalah
                    perhiasan. Keterampilan adalah kekuatan. Kreativitas adalah
                    karya. Kepemimpinan adalah tanggung jawab.
                  </p>
                  <div className="mt-6 h-px bg-white/15" />
                  <p className="mt-5 text-xs leading-6 text-blue-200">
                    Pendidikan diarahkan untuk membentuk pribadi yang kuat dalam
                    fondasi keislaman, terarah dalam akademik, matang dalam
                    karakter, dan siap menggunakan teknologi secara bertanggung
                    jawab.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto mt-10 max-w-5xl">
            <div className="inibs-premium-card rounded-[2rem] border border-white/90 bg-white/94 p-7 shadow-[0_18px_55px_rgba(7,26,54,0.07)] backdrop-blur-xl sm:p-9">
              <div className="mb-6 text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#245ea8]">
                  Student Learning Outcomes
                </p>
                <h2 className="mt-2 text-2xl font-black text-[#071a36] sm:text-3xl">
                  Target Lulusan INIBS
                </h2>
                <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#697787]">
                  Bekal pendidikan yang diarahkan untuk membangun kompetensi,
                  karakter, dan kesiapan santri.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {outcomes.map((outcome, index) => (
                  <div
                    key={outcome}
                    className="flex items-start gap-3 rounded-[1.35rem] border border-slate-100 bg-[#f8fbfe]/80 p-4 transition-all duration-300 hover:border-blue-100 hover:bg-white hover:shadow-sm"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[8px] font-black text-[#245ea8] ring-1 ring-blue-100">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="text-xs font-semibold leading-5 text-[#647489]">
                      {outcome}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-auto mt-10 max-w-5xl">
            <div className="rounded-[2.1rem] bg-gradient-to-br from-[#071a36] via-[#123e70] to-[#2675bd] p-7 text-white shadow-[0_24px_70px_rgba(7,26,54,0.16)] sm:p-10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-200">
                    Begin the Journey
                  </p>
                  <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                    Berikan Lingkungan Pendidikan yang Terarah
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
                    Kenali program INIBS lebih jauh dan mulai proses PPDB untuk
                    tahun ajaran 2027/2028.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link
                    href="/ppdb"
                    className="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-[#071a36] shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:scale-[0.98]"
                  >
                    Lihat PPDB
                    <ArrowIcon />
                  </Link>
                  <Link
                    href="/walisantri"
                    className="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-black text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/15 active:scale-[0.98]"
                  >
                    Portal Walisantri
                    <ArrowIcon />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </section>

        <footer className="border-t border-white/10 bg-[#071a36] text-white shadow-[0_-16px_40px_rgba(7,26,54,0.16)]">
          <div className="mx-auto max-w-6xl px-4 py-8 text-center sm:px-6">
            <p className="text-sm font-black tracking-[0.08em]">
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
      </div>

      <style jsx global>{`
        @keyframes inibsFadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ppdbPremiumFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -7px, 0);
          }
        }

        .ppdb-float {
          animation: ppdbPremiumFloat 7s ease-in-out infinite;
        }

        html {
          scroll-behavior: smooth;
        }

        .inibs-premium-card {
          transition:
            transform 650ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 650ms cubic-bezier(0.22, 1, 0.36, 1),
            border-color 500ms ease,
            background-color 500ms ease;
        }

        .inibs-premium-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 28px 72px rgba(7, 26, 54, 0.11);
        }

        .inibs-card-shine {
          position: relative;
          overflow: hidden;
        }

        .inibs-card-shine::after {
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
            rgba(255, 255, 255, 0.28),
            transparent
          );
          transition: left 1s cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
        }

        .inibs-card-shine:hover::after {
          left: 135%;
        }

        .inibs-scroll-glow {
          transition:
            box-shadow 700ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .inibs-scroll-glow:hover {
          transform: translateY(-3px);
          box-shadow: 0 26px 64px rgba(7,26,54,0.09);
        }

        .inibs-logo-breathe {
          animation: inibsLogoBreathe 6s ease-in-out infinite;
        }

        .inibs-soft-pulse {
          animation: inibsDotPulse 2.8s ease-in-out infinite;
        }

        .inibs-hero-glow::before {
          content: "";
          position: absolute;
          width: 18rem;
          height: 18rem;
          right: -6rem;
          top: -7rem;
          border-radius: 999px;
          background: rgba(103, 211, 255, 0.12);
          filter: blur(36px);
          animation: inibsGlowMove 8s ease-in-out infinite;
          pointer-events: none;
        }

        .inibs-rule {
          animation: inibsRulePulse 5s ease-in-out infinite;
        }

        @keyframes inibsLogoBreathe {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-2px) scale(1.018); }
        }

        @keyframes inibsDotPulse {
          0%, 100% { transform: scale(1); opacity: 0.65; }
          50% { transform: scale(1.35); opacity: 1; }
        }

        @keyframes inibsGlowMove {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.55; }
          50% { transform: translate3d(-24px, 14px, 0) scale(1.12); opacity: 0.9; }
        }

        @keyframes inibsRulePulse {
          0%, 100% { opacity: 0.65; transform: scaleX(1); }
          50% { opacity: 1; transform: scaleX(1.12); }
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

function BenefitPoint({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-white bg-white/80 px-3 py-2.5 ring-1 ring-blue-100">
      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#647489]">
        {title}
      </p>
    </div>
  )
}

function PillarLine({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-blue-50">
      <span className="h-1.5 w-1.5 rounded-full bg-cyan-200" />
      {title}
    </div>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path strokeLinecap="round" d="M5 12h13" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m13 6 6 6-6 6" />
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path strokeLinecap="round" d="M19 12H5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m11 6-6 6 6 6" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-3 w-3">
      <path strokeLinecap="round" strokeLinejoin="round" d="m7 12 3 3 7-7" />
    </svg>
  )
}

function IslamIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.5 19 7v5c0 4.4-2.8 7.2-7 8.5C7.8 19.2 5 16.4 5 12V7l7-3.5Z" />
      <path strokeLinecap="round" d="M9 12h6M12 9v6" />
    </svg>
  )
}

function AcademicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 9 8-4 8 4-8 4-8-4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 10.5V18h10v-7.5M4 19.5h16" />
    </svg>
  )
}

function TechnologyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
      <rect x="4" y="5" width="16" height="11" rx="1.5" />
      <path strokeLinecap="round" d="M8 20h8M10 16l-1 4M14 16l1 4" />
    </svg>
  )
}

function FutureIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.5 19 7v5c0 4.4-2.8 7.2-7 8.5C7.8 19.2 5 16.4 5 12V7l7-3.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
    </svg>
  )
}

function LaptopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
      <rect x="5" y="4" width="14" height="12" rx="1.5" />
      <path strokeLinecap="round" d="M3 19h18M8 19l1-3h6l1 3" />
    </svg>
  )
}

function IdeaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17h6M10 20h4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 14.5a6 6 0 1 1 7 0c-.9.7-1.5 1.4-1.5 2.5h-4c0-1.1-.6-1.8-1.5-2.5Z" />
    </svg>
  )
}

function QuranIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5.5A2.5 2.5 0 0 1 7.5 3H18v17H7.5A2.5 2.5 0 0 0 5 22V5.5Z" />
      <path strokeLinecap="round" d="M5 5.5V22M9 7h5M9 10h6M9 13h4" />
    </svg>
  )
}

function SchoolPathIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 9 8-4 8 4-8 4-8-4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 10.5V18h10v-7.5M4 19.5h16" />
    </svg>
  )
}

function GraduationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 8.5 8-4 8 4-8 4-8-4Z" />
      <path strokeLinecap="round" d="M7 10.5v4.5c2.8 2 7.2 2 10 0v-4.5M20 9v5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18v2h-6" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" d="M3.8 12h16.4M12 3.5c2.4 2.2 3.5 5 3.5 8.5s-1.1 6.3-3.5 8.5c-2.4-2.2-3.5-5-3.5-8.5S9.6 5.7 12 3.5Z" />
    </svg>
  )
}

function ActivityIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 12h4l2-5 3 10 2.2-7 1.8 2h4" />
    </svg>
  )
}

function LeadershipIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
      <circle cx="9" cy="8" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 20a5.5 5.5 0 0 1 11 0M15.5 8h4M17.5 6v4" />
    </svg>
  )
}

function ClassroomIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V6a1.5 1.5 0 0 1 1.5-1.5h13A1.5 1.5 0 0 1 20 6v13" />
      <path strokeLinecap="round" d="M3 19.5h18M8 9h3M8 12h6M8 15h4" />
    </svg>
  )
}

function DormIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V8.5A1.5 1.5 0 0 1 5.5 7H18a2 2 0 0 1 2 2v10" />
      <path strokeLinecap="round" d="M4 14h16M7 14v-3h4v3M14 14v-3h4v3M3 19h18" />
    </svg>
  )
}

function BedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 19V6M19 19V6M5 14h14M7 10h4M7 6h10" />
      <path strokeLinecap="round" d="M3.5 19h17" />
    </svg>
  )
}

function LockerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
      <rect x="5" y="4" width="14" height="17" rx="1.5" />
      <path strokeLinecap="round" d="M9 4v17M15 8h1M15 12h1" />
    </svg>
  )
}

function LaundryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
      <rect x="5" y="4" width="14" height="17" rx="1.5" />
      <circle cx="12" cy="13" r="4" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" stroke="none" />
      <circle cx="11" cy="7.5" r=".5" fill="currentColor" stroke="none" />
      <circle cx="13.5" cy="7.5" r=".5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function MapPinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 10.5c0 5.5-8 10-8 10s-8-4.5-8-10a8 8 0 1 1 16 0Z"
      />
      <circle cx="12" cy="10.5" r="2.5" />
    </svg>
  )
}

function NatureIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 18 6.5-9 3.5 5 2-3L20 18H4Z" />
      <path strokeLinecap="round" d="M8 8.5a1.7 1.7 0 1 0 3.4 0A1.7 1.7 0 0 0 8 8.5Z" />
    </svg>
  )
}

function OceanIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 10.5c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 2.5-2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 15c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 2.5-2" />
      <circle cx="12" cy="6" r="2.5" />
    </svg>
  )
}

function ExploreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.8 9.2-1.9 3.7-3.7 1.9 1.9-3.7 3.7-1.9Z" />
    </svg>
  )
}

function CompassIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.8 9.2-2.3 5.3-3.3.3 2.3-5.3 3.3-.3Z" />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-6 w-6"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 11 8-7 8 7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 10v10h12V10M9 20v-6h6v6" />
    </svg>
  )
}

function BookStackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12v4H6zM4 9h14v4H4zM6 14h12v5H6z" />
      <path strokeLinecap="round" d="M4 19h16" />
    </svg>
  )
}
