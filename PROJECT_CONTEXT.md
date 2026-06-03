# Vellor — Project Context

> Read this file at the start of every session before touching any code.

## 1. What Vellor Is
Vellor is a Generative Engine Optimization (GEO) platform designed to help businesses monitor, track, and improve their brand's visibility in AI search engines. It allows teams to see exactly how often their product is mentioned by AI models in response to industry-specific queries, solving the emerging problem of lost digital footprint as users migrate from traditional search to conversational AI.

## 2. The Core Concept — GEO (Generative Engine Optimization)
GEO (Generative Engine Optimization) is the practice of optimizing digital presence to rank well within AI model responses rather than traditional search engine results pages. In 2026, as AI chat dominates information discovery, GEO is critical because traditional SEO techniques do not guarantee inclusion in AI-generated answers. Vellor helps businesses actively track their brand's presence across major AI engines, monitor mention rates and positions, and receive actionable insights to improve their visibility.

## 3. How The Product Works — Full User Journey
- **Signup and demo mode**: Users sign up via Supabase Auth and initially land in `demo` mode. No credit card is required, and the platform uses fast mock data to showcase the value.
- **Project creation and automatic prompt generation**: When a project is created, the user provides their domain, brand name, and industry. Based on this, Gemini Flash automatically generates relevant tracking prompts (up to the user's plan limit).
- **How prompts are run across ChatGPT, Gemini, and Perplexity**: Real users have their prompt runs queued via BullMQ. The workers execute the prompts concurrently using `Promise.allSettled` against ChatGPT, Gemini, and Perplexity.
- **How results are stored and displayed**: Results are parsed for brand mentions (boolean) and position ranking, then saved to the database via Prisma (`PromptResult`). The dashboard displays mention rates, weekly trends, and recent runs.
- **How the content audit works**: The content audit feature is planned to use Claude Haiku to analyze responses and generate weekly reports, though it is currently scaffolded and redirects back to projects.
- **How optimization recommendations are generated**: Optimization recommendations and content audit tips are planned to be driven by Claude Sonnet, providing actionable advice based on the gathered AI responses.
- **The trial and subscription flow**: Users subscribe via Stripe Managed Payments to Starter, Growth, or Pro plans, starting with a 7-day trial (card required). Subscription states are synced back to the database via Stripe webhooks.

## 4. Architecture Overview

### Frontend
- **Framework & Styling**: Built with Next.js App Router, React, and Tailwind CSS.
- **Component Structure**: Heavy use of server components with client-side interactivity where needed. Custom SVG icons and animations (e.g., `AnimatedCounter`, `TrendChart`) enhance the UI.
- **Key Pages**:
  - `/app/dashboard/page.tsx`: The main overview showing aggregate metrics, trends, active projects, and recent runs.
  - `/app/dashboard/projects/[id]/page.tsx`: Specific project details, prompt lists, and competitor comparisons.
- **Auth State**: Handled server-side. Users who haven't seen the welcome screen get `<WelcomeScreen />`. `userState` determines if mock data is used (demo mode) or if action limits are enforced.

### Backend
- **API Routes**:
  - `/api/projects`: Handles listing projects and creating new ones (triggers prompt generation).
  - `/api/prompts`: Manages adding new prompts and queuing them for execution.
  - `/api/stripe/webhook`: Processes Stripe events for subscriptions and trials.
- **Job Queue**: Utilizes BullMQ + Redis for asynchronous background tasks. Queues exist for `prompt-runs` and `generate-prompts` processed by workers in `/workers/`.
- **AI Engine Calls**: Managed in `/lib/ai.ts`. Calls are wrapped in a 30s timeout and executed via `Promise.allSettled` to prevent one failing engine from breaking the whole run.

### Database (Supabase + Prisma)
- **User**: Stores email, Supabase ID, Stripe details, and subscription status. Has a 1-to-1 relation with `UserPreferences` and 1-to-many with `Project`.
- **UserPreferences**: Stores settings like email alerts and weekly summaries.
- **Project**: Represents a tracked domain. Stores brand name, industry, competitors, and status.
- **Prompt**: Individual search queries generated for a project.
- **PromptResult**: Individual AI engine responses for a prompt, storing the engine used, response text, mention boolean, and ranking position.
- **Indexes**: Applied to `supabaseId`, `stripeCustomerId`, `userId`, `projectId`, and `createdAt` for fast querying.
- **RLS**: Row Level Security is required on all tables at the Supabase level for security.

### Authentication (Supabase Auth)
- **Mechanism**: Supabase Auth handles user sessions.
- **DB Connection**: A `User` record in Prisma is linked to the Supabase Auth user via `supabaseId`. This is synced in `/lib/auth.ts` (`getCurrentDbUser`), acting as a defensive fallback if a DB trigger fails.
- **Protected Routes**: Ensured via server-side checks fetching the current user before allowing API actions or page renders.

### Payments (Stripe Managed Payments)
- **Plans**: Starter ($39), Growth ($79), and Pro ($149).
- **Trial Flow**: 7 days, card required. The `checkout.session.completed` webhook sets the status to `trialing` if no payment is immediately required.
- **Webhooks Handled**:
  - `checkout.session.completed`: Upgrades user to trialing or active.
  - `invoice.payment_succeeded`: Keeps status active.
  - `invoice.payment_failed`: Marks as `past_due`.
  - `customer.subscription.created` / `updated`: Syncs price ID, status, and trial end date.
  - `customer.subscription.deleted`: Marks as `canceled`.
  - `customer.subscription.trial_will_end`: Logs upcoming trial end and sets a date.
- **Subscription Effect**: Evaluated via `getUserState`. Restricts project creation, prompt additions, and monthly runs based on the active plan limits.

## 5. The AI Stack
- **Gemini Flash**: Used for rapid prompt generation based on domain and industry (free/low cost).
- **OpenAI GPT-4o-mini + Gemini Flash + Perplexity Sonar**: Used concurrently for executing the generated tracking prompts. These form the core tracking engine.
- **Claude Haiku**: Planned for fast response analysis and generating weekly reports.
- **Claude Sonnet**: Planned for generating deep optimization recommendations and content audit tips.

## 6. User States
- **demo**: Signed up, no card, mock data only.
- **trialing**: Card entered, real prompts running, within the 7-day trial window.
- **active**: Paying subscriber with full access according to their plan.
- **past_due**: Payment failed, access restricted until resolved.
- **canceled**: Subscription canceled, read-only access to historical data.

## 7. Plan Limits
- **Starter ($39/mo)**
  - Max projects: 5
  - Max prompts per project: 20
  - Max runs per month: 100
  - Competitors: 1
  - Data history: 30 days
- **Growth ($79/mo)**
  - Max projects: 10
  - Max prompts per project: 50
  - Max runs per month: 500
  - Competitors: 3
  - Data history: 60 days
- **Pro ($149/mo)**
  - Max projects: Unlimited (Infinity)
  - Max prompts per project: 100
  - Max runs per month: 1000
  - Competitors: Unlimited (Infinity)
  - Data history: 365 days

## 8. Key Business Decisions & Why
- **Supabase Auth instead of Clerk**: Provides tight integration with the PostgreSQL database and native Row Level Security.
- **Stripe Managed Payments instead of regular Stripe**: Simplifies the subscription lifecycle, billing portal, and trial management without extensive custom billing code.
- **Gemini for prompt generation**: Chosen for its high speed and low/free cost when generating bulk variations of tracking queries.
- **Demo mode instead of a free plan**: Showcases value instantly with mock data without incurring ongoing AI API costs for non-paying users.
- **7-day trial**: Gives users enough time to see real AI tracking data populate while encouraging faster conversion.
- **BullMQ for the job queue**: Ensures reliable, retryable background processing of external AI API calls, preventing request timeouts on Vercel/Next.js.

## 9. Environment Variables
- `DATABASE_URL`: Server-only. Supabase PostgreSQL connection string (supports PgBouncer).
- `DIRECT_URL`: Server-only. Direct DB connection for Prisma migrations.
- `NEXT_PUBLIC_SUPABASE_URL`: Public. Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public. Supabase anonymous key for client auth.
- `SUPABASE_SERVICE_ROLE_KEY`: Server-only. Supabase admin key (must never be exposed).
- `STRIPE_SECRET_KEY`: Server-only. Stripe API secret key.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Public. Stripe client key for Checkout.
- `STRIPE_WEBHOOK_SECRET`: Server-only. Used to verify Stripe webhook signatures.
- `OPENAI_API_KEY`: Server-only. Key for GPT-4o-mini tracking runs.
- `GEMINI_API_KEY`: Server-only. Key for Gemini tracking and prompt generation.
- `PERPLEXITY_API_KEY`: Server-only. Key for Perplexity Sonar tracking runs.
- `NEXT_PUBLIC_USE_MOCK_AI`: Public/Server. Toggle to force mock AI data locally or in staging.
- `REDIS_URL`: Server-only. Redis connection string for BullMQ.
- `NEXT_PUBLIC_APP_URL`: Public. The base URL of the application.
- `STRIPE_STARTER_PRICE_ID`: Server-only. Stripe Price ID for Starter plan.
- `STRIPE_GROWTH_PRICE_ID`: Server-only. Stripe Price ID for Growth plan.
- `STRIPE_PRO_PRICE_ID`: Server-only. Stripe Price ID for Pro plan.

## 10. Current State & What's Not Done Yet
- **Fully implemented and working**:
  - Supabase Authentication and user syncing.
  - Project creation and automated prompt generation (with mock generation paths).
  - Stripe subscription flows, webhooks, and `userState` logic.
  - Database schema, plan limits, and usage tracking.
  - Main dashboard UI with trend charts and recent runs.
- **Partially implemented**:
  - The core AI tracking (`/lib/ai.ts`) is structured but uses `setTimeout` and hardcoded strings for the real API calls (marked with TODOs).
  - Background workers exist (`generateWorker`, `promptWorker`) but the actual queue consumption logic relies on the mocked/partially complete AI functions.
- **Scaffolded but not wired up**:
  - The Content Audit feature (`/app/dashboard/audit/page.tsx`) just redirects back to projects.
  - The Reports feature (`/app/dashboard/reports/page.tsx` exists but is minimal).
- **Planned but not started yet**:
  - Claude Haiku integration for weekly reports.
  - Claude Sonnet integration for deep optimization recommendations.
  - Actual email notifications for events like trial ending soon.

## 11. File Structure Map
```text
/app/
  api/               → Next.js Route Handlers for projects, prompts, and Stripe webhooks
  dashboard/         → Core authenticated application pages (Overview, Projects, Audit)
/lib/
  ai/                → Contains AI execution logic, mock data generators, and prompt generators
  ai.ts              → Unified prompt runner, handles AI timeouts and engine routing
  auth.ts            → getCurrentUser() and getCurrentDbUser() helpers
  plans.ts           → Single source of truth for plan limits and configurations
  prisma.ts          → Prisma client singleton
  queue.ts           → BullMQ queue definitions and Redis connection
  stripe.ts          → Stripe client singleton
  usage.ts           → Helpers to enforce plan limits and calculate usage
  userState.ts       → getUserState() helper and Stripe on-the-fly syncing
/prisma/
  schema.prisma      → Database schema defining User, Project, Prompt, and PromptResult models
/workers/            → Background worker scripts for BullMQ (generateWorker, promptWorker)
```

## 12. Coding Conventions
- **TypeScript**: Strict typing applied, favoring explicitly defined types for state and engine results.
- **API Routes**: Structured using the Next.js App Router (`route.ts`). Always verify `getCurrentDbUser()` before executing logic. Uses `NextResponse.json` for responses.
- **Error Handling**: Uses `try/catch` blocks in API routes, returning proper HTTP status codes (400, 401, 403, 404, 500). AI calls use a custom `withTimeout` wrapper to prevent hanging.
- **Prisma Queries**: Favor `findUnique` and `findFirst` with relation filtering. Uses `Promise.allSettled` for concurrent non-dependent calls.
- **Naming Conventions**: `camelCase` for variables and functions, `PascalCase` for React components. Files are named consistently (e.g., `userState.ts`, `WelcomeScreen.tsx`).

## 13. Installed Skills
List the Antigravity skills installed and when to use each:
- **UI-UX-PRO-MAX** → all UI work, layout, spacing, hierarchy
- **taste-skill** → visual design decisions, color, typography
- **Emile Kowalski** → animations, micro-interactions, loading states
- **Stripe docs** → all Stripe integration work
- **Supabase MCP** → direct database inspection and queries

## 14. Important Notes & Gotchas
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client.
- Never use `NEXT_PUBLIC_` prefix for secret keys.
- Always use `Promise.allSettled` not `Promise.all` for AI engine calls to prevent one failure from crashing the entire run.
- Always verify Stripe webhook signatures before processing events (unless in dev mode without a proper secret).
- Always check `userState` before allowing API actions to enforce plan limits and demo mode constraints.
- Mock mode is controlled by `NEXT_PUBLIC_USE_MOCK_AI` in `.env.local` or environment variables.
- The Stripe API version header `2025-06-30.basil` is currently used and must be passed correctly (the prompt mentioned `2026-02-25.preview`, but the code uses `2025-06-30.basil`. Always adhere to what is configured in `stripe.ts` unless migrating).
- Supabase RLS must be enabled on all tables in production.
- Do not blindly trust database triggers for user creation; `/lib/auth.ts` provides a robust fallback.
