# Vibe Platform

Next.js 15 app for “vibe-coding”—bringing AI-assisted workflows, background jobs, typed APIs, and modern auth together.

## Stack

- **App:** Next.js 15 (React 19), TypeScript, Turbopack dev
- **UI:** Tailwind CSS 4, shadcn/ui, Radix Primitives, lucide-react
- **State/Data-fetching:** tRPC v11 + TanStack Query v5, superjson
- **AI:** OpenAI API + E2B Code Interpreter, Inngest Agent Kit
- **Jobs/Events:** Inngest
- **Auth (& billing per project setup):** Clerk
- **DB:** Prisma ORM + Neon (Postgres)
- **Other:** rate-limiter-flexible, date-fns, prismjs

---

## Features (high level)

- 🔐 Clerk authentication (sign-in/up routes + redirect fallbacks)
- 🤝 End-to-end types with tRPC
- 🧠 AI agents (OpenAI + E2B) and background operations via Inngest
- 🗃️ Prisma schema & Neon Postgres storage
- 🎨 Accessible, themeable UI via Tailwind/shadcn/ui
- ⚡ Fast dev experience with Turbopack

---

## Requirements

- **Node.js**: 20.x or 22.x (LTS recommended)
- **Package manager**: npm (or pnpm/yarn—use your preference)
- **Postgres connection**: Neon DB URL
- **Clerk app** with API keys
- **OpenAI** & **E2B** API keys

---

## Environment variables

Create a file named **`.env.local`** in the repo root (not committed).  
Here’s a ready-to-paste example:

```env
# Database
DATABASE_URL="connection url"

# App URL (used by Next.js client)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# AI
OPENAI_API_KEY="sk-proj-ssssssss-sssssssssssssssssssssssssssssssssssssssssss"
E2B_API_KEY="e2b_ssssssssssssssssssssssssssssssssssssssssssss"

# Clerk (Auth & billing)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_ssssssssssssssssssssssssssssssssss"
CLERK_SECRET_KEY="sk_test_sssssssssssssssssssssssssssssssssss"

# Clerk routes
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/"
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/"
```

> **Notes**
>
> - `NEXT_PUBLIC_*` vars are exposed to the browser—never put secrets in these.
> - `DATABASE_URL` should be your **Postgres** connection string.
> - If you deploy, update `NEXT_PUBLIC_APP_URL` to your production URL.

---

## Getting started (local)

1. **Install dependencies**

   ```bash
   npm install
   ```

   > `postinstall` runs `prisma generate` automatically.

2. **Set environment**

   - Create `.env.local` (see above) and fill in values.

3. **Initialize the database**

   - If this is a fresh DB:
     ```bash
     npx prisma migrate dev --name init
     ```
     (or use `npx prisma db push` if you don’t want a migration yet)
   - Optional: open Prisma Studio
     ```bash
     npx prisma studio
     ```

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`.

5. **Run the inngest dev server**
   ```bash
   npx inngest-cli@latest dev
   ```
   Visit `http://localhost:8288`.

---

## Scripts

```json
{
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "postinstall": "prisma generate"
}
```

Common commands:

- `npm run dev` — start Next.js (hot reload via Turbopack)
- `npm run build` — production build
- `npm run start` — run production server (after build)
- `npm run lint` — lint the codebase
- `npx prisma migrate dev` — create/apply a migration
- `npx prisma generate` — regenerate Prisma client

---

## How it works (brief architecture)

- **Routing & UI**: Next.js App Router pages/components render the UI (styled with Tailwind/shadcn).
- **Auth**: Clerk providers and middleware gate routes; publishable key is used on the client, secret key on the server.
- **Typed API**: tRPC routers expose server procedures to the client with full type-safety (via `@trpc/client` + Tanstack Query).
- **Data**: Prisma talks to Neon Postgres using `DATABASE_URL`.
- **AI agents**:
  - **OpenAI** is used for generation and reasoning.
  - **E2B Code Interpreter** enables sandboxed code execution for agent tasks.
  - **Inngest Agent Kit** orchestrates agent flows over events.
- **Background work**: **Inngest** handles event-driven jobs and long-running tasks so the UI remains snappy.

---

## Clerk setup (local)

1. Create a Clerk application (Test mode is fine).
2. Copy the **Publishable Key** and **Secret Key** into `.env.local`.
3. Ensure the sign-in/up routes in your env match your app paths:
   - `/sign-in`, `/sign-up`
4. Configure allowed callback URLs in Clerk if you change ports/URLs.

> If you also use Clerk for plan management/billing in your project, add the relevant webhook/endpoints and dashboard settings per your setup.

---

## Database (Prisma + Neon)

- Put your Neon **connection string** into `DATABASE_URL`.
- Create your first migration:
  ```bash
  npx prisma migrate dev --name init
  ```
- To inspect/edit data:
  ```bash
  npx prisma studio
  ```

---

## AI & Agents

- **OpenAI**: set `OPENAI_API_KEY`.
- **E2B**: set `E2B_API_KEY` for code-interpreter features.
- **Inngest**:
  - Local development typically runs via your Next.js server and Inngest SDK.
  - Define events/handlers (agents, scheduled or on-demand) and trigger them from your code.
  - If you add Inngest cloud usage later, include any needed keys/URLs in `.env.local`.

---

## Deployment notes

- Works great on **Vercel** (Next.js 15).
- Set the same environment variables in your hosting provider.
- Update `NEXT_PUBLIC_APP_URL` to your deployed URL.
- Run migrations during deploy (e.g., CI step with `prisma migrate deploy`).

---

## Troubleshooting

- **Prisma client not found**: run `npx prisma generate` (or reinstall).
- **Auth issues**: verify Clerk keys and allowed URLs; ensure `NEXT_PUBLIC_*` keys are correct.
- **Database connection errors**: confirm `DATABASE_URL` is valid and the Neon DB is reachable.
- **AI calls failing**: check `OPENAI_API_KEY` / `E2B_API_KEY` and any rate limits.
- **Type errors** after dep updates: remove `.next`, then `npm i && npm run dev`.

---

## Documentation Links

Here are useful links for the main libraries and services used in this project:

- **tRPC**: [https://trpc.io/docs](https://trpc.io/docs)
- **TanStack Query (React Query)**: [https://tanstack.com/query/latest](https://tanstack.com/query/latest)
- **Clerk**: [https://clerk.com/docs](https://clerk.com/docs)
- **E2B Code Interpreter**: [https://e2b.dev/docs](https://e2b.dev/docs)
- **Inngest**: [https://www.inngest.com/docs](https://www.inngest.com/docs)
- **Next.js**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Prisma ORM**: [https://www.prisma.io/docs](https://www.prisma.io/docs)
- **NeonDB**: [https://neon.com/docs/introduction](https://neon.com/docs/introduction)
