import { TablesService } from "@/client/sdk.gen"
import type {
  DataTablePublic,
  DataTableWithRows,
  TableReminderPublic,
  TableRowPublic,
} from "@/client/types.gen"

interface TableListParams {
  skip?: number
  limit?: number
  sortBy?: string
  sortOrder?: string
  search?: string
}

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

export const tablesQueryKeys = {
  all: ["tables"],
  list: (params?: TableListParams) => [
    ...tablesQueryKeys.all,
    "list",
    params ?? {},
  ],
  detail: (tableId: string) => [...tablesQueryKeys.all, "detail", tableId],
}

export const tablesListQueryOptions = (params?: TableListParams) => ({
  queryKey: tablesQueryKeys.list(params),
  queryFn: async () => {
    const res = await TablesService.listTables({
      skip: params?.skip ?? 0,
      limit: params?.limit ?? 50,
      sortBy: params?.sortBy ?? "created_at",
      sortOrder: params?.sortOrder ?? "desc",
      search: params?.search,
    })
    const data = (res.data ?? []) as DataTablePublic[]
    return {
      ...res,
      data: data.map(adaptTableListItemToUi),
    }
  },
})

export const tableDetailQueryOptions = (tableId: string | undefined) => ({
  queryKey: tablesQueryKeys.detail(tableId ?? ""),
  queryFn: async () => {
    const table = await TablesService.getTable({ tableId: tableId! })
    return adaptTableDetailToUi(table)
  },
  enabled: !!tableId,
})
