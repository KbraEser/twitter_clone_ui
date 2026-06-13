import api from './client'
import type { Comment, CommentRequest } from '../types'

export async function getCommentsByTweetId(tweetId: number): Promise<Comment[]> {
  const response = await api.get<Comment[]>('/comment/findByTweetId', { params: { id: tweetId } })
  return response.data
}

export async function createComment(data: CommentRequest): Promise<Comment> {
  const response = await api.post<Comment>('/comment', data)
  return response.data
}

export async function updateComment(id: number, data: CommentRequest): Promise<Comment> {
  const response = await api.put<Comment>(`/comment/${id}`, data)
  return response.data
}

export async function deleteComment(id: number, userId: number): Promise<void> {
  await api.delete(`/comment/${id}`, { params: { userId } })
}
