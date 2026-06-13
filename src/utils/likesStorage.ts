type LikedStore = {
  tweets: number[]
  comments: number[]
}

const KEY_PREFIX = 'twitter_liked_'

function normalizeIds(ids: unknown[]): number[] {
  return ids.map((id) => Number(id)).filter((id) => !Number.isNaN(id))
}

export function loadLikesForUser(userId: number): LikedStore {
  const raw = localStorage.getItem(`${KEY_PREFIX}${userId}`)
  if (!raw) return { tweets: [], comments: [] }
  try {
    const parsed = JSON.parse(raw) as LikedStore
    return {
      tweets: normalizeIds(parsed.tweets ?? []),
      comments: normalizeIds(parsed.comments ?? []),
    }
  } catch {
    return { tweets: [], comments: [] }
  }
}

export function saveLikesForUser(userId: number, store: LikedStore) {
  localStorage.setItem(`${KEY_PREFIX}${userId}`, JSON.stringify(store))
}

function getErrorMessage(error: unknown): string {
  if (typeof error !== 'object' || error === null || !('response' in error)) return ''
  const data = (error as { response?: { data?: unknown } }).response?.data
  if (typeof data === 'string') return data
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const message = (data as { message?: unknown }).message
    return typeof message === 'string' ? message : ''
  }
  return ''
}

export function isAlreadyLikedError(error: unknown): boolean {
  return getErrorMessage(error).toLowerCase().includes('already liked')
}

export function isLikeNotFoundError(error: unknown): boolean {
  const msg = getErrorMessage(error).toLowerCase()
  return msg.includes('like not found') || msg.includes('not found for this')
}
