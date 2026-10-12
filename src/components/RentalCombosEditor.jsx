import { Plus, Trash2, Wand2 } from 'lucide-react'
import { itemCategory } from '@/components/RentalItemsEditor'

const iCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 bg-slate-50 transition-all'

// Conjugações de equipamentos com preço próprio (meio dia / dia inteiro).
// Ficam em activities.items como { kind: 'combo', id, name?, parts: [ids], price_half, price }.
export default function RentalCombosEditor({ items = [], onChange }) {
  const equipment = items.filter(it => it.kind !== 'combo')
  const combos = items.filter(it => it.kind === 'combo')
  const byId = Object.fromEntries(equipment.map(it => [String(it.id), it]))
  const save = next => onChange([...equipment, ...next])
  const setCombo = (i, fields) => save(combos.map((c, idx) => (idx === i ? { ...c, ...fields } : c)))
  const uid = () => `combo-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`
  const nameOf = c => c.name || (c.parts || []).map(id => byId[String(id)]?.name).filter(Boolean).join(' + ') || 'Nova conjugação'

  // Cria as combinações insuflável × cama elástica que ainda não existem (preços a 0, para preencher).
  const ins = equipment.filter(it => itemCategory(it) === 'insuflavel')
  const tra = equipment.filter(it => itemCategory(it) === 'trampolim')
  const key = parts => [...parts].map(String).sort().join('|')
  const existing = new Set(combos.map(c => key(c.parts || [])))
  const missing = ins.flatMap(a => tra.map(b => [a.id, b.id])).filter(p => !existing.has(key(p)))
  const generate = () => save([...combos, ...missing.map(parts => ({ kind: 'combo', id: uid() + parts.join('-'), parts, price_half: 0, price: 0 }))])

  return (
    <div className="space-y-2">
      {combos.map((c, i) => (
        <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-2.5 space-y-2">
          <div className="flex items-start gap-1.5">
            <p className="flex-1 text-xs font-bold text-slate-700 pt-1">{nameOf(c)}</p>
            <button type="button" onClick={() => save(combos.filter((_, idx) => idx !== i))} className="p-1 text-slate-300 hover:text-rose-500 shrink-0" title="Eliminar conjugação"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
          <div className="flex flex-wrap gap-1">
            {equipment.map(it => {
              const on = (c.parts || []).map(String).includes(String(it.id))
              return (
                <button key={it.id} type="button"
                  onClick={() => setCombo(i, { parts: on ? c.parts.filter(id => String(id) !== String(it.id)) : [...(c.parts || []), it.id] })}
                  className={`px-2 py-1 rounded-full text-[11px] font-semibold border transition-colors ${on ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-orange-300'}`}>
                  {it.emoji} {it.name || 'Sem nome'}
                </button>
              )
            })}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Meio dia (€)</label>
              <input type="number" min={0} step="0.5" value={c.price_half ?? ''} onChange={e => setCombo(i, { price_half: Number(e.target.value) })} className={iCls + ' py-1.5'} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Dia inteiro (€)</label>
              <input type="number" min={0} step="0.5" value={c.price ?? ''} onChange={e => setCombo(i, { price: Number(e.target.value) })} className={iCls + ' py-1.5'} />
            </div>
          </div>
          <input value={c.name || ''} onChange={e => setCombo(i, { name: e.target.value })} placeholder={`Nome (opcional) — por omissão: ${nameOf({ ...c, name: '' })}`} className={iCls + ' py-1.5 text-xs'} />
        </div>
      ))}
      {combos.length === 0 && <p className="text-[11px] text-slate-300 italic">Ainda sem conjugações</p>}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <button type="button" onClick={() => save([...combos, { kind: 'combo', id: uid(), parts: [], price_half: 0, price: 0 }])}
          className="flex items-center gap-1 text-xs font-semibold text-orange-600"><Plus className="w-3 h-3" /> Adicionar conjugação</button>
        {missing.length > 0 && (
          <button type="button" onClick={generate} title="Cria uma conjugação para cada insuflável com cada cama elástica (as que ainda não existem)"
            className="flex items-center gap-1 text-xs font-semibold text-violet-600"><Wand2 className="w-3 h-3" /> Criar insuflável × cama elástica ({missing.length})</button>
        )}
      </div>
      <p className="text-[10px] text-slate-400">No site aparecem numa tabela na página dos alugueres, na página de cada equipamento e no simulador.</p>
    </div>
  )
}
