import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { X, Loader2, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { PLATFORMS, CONTENT_TYPES, OBJECTIVES, PUB_STATUSES } from '@/lib/publicationsConstants'

const iCls = 'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 bg-slate-50 transition-all'

export default function PublicationFormModal({ publication, onClose }) {
  const qc = useQueryClient()
  const isNew = !publication
  const [form, setForm] = useState(() => publication || {
    title: '', platform: 'instagram', content_type: 'imagem', category: '', objective: 'visibilidade', status: 'planeado',
    notes: '', scheduled_date: '', published_date: '', views: 0, likes: 0, comments: 0, shares: 0, clicks: 0, leads_generated: 0,
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form, scheduled_date: form.scheduled_date || null, published_date: form.published_date || null, updated_at: new Date().toISOString() }
      if (isNew) {
        const { error } = await supabase.from('publications').insert(payload)
        if (error) throw error
      } else {
        const { error } = await supabase.from('publications').update(payload).eq('id', publication.id)
        if (error) throw error
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['publications'] }); toast.success('Guardado!'); onClose() },
    onError: e => toast.error('Erro: ' + e.message),
  })

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('publications').delete().eq('id', publication.id)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['publications'] }); toast.success('Eliminada'); onClose() },
    onError: e => toast.error('Erro: ' + e.message),
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try { await save.mutateAsync() } finally { setSaving(false) }
  }

  const showMetrics = form.status === 'publicado'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-display font-bold text-slate-800">{isNew ? 'Nova Publicação' : 'Editar Publicação'}</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Título / ideia</label>
            <input required value={form.title} onChange={e => set('title', e.target.value)} className={iCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Plataforma</label>
              <select value={form.platform} onChange={e => set('platform', e.target.value)} className={iCls}>
                {PLATFORMS.map(p => <option key={p.key} value={p.key}>{p.emoji} {p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tipo de conteúdo</label>
              <select value={form.content_type} onChange={e => set('content_type', e.target.value)} className={iCls}>
                {CONTENT_TYPES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Objetivo</label>
              <select value={form.objective} onChange={e => set('objective', e.target.value)} className={iCls}>
                {OBJECTIVES.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Estado</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className={iCls}>
                {PUB_STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Categoria (opcional)</label>
            <input value={form.category || ''} onChange={e => set('category', e.target.value)} placeholder="Ex: Paintball, Promoção, Testemunho..." className={iCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Data planeada</label>
              <input type="date" value={form.scheduled_date || ''} onChange={e => set('scheduled_date', e.target.value)} className={iCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Data publicada</label>
              <input type="date" value={form.published_date || ''} onChange={e => set('published_date', e.target.value)} className={iCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Notas</label>
            <textarea rows={2} value={form.notes || ''} onChange={e => set('notes', e.target.value)} className={iCls + ' resize-none'} />
          </div>

          {showMetrics && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Métricas</p>
              <div className="grid grid-cols-3 gap-2.5">
                {[['views', 'Visualizações'], ['likes', 'Gostos'], ['comments', 'Comentários'], ['shares', 'Partilhas'], ['clicks', 'Cliques'], ['leads_generated', 'Leads geradas']].map(([k, label]) => (
                  <div key={k}>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">{label}</label>
                    <input type="number" min="0" value={form[k]} onChange={e => set(k, Number(e.target.value))} className={iCls} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
        <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-3">
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-br from-brand to-brand-dark text-white rounded-xl text-sm font-bold shadow-sm disabled:opacity-50">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Guardar
          </button>
          {!isNew && (
            <button onClick={() => { if (confirm('Eliminar esta publicação?')) remove.mutate() }}
              className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
          )}
        </div>
      </div>
    </div>
  )
}
