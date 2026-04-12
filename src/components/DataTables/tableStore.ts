// Shared in-memory store for table data.
// Both the list page and the table view page import from here so they
// always see the same data without needing a context provider or backend.

export interface TableColumn {
  name: string
  type: string
  mandatory: boolean
  description?: string
  options?: string[]
}

export interface TableRow {
  id: string
  _rowIndex?: number
  [key: string]: unknown
}

export interface TableReminder {
  id: string
  title?: string
  date?: string
  description?: string
  rowLabel?: string
}

export interface Table {
  id: string
  name: string
  columns: TableColumn[]
  rows: TableRow[]
  reminders: TableReminder[]
  createdAt: string
  description?: string
}

interface TableInput {
  name: string
  columns: TableColumn[]
  description?: string
}

const generateRows = (count = 3): TableRow[] =>
  Array.from({ length: count }, (_, i) => ({
    id: crypto.randomUUID(),
    _rowIndex: i,
  }))

function loadInitialTables(): Table[] {
  return [
    {
      id: "1",
      name: "Invoice Tracker",
      columns: [
        {
          name: "Invoice No",
          type: "Text",
          mandatory: true,
          description: "",
          options: [],
        },
        {
          name: "Amount",
          type: "Amount (₹)",
          mandatory: false,
          description: "",
          options: [],
        },
        {
          name: "Due Date",
          type: "Due Date",
          mandatory: false,
          description: "",
          options: [],
        },
        {
          name: "Status",
          type: "Status",
          mandatory: false,
          description: "",
          options: [],
        },
        {
          name: "Payment Status",
          type: "Payment Status",
          mandatory: false,
          description: "",
          options: [],
        },
      ],
      rows: generateRows(3),
      reminders: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Client Directory",
      columns: [
        {
          name: "Client Name",
          type: "Text",
          mandatory: true,
          description: "",
          options: [],
        },
        {
          name: "Contact",
          type: "Text",
          mandatory: false,
          description: "",
          options: [],
        },
        {
          name: "Active",
          type: "Checkbox",
          mandatory: false,
          description: "",
          options: [],
        },
      ],
      rows: generateRows(2),
      reminders: [],
      createdAt: new Date().toISOString(),
    },
  ]
}

interface TablesStore {
  tables: Table[]
  getAll: () => Table[]
  getById: (id: string) => Table | null
  add: (table: TableInput) => Table
  update: (id: string, patch: Partial<Table>) => void
  remove: (id: string) => void
  duplicate: (id: string) => Table | undefined
  addRow: (tableId: string) => void
  addRowWithData: (tableId: string, data: TableRow) => void
  updateCell: (
    tableId: string,
    rowId: string,
    colName: string,
    value: unknown,
  ) => void
  deleteRow: (tableId: string, rowId: string) => void
  bulkDeleteRows: (tableId: string, rowIds: string[]) => void
  reorderColumns: (tableId: string, fromIndex: number, toIndex: number) => void
  addReminder: (
    tableId: string,
    reminder: Omit<TableReminder, "id">,
  ) => TableReminder
  deleteReminder: (tableId: string, reminderId: string) => void
}

export const tablesStore: TablesStore = {
  tables: loadInitialTables(),

  getAll() {
    return this.tables
  },

  getById(id) {
    return this.tables.find((t) => t.id === id) ?? null
  },

  add(table) {
    const newTable: Table = {
      ...table,
      id: crypto.randomUUID(),
      rows: [],
      reminders: [],
      createdAt: new Date().toISOString(),
    }
    this.tables = [...this.tables, newTable]
    return newTable
  },

  update(id, patch) {
    this.tables = this.tables.map((t) => (t.id === id ? { ...t, ...patch } : t))
  },

  remove(id) {
    this.tables = this.tables.filter((t) => t.id !== id)
  },

  duplicate(id) {
    const original = this.getById(id)
    if (!original) return undefined
    const copy: Table = {
      ...original,
      id: crypto.randomUUID(),
      name: `${original.name} (Copy)`,
      rows: original.rows.map((r) => ({ ...r, id: crypto.randomUUID() })),
      reminders: [],
      createdAt: new Date().toISOString(),
    }
    this.tables = [...this.tables, copy]
    return copy
  },

  addRow(tableId) {
    this.tables = this.tables.map((t) => {
      if (t.id !== tableId) return t
      return { ...t, rows: [...t.rows, { id: crypto.randomUUID() }] }
    })
  },

  addRowWithData(tableId, data) {
    this.tables = this.tables.map((t) => {
      if (t.id !== tableId) return t
      const newRow: TableRow = { ...data, id: data.id || crypto.randomUUID() }
      return { ...t, rows: [...t.rows, newRow] }
    })
  },

  updateCell(tableId, rowId, colName, value) {
    this.tables = this.tables.map((t) => {
      if (t.id !== tableId) return t
      return {
        ...t,
        rows: t.rows.map((r) =>
          r.id === rowId ? { ...r, [colName]: value } : r,
        ),
      }
    })
  },

  deleteRow(tableId, rowId) {
    this.tables = this.tables.map((t) => {
      if (t.id !== tableId) return t
      return { ...t, rows: t.rows.filter((r) => r.id !== rowId) }
    })
  },

  bulkDeleteRows(tableId, rowIds) {
    const idSet = new Set(rowIds)
    this.tables = this.tables.map((t) => {
      if (t.id !== tableId) return t
      return { ...t, rows: t.rows.filter((r) => !idSet.has(r.id)) }
    })
  },

  reorderColumns(tableId, fromIndex, toIndex) {
    this.tables = this.tables.map((t) => {
      if (t.id !== tableId) return t
      const cols = [...t.columns]
      const [moved] = cols.splice(fromIndex, 1)
      cols.splice(toIndex, 0, moved)
      return { ...t, columns: cols }
    })
  },

  addReminder(tableId, reminder) {
    const newReminder: TableReminder = {
      ...reminder,
      id: crypto.randomUUID(),
    }
    this.tables = this.tables.map((t) => {
      if (t.id !== tableId) return t
      return { ...t, reminders: [...(t.reminders ?? []), newReminder] }
    })
    return newReminder
  },

  deleteReminder(tableId, reminderId) {
    this.tables = this.tables.map((t) => {
      if (t.id !== tableId) return t
      return {
        ...t,
        reminders: (t.reminders ?? []).filter((r) => r.id !== reminderId),
      }
    })
  },
}
