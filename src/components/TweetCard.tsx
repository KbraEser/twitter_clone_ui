import { useCallback, useEffect, useState } from 'react'
import { createComment, getCommentsByTweetId } from '../api/comments'
import CommentItem from './CommentItem'
import { createTweet, deleteTweet, updateTweet } from '../api/tweets'
import { dislike, like } from '../api/likes'
import type { Comment, Tweet } from '../types'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectUserId } from '../store/authSlice'
import { selectIsTweetLiked, setTweetLiked } from '../store/likesSlice'
import {
  isAlreadyLikedError,
  isLikeNotFoundError,
} from '../utils/likesStorage'

interface TweetCardProps {
  tweet: Tweet
  onUpdate: () => void
}

const actionBtn =
  'rounded border-0 bg-transparent px-2 py-1 text-sm text-twitter-muted hover:bg-twitter-blue/10 hover:text-twitter-blue'

const textareaClass =
  'resize-none rounded-lg border border-twitter-border bg-black px-3 py-2 text-twitter-text focus:outline-none'

export default function TweetCard({ tweet, onUpdate }: TweetCardProps) {
  const dispatch = useAppDispatch()
  const userId = useAppSelector(selectUserId)
  const liked = useAppSelector((state) => selectIsTweetLiked(state, tweet.id))
  const [comments, setComments] = useState<Comment[]>([])
  const [showCommentsSection, setShowCommentsSection] = useState(false)
  const [commentsLoaded, setCommentsLoaded] = useState(false)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [showRetweetMenu, setShowRetweetMenu] = useState(false)
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [quoteText, setQuoteText] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(tweet.content ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setEditText(tweet.content ?? '')
  }, [tweet.content])

  const author = tweet.user
  const displayName = author ? `${author.name} ${author.surname}` : 'Bilinmeyen'
  const isOwner = userId === author?.id
  const parent = tweet.parentTweet
  const isPureRetweet = !!parent && !tweet.content?.trim()
  const canEdit = isOwner && !isPureRetweet

  const loadComments = useCallback(async () => {
    setCommentsLoading(true)
    setError('')
    try {
      const data = await getCommentsByTweetId(tweet.id)
      setComments(data)
      setCommentsLoaded(true)
    } catch {
      setComments([])
      setCommentsLoaded(true)
      setError('Yorumlar yüklenemedi. Backend yeniden başlatıldı mı?')
    } finally {
      setCommentsLoading(false)
    }
  }, [tweet.id])

  async function toggleCommentsSection() {
    const willOpen = !showCommentsSection
    setShowCommentsSection(willOpen)
    setShowRetweetMenu(false)
    setShowQuoteForm(false)
    if (willOpen) {
      await loadComments()
    }
  }

  async function handleLike() {
    if (!userId) return
    setLoading(true)
    setError('')
    try {
      if (liked) {
        await dislike({ tweet: { id: tweet.id } })
        dispatch(setTweetLiked({ tweetId: tweet.id, liked: false }))
      } else {
        await like({ tweet: { id: tweet.id } })
        dispatch(setTweetLiked({ tweetId: tweet.id, liked: true }))
      }
    } catch (err) {
      if (!liked && isAlreadyLikedError(err)) {
        dispatch(setTweetLiked({ tweetId: tweet.id, liked: true }))
      } else if (liked && isLikeNotFoundError(err)) {
        dispatch(setTweetLiked({ tweetId: tweet.id, liked: false }))
      } else {
        setError('Beğeni işlemi başarısız.')
      }
    } finally { setLoading(false) }
  }

  async function handleSimpleRetweet() {
    if (!userId) return
    setLoading(true)
    try {
      await createTweet({ tweetId: tweet.id })
      setShowRetweetMenu(false)
      onUpdate()
    } catch { setError('Retweet gönderilemedi.') }
    finally { setLoading(false) }
  }

  async function handleQuoteRetweet() {
    if (!userId || !quoteText.trim()) return
    setLoading(true)
    try {
      await createTweet({ tweetId: tweet.id, content: quoteText.trim() })
      setShowQuoteForm(false)
      setQuoteText('')
      onUpdate()
    } catch { setError('Alıntı tweet gönderilemedi.') }
    finally { setLoading(false) }
  }

  async function handleUpdate() {
    if (!canEdit || !editText.trim()) return
    setLoading(true)
    setError('')
    try {
      await updateTweet(tweet.id, { content: editText.trim() })
      setIsEditing(false)
      onUpdate()
    } catch {
      setError('Tweet güncellenemedi.')
    } finally {
      setLoading(false)
    }
  }

  async function handleComment() {
    if (!userId || !commentText.trim()) return
    setLoading(true)
    setError('')
    try {
      const newComment = await createComment({
        userId,
        tweetId: tweet.id,
        content: commentText.trim(),
      })
      setCommentText('')
      setComments((prev) => {
        const exists = prev.some((c) => c.id === newComment.id)
        return exists ? prev : [...prev, newComment]
      })
      setCommentsLoaded(true)
      setShowCommentsSection(true)
      await loadComments()
    } catch {
      setError('Yorum gönderilemedi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <article className="flex gap-3 border-b border-twitter-border px-5 py-4 transition-colors hover:bg-[#080808]">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-twitter-blue font-bold text-white">
        {author?.picture ? <img src={author.picture} alt={displayName} className="h-full w-full object-cover" /> : <span>{displayName.charAt(0).toUpperCase()}</span>}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-baseline gap-2">
          <strong className="text-twitter-text">{displayName}</strong>
          <span className="text-sm text-twitter-muted">@{author?.email?.split('@')[0]}</span>
        </div>

        {isPureRetweet && parent && (
          <>
            <p className="mb-2 text-sm text-twitter-muted">🔁 Retweetlendi</p>
            <QuotedTweet tweet={parent} />
          </>
        )}
        {!isPureRetweet && !isEditing && tweet.content && (
          <p className="mb-3 whitespace-pre-wrap break-words text-twitter-text">{tweet.content}</p>
        )}
        {!isPureRetweet && isEditing && (
          <div className="mb-3 flex flex-col gap-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              maxLength={255}
              rows={3}
              className={textareaClass}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setIsEditing(false); setEditText(tweet.content ?? '') }}
                disabled={loading}
                className="rounded-full border border-twitter-border bg-transparent px-3.5 py-1.5 text-sm text-twitter-text"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                disabled={loading || !editText.trim()}
                className="rounded-full bg-twitter-blue px-3.5 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                Kaydet
              </button>
            </div>
          </div>
        )}
        {!isPureRetweet && parent && <QuotedTweet tweet={parent} />}

        <div className="flex flex-wrap gap-4">
          <div className="relative">
            <button type="button" onClick={() => { setShowRetweetMenu(!showRetweetMenu); setShowCommentsSection(false) }} disabled={loading} className={actionBtn}>
              Retweet
            </button>
            {showRetweetMenu && (
              <div className="absolute left-0 top-full z-20 mt-1 min-w-[140px] overflow-hidden rounded-xl border border-twitter-border bg-twitter-card shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                <button type="button" onClick={handleSimpleRetweet} disabled={loading} className="block w-full px-4 py-3 text-left text-sm text-twitter-text hover:bg-[#1d1f23] hover:text-twitter-success">
                  Retweetle
                </button>
                <button type="button" onClick={() => { setShowQuoteForm(true); setShowRetweetMenu(false) }} disabled={loading} className="block w-full px-4 py-3 text-left text-sm text-twitter-text hover:bg-[#1d1f23] hover:text-twitter-success">
                  Alıntıla
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={toggleCommentsSection}
            disabled={loading}
            className={`${actionBtn} ${showCommentsSection ? 'text-twitter-blue' : ''}`}
          >
            💬 Yorum {commentsLoaded && comments.length > 0 && `(${comments.length})`}
          </button>
          <button
            type="button"
            onClick={handleLike}
            disabled={loading}
            className={`${actionBtn} px-1 text-lg leading-none ${liked ? 'text-twitter-like hover:text-twitter-like hover:bg-twitter-like/10' : ''}`}
            aria-label={liked ? 'Beğenildi' : 'Beğen'}
          >
            {liked ? '❤️' : '🤍'}
          </button>
          {canEdit && !isEditing && (
            <button
              type="button"
              onClick={() => { setIsEditing(true); setEditText(tweet.content ?? ''); setShowRetweetMenu(false); setShowCommentsSection(false) }}
              disabled={loading}
              className={actionBtn}
            >
              Düzenle
            </button>
          )}
          {isOwner && (
            <button
              type="button"
              onClick={async () => { if (confirm('Silinsin mi?')) { await deleteTweet(tweet.id); onUpdate() } }}
              disabled={loading}
              className={`${actionBtn} hover:bg-twitter-danger/10 hover:text-twitter-danger`}
            >
              Sil
            </button>
          )}
        </div>

        {error && <p className="mt-2 text-sm text-twitter-danger">{error}</p>}

        {showQuoteForm && (
          <div className="mt-3 flex flex-col gap-2">
            <textarea value={quoteText} onChange={(e) => setQuoteText(e.target.value)} placeholder="Yorumunuzu ekleyin..." maxLength={255} rows={3} className={textareaClass} />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setShowQuoteForm(false); setQuoteText('') }} className="rounded-full border border-twitter-border bg-transparent px-4 py-2 text-twitter-text">
                İptal
              </button>
              <button type="button" onClick={handleQuoteRetweet} disabled={loading || !quoteText.trim()} className="rounded-full bg-twitter-blue px-4 py-2 font-semibold text-white disabled:opacity-50">
                Alıntıla ve Tweetle
              </button>
            </div>
          </div>
        )}

        {showCommentsSection && (
          <div className="mt-3 border-t border-twitter-border pt-3">
            <div className="flex flex-col gap-2">
              <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Yorumunuzu yazın..." maxLength={200} rows={2} className={textareaClass} />
              <button
                type="button"
                onClick={handleComment}
                disabled={loading || !commentText.trim()}
                className="self-end rounded-full bg-twitter-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Gönder
              </button>
            </div>

            {commentsLoading && <p className="py-2 text-sm text-twitter-muted">Yorumlar yükleniyor...</p>}

            {!commentsLoading && comments.length > 0 && (
              <ul className="mt-3 list-none p-0">
                {comments.map((c) => (
                  <CommentItem
                    key={c.id}
                    comment={c}
                    tweetId={tweet.id}
                    currentUserId={userId}
                    onChanged={loadComments}
                  />
                ))}
              </ul>
            )}

            {!commentsLoading && commentsLoaded && comments.length === 0 && (
              <p className="py-2 text-sm text-twitter-muted">Henüz yorum yok. İlk yorumu siz yazın!</p>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

function QuotedTweet({ tweet }: { tweet: Tweet }) {
  const author = tweet.user
  const name = author ? `${author.name} ${author.surname}` : 'Bilinmeyen'
  return (
    <div className="mt-2 rounded-xl border border-twitter-border bg-black p-3">
      <div className="mb-1 flex items-baseline gap-2 text-sm">
        <strong className="text-twitter-text">{name}</strong>
        <span className="text-twitter-muted">@{author?.email?.split('@')[0]}</span>
      </div>
      <p className="whitespace-pre-wrap break-words text-twitter-text">{tweet.content || '(içeriksiz tweet)'}</p>
    </div>
  )
}
