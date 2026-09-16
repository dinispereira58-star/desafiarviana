import { useRef, useState } from 'react'
import { Upload, Loader2, X } from 'lucide-react'
import { uploadFile } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { FONT_OPTIONS } from '@/lib/fonts'

const iCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 bg-slate-50 transition-all'
const selCls = 'w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-orange-400 transition-all'

const KINDS = [
  { key: 'modal', label: 'Popup inicial (centro do ecrã)' },
  { key: 'bar', label: 'Barra (topo/fundo do ecrã)' },
  { key: 'corner', label: 'Caixa num canto do ecrã' },
]
const BAR_POSITIONS = [{ key: 'top', label: 'Topo' }, { key: 'bottom', label: 'Fundo' }]
const CORNER_POSITIONS = [
  { key: 'bottom-right', label: 'Canto inferior direito' },
  { key: 'bottom-left', label: 'Canto inferior esquerdo' },
  { key: 'top-right', label: 'Canto superior direito' },
  { key: 'top-left', label: 'Canto superior esquerdo' },
]
const CONTENT_TYPES = [
  { key: 'text', label: 'Só mensagem' },
  { key: 'image', label: 'Só imagem' },
  { key: 'both', label: 'Imagem + mensagem' },
]
const CLOSE_MODES = [
  { key: 'x', label: 'Só botão X' },
  { key: 'timer', label: 'Só temporizador' },
  { key: 'both', label: 'X ou temporizador' },
]
const ANIMATIONS = [
  { key: 'fade', label: 'Surge suavemente (fade)' },
  { key: 'zoom', label: 'Aproximação (zoom)' },
  { key: 'slide-down', label: 'Desliza de cima' },
  { key: 'slide-up', label: 'Desliza de baixo' },
  { key: 'slide-left', label: 'Desliza da direita' },
  { key: 'slide-right', label: 'Desliza da esquerda' },
  { key: 'bounce', label: 'Com ressalto (bounce)' },
]
const TEXT_SIZES = [{ key: 'sm', label: 'Pequeno' }, { key: 'md', label: 'Médio' }, { key: 'lg', label: 'Grande' }]

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-500 mb-1">{label}</label>
      {children}
    </div>
  )
}

function ColorField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-[10px] text-slate-400 mb-1">{label}</label>
      <div className="flex items-center gap-1.5">
        <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer shrink-0" />
        <input value={value} onChange={e => onChange(e.target.value)} className={iCls + ' font-mono text-xs'} />
      </div>
    </div>
  )
}

