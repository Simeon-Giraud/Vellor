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
- **How the content audit works**: The content audit feature uses Claude Haiku to analyze responses and generate weekly reports, though it is currently scaffolded and redirects back to projects.
- **How optimization recommendations are generated**: Optimization recommendations and content audit tips are driven by Claude Sonnet, providing actionable advice based on the gathered AI responses.
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
- **AI Engine Calls**: Managed in `/lib/ai/`. Calls are wrapped in a 30s timeout and executed via `Promise.allSettled` to prevent one failing engine from breaking the whole run.

### Database (Supabase + Prisma)
- **User**: Stores email, Supabase ID, Stripe details, and subscription status. Has a 1-to-1 relation with `UserPreferences` and 1-to-many with `Project`.
- **UserPreferences**: Stores settings like email alerts and weekly summaries.
- **Project**: Represents a tracked domain. Stores brand name, industry, competitors, status, and 1-to-many relations with `Prompt` and `ProjectRun`.
- **Prompt**: Individual search queries generated for a project.
- **PromptResult**: Individual AI engine responses for a prompt, storing the engine used, response text, mention boolean, and ranking position.
- **ProjectRun**: Logs when a project is executed, storing the execution type (`"scheduled"` or `"on_demand"`).
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
- **Claude Haiku**: Used for fast response analysis and generating weekly reports.
- **Claude Sonnet**: Used for generating deep optimization recommendations and content audit tips.

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
  - Run limits: weekly scheduled runs (~4/month) + 5 on-demand project runs/month
  - Competitors: 1
  - Data history: 30 days
- **Growth ($79/mo)**
  - Max projects: 10
  - Max prompts per project: 50
  - Run limits: scheduled runs every 3 days (~10/month) + 10 on-demand project runs/month
  - Competitors: 3
  - Data history: 60 days
- **Pro ($149/mo)**
  - Max projects: Unlimited (Infinity)
  - Max prompts per project: 100
  - Run limits: daily scheduled runs (~30/month) + 25 on-demand project runs/month
  - Competitors: Unlimited (Infinity)
  - Data history: 365 days


## 8. Key Business Decisions & Why
- **Supabase Auth instead of Clerk**: Provides tight integration with the PostgreSQL database and native Row Level Security.
- **Stripe Managed Payments instead of regular Stripe**: Simplifies the subscription lifecycle, billing portal, and trial management without extensive custom billing code. Stripe Managed Payments handles VAT collection and remittance automatically in 80+ countries.
- **Pricing Strategy**: Pricing is in USD, not EUR, to target the global English-speaking SaaS market. Prices are displayed excluding VAT — “Prices exclude VAT where applicable” shown on pricing page.
- **Gemini Flash for prompt generation**: Chosen specifically because it has a free tier (1,500 req/day) making project creation essentially free to run.
- **Claude for analysis and recommendations**: Chosen because it is best-in-class for text reasoning and structured output.
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
- `ANTHROPIC_API_KEY`: Server-only. Used for Claude Haiku (response analysis, weekly reports) and Claude Sonnet (optimization recommendations, content audit).
- `NEXT_PUBLIC_USE_MOCK_AI`: Public/Server. Toggle to force mock AI data locally or in staging.
- `REDIS_URL`: Server-only. Redis connection string for BullMQ.
- `NEXT_PUBLIC_APP_URL`: Public. The base URL of the application.
- `STRIPE_STARTER_PRICE_ID`: Server-only. Stripe Price ID for Starter plan.
- `STRIPE_GROWTH_PRICE_ID`: Server-only. Stripe Price ID for Growth plan.
- `STRIPE_PRO_PRICE_ID`: Server-only. Stripe Price ID for Pro plan.

## 10. Current State & What's Not Done Yet
- **Fully implemented and working**:
  - Supabase Authentication and user syncing.
  - Project creation and automated prompt generation (with real Gemini API and mock generation paths).
  - Core AI tracking executing real API calls against OpenAI, Gemini, and Perplexity concurrently.
  - Stripe subscription flows, webhooks, and `userState` logic.
  - Database schema, plan limits, and usage tracking (via ProjectRun on-demand run checks).
  - Background workers (`generateWorker`, `promptWorker`, `cronWorker`) executing queue logic and registering daily midnight repeatable jobs to trigger plan-based prompt runs.
  - Main dashboard UI with trend charts and recent runs.
  - Supabase Row Level Security (RLS) policies implemented on all database tables (`users`, `user_preferences`, `projects`, `prompts`, `prompt_results`, `_prisma_migrations`).
  - Email sending service via **Resend** (with mock fallback in development and preferences checks).
  - Trial expiry notifications and weekly email digest trigger logic (respecting user preferences).
  - Test email API route at `/api/settings/test-email`.
