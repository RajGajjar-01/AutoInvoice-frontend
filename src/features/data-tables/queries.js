import { TablesService } from "@/client"

export const tablesQueryKeys = {
  all: ["tables"],
  list: (params) => [...tablesQueryKeys.all, "list", params ?? {}],
  detail: (tableId) => [...tablesQueryKeys.all, "detail", tableId],
}

const toUiRow = (row, rowIndex) => ({
  id: row.id,
  _rowIndex: rowIndex,
  ...(row.data ?? {}),
})

export const adaptTableDetailToUi = (table) => ({
  ...table,
  createdAt: table.created_at,
  updatedAt: table.updated_at,
  rows: (table.rows ?? []).map((r, i) => toUiRow(r, i)),
  reminders: (table.reminders ?? []).map((r) => {
    const reminderData = r.reminder_data ?? {}
    return {
      id: r.id,
      table_id: r.table_id,
      created_at: r.created_at,
      rowId: reminderData.row_id ?? reminderData.rowId,
      ...reminderData,
    }
  }),
})

export const adaptTableListItemToUi = (table) => ({
  ...table,
  createdAt: table.created_at,
  updatedAt: table.updated_at,
})

export const tablesListQueryOptions = (params) => ({
  queryKey: tablesQueryKeys.list(params),
  queryFn: async () => {
    const res = await TablesService.listTables({
      skip: params?.skip ?? 0,
      limit: params?.limit ?? 50,
      sortBy: params?.sortBy ?? "created_at",
      sortOrder: params?.sortOrder ?? "desc",
      search: params?.search,
    })
    return {
      ...res,
      data: (res.data ?? []).map(adaptTableListItemToUi),
    }
  },
})

export const tableDetailQueryOptions = (tableId) => ({
  queryKey: tablesQueryKeys.detail(tableId),
  queryFn: async () => {
    const table = await TablesService.getTable({ tableId })
    return adaptTableDetailToUi(table)
  },
  enabled: !!tableId,
})
