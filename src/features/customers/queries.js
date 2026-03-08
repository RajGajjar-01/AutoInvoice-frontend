import { queryOptions } from "@tanstack/react-query"
import { CustomersService } from "@/client/sdk.gen"

export const customersQueryKeys = {
  all: ["customers"],
  list: (params) => [...customersQueryKeys.all, "list", params ?? {}],
  detail: (customerId) => [...customersQueryKeys.all, "detail", customerId],
}

export const adaptCustomerToUi = (c) => {
  if (!c) return c
  return {
    ...c,
    // UI expects these fields (historically stored in localStorage)
    partyType: c.partyType ?? c.party_type ?? "customer",
    gstin: c.gstin ?? c.gst ?? "",
    billingAddress: c.billingAddress ?? c.billing_address ?? c.address ?? "",
    shippingAddress: c.shippingAddress ?? c.shipping_address ?? "",
    openingBalance: c.openingBalance ?? c.opening_balance ?? 0,
    creditLimit: c.creditLimit ?? c.credit_limit ?? null,
    paymentTerms: c.paymentTerms ?? c.payment_terms ?? "",
    createdAt: c.createdAt ?? c.created_at,
    updatedAt: c.updatedAt ?? c.updated_at,
  }
}

export const customersListQueryOptions = (params) =>
  queryOptions({
    queryKey: customersQueryKeys.list(params),
    queryFn: async () => {
      const res = await CustomersService.readCustomers({
        skip: params?.skip ?? 0,
        limit: params?.limit ?? 200,
      })

      return {
        ...res,
        data: (res.data ?? []).map(adaptCustomerToUi),
      }
    },
  })

export const customerDetailQueryOptions = (customerId) =>
  queryOptions({
    queryKey: customersQueryKeys.detail(customerId),
    queryFn: async () => {
      const c = await CustomersService.readCustomer({ id: customerId })
      return adaptCustomerToUi(c)
    },
    enabled: !!customerId,
  })
