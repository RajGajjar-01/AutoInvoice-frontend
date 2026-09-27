import { z } from "zod"
import {
  BANK_ACCOUNT_REGEX,
  GSTIN_REGEX,
  IFSC_REGEX,
  PAN_REGEX,
} from "@/lib/validation"

const optionalText = (max: number) =>
  z.string().trim().max(max, `Use ${max} characters or fewer`)
const optionalFormat = (
  pattern: RegExp,
  message: string,
  max: number,
  normalize = (value: string) => value,
) =>
  optionalText(max).refine(
    (value) => !value || pattern.test(normalize(value)),
    message,
  )

export const companyProfileSchema = z.object({
  name: z.string().trim().min(1, "Business name is required").max(255),
  email: optionalText(255).refine(
    (value) => !value || z.email().safeParse(value).success,
    "Enter a valid email address",
  ),
  phone: optionalText(50).refine(
    (value) =>
      !value ||
      (/^[+\d\s()-]+$/.test(value) && value.replace(/\D/g, "").length >= 7),
    "Enter a valid phone number",
  ),
  website: optionalText(255).refine(
    (value) =>
      !value ||
      (/^https?:\/\//i.test(value) && z.url().safeParse(value).success),
    "Enter a website URL beginning with https://",
  ),
  address: optionalText(500),
  city: optionalText(100),
  state: optionalText(100),
  pincode: optionalFormat(/^\d{6}$/, "Enter a 6-digit PIN code", 20),
  gstin: optionalFormat(
    GSTIN_REGEX,
    "Enter a valid 15-character GSTIN",
    50,
    (value) => value.toUpperCase(),
  ),
  pan: optionalFormat(
    PAN_REGEX,
    "Enter a valid 10-character PAN",
    10,
    (value) => value.toUpperCase(),
  ),
  logo: z.string().max(3_000_000, "Logo is too large").nullable(),
  bankName: optionalText(100),
  accountNumber: optionalFormat(
    BANK_ACCOUNT_REGEX,
    "Account number must be 9 to 18 digits",
    18,
  ),
  ifsc: optionalFormat(
    IFSC_REGEX,
    "Enter a valid 11-character IFSC code",
    11,
    (value) => value.toUpperCase(),
  ),
  branch: optionalText(100),
  upi: optionalFormat(
    /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/,
    "Enter a valid UPI ID, such as name@bank",
    500,
  ),
  invoicePrefix: z.string().trim().min(1, "Invoice prefix is required").max(20),
  quotationPrefix: z
    .string()
    .trim()
    .min(1, "Quotation prefix is required")
    .max(20),
  proformaPrefix: z
    .string()
    .trim()
    .min(1, "Proforma prefix is required")
    .max(20),
  challanPrefix: z.string().trim().min(1, "Challan prefix is required").max(20),
  invoiceFooter: optionalText(2000),
})

export const communicationSchema = z.object({
  whatsappEnabled: z.boolean(),
  openwaBaseUrl: optionalText(500).refine(
    (value) => !value || z.url().safeParse(value).success,
    "Enter a valid OpenWA URL",
  ),
  openwaApiKey: optionalText(500),
  openwaSessionId: optionalText(255),
  smtpHost: optionalText(255),
  smtpPort: z.coerce
    .number<number>()
    .int("Enter a whole number")
    .min(1, "Port must be at least 1")
    .max(65535, "Port must be 65535 or less"),
  smtpUser: optionalText(255),
  smtpPassword: optionalText(500),
  smtpFromEmail: optionalText(255).refine(
    (value) => !value || z.email().safeParse(value).success,
    "Enter a valid sender email",
  ),
  smtpFromName: optionalText(255),
})

export type CommunicationValues = z.infer<typeof communicationSchema>
