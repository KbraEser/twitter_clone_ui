import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import likesReducer from './likesSlice'
import tweetReducer from './tweetSlice'
export const store = configureStore({
  reducer: {
    auth: authReducer,
    likes: likesReducer,
    tweets: tweetReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
