import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/auth'

const inputClass =
  'rounded-lg border border-twitter-border bg-black px-4 py-3 text-twitter-text focus:border-transparent focus:outline-2 focus:outline-twitter-blue'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', surname: '', email: '', password: '', picture: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await register({ ...form, picture: form.picture || undefined })
      setSuccess(res.message)
      setTimeout(() => navigate('/login'), 2000)
    } catch { setError('Kayıt başarısız.') }
    finally { setLoading(false) }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-[420px] rounded-2xl border border-twitter-border bg-twitter-card p-8">
        <h1 className="mb-6 text-[1.75rem] text-twitter-text">Kayıt Ol</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm text-twitter-text">
            Ad
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-twitter-text">
            Soyad
            <input value={form.surname} onChange={(e) => setForm({ ...form, surname: e.target.value })} required className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-twitter-text">
            E-posta
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-twitter-text">
            Şifre
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} maxLength={20} className={inputClass} />
          </label>
          {error && <p className="text-sm text-twitter-danger">{error}</p>}
          {success && <p className="text-sm text-twitter-success">{success}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-twitter-blue px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
          </button>
        </form>
        <p className="mt-6 text-center text-twitter-muted">
          Hesabın var mı? <Link to="/login">Giriş yap</Link>
        </p>
      </div>
    </div>
  )
}
