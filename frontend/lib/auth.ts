import { supabase } from './firebase'

const privateReturnRoots = ['/builder', '/dashboard', '/job-analyzer', '/applications']

/** Keep post-auth redirects inside the app and on a supported private route. */
export function getSafeReturnPath(value: string | null, fallback = '/builder') {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback
  const pathname = value.split(/[?#]/, 1)[0]
  return privateReturnRoots.some((root) => pathname === root || pathname.startsWith(`${root}/`)) ? value : fallback
}

/** Restore the local Supabase session quickly for client-side route gating. */
export async function getCurrentSessionUser(timeoutMs = 4000) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  try {
    const sessionResult = await Promise.race([
      supabase.auth.getSession(),
      new Promise<null>((resolve) => {
        timeoutId = setTimeout(() => resolve(null), timeoutMs)
      }),
    ])

    return sessionResult?.data.session?.user ?? null
  } catch {
    return null
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}
