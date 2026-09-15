import { Plus, Trash2 } from 'lucide-react'

const iCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 bg-slate-50 transition-all'
const CALC_TYPES = [
  { key: 'people', label: 'Preço por pessoa' },
  { key: 'paintball', label: 'Pacotes de bolas (paintball)' },
  { key: 'rental', label: 'Itens avulsos (aluguer)' },
]
const COLORS = [
  'from-orange-500 to-red-600', 'from-amber-400 to-orange-500', 'from-pink-500 to-purple-600',
  'from-sky-400 to-blue-600', 'from-green-500 to-emerald-600', 'from-teal-400 to-cyan-600',
]

// Formulário de edição de uma atividade, sem cromo de modal — usado inline
// na barra lateral, para as alterações poderem ser transmitidas em tempo
// real para a pré-visualização assim que o campo muda (sem esperar por
// "Guardar").
export default function ActivityEditForm({ form, onChange }) {
  const set = (k, v) => onChange({ ...form, [k]: v })

  const addPackage = () => set('ball_packages', [...(form.ball_packages || []), { id: Date.now().toString(), label: '', pricePerPerson: 0 }])
  const updatePackage = (i, field, value) => {
    const next = [...form.ball_packages]
    next[i] = { ...next[i], [field]: value }
    set('ball_packages', next)
  }
  const removePackage = (i) => set('ball_packages', form.ball_packages.filter((_, idx) => idx !== i))

  const addItem = () => set('items', [...(form.items || []), { id: Date.now().toString(), name: '', emoji: '🎈', price: 0 }])
  const updateItem = (i, field, value) => {
    const next = [...form.items]
    next[i] = { ...next[i], [field]: value }
    set('items', next)
  }
  const removeItem = (i) => set('items', form.items.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-3.5">
      <div className="grid grid-cols-[56px_1fr] gap-2.5">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Emoji</label>
          <input value={form.emoji || ''} onChange={e => set('emoji', e.target.value)} className={iCls + ' text-center'} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Nome</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} className={iCls} />
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Frase curta</label>
        <input value={form.tagline || ''} onChange={e => set('tagline', e.target.value)} className={iCls} />
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Descrição</label>
        <textarea rows={3} value={form.description || ''} onChange={e => set('description', e.target.value)} className={iCls + ' resize-none'} />
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Cor</label>
        <div className="flex gap-1.5 flex-wrap">
          {COLORS.map(c => (
            <button key={c} type="button" onClick={() => set('color', c)}
              className={`w-7 h-7 rounded-lg bg-gradient-to-br ${c} ${form.color === c ? 'ring-2 ring-offset-2 ring-slate-800' : ''}`} />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Tipo de preço</label>
        <select value={form.calculator_type} onChange={e => set('calculator_type', e.target.value)} className={iCls}>
          {CALC_TYPES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
      </div>

      {form.calculator_type === 'people' && (
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Preço/pessoa (€)</label>
            <input type="number" step="0.5" value={form.price_per_person || ''} onChange={e => set('price_per_person', Number(e.target.value))} className={iCls} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Mín. pessoas</label>
            <input type="number" value={form.min_people || ''} onChange={e => set('min_people', Number(e.target.value))} className={iCls} />
          </div>
        </div>
      )}

      {form.calculator_type === 'paintball' && (
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold text-slate-500">Mínimo de pessoas</label>
          <input type="number" value={form.min_people || ''} onChange={e => set('min_people', Number(e.target.value))} className={iCls} />
          <label className="block text-[11px] font-semibold text-slate-500 mt-2">Pacotes de bolas</label>
          {(form.ball_packages || []).map((p, i) => (
            <div key={p.id || i} className="flex gap-1.5 items-center">
              <input placeholder="Ex: 100 bolas" value={p.label} onChange={e => updatePackage(i, 'label', e.target.value)} className={iCls} />
              <input type="number" step="0.5" placeholder="€" value={p.pricePerPerson} onChange={e => updatePackage(i, 'pricePerPerson', Number(e.target.value))} className={iCls + ' max-w-[70px]'} />
              <button type="button" onClick={() => removePackage(i)} className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          <button type="button" onClick={addPackage} className="flex items-center gap-1 text-xs font-semibold text-orange-600"><Plus className="w-3 h-3" /> Adicionar pacote</button>
        </div>
      )}

      {form.calculator_type === 'rental' && (
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold text-slate-500">Itens disponíveis</label>
          {(form.items || []).map((it, i) => (
            <div key={it.id || i} className="flex gap-1.5 items-center">
              <input placeholder="🏰" value={it.emoji} onChange={e => updateItem(i, 'emoji', e.target.value)} className={iCls + ' max-w-[46px] text-center'} />
              <input placeholder="Nome" value={it.name} onChange={e => updateItem(i, 'name', e.target.value)} className={iCls} />
              <input type="number" placeholder="€" value={it.price} onChange={e => updateItem(i, 'price', Number(e.target.value))} className={iCls + ' max-w-[65px]'} />
              <button type="button" onClick={() => removeItem(i)} className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          <button type="button" onClick={addItem} className="flex items-center gap-1 text-xs font-semibold text-orange-600"><Plus className="w-3 h-3" /> Adicionar item</button>
        </div>
      )}

      <label className="flex items-center gap-2 pt-1">
        <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} className="w-4 h-4 accent-orange-500" />
        <span className="text-xs text-slate-600 font-medium">Visível no site</span>
      </label>
    </div>
  )
}
