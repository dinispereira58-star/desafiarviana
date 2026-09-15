import { useRef, useState } from 'react'
import { Upload, Loader2, X } from 'lucide-react'
import { uploadFile } from '@/lib/supabase'

const iCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 bg-slate-50 transition-all'

export default function HeroEditForm({ form, onChange }) {
  const set = (k, v) => onChange({ ...form, [k]: v })
  const fileRef = useRef()
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try { set('hero_bg_image', await uploadFile(file, 'assets')) }
    catch (err) { alert('Erro ao carregar imagem: ' + err.message) }
    finally { setUploading(false); e.target.value = '' }
  }

  return (
    <div className="space-y-3.5">
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Imagem de fundo (opcional)</label>
        <div className="flex items-center gap-2.5">
          {form.hero_bg_image ? (
            <div className="relative shrink-0">
              <img src={form.hero_bg_image} alt="" className="w-16 h-11 object-cover rounded-lg border border-slate-200" />
              <button type="button" onClick={() => set('hero_bg_image', '')} className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-rose-500 text-white rounded-full flex items-center justify-center"><X className="w-3 h-3" /></button>
            </div>
          ) : (
            <div className="w-16 h-11 rounded-lg bg-slate-100 shrink-0" />
          )}
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-600 disabled:opacity-50">
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            Carregar
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </div>
        <p className="text-[10px] text-slate-400 mt-1">Sem imagem, mostra o fundo escuro com efeitos gráficos.</p>
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Selo (badge) no topo</label>
        <input value={form.hero_badge || ''} onChange={e => set('hero_badge', e.target.value)} className={iCls} />
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Título — 1ª linha</label>
        <input value={form.hero_title_line1 || ''} onChange={e => set('hero_title_line1', e.target.value)} className={iCls} />
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Título — palavra de ligação</label>
        <input value={form.hero_title_line2 || ''} onChange={e => set('hero_title_line2', e.target.value)} className={iCls} />
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Título — destaque (cor de marca)</label>
        <input value={form.hero_title_highlight || ''} onChange={e => set('hero_title_highlight', e.target.value)} className={iCls} />
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Subtítulo</label>
        <textarea rows={3} value={form.hero_subtitle || ''} onChange={e => set('hero_subtitle', e.target.value)} className={iCls + ' resize-none'} />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Botão principal</label>
          <input value={form.hero_cta_primary || ''} onChange={e => set('hero_cta_primary', e.target.value)} className={iCls} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Botão secundário</label>
          <input value={form.hero_cta_secondary || ''} onChange={e => set('hero_cta_secondary', e.target.value)} className={iCls} />
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Frases de destaque (3)</label>
        <div className="space-y-1.5">
          <input value={form.hero_stat_1 || ''} onChange={e => set('hero_stat_1', e.target.value)} className={iCls} />
          <input value={form.hero_stat_2 || ''} onChange={e => set('hero_stat_2', e.target.value)} className={iCls} />
          <input value={form.hero_stat_3 || ''} onChange={e => set('hero_stat_3', e.target.value)} className={iCls} />
        </div>
      </div>
    </div>
  )
}
