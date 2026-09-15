import { useState, useEffect, useRef, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, Save, Phone, Mail, MessageCircle, ArrowLeft, RefreshCw, ExternalLink, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { broadcastPreview } from '@/lib/broadcastPreview'
import ActivityEditForm from '@/components/ActivityEditForm'
import TestimonialEditForm from '@/components/TestimonialEditForm'
import HeroEditForm from '@/components/HeroEditForm'

const iCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 bg-slate-50 transition-all'
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://desafiarviana-site.vercel.app'
const SECTIONS = [
  { key: 'hero', label: 'Hero' },
  { key: 'activities', label: 'Atividades' },
  { key: 'testimonials', label: 'Testemunhos' },
  { key: 'contact', label: 'Contacto' },
]

function newActivityDraft() {
  return {
    id: '', name: 'Nova atividade', tagline: '', emoji: '🎯', description: '', color: 'from-orange-500 to-red-600', photo_url: null,
    calculator_type: 'people', min_people: 6, price_per_person: 10,
    ball_packages: [], items: [], is_active: true, position: 999,
  }
}
function newTestimonialDraft() {
  return { id: null, name: '', activity: '', rating: 5, text: '', is_active: true, position: 999 }
}
function slugify(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function Site() {
  const qc = useQueryClient()
  const iframeRef = useRef()
  const [section, setSection] = useState('hero')
  const [editingActivityId, setEditingActivityId] = useState(null)
  const [editingTestimonialId, setEditingTestimonialId] = useState(null) // 'NEW' ou id

  // ── Dados guardados ──────────────────────────────────────────────
  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => { const { data, error } = await supabase.from('activities').select('*').order('position', { ascending: true }); if (error) throw error; return data || [] },
  })
  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_settings').select('*')
      if (error) throw error
      return Object.fromEntries((data || []).map(s => [s.key, s.value]))
    },
  })
  const { data: testimonials = [] } = useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => { const { data, error } = await supabase.from('testimonials').select('*').order('position', { ascending: true }); if (error) throw error; return data || [] },
  })

  // ── Rascunhos (o que é transmitido para a pré-visualização) ───────
  const [draftActivities, setDraftActivities] = useState([])
  const [draftSettings, setDraftSettings] = useState({})
  const [draftTestimonials, setDraftTestimonials] = useState([])
  const [activityForm, setActivityForm] = useState(null)
  const [testimonialForm, setTestimonialForm] = useState(null)

  useEffect(() => { setDraftActivities(activities) }, [activities])
  useEffect(() => { if (settings) setDraftSettings(settings) }, [settings])
  useEffect(() => { setDraftTestimonials(testimonials) }, [testimonials])

  const previewActivities = useMemo(() => {
    if (!activityForm) return draftActivities
    if (editingActivityId === 'NEW') return [...draftActivities, { ...activityForm, id: activityForm.id || slugify(activityForm.name) || 'preview-nova' }]
    return draftActivities.map(a => a.id === editingActivityId ? { ...a, ...activityForm } : a)
  }, [draftActivities, activityForm, editingActivityId])

  const previewTestimonials = useMemo(() => {
    if (!testimonialForm) return draftTestimonials
    if (editingTestimonialId === 'NEW') return [...draftTestimonials, { ...testimonialForm, id: 'preview-novo' }]
    return draftTestimonials.map(t => t.id === editingTestimonialId ? { ...t, ...testimonialForm } : t)
  }, [draftTestimonials, testimonialForm, editingTestimonialId])

  useEffect(() => {
    broadcastPreview(iframeRef, { activities: previewActivities, settings: draftSettings, testimonials: previewTestimonials })
  }, [previewActivities, draftSettings, previewTestimonials])

  // ── Atividades ─────────────────────────────────────────────────
  const startEditActivity = (a) => { setEditingActivityId(a.id); setActivityForm({ ...a }) }
  const startNewActivity = () => { setEditingActivityId('NEW'); setActivityForm(newActivityDraft()) }
  const cancelActivity = () => { setEditingActivityId(null); setActivityForm(null) }

  const saveActivity = useMutation({
    mutationFn: async () => {
      const id = editingActivityId === 'NEW' ? (slugify(activityForm.name) || `atividade-${Date.now()}`) : editingActivityId
      const { error } = await supabase.from('activities').upsert({ ...activityForm, id, updated_at: new Date().toISOString() })
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['activities'] }); toast.success('Guardado!'); cancelActivity() },
    onError: e => toast.error('Erro: ' + e.message),
  })
  const toggleActivityActive = useMutation({
    mutationFn: async (a) => { const { error } = await supabase.from('activities').update({ is_active: !a.is_active }).eq('id', a.id); if (error) throw error },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activities'] }),
  })
  const removeActivity = useMutation({
    mutationFn: async (id) => { const { error } = await supabase.from('activities').delete().eq('id', id); if (error) throw error },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['activities'] }); toast.success('Eliminada') },
    onError: e => toast.error('Erro: ' + e.message),
  })

  // ── Testemunhos ────────────────────────────────────────────────
  const startEditTestimonial = (t) => { setEditingTestimonialId(t.id); setTestimonialForm({ ...t }) }
  const startNewTestimonial = () => { setEditingTestimonialId('NEW'); setTestimonialForm(newTestimonialDraft()) }
  const cancelTestimonial = () => { setEditingTestimonialId(null); setTestimonialForm(null) }

  const saveTestimonial = useMutation({
    mutationFn: async () => {
      const { id, ...fields } = testimonialForm
      if (editingTestimonialId === 'NEW') {
        const { error } = await supabase.from('testimonials').insert(fields)
        if (error) throw error
      } else {
        const { error } = await supabase.from('testimonials').update(fields).eq('id', id)
        if (error) throw error
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['testimonials'] }); toast.success('Guardado!'); cancelTestimonial() },
    onError: e => toast.error('Erro: ' + e.message),
  })
  const toggleTestimonialActive = useMutation({
    mutationFn: async (t) => { const { error } = await supabase.from('testimonials').update({ is_active: !t.is_active }).eq('id', t.id); if (error) throw error },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['testimonials'] }),
  })
  const removeTestimonial = useMutation({
    mutationFn: async (id) => { const { error } = await supabase.from('testimonials').delete().eq('id', id); if (error) throw error },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['testimonials'] }); toast.success('Eliminado') },
    onError: e => toast.error('Erro: ' + e.message),
  })

  // ── Definições gerais (Hero + Contacto partilham a mesma tabela) ──
  const saveSettings = useMutation({
    mutationFn: async () => {
      const rows = Object.entries(draftSettings).map(([key, value]) => ({ key, value }))
      const { error } = await supabase.from('site_settings').upsert(rows)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['site-settings'] }); toast.success('Guardado!') },
    onError: e => toast.error('Erro: ' + e.message),
  })

  return (
    <div className="p-6">
      <h1 className="font-display font-bold text-slate-800 text-lg mb-4">Site Público</h1>
      <div className="flex h-[calc(100vh-160px)] rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        {/* ── BARRA LATERAL — secções do site ────────────────────── */}
        <aside className="w-[380px] shrink-0 border-r border-slate-200 bg-white overflow-y-auto flex flex-col">
          <div className="flex flex-col gap-0.5 p-3 border-b border-slate-100">
            {SECTIONS.map(s => (
              <button key={s.key} onClick={() => { setSection(s.key); cancelActivity(); cancelTestimonial() }}
                className={cn('px-3 py-2 rounded-lg text-xs font-bold text-left transition-colors', section === s.key ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50')}>
                {s.label}
              </button>
            ))}
          </div>

          <div className="p-4 flex-1">
            {section === 'hero' && (
              <div className="space-y-4">
                <HeroEditForm form={draftSettings} onChange={setDraftSettings} />
                <button onClick={() => saveSettings.mutate()} disabled={saveSettings.isPending}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-br from-brand to-brand-dark text-white rounded-xl text-sm font-bold shadow-sm disabled:opacity-50">
                  {saveSettings.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Guardar
                </button>
              </div>
            )}

            {section === 'activities' && (
              editingActivityId ? (
                <div className="space-y-4">
                  <button onClick={cancelActivity} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
                    <ArrowLeft className="w-3.5 h-3.5" /> Voltar à lista
                  </button>
                  <ActivityEditForm form={activityForm} onChange={setActivityForm} />
                  <button onClick={() => saveActivity.mutate()} disabled={saveActivity.isPending}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-br from-brand to-brand-dark text-white rounded-xl text-sm font-bold shadow-sm disabled:opacity-50">
                    {saveActivity.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button onClick={startNewActivity}
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
                        <button onClick={() => toggleActivityActive.mutate(a)} className={cn('p-1.5 rounded-lg shrink-0', a.is_active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-300 hover:bg-slate-100')}>
                          {a.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => startEditActivity(a)} className="p-1.5 text-slate-400 hover:text-orange-600 rounded-lg shrink-0"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => { if (confirm(`Eliminar "${a.name}"?`)) removeActivity.mutate(a.id) }} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}

            {section === 'testimonials' && (
              editingTestimonialId ? (
                <div className="space-y-4">
                  <button onClick={cancelTestimonial} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
                    <ArrowLeft className="w-3.5 h-3.5" /> Voltar à lista
                  </button>
                  <TestimonialEditForm form={testimonialForm} onChange={setTestimonialForm} />
                  <button onClick={() => saveTestimonial.mutate()} disabled={saveTestimonial.isPending}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-br from-brand to-brand-dark text-white rounded-xl text-sm font-bold shadow-sm disabled:opacity-50">
                    {saveTestimonial.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button onClick={startNewTestimonial}
                    className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gradient-to-br from-brand to-brand-dark text-white rounded-xl text-xs font-bold shadow-sm">
                    <Plus className="w-3.5 h-3.5" /> Novo Testemunho
                  </button>
                  <div className="space-y-2">
                    {draftTestimonials.map(t => (
                      <div key={t.id} className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{t.name}</p>
                          <div className="flex items-center gap-0.5 text-amber-400">
                            {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-2.5 h-2.5" fill="currentColor" strokeWidth={0} />)}
                          </div>
                        </div>
                        <button onClick={() => toggleTestimonialActive.mutate(t)} className={cn('p-1.5 rounded-lg shrink-0', t.is_active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-300 hover:bg-slate-100')}>
                          {t.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => startEditTestimonial(t)} className="p-1.5 text-slate-400 hover:text-orange-600 rounded-lg shrink-0"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => { if (confirm(`Eliminar testemunho de "${t.name}"?`)) removeTestimonial.mutate(t.id) }} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}

            {section === 'contact' && (
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
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Texto do rodapé</label>
                  <input value={draftSettings.footer_text || ''} onChange={e => setDraftSettings(s => ({ ...s, footer_text: e.target.value }))} className={iCls} />
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
            onLoad={() => broadcastPreview(iframeRef, { activities: previewActivities, settings: draftSettings, testimonials: previewTestimonials })}
          />
        </div>
      </div>
    </div>
  )
}
