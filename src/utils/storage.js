import { supabase } from '../lib/supabase'

export async function uploadOfficialPhoto(file, officialId) {
  if (!file || !officialId) throw new Error('File and official ID required')

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `official-${officialId}-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('official-photos')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('official-photos').getPublicUrl(path)
  return data.publicUrl
}

export async function uploadProjectPhoto(file, projectId) {
  if (!file || !projectId) throw new Error('File and project ID required')

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `project-${projectId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('project-photos')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('project-photos').getPublicUrl(path)
  return data.publicUrl
}
