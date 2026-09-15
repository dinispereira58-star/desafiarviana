import { Calendar, Users, Check, X, ChevronRight } from 'lucide-react'
import { BOOKING_STATUS_MAP } from '@/lib/constants'
import { useActivitiesMap } from '@/lib/useActivitiesMap'
import { cn, formatDate } from '@/lib/utils'

export default function BookingRow({ booking, onOpen, onQuickStatus }) {
  const activityMap = useActivitiesMap()
  const activity = activityMap[booking.activity_id]
  const status = BOOKING_STATUS_MAP[booking.status]

  return (
    <div className="group flex items-center gap-3.5 bg-white border border-slate-200 rounded-xl px-4 py-3.5 hover:border-orange-300 hover:shadow-sm hover:shadow-slate-200/60 transition-all">
      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-lg shrink-0">
        {activity?.emoji || '📋'}
      </div>

      <button onClick={onOpen} className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-800 truncate">{booking.name}</p>
          <span className={cn('shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full', status.color)}>{status.label}</span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5 truncate">{booking.activity_name || activity?.name}</p>
      </button>

      <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400 shrink-0">
        {booking.preferred_date && (
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(booking.preferred_date)}{booking.preferred_time ? ` · ${booking.preferred_time}` : ''}</span>
        )}
        {booking.people_count && (
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{booking.people_count}</span>
        )}
      </div>

      {booking.status === 'pending' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={() => onQuickStatus('confirmed')} title="Confirmar"
            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onQuickStatus('declined')} title="Recusar"
            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <button onClick={onOpen} className="text-slate-300 hover:text-orange-500 transition-colors shrink-0">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
