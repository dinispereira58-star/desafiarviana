import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Inbox, Users, Calendar, Megaphone, Globe, UserCog, Settings,
  LogOut, ChevronLeft, Menu, X, Compass,
} from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import { useCrmSettings } from '@/lib/useCrmSettings'
import { PAGE_REGISTRY, GROUP_LABELS, GROUP_ORDER } from '@/lib/pageRegistry'
import { cn } from '@/lib/utils'

const ICON_MAP = { LayoutDashboard, Inbox, Users, Calendar, Megaphone, Globe, UserCog, Settings }

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const settings = useCrmSettings()
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (id) => pathname === '/' + id || (id === 'Dashboard' && pathname === '/')

  const sidebarContent = (
    <>
      <div className="flex items-center gap-3 px-4 py-5">
        {settings.logo_url ? (
          <img src={settings.logo_url} alt={settings.agency_name} className="h-10 w-10 object-contain rounded-xl shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white shadow-md shadow-orange-200 shrink-0">
            <Compass className="w-5 h-5" />
          </div>
        )}
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="font-display font-bold text-slate-800 text-sm leading-tight truncate">{settings.agency_name}</h1>
            <p className="text-[10px] text-slate-400 font-medium truncate">Gestão de Atividades</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 space-y-5">
        {GROUP_ORDER.map(group => {
          const items = PAGE_REGISTRY.filter(p => p.group === group)
          if (!items.length) return null
          return (
            <div key={group}>
              {!collapsed && GROUP_LABELS[group] && (
                <p className="px-2.5 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{GROUP_LABELS[group]}</p>
              )}
              <div className="space-y-0.5">
                {items.map(item => {
                  const Icon = ICON_MAP[item.icon] || Settings
                  const active = isActive(item.id)
                  return (
                    <Link key={item.id} to={'/' + item.id} onClick={() => setMobileOpen(false)}
                      title={collapsed ? item.label : undefined}
                      className={cn('flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition-colors',
                        active ? 'bg-orange-50 text-brand-dark font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800')}>
                      <Icon className={cn('w-4 h-4 shrink-0', active && 'text-brand')} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      <div className="p-3 border-t border-slate-100">
        <div className={cn('flex items-center gap-2.5 px-1', collapsed && 'justify-center')}>
          {!collapsed && <span className="flex-1 min-w-0 text-xs text-slate-400 font-medium truncate">{user?.email}</span>}
          <button onClick={logout} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0" title="Sair">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/40" />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col shadow-xl" onClick={e => e.stopPropagation()}>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={cn('relative hidden lg:flex flex-col bg-white border-r border-slate-200 shrink-0 transition-all duration-200', collapsed ? 'w-[76px]' : 'w-64')}>
        {sidebarContent}
        <button onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-16 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 shadow-sm">
          <ChevronLeft className={cn('w-3.5 h-3.5 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white"><Compass className="w-4 h-4" /></div>
            <span className="font-display font-bold text-slate-800 text-sm">Desafiar Viana</span>
          </div>
          <button onClick={() => setMobileOpen(true)} className="p-2 text-slate-500"><Menu className="w-5 h-5" /></button>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
