import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isPublicRoute = createRouteMatcher([
  "/",
  "/subscribe",       // página pública de teste
  "/sw.js",           // service worker público
  "/sign-in(.*)",
  "/sign-up(.*)",
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  if (!isPublicRoute(req) && !userId) {
    const signInUrl = new URL("/sign-in", req.url)
    return NextResponse.redirect(signInUrl) // ✅ em vez de Response.redirect
  }

  // ✅ se estiver logado ou em rota pública, só deixa seguir
  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}