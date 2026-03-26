import { queryOptions } from "@tanstack/react-query"
import { CompanySettingsService } from "@/client/sdk.gen"

export const companySettingsQueryKeys = {
  all: ["companySettings"],
  detail: () => [...companySettingsQueryKeys.all, "detail"],
}

export const companySettingsQueryOptions = () =>
  queryOptions({
    queryKey: companySettingsQueryKeys.detail(),
    queryFn: async () => {
      try {
        const settings = await CompanySettingsService.getCompanySettings({})
        return settings
      } catch (error) {
        if (error?.status === 404) {
          return null
        }
        throw error
      }
    },
  })
