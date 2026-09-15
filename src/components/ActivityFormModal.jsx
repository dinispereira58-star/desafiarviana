import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { X, Loader2, Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const iCls = 'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 bg-slate-50 transition-all'
const CALC_TYPES = [
  { key: 'people', label: 'Preço por pessoa' },
  { key: 'paintball', label: 'Pacotes de bolas (paintball)' },
  { key: 'rental', label: 'Itens avulsos (aluguer)' },
]
const COLORS = [
  'from-orange-500 to-red-600', 'from-amber-400 to-orange-500', 'from-pink-500 to-purple-600',
  'from-sky-400 to-blue-600', 'from-green-500 to-emerald-600', 'from-teal-400 to-cyan-600',
]

function slugify(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function ActivityFormModal({ activity, onClose }) {
  const qc = useQueryClient()
  const isNew = !activity
  const [form, setForm] = useState(() => activity ? { ...activity } : {
    id: '', name: '', tagline: '', emoji: '🎯', description: '', color: COLORS[0],
    calculator_type: 'people', min_people: 6, price_per_person: 10,
    ball_packages: [], items: [], is_active: true, position: 0,
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = useMutation({
    mutationFn: async () => {
      const id = isNew ? (form.id.trim() || slugify(form.name)) : form.id
      if (!id) throw new Error('Precisa de um nome válido')
      const payload = { ...form, id, updated_at: new Date().toISOString() }
      const { error } = await supabase.from('activities').upsert(payload)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['activities'] }); toast.success('Guardado!'); onClose() },
    onError: e => toast.error('Erro: ' + e.message),
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try { await save.mutateAsync() } finally { setSaving(false) }
  }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl shadow-slate-900/10" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-display font-bold text-slate-800">{isNew ? 'Nova Atividade' : 'Editar Atividade'}</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-[64px_1fr] gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Emoji</label>
              <input value={form.emoji || ''} onChange={e => set('emoji', e.target.value)} className={iCls + ' text-center text-lg'} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nome</label>
              <input required value={form.name} onChange={e => set('name', e.target.value)} className={iCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Frase curta (tagline)</label>
            <input value={form.tagline || ''} onChange={e => set('tagline', e.target.value)} className={iCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Descrição</label>
            <textarea rows={3} value={form.description || ''} onChange={e => set('description', e.target.value)} className={iCls + ' resize-none'} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Cor</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => set('color', c)}
                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c} ${form.color === c ? 'ring-2 ring-offset-2 ring-slate-800' : ''}`} />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tipo de preço</label>
            <select value={form.calculator_type} onChange={e => set('calculator_type', e.target.value)} className={iCls}>
              {CALC_TYPES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>

          {form.calculator_type === 'people' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Preço por pessoa (€)</label>
                <input type="number" step="0.5" value={form.price_per_person || ''} onChange={e => set('price_per_person', Number(e.target.value))} className={iCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Mínimo de pessoas</label>
                <input type="number" value={form.min_people || ''} onChange={e => set('min_people', Number(e.target.value))} className={iCls} />
              </div>
            </div>
          )}

          {form.calculator_type === 'paintball' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-500">Mínimo de pessoas</label>
              <input type="number" value={form.min_people || ''} onChange={e => set('min_people', Number(e.target.value))} className={iCls} />
              <label className="block text-xs font-semibold text-slate-500 mt-3">Pacotes de bolas</label>
              {(form.ball_packages || []).map((p, i) => (
                <div key={p.id || i} className="flex gap-2 items-center">
                  <input placeholder="Ex: 100 bolas" value={p.label} onChange={e => updatePackage(i, 'label', e.target.value)} className={iCls} />
                  <input type="number" step="0.5" placeholder="€/pessoa" value={p.pricePerPerson} onChange={e => updatePackage(i, 'pricePerPerson', Number(e.target.value))} className={iCls + ' max-w-[100px]'} />
                  <button type="button" onClick={() => removePackage(i)} className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg shrink-0"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <button type="button" onClick={addPackage} className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700"><Plus className="w-3.5 h-3.5" /> Adicionar pacote</button>
            </div>
          )}

          {form.calculator_type === 'rental' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-500">Itens disponíveis</label>
              {(form.items || []).map((it, i) => (
                <div key={it.id || i} className="flex gap-2 items-center">
                  <input placeholder="🏰" value={it.emoji} onChange={e => updateItem(i, 'emoji', e.target.value)} className={iCls + ' max-w-[52px] text-center'} />
                  <input placeholder="Nome do item" value={it.name} onChange={e => updateItem(i, 'name', e.target.value)} className={iCls} />
                  <input type="number" step="1" placeholder="€" value={it.price} onChange={e => updateItem(i, 'price', Number(e.target.value))} className={iCls + ' max-w-[90px]'} />
                  <button type="button" onClick={() => removeItem(i)} className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg shrink-0"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <button type="button" onClick={addItem} className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700"><Plus className="w-3.5 h-3.5" /> Adicionar item</button>
            </div>
          )}

          <label className="flex items-center gap-2.5 pt-2">
            <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} className="w-4 h-4 accent-orange-500" />
            <span className="text-sm text-slate-600 font-medium">Visível no site</span>
          </label>
        </form>
        <div className="px-6 py-4 border-t border-slate-100">
          <button onClick={handleSubmit} disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-br from-brand to-brand-dark text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-orange-200 disabled:opacity-50">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
