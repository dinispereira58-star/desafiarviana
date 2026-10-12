import { Plus, Trash2, X } from 'lucide-react'

const iCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 bg-slate-50 transition-all'

// Preço por pack (ex.: festas de aniversário) — guardado em activities.items:
//   { kind: 'pack',  id, name, price, includes: [] }   preço fixo por festa
//   { kind: 'extra', id, name, price, per: 'crianca' | 'festa' }
// Sem mínimo de pessoas: no site só se pede o n.º de crianças para extras por criança.
export default function PacksEditor({ items = [], onChange }) {
  const packs = items.filter(it => it.kind !== 'extra')
  const extras = items.filter(it => it.kind === 'extra')
  const save = (p, x) => onChange([...p, ...x])
  const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`

  const setPack = (i, fields) => save(packs.map((p, idx) => (idx === i ? { ...p, ...fields } : p)), extras)
  const setExtra = (i, fields) => save(packs, extras.map((x, idx) => (idx === i ? { ...x, ...fields } : x)))

  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        <label className="block text-[11px] font-semibold text-slate-500">Packs <span className="font-normal text-slate-400">— preço por festa</span></label>
        {packs.map((p, i) => (
          <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-2.5 space-y-2">
            <div className="flex gap-1.5 items-center">
              <input value={p.name} onChange={e => setPack(i, { name: e.target.value })} placeholder="Ex: Pack 1" className={iCls} />
              <div className="relative max-w-[90px] shrink-0">
                <input type="number" min={0} step="0.5" value={p.price ?? ''} onChange={e => setPack(i, { price: Number(e.target.value) })} className={iCls + ' pr-6'} />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">€</span>
              </div>
              <button type="button" onClick={() => { if (confirm(`Eliminar "${p.name || 'este pack'}"?`)) save(packs.filter((_, idx) => idx !== i), extras) }}
                className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
            <p className="text-[10px] font-semibold text-slate-400">O que inclui</p>
            {(p.includes || []).map((line, j) => (
              <div key={j} className="flex gap-1.5 items-center">
                <input value={line} onChange={e => setPack(i, { includes: p.includes.map((l, k) => (k === j ? e.target.value : l)) })}
                  placeholder="Ex: Jogos tradicionais" className={iCls + ' py-1.5'} />
                <button type="button" onClick={() => setPack(i, { includes: p.includes.filter((_, k) => k !== j) })} className="p-1 text-slate-300 hover:text-rose-500 shrink-0"><X className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            <button type="button" onClick={() => setPack(i, { includes: [...(p.includes || []), ''] })} className="flex items-center gap-1 text-xs font-semibold text-orange-600"><Plus className="w-3 h-3" /> Adicionar linha</button>
          </div>
        ))}
        <button type="button" onClick={() => save([...packs, { kind: 'pack', id: uid(), name: `Pack ${packs.length + 1}`, price: 0, includes: [] }], extras)}
          className="flex items-center gap-1 text-xs font-semibold text-orange-600"><Plus className="w-3 h-3" /> Adicionar pack</button>
      </div>

      <div className="space-y-1.5">
        <label className="block text-[11px] font-semibold text-slate-500">Extras <span className="font-normal text-slate-400">— opcionais no simulador</span></label>
        {extras.map((x, i) => (
          <div key={x.id} className="flex gap-1.5 items-center">
            <input value={x.name} onChange={e => setExtra(i, { name: e.target.value })} placeholder="Ex: Lanche" className={iCls} />
            <input type="number" min={0} step="0.5" value={x.price ?? ''} onChange={e => setExtra(i, { price: Number(e.target.value) })} placeholder="€" className={iCls + ' max-w-[62px]'} />
            <select value={x.per || 'festa'} onChange={e => setExtra(i, { per: e.target.value })} className={iCls + ' max-w-[96px] px-1.5'}>
              <option value="festa">por festa</option>
              <option value="crianca">por criança</option>
            </select>
            <button type="button" onClick={() => save(packs, extras.filter((_, idx) => idx !== i))} className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
        <button type="button" onClick={() => save(packs, [...extras, { kind: 'extra', id: uid(), name: '', price: 0, per: 'festa' }])}
          className="flex items-center gap-1 text-xs font-semibold text-orange-600"><Plus className="w-3 h-3" /> Adicionar extra</button>
      </div>
      <p className="text-[10px] text-slate-400">Sem mínimo de crianças: no simulador só se pede o número de crianças quando se escolhe um extra por criança (ex.: lanche).</p>
    </div>
  )
}
