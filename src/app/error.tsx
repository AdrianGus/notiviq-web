"use client"

import { useEffect } from "react"

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error("Erro capturado no Next:", error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex h-screen flex-col items-center justify-center text-center">
          <h1 className="text-2xl font-bold">Ops! Algo deu errado.</h1>
          <p className="mt-2 text-neutral-600">
            {process.env.NODE_ENV === "development"
              ? error.message
              : "Ocorreu um erro inesperado. Tente novamente mais tarde."}
          </p>
          <button
            onClick={() => reset()}
            className="mt-4 rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-neutral-800"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="mt-4 rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-neutral-800"
          >
            Voltar para a Home
          </a>
        </div>
      </body>
    </html>
  )
}
