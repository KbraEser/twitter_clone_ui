import api from './client'
import type { Tweet, TweetRequest, TweetUpdateRequest } from '../types'

const MAX_USER_SCAN = 100

export async function getAllTweets(): Promise<Tweet[]> {
  try {
    const response = await api.get<Tweet[]>('/tweet/findAll')
    return response.data
  } catch (error: unknown) {
    if (!isMethodNotAllowed(error) && !isNotFound(error)) throw error
    return getAllTweetsFallback()
  }
}

async function getAllTweetsFallback(): Promise<Tweet[]> {
  const results = await Promise.all(
    Array.from({ length: MAX_USER_SCAN }, (_, i) =>
      getTweetsByUserId(i + 1).catch(() => [] as Tweet[]),
    ),
  )
  const map = new Map<number, Tweet>()
  for (const tweets of results) for (const t of tweets) map.set(t.id, t)
  return [...map.values()].sort((a, b) => b.id - a.id)
}

function isMethodNotAllowed(e: unknown) {
  return typeof e === 'object' && e !== null && 'response' in e &&
    (e as { response?: { status?: number } }).response?.status === 405
}

function isNotFound(e: unknown) {
  return typeof e === 'object' && e !== null && 'response' in e &&
    (e as { response?: { status?: number } }).response?.status === 404
}

export async function getTweetsByUserId(userId: number): Promise<Tweet[]> {
  const response = await api.get<Tweet[]>('/tweet/findByUserId', { params: { id: userId } })
  return response.data
}

export async function getTweetById(id:number):Promise<Tweet>{
  const response = await api.get<Tweet>(`tweet/findById`,{params:{id}})
  return response.data
}

export async function createTweet(data: TweetRequest): Promise<Tweet> {
  const response = await api.post<Tweet>('/tweet', data)
  return response.data
}

export async function updateTweet(id: number, data: TweetUpdateRequest): Promise<Tweet> {
  const response = await api.put<Tweet>(`/tweet/${id}`, data)
  return response.data
}

export async function deleteTweet(id: number): Promise<void> {
  await api.delete(`/tweet/${id}`)
}
