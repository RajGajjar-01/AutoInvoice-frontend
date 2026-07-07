import { queryOptions } from "@tanstack/react-query"
import { invoiceTemplatesApi } from "@/features/invoice-templates/service"

interface TemplateListParams {
  skip?: number
  limit?: number
}

export const invoiceTemplatesQueryKeys = {
  all: ["invoice-templates"],
  list: (params?: TemplateListParams) => [
    ...invoiceTemplatesQueryKeys.all,
    "list",
    params ?? {},
  ],
  active: () => [...invoiceTemplatesQueryKeys.all, "active"],
  detail: (id: string) => [...invoiceTemplatesQueryKeys.all, "detail", id],
}

export const invoiceTemplatesListQueryOptions = (params?: TemplateListParams) =>
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
      try {
        return await invoiceTemplatesApi.getActive()
      } catch (error: unknown) {
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as { response?: { status?: number } }
          if (axiosError.response?.status === 404) {
            return null
          }
        }
        throw error
      }
    },
    retry: false,
  })
