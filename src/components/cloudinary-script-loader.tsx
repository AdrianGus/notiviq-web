"use client"

import Script from "next/script"
import * as React from "react"

declare global {
  interface Window {
    cloudinary: any
    __cloudinaryReady?: boolean
  }
}

export default function CloudinaryScriptLoader() {
  // Se o script já estiver presente (ex.: navegação client-side), marque como pronto
  React.useEffect(() => {
    if (typeof window !== "undefined" && window.cloudinary) {
      window.__cloudinaryReady = true
    }
  }, [])

  return (
    <Script
      id="cloudinary-widget"
      src="https://widget.cloudinary.com/v2.0/global/all.js"
      strategy="afterInteractive"
      onLoad={() => {
        // Sinaliza para os componentes que o widget está pronto
        if (typeof window !== "undefined") {
          window.__cloudinaryReady = true
        }
      }}
    />
  )
}
