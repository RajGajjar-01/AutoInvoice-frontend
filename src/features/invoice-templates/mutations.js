import { useMutation, useQueryClient } from "@tanstack/react-query"
import { invoiceTemplatesQueryKeys } from "@/features/invoice-templates/queries"
import { invoiceTemplatesApi } from "@/features/invoice-templates/service"

export function useCreateInvoiceTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => invoiceTemplatesApi.create(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: invoiceTemplatesQueryKeys.all })
    },
  })
}

export function useUpdateInvoiceTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }) =>
      invoiceTemplatesApi.update({ id, payload }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: invoiceTemplatesQueryKeys.all })
    },
  })
}

export function useDeleteInvoiceTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id }) => invoiceTemplatesApi.remove({ id }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: invoiceTemplatesQueryKeys.all })
    },
  })
}

export function useActivateInvoiceTemplate() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id }) => invoiceTemplatesApi.activate({ id }),
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: invoiceTemplatesQueryKeys.all })

      const prevListEntries = qc.getQueriesData({
        queryKey: invoiceTemplatesQueryKeys.list(),
      })
      const prevActive = qc.getQueryData(invoiceTemplatesQueryKeys.active())

      // Optimistically set active template based on data we have
      for (const [key, data] of prevListEntries) {
        if (!data?.data) continue
        const next = {
          ...data,
          data: data.data.map((t) => ({
            ...t,
            is_active: t.id === id,
            isActive: t.id === id,
          })),
        }
        qc.setQueryData(key, next)
      }

      if (prevActive && prevActive.id !== id) {
        const fromList = prevListEntries
          .flatMap(([, d]) => d?.data ?? [])
          .find((t) => t.id === id)
        if (fromList) {
          qc.setQueryData(invoiceTemplatesQueryKeys.active(), {
            ...fromList,
            is_active: true,
            isActive: true,
          })
        }
      }

      return { prevListEntries, prevActive }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevListEntries) {
        for (const [key, data] of ctx.prevListEntries) {
          qc.setQueryData(key, data)
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
