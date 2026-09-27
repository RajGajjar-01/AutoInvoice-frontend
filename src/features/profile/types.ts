export interface CompanyDetails {
  name: string
  email: string
  phone: string
  website: string
  address: string
  city: string
  state: string
  pincode: string
  gstin: string
  pan: string
  logo: string | null
  bankName: string
  accountNumber: string
  ifsc: string
  branch: string
  upi: string
  invoicePrefix: string
  quotationPrefix: string
  proformaPrefix: string
  challanPrefix: string
  invoiceFooter: string
}

export const defaultCompany: CompanyDetails = {
  name: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  gstin: "",
  pan: "",
  logo: null,
  bankName: "",
  accountNumber: "",
  ifsc: "",
  branch: "",
  upi: "",
  invoicePrefix: "INV-",
  quotationPrefix: "QUO-",
  proformaPrefix: "PRO-",
  challanPrefix: "CHL-",
  invoiceFooter: "",
}
