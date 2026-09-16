import { useMemo, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Inbox, Clock, CheckCircle2, TrendingUp, Users, Trophy, Euro, BarChart3 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { BOOKING_STATUS_MAP } from '@/lib/constants'
import { useActivitiesMap } from '@/lib/useActivitiesMap'
import { cn, formatDateTime } from '@/lib/utils'

function formatCurrency(v) {
  return (v || 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function Bar({ pct, color }) {
  const [width, setWidth] = useState(0)
  useEffect(() => { const id = requestAnimationFrame(() => setWidth(pct)); return () => cancelAnimationFrame(id) }, [pct])
  return (
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out', color)} style={{ width: `${width}%` }} />
    </div>
  )
}

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
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const pending = bookings.filter(b => b.status === 'pending').length
    const confirmedThisWeek = bookings.filter(b => b.status === 'confirmed' && new Date(b.updated_at) >= weekAgo).length
    const thisMonth = bookings.filter(b => new Date(b.created_at) >= monthAgo)
    const decided = bookings.filter(b => ['confirmed', 'declined', 'completed', 'cancelled'].includes(b.status))
    const confirmRate = decided.length ? Math.round((decided.filter(b => !['declined', 'cancelled'].includes(b.status)).length / decided.length) * 100) : null
    const completed = bookings.filter(b => b.status === 'completed')
    const totalPeople = completed.reduce((s, b) => s + (b.actual_participants ?? b.people_count ?? 0), 0)
    const totalRevenue = completed.reduce((s, b) => s + (b.revenue || 0), 0)
    const revenueThisMonth = completed.filter(b => new Date(b.updated_at || b.created_at) >= monthStart).reduce((s, b) => s + (b.revenue || 0), 0)

    // Quantidade de atividades realizadas por categoria (cada atividade do
    // catálogo funciona como categoria — paintball, bubble soccer, etc.)
    const byCategory = Object.values(
      completed.reduce((acc, b) => {
        const key = b.activity_id || 'outro'
        if (!acc[key]) {
          const activity = activityMap[b.activity_id]
          acc[key] = { id: key, name: b.activity_name || activity?.name || 'Outra', emoji: activity?.emoji || '📋', color: activity?.color || 'from-slate-400 to-slate-500', count: 0 }
        }
        acc[key].count++
        return acc
      }, {})
    ).sort((a, b) => b.count - a.count)

    return { pending, confirmedThisWeek, monthTotal: thisMonth.length, confirmRate, totalPeople, completedCount: completed.length, totalRevenue, revenueThisMonth, byCategory }
  }, [bookings, activityMap])

  const recent = bookings.slice(0, 8)
  const maxCategoryCount = stats.byCategory?.[0]?.count || 1

  return (
    <div className="p-6 max-w-[1100px] mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-slate-800 text-lg">Dashboard</h1>
        <p className="text-xs text-slate-400 mt-0.5">Bem-vindo de volta 👋</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">{[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-28 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KPICard icon={Clock} label="Pedidos pendentes" value={stats.pending} tone="bg-amber-50 text-amber-600" />
          <KPICard icon={CheckCircle2} label="Confirmadas esta semana" value={stats.confirmedThisWeek} tone="bg-emerald-50 text-emerald-600" />
          <KPICard icon={Inbox} label="Pedidos (últimos 30 dias)" value={stats.monthTotal} tone="bg-orange-50 text-brand" />
          <KPICard icon={TrendingUp} label="Taxa de confirmação" value={stats.confirmRate !== null ? `${stats.confirmRate}%` : '—'} tone="bg-sky-50 text-sky-600" />
          <KPICard icon={Trophy} label="Atividades realizadas" value={stats.completedCount} tone="bg-purple-50 text-purple-600" />
          <KPICard icon={Users} label="Pessoas atendidas" value={stats.totalPeople} sub="nas atividades realizadas" tone="bg-pink-50 text-pink-600" />
        </div>
      )}

      {!isLoading && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Euro className="w-4 h-4" /></div>
              <p className="text-sm font-display font-bold text-slate-700">Ganhos</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-display font-bold text-slate-800">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-xs text-slate-400 mt-0.5">Total (atividades realizadas)</p>
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-emerald-600">{formatCurrency(stats.revenueThisMonth)}</p>
                <p className="text-xs text-slate-400 mt-0.5">Este mês</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-brand flex items-center justify-center"><BarChart3 className="w-4 h-4" /></div>
              <p className="text-sm font-display font-bold text-slate-700">Atividades por categoria</p>
            </div>
            {stats.byCategory.length === 0 ? (
              <p className="text-xs text-slate-300 italic text-center py-6">Ainda sem atividades realizadas</p>
            ) : (
              <div className="space-y-3">
                {stats.byCategory.map(c => (
                  <div key={c.id} className="flex items-center gap-3">
                    <span className="text-base shrink-0">{c.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-slate-600 truncate">{c.name}</span>
                        <span className="font-bold text-slate-800 shrink-0 ml-2">{c.count}</span>
                      </div>
                      <Bar pct={Math.max(6, Math.round((c.count / maxCategoryCount) * 100))} color={c.color} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
