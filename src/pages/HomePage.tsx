import { useCallback, useEffect, useState } from 'react'
import { getAllTweets } from '../api/tweets'
import ComposeTweet from '../components/ComposeTweet'
import TweetCard from '../components/TweetCard'
import type { Tweet } from '../types'

function isConnectionError(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error &&
    (error as { code?: string }).code === 'ERR_NETWORK'
}

export default function HomePage() {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadTweets = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setTweets(await getAllTweets())
    } catch (err) {
      setError(isConnectionError(err) ? 'Backend bağlantısı kurulamadı (port 3000).' : 'Tweetler yüklenemedi.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadTweets() }, [loadTweets])

  return (
    <div>
      <header className="sticky top-0 z-10 border-b border-twitter-border bg-black/85 px-5 py-4 backdrop-blur-md">
        <h1 className="text-xl font-bold text-twitter-text">Ana Sayfa</h1>
      </header>
      <ComposeTweet onTweetCreated={loadTweets} />
      {loading && <p className="px-5 py-8 text-center text-twitter-muted">Yükleniyor...</p>}
      {error && <p className="px-5 py-8 text-center text-sm text-twitter-danger">{error}</p>}
      <div className="flex flex-col">
        {!loading && tweets.length === 0 && (
          <p className="px-5 py-8 text-center text-twitter-muted">Henüz kimse tweet atmamış.</p>
        )}
        {tweets.map((t) => <TweetCard key={t.id} tweet={t} onUpdate={loadTweets} />)}
      </div>
    </div>
  )
}
