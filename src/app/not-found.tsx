export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-neutral-600">
        A página que você procura não existe.
      </p>
      <a
        href="/"
        className="mt-4 rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-neutral-800"
      >
        Voltar para a Home
      </a>
    </div>
  )
}
