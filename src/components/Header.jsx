import { Link, useLocation } from 'react-router-dom'
import { LogOut, Compass, Inbox, Settings2 } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/', label: 'Pedidos', icon: Inbox },
  { to: '/site', label: 'Site', icon: Settings2 },
]

export default function Header() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()

  return (
    <header className="bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white shadow-md shadow-orange-200">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-slate-800 text-base leading-tight">Desafiar Viana</h1>
            <p className="text-[11px] text-slate-400 font-medium">Gestão de Atividades &amp; Reservas</p>
          </div>
        </div>

        <nav className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          {NAV.map(item => {
            const Icon = item.icon
            const active = pathname === item.to
            return (
              <Link key={item.to} to={item.to}
                className={cn('flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors',
                  active ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
                <Icon className="w-3.5 h-3.5" /> {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">{user?.email}</span>
          <button onClick={logout} className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors" title="Sair">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
