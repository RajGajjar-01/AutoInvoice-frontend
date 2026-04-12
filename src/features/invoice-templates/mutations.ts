import { useMutation, useQueryClient } from "@tanstack/react-query"
import type {
  InvoiceTemplateCreate,
  InvoiceTemplateUpdate,
} from "@/client/types.gen"
import { invoiceTemplatesQueryKeys } from "@/features/invoice-templates/queries"
import { invoiceTemplatesApi } from "@/features/invoice-templates/service"

export function useCreateInvoiceTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: InvoiceTemplateCreate) =>
      invoiceTemplatesApi.create(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: invoiceTemplatesQueryKeys.all })
    },
  })
}

export function useUpdateInvoiceTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: InvoiceTemplateUpdate
    }) => invoiceTemplatesApi.update({ id, payload }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: invoiceTemplatesQueryKeys.all })
    },
  })
}

export function useDeleteInvoiceTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: string }) => invoiceTemplatesApi.remove({ id }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: invoiceTemplatesQueryKeys.all })
    },
  })
}

export function useActivateInvoiceTemplate() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      invoiceTemplatesApi.activate({ id }),
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: invoiceTemplatesQueryKeys.all })

      const prevListEntries = qc.getQueriesData({
        queryKey: invoiceTemplatesQueryKeys.list(),
      })
      const prevActive = qc.getQueryData(invoiceTemplatesQueryKeys.active())

      // Optimistically set active template based on data we have
      for (const [key, data] of prevListEntries) {
        if (!data || typeof data !== "object" || !("data" in data)) continue
        const typedData = data as {
          data: Array<{ id: string; is_active?: boolean }>
        }
        const next = {
          ...data,
          data: typedData.data.map((t) => ({
            ...t,
            is_active: t.id === id,
          })),
        }
        qc.setQueryData(key, next)
      }

      if (prevActive && typeof prevActive === "object" && "id" in prevActive) {
        const typedActive = prevActive as { id: string }
        if (typedActive.id !== id) {
          const fromList = prevListEntries
            .flatMap(([, d]) => {
              if (!d || typeof d !== "object" || !("data" in d)) return []
              const typed = d as { data: Array<{ id: string }> }
              return typed.data ?? []
            })
            .find((t) => t.id === id)
          if (fromList) {
            qc.setQueryData(invoiceTemplatesQueryKeys.active(), {
              ...fromList,
              is_active: true,
            })
          }
        }
      }

      return { prevListEntries, prevActive }
    },
    onError: (
      _err: unknown,
      _vars: { id: string },
      ctx:
        | { prevListEntries?: [unknown, unknown][]; prevActive?: unknown }
        | undefined,
    ) => {
      if (ctx?.prevListEntries) {
        for (const [key, data] of ctx.prevListEntries) {
          qc.setQueryData(key as readonly unknown[], data)
        }
      }
      if (ctx?.prevActive) {
        qc.setQueryData(invoiceTemplatesQueryKeys.active(), ctx.prevActive)
      }
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: invoiceTemplatesQueryKeys.all })
    },
  })
}
