import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { login as loginApi } from '../api/auth'
import { clearStoredAuth, getStoredAuth, setStoredAuth } from '../api/client'
import type { AuthCredentials } from '../types'

export interface AuthUser {
  userId: number
  email: string
  name: string
  surname: string
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  isLoading: boolean
  error: string | null
}

function loadFromStorage(): Pick<AuthState, 'token' | 'user'> {
  const stored = getStoredAuth()
  if (!stored) return { token: null, user: null }
  return {
    token: stored.token,
    user: {
      userId: stored.userId,
      email: stored.email,
      name: stored.name,
      surname: stored.surname,
    },
  }
}

const initialState: AuthState = {
  ...loadFromStorage(),
  isLoading: false,
  error: null,
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: AuthCredentials, { rejectWithValue }) => {
    try {
      const response = await loginApi(credentials)
      const stored = {
        token: response.jwtToken,
        userId: response.userId,
        email: response.email,
        name: response.name,
        surname: response.surname,
      }
      setStoredAuth(stored)
      return stored
    } catch (error: unknown) {
      clearStoredAuth()
      const status =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        (error as { response?: { status?: number } }).response?.status

      if (status === 401) {
        return rejectWithValue('E-posta veya şifre hatalı.')
      }
      return rejectWithValue('Giriş yapılamadı.')
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      clearStoredAuth()
      state.token = null
      state.user = null
      state.error = null
    },
    clearAuthError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.token = action.payload.token
        state.user = {
          userId: action.payload.userId,
          email: action.payload.email,
          name: action.payload.name,
          surname: action.payload.surname,
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.token = null
        state.user = null
        state.error = (action.payload as string) ?? 'Giriş yapılamadı.'
      })
  },
})

export const { logout, clearAuthError } = authSlice.actions
export default authSlice.reducer

type AuthRootState = { auth: AuthState }

export const selectIsAuthenticated = (state: AuthRootState) =>
  !!state.auth.token && !!state.auth.user

export const selectUserId = (state: AuthRootState) => state.auth.user?.userId ?? null

export const selectEmail = (state: AuthRootState) => state.auth.user?.email ?? null

export const selectDisplayName = (state: AuthRootState) =>
  state.auth.user ? `${state.auth.user.name} ${state.auth.user.surname}` : null

export const selectAuthLoading = (state: AuthRootState) => state.auth.isLoading

export const selectAuthError = (state: AuthRootState) => state.auth.error
