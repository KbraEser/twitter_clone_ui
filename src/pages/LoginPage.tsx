import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { clearAuthError, loginUser, selectAuthError, selectAuthLoading } from '../store/authSlice'

const inputClass =
  'rounded-lg border border-twitter-border bg-black px-4 py-3 text-twitter-text focus:border-transparent focus:outline-2 focus:outline-twitter-blue'

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const authError = useAppSelector(selectAuthError)
  const isLoading = useAppSelector(selectAuthLoading)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLocalError('')
    dispatch(clearAuthError())
    try {
      await dispatch(loginUser({ email, password })).unwrap()
      navigate('/')
    } catch (err) {
      setLocalError(typeof err === 'string' ? err : 'Giriş başarısız.')
    }
  }

  const error = localError || authError

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-[420px] rounded-2xl border border-twitter-border bg-twitter-card p-8">
        <h1 className="mb-1 text-[1.75rem] text-twitter-text">Giriş Yap</h1>
        <p className="mb-6 text-twitter-muted">E-posta ve şifrenizle giriş yapın</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm text-twitter-text">
            E-posta
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-twitter-text">
            Şifre
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={inputClass}
            />
          </label>
          {error && <p className="text-sm text-twitter-danger">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 rounded-full bg-twitter-blue px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
        <p className="mt-6 text-center text-twitter-muted">
          Hesabın yok mu? <Link to="/register">Kayıt ol</Link>
        </p>
      </div>
    </div>
  )
}
