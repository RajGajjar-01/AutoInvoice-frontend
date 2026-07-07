import { queryOptions } from "@tanstack/react-query"
import { CustomersService } from "@/client/sdk.gen"
import type { CustomerPublic } from "@/client/types.gen"

interface CustomerListParams {
  skip?: number
  limit?: number
}

export const customersQueryKeys = {
  all: ["customers"],
  list: (params?: CustomerListParams) => [
    ...customersQueryKeys.all,
    "list",
    params ?? {},
  ],
  detail: (customerId: string) => [
    ...customersQueryKeys.all,
    "detail",
    customerId,
  ],
}

export const adaptCustomerToUi = (c: CustomerPublic | null | undefined) => {
  if (!c) return c
  return {
    ...c,
    partyType: c.party_type ?? "customer",
    gstin: c.gstin ?? c.gst ?? "",
    billingAddress: c.billing_address ?? c.address ?? "",
    shippingAddress: c.shipping_address ?? "",
    openingBalance: c.opening_balance ?? 0,
    creditLimit: c.credit_limit ?? null,
    paymentTerms: c.payment_terms ?? "",
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  }
}

export const customersListQueryOptions = (params?: CustomerListParams) =>
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

export const customerDetailQueryOptions = (customerId: string | undefined) =>
  queryOptions({
    queryKey: customersQueryKeys.detail(customerId ?? ""),
    queryFn: async () => {
      const c = await CustomersService.readCustomer({ id: customerId! })
      return adaptCustomerToUi(c)
    },
    enabled: !!customerId,
  })
