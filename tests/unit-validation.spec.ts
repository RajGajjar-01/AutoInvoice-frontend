import { expect, test } from "@playwright/test"
import {
  communicationSchema,
  companyProfileSchema,
} from "../src/features/profile/schema"
import { defaultCompany } from "../src/features/profile/types"
import {
  bankAccountZodSchema,
  gstinZodSchema,
  ifscZodSchema,
  isValidBankAccount,
  isValidGstin,
  isValidIfsc,
  isValidPan,
  isValidUpiId,
  maskAccountNumber,
  maskPan,
  panZodSchema,
  sanitizeLowercase,
  sanitizeNumeric,
  sanitizeUppercase,
  upiZodSchema,
} from "../src/lib/validation"
import { getSafeErrorMessage } from "../src/utils"

test.describe("Security & Validation Utilities", () => {
  test.describe("Sanitization Helpers", () => {
    test("sanitizeNumeric strips all non-digit characters", () => {
      expect(sanitizeNumeric("5010-0123-4567-89")).toBe("50100123456789")
      expect(sanitizeNumeric(" 123 456 789 ")).toBe("123456789")
      expect(sanitizeNumeric("abc123def456")).toBe("123456")
      expect(sanitizeNumeric("")).toBe("")
      expect(sanitizeNumeric(null)).toBe("")
    })

    test("sanitizeUppercase trims and converts to uppercase", () => {
      expect(sanitizeUppercase(" hdfc0001234 ")).toBe("HDFC0001234")
      expect(sanitizeUppercase("22aaaaa0000a1z5")).toBe("22AAAAA0000A1Z5")
      expect(sanitizeUppercase("abcde1234f")).toBe("ABCDE1234F")
      expect(sanitizeUppercase("")).toBe("")
      expect(sanitizeUppercase(null)).toBe("")
    })

    test("sanitizeLowercase trims and converts to lowercase", () => {
      expect(sanitizeLowercase(" User@OKHDFCBank ")).toBe("user@okhdfcbank")
      expect(sanitizeLowercase("")).toBe("")
      expect(sanitizeLowercase(null)).toBe("")
    })
  })

  test.describe("OWASP Financial Data Masking", () => {
    test("maskAccountNumber masks all digits except the last 4", () => {
      expect(maskAccountNumber("50100123456789")).toBe("••••••••6789")
      expect(maskAccountNumber("123456789")).toBe("•••••6789")
      expect(maskAccountNumber("1234")).toBe("1234")
      expect(maskAccountNumber("")).toBe("-")
      expect(maskAccountNumber(null)).toBe("-")
    })

    test("maskPan masks the first 6 characters of a 10-digit PAN", () => {
      expect(maskPan("ABCDE1234F")).toBe("••••••234F")
      expect(maskPan("abcde1234f")).toBe("••••••234F")
      expect(maskPan("123")).toBe("123")
      expect(maskPan("")).toBe("-")
      expect(maskPan(null)).toBe("-")
    })
  })

  test.describe("GSTIN Validation (15 alphanumeric characters)", () => {
    test("accepts valid GSTINs", () => {
      expect(isValidGstin("22AAAAA0000A1Z5")).toBe(true)
      expect(isValidGstin("29AAACR5055K1ZK")).toBe(true)
      expect(isValidGstin("27ABCDE1234F1Z5")).toBe(true)
      expect(isValidGstin("")).toBe(true) // Optional
      expect(isValidGstin(null)).toBe(true)
    })

    test("rejects invalid GSTINs", () => {
      expect(isValidGstin("22AAAAA0000A1Z")).toBe(false) // 14 chars
      expect(isValidGstin("22AAAAA0000A1Z55")).toBe(false) // 16 chars
      expect(isValidGstin("INVALID_GSTIN_12")).toBe(false)
      expect(isValidGstin("221234567890123")).toBe(false)
    })
  })

  test.describe("PAN Validation (10 alphanumeric characters)", () => {
    test("accepts valid PAN numbers", () => {
      expect(isValidPan("ABCDE1234F")).toBe(true)
      expect(isValidPan("BNZPK9876Q")).toBe(true)
      expect(isValidPan("")).toBe(true)
      expect(isValidPan(null)).toBe(true)
    })

    test("rejects invalid PAN numbers", () => {
      expect(isValidPan("ABCDE1234")).toBe(false) // 9 chars
      expect(isValidPan("ABCDE12345")).toBe(false) // 5th char digit instead of alpha
      expect(isValidPan("12345ABCDE")).toBe(false)
    })
  })

  test.describe("Bank IFSC Code Validation (11 characters, 5th char '0')", () => {
    test("accepts valid IFSC codes", () => {
      expect(isValidIfsc("HDFC0001234")).toBe(true)
      expect(isValidIfsc("SBIN0000001")).toBe(true)
      expect(isValidIfsc("ICIC0000002")).toBe(true)
      expect(isValidIfsc("")).toBe(true)
      expect(isValidIfsc(null)).toBe(true)
    })

    test("rejects invalid IFSC codes", () => {
      expect(isValidIfsc("HDFC1001234")).toBe(false) // 5th character is '1', must be '0'
      expect(isValidIfsc("HDFC000123")).toBe(false) // 10 chars
      expect(isValidIfsc("HDFC00001234")).toBe(false) // 12 chars
      expect(isValidIfsc("12340001234")).toBe(false) // First 4 digits
    })
  })

  test.describe("Bank Account Number Validation (9 to 18 digits numeric)", () => {
    test("accepts valid 9 to 18 digit account numbers", () => {
      expect(isValidBankAccount("50100123456789")).toBe(true) // 14 digits
      expect(isValidBankAccount("123456789")).toBe(true) // 9 digits
      expect(isValidBankAccount("123456789012345678")).toBe(true) // 18 digits
      expect(isValidBankAccount("")).toBe(true)
      expect(isValidBankAccount(null)).toBe(true)
    })

    test("rejects invalid bank account numbers", () => {
      expect(isValidBankAccount("12345678")).toBe(false) // 8 digits (too short)
      expect(isValidBankAccount("1234567890123456789")).toBe(false) // 19 digits (too long)
      expect(isValidBankAccount("Raj Gajjar")).toBe(false) // Name instead of digits
    })
  })

  test.describe("UPI ID Validation", () => {
    test("accepts valid UPI IDs", () => {
      expect(isValidUpiId("user@okhdfcbank")).toBe(true)
      expect(isValidUpiId("merchant.pay@upi")).toBe(true)
      expect(isValidUpiId("name-123@icici")).toBe(true)
      expect(isValidUpiId("")).toBe(true)
      expect(isValidUpiId(null)).toBe(true)
    })

    test("rejects invalid UPI IDs", () => {
      expect(isValidUpiId("user-without-handle")).toBe(false)
      expect(isValidUpiId("@okhdfcbank")).toBe(false)
      expect(isValidUpiId("user@")).toBe(false)
    })
  })

  test.describe("Zod Schema Transformations", () => {
    test("bankAccountZodSchema strips spaces and validates digits", () => {
      const result = bankAccountZodSchema.safeParse(" 5010 0123 4567 89 ")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe("50100123456789")
      }

      const invalidResult = bankAccountZodSchema.safeParse("12345")
      expect(invalidResult.success).toBe(false)
    })

    test("ifscZodSchema auto-uppercases valid code", () => {
      const result = ifscZodSchema.safeParse(" hdfc0001234 ")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe("HDFC0001234")
      }
    })

    test("gstinZodSchema auto-uppercases valid GSTIN", () => {
      const result = gstinZodSchema.safeParse(" 22aaaaa0000a1z5 ")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe("22AAAAA0000A1Z5")
      }
    })

    test("panZodSchema auto-uppercases valid PAN", () => {
      const result = panZodSchema.safeParse(" abcde1234f ")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe("ABCDE1234F")
      }
    })

    test("upiZodSchema auto-lowercases valid UPI ID", () => {
      const result = upiZodSchema.safeParse(" User@OKHDFCBank ")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe("user@okhdfcbank")
      }
    })
  })
})

