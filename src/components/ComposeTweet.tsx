import { useState, type FormEvent } from 'react'
import { createTweet } from '../api/tweets'
import { useAppSelector } from '../store/hooks'
import { selectUserId } from '../store/authSlice'

interface ComposeTweetProps {
  onTweetCreated: () => void
  placeholder?: string
  tweetId?: number
}

export default function ComposeTweet({
  onTweetCreated,
  placeholder = 'Neler oluyor?',
  tweetId,
}: ComposeTweetProps) {
  const userId = useAppSelector(selectUserId)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!userId || !content.trim()) return

    setLoading(true)
    setError('')
    try {
      await createTweet({
        content: content.trim(),
        tweetId,
      })
      setContent('')
      onTweetCreated()
    } catch {
      setError('Tweet gönderilemedi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="flex flex-col gap-3 border-b border-twitter-border px-5 py-4" onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        maxLength={255}
        rows={3}
        className="w-full resize-none border-0 bg-transparent text-xl text-twitter-text focus:outline-none"
      />
      {error && <p className="text-sm text-twitter-danger">{error}</p>}
      <div className="flex items-center justify-between">
        <span className="text-sm text-twitter-muted">{content.length}/255</span>
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="rounded-full bg-twitter-blue px-5 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Gönderiliyor...' : tweetId ? 'Retweet' : 'Tweetle'}
        </button>
      </div>
    </form>
  )
}