function PreviewMock({ form }) {
  const style = { background: form.bg_color, color: form.text_color }
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-100 p-4">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pré-visualização</p>
      <div className="rounded-xl overflow-hidden shadow-sm mx-auto" style={{ ...style, maxWidth: form.kind === 'bar' ? '100%' : form.kind === 'corner' ? form.corner_width : 320 }}>
        {(form.content_type === 'image' || form.content_type === 'both') && form.image_url && (
          <img src={form.image_url} alt="" className="w-full h-24 object-cover" />
        )}
        {form.content_type !== 'image' && (
          <div className="px-3.5 py-3">
            {form.title && <p className="font-display font-bold text-sm mb-0.5">{form.title}</p>}
            {form.message && <p className="text-xs opacity-90">{form.message}</p>}
            {form.link_label && (
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold text-white" style={{ background: form.accent_color }}>{form.link_label}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function PopupEditForm({ form, onChange }) {
  const set = (k, v) => onChange({ ...form, [k]: v })
  const fileRef = useRef()
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try { set('image_url', await uploadFile(file, 'assets')) }
    catch (err) { alert('Erro ao carregar imagem: ' + err.message) }
    finally { setUploading(false); e.target.value = '' }
  }

  return (
    <div className="space-y-4">
      <Field label="Nome interno (só para te ajudar a identificar)">
        <input value={form.name || ''} onChange={e => set('name', e.target.value)} className={iCls} />
      </Field>

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={!!form.is_active} onChange={e => set('is_active', e.target.checked)} className="w-4 h-4 accent-orange-500" />
        <span className="text-xs text-slate-600 font-medium">Ativo no site</span>
      </label>

      <div className="border-t border-slate-100 pt-3.5">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Tipo & posição</p>
        <Field label="Tipo">
          <select value={form.kind} onChange={e => set('kind', e.target.value)} className={selCls}>
            {KINDS.map(k => <option key={k.key} value={k.key}>{k.label}</option>)}
          </select>
        </Field>
        {form.kind === 'bar' && (
          <div className="mt-2.5">
            <Field label="Posição">
              <select value={form.position} onChange={e => set('position', e.target.value)} className={selCls}>
                {BAR_POSITIONS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
              </select>
            </Field>
          </div>
        )}
        {form.kind === 'corner' && (
          <div className="mt-2.5">
            <Field label="Posição">
              <select value={form.position} onChange={e => set('position', e.target.value)} className={selCls}>
                {CORNER_POSITIONS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
              </select>
            </Field>
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 pt-3.5 space-y-2.5">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Conteúdo</p>
        <Field label="O que mostrar">
          <select value={form.content_type} onChange={e => set('content_type', e.target.value)} className={selCls}>
            {CONTENT_TYPES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </Field>
        {form.content_type !== 'image' && (
          <>
            <Field label="Título (opcional)">
              <input value={form.title || ''} onChange={e => set('title', e.target.value)} className={iCls} />
            </Field>
            <Field label="Mensagem">
              <textarea rows={2} value={form.message || ''} onChange={e => set('message', e.target.value)} className={iCls + ' resize-none'} />
            </Field>
          </>
        )}
        {form.content_type !== 'text' && (
          <Field label="Imagem">
            <div className="flex items-center gap-2.5">
              {form.image_url ? (
                <div className="relative shrink-0">
                  <img src={form.image_url} alt="" className="w-16 h-11 object-cover rounded-lg border border-slate-200" />
                  <button type="button" onClick={() => set('image_url', '')} className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-rose-500 text-white rounded-full flex items-center justify-center"><X className="w-3 h-3" /></button>
                </div>
              ) : <div className="w-16 h-11 rounded-lg bg-slate-100 shrink-0" />}
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-600 disabled:opacity-50">
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                Carregar
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </div>
          </Field>
        )}
        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Link (opcional)">
            <input value={form.link_url || ''} onChange={e => set('link_url', e.target.value)} placeholder="https://wa.me/..." className={iCls} />
          </Field>
          <Field label="Texto do botão">
            <input value={form.link_label || ''} onChange={e => set('link_label', e.target.value)} placeholder="Saber mais" className={iCls} />
          </Field>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-3.5 space-y-2.5">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Estilo</p>
        <div className="grid grid-cols-3 gap-2">
          <ColorField label="Fundo" value={form.bg_color} onChange={v => set('bg_color', v)} />
          <ColorField label="Texto" value={form.text_color} onChange={v => set('text_color', v)} />
          <ColorField label="Destaque" value={form.accent_color} onChange={v => set('accent_color', v)} />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Fonte">
            <select value={form.font_family || ''} onChange={e => set('font_family', e.target.value)} className={selCls}>
              {FONT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Tamanho do texto">
            <select value={form.text_size} onChange={e => set('text_size', e.target.value)} className={selCls}>
              {TEXT_SIZES.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </Field>
        </div>
        {form.kind === 'bar' && (
          <Field label={`Altura da barra — ${form.bar_size}px`}>
            <input type="range" min={36} max={96} value={form.bar_size} onChange={e => set('bar_size', Number(e.target.value))} className="w-full accent-orange-500" />
          </Field>
        )}
        {form.kind === 'corner' && (
          <Field label={`Largura da caixa — ${form.corner_width}px`}>
            <input type="range" min={220} max={420} value={form.corner_width} onChange={e => set('corner_width', Number(e.target.value))} className="w-full accent-orange-500" />
          </Field>
        )}
      </div>

      <div className="border-t border-slate-100 pt-3.5 space-y-2.5">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Comportamento</p>
        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Como fecha">
            <select value={form.close_mode} onChange={e => set('close_mode', e.target.value)} className={selCls}>
              {CLOSE_MODES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Animação">
            <select value={form.animation} onChange={e => set('animation', e.target.value)} className={selCls}>
              {ANIMATIONS.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
            </select>
          </Field>
        </div>
        {form.close_mode !== 'x' && (
          <Field label="Fecha sozinho ao fim de quantos segundos">
            <input type="number" min={1} value={form.auto_close_seconds || ''} onChange={e => set('auto_close_seconds', e.target.value ? Number(e.target.value) : null)}
              placeholder="Ex: 6" className={cn(iCls, 'max-w-[120px]')} />
          </Field>
        )}
      </div>

      <PreviewMock form={form} />
    </div>
  )
}
