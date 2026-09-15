export const BOOKING_STATUSES = [
  { key: 'pending', label: 'Pendente', color: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  { key: 'confirmed', label: 'Confirmada', color: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  { key: 'completed', label: 'Realizada', color: 'bg-teal-50 text-teal-700', dot: 'bg-teal-500' },
  { key: 'postponed', label: 'Adiada', color: 'bg-amber-100 text-amber-800', dot: 'bg-amber-600' },
  { key: 'cancelled', label: 'Cancelada', color: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' },
  { key: 'declined', label: 'Recusada', color: 'bg-rose-50 text-rose-600', dot: 'bg-rose-500' },
]
export const BOOKING_STATUS_MAP = Object.fromEntries(BOOKING_STATUSES.map(s => [s.key, s]))
