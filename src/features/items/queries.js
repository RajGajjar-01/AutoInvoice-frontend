import { queryOptions } from "@tanstack/react-query"
import { ItemsService } from "@/client/sdk.gen"

export const itemsQueryKeys = {
  all: ["items"],
  list: (params) => [...itemsQueryKeys.all, "list", params ?? {}],
  detail: (itemId) => [...itemsQueryKeys.all, "detail", itemId],
  categories: () => [...itemsQueryKeys.all, "categories"],
}

export const adaptItemToUi = (item) => {
  if (!item) return item
  return {
    ...item,
    name: item.name ?? item.title ?? "",
    category: item.category ?? "",
    sku: item.sku ?? "",
    unit: item.unit ?? "",
    price: item.price ?? 0,
    taxRate: item.tax_rate ?? item.taxRate ?? 0,
    stock: item.stock ?? 0,
    lowStockThreshold: item.low_stock_threshold ?? item.lowStockThreshold ?? 5,
    stockHistory: item.stock_history ?? item.stockHistory ?? [],
    createdAt: item.created_at ?? item.createdAt,
    updatedAt: item.updated_at ?? item.updatedAt,
  }
}

export const itemsListQueryOptions = (params) =>
  queryOptions({
    queryKey: itemsQueryKeys.list(params),
    queryFn: async () => {
      const res = await ItemsService.readItems({
        skip: params?.skip ?? 0,
        limit: params?.limit ?? 200,
        search: params?.search ?? undefined,
        category: params?.category ?? undefined,
        stock_status: params?.stockStatus ?? undefined,
      })
      return {
        ...res,
        data: (res.data ?? []).map(adaptItemToUi),
      }
    },
  })

export const itemDetailQueryOptions = (itemId) =>
  queryOptions({
    queryKey: itemsQueryKeys.detail(itemId),
    queryFn: async () => {
      const item = await ItemsService.readItem({ id: itemId })
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
