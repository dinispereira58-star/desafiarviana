import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { X, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useActivitiesList } from '@/lib/useActivitiesMap'

const iCls = 'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 bg-slate-50 transition-all'

export default function NewBookingModal({ defaultDate, onClose }) {
  const qc = useQueryClient()
  const { data: activities = [] } = useActivitiesList()
  const [form, setForm] = useState({
    activity_id: '', name: '', phone: '', email: '',
    preferred_date: defaultDate || '', preferred_time: '', people_count: '', message: '',
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const create = useMutation({
    mutationFn: async () => {
      const activity = activities.find(a => a.id === form.activity_id)
      const { error } = await supabase.from('booking_requests').insert({
        ...form,
        activity_name: activity?.name || form.activity_id,
        people_count: form.people_count ? Number(form.people_count) : null,
        status: 'confirmed',
      })
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bookings'] }); toast.success('Reserva criada!'); onClose() },
    onError: e => toast.error('Erro: ' + e.message),
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.activity_id || !form.name.trim()) return toast.error('Atividade e nome do cliente são obrigatórios')
    setSaving(true)
    try { await create.mutateAsync() } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-display font-bold text-slate-800">Nova Reserva</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Atividade</label>
            <select required value={form.activity_id} onChange={e => set('activity_id', e.target.value)} className={iCls}>
              <option value="">— Selecionar —</option>
              {activities.map(a => <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nome do cliente</label>
            <input required value={form.name} onChange={e => set('name', e.target.value)} className={iCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Telefone</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} className={iCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={iCls} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Data</label>
              <input type="date" required value={form.preferred_date} onChange={e => set('preferred_date', e.target.value)} className={iCls} />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Hora</label>
              <input type="time" value={form.preferred_time} onChange={e => set('preferred_time', e.target.value)} className={iCls} />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Pessoas</label>
              <input type="number" min="1" value={form.people_count} onChange={e => set('people_count', e.target.value)} className={iCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Notas (opcional)</label>
            <textarea rows={2} value={form.message} onChange={e => set('message', e.target.value)} className={iCls + ' resize-none'} />
          </div>
          <button type="submit" disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-br from-brand to-brand-dark text-white rounded-xl text-sm font-bold shadow-sm disabled:opacity-50">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Criar Reserva
          </button>
        </form>
      </div>
    </div>
  )
}
