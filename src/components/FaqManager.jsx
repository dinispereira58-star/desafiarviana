import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, Save, ArrowLeft, HelpCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const iCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 bg-slate-50 transition-all'

function newFaqDraft() {
  return { question: '', answer: '', is_active: true, position: 999 }
}

export default function FaqManager() {
  const qc = useQueryClient()
  const [editingId, setEditingId] = useState(null) // 'NEW' ou id
  const [form, setForm] = useState(null)

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['faq-items'],
    queryFn: async () => {
      const { data, error } = await supabase.from('faq_items').select('*').order('position', { ascending: true })
      if (error) throw error
      return data || []
    },
  })

  const startEdit = (f) => { setEditingId(f.id); setForm({ ...f }) }
  const startNew = () => { setEditingId('NEW'); setForm(newFaqDraft()) }
  const cancel = () => { setEditingId(null); setForm(null) }

  const save = useMutation({
    mutationFn: async () => {
      if (editingId === 'NEW') {
        const { error } = await supabase.from('faq_items').insert(form)
        if (error) throw error
      } else {
        const { id, ...fields } = form
        const { error } = await supabase.from('faq_items').update(fields).eq('id', editingId)
        if (error) throw error
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['faq-items'] }); toast.success('Guardado!'); cancel() },
    onError: e => toast.error('Erro: ' + e.message),
  })
  const toggleActive = useMutation({
    mutationFn: async (f) => { const { error } = await supabase.from('faq_items').update({ is_active: !f.is_active }).eq('id', f.id); if (error) throw error },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faq-items'] }),
  })
  const remove = useMutation({
    mutationFn: async (id) => { const { error } = await supabase.from('faq_items').delete().eq('id', id); if (error) throw error },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['faq-items'] }); toast.success('Eliminada') },
    onError: e => toast.error('Erro: ' + e.message),
  })

  if (editingId) {
    return (
      <div className="space-y-4">
        <button onClick={cancel} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar à lista
        </button>
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Pergunta</label>
          <input value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} className={iCls} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Resposta</label>
          <textarea rows={5} value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} className={iCls + ' resize-none'} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Posição (ordem — menor aparece primeiro)</label>
          <input type="number" value={form.position} onChange={e => setForm(f => ({ ...f, position: Number(e.target.value) }))} className={cn(iCls, 'max-w-[100px]')} />
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-orange-500" />
          <span className="text-xs text-slate-600 font-medium">Visível no site</span>
        </label>
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
        <Plus className="w-3.5 h-3.5" /> Nova Pergunta
      </button>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {items.map(f => (
            <div key={f.id} className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
              <HelpCircle className="w-4 h-4 text-slate-300 shrink-0" />
              <p className="flex-1 min-w-0 text-sm font-semibold text-slate-800 truncate">{f.question}</p>
              <button onClick={() => toggleActive.mutate(f)} className={cn('p-1.5 rounded-lg shrink-0', f.is_active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-300 hover:bg-slate-100')}>
                {f.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => startEdit(f)} className="p-1.5 text-slate-400 hover:text-orange-600 rounded-lg shrink-0"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => { if (confirm('Eliminar esta pergunta?')) remove.mutate(f.id) }} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          {items.length === 0 && <p className="text-xs text-slate-300 italic text-center py-6">Sem perguntas ainda</p>}
        </div>
      )}
    </div>
  )
}
