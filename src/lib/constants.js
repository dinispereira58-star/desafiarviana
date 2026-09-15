// Mesmas atividades definidas no site público (src/data/services.js do
// repositório animacao-turistica-site) — mantidas aqui em sincronia manual
// para já; se a lista mudar num sítio, atualizar no outro.
export const ACTIVITIES = [
  { id: 'paintball', name: 'Paintball', emoji: '🎯' },
  { id: 'paintball-kids', name: 'Paintball Kids', emoji: '🧒' },
  { id: 'festas', name: 'Festas de Aniversário', emoji: '🎉' },
  { id: 'insuflaveis', name: 'Aluguer de Insufláveis', emoji: '🏰' },
  { id: 'bubble-soccer', name: 'Bubble Soccer', emoji: '⚽' },
  { id: 'atl', name: 'ATL / Atividades Extracurriculares', emoji: '🏕️' },
]
export const ACTIVITY_MAP = Object.fromEntries(ACTIVITIES.map(a => [a.id, a]))

export const BOOKING_STATUSES = [
  { key: 'pending', label: 'Pendente', color: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  { key: 'confirmed', label: 'Confirmada', color: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  { key: 'declined', label: 'Recusada', color: 'bg-rose-50 text-rose-600', dot: 'bg-rose-500' },
  { key: 'completed', label: 'Realizada', color: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' },
]
export const BOOKING_STATUS_MAP = Object.fromEntries(BOOKING_STATUSES.map(s => [s.key, s]))
