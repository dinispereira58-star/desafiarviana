// Registo central das páginas do CRM — cada entrada gera automaticamente
// uma rota (`/id`) e uma entrada no menu lateral. Ao contrário do CRM da
// imobiliária, aqui não há sistema de permissões por papel (uso
// individual) — a lista é fixa.
export const PAGE_REGISTRY = [
  { id: 'Dashboard', label: 'Dashboard', icon: 'LayoutDashboard', group: 'principal' },
  { id: 'Bookings', label: 'Pedidos', icon: 'Inbox', group: 'principal' },
  { id: 'Clientes', label: 'Clientes', icon: 'Users', group: 'principal' },
  { id: 'Calendar', label: 'Calendário', icon: 'Calendar', group: 'principal' },
  { id: 'Publications', label: 'Publicações', icon: 'Megaphone', group: 'marketing' },
  { id: 'Site', label: 'Site', icon: 'Globe', group: 'ferramentas' },
  { id: 'UserManagement', label: 'Utilizadores', icon: 'UserCog', group: 'admin' },
  { id: 'Settings', label: 'Configurações', icon: 'Settings', group: 'admin' },
]

export const GROUP_LABELS = {
  principal: null,
  marketing: 'Marketing',
  ferramentas: 'Ferramentas',
  admin: 'Administração',
}
export const GROUP_ORDER = Object.keys(GROUP_LABELS)

export const PAGE_MAP = Object.fromEntries(PAGE_REGISTRY.map(p => [p.id, p]))
