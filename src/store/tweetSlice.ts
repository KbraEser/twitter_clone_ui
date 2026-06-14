import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { Tweet } from "../types"
import { getAllTweets } from "../api/tweets"

interface TweetState {
    tweets: Tweet[]
    loading: boolean
    error: string | null
}

const initialState: TweetState = {
    tweets: [],
    loading: false,
    error: null
}
function isConnectionError(error: unknown) {
    return typeof error === 'object' && error !== null && 'code' in error &&
      (error as { code?: string }).code === 'ERR_NETWORK'
  }


export const fetchTweets = createAsyncThunk(
    'tweets/fetchTweets',
    async(_,{rejectWithValue}) =>{
        try{
            return await getAllTweets()

        }catch(error:unknown){
           return rejectWithValue(isConnectionError(error) ? 'Backend bağlantısı kurulamadı (port 3000).' : 'Tweetler yüklenemedi.')
        }
    }
)

const tweetSlice = createSlice({
    name: 'tweets',
    initialState,
    reducers:{},
    extraReducers:(builder) => {
        builder
        .addCase(fetchTweets.pending,(state)=>{
            state.loading = true
            state.error = null
        })
        .addCase(fetchTweets.fulfilled,(state,action) =>{
            state.loading = false
            state.tweets = action.payload
        })
        .addCase(fetchTweets.rejected,(state,action) =>{
            state.loading = false
            state.error = (action.payload as string) ?? 'Tweetler yüklenemedi.'
        })
    }

})

export default tweetSlice.reducer

type TweetRootState = { tweets: TweetState }

export const selectTweets = (state: TweetRootState) => state.tweets.tweets
export const selectTweetsLoading = (state: TweetRootState) => state.tweets.loading
export const selectTweetsError = (state: TweetRootState) => state.tweets.error