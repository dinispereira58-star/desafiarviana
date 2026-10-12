import { useEffect, useRef, useState } from 'react'
import { Plus, Trash2, Upload, Loader2, X, Pencil, ArrowLeft, ChevronUp, ChevronDown, Ruler } from 'lucide-react'
import { uploadFile } from '@/lib/supabase'

const iCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 bg-slate-50 transition-all'

// Tipos de aluguer — a mesma ordem em que aparecem no site.
export const RENTAL_CATEGORIES = [
  { key: 'insuflavel', label: 'Insufláveis', singular: 'insuflável', emoji: '🏰' },
  { key: 'trampolim', label: 'Trampolins', singular: 'trampolim', emoji: '🤸' },
]
// Itens antigos (sem tipo): trampolins/camas elásticas pelo nome, o resto insuflável (igual ao site).
export const itemCategory = it => it.category || (/trampol|cama.*el[aá]stic/i.test(it.name || '') ? 'trampolim' : 'insuflavel')

function newItem(category) {
  const c = RENTAL_CATEGORIES.find(x => x.key === category)
  return {
    id: `novo-${Date.now()}`, category, name: '', emoji: c.emoji, price: 0, size: '',
    description: '', details: '', features: [], extra_prices: [], photo_url: null, gallery: [],
  }
}

