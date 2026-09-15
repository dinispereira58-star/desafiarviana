import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Search, Calendar, Repeat, ChevronRight, X, Plus, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { BOOKING_STATUS_MAP } from '@/lib/constants'
import { useActivitiesMap } from '@/lib/useActivitiesMap'
import { cn, formatDate, formatDateTime } from '@/lib/utils'

const iCls = 'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 bg-slate-50 transition-all'

// Um "cliente" agrega dois tipos de origem: os adicionados manualmente
// (tabela customers) e os que já pediram pelo menos uma marcação
// (booking_requests) — juntos pela combinação telefone/email/nome.
function buildCustomers(bookings, manualCustomers) {
  const map = new Map()
  for (const c of manualCustomers) {
    const key = (c.phone || c.email || c.name || '').trim().toLowerCase()
    if (!key) continue
    map.set(key, { key, id: c.id, name: c.name, phone: c.phone, email: c.email, notes: c.notes, createdAt: c.created_at, bookings: [] })
  }
  for (const b of bookings) {
    const key = (b.phone || b.email || b.name || '').trim().toLowerCase()
    if (!key) continue
    if (!map.has(key)) map.set(key, { key, name: b.name, phone: b.phone, email: b.email, bookings: [] })
    const c = map.get(key)
    if (!c.bookings.length || new Date(b.created_at) > new Date(c.bookings[0]?.created_at || 0)) {
      c.name = c.name || b.name; c.phone = c.phone || b.phone; c.email = c.email || b.email
    }
    c.bookings.push(b)
  }
  return [...map.values()].map(c => ({
    ...c,
    bookings: c.bookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    total: c.bookings.length,
    confirmed: c.bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length,
    lastActivity: c.bookings[0]?.created_at || c.createdAt,
  })).sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
}

function NewCustomerModal({ onClose }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('customers').insert(form)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); toast.success('Cliente adicionado!'); onClose() },
    onError: e => toast.error('Erro: ' + e.message),
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('O nome é obrigatório')
    setSaving(true)
    try { await create.mutateAsync() } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-display font-bold text-slate-800">Novo Cliente</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nome</label>
            <input required value={form.name} onChange={e => set('name', e.target.value)} className={iCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Telefone</label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)} className={iCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={iCls} />
          </div>
          <button type="submit" disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-br from-brand to-brand-dark text-white rounded-xl text-sm font-bold shadow-sm disabled:opacity-50">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Adicionar
          </button>
        </form>
      </div>
    </div>
  )
}

export default function Clientes() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [showNew, setShowNew] = useState(false)
  const activityMap = useActivitiesMap()

  const { data: bookings = [], isLoading: loadingBookings } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('booking_requests').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
  })
  const { data: manualCustomers = [], isLoading: loadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
  })

  const customers = useMemo(() => buildCustomers(bookings, manualCustomers), [bookings, manualCustomers])
  const filtered = useMemo(() => {
    if (!search.trim()) return customers
    const q = search.toLowerCase()
    return customers.filter(c => c.name?.toLowerCase().includes(q) || c.phone?.includes(q) || c.email?.toLowerCase().includes(q))
  }, [customers, search])

  const isLoading = loadingBookings || loadingCustomers

  return (
    <div className="p-6 max-w-[1000px] mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-slate-800 text-lg">Clientes</h1>
          <p className="text-xs text-slate-400 mt-0.5">{customers.length} cliente(s)</p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar por nome, telefone ou email..."
              className="pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 bg-white w-72 transition-all" />
          </div>
          <button onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-br from-brand to-brand-dark text-white rounded-xl text-xs font-bold shadow-sm shrink-0">
            <Plus className="w-3.5 h-3.5" /> Novo Cliente
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2.5">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-white rounded-xl border border-slate-100 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-300">
          <p className="text-sm italic">Sem clientes ainda</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(c => (
            <button key={c.key} onClick={() => setSelected(c)}
              className="group w-full flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-4 py-3.5 hover:border-orange-300 hover:shadow-sm transition-all text-left">
              <div className="w-10 h-10 rounded-full bg-orange-50 text-brand font-bold flex items-center justify-center text-sm shrink-0">
                {c.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{c.name}</p>
                <p className="text-xs text-slate-400 truncate">{[c.phone, c.email].filter(Boolean).join(' · ')}</p>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-400 shrink-0">
                <span className="flex items-center gap-1"><Repeat className="w-3 h-3" />{c.total} pedido(s)</span>
                {c.lastActivity && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(c.lastActivity)}</span>}
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500 transition-colors shrink-0" />
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="font-display font-bold text-slate-800">{selected.name}</h2>
                <p className="text-xs text-slate-400">{[selected.phone, selected.email].filter(Boolean).join(' · ')}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2.5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Histórico de pedidos</p>
              {selected.bookings.length === 0 && <p className="text-xs text-slate-300 italic">Ainda sem pedidos de marcação</p>}
              {selected.bookings.map(b => {
                const activity = activityMap[b.activity_id]
                const status = BOOKING_STATUS_MAP[b.status]
                return (
                  <div key={b.id} className="flex items-center gap-3 bg-slate-50 rounded-xl px-3.5 py-2.5">
                    <span className="text-lg shrink-0">{activity?.emoji || '📋'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{b.activity_name || activity?.name}</p>
                      <p className="text-[11px] text-slate-400">{formatDateTime(b.created_at)}{b.preferred_date ? ` · pretendia ${formatDate(b.preferred_date)}` : ''}</p>
                    </div>
                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0', status?.color)}>{status?.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {showNew && <NewCustomerModal onClose={() => setShowNew(false)} />}
    </div>
  )
}
