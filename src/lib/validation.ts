import { z } from "zod"

/**
 * Standard Indian Banking & Tax Regular Expressions
 * Aligned with NIST / OWASP defensive validation standards and backend Pydantic schemas.
 */
export const GSTIN_REGEX =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
export const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/
export const BANK_ACCOUNT_REGEX = /^[0-9]{9,18}$/
export const UPI_ID_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/

/**
 * Sanitization Helpers
 */
export function sanitizeNumeric(value?: string | null): string {
  if (!value) return ""
  return value.replace(/\D/g, "")
}

export function sanitizeUppercase(value?: string | null): string {
  if (!value) return ""
  return value.trim().toUpperCase()
}

export function sanitizeLowercase(value?: string | null): string {
  if (!value) return ""
  return value.trim().toLowerCase()
}

/**
 * Data Masking Helpers (OWASP Financial Data Exposure Prevention)
 */
export function maskAccountNumber(acc?: string | null): string {
  if (!acc) return "—"
  const clean = sanitizeNumeric(acc)
  if (clean.length < 5) return clean || "—"
  const lastFour = clean.slice(-4)
  const maskedSection = "•".repeat(Math.min(clean.length - 4, 8))
  return `${maskedSection}${lastFour}`
}

export function maskPan(pan?: string | null): string {
  if (!pan) return "—"
  const clean = sanitizeUppercase(pan)
  if (clean.length !== 10) return clean || "—"
  return `••••••${clean.slice(-4)}`
}

/**
 * Validation Checkers (Returning boolean)
 */
export function isValidGstin(gstin?: string | null): boolean {
  if (!gstin) return true
  return GSTIN_REGEX.test(sanitizeUppercase(gstin))
}

export function isValidPan(pan?: string | null): boolean {
  if (!pan) return true
  return PAN_REGEX.test(sanitizeUppercase(pan))
}

export function isValidIfsc(ifsc?: string | null): boolean {
  if (!ifsc) return true
  return IFSC_REGEX.test(sanitizeUppercase(ifsc))
}

export function isValidBankAccount(acc?: string | null): boolean {
  if (!acc) return true
  return BANK_ACCOUNT_REGEX.test(sanitizeNumeric(acc))
}

export function isValidUpiId(upi?: string | null): boolean {
  if (!upi) return true
  return UPI_ID_REGEX.test(sanitizeLowercase(upi))
}

/**
 * Reusable Zod Schemas for Forms
 */
export const gstinZodSchema = z
  .string()
  .trim()
  .transform((v) => v.toUpperCase())
  .refine((v) => !v || GSTIN_REGEX.test(v), {
    message: "Invalid GSTIN format (e.g. 22AAAAA0000A1Z5)",
  })
  .optional()
  .or(z.literal(""))

export const panZodSchema = z
  .string()
  .trim()
  .transform((v) => v.toUpperCase())
  .refine((v) => !v || PAN_REGEX.test(v), {
    message: "Invalid PAN format (e.g. ABCDE1234F)",
  })
  .optional()
  .or(z.literal(""))

export const ifscZodSchema = z
  .string()
  .trim()
  .transform((v) => v.toUpperCase())
  .refine((v) => !v || IFSC_REGEX.test(v), {
    message: "Invalid IFSC format (e.g. HDFC0001234)",
  })
  .optional()
  .or(z.literal(""))

export const bankAccountZodSchema = z
  .string()
  .trim()
  .transform((v) => sanitizeNumeric(v))
  .refine((v) => !v || BANK_ACCOUNT_REGEX.test(v), {
    message: "Account number must be 9 to 18 numeric digits",
  })
  .optional()
  .or(z.literal(""))

export const upiZodSchema = z
  .string()
  .trim()
  .transform((v) => v.toLowerCase())
  .refine((v) => !v || UPI_ID_REGEX.test(v), {
    message: "Invalid UPI ID format (e.g. name@bank)",
  })
  .optional()
  .or(z.literal(""))
