export const styles = {
  // Layout
  container: 'p-6',
  card: 'bg-white rounded-lg shadow p-6',
  
  // Headers and titles
  pageHeader: {
    wrapper: 'flex justify-between items-center mb-6',
    title: 'text-2xl font-bold',
  },

  // Forms
  form: {
    group: 'mb-4',
    label: 'block text-gray-700 text-sm font-bold mb-2',
    input: 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline',
    error: 'text-red-500 text-sm mb-4',
  },

  // Modal
  modal: {
    overlay: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
    container: 'bg-white rounded-lg p-6 w-full max-w-md',
    header: 'flex justify-between items-center mb-4',
    title: 'text-xl font-semibold',
    closeButton: 'text-gray-500 hover:text-gray-700',
  },

  // Table
  table: {
    wrapper: 'border rounded',
    container: 'min-w-full divide-y divide-gray-200',
    header: {
      cell: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer',
      row: 'bg-gray-50',
    },
    body: {
      row: 'bg-white divide-y divide-black',
      cell: 'px-6 py-4 whitespace-nowrap',
    },
    search: {
      wrapper: 'mb-4 flex gap-4',
      select: 'border rounded px-2 py-1',
      input: 'border rounded px-3 py-1',
    },
    pagination: {
      wrapper: 'mt-4 flex items-center justify-between',
      button: 'px-3 py-1 border rounded disabled:opacity-50',
      text: 'text-sm text-gray-700',
    },
  },

  // Actions
  actions: {
    wrapper: 'flex items-center gap-2',
  },

  // Buttons
  button: {
    base: 'inline-flex items-center justify-center rounded font-medium focus:outline-none transition-colors',
    variants: {
      primary: 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300',
      secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100',
      danger: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300',
    },
    sizes: {
      sm: 'px-2 py-1 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    },
    iconOnly: 'p-2',
  },

  // Icons
  icon: {
    base: 'w-5 h-5',
    withText: 'mr-2',
  },
}; 