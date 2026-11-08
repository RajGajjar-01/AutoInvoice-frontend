/**
 * WhatsApp helpers. Keep the phone rule in step with
 * to_whatsapp_chat_id in the backend (app/services/whatsapp_service.py).
 */

export const DEFAULT_PHONE_COUNTRY_CODE = "91"

/**
 * The full international number, digits only, or null when the input cannot
 * be a phone number. Numbers saved without a country code (10 digits, or 11
 * with a leading trunk 0) get the default country code.
 */
export function toWhatsAppNumber(
  phone: string | null | undefined,
  countryCode = DEFAULT_PHONE_COUNTRY_CODE,
): string | null {
  let digits = (phone ?? "").replace(/\D/g, "")
  if (digits.startsWith("00")) digits = digits.slice(2)
  else if (digits.length === 11 && digits.startsWith("0"))
    digits = countryCode + digits.slice(1)
  else if (digits.length === 10) digits = countryCode + digits
  return digits.length >= 8 && digits.length <= 15 ? digits : null
}

/** Opens a chat with the number in WhatsApp (app or WhatsApp Web). */
export function whatsAppChatUrl(number: string, text: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}
