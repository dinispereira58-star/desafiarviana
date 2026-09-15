const iCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 bg-slate-50 transition-all'

export default function TestimonialEditForm({ form, onChange }) {
  const set = (k, v) => onChange({ ...form, [k]: v })

  return (
    <div className="space-y-3.5">
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Nome</label>
        <input value={form.name || ''} onChange={e => set('name', e.target.value)} className={iCls} />
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Atividade</label>
        <input value={form.activity || ''} onChange={e => set('activity', e.target.value)} className={iCls} />
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Classificação</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} type="button" onClick={() => set('rating', n)}
              className={`text-xl ${n <= form.rating ? 'text-amber-400' : 'text-slate-200'}`}>★</button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Testemunho</label>
        <textarea rows={4} value={form.text || ''} onChange={e => set('text', e.target.value)} className={iCls + ' resize-none'} />
      </div>
      <label className="flex items-center gap-2 pt-1">
        <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} className="w-4 h-4 accent-orange-500" />
        <span className="text-xs text-slate-600 font-medium">Visível no site</span>
      </label>
    </div>
  )
}
