# Session Start Checklist

1. Read PROJECT_CONTEXT.md fully before touching any code
2. Use Supabase MCP to check current DB state before schema changes
3. Read relevant skill files before any UI work
4. Check .env.example before adding new environment variables
5. Never use Promise.all for AI calls — always Promise.allSettled
6. Always check userState before any API action
7. Run npm run build before declaring a task complete
8. Never hardcode values that belong in environment variables
9. Check /lib/plans.ts before implementing any feature limits
10. After any Prisma schema change, run migrate and verify in Supabase MCP
11.	Read PROJECT_CONTEXT.md sections 15, 16, and 17 specifically before touching onboarding, audit, or competitor features