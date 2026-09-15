import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { X, Loader2, Phone, Mail, Calendar, Clock, Users, MessageSquare, Trash2, Euro, Package } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { BOOKING_STATUSES } from '@/lib/constants'
import { useActivitiesMap } from '@/lib/useActivitiesMap'
import { formatDate, formatDateTime } from '@/lib/utils'

const selCls = 'px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white focus:outline-none focus:border-orange-400 transition-colors'
const iCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 bg-slate-50 transition-all'

export default function BookingDetailModal({ bookingId, onClose }) {
  const qc = useQueryClient()
  const activityMap = useActivitiesMap()
  const [notes, setNotes] = useState('')
  const [participants, setParticipants] = useState('')
  const [revenue, setRevenue] = useState('')
  const [extra, setExtra] = useState({})

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const { data, error } = await supabase.from('booking_requests').select('*').eq('id', bookingId).single()
      if (error) throw error
      return data
    },
  })

  useEffect(() => {
    if (!booking) return
    setNotes(booking.internal_notes || '')
    setParticipants(booking.actual_participants ?? booking.people_count ?? '')
    setRevenue(booking.revenue ?? '')
    setExtra(booking.extra_data || {})
  }, [booking])

  const update = useMutation({
    mutationFn: async (fields) => {
      const { error } = await supabase.from('booking_requests').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', bookingId)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['booking', bookingId] }); qc.invalidateQueries({ queryKey: ['bookings'] }) },
    onError: e => toast.error('Erro: ' + e.message),
  })

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('booking_requests').delete().eq('id', bookingId)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bookings'] }); toast.success('Pedido eliminado'); onClose() },
    onError: e => toast.error('Erro: ' + e.message),
  })

  const activity = booking ? activityMap[booking.activity_id] : null
  const isPaintball = booking?.activity_id === 'paintball'
  const setExtraField = (k, v) => {
    const next = { ...extra, [k]: v }
    setExtra(next)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl shadow-slate-900/10" onClick={e => e.stopPropagation()}>
        {isLoading || !booking ? (
          <div className="p-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3 px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                {activity?.photo_url ? (
                  <img src={activity.photo_url} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center text-xl shrink-0">{activity?.emoji || '📋'}</div>
                )}
                <div>
                  <h2 className="text-lg font-display font-bold text-slate-800">{booking.name}</h2>
                  <p className="text-xs text-slate-400">{booking.activity_name || activity?.name}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <select value={booking.status} onChange={e => update.mutate({ status: e.target.value })} className={selCls}>
                {BOOKING_STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {booking.phone && (
                  <a href={`tel:${booking.phone}`} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3.5 py-2.5 hover:bg-slate-100 transition-colors">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /><span className="text-slate-700 font-medium">{booking.phone}</span>
                  </a>
                )}
                {booking.email && (
                  <a href={`mailto:${booking.email}`} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3.5 py-2.5 hover:bg-slate-100 transition-colors">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /><span className="text-slate-700 font-medium truncate">{booking.email}</span>
                  </a>
                )}
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Data e hora</p>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="date" defaultValue={booking.preferred_date || ''} onBlur={e => update.mutate({ preferred_date: e.target.value || null })} className={iCls + ' pl-9'} />
                  </div>
                  <div className="relative">
                    <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="time" defaultValue={booking.preferred_time || ''} onBlur={e => update.mutate({ preferred_time: e.target.value || null })} className={iCls + ' pl-9'} />
                  </div>
                </div>
              </div>

              {booking.message && (
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mensagem do cliente</p>
                  <p className="text-sm text-slate-600 bg-slate-50 rounded-xl px-3.5 py-3 whitespace-pre-wrap leading-relaxed">{booking.message}</p>
                </div>
              )}

              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Resultado</p>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="relative">
                    <Users className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="number" min="0" placeholder="Participantes" value={participants} onChange={e => setParticipants(e.target.value)}
                      onBlur={() => update.mutate({ actual_participants: participants === '' ? null : Number(participants) })}
                      className={iCls + ' pl-9'} />
                  </div>
                  <div className="relative">
                    <Euro className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="number" min="0" step="0.5" placeholder="Ganho (€)" value={revenue} onChange={e => setRevenue(e.target.value)}
                      onBlur={() => update.mutate({ revenue: revenue === '' ? null : Number(revenue) })}
                      className={iCls + ' pl-9'} />
                  </div>
                </div>
              </div>

              {isPaintball && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Package className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Consumíveis — Paintball</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {[['pack_200', 'Pack 200'], ['pack_300', 'Pack 300'], ['pack_400', 'Pack 400']].map(([k, label]) => (
                      <div key={k}>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">{label}</label>
                        <input type="number" min="0" value={extra[k] ?? ''} onChange={e => setExtraField(k, e.target.value)}
                          onBlur={() => update.mutate({ extra_data: { ...extra, [k]: extra[k] === '' || extra[k] == null ? null : Number(extra[k]) } })}
                          className={iCls} />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[['recargas', 'Recargas'], ['sacos', 'Sacos'], ['caixas', 'Caixas']].map(([k, label]) => (
                      <div key={k}>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">{label}</label>
                        <input type="number" min="0" value={extra[k] ?? ''} onChange={e => setExtraField(k, e.target.value)}
                          onBlur={() => update.mutate({ extra_data: { ...extra, [k]: extra[k] === '' || extra[k] == null ? null : Number(extra[k]) } })}
                          className={iCls} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Notas internas</p>
                </div>
                <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                  onBlur={() => { if (notes !== (booking.internal_notes || '')) update.mutate({ internal_notes: notes }) }}
                  placeholder="Ex: já confirmado por WhatsApp, pediu desconto de grupo..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 bg-slate-50 resize-none transition-all" />
              </div>

              <p className="text-[10px] text-slate-300">Pedido recebido em {formatDateTime(booking.created_at)}</p>
            </div>

            <div className="px-6 py-3.5 border-t border-slate-100 flex justify-end">
              <button onClick={() => { if (confirm('Eliminar este pedido? Esta ação não pode ser desfeita.')) remove.mutate() }}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-600 font-semibold transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Eliminar pedido
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
