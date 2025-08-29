// app/layout.tsx
import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"
import { ToastProvider } from "@/components/ui/use-toast"
import Script from "next/script"
import RouteProgress from "@/components/route-progress"

export const metadata: Metadata = {
  title: "NotivIQ",
  description: "Notificações inteligentes, simples e no seu domínio.",
  icons: {
    // Favicon clássico (no /public)
    icon: [
      { url: "/favicon.ico" },
      // PNGs por tamanho (em /public/icons)
      { url: "/icons/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-64x64.png", sizes: "64x64", type: "image/png" },
      { url: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/icons/icon-256x256.png", sizes: "256x256", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      { url: "/icons/apple-touch-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
    // Se você tiver um pinned-tab (SVG) para Safari, descomente:
    // other: [{ rel: "mask-icon", url: "/icons/safari-pinned-tab.svg", color: "#000000" }],
  },
  // Cor do navegador (Android/Windows)
  themeColor: "#000000",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="pt-BR">
        <head>
          {/* Reduz latência do widget Cloudinary */}
          <link rel="preconnect" href="https://widget.cloudinary.com" />
          <link rel="preconnect" href="https://res.cloudinary.com" />

          {/* Links redundantes para maximizar compatibilidade com crawlers e UAs antigos */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180x180.png" />
          {/* Se tiver manifest, deixe esse link ativo */}
          {/* <link rel="manifest" href="/site.webmanifest" /> */}
          <meta name="theme-color" content="#000000" />
        </head>
        <body>
          <RouteProgress />
          <ToastProvider>{children}</ToastProvider>

          {/* Cloudinary Upload Widget – carrega após a interação do usuário */}
          <Script
            src="https://widget.cloudinary.com/v2.0/global/all.js"
            strategy="afterInteractive"
          />
        </body>
      </html>
    </ClerkProvider>
  )
}