- **Partially implemented**:
  - None at this time.

- **Scaffolded but not wired up**:
  - The Content Audit feature (`/app/dashboard/audit/page.tsx`) just redirects back to projects.
  - The Reports feature (`/app/dashboard/reports/page.tsx` exists but is minimal).
- **Planned but not started yet**:
  - GDPR compliance (legally required — France/EU): privacy policy, cookie consent banner, data export, account deletion. Plan to use Iubenda.
  - Rate limiting on AI routes using Upstash Redis + `@upstash/ratelimit`.
  - Sentry error monitoring.
  - Annual billing option (2 months free).
  - Referral program.
  - Slack notifications for mention rate drops.
  - Shareable public report URLs.
  - Chrome extension.
  - Multi-user / team access.
  - White label reports for agencies.
  - API access for developers.

## 11. File Structure Map
```text
/app/
  api/               → Next.js Route Handlers for projects, prompts, and Stripe webhooks
  dashboard/         → Core authenticated application pages (Overview, Projects, Audit)
/lib/
  ai/                → Contains AI execution logic, mock data generators, and prompt generators: index.ts, openai.ts, gemini.ts, perplexity.ts, demoData.ts, generatePrompts.ts, mockExecutor.ts
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
List of active local skills in this project and when to use each:
- [ui-ux-pro-max](file:///Users/Simeon/Documents/Website/Vellor/.agents/skills/ui-ux-pro-max/SKILL.md) → all UI work, layout, spacing, hierarchy
- [design-taste-frontend](file:///Users/Simeon/Documents/Website/Vellor/.agents/skills/design-taste-frontend/SKILL.md) → visual design decisions, color, typography
- [emil-design-eng](file:///Users/Simeon/Documents/Website/Vellor/.agents/skills/emil-design-eng/SKILL.md) → animations, micro-interactions, loading states
- [high-end-visual-design](file:///Users/Simeon/Documents/Website/Vellor/.agents/skills/high-end-visual-design/SKILL.md) → premium agency-grade visual design standards
- [minimalist-ui](file:///Users/Simeon/Documents/Website/Vellor/.agents/skills/minimalist-ui/SKILL.md) → clean layouts, typography contrast, muted palettes
- [redesign-existing-projects](file:///Users/Simeon/Documents/Website/Vellor/.agents/skills/redesign-existing-projects/SKILL.md) → upgrading existing views/components to premium standards
- [stripe-best-practices](file:///Users/Simeon/Documents/Website/Vellor/.agents/skills/stripe-best-practices/SKILL.md) → general Stripe integration rules
- [stripe-projects](file:///Users/Simeon/Documents/Website/Vellor/.agents/skills/stripe-projects/SKILL.md) → Stripe setup and developer workflow
- [upgrade-stripe](file:///Users/Simeon/Documents/Website/Vellor/.agents/skills/upgrade-stripe/SKILL.md) → Stripe API upgrades and compatibility
- [supabase](file:///Users/Simeon/Documents/Website/Vellor/.agents/skills/supabase/SKILL.md) → Supabase schema, client, and authentication best practices
- [supabase-postgres-best-practices](file:///Users/Simeon/Documents/Website/Vellor/.agents/skills/supabase-postgres-best-practices/SKILL.md) → database schema and query optimization
- [full-output-enforcement](file:///Users/Simeon/Documents/Website/Vellor/.agents/skills/full-output-enforcement/SKILL.md) → ensures complete, unabridged code output generation

## 14. Important Notes & Gotchas
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client.
- Never use `NEXT_PUBLIC_` prefix for secret keys.
- Always use `Promise.allSettled` not `Promise.all` for AI engine calls to prevent one failure from crashing the entire run.
- Always verify Stripe webhook signatures before processing events (unless in dev mode without a proper secret).
- Always check `userState` before allowing API actions to enforce plan limits and demo mode constraints.
- Mock mode is controlled by `NEXT_PUBLIC_USE_MOCK_AI` in `.env.local` or environment variables.
- The Stripe API version is set to `2026-02-25.preview` to match the requirements for Stripe Managed Payments. Always adhere to what is configured in `stripe.ts` unless migrating.
- Supabase RLS must be enabled on all tables in production.
- Do not blindly trust database triggers for user creation; `/lib/auth.ts` provides a robust fallback.

## 15. Demo Mode UI Flow
Document the complete onboarding UI states:
- **New user** (`hasSeenWelcome: false`) → full-page welcome screen with feature highlights and single CTA.
- **Demo user** → persistent light purple banner at the top of every dashboard page, never dismissible.
- **Trialing user** → amber banner showing days remaining, turns red within 2 days of expiry.
- **Past due user** → red banner blocking new prompt runs.
- **Canceled user** → full-page overlay blocking dashboard, shows resubscribe plans.

## 16. Content Audit Mechanism
The planned content audit flow:
1. Fetch user’s page URL via server-side HTTP request.
2. Parse HTML and extract text content.
3. Score against 8 GEO factors using Gemini Flash (free): direct answer in first 50 words, FAQ schema markup, fact density, Q&A structure, word count >800, author schema, external citations, content chunking.
4. Compare against pages that ARE getting cited to find the delta.
5. Pass scores + page content to Claude Sonnet to generate specific line-level rewrites.
6. Show before/after diff with projected GEO score improvement.

## 17. Competitor Tracking Mechanism
The same tracking prompts are run for both the user’s domain and each competitor domain. Results are stored separately per domain. The competitor comparison view shows side-by-side mention rates, position rankings, and trend deltas across all 3 engines.

## 18. Dashboard UI/UX & Layout Guidelines
- **Theme Constraints**: The platform is locked to **Light Mode** (`data-theme="light"` forced in `ThemeProvider.tsx`). The dashboard sidebar is locked to **Dark Mode** (completely pitch black `#000000` background) via CSS overrides in `.main-sidebar` in `globals.css` and inline styles in `Sidebar.tsx`.
- **Canvas Layout**: The main dashboard area (`.dashboard-main-content`) is styled as a floating white canvas layered over the black sidebar, featuring `borderTopLeftRadius: "24px"`, `borderBottomLeftRadius: "24px"`, and a drop shadow (`boxShadow: "-8px 0 32px rgba(0, 0, 0, 0.08)"`).
- **Scrolling Behavior**: Scrolling is contained at the viewport level. The outer parent container is locked to `h-screen overflow-hidden` and the `.dashboard-main-content` container is set to `h-screen overflow-y-auto overflow-x-hidden`. This keeps the rounded bottom-left corner fixed exactly at the bottom of the screen viewport as content scrolls internally.
- **Sidebar Drag & Navigation**:
  - The sidebar collapses to `72px` and expands to `240px` via dragging or clicking.
  - To prevent snap-back and click propagation, a timestamp debouncer (`lastDragTimeRef`) is used.
  - If the sidebar is collapsed, navigation clicks on the icons change pages without expanding the sidebar (`target.closest("a")` and `target.closest("button")` checks in the aside `onClick` handler).
  - There are no visible vertical borders/divider lines on the sidebar or its hover handle.
  - Animations and cross-fades of child elements (logo text, badges, nav labels, usage cards, user row) are controlled by CSS custom variables on the `<aside>` element.
  - When not dragging, these variables are statically mapped to React `isCollapsed` state, allowing children to transition smoothly using CSS transitions.
  - During dragging, transitions are disabled (`.is-dragging`) and these variables are recalculated in real-time in JavaScript (`mousemove`) and set as inline properties for 1:1 cursor tracking. On `mouseup`, the inline property overrides are cleared, letting React-state CSS transitions take over for the snap.
  - The logo header centers itself when collapsed using `justifyContent: isCollapsed ? "center" : "space-between"` (with a dynamic `mousemove` threshold at `130px` during drag) and is offset-free thanks to an animated flex gap (`calc(var(--sidebar-text-opacity) * 10px)`).
- **Sidebar Navigation & Structure**:
  - The sidebar is organized into logical groups: "Main" (Dashboard, Projects), "Tools" (Page Audit, Alerts), and "Account" (Settings, What's New).
  - The "Tools" section is only visible to users who have created at least one project.
  - The "What's New" item features a dynamic visual indicator dot to draw attention to updates.
  - Section headers fade gracefully during sidebar collapse and expand, driven by CSS variables `var(--sidebar-expanded-opacity)` and `var(--sidebar-collapsed-opacity)`.
- **Profile Customization & Real-time Sync**:
  - Profile metadata (`fullName` and `avatarUrl`) is editable under the settings profile tab, updating both Prisma via `/api/settings/profile` and Supabase Auth metadata.
  - Avatars support 6 premium gradient presets or a custom image URL.
  - The sidebar subscribes to `supabase.auth.onAuthStateChange` to listen for `"USER_UPDATED"` events, updating the sidebar avatar and name in real-time without page reloads.
  - A dedicated sign out section is available in the profile tab.

