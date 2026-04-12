import { queryOptions } from "@tanstack/react-query"
import { ItemsService } from "@/client/sdk.gen"
import type { ItemPublic } from "@/client/types.gen"

interface ItemListParams {
  skip?: number
  limit?: number
  search?: string
  category?: string
  stockStatus?: string
}

export const itemsQueryKeys = {
  all: ["items"],
  list: (params?: ItemListParams) => [
    ...itemsQueryKeys.all,
    "list",
    params ?? {},
  ],
  detail: (itemId: string) => [...itemsQueryKeys.all, "detail", itemId],
  categories: () => [...itemsQueryKeys.all, "categories"],
}

export const adaptItemToUi = (item: ItemPublic | null | undefined) => {
  if (!item) return item
  return {
    ...item,
    name: item.name ?? "",
    category: item.category ?? "",
    sku: item.sku ?? "",
    unit: item.unit ?? "",
    price: item.price ?? 0,
    taxRate: item.tax_rate ?? 0,
    stock: item.stock ?? 0,
    lowStockThreshold: item.low_stock_threshold ?? 5,
    stockHistory: item.stock_history ?? [],
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}

export const itemsListQueryOptions = (params?: ItemListParams) =>
  queryOptions({
    queryKey: itemsQueryKeys.list(params),
    queryFn: async () => {
      const res = await ItemsService.readItems({
        skip: params?.skip ?? 0,
        limit: params?.limit ?? 200,
        search: params?.search ?? undefined,
        category: params?.category ?? undefined,
      })
      return {
        ...res,
        data: (res.data ?? []).map(adaptItemToUi),
      }
    },
  })

export const itemDetailQueryOptions = (itemId: string | undefined) =>
  queryOptions({
    queryKey: itemsQueryKeys.detail(itemId ?? ""),
    queryFn: async () => {
      const item = await ItemsService.readItem({ id: itemId! })
      return adaptItemToUi(item)
    },
    enabled: !!itemId,
  })

export const itemCategoriesQueryOptions = () =>
  queryOptions({
    queryKey: itemsQueryKeys.categories(),
    queryFn: async () => {
      const categories = await ItemsService.listCategories({})
      return categories ?? []
    },
  })
