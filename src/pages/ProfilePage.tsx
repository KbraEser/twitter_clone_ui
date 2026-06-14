import { useCallback, useEffect, useState } from 'react'
import { getTweetsByUserId } from '../api/tweets'
import TweetCard from '../components/TweetCard'
import { useAppSelector } from '../store/hooks'
import { selectDisplayName, selectEmail, selectUserId } from '../store/authSlice'
import type { Tweet } from '../types'
import { useParams } from 'react-router-dom'

export default function ProfilePage() {
  const email = useAppSelector(selectEmail)
  const userId = useAppSelector(selectUserId)
  const authName = useAppSelector(selectDisplayName)
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(true)

  const { userId:userIdParam } = useParams<{ userId: string }>()

  const profileUserId = Number(userIdParam)
  // const isOwnProfile = profileUserId === userId

  const loadTweets = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try { setTweets((await getTweetsByUserId(profileUserId)).reverse()) }
    finally { setLoading(false) }
  }, [profileUserId])

  useEffect(() => { loadTweets() }, [loadTweets])

  const name = tweets[0]?.user
    ? `${tweets[0].user.name} ${tweets[0].user.surname}`
    : authName ?? email?.split('@')[0]

  return (
    <div>
      <header className="border-b border-twitter-border">
        <div className="h-[120px] bg-gradient-to-br from-[#1d3a5c] to-twitter-blue" />
        <div className="relative px-5 pb-4">
          <div className="-mt-10 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-black bg-twitter-blue text-3xl font-bold text-white">
            <span>{name?.charAt(0).toUpperCase()}</span>
          </div>
          <h1 className="mt-3 text-xl text-twitter-text">{name}</h1>
          <p className="text-twitter-muted">@{email?.split('@')[0]}</p>
          <p className="mt-2 text-twitter-muted">{tweets.length} Tweet</p>
        </div>
      </header>
      <div className="flex flex-col">
        {loading && <p className="px-5 py-8 text-center text-twitter-muted">Yükleniyor...</p>}
        {tweets.map((t) => <TweetCard key={t.id} tweet={t} onUpdate={loadTweets} />)}
      </div>
    </div>
  )
}
