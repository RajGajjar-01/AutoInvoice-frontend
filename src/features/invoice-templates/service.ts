import { OpenAPI } from "@/client"
import type {
  InvoiceTemplateCreate,
  InvoiceTemplatePublic,
  InvoiceTemplateUpdate,
} from "@/client/types.gen"
import { api } from "@/lib/api"

const apiBase = () => `${OpenAPI.BASE}/api/v1`

interface ListParams {
  skip?: number
  limit?: number
}

interface InvoiceTemplatesListResponse {
  data: InvoiceTemplatePublic[]
  count: number
}

export const invoiceTemplatesApi = {
  list: async ({
    skip = 0,
    limit = 200,
  }: ListParams = {}): Promise<InvoiceTemplatesListResponse> => {
    const res = await api.get(`${apiBase()}/invoice-templates/`, {
      params: { skip, limit },
    })
    return res.data
  },
  getActive: async (): Promise<InvoiceTemplatePublic> => {
    const res = await api.get(`${apiBase()}/invoice-templates/active`)
    return res.data
  },
  create: async (
    payload: InvoiceTemplateCreate,
  ): Promise<InvoiceTemplatePublic> => {
    const res = await api.post(`${apiBase()}/invoice-templates/`, payload)
    return res.data
  },
  update: async ({
    id,
    payload,
  }: {
    id: string
    payload: InvoiceTemplateUpdate
  }): Promise<InvoiceTemplatePublic> => {
    const res = await api.put(`${apiBase()}/invoice-templates/${id}`, payload)
    return res.data
  },
  activate: async ({ id }: { id: string }): Promise<InvoiceTemplatePublic> => {
    const res = await api.post(
      `${apiBase()}/invoice-templates/${id}/activate`,
      {},
    )
    return res.data
  },
  remove: async ({ id }: { id: string }): Promise<void> => {
    await api.delete(`${apiBase()}/invoice-templates/${id}`)
  },
}
