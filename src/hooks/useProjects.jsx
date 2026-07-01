import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const ProjectsContext = createContext({
  projects: [],
  loading: true,
  refreshProjects: async () => {},
})

export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  const refreshProjects = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) throw error
      setProjects(data || [])
    } catch (err) {
      console.error('Failed to load projects:', err)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshProjects()
  }, [refreshProjects])

  return (
    <ProjectsContext.Provider value={{ projects, loading, refreshProjects }}>
      {children}
    </ProjectsContext.Provider>
  )
}

export function useProjects() {
  return useContext(ProjectsContext)
}
