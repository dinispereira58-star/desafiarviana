import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, CalendarDays, List, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { BOOKING_STATUS_MAP } from '@/lib/constants'
import { useActivitiesMap } from '@/lib/useActivitiesMap'
import { cn, formatDate } from '@/lib/utils'
import BookingDetailModal from '@/components/BookingDetailModal'
import NewBookingModal from '@/components/NewBookingModal'

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1)
  const startOffset = (first.getDay() + 6) % 7 // segunda = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  return cells
}

export default function CalendarPage() {
  const activityMap = useActivitiesMap()
  const [view, setView] = useState('month')
  const [cursor, setCursor] = useState(new Date())
  const [openId, setOpenId] = useState(null)
  const [showNew, setShowNew] = useState(false)
  const [newDate, setNewDate] = useState(null)
  const today = new Date().toISOString().slice(0, 10)

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('booking_requests').select('*').not('preferred_date', 'is', null).order('preferred_date', { ascending: true })
      if (error) throw error
      return data || []
    },
  })

  const byDate = useMemo(() => {
    const map = {}
    for (const b of bookings) {
      (map[b.preferred_date] ||= []).push(b)
      map[b.preferred_date].sort((a, b2) => (a.preferred_time || '99:99').localeCompare(b2.preferred_time || '99:99'))
    }
    return map
  }, [bookings])

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const cells = useMemo(() => buildMonthGrid(year, month), [year, month])
  const upcoming = useMemo(() => bookings.filter(b => b.preferred_date >= today), [bookings, today])

  const changeMonth = (delta) => setCursor(new Date(year, month + delta, 1))
  const openNewForDate = (date) => { setNewDate(date); setShowNew(true) }

  return (
    <div className="p-6 max-w-[1100px] mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="font-display font-bold text-slate-800 text-lg">Calendário</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
            <button onClick={() => setView('month')} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors', view === 'month' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50')}>
              <CalendarDays className="w-3.5 h-3.5" /> Mês
            </button>
            <button onClick={() => setView('list')} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors', view === 'list' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50')}>
              <List className="w-3.5 h-3.5" /> Lista
            </button>
          </div>
          <button onClick={() => openNewForDate(null)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-br from-brand to-brand-dark text-white rounded-xl text-xs font-bold shadow-sm">
            <Plus className="w-3.5 h-3.5" /> Nova Reserva
          </button>
        </div>
      </div>

      {view === 'month' ? (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
            <button onClick={() => changeMonth(-1)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"><ChevronLeft className="w-4 h-4" /></button>
            <p className="font-display font-bold text-slate-700">{MONTHS[month]} {year}</p>
            <button onClick={() => changeMonth(1)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-7 border-b border-slate-100">
            {WEEKDAYS.map(w => <div key={w} className="text-center text-[11px] font-bold text-slate-400 py-2">{w}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((date, i) => {
              const key = date?.toISOString().slice(0, 10)
              const dayBookings = key ? byDate[key] || [] : []
              const isToday = key === today
              return (
                <div key={i} className={cn('group min-h-[92px] border-b border-r border-slate-100 p-1.5 relative', !date && 'bg-slate-50/50')}>
                  {date && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className={cn('inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-semibold', isToday ? 'bg-brand text-white' : 'text-slate-500')}>{date.getDate()}</span>
                        <button onClick={() => openNewForDate(key)} title="Nova reserva neste dia"
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-300 hover:text-brand transition-opacity"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                      <div className="mt-1 space-y-0.5">
                        {dayBookings.slice(0, 3).map(b => {
                          const status = BOOKING_STATUS_MAP[b.status]
                          return (
                            <button key={b.id} onClick={() => setOpenId(b.id)}
                              className={cn('w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium truncate', status?.color)}>
                              {b.preferred_time ? `${b.preferred_time} · ` : ''}{activityMap[b.activity_id]?.emoji} {b.name}
                            </button>
                          )
                        })}
                        {dayBookings.length > 3 && <p className="text-[10px] text-slate-400 px-1.5">+{dayBookings.length - 3}</p>}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {upcoming.length === 0 ? (
            <p className="text-center text-sm text-slate-300 italic py-16">Sem reservas futuras</p>
          ) : upcoming.map(b => {
            const activity = activityMap[b.activity_id]
            const status = BOOKING_STATUS_MAP[b.status]
            return (
              <button key={b.id} onClick={() => setOpenId(b.id)}
                className="w-full flex items-center gap-3.5 bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-orange-300 transition-colors text-left">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-lg shrink-0">{activity?.emoji || '📋'}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{b.name} — {b.activity_name || activity?.name}</p>
                  <p className="text-xs text-slate-400">{formatDate(b.preferred_date)}{b.preferred_time ? ` · ${b.preferred_time}` : ''}{b.people_count ? ` · ${b.people_count} pessoas` : ''}</p>
                </div>
                <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0', status?.color)}>{status?.label}</span>
              </button>
            )
          })}
        </div>
      )}

      {openId && <BookingDetailModal bookingId={openId} onClose={() => setOpenId(null)} />}
      {showNew && <NewBookingModal defaultDate={newDate} onClose={() => setShowNew(false)} />}
    </div>
  )
}
