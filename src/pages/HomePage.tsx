
import { useEffect } from 'react'
import ComposeTweet from '../components/ComposeTweet'
import TweetCard from '../components/TweetCard'
import { useAppSelector } from '../store/hooks'
import { useAppDispatch } from '../store/hooks'
import { fetchTweets, selectTweets, selectTweetsError, selectTweetsLoading } from '../store/tweetSlice'




export default function HomePage() {

  const dispatch = useAppDispatch()
  const tweets = useAppSelector(selectTweets)
  const loading = useAppSelector(selectTweetsLoading)
  const error = useAppSelector(selectTweetsError)
 

  useEffect(() => { dispatch(fetchTweets()) }, [dispatch])

  return (
    <div>
      <header className="sticky top-0 z-10 border-b border-twitter-border bg-black/85 px-5 py-4 backdrop-blur-md">
        <h1 className="text-xl font-bold text-twitter-text">Ana Sayfa</h1>
      </header>
      <ComposeTweet onTweetCreated={() => dispatch(fetchTweets())} />
      {loading && <p className="px-5 py-8 text-center text-twitter-muted">Yükleniyor...</p>}
      {error && <p className="px-5 py-8 text-center text-sm text-twitter-danger">{error}</p>}
      <div className="flex flex-col">
        {!loading && tweets.length === 0 && (
          <p className="px-5 py-8 text-center text-twitter-muted">Henüz kimse tweet atmamış.</p>
        )}
        {tweets.map((t) => <TweetCard key={t.id} tweet={t} onUpdate={() => dispatch(fetchTweets())} />)}
      </div>
    </div>
  )
}
