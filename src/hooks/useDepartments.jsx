import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { portalRoles as fallbackRoles } from '../data/portalRoles'
import { setDepartmentsCache } from '../utils/routing'

const DepartmentsContext = createContext({
  departments: [],
  loading: true,
  refreshDepartments: async () => {},
})

function mapDepartment(row) {
  return {
    id: row.id,
    roleKey: row.role_key,
    department: row.department,
    departmentAm: row.department_am,
    departmentOm: row.department_om || null,
    isAdmin: !!row.is_admin,
    sortOrder: row.sort_order ?? 0,
  }
}

function mapFallback() {
  return fallbackRoles.map((role, index) => ({
    id: index,
    roleKey: role.roleKey,
    department: role.department,
    departmentAm: role.departmentAm,
    departmentOm: role.departmentOm || null,
    isAdmin: !!role.isAdmin,
    sortOrder: index,
  }))
}

export function DepartmentsProvider({ children }) {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)

  const refreshDepartments = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error

      const mapped = (data && data.length > 0) ? data.map(mapDepartment) : mapFallback()
      setDepartments(mapped)
      setDepartmentsCache(mapped)
    } catch (error) {
      console.error('Error loading departments:', error)
      const mapped = mapFallback()
      setDepartments(mapped)
      setDepartmentsCache(mapped)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshDepartments()
  }, [refreshDepartments])

  return (
    <DepartmentsContext.Provider value={{ departments, loading, refreshDepartments }}>
      {children}
    </DepartmentsContext.Provider>
  )
}

export function useDepartments() {
  const context = useContext(DepartmentsContext)
  if (!context) {
    throw new Error('useDepartments must be used within DepartmentsProvider')
  }
  return context
}

export function getDepartmentByRoleKey(departments, roleKey) {
  return departments.find((d) => d.roleKey === roleKey)
}
