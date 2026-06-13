import { useState } from 'react'
import { deleteComment, updateComment } from '../api/comments'
import { dislike, like } from '../api/likes'
import type { Comment } from '../types'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectIsCommentLiked, setCommentLiked } from '../store/likesSlice'
import {
  isAlreadyLikedError,
  isLikeNotFoundError,
} from '../utils/likesStorage'

interface CommentItemProps {
  comment: Comment
  tweetId: number
  currentUserId: number | null
  onChanged: () => void
}

const actionBtn =
  'border-0 bg-transparent px-1.5 py-0.5 text-xs text-twitter-muted hover:text-twitter-blue'

const textareaClass =
  'resize-none rounded-lg border border-twitter-border bg-black px-3 py-2 text-twitter-text focus:outline-none'

export default function CommentItem({ comment, tweetId, currentUserId, onChanged }: CommentItemProps) {
  const dispatch = useAppDispatch()
  const liked = useAppSelector((state) => selectIsCommentLiked(state, comment.id))
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(comment.content)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isOwner = currentUserId === comment.user?.id
  const authorName = comment.user ? `${comment.user.name} ${comment.user.surname}` : 'Anonim'

  async function handleLike() {
    if (!currentUserId) return
    setLoading(true)
    setError('')
    try {
      if (liked) {
        await dislike({ comment: { id: comment.id } })
        dispatch(setCommentLiked({ commentId: comment.id, liked: false }))
      } else {
        await like({ comment: { id: comment.id } })
        dispatch(setCommentLiked({ commentId: comment.id, liked: true }))
      }
    } catch (err) {
      if (!liked && isAlreadyLikedError(err)) {
        dispatch(setCommentLiked({ commentId: comment.id, liked: true }))
      } else if (liked && isLikeNotFoundError(err)) {
        dispatch(setCommentLiked({ commentId: comment.id, liked: false }))
      } else {
        setError('Beğeni işlemi başarısız.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdate() {
    if (!currentUserId || !editText.trim()) return
    setLoading(true)
    setError('')
    try {
      await updateComment(comment.id, {
        userId: currentUserId,
        tweetId,
        content: editText.trim(),
      })
      setIsEditing(false)
      onChanged()
    } catch {
      setError('Yorum güncellenemedi.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!currentUserId) return
    if (!window.confirm('Bu yorum silinsin mi?')) return
    setLoading(true)
    setError('')
    try {
      await deleteComment(comment.id, currentUserId)
      onChanged()
    } catch {
      setError('Yorum silinemedi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <li className="border-b border-twitter-border py-2.5 text-sm last:border-b-0">
      <div className="mb-1 flex items-start justify-between gap-2">
        <div>
          <strong className="mr-1.5 text-twitter-text">{authorName}</strong>
          <span className="text-sm text-twitter-muted">@{comment.user?.email?.split('@')[0]}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={handleLike}
            disabled={loading}
            className={`${actionBtn} text-lg leading-none ${liked ? 'text-twitter-like hover:text-twitter-like' : ''}`}
            aria-label={liked ? 'Beğenildi' : 'Beğen'}
          >
            {liked ? '❤️' : '🤍'}
          </button>
          {isOwner && !isEditing && (
            <>
              <button type="button" onClick={() => { setIsEditing(true); setEditText(comment.content) }} disabled={loading} className={actionBtn}>
                Düzenle
              </button>
              <button type="button" onClick={handleDelete} disabled={loading} className={`${actionBtn} hover:text-twitter-danger`}>
                Sil
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="mt-1 flex flex-col gap-2">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            maxLength={200}
            rows={2}
            className={textareaClass}
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => { setIsEditing(false); setEditText(comment.content) }} disabled={loading} className="rounded-full border border-twitter-border bg-transparent px-3.5 py-1.5 text-xs text-twitter-text">
              İptal
            </button>
            <button type="button" onClick={handleUpdate} disabled={loading || !editText.trim()} className="rounded-full bg-twitter-blue px-3.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
              Kaydet
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-1 break-words text-twitter-text">{comment.content}</p>
      )}

      {error && <p className="mt-1 text-sm text-twitter-danger">{error}</p>}
    </li>
  )
}
