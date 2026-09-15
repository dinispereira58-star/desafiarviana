import { useState, useEffect, useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, Save, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useActivitiesList } from '@/lib/useActivitiesMap'
import { cn } from '@/lib/utils'
import ActivityEditForm from '@/components/ActivityEditForm'

function newActivityDraft() {
  return {
    id: '', name: 'Nova atividade', tagline: '', emoji: '🎯', description: '', color: 'from-orange-500 to-red-600', photo_url: null,
    calculator_type: 'people', min_people: 6, price_per_person: 10,
    ball_packages: [], items: [], is_active: true, position: 999,
  }
}
function slugify(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// Gestão de atividades — reutilizada em Site > Atividades (com
// pré-visualização em tempo real, via onDraftChange) e em Configurações >
// Atividades (sem pré-visualização, só gestão direta).
export default function ActivitiesManager({ onDraftChange }) {
  const qc = useQueryClient()
  const { data: activities = [] } = useActivitiesList()
  const [draftActivities, setDraftActivities] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(null)

  useEffect(() => { setDraftActivities(activities) }, [activities])

  const previewActivities = useMemo(() => {
    if (!form) return draftActivities
    if (editingId === 'NEW') return [...draftActivities, { ...form, id: form.id || slugify(form.name) || 'preview-nova' }]
    return draftActivities.map(a => a.id === editingId ? { ...a, ...form } : a)
  }, [draftActivities, form, editingId])

  useEffect(() => { onDraftChange?.(previewActivities) }, [previewActivities]) // eslint-disable-line react-hooks/exhaustive-deps

  const startEdit = (a) => { setEditingId(a.id); setForm({ ...a }) }
  const startNew = () => { setEditingId('NEW'); setForm(newActivityDraft()) }
  const cancel = () => { setEditingId(null); setForm(null) }

  const save = useMutation({
    mutationFn: async () => {
      const id = editingId === 'NEW' ? (slugify(form.name) || `atividade-${Date.now()}`) : editingId
      const { error } = await supabase.from('activities').upsert({ ...form, id, updated_at: new Date().toISOString() })
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['activities'] }); qc.invalidateQueries({ queryKey: ['all-activities'] }); toast.success('Guardado!'); cancel() },
    onError: e => toast.error('Erro: ' + e.message),
  })
  const toggleActive = useMutation({
    mutationFn: async (a) => { const { error } = await supabase.from('activities').update({ is_active: !a.is_active }).eq('id', a.id); if (error) throw error },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['activities'] }); qc.invalidateQueries({ queryKey: ['all-activities'] }) },
  })
  const remove = useMutation({
    mutationFn: async (id) => { const { error } = await supabase.from('activities').delete().eq('id', id); if (error) throw error },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['activities'] }); qc.invalidateQueries({ queryKey: ['all-activities'] }); toast.success('Eliminada') },
    onError: e => toast.error('Erro: ' + e.message),
  })

  if (editingId) {
    return (
      <div className="space-y-4">
        <button onClick={cancel} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar à lista
        </button>
        <ActivityEditForm form={form} onChange={setForm} />
        <button onClick={() => save.mutate()} disabled={save.isPending}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-br from-brand to-brand-dark text-white rounded-xl text-sm font-bold shadow-sm disabled:opacity-50">
          {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button onClick={startNew}
        className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gradient-to-br from-brand to-brand-dark text-white rounded-xl text-xs font-bold shadow-sm">
        <Plus className="w-3.5 h-3.5" /> Nova Atividade
      </button>
      <div className="space-y-2">
        {draftActivities.map(a => (
          <div key={a.id} className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
            {a.photo_url ? <img src={a.photo_url} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" /> : (
              <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-sm shrink-0', a.color)}>{a.emoji}</div>
            )}
            <p className="flex-1 min-w-0 text-sm font-semibold text-slate-800 truncate">{a.name}</p>
            <button onClick={() => toggleActive.mutate(a)} className={cn('p-1.5 rounded-lg shrink-0', a.is_active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-300 hover:bg-slate-100')}>
              {a.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => startEdit(a)} className="p-1.5 text-slate-400 hover:text-orange-600 rounded-lg shrink-0"><Pencil className="w-3.5 h-3.5" /></button>
            <button onClick={() => { if (confirm(`Eliminar "${a.name}"?`)) remove.mutate(a.id) }} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
        {draftActivities.length === 0 && <p className="text-xs text-slate-300 italic text-center py-6">Sem atividades ainda</p>}
      </div>
    </div>
  )
}
