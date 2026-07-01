import { supabase } from '../lib/supabase'

async function invokeAdminFunction(name, body) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase.functions.invoke(name, { body })

  if (error) {
    throw new Error(error.message || `Failed to call ${name}`)
  }

  if (data?.error) {
    throw new Error(data.error)
  }

  return data
}

export async function createPortalUser(payload) {
  return invokeAdminFunction('admin-create-portal-user', payload)
}

export async function updatePortalUser(payload) {
  return invokeAdminFunction('admin-update-portal-user', payload)
}

export async function resetPortalUserPassword(payload) {
  return invokeAdminFunction('admin-reset-password', payload)
}
