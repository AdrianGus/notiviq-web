// app/layout.tsx
import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"
import { ToastProvider } from "@/components/ui/use-toast"
import Script from "next/script"
import RouteProgress from "@/components/route-progress"

export const metadata: Metadata = {
  title: "NotivIQ",
  description: "Campanhas Web Push",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="pt-BR">
        <head>
          {/* Ajuda a reduzir a latência do widget */}
          <link rel="preconnect" href="https://widget.cloudinary.com" />
          <link rel="preconnect" href="https://res.cloudinary.com" />
        </head>
        <body>
          <RouteProgress />   {/* <- aqui, antes de tudo */}
          <ToastProvider>
            {children}
          </ToastProvider>

          {/* Cloudinary Upload Widget – carrega no client depois que a página interagir */}
          <Script
            src="https://widget.cloudinary.com/v2.0/global/all.js"
            strategy="afterInteractive"
          />
        </body>
      </html>
    </ClerkProvider>
  )
}
