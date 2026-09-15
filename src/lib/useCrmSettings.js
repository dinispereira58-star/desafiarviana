import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from './supabase'

const DEFAULTS = {
  id: 1, agency_name: 'Desafiar Viana', logo_url: null,
  primary_color: '#ff6a00', secondary_color: '#e85d00',
  login_title: 'Desafiar Viana', login_subtitle: 'Gestão de Atividades & Reservas',
  login_welcome: 'Bem-vindo de volta', login_desc: '', login_btn: 'Entrar', login_footer: '',
}

export function useCrmSettings() {
  const { data } = useQuery({
    queryKey: ['crm-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('crm_settings').select('*').eq('id', 1).maybeSingle()
      if (error) throw error
      return data || DEFAULTS
    },
    staleTime: 60000,
  })
  const settings = data || DEFAULTS

  // As cores da marca são variáveis CSS (--color-brand/--color-brand-dark,
  // ver src/index.css) — todas as classes Tailwind bg-brand/text-brand/
  // from-brand já as referem em runtime, por isso basta atualizar aqui
  // para toda a aplicação mudar de cor, sem tocar em mais nenhum ficheiro.
  useEffect(() => {
    document.documentElement.style.setProperty('--color-brand', settings.primary_color)
    document.documentElement.style.setProperty('--color-brand-dark', settings.secondary_color)
  }, [settings.primary_color, settings.secondary_color])

  return settings
}

export function useInvalidateCrmSettings() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: ['crm-settings'] })
}
