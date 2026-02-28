// Shared in-memory store for table data.
// Both the list page and the table view page import from here so they
// always see the same data without needing a context provider or backend.

const generateRows = (count = 3) =>
  Array.from({ length: count }, (_, i) => ({
    id: crypto.randomUUID(),
    _rowIndex: i,
  }))

// ─── Predefined Templates ────────────────────────────────────────────────────
export const PREDEFINED_TEMPLATES = [
  {
    id: "t1",
    name: "Invoice Tracker",
    description: "Track invoices, amounts, and payment status",
    icon: "FileText",
    columns: [
      {
        name: "Invoice No",
        type: "Text",
        mandatory: true,
        description: "",
        options: [],
      },
      {
        name: "Client Name",
        type: "Text",
        mandatory: true,
        description: "",
        options: [],
      },
      {
        name: "Amount",
        type: "Amount (₹)",
        mandatory: true,
        description: "",
        options: [],
      },
      {
        name: "Issue Date",
        type: "Date",
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
        name: "Payment Status",
        type: "Payment Status",
        mandatory: false,
        description: "",
        options: [],
      },
      {
        name: "Notes",
        type: "Text",
        mandatory: false,
        description: "",
        options: [],
      },
    ],
  },
  {
    id: "t2",
    name: "Client Directory",
    description: "Manage client contacts and details",
    icon: "Users",
    columns: [
      {
        name: "Client Name",
        type: "Text",
        mandatory: true,
        description: "",
        options: [],
      },
      {
        name: "Email",
        type: "Text",
        mandatory: false,
        description: "",
        options: [],
      },
      {
        name: "Phone",
        type: "Text",
        mandatory: false,
        description: "",
        options: [],
      },
      {
        name: "Company",
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
      {
        name: "Tag",
        type: "Tag",
        mandatory: false,
        description: "",
        options: [],
      },
    ],
  },
  {
    id: "t3",
    name: "Expense Tracker",
    description: "Log and categorize business expenses",
    icon: "Receipt",
    columns: [
      {
        name: "Date",
        type: "Date",
        mandatory: true,
        description: "",
        options: [],
      },
      {
        name: "Description",
        type: "Text",
        mandatory: true,
        description: "",
        options: [],
      },
      {
        name: "Amount",
        type: "Amount (₹)",
        mandatory: true,
        description: "",
        options: [],
      },
      {
        name: "Category",
        type: "Dropdown",
        mandatory: false,
        description: "",
        options: ["Travel", "Food", "Office", "Marketing", "Other"],
      },
      {
        name: "Paid By",
        type: "Text",
        mandatory: false,
        description: "",
        options: [],
      },
      {
        name: "Receipt",
        type: "Attachment",
        mandatory: false,
        description: "",
        options: [],
      },
    ],
  },
  {
    id: "t4",
    name: "Contract Tracker",
    description: "Track contracts and their expiry dates",
    icon: "ScrollText",
    columns: [
      {
        name: "Contract Name",
        type: "Text",
        mandatory: true,
        description: "",
        options: [],
      },
      {
        name: "Client",
        type: "Text",
        mandatory: false,
        description: "",
        options: [],
      },
      {
        name: "Start Date",
        type: "Date",
        mandatory: false,
        description: "",
        options: [],
      },
      {
        name: "Expiry Date",
        type: "Expiry Date",
        mandatory: false,
        description: "",
        options: [],
      },
      {
        name: "Value",
        type: "Amount (₹)",
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
    ],
  },
]

// ─── Store ────────────────────────────────────────────────────────────────────
export const tablesStore = {
  tables: [
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
  ],

  getAll() {
    return this.tables
  },

  getById(id) {
    return this.tables.find((t) => t.id === id) ?? null
  },

  add(table) {
    const newTable = {
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
    if (!original) return
    const copy = {
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
      const newRow = { ...data, id: data.id || crypto.randomUUID() }
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

  // ── New methods ────────────────────────────────────────────────────────────

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
    const newReminder = {
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