test.describe("Profile form validation", () => {
  test("rejects an incomplete business name and malformed payment details", () => {
    const result = companyProfileSchema.safeParse({
      ...defaultCompany,
      name: "  ",
      accountNumber: "12345",
      ifsc: "INVALID",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.issues.map((issue) => issue.path[0])
      expect(fields).toEqual(
        expect.arrayContaining(["name", "accountNumber", "ifsc"]),
      )
    }
  })

  test("accepts lower-case tax identifiers and optional empty contact fields", () => {
    const result = companyProfileSchema.safeParse({
      ...defaultCompany,
      name: "  Acme Traders  ",
      gstin: "22aaaaa0000a1z5",
      pan: "abcde1234f",
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.name).toBe("Acme Traders")
  })

  test("rejects an invalid sender address and SMTP port", () => {
    const result = communicationSchema.safeParse({
      whatsappEnabled: false,
      openwaBaseUrl: "",
      openwaApiKey: "",
      openwaSessionId: "",
      smtpHost: "smtp.example.com",
      smtpPort: 70000,
      smtpUser: "",
      smtpPassword: "",
      smtpFromEmail: "not-an-email",
      smtpFromName: "",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path[0])).toEqual(
        expect.arrayContaining(["smtpPort", "smtpFromEmail"]),
      )
    }
  })
})

test.describe("Safe API error messages", () => {
  test("never displays server details or exception text", () => {
    const message = getSafeErrorMessage({
      status: 500,
      body: { detail: "DATABASE_PASSWORD=secret" },
      message: "Traceback: private path",
    })
    expect(message).toContain("service")
    expect(message).not.toContain("DATABASE_PASSWORD")
    expect(message).not.toContain("Traceback")
    expect(getSafeErrorMessage(new Error("private SQL error"))).not.toContain(
      "SQL",
    )
  })

  test("gives a useful action for validation and connection failures", () => {
    expect(getSafeErrorMessage({ status: 422 })).toContain("Check the form")
    expect(getSafeErrorMessage(new Error("network"))).toContain("connection")
  })
})
