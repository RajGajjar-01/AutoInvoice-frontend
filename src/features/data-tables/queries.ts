import type {
  DataTablePublic,
  DataTableWithRows,
  TableReminderPublic,
  TableRowPublic,
} from "@/client/types.gen"

interface AdaptedRow {
  id: string
  _rowIndex: number
  [key: string]: unknown
}

const toUiRow = (row: TableRowPublic, rowIndex: number): AdaptedRow => ({
  id: row.id,
  _rowIndex: rowIndex,
  ...(row.data ?? {}),
})

interface AdaptedReminder {
  id: string
  table_id: string
  created_at?: string
  rowId?: string
  [key: string]: unknown
}

const adaptReminder = (r: TableReminderPublic): AdaptedReminder => {
  const reminderData = r.reminder_data ?? {}
  const rowId =
    typeof reminderData.row_id === "string"
      ? reminderData.row_id
      : typeof reminderData.rowId === "string"
        ? reminderData.rowId
        : undefined
  return {
    id: r.id,
    table_id: r.table_id,
    created_at: r.created_at,
    rowId,
    ...reminderData,
  }
}

export const adaptTableDetailToUi = (table: DataTableWithRows) => ({
  ...table,
  createdAt: table.created_at,
  updatedAt: table.updated_at,
  rows: (table.rows ?? []).map((r, i) => toUiRow(r, i)),
  reminders: (table.reminders ?? []).map(adaptReminder),
})

export const adaptTableListItemToUi = (table: DataTablePublic) => ({
  ...table,
  createdAt: table.created_at,
  updatedAt: table.updated_at,
})
