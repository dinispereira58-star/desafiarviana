import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Inbox, Clock, CheckCircle2, TrendingUp, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { BOOKING_STATUS_MAP } from '@/lib/constants'
import { useActivitiesMap } from '@/lib/useActivitiesMap'
import { cn, formatDateTime } from '@/lib/utils'

function KPICard({ icon: Icon, label, value, sub, tone }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm shadow-slate-200/40">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', tone)}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-display font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-400 font-medium mt-1">{label}</p>
      {sub && <p className="text-[11px] text-slate-300 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const activityMap = useActivitiesMap()
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('booking_requests').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
  })

  const stats = useMemo(() => {
    const now = new Date()
    const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date(now); monthAgo.setDate(monthAgo.getDate() - 30)
    const pending = bookings.filter(b => b.status === 'pending').length
    const confirmedThisWeek = bookings.filter(b => b.status === 'confirmed' && new Date(b.updated_at) >= weekAgo).length
    const thisMonth = bookings.filter(b => new Date(b.created_at) >= monthAgo)
    const decided = bookings.filter(b => ['confirmed', 'declined', 'completed', 'cancelled'].includes(b.status))
    const confirmRate = decided.length ? Math.round((decided.filter(b => !['declined', 'cancelled'].includes(b.status)).length / decided.length) * 100) : null
    const completed = bookings.filter(b => b.status === 'completed')
    const totalPeople = completed.reduce((s, b) => s + (b.actual_participants ?? b.people_count ?? 0), 0)
    return { pending, confirmedThisWeek, monthTotal: thisMonth.length, confirmRate, totalPeople }
  }, [bookings])

  const recent = bookings.slice(0, 8)

  return (
    <div className="p-6 max-w-[1100px] mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-slate-800 text-lg">Dashboard</h1>
        <p className="text-xs text-slate-400 mt-0.5">Bem-vindo de volta 👋</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-28 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <KPICard icon={Clock} label="Pedidos pendentes" value={stats.pending} tone="bg-amber-50 text-amber-600" />
          <KPICard icon={CheckCircle2} label="Confirmadas esta semana" value={stats.confirmedThisWeek} tone="bg-emerald-50 text-emerald-600" />
          <KPICard icon={Inbox} label="Pedidos (últimos 30 dias)" value={stats.monthTotal} tone="bg-orange-50 text-brand" />
          <KPICard icon={TrendingUp} label="Taxa de confirmação" value={stats.confirmRate !== null ? `${stats.confirmRate}%` : '—'} tone="bg-sky-50 text-sky-600" />
          <KPICard icon={Users} label="Pessoas atendidas" value={stats.totalPeople} sub="atividades realizadas" tone="bg-pink-50 text-pink-600" />
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <p className="text-sm font-display font-bold text-slate-700">Atividade recente</p>
        </div>
        <div className="divide-y divide-slate-100">
          {recent.length === 0 && <p className="text-center text-sm text-slate-300 italic py-10">Sem pedidos ainda</p>}
          {recent.map(b => {
            const activity = activityMap[b.activity_id]
            const status = BOOKING_STATUS_MAP[b.status]
            return (
              <div key={b.id} className="flex items-center gap-3 px-5 py-3">
                <span className="text-lg shrink-0">{activity?.emoji || '📋'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 truncate"><span className="font-semibold">{b.name}</span> pediu {b.activity_name || activity?.name}</p>
                  <p className="text-[11px] text-slate-400">{formatDateTime(b.created_at)}</p>
                </div>
                <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0', status?.color)}>{status?.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
