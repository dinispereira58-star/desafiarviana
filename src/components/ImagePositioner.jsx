import { useRef, useState } from 'react'
import { Move, RotateCcw } from 'lucide-react'

// Enquadramento de uma foto recortada no site (cartões, topo das páginas):
// arrasta-se a imagem dentro de cada recorte e a posição fica guardada no
// próprio endereço — "…/foto.jpg#pos=50,30" (percentagens horizontal,vertical).
// O site (lib/imagePos.js) lê o "#pos" e aplica-o em object-position.
const RE = /#pos=(\d+(?:\.\d+)?),(\d+(?:\.\d+)?)$/

export function parsePos(url) {
  const m = url ? String(url).match(RE) : null
  return m ? { src: url.slice(0, m.index), x: +m[1], y: +m[2], set: true } : { src: url, x: 50, y: 50, set: false }
}
const withPos = (src, x, y) => `${src}#pos=${Math.round(x)},${Math.round(y)}`
const clamp = v => Math.min(100, Math.max(0, v))

// `frames`: os recortes onde a foto aparece no site, ex.: [{ label: 'Cartão', ratio: 1.65 }].
// `defaultY`: posição vertical que o site usa sem enquadramento (ex.: 0 = topo).
export default function ImagePositioner({ url, onChange, frames, defaultY = 50 }) {
  const { src, x, y, set } = parsePos(url)
  const pos = { x, y: set ? y : defaultY }
  const [natural, setNatural] = useState(null)
  const drag = useRef(null)
  if (!src) return null

  const start = (e, box) => {
    if (!natural) return
    e.preventDefault()
    const r = box.getBoundingClientRect()
    // Quanto a imagem sobra do recorte (em px) em cada eixo — é o que se pode deslocar.
    const scale = Math.max(r.width / natural.w, r.height / natural.h)
    drag.current = { sx: e.clientX, sy: e.clientY, x0: pos.x, y0: pos.y, ox: natural.w * scale - r.width, oy: natural.h * scale - r.height }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const move = e => {
    const d = drag.current
    if (!d) return
    // Arrastar a imagem para a direita mostra mais do lado esquerdo (posição diminui).
    const nx = d.ox > 1 ? clamp(d.x0 - ((e.clientX - d.sx) / d.ox) * 100) : d.x0
    const ny = d.oy > 1 ? clamp(d.y0 - ((e.clientY - d.sy) / d.oy) * 100) : d.y0
    onChange(withPos(src, nx, ny))
  }
  const end = () => { drag.current = null }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1 text-[10px] font-semibold text-slate-500"><Move className="w-3 h-3" /> Arrasta a foto para escolher o que aparece</p>
        {set && (
          <button type="button" onClick={() => onChange(src)} className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-slate-700">
            <RotateCcw className="w-3 h-3" /> Repor
          </button>
        )}
      </div>
      {/* O primeiro recorte em grande (para arrastar com precisão); os outros por baixo, mais pequenos. */}
      {[frames.slice(0, 1), frames.slice(1)].filter(g => g.length).map((group, gi) => (
        <div key={gi} className="flex gap-2 items-start">
          {group.map(f => (
            <div key={f.label} className="flex-1 min-w-0" style={{ flexGrow: f.ratio }}>
              <div
                className="relative w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100 cursor-grab active:cursor-grabbing touch-none select-none"
                style={{ aspectRatio: String(f.ratio) }}
                onPointerDown={e => start(e, e.currentTarget)}
                onPointerMove={move}
                onPointerUp={end}
                onPointerCancel={end}
              >
                <img src={src} alt="" draggable={false} onLoad={e => setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ objectPosition: `${pos.x}% ${pos.y}%` }} />
              </div>
              <p className="text-[9px] text-slate-400 text-center mt-0.5">{f.label}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
