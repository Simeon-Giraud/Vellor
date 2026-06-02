import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function getCurrentDbUser() {
  const user = await getCurrentUser()
  if (!user) return null

  // Get or create the user in our database (defensive fallback if trigger didn't run)
  let dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) {
    try {
      dbUser = await prisma.user.create({
        data: {
          supabaseId: user.id,
          email: user.email!,
          fullName: user.user_metadata?.full_name ?? null,
          avatarUrl: user.user_metadata?.avatar_url ?? null,
        }
      })
    } catch (e: any) {
      // If a concurrent request inserted the user in the meantime, fetch the existing record
      dbUser = await prisma.user.findUnique({
        where: { supabaseId: user.id }
      })
      if (!dbUser) {
        throw e // Rethrow if it wasn't a duplicate key error
      }
    }
  }

  return dbUser
}
