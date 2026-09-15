export const PLATFORMS = [
  { key: 'instagram', label: 'Instagram', emoji: '📸' },
  { key: 'facebook', label: 'Facebook', emoji: '👍' },
  { key: 'tiktok', label: 'TikTok', emoji: '🎵' },
  { key: 'youtube', label: 'YouTube', emoji: '▶️' },
  { key: 'site', label: 'Site Próprio', emoji: '🌐' },
  { key: 'email', label: 'Email Marketing', emoji: '✉️' },
]
export const PLATFORM_MAP = Object.fromEntries(PLATFORMS.map(p => [p.key, p]))

export const CONTENT_TYPES = [
  { key: 'imagem', label: 'Imagem' },
  { key: 'video', label: 'Vídeo' },
  { key: 'carrossel', label: 'Carrossel' },
  { key: 'story', label: 'Story' },
  { key: 'reel', label: 'Reel' },
  { key: 'artigo', label: 'Artigo' },
]

export const OBJECTIVES = [
  { key: 'visibilidade', label: 'Visibilidade' },
  { key: 'leads', label: 'Leads' },
  { key: 'engagement', label: 'Engagement' },
  { key: 'trafego', label: 'Tráfego' },
  { key: 'vendas', label: 'Vendas' },
]

export const PUB_STATUSES = [
  { key: 'planeado', label: 'Planeado', color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  { key: 'publicado', label: 'Publicado', color: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  { key: 'pausado', label: 'Pausado', color: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  { key: 'cancelado', label: 'Cancelado', color: 'bg-rose-50 text-rose-600', dot: 'bg-rose-500' },
]
export const PUB_STATUS_MAP = Object.fromEntries(PUB_STATUSES.map(s => [s.key, s]))
