import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ToastProvider } from "@/components/ui/use-toast"
import { MotionProvider } from "@/components/motion-provider"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Employee Card Generator",
  description: "Generate custom employee cards with dynamic templates",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <MotionProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

