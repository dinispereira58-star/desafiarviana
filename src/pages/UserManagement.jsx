import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Trash2, KeyRound, Loader2, X, Mail, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import { formatDate } from '@/lib/utils'

const iCls = 'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 bg-slate-50 transition-all'

function NewUserModal({ onClose }) {
  const qc = useQueryClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)

  const create = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-users', { body: { action: 'create', email, password } })
      if (error) throw error
      if (data?.error) throw new Error(data.error_description || data.error)
      return data
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['crm-users'] }); toast.success('Utilizador criado!'); onClose() },
    onError: e => toast.error('Erro: ' + e.message),
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || password.length < 6) return toast.error('Email e password (mín. 6 caracteres) são obrigatórios')
    setSaving(true)
    try { await create.mutateAsync() } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-display font-bold text-slate-800">Novo Utilizador</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={iCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Palavra-passe inicial</label>
            <input type="text" required value={password} onChange={e => setPassword(e.target.value)} className={iCls} placeholder="mínimo 6 caracteres" />
          </div>
          <button type="submit" disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-br from-brand to-brand-dark text-white rounded-xl text-sm font-bold shadow-sm disabled:opacity-50">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Criar
          </button>
        </form>
      </div>
    </div>
  )
}

export default function UserManagement() {
  const { user: me } = useAuth()
  const qc = useQueryClient()
  const [showNew, setShowNew] = useState(false)
  const [resetTarget, setResetTarget] = useState(null)
  const [newPassword, setNewPassword] = useState('')

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['crm-users'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-users', { body: { action: 'list' } })
      if (error) throw error
      if (data?.error) throw new Error(data.error_description || data.error)
      return data.users || []
    },
  })

  const remove = useMutation({
    mutationFn: async (userId) => {
      const { data, error } = await supabase.functions.invoke('admin-users', { body: { action: 'delete', userId } })
      if (error) throw error
      if (data?.error) throw new Error(data.error_description || data.error)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['crm-users'] }); toast.success('Utilizador removido') },
    onError: e => toast.error('Erro: ' + e.message),
  })

  const resetPassword = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-users', { body: { action: 'updatePassword', userId: resetTarget.id, password: newPassword } })
      if (error) throw error
      if (data?.error) throw new Error(data.error_description || data.error)
    },
    onSuccess: () => { toast.success('Password atualizada!'); setResetTarget(null); setNewPassword('') },
    onError: e => toast.error('Erro: ' + e.message),
  })

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-slate-800 text-lg">Utilizadores</h1>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-br from-brand to-brand-dark text-white rounded-xl text-xs font-bold shadow-sm">
          <Plus className="w-3.5 h-3.5" /> Novo Utilizador
        </button>
      </div>

      {error && <p className="text-sm text-rose-500">Erro ao carregar: {error.message}</p>}

      {isLoading ? (
        <div className="space-y-2.5">{[1, 2].map(i => <div key={i} className="h-16 bg-white rounded-xl border border-slate-100 animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2.5">
          {users.map(u => (
            <div key={u.id} className="flex items-center gap-3.5 bg-white border border-slate-200 rounded-xl px-4 py-3.5">
              <div className="w-9 h-9 rounded-full bg-orange-50 text-brand font-bold flex items-center justify-center text-sm shrink-0">
                {u.email?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate flex items-center gap-1.5">
                  {u.email} {u.id === me?.id && <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full">tu</span>}
                </p>
                <p className="text-[11px] text-slate-400 flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> desde {formatDate(u.created_at)}</span>
                  {u.last_sign_in_at && <span>último acesso {formatDate(u.last_sign_in_at)}</span>}
                </p>
              </div>
              <button onClick={() => setResetTarget(u)} title="Definir nova password" className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg shrink-0"><KeyRound className="w-4 h-4" /></button>
              {u.id !== me?.id && (
                <button onClick={() => { if (confirm(`Remover o acesso de ${u.email}?`)) remove.mutate(u.id) }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg shrink-0"><Trash2 className="w-4 h-4" /></button>
              )}
            </div>
          ))}
        </div>
      )}

      {showNew && <NewUserModal onClose={() => setShowNew(false)} />}

      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => setResetTarget(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-display font-bold text-slate-800">Nova password — {resetTarget.email}</h2>
              <button onClick={() => setResetTarget(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); resetPassword.mutate() }} className="p-5 space-y-4">
              <input type="text" required value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="mínimo 6 caracteres" className={iCls} />
              <button type="submit" disabled={resetPassword.isPending}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-br from-brand to-brand-dark text-white rounded-xl text-sm font-bold shadow-sm disabled:opacity-50">
                {resetPassword.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Atualizar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
