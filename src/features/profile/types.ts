export interface CompanyDetails {
  name: string
  tagline: string
  email: string
  phone: string
  website: string
  address: string
  city: string
  state: string
  pincode: string
  country: string
  gstin: string
  pan: string
  logo: string | null
  bankName: string
  accountName: string
  accountNumber: string
  ifsc: string
  branch: string
  upi: string
  invoicePrefix: string
  invoiceFooter: string
  currency: string
  defaultPaymentTerms: string
  smtpPasswordSet?: boolean
  openwaApiKeySet?: boolean
  openwaSessionIdSet?: boolean
}

export const defaultCompany: CompanyDetails = {
  name: "",
  tagline: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  gstin: "",
  pan: "",
  logo: null,
  bankName: "",
  accountName: "",
  accountNumber: "",
  ifsc: "",
  branch: "",
  upi: "",
  invoicePrefix: "INV",
  invoiceFooter: "Thank you for your business!",
  currency: "INR",
  defaultPaymentTerms: "Net 30",
  smtpPasswordSet: false,
  openwaApiKeySet: false,
  openwaSessionIdSet: false,
}
