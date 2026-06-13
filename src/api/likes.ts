import api from './client'
import type { LikeRequest } from '../types'

export async function like(data: LikeRequest) {
  const response = await api.post('/like', data)
  return response.data
}

export async function dislike(data: LikeRequest) {
  const response = await api.post<string>('/dislike', data)
  return response.data
}
