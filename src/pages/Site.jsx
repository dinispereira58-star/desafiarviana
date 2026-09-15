import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, Save, Phone, Mail, MessageCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import Header from '@/components/Header'
import ActivityFormModal from '@/components/ActivityFormModal'

const iCls = 'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 bg-slate-50 transition-all'

function ActivitiesTab() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(null)
  const [showNew, setShowNew] = useState(false)

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const { data, error } = await supabase.from('activities').select('*').order('position', { ascending: true })
      if (error) throw error
      return data || []
    },
  })

  const toggleActive = useMutation({
    mutationFn: async (a) => {
      const { error } = await supabase.from('activities').update({ is_active: !a.is_active }).eq('id', a.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activities'] }),
  })

  const remove = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('activities').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['activities'] }); toast.success('Eliminada') },
    onError: e => toast.error('Erro: ' + e.message),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{activities.length} atividade(s) — o que estiver "Visível" aparece no site</p>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-br from-brand to-brand-dark text-white rounded-xl text-xs font-bold shadow-sm">
          <Plus className="w-3.5 h-3.5" /> Nova Atividade
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2.5">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-white rounded-xl border border-slate-100 animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2.5">
          {activities.map(a => (
            <div key={a.id} className="flex items-center gap-3.5 bg-white border border-slate-200 rounded-xl px-4 py-3.5">
              <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-lg shrink-0', a.color)}>{a.emoji}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{a.name}</p>
                <p className="text-xs text-slate-400 truncate">{a.tagline}</p>
              </div>
              <button onClick={() => toggleActive.mutate(a)} title={a.is_active ? 'Visível — clicar para ocultar' : 'Oculto — clicar para mostrar'}
                className={cn('p-2 rounded-lg transition-colors shrink-0', a.is_active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-300 hover:bg-slate-50')}>
                {a.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button onClick={() => setEditing(a)} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors shrink-0"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => { if (confirm(`Eliminar "${a.name}"?`)) remove.mutate(a.id) }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}

      {(showNew || editing) && (
        <ActivityFormModal activity={editing} onClose={() => { setShowNew(false); setEditing(null) }} />
      )}
    </div>
  )
}

function ContactTab() {
  const qc = useQueryClient()
  const [form, setForm] = useState({ contact_phone: '', contact_phone_link: '', contact_email: '', whatsapp_number: '' })

  const { data: settings, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_settings').select('*')
      if (error) throw error
      return Object.fromEntries((data || []).map(s => [s.key, s.value]))
    },
  })

  useEffect(() => { if (settings) setForm(f => ({ ...f, ...settings })) }, [settings])

  const save = useMutation({
    mutationFn: async () => {
      const rows = Object.entries(form).map(([key, value]) => ({ key, value }))
      const { error } = await supabase.from('site_settings').upsert(rows)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['site-settings'] }); toast.success('Contactos atualizados!') },
    onError: e => toast.error('Erro: ' + e.message),
  })

  if (isLoading) return <div className="h-40 bg-white rounded-xl border border-slate-100 animate-pulse" />

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg space-y-4">
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1.5"><Phone className="w-3.5 h-3.5" /> Telefone (texto mostrado)</label>
        <input value={form.contact_phone} onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))} className={iCls} placeholder="926 150 134 / 967 543 491" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Número para ligar (só dígitos, com indicativo)</label>
        <input value={form.contact_phone_link} onChange={e => setForm(f => ({ ...f, contact_phone_link: e.target.value }))} className={iCls} placeholder="351926150134" />
      </div>
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1.5"><Mail className="w-3.5 h-3.5" /> Email</label>
        <input value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} className={iCls} />
      </div>
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1.5"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp (com indicativo, sem espaços)</label>
        <input value={form.whatsapp_number} onChange={e => setForm(f => ({ ...f, whatsapp_number: e.target.value }))} className={iCls} placeholder="351926150134" />
      </div>
      <button onClick={() => save.mutate()} disabled={save.isPending}
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-brand to-brand-dark text-white rounded-xl text-sm font-bold shadow-sm disabled:opacity-50">
        {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Guardar
      </button>
    </div>
  )
}

export default function Site() {
  const [tab, setTab] = useState('activities')

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[1200px] mx-auto p-6 space-y-6">
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit">
          <button onClick={() => setTab('activities')}
            className={cn('px-4 py-1.5 rounded-lg text-xs font-bold transition-colors', tab === 'activities' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50')}>
            Atividades
          </button>
          <button onClick={() => setTab('contact')}
            className={cn('px-4 py-1.5 rounded-lg text-xs font-bold transition-colors', tab === 'contact' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50')}>
            Contacto
          </button>
        </div>

        {tab === 'activities' ? <ActivitiesTab /> : <ContactTab />}
      </main>
    </div>
  )
}
