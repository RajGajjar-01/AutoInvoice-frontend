import { create } from "zustand"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TableColumn {
  name: string
  type: string
  mandatory?: boolean
  description?: string
  options?: string[]
}

export interface FocusedCell {
  rowId: string
  colName: string
}

export interface CellSelection {
  colName: string
  startRow: number
  endRow: number
}

export interface CellDragRef {
  active: boolean
  colName: string | null
  startRow: number | null
}

export interface ReminderState {
  open: boolean
  rowId: string | null
  rowLabel: string
}

export interface Filters {
  [colName: string]:
    | string
    | string[]
    | { from?: string; to?: string }
    | undefined
}

interface TableUiState {
  // Selection
  selectedRows: Set<string>
  toggleRow: (id: string, checked: boolean) => void
  toggleSelectAll: (checked: boolean, filteredIds: string[]) => void
  clearSelectedRows: () => void
  removeSelectedRow: (id: string) => void

  // Focus
  focusedCell: FocusedCell | null
  setFocusedCell: (cell: FocusedCell | null) => void

  // Formula bar
  formulaBarValue: string
  setFormulaBarValue: (value: string) => void

  // Active column (for stats bar)
  activeColumnName: string | null
  setActiveColumnName: (name: string | null) => void

  // Cell range selection (Excel-like drag)
  cellSelection: CellSelection | null
  setCellSelection: (selection: CellSelection | null) => void
  cellDragRef: CellDragRef
  setCellDragRef: (ref: CellDragRef) => void

  // Filters
  filters: Filters
  pendingFilters: Filters
  filterOpen: boolean
  search: string
  setFilters: (filters: Filters) => void
  setPendingFilters: (filters: Filters) => void
  setFilterOpen: (open: boolean) => void
  setSearch: (search: string) => void
  applyFilters: () => void
  clearFilters: () => void
  toggleOptionFilter: (colName: string, option: string) => void
  setDateFilter: (colName: string, key: string, val: string) => void
  setBoolFilter: (colName: string, val: string) => void
  openFilterPanel: () => void

  // Reminder modal
  reminderState: ReminderState
  setReminderState: (state: ReminderState) => void

  // Reset all state (useful when navigating away)
  reset: () => void
}

const cloneFilters = (filters: Filters): Filters =>
  JSON.parse(JSON.stringify(filters)) as Filters

const createInitialState = () => ({
  selectedRows: new Set<string>(),
  focusedCell: null as FocusedCell | null,
  formulaBarValue: "",
  activeColumnName: null as string | null,
  cellSelection: null as CellSelection | null,
  cellDragRef: { active: false, colName: null, startRow: null } as CellDragRef,
  filters: {} as Filters,
  pendingFilters: {} as Filters,
  filterOpen: false,
  search: "",
  reminderState: { open: false, rowId: null, rowLabel: "" } as ReminderState,
})

export const useTableUiStore = create<TableUiState>()((set) => ({
  ...createInitialState(),

  // ── Selection ─────────────────────────────────────────────────────────────
  toggleRow: (id, checked) =>
    set((state) => {
      const next = new Set(state.selectedRows)
      if (checked) next.add(id)
      else next.delete(id)
      return { selectedRows: next }
    }),

  toggleSelectAll: (checked, filteredIds) =>
    set((state) => {
      if (checked) {
        return {
          selectedRows: new Set([...state.selectedRows, ...filteredIds]),
        }
      }
      const next = new Set(state.selectedRows)
      for (const id of filteredIds) next.delete(id)
      return { selectedRows: next }
    }),

  clearSelectedRows: () => set({ selectedRows: new Set() }),

  removeSelectedRow: (id) =>
    set((state) => {
      const next = new Set(state.selectedRows)
      next.delete(id)
      return { selectedRows: next }
    }),

  // ── Focus ─────────────────────────────────────────────────────────────────
  setFocusedCell: (cell) => set({ focusedCell: cell }),

  // ── Formula bar ───────────────────────────────────────────────────────────
  setFormulaBarValue: (value) => set({ formulaBarValue: value }),

  // ── Active column ─────────────────────────────────────────────────────────
  setActiveColumnName: (name) => set({ activeColumnName: name }),

  // ── Cell range selection ───────────────────────────────────────────────────
  setCellSelection: (selection) => set({ cellSelection: selection }),
  setCellDragRef: (ref) => set({ cellDragRef: ref }),

  // ── Filters ────────────────────────────────────────────────────────────────
  setFilters: (filters) => set({ filters }),
  setPendingFilters: (filters) => set({ pendingFilters: filters }),
  setFilterOpen: (open) => set({ filterOpen: open }),
  setSearch: (search) => set({ search }),

  applyFilters: () =>
    set((state) => ({
      filters: cloneFilters(state.pendingFilters),
      filterOpen: false,
    })),

  clearFilters: () =>
    set({ pendingFilters: {}, filters: {}, filterOpen: false }),

  toggleOptionFilter: (colName, option) =>
    set((state) => {
      const current = Array.isArray(state.pendingFilters[colName])
        ? (state.pendingFilters[colName] as string[])
        : []
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option]
      return { pendingFilters: { ...state.pendingFilters, [colName]: next } }
    }),

  setDateFilter: (colName, key, val) =>
    set((state) => ({
      pendingFilters: {
        ...state.pendingFilters,
        [colName]: {
          ...((state.pendingFilters[colName] as {
            from?: string
            to?: string
          }) ?? {}),
          [key]: val,
        },
      },
    })),

  setBoolFilter: (colName, val) =>
    set((state) => ({
      pendingFilters: { ...state.pendingFilters, [colName]: val },
    })),

  openFilterPanel: () =>
    set((state) => ({
      pendingFilters: cloneFilters(state.filters),
      filterOpen: true,
    })),

  // ── Reminder modal ────────────────────────────────────────────────────────
  setReminderState: (reminderState) => set({ reminderState }),

  // ── Reset ──────────────────────────────────────────────────────────────────
  reset: () => set(createInitialState()),
}))
