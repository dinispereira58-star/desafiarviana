import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { Plus, Eye, Heart, MessageSquare, Share2, Target, Megaphone } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { PLATFORMS, PLATFORM_MAP, PUB_STATUSES, PUB_STATUS_MAP } from '@/lib/publicationsConstants'
import { cn, formatDate } from '@/lib/utils'
import PublicationFormModal from '@/components/PublicationFormModal'

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200/70 px-3.5 py-3 shadow-sm shadow-slate-200/40">
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', tone)}><Icon className="w-4 h-4" /></div>
      <div>
        <p className="text-xl font-display font-bold text-slate-800 leading-none">{value}</p>
        <p className="text-[11px] text-slate-400 font-medium mt-1">{label}</p>
      </div>
    </div>
  )
}

export default function Publications() {
  const [showNew, setShowNew] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filterPlatform, setFilterPlatform] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const { data: publications = [], isLoading } = useQuery({
    queryKey: ['publications'],
    queryFn: async () => {
      const { data, error } = await supabase.from('publications').select('*').order('scheduled_date', { ascending: false, nullsFirst: false })
      if (error) throw error
      return data || []
    },
  })

  const stats = useMemo(() => {
    const published = publications.filter(p => p.status === 'publicado')
    return {
      total: publications.length,
      published: published.length,
      views: published.reduce((s, p) => s + (p.views || 0), 0),
      engagement: published.reduce((s, p) => s + (p.likes || 0) + (p.comments || 0) + (p.shares || 0), 0),
      leads: published.reduce((s, p) => s + (p.leads_generated || 0), 0),
    }
  }, [publications])

  const chartData = useMemo(() => {
    const byPlatform = {}
    for (const p of publications.filter(p => p.status === 'publicado')) {
      const label = PLATFORM_MAP[p.platform]?.label || p.platform
      if (!byPlatform[label]) byPlatform[label] = { name: label, Visualizações: 0, Engagement: 0 }
      byPlatform[label].Visualizações += p.views || 0
      byPlatform[label].Engagement += (p.likes || 0) + (p.comments || 0) + (p.shares || 0)
    }
    return Object.values(byPlatform)
  }, [publications])

  const filtered = publications.filter(p =>
    (filterPlatform === 'all' || p.platform === filterPlatform) &&
    (filterStatus === 'all' || p.status === filterStatus)
  )

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="font-display font-bold text-slate-800 text-lg">Publicações</h1>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-br from-brand to-brand-dark text-white rounded-xl text-xs font-bold shadow-sm">
          <Plus className="w-3.5 h-3.5" /> Nova Publicação
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard icon={Megaphone} label="Total planeadas" value={stats.total} tone="bg-slate-100 text-slate-600" />
        <StatCard icon={Eye} label="Publicadas" value={stats.published} tone="bg-emerald-50 text-emerald-600" />
        <StatCard icon={Eye} label="Visualizações" value={stats.views} tone="bg-sky-50 text-sky-600" />
        <StatCard icon={Heart} label="Engagement" value={stats.engagement} tone="bg-pink-50 text-pink-600" />
        <StatCard icon={Target} label="Leads geradas" value={stats.leads} tone="bg-orange-50 text-brand" />
      </div>

      {chartData.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-sm font-display font-bold text-slate-700 mb-4">Desempenho por plataforma</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="Visualizações" fill="#ff6a00" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Engagement" fill="#1a7a3e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white">
          <option value="all">Todas as plataformas</option>
          {PLATFORMS.map(p => <option key={p.key} value={p.key}>{p.emoji} {p.label}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white">
          <option value="all">Todos os estados</option>
          {PUB_STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-white rounded-xl border border-slate-100 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-sm text-slate-300 italic py-16">Sem publicações</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(p => {
            const platform = PLATFORM_MAP[p.platform]
            const status = PUB_STATUS_MAP[p.status]
            return (
              <button key={p.id} onClick={() => setEditing(p)}
                className="text-left bg-white border border-slate-200 rounded-xl p-4 hover:border-orange-300 hover:shadow-sm transition-all space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">{p.title}</p>
                  <span className={cn('shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full', status?.color)}>{status?.label}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>{platform?.emoji} {platform?.label}</span>
                  {p.category && <span className="bg-slate-100 px-1.5 py-0.5 rounded">{p.category}</span>}
                  {(p.scheduled_date || p.published_date) && <span>{formatDate(p.published_date || p.scheduled_date)}</span>}
                </div>
                {p.status === 'publicado' && (
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1 border-t border-slate-50">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{p.views}</span>
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{p.likes}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{p.comments}</span>
                    <span className="flex items-center gap-1"><Share2 className="w-3 h-3" />{p.shares}</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {showNew && <PublicationFormModal onClose={() => setShowNew(false)} />}
      {editing && <PublicationFormModal publication={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
