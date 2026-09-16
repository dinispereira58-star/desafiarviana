import { useRef, useState } from 'react'
import { Upload, Loader2, X, Image as ImageIcon, Palette } from 'lucide-react'
import { uploadFile } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { FONT_OPTIONS, TEXT_SIZE_OPTIONS } from '@/lib/fonts'

const iCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 bg-slate-50 transition-all'
const smallSelCls = 'w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-orange-400 bg-white transition-all'

function TextStyleFields({ form, onChange, prefix, title }) {
  const set = (k, v) => onChange({ ...form, [prefix + k]: v })
  return (
    <div className="border border-slate-200 rounded-xl p-3 space-y-2.5 bg-slate-50/50">
      <p className="text-[11px] font-bold text-slate-500">{title}</p>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-[10px] text-slate-400 mb-1">Tamanho</label>
          <select value={form[prefix + '_size'] || ''} onChange={e => set('_size', e.target.value)} className={smallSelCls}>
            {TEXT_SIZE_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-slate-400 mb-1">Fonte</label>
          <select value={form[prefix + '_font'] || ''} onChange={e => set('_font', e.target.value)} className={smallSelCls}>
            {FONT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-slate-400 mb-1">Cor</label>
          <div className="flex items-center gap-1">
            <input type="color" value={form[prefix + '_color'] || '#1a1a1a'} onChange={e => set('_color', e.target.value)} className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer shrink-0" />
            {form[prefix + '_color'] && (
              <button type="button" onClick={() => set('_color', '')} className="text-[10px] text-slate-400 hover:text-rose-500">limpar</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HeroEditForm({ form, onChange }) {
  const set = (k, v) => onChange({ ...form, [k]: v })
  const sideImgRef = useRef()
  const bgImgRef = useRef()
  const [uploadingSide, setUploadingSide] = useState(false)
  const [uploadingBg, setUploadingBg] = useState(false)

  const handleSideUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingSide(true)
    try { set('hero_bg_image', await uploadFile(file, 'assets')) }
    catch (err) { alert('Erro ao carregar imagem: ' + err.message) }
    finally { setUploadingSide(false); e.target.value = '' }
  }
  const handleBgUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingBg(true)
    try { set('hero_background_image', await uploadFile(file, 'assets')) }
    catch (err) { alert('Erro ao carregar imagem: ' + err.message) }
    finally { setUploadingBg(false); e.target.value = '' }
  }

  const bgType = form.hero_background_type || 'color'

  return (
    <div className="space-y-3.5">
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Fundo da secção Hero</label>
        <div className="flex gap-1.5 mb-2.5">
          <button type="button" onClick={() => set('hero_background_type', 'color')}
            className={cn('flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors',
              bgType === 'color' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}>
            <Palette className="w-3.5 h-3.5" /> Cores (atual)
          </button>
          <button type="button" onClick={() => set('hero_background_type', 'image')}
            className={cn('flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors',
              bgType === 'image' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}>
            <ImageIcon className="w-3.5 h-3.5" /> Imagem de fundo
          </button>
        </div>

        {bgType === 'image' && (
          <div className="space-y-2.5 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              {form.hero_background_image ? (
                <div className="relative shrink-0">
                  <img src={form.hero_background_image} alt="" className="w-16 h-11 object-cover rounded-lg border border-slate-200" />
                  <button type="button" onClick={() => set('hero_background_image', '')} className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-rose-500 text-white rounded-full flex items-center justify-center"><X className="w-3 h-3" /></button>
                </div>
              ) : (
                <div className="w-16 h-11 rounded-lg bg-slate-100 shrink-0" />
              )}
              <button type="button" onClick={() => bgImgRef.current?.click()} disabled={uploadingBg}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 disabled:opacity-50">
                {uploadingBg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                Carregar
              </button>
              <input ref={bgImgRef} type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
            </div>
            <div>
              <label className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                <span>Transparência da imagem</span>
                <span className="font-bold">{form.hero_background_opacity ?? 40}%</span>
              </label>
              <input type="range" min={0} max={100} value={form.hero_background_opacity ?? 40}
                onChange={e => set('hero_background_opacity', Number(e.target.value))} className="w-full accent-orange-500" />
            </div>
          </div>
        )}
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
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Título — destaque (mantém sempre o gradiente da marca)</label>
        <input value={form.hero_title_highlight || ''} onChange={e => set('hero_title_highlight', e.target.value)} className={iCls} />
      </div>
      <TextStyleFields form={form} onChange={onChange} prefix="hero_title" title="Estilo do título (1ª/2ª linha — o destaque mantém o gradiente)" />

      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Subtítulo</label>
        <textarea rows={3} value={form.hero_subtitle || ''} onChange={e => set('hero_subtitle', e.target.value)} className={iCls + ' resize-none'} />
      </div>
      <TextStyleFields form={form} onChange={onChange} prefix="hero_subtitle" title="Estilo do subtítulo" />

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

      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Imagem ao lado do texto (opcional)</label>
        <div className="flex items-center gap-2.5">
          {form.hero_bg_image ? (
            <div className="relative shrink-0">
              <img src={form.hero_bg_image} alt="" className="w-16 h-11 object-cover rounded-lg border border-slate-200" />
              <button type="button" onClick={() => set('hero_bg_image', '')} className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-rose-500 text-white rounded-full flex items-center justify-center"><X className="w-3 h-3" /></button>
            </div>
          ) : (
            <div className="w-16 h-11 rounded-lg bg-slate-100 shrink-0" />
          )}
          <button type="button" onClick={() => sideImgRef.current?.click()} disabled={uploadingSide}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-600 disabled:opacity-50">
            {uploadingSide ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            Carregar
          </button>
          <input ref={sideImgRef} type="file" accept="image/*" onChange={handleSideUpload} className="hidden" />
        </div>
        <p className="text-[10px] text-slate-400 mt-1">Aparece numa moldura ao lado do texto (só em ecrãs grandes), independente do fundo escolhido acima.</p>
      </div>
    </div>
  )
}
