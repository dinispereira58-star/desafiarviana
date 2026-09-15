import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LogOut, Compass, Inbox, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import { BOOKING_STATUSES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import BookingRow from '@/components/BookingRow'
import BookingDetailModal from '@/components/BookingDetailModal'

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200/70 px-3.5 py-3 shadow-sm shadow-slate-200/40">
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', tone)}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xl font-display font-bold text-slate-800 leading-none">{value}</p>
        <p className="text-[11px] text-slate-400 font-medium mt-1">{label}</p>
      </div>
    </div>
  )
}

export default function Bookings() {
  const { user, logout } = useAuth()
  const qc = useQueryClient()
  const [openId, setOpenId] = useState(null)
  const [filter, setFilter] = useState('all')

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('booking_requests').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
    refetchInterval: 30000,
  })

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      const { error } = await supabase.from('booking_requests').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  })

  const stats = useMemo(() => ({
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    declined: bookings.filter(b => b.status === 'declined').length,
    total: bookings.length,
  }), [bookings])

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  return (
    <div className="min-h-screen">
      <header className="bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white shadow-md shadow-orange-200">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display font-bold text-slate-800 text-base leading-tight">Desafiar Viana</h1>
              <p className="text-[11px] text-slate-400 font-medium">Pedidos de Marcação</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">{user?.email}</span>
            <button onClick={logout} className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors" title="Sair">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto p-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={Inbox} label="Total" value={stats.total} tone="bg-slate-100 text-slate-600" />
          <StatCard icon={Clock} label="Pendentes" value={stats.pending} tone="bg-amber-50 text-amber-600" />
          <StatCard icon={CheckCircle2} label="Confirmadas" value={stats.confirmed} tone="bg-emerald-50 text-emerald-600" />
          <StatCard icon={XCircle} label="Recusadas" value={stats.declined} tone="bg-rose-50 text-rose-600" />
        </div>

        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit overflow-x-auto">
          <button onClick={() => setFilter('all')}
            className={cn('px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap', filter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50')}>
            Todos ({bookings.length})
          </button>
          {BOOKING_STATUSES.map(s => (
            <button key={s.key} onClick={() => setFilter(s.key)}
              className={cn('px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap', filter === s.key ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50')}>
              {s.label} ({bookings.filter(b => b.status === s.key).length})
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-xl border border-slate-100 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-300">
            <Inbox className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm italic">Sem pedidos de marcação{filter !== 'all' ? ' neste estado' : ''}</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map(b => (
              <BookingRow key={b.id} booking={b} onOpen={() => setOpenId(b.id)}
                onQuickStatus={status => updateStatus.mutate({ id: b.id, status })} />
            ))}
          </div>
        )}
      </main>

      {openId && <BookingDetailModal bookingId={openId} onClose={() => setOpenId(null)} />}
    </div>
  )
}
