import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type{ Tweet } from '../types'
import { getTweetById } from '../api/tweets'
import TweetCard from '../components/TweetCard'

function isConnectionError(error:unknown){
    return typeof error ==="object" && error !== null && 'code' in error &&
    (error as { code?: string }).code === 'ERR_NETWORK'
}

const TweetDetailPage = () => {
    const { id } = useParams()
    const[tweet,setTweet] = useState<Tweet | null>(null)
    const[loading,setLoading] = useState(true)
    const[error,setError] = useState('')

    const loadTweet =useCallback(async()=>{
        setLoading(true)
        setError('')
        try{
            setTweet(await getTweetById(Number(id)))
        
        }
        catch(err){
            setError(isConnectionError(err) ? 'Backend bağlantısı kurulamadı (port 3000).' : 'Tweet yüklenemedi.')
        } finally{
            setLoading(false)
        }
    },[id])

    useEffect(()=>{loadTweet()},[loadTweet])

    
  return (
    <div className="flex flex-col gap-4 py-20 ">
        {loading && <p className="px-5 py-8 text-center text-twitter-muted">Yükleniyor...</p>}
        {error && <p className="px-5 py-8 text-center text-sm text-twitter-danger">{error}</p>}
        {tweet && (
          <TweetCard
            key={tweet.id}
            tweet={tweet}
            onUpdate={loadTweet}
            defaultCommentsOpen
          />
        )}
    </div>
  )
}

export default TweetDetailPage