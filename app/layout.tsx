import type { Metadata } from "next"
import {
  Plus_Jakarta_Sans,
  Cormorant_Garamond
} from "next/font/google"
import "./globals.css"

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
})

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "INIBS Smart Digital",
  description: "Portal Walisantri Imam Nawawi Islamic Boarding School",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body
        className={`${plusJakarta.variable} ${cormorant.variable}`}
      >
        {children}
      </body>
    </html>
  )
}