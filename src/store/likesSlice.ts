import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { getStoredAuth } from '../api/client'
import {
  loadLikesForUser,
  saveLikesForUser,
} from '../utils/likesStorage'
import { loginUser, logout } from './authSlice'

interface LikesState {
  userId: number | null
  tweets: number[]
  comments: number[]
}

function buildInitialState(): LikesState {
  const stored = getStoredAuth()
  if (!stored?.userId) {
    return { userId: null, tweets: [], comments: [] }
  }
  const likes = loadLikesForUser(stored.userId)
  return { userId: stored.userId, ...likes }
}

const likesSlice = createSlice({
  name: 'likes',
  initialState: buildInitialState(),
  reducers: {
    setTweetLiked(state, action: PayloadAction<{ tweetId: number; liked: boolean }>) {
      if (!state.userId) return
      const ids = new Set(state.tweets)
      if (action.payload.liked) ids.add(action.payload.tweetId)
      else ids.delete(action.payload.tweetId)
      state.tweets = [...ids]
      saveLikesForUser(state.userId, { tweets: state.tweets, comments: state.comments })
    },
    setCommentLiked(state, action: PayloadAction<{ commentId: number; liked: boolean }>) {
      if (!state.userId) return
      const ids = new Set(state.comments)
      if (action.payload.liked) ids.add(action.payload.commentId)
      else ids.delete(action.payload.commentId)
      state.comments = [...ids]
      saveLikesForUser(state.userId, { tweets: state.tweets, comments: state.comments })
    },
    clearLikes(state) {
      state.userId = null
      state.tweets = []
      state.comments = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        const userId = action.payload.userId
        const likes = loadLikesForUser(userId)
        state.userId = userId
        state.tweets = likes.tweets
        state.comments = likes.comments
      })
      .addCase(logout, (state) => {
        state.userId = null
        state.tweets = []
        state.comments = []
      })
  },
})

export const { setTweetLiked, setCommentLiked, clearLikes } = likesSlice.actions
export default likesSlice.reducer

type LikesRootState = { likes: LikesState }

export const selectIsTweetLiked = (state: LikesRootState, tweetId: number) =>
  state.likes.tweets.includes(tweetId)

export const selectIsCommentLiked = (state: LikesRootState, commentId: number) =>
  state.likes.comments.includes(commentId)
