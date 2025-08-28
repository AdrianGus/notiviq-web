
# NotivIQ Frontend v4 (Next.js 14 + Clerk 6.31.4)

## Setup
1) Copie `.env.example` -> `.env.local` e preencha chaves do Clerk + URL da API.
2) Instale e rode:
```bash
npm install
npm run dev
```

## Rotas
- `/sign-in` / `/sign-up`
- `/campaigns` (lista paginada)
- `/campaigns/new`
- `/campaigns/[id]/edit`

## Notas
- Middleware compatível com Clerk v6.31.4 (usa `clerkMiddleware` + `createRouteMatcher`).
- Chamadas à API: no servidor via `apiFetch` (usa `await auth().getToken()`), no cliente via `useClientApi()` (usa `useAuth().getToken()`).
- UI inclui toasts, confirm dialog e loading states.

## JWT Template (Clerk)
Este frontend tenta obter o token do Clerk usando os templates na ordem:
1) `notiviq`
2) `default`
3) sem template

Se você não criou o template `notiviq`, tudo bem — o código ignora 404 "Not Found" e tenta o próximo.
Se o seu backend valida `aud` ou `azp`, recomendo criar o template `notiviq` no Clerk Dashboard.
