import { zodResolver } from "@hookform/resolvers/zod"
import type { FieldValues, Resolver } from "react-hook-form"
import type { ZodType } from "zod"

/**
 * Single bridge between zodResolver and useForm. The resolvers package's
 * 3-generic input/output-aware Resolver never structurally matches
 * useForm's expectations (identity + variance), which forced `as any` at
 * every form before. Cast through the boundary once, here.
 */
export function formResolver<T extends FieldValues>(
  schema: ZodType,
): Resolver<T> {
  return zodResolver(schema as never) as unknown as Resolver<T>
}
