import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import likesReducer from './likesSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    likes: likesReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
