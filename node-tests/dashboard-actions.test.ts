import assert from "node:assert/strict"
import { test } from "node:test"
import type { ActionInvoice } from "../src/features/dashboard/actions.ts"
import { getDashboardActions } from "../src/features/dashboard/actions.ts"

const invoice = (
  id: string,
  dueDate: string | null,
  status = "unpaid",
  document_type = "invoice",
): ActionInvoice => ({
  id,
  invoiceNumber: id,
  dueDate,
  status,
  document_type,
  grandTotal: 100,
})
const ids = (rows: { id: string }[]) => rows.map((row) => row.id)
const saturday = new Date(2026, 9, 10, 0, 5)

test("follow-ups include overdue unpaid invoices and exclude paid and non-invoice documents", () => {
  const result = getDashboardActions(
    [
      invoice("recent", "2026-10-09"),
      invoice("oldest", "2026-10-01"),
      invoice("flagged", null, "overdue"),
      invoice("paid", "2026-10-01", "paid"),
      invoice("quote", "2026-10-01", "unpaid", "quotation"),
      invoice("proforma", "2026-10-01", "unpaid", "proforma"),
      invoice("challan", "2026-10-01", "unpaid", "challan"),
      invoice("draft", "2026-10-01", "draft"),
      invoice("today", "2026-10-10"),
      invoice("undated", null),
    ],
    [],
    saturday,
  )
  assert.deepEqual(ids(result.followUps), ["oldest", "recent", "flagged"])
})

test("due this week includes today through Sunday and excludes next week and overdue statuses", () => {
  const result = getDashboardActions(
    [
      invoice("sunday", "2026-10-11"),
      invoice("today", "2026-10-10"),
      invoice("yesterday", "2026-10-09"),
      invoice("monday", "2026-10-12"),
      invoice("paid", "2026-10-10", "paid"),
      invoice("flagged", "2026-10-11", "overdue"),
      invoice("undated", null),
    ],
    [],
    saturday,
  )
  assert.deepEqual(ids(result.dueThisWeek), ["today", "sunday"])
})

test("Sunday does not include the following week and local dates survive month and year boundaries", () => {
  assert.deepEqual(
    ids(
      getDashboardActions(
        [invoice("today", "2026-10-11"), invoice("tomorrow", "2026-10-12")],
        [],
        new Date(2026, 9, 11, 23, 55),
      ).dueThisWeek,
    ),
    ["today"],
  )
  assert.deepEqual(
    ids(
      getDashboardActions(
        [
          invoice("end-year", "2026-12-31"),
          invoice("new-year", "2027-01-01"),
          invoice("sunday", "2027-01-03"),
          invoice("next-week", "2027-01-04"),
        ],
        [],
        new Date(2026, 11, 31, 0, 5),
      ).dueThisWeek,
    ),
    ["end-year", "new-year", "sunday"],
  )
})

test("low stock respects custom thresholds including zero and puts empty stock first", () => {
  const items = [
    { id: "healthy", name: "Healthy", stock: 6 },
    { id: "boundary", name: "Boundary", stock: 5 },
    { id: "custom", name: "Custom", stock: 8, lowStockThreshold: 10 },
    { id: "empty", name: "Empty", stock: 0, lowStockThreshold: 0 },
    { id: "zero-threshold", name: "Zero", stock: 1, lowStockThreshold: 0 },
  ]
  const result = getDashboardActions([], items, saturday)
  assert.deepEqual(ids(result.lowStock), ["empty", "boundary", "custom"])
  assert.equal(items[0].id, "healthy")
})

test("an empty account has no daily actions", () => {
  assert.deepEqual(getDashboardActions([], [], saturday), {
    followUps: [],
    dueThisWeek: [],
    lowStock: [],
  })
})
