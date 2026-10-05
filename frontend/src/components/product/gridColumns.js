const base = 'grid grid-cols-2 gap-px border-y border-line bg-line'

/** Column layouts for product grids: full width, or next to the desktop filter sidebar. */
export const gridColumns = {
  full: `${base} md:grid-cols-3 lg:grid-cols-4`,
  withSidebar: `${base} md:grid-cols-3 xl:grid-cols-4`,
}
