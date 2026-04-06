import useStore from '../store/useStore'

export function useRole() {
  const role = useStore((s) => s.role)

  return {
    role,
    isAdmin: role === 'admin',
    isViewer: role === 'viewer',
    can: (action) => {
      const permissions = {
        admin:  ['view', 'add', 'edit', 'delete', 'export'],
        viewer: ['view', 'export'],
      }
      return permissions[role]?.includes(action) ?? false
    },
  }
}