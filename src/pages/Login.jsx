import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Compass, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      toast.error('Erro ao entrar: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-slate-50">
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-orange-200 rounded-full blur-3xl opacity-40" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-100 rounded-full blur-3xl opacity-40" />

      <div className="relative w-full max-w-sm bg-white/90 backdrop-blur rounded-3xl shadow-xl shadow-slate-200/60 border border-white p-8">
        <div className="flex flex-col items-center text-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white shadow-lg shadow-orange-200 mb-4">
            <Compass className="w-6 h-6" />
          </div>
          <h1 className="font-display font-bold text-slate-800 text-lg">Desafiar Viana</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Gestão de Atividades & Reservas</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 bg-slate-50 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Palavra-passe</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 bg-slate-50 transition-all" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-br from-brand to-brand-dark hover:brightness-95 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-orange-200 disabled:opacity-50">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