// Alugueres (insufláveis e trampolins): cada item tem cartão e página própria
// no site. Lista por tipo → editor do item (os textos da página dele).
// `onEditingItem(id|null)`: a pré-visualização abre a página do item.
export default function RentalItemsEditor({ items = [], onChange, activityId, onEditingItem }) {
  const [editing, setEditing] = useState(null)   // id do item aberto
  const item = items.find(it => it.id === editing)

  useEffect(() => { onEditingItem?.(item ? item.id : null) }, [item?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => onEditingItem?.(null), []) // eslint-disable-line react-hooks/exhaustive-deps

  const setItem = (fields) => onChange(items.map(it => (it.id === editing ? { ...it, ...fields } : it)))
  const add = (category) => {
    const it = newItem(category)
    onChange([...items, it])
    setEditing(it.id)
  }
  const remove = (it) => {
    if (!confirm(`Eliminar "${it.name || 'este item'}"? O cartão e a página dele saem do site.`)) return
    onChange(items.filter(x => x.id !== it.id))
    if (editing === it.id) setEditing(null)
  }
  // Sobe/desce dentro do mesmo tipo (troca com o vizinho desse tipo).
  const move = (it, dir) => {
    const cat = itemCategory(it)
    const idx = items.indexOf(it)
    const same = items.map((x, i) => [x, i]).filter(([x]) => itemCategory(x) === cat).map(([, i]) => i)
    const other = same[same.indexOf(idx) + dir]
    if (other === undefined) return
    const next = [...items]
    ;[next[idx], next[other]] = [next[other], next[idx]]
    onChange(next)
  }

  if (item) return <ItemForm item={item} set={setItem} activityId={activityId} onBack={() => setEditing(null)} onRemove={() => remove(item)} />

  return (
    <div className="space-y-4">
      {RENTAL_CATEGORIES.map(c => {
        const list = items.filter(it => itemCategory(it) === c.key)
        return (
          <div key={c.key}>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{c.emoji} {c.label} <span className="text-slate-300 font-semibold">({list.length})</span></p>
            <div className="space-y-1.5">
              {list.map((it, i) => (
                <div key={it.id} className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2.5 py-2">
                  {it.photo_url
                    ? <img src={it.photo_url} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                    : <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-base shrink-0">{it.emoji}</div>}
                  <button type="button" onClick={() => setEditing(it.id)} className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-semibold text-slate-800 truncate">{it.name || <span className="text-slate-400 italic">Sem nome</span>}</p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {it.size ? <><Ruler className="w-3 h-3 inline -mt-0.5" /> {it.size} · </> : null}{Number(it.price) > 0 ? `${it.price}€/dia` : 'sob consulta'}
                    </p>
                  </button>
                  <div className="flex flex-col shrink-0">
                    <button type="button" onClick={() => move(it, -1)} disabled={i === 0} className="text-slate-300 hover:text-slate-600 disabled:opacity-30" title="Subir"><ChevronUp className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => move(it, 1)} disabled={i === list.length - 1} className="text-slate-300 hover:text-slate-600 disabled:opacity-30" title="Descer"><ChevronDown className="w-3.5 h-3.5" /></button>
                  </div>
                  <button type="button" onClick={() => setEditing(it.id)} className="p-1.5 text-slate-400 hover:text-orange-600 rounded-lg shrink-0" title="Editar cartão e página"><Pencil className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => remove(it)} className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg shrink-0" title="Eliminar"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              {list.length === 0 && <p className="text-[11px] text-slate-300 italic">Ainda sem {c.label.toLowerCase()}</p>}
            </div>
            <button type="button" onClick={() => add(c.key)} className="flex items-center gap-1 text-xs font-semibold text-orange-600 mt-1.5">
              <Plus className="w-3 h-3" /> Adicionar {c.singular}
            </button>
          </div>
        )
      })}
      <p className="text-[10px] text-slate-400">Cada item tem um cartão na página {activityId ? <b>/atividades/{activityId}</b> : 'dos alugueres'} e uma página própria. As regras de segurança são as da atividade e aparecem em todas.</p>
    </div>
  )
}

function ItemForm({ item, set, activityId, onBack, onRemove }) {
  const photoRef = useRef()
  const galleryRef = useRef()
  const [uploading, setUploading] = useState(null)   // 'photo' | 'gallery'
  const features = item.features || []
  const extras = item.extra_prices || []
  const cat = itemCategory(item)

  const upload = async (e, kind) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(kind)
    try {
      const url = await uploadFile(file, 'assets')
      if (kind === 'photo') set({ photo_url: url })
      else set({ gallery: [...(item.gallery || []), url] })
    } catch (err) { alert('Erro ao carregar imagem: ' + err.message) }
    finally { setUploading(null); e.target.value = '' }
  }
  const setList = (key, list) => set({ [key]: list })
  const updateIn = (key, list, i, field, value) => setList(key, list.map((x, idx) => (idx === i ? { ...x, [field]: value } : x)))

  return (
    <div className="space-y-3 rounded-xl border border-orange-200 bg-orange-50/40 p-3">
      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
          <ArrowLeft className="w-3.5 h-3.5" /> Todos os alugueres
        </button>
        <button type="button" onClick={onRemove} className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-700"><Trash2 className="w-3.5 h-3.5" /> Eliminar</button>
      </div>
      <p className="text-[10px] text-slate-400 -mt-1">Página no site: <b>/atividades/{activityId || '…'}/{item.id}</b>{String(item.id).startsWith('novo-') && ' (o endereço final é criado a partir do nome ao guardar)'}</p>

      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Tipo</label>
        <div className="grid grid-cols-2 gap-1.5">
          {RENTAL_CATEGORIES.map(c => (
            <button key={c.key} type="button" onClick={() => set({ category: c.key })}
              className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${cat === c.key ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300'}`}>
              {c.emoji} <span className="capitalize">{c.singular}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[56px_1fr] gap-2.5">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Emoji</label>
          <input value={item.emoji || ''} onChange={e => set({ emoji: e.target.value })} className={iCls + ' text-center'} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Nome</label>
          <input value={item.name} onChange={e => set({ name: e.target.value })} placeholder="Ex: Castelo Insuflável Clássico" className={iCls} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Tamanho</label>
          <input value={item.size || ''} onChange={e => set({ size: e.target.value })} placeholder="Ex: 5 x 4 x 3 m" className={iCls} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Preço por dia (€)</label>
          <input type="number" min={0} step="0.5" value={item.price ?? ''} onChange={e => set({ price: Number(e.target.value) })} className={iCls} />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Outros preços <span className="font-normal text-slate-400">— ex.: meio dia, monitor, transporte</span></label>
        <div className="space-y-1.5">
          {extras.map((p, i) => (
            <div key={i} className="flex gap-1.5 items-center">
              <input value={p.label} onChange={e => updateIn('extra_prices', extras, i, 'label', e.target.value)} placeholder="Ex: Meio dia (4h)" className={iCls} />
              <input type="number" min={0} step="0.5" value={p.price ?? ''} onChange={e => updateIn('extra_prices', extras, i, 'price', Number(e.target.value))} placeholder="€" className={iCls + ' max-w-[70px]'} />
              <button type="button" onClick={() => setList('extra_prices', extras.filter((_, idx) => idx !== i))} className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setList('extra_prices', [...extras, { label: '', price: 0 }])} className="flex items-center gap-1 text-xs font-semibold text-orange-600 mt-1.5"><Plus className="w-3 h-3" /> Adicionar preço</button>
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Descrição curta <span className="font-normal text-slate-400">— no cartão</span></label>
        <textarea rows={2} value={item.description || ''} onChange={e => set({ description: e.target.value })} className={iCls + ' resize-none'} />
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">«Sobre» — texto da página</label>
        <textarea rows={5} value={item.details || ''} onChange={e => set({ details: e.target.value })}
          placeholder={item.description ? 'Vazio: a página mostra a descrição curta' : 'Texto a explicar este aluguer...'} className={iCls + ' resize-y'} />
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Características <span className="font-normal text-slate-400">— o tamanho já aparece em primeiro</span></label>
        <div className="space-y-1.5">
          {features.map((f, i) => (
            <div key={i} className="flex gap-1.5 items-center">
              <input value={f.label} onChange={e => updateIn('features', features, i, 'label', e.target.value)} placeholder="Ex: Idades" className={iCls + ' max-w-[42%]'} />
              <input value={f.value} onChange={e => updateIn('features', features, i, 'value', e.target.value)} placeholder="Ex: 3 a 12 anos" className={iCls} />
              <button type="button" onClick={() => setList('features', features.filter((_, idx) => idx !== i))} className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setList('features', [...features, { label: '', value: '' }])} className="flex items-center gap-1 text-xs font-semibold text-orange-600 mt-1.5"><Plus className="w-3 h-3" /> Adicionar característica</button>
        {features.length === 0 && <p className="text-[10px] text-slate-400 mt-1">Sugestões: Altura, Capacidade, Idades, Área necessária, Tomada elétrica.</p>}
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Foto principal <span className="font-normal text-slate-400">— no cartão e no topo da página</span></label>
        <div className="flex items-center gap-2.5">
          {item.photo_url ? (
            <div className="relative shrink-0">
              <img src={item.photo_url} alt="" className="w-14 h-14 object-cover rounded-lg border border-slate-200" />
              <button type="button" onClick={() => set({ photo_url: null })} className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-rose-500 text-white rounded-full flex items-center justify-center"><X className="w-3 h-3" /></button>
            </div>
          ) : (
            <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xl shrink-0">{item.emoji}</div>
          )}
          <button type="button" onClick={() => photoRef.current?.click()} disabled={!!uploading}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600 disabled:opacity-50">
            {uploading === 'photo' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Carregar
          </button>
          <input ref={photoRef} type="file" accept="image/*" onChange={e => upload(e, 'photo')} className="hidden" />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Mais fotos <span className="font-normal text-slate-400">— galeria da página</span></label>
        <div className="grid grid-cols-4 gap-2 mb-2">
          {(item.gallery || []).map((url, i) => (
            <div key={i} className="relative aspect-square">
              <img src={url} alt="" className="w-full h-full object-cover rounded-lg border border-slate-200" />
              <button type="button" onClick={() => set({ gallery: item.gallery.filter((_, idx) => idx !== i) })} className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-rose-500 text-white rounded-full flex items-center justify-center"><X className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => galleryRef.current?.click()} disabled={!!uploading}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600 disabled:opacity-50">
          {uploading === 'gallery' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Adicionar foto
        </button>
        <input ref={galleryRef} type="file" accept="image/*" onChange={e => upload(e, 'gallery')} className="hidden" />
      </div>

      <button type="button" onClick={onBack} className="w-full py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">
        Concluído — voltar à lista (lembra-te de Guardar)
      </button>
    </div>
  )
}
