// supabase/functions/admin-users/index.ts
// Deploy: supabase functions deploy admin-users
//
// Gere os logins do CRM (listar, criar, mudar password, eliminar) usando a
// Auth Admin API do Supabase — só possível com a service role key, que
// nunca pode estar no código do browser. Qualquer utilizador autenticado
// deste projeto pode chamar isto (CRM de uso individual/pequena equipa,
// sem sistema de papéis) — a única verificação é que quem chama já tem
// sessão válida neste mesmo projeto Supabase.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const authHeader = req.headers.get('Authorization') || ''
  const token = authHeader.replace('Bearer ', '')
  if (!token) return json({ error: 'unauthorized' }, 401)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  // Confirma que quem chama tem mesmo sessão válida neste projeto.
  const callerClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } })
  const { data: { user: caller }, error: authErr } = await callerClient.auth.getUser()
  if (authErr || !caller) return json({ error: 'unauthorized' }, 401)

  const admin = createClient(supabaseUrl, serviceRoleKey)

  try {
    const { action, ...params } = await req.json()

    if (action === 'list') {
      const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 })
      if (error) throw error
      const users = data.users.map(u => ({
        id: u.id, email: u.email, created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at, email_confirmed_at: u.email_confirmed_at,
      }))
      return json({ users })
    }

    if (action === 'create') {
      const { email, password } = params
      if (!email || !password) return json({ error: 'missing_params' }, 400)
      const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true })
      if (error) throw error
      return json({ user: data.user })
    }

    if (action === 'updatePassword') {
      const { userId, password } = params
      if (!userId || !password) return json({ error: 'missing_params' }, 400)
      const { error } = await admin.auth.admin.updateUserById(userId, { password })
      if (error) throw error
      return json({ success: true })
    }

    if (action === 'delete') {
      const { userId } = params
      if (!userId) return json({ error: 'missing_params' }, 400)
      if (userId === caller.id) return json({ error: 'cannot_delete_self' }, 400)
      const { error } = await admin.auth.admin.deleteUser(userId)
      if (error) throw error
      return json({ success: true })
    }

    return json({ error: 'unknown_action' }, 400)
  } catch (err) {
    return json({ error: 'internal_error', error_description: String(err?.message || err) }, 500)
  }
})
