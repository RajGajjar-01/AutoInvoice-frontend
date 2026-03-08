import { queryOptions } from "@tanstack/react-query"
import { invoiceTemplatesApi } from "@/features/invoice-templates/service"

export const invoiceTemplatesQueryKeys = {
  all: ["invoice-templates"],
  list: (params) => [...invoiceTemplatesQueryKeys.all, "list", params ?? {}],
  active: () => [...invoiceTemplatesQueryKeys.all, "active"],
  detail: (id) => [...invoiceTemplatesQueryKeys.all, "detail", id],
}

export const invoiceTemplatesListQueryOptions = (params) =>
  queryOptions({
    queryKey: invoiceTemplatesQueryKeys.list(params),
    queryFn: async () => {
      return invoiceTemplatesApi.list({
        skip: params?.skip ?? 0,
        limit: params?.limit ?? 200,
      })
    },
  })

export const invoiceTemplateActiveQueryOptions = () =>
  queryOptions({
    queryKey: invoiceTemplatesQueryKeys.active(),
    queryFn: async () => {
      return invoiceTemplatesApi.getActive()
    },
    retry: false,
  })
