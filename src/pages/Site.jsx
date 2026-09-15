import { useState, useEffect, useRef, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, Save, Phone, Mail, MessageCircle, ArrowLeft, RefreshCw, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { broadcastPreview } from '@/lib/broadcastPreview'
import Header from '@/components/Header'
import ActivityEditForm from '@/components/ActivityEditForm'

const iCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 bg-slate-50 transition-all'
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://desafiarviana-site.vercel.app'

function newActivityDraft() {
  return {
    id: '', name: 'Nova atividade', tagline: '', emoji: '🎯', description: '', color: 'from-orange-500 to-red-600',
    calculator_type: 'people', min_people: 6, price_per_person: 10,
    ball_packages: [], items: [], is_active: true, position: 999,
  }
}
function slugify(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function Site() {
  const qc = useQueryClient()
  const iframeRef = useRef()
  const [tab, setTab] = useState('activities')
  const [editingId, setEditingId] = useState(null) // id da atividade a editar, ou 'NEW'

  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const { data, error } = await supabase.from('activities').select('*').order('position', { ascending: true })
      if (error) throw error
      return data || []
    },
  })
  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_settings').select('*')
      if (error) throw error
      return Object.fromEntries((data || []).map(s => [s.key, s.value]))
    },
  })

  // Cópias de rascunho — é nelas que se edita; são o que é transmitido para
  // a pré-visualização em tempo real, antes (ou mesmo sem) gravar.
  const [draftActivities, setDraftActivities] = useState([])
  const [draftSettings, setDraftSettings] = useState({})
  const [draftForm, setDraftForm] = useState(null) // formulário da atividade a editar neste momento

  useEffect(() => { setDraftActivities(activities) }, [activities])
  useEffect(() => { if (settings) setDraftSettings(settings) }, [settings])

  // Lista efetiva a pré-visualizar: as draftActivities, mas com a que está
  // a ser editada substituída pelo formulário em curso (ainda não gravado).
  const previewActivities = useMemo(() => {
    if (!draftForm) return draftActivities
    if (editingId === 'NEW') return [...draftActivities, { ...draftForm, id: draftForm.id || slugify(draftForm.name) || 'preview-nova' }]
    return draftActivities.map(a => a.id === editingId ? { ...a, ...draftForm } : a)
  }, [draftActivities, draftForm, editingId])

  useEffect(() => {
    broadcastPreview(iframeRef, { activities: previewActivities, settings: draftSettings })
  }, [previewActivities, draftSettings])

  const startEdit = (activity) => { setEditingId(activity.id); setDraftForm({ ...activity }) }
  const startNew = () => { setEditingId('NEW'); setDraftForm(newActivityDraft()) }
  const cancelEdit = () => { setEditingId(null); setDraftForm(null) }

  const saveActivity = useMutation({
    mutationFn: async () => {
      const id = editingId === 'NEW' ? (slugify(draftForm.name) || `atividade-${Date.now()}`) : editingId
      const { error } = await supabase.from('activities').upsert({ ...draftForm, id, updated_at: new Date().toISOString() })
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['activities'] }); toast.success('Guardado!'); cancelEdit() },
    onError: e => toast.error('Erro: ' + e.message),
  })

  const toggleActive = useMutation({
    mutationFn: async (a) => {
      const { error } = await supabase.from('activities').update({ is_active: !a.is_active }).eq('id', a.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activities'] }),
  })

  const removeActivity = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('activities').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['activities'] }); toast.success('Eliminada') },
    onError: e => toast.error('Erro: ' + e.message),
  })

  const saveSettings = useMutation({
    mutationFn: async () => {
      const rows = Object.entries(draftSettings).map(([key, value]) => ({ key, value }))
      const { error } = await supabase.from('site_settings').upsert(rows)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['site-settings'] }); toast.success('Contactos atualizados!') },
    onError: e => toast.error('Erro: ' + e.message),
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex min-h-0">
        {/* ── BARRA LATERAL — opções ─────────────────────────────── */}
        <aside className="w-[380px] shrink-0 border-r border-slate-200 bg-white overflow-y-auto">
          <div className="flex items-center gap-1 p-3 border-b border-slate-100">
            <button onClick={() => { setTab('activities'); cancelEdit() }}
              className={cn('flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-colors', tab === 'activities' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50')}>
              Atividades
            </button>
            <button onClick={() => { setTab('contact'); cancelEdit() }}
              className={cn('flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-colors', tab === 'contact' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50')}>
              Contacto
            </button>
          </div>

          <div className="p-4">
            {tab === 'activities' && (
              editingId ? (
                <div className="space-y-4">
                  <button onClick={cancelEdit} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
                    <ArrowLeft className="w-3.5 h-3.5" /> Voltar à lista
                  </button>
                  <ActivityEditForm form={draftForm} onChange={setDraftForm} />
                  <button onClick={() => saveActivity.mutate()} disabled={saveActivity.isPending}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-br from-brand to-brand-dark text-white rounded-xl text-sm font-bold shadow-sm disabled:opacity-50">
                    {saveActivity.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button onClick={startNew}
                    className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gradient-to-br from-brand to-brand-dark text-white rounded-xl text-xs font-bold shadow-sm">
                    <Plus className="w-3.5 h-3.5" /> Nova Atividade
                  </button>
                  <div className="space-y-2">
                    {draftActivities.map(a => (
                      <div key={a.id} className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                        <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-sm shrink-0', a.color)}>{a.emoji}</div>
                        <p className="flex-1 min-w-0 text-sm font-semibold text-slate-800 truncate">{a.name}</p>
                        <button onClick={() => toggleActive.mutate(a)} className={cn('p-1.5 rounded-lg shrink-0', a.is_active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-300 hover:bg-slate-100')}>
                          {a.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => startEdit(a)} className="p-1.5 text-slate-400 hover:text-orange-600 rounded-lg shrink-0"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => { if (confirm(`Eliminar "${a.name}"?`)) removeActivity.mutate(a.id) }} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}

            {tab === 'contact' && (
              <div className="space-y-3.5">
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-1"><Phone className="w-3.5 h-3.5" /> Telefone (texto mostrado)</label>
                  <input value={draftSettings.contact_phone || ''} onChange={e => setDraftSettings(s => ({ ...s, contact_phone: e.target.value }))} className={iCls} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Número para ligar (com indicativo)</label>
                  <input value={draftSettings.contact_phone_link || ''} onChange={e => setDraftSettings(s => ({ ...s, contact_phone_link: e.target.value }))} className={iCls} />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-1"><Mail className="w-3.5 h-3.5" /> Email</label>
                  <input value={draftSettings.contact_email || ''} onChange={e => setDraftSettings(s => ({ ...s, contact_email: e.target.value }))} className={iCls} />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-1"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp (com indicativo)</label>
                  <input value={draftSettings.whatsapp_number || ''} onChange={e => setDraftSettings(s => ({ ...s, whatsapp_number: e.target.value }))} className={iCls} />
                </div>
                <button onClick={() => saveSettings.mutate()} disabled={saveSettings.isPending}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-br from-brand to-brand-dark text-white rounded-xl text-sm font-bold shadow-sm disabled:opacity-50">
                  {saveSettings.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Guardar
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* ── PRÉ-VISUALIZAÇÃO AO VIVO ───────────────────────────── */}
        <div className="flex-1 flex flex-col bg-slate-200 min-w-0">
          <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200 shrink-0">
            <p className="text-xs text-slate-400 font-medium">Pré-visualização — {SITE_URL.replace('https://', '')}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => iframeRef.current?.contentWindow?.location.reload()} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg" title="Recarregar">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <a href={SITE_URL} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg" title="Abrir site">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
          <iframe
            ref={iframeRef}
            src={SITE_URL}
            title="Pré-visualização do site"
            className="flex-1 w-full border-0"
            onLoad={() => broadcastPreview(iframeRef, { activities: previewActivities, settings: draftSettings })}
          />
        </div>
      </div>
    </div>
  )
}
