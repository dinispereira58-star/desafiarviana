import { useState, useEffect, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Save, Loader2, Upload, Compass } from 'lucide-react'
import { supabase, uploadFile } from '@/lib/supabase'
import { useCrmSettings, useInvalidateCrmSettings } from '@/lib/useCrmSettings'
import { cn } from '@/lib/utils'
import ActivitiesManager from '@/components/ActivitiesManager'

const iCls = 'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 bg-slate-50 transition-all'
const PALETTES = [
  { name: 'Laranja Aventura', primary: '#ff6a00', secondary: '#e85d00' },
  { name: 'Verde Floresta', primary: '#1a7a3e', secondary: '#14602f' },
  { name: 'Azul Adrenalina', primary: '#0284c7', secondary: '#0369a1' },
  { name: 'Vermelho Ação', primary: '#dc2626', secondary: '#b91c1c' },
  { name: 'Roxo Noite', primary: '#7c3aed', secondary: '#6d28d9' },
]

export default function Settings() {
  const settings = useCrmSettings()
  const invalidate = useInvalidateCrmSettings()
  const fileRef = useRef()
  const [tab, setTab] = useState('geral')
  const [form, setForm] = useState(settings)
  const [uploading, setUploading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => { setForm(settings) }, [settings.id])

  const save = useMutation({
    mutationFn: async () => {
      const { id, ...fields } = form
      const { error } = await supabase.from('crm_settings').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', 1)
      if (error) throw error
    },
    onSuccess: () => { invalidate(); toast.success('Configurações guardadas!') },
    onError: e => toast.error('Erro: ' + e.message),
  })

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadFile(file, 'assets')
      set('logo_url', url)
      toast.success('Logótipo carregado — não esqueças de Guardar')
    } catch (err) {
      toast.error('Erro ao carregar: ' + err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="font-display font-bold text-slate-800 text-lg">Configurações</h1>

      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit">
        <button onClick={() => setTab('geral')} className={cn('px-4 py-1.5 rounded-lg text-xs font-bold transition-colors', tab === 'geral' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50')}>Geral</button>
        <button onClick={() => setTab('activities')} className={cn('px-4 py-1.5 rounded-lg text-xs font-bold transition-colors', tab === 'activities' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50')}>Atividades</button>
      </div>

      {tab === 'activities' ? (
        <section className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg">
          <ActivitiesManager />
        </section>
      ) : (
      <>
      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
        <h2 className="font-display font-bold text-slate-700">Identidade</h2>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nome (mostrado no menu lateral)</label>
          <input value={form.agency_name || ''} onChange={e => set('agency_name', e.target.value)} className={iCls} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Logótipo</label>
          <div className="flex items-center gap-4">
            {form.logo_url ? (
              <img src={form.logo_url} alt="" className="h-16 w-16 object-contain rounded-xl border border-slate-200 bg-slate-50" />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white"><Compass className="w-6 h-6" /></div>
            )}
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-semibold text-slate-600 transition-colors disabled:opacity-50">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Carregar imagem
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2">Cores da marca</label>
          <div className="flex gap-2 flex-wrap mb-3">
            {PALETTES.map(p => (
              <button key={p.name} onClick={() => { set('primary_color', p.primary); set('secondary_color', p.secondary) }}
                title={p.name}
                className="w-8 h-8 rounded-lg border-2 border-white shadow-sm ring-1 ring-slate-200"
                style={{ background: `linear-gradient(135deg, ${p.primary}, ${p.secondary})` }} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <input type="color" value={form.primary_color} onChange={e => set('primary_color', e.target.value)} className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer" />
              <input value={form.primary_color} onChange={e => set('primary_color', e.target.value)} className={iCls} />
            </div>
            <div className="flex items-center gap-2">
              <input type="color" value={form.secondary_color} onChange={e => set('secondary_color', e.target.value)} className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer" />
              <input value={form.secondary_color} onChange={e => set('secondary_color', e.target.value)} className={iCls} />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-bold text-slate-700">Página de Login</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Título</label>
            <input value={form.login_title || ''} onChange={e => set('login_title', e.target.value)} className={iCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Subtítulo</label>
            <input value={form.login_subtitle || ''} onChange={e => set('login_subtitle', e.target.value)} className={iCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Mensagem de boas-vindas</label>
            <input value={form.login_welcome || ''} onChange={e => set('login_welcome', e.target.value)} className={iCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Texto do botão</label>
            <input value={form.login_btn || ''} onChange={e => set('login_btn', e.target.value)} className={iCls} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Descrição</label>
            <input value={form.login_desc || ''} onChange={e => set('login_desc', e.target.value)} className={iCls} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Rodapé</label>
            <input value={form.login_footer || ''} onChange={e => set('login_footer', e.target.value)} className={iCls} />
          </div>
        </div>
      </section>

      <button onClick={() => save.mutate()} disabled={save.isPending}
        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-brand to-brand-dark text-white rounded-xl text-sm font-bold shadow-sm disabled:opacity-50">
        {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Guardar Configurações
      </button>
      </>
      )}
    </div>
  )
}
