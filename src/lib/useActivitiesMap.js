import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'

// Lista viva das atividades (geridas em Site > Atividades ou Configurações
// > Atividades) — substitui a lista fixa que existia antes em constants.js
// e que ficava dessincronizada sempre que uma atividade era criada,
// renomeada ou removida. Inclui também as inativas, porque reservas
// antigas podem referenciar atividades entretanto ocultadas.
export function useActivitiesList() {
  return useQuery({
    queryKey: ['all-activities'],
    queryFn: async () => {
      const { data, error } = await supabase.from('activities').select('*').order('position', { ascending: true })
      if (error) throw error
      return data || []
    },
    staleTime: 30000,
  })
}

export function useActivitiesMap() {
  const { data: activities = [] } = useActivitiesList()
  return Object.fromEntries(activities.map(a => [a.id, a]))
}
