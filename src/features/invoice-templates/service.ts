import { InvoiceTemplatesService } from "@/client/sdk.gen"
import type {
  InvoiceTemplateCreate,
  InvoiceTemplatePublic,
  InvoiceTemplateUpdate,
} from "@/client/types.gen"

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
    const res = await InvoiceTemplatesService.readInvoiceTemplates({
      skip,
      limit,
    })
    return res
  },
  getActive: async (): Promise<InvoiceTemplatePublic> => {
    const res = await InvoiceTemplatesService.readActiveInvoiceTemplate()
    return res
  },
  create: async (
    payload: InvoiceTemplateCreate,
  ): Promise<InvoiceTemplatePublic> => {
    const res = await InvoiceTemplatesService.createInvoiceTemplate({
      requestBody: payload,
    })
    return res
  },
  update: async ({
    id,
    payload,
  }: {
    id: string
    payload: InvoiceTemplateUpdate
  }): Promise<InvoiceTemplatePublic> => {
    const res = await InvoiceTemplatesService.updateInvoiceTemplate({
      id,
      requestBody: payload,
    })
    return res
  },
  activate: async ({ id }: { id: string }): Promise<InvoiceTemplatePublic> => {
    const res = await InvoiceTemplatesService.activateInvoiceTemplate({ id })
    return res
  },
  remove: async ({ id }: { id: string }): Promise<void> => {
    await InvoiceTemplatesService.deleteInvoiceTemplate({ id })
  },
}
