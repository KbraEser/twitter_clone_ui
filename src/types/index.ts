export interface User {
  id: number
  name: string
  surname: string
  email: string
  picture?: string
}

export interface Tweet {
  id: number
  content: string | null
  user: User
  parentTweet?: Tweet | null
}

export interface Comment {
  id: number
  content: string
  user: User
  tweet?: Tweet
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  jwtToken: string
  userId: number
  email: string
  name: string
  surname: string
}

export interface RegisterRequest {
  name: string
  surname: string
  email: string
  password: string
  picture?: string
}

export interface RegisterResponse {
  email: string
  message: string
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface TweetRequest {
  content?: string
  tweetId?: number
}

export interface TweetUpdateRequest {
  content: string
}

export interface CommentRequest {
  content: string
  userId: number
  tweetId: number
}

export interface LikeRequest {
  tweet?: { id: number }
  comment?: { id: number }
}
