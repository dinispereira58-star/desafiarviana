import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, Save, ArrowLeft, LayoutTemplate, PanelTop, PanelBottomClose } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import PopupEditForm from '@/components/PopupEditForm'

const KIND_LABEL = { modal: 'Popup inicial', bar: 'Barra', corner: 'Caixa de canto' }
const KIND_ICON = { modal: LayoutTemplate, bar: PanelTop, corner: PanelBottomClose }

function newPopupDraft() {
  return {
    name: 'Novo aviso', is_active: false, kind: 'modal', position: 'center',
    content_type: 'text', title: '', message: '', image_url: '', link_url: '', link_label: '',
    bg_color: '#1a1a1a', text_color: '#ffffff', accent_color: '#ff6a00',
    font_family: '', text_size: 'md', bar_size: 48, corner_width: 320,
    close_mode: 'both', auto_close_seconds: 6, animation: 'fade', display_order: 0,
  }
}

// Ao mudar de tipo, ajusta a posição por omissão para uma válida desse tipo.
function positionForKind(kind) {
  if (kind === 'bar') return 'top'
  if (kind === 'corner') return 'bottom-right'
  return 'center'
}

export default function PopupsManager() {
  const qc = useQueryClient()
  const [editingId, setEditingId] = useState(null) // 'NEW' ou id
  const [form, setForm] = useState(null)

  const { data: popups = [], isLoading } = useQuery({
    queryKey: ['site-popups'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_popups').select('*').order('display_order', { ascending: true })
      if (error) throw error
      return data || []
    },
  })

  const startEdit = (p) => { setEditingId(p.id); setForm({ ...p }) }
  const startNew = () => { setEditingId('NEW'); setForm(newPopupDraft()) }
  const cancel = () => { setEditingId(null); setForm(null) }

  const handleFormChange = (next) => {
    if (next.kind !== form.kind) next.position = positionForKind(next.kind)
    setForm(next)
  }

  const save = useMutation({
    mutationFn: async () => {
      if (editingId === 'NEW') {
        const { error } = await supabase.from('site_popups').insert(form)
        if (error) throw error
      } else {
        const { id, created_at, ...fields } = form
        const { error } = await supabase.from('site_popups').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', editingId)
        if (error) throw error
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['site-popups'] }); toast.success('Guardado!'); cancel() },
    onError: e => toast.error('Erro: ' + e.message),
  })
  const toggleActive = useMutation({
    mutationFn: async (p) => { const { error } = await supabase.from('site_popups').update({ is_active: !p.is_active }).eq('id', p.id); if (error) throw error },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['site-popups'] }),
  })
  const remove = useMutation({
    mutationFn: async (id) => { const { error } = await supabase.from('site_popups').delete().eq('id', id); if (error) throw error },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['site-popups'] }); toast.success('Eliminado') },
    onError: e => toast.error('Erro: ' + e.message),
  })

  if (editingId) {
    return (
      <div className="space-y-4">
        <button onClick={cancel} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar à lista
        </button>
        <PopupEditForm form={form} onChange={handleFormChange} />
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
      <p className="text-[11px] text-slate-400 leading-relaxed">
        Cria avisos que aparecem no site: um popup inicial, uma barra fixa (topo/fundo) ou uma caixa num canto. Podes ter vários ativos ao mesmo tempo, em posições diferentes.
      </p>
      <button onClick={startNew}
        className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gradient-to-br from-brand to-brand-dark text-white rounded-xl text-xs font-bold shadow-sm">
        <Plus className="w-3.5 h-3.5" /> Novo Aviso
      </button>

      {isLoading ? (
        <div className="space-y-2">{[1, 2].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {popups.map(p => {
            const Icon = KIND_ICON[p.kind] || LayoutTemplate
            return (
              <div key={p.id} className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: p.bg_color, color: p.text_color }}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-400">{KIND_LABEL[p.kind]}{p.kind !== 'modal' ? ` · ${p.position}` : ''}</p>
                </div>
                <button onClick={() => toggleActive.mutate(p)} className={cn('p-1.5 rounded-lg shrink-0', p.is_active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-300 hover:bg-slate-100')}>
                  {p.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => startEdit(p)} className="p-1.5 text-slate-400 hover:text-orange-600 rounded-lg shrink-0"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => { if (confirm(`Eliminar "${p.name}"?`)) remove.mutate(p.id) }} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            )
          })}
          {popups.length === 0 && <p className="text-xs text-slate-300 italic text-center py-6">Sem avisos ainda</p>}
        </div>
      )}
    </div>
  )
}
