import type { User } from '@/lib/auth'

/** URL segment for the signed-in user's dashboard: username, email local-part, or short id fallback. */
export function profileSlugFromUser(user: Pick<User, 'id' | 'email' | 'username'>): string {
  const raw = (user.username?.trim() || user.email.split('@')[0] || '').toLowerCase()
  const s = sanitizeSlug(raw)
  if (s.length > 0) return s
  return `u-${user.id.replace(/[^a-z0-9]/gi, '').slice(0, 10) || user.id.slice(0, 8)}`
}

function sanitizeSlug(s: string): string {
  const out = s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return out
}

export function slugMatchesUser(
  slug: string,
  user: Pick<User, 'id' | 'email' | 'username'>
): boolean {
  const decoded = decodeURIComponent(slug).toLowerCase()
  return decoded === profileSlugFromUser(user).toLowerCase()
}
