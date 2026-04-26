import type { TableColumn } from "@/features/data-tables/table-ui-store"

export type DataTableTemplateCategory =
  | "Finance"
  | "CRM"
  | "Operations"
  | "Projects"

export type DataTableTemplateIcon =
  | "FileText"
  | "Users"
  | "Receipt"
  | "ScrollText"
  | "BadgeDollarSign"
  | "FolderKanban"
  | "RefreshCw"
  | "UserRoundSearch"
  | "ClipboardList"
  | "Building2"

export interface DataTableTemplate {
  id: string
  name: string
  description: string
  category: DataTableTemplateCategory
  icon: DataTableTemplateIcon
  columns: TableColumn[]
}

const textColumn = (
  name: string,
  options?: Partial<Pick<TableColumn, "mandatory" | "description">>,
): TableColumn => ({
  name,
  type: "Text",
  mandatory: options?.mandatory ?? false,
  description: options?.description ?? "",
  options: [],
})

const selectColumn = (
  name: string,
  type: TableColumn["type"],
  options?: Partial<Pick<TableColumn, "mandatory" | "description" | "options">>,
): TableColumn => ({
  name,
  type,
  mandatory: options?.mandatory ?? false,
  description: options?.description ?? "",
  options: options?.options ?? [],
})

export const DATA_TABLE_TEMPLATES: DataTableTemplate[] = [
  {
    id: "invoice-tracker",
    name: "Invoice Tracker",
    description: "Track invoices, due dates, totals, and payment collection.",
    category: "Finance",
    icon: "FileText",
    columns: [
      textColumn("Invoice No", { mandatory: true }),
      textColumn("Client Name", { mandatory: true }),
      {
        name: "Amount",
        type: "Amount (₹)",
        mandatory: true,
        description: "",
        options: [],
      },
      {
        name: "Issue Date",
        type: "Date",
        mandatory: true,
        description: "",
        options: [],
      },
      {
        name: "Due Date",
        type: "Due Date",
        mandatory: false,
        description: "",
        options: [],
      },
      {
        name: "Payment Status",
        type: "Payment Status",
        mandatory: true,
        description: "",
        options: [],
      },
      textColumn("Notes"),
    ],
  },
  {
    id: "client-directory",
    name: "Client Directory",
    description:
      "Maintain client contacts, companies, and relationship status.",
    category: "CRM",
    icon: "Users",
    columns: [
      textColumn("Client Name", { mandatory: true }),
      textColumn("Company"),
      textColumn("Email"),
      textColumn("Phone"),
      selectColumn("Active", "Checkbox"),
      selectColumn("Tag", "Tag"),
      textColumn("Notes"),
    ],
  },
  {
    id: "expense-tracker",
    name: "Expense Tracker",
    description: "Capture business expenses, categories, and receipts.",
    category: "Finance",
    icon: "Receipt",
    columns: [
      {
        name: "Date",
        type: "Date",
        mandatory: true,
        description: "",
        options: [],
      },
      textColumn("Description", { mandatory: true }),
      {
        name: "Amount",
        type: "Amount (₹)",
        mandatory: true,
        description: "",
        options: [],
      },
      {
        name: "Category",
        type: "Dropdown",
        mandatory: true,
        description: "",
        options: ["Travel", "Food", "Office", "Marketing", "Software", "Other"],
      },
      textColumn("Paid By"),
      {
        name: "Receipt",
        type: "Attachment",
        mandatory: false,
        description: "",
        options: [],
      },
    ],
  },
  {
    id: "contract-tracker",
    name: "Contract Tracker",
    description: "Track agreements, renewal dates, values, and status.",
    category: "Operations",
    icon: "ScrollText",
    columns: [
      textColumn("Contract Name", { mandatory: true }),
      textColumn("Client", { mandatory: true }),
      {
        name: "Start Date",
        type: "Date",
        mandatory: true,
        description: "",
        options: [],
      },
      {
        name: "Expiry Date",
        type: "Expiry Date",
        mandatory: true,
        description: "",
        options: [],
      },
      {
        name: "Value",
        type: "Amount (₹)",
        mandatory: false,
        description: "",
        options: [],
      },
      {
        name: "Status",
        type: "Status",
        mandatory: true,
        description: "",
        options: [],
      },
    ],
  },
  {
    id: "sales-pipeline",
    name: "Sales Pipeline",
    description: "Manage deals, stages, values, owners, and close dates.",
    category: "CRM",
    icon: "BadgeDollarSign",
    columns: [
      textColumn("Deal Name", { mandatory: true }),
      textColumn("Company", { mandatory: true }),
      textColumn("Owner", { mandatory: true }),
      {
        name: "Stage",
        type: "Status",
        mandatory: true,
        description: "",
        options: [],
      },
      {
        name: "Deal Value",
        type: "Amount (₹)",
        mandatory: true,
        description: "",
        options: [],
      },
      {
        name: "Expected Close",
        type: "Due Date",
        mandatory: false,
        description: "",
        options: [],
      },
      selectColumn("Priority", "Tag"),
    ],
  },
  {
    id: "project-tracker",
    name: "Project Tracker",
    description: "Track projects, owners, deadlines, and delivery progress.",
    category: "Projects",
    icon: "FolderKanban",
    columns: [
      textColumn("Project Name", { mandatory: true }),
      textColumn("Client"),
      textColumn("Project Owner", { mandatory: true }),
      {
        name: "Start Date",
        type: "Date",
        mandatory: true,
        description: "",
        options: [],
      },
      {
        name: "Deadline",
        type: "Due Date",
        mandatory: false,
        description: "",
        options: [],
      },
      {
        name: "Status",
        type: "Status",
        mandatory: true,
        description: "",
        options: [],
      },
      selectColumn("Priority", "Tag"),
    ],
  },
  {
    id: "subscription-billing",
    name: "Subscription Billing",
    description:
      "Monitor recurring subscriptions, billing dates, and renewals.",
    category: "Finance",
    icon: "RefreshCw",
    columns: [
      textColumn("Subscription Name", { mandatory: true }),
      textColumn("Vendor", { mandatory: true }),
      {
        name: "Plan Amount",
        type: "Amount (₹)",
        mandatory: true,
        description: "",
        options: [],
      },
      {
        name: "Billing Cycle",
        type: "Dropdown",
        mandatory: true,
        description: "",
        options: ["Monthly", "Quarterly", "Yearly"],
      },
      {
        name: "Next Billing Date",
        type: "Due Date",
        mandatory: true,
        description: "",
        options: [],
      },
      {
        name: "Payment Status",
        type: "Payment Status",
        mandatory: true,
        description: "",
        options: [],
      },
      selectColumn("Auto Renew", "Checkbox"),
    ],
  },
  {
    id: "lead-crm",
    name: "Lead CRM",
    description:
      "Capture inbound leads, source channels, and follow-up status.",
    category: "CRM",
    icon: "UserRoundSearch",
    columns: [
      textColumn("Lead Name", { mandatory: true }),
      textColumn("Company"),
      textColumn("Email"),
      textColumn("Phone"),
      {
        name: "Source",
        type: "Dropdown",
        mandatory: true,
        description: "",
        options: ["Website", "Referral", "LinkedIn", "Ads", "Event", "Other"],
      },
      {
        name: "Status",
        type: "Status",
        mandatory: true,
        description: "",
        options: [],
      },
      {
        name: "Next Follow-Up",
        type: "Due Date",
        mandatory: false,
        description: "",
        options: [],
      },
    ],
  },
  {
    id: "purchase-orders",
    name: "Purchase Orders",
    description: "Track purchase requests, suppliers, totals, and fulfillment.",
    category: "Operations",
    icon: "ClipboardList",
    columns: [
      textColumn("PO Number", { mandatory: true }),
      textColumn("Supplier", { mandatory: true }),
      {
        name: "Order Date",
        type: "Date",
        mandatory: true,
        description: "",
        options: [],
      },
      {
        name: "Delivery Date",
        type: "Due Date",
        mandatory: false,
        description: "",
        options: [],
      },
      {
        name: "Order Total",
        type: "Amount (₹)",
        mandatory: true,
        description: "",
        options: [],
      },
      {
        name: "Status",
        type: "Status",
        mandatory: true,
        description: "",
        options: [],
      },
      textColumn("Requested By"),
    ],
  },
  {
    id: "vendor-tracker",
    name: "Vendor Tracker",
    description:
      "Organize supplier contacts, terms, service status, and renewals.",
    category: "Operations",
    icon: "Building2",
    columns: [
      textColumn("Vendor Name", { mandatory: true }),
      textColumn("Contact Person"),
      textColumn("Email"),
      textColumn("Phone"),
      {
        name: "Service Category",
        type: "Dropdown",
        mandatory: true,
        description: "",
        options: [
          "Software",
          "Logistics",
          "Office",
          "Consulting",
          "Marketing",
          "Other",
        ],
      },
      {
        name: "Active",
        type: "Checkbox",
        mandatory: false,
        description: "",
        options: [],
      },
      {
        name: "Renewal Date",
        type: "Expiry Date",
        mandatory: false,
        description: "",
        options: [],
      },
    ],
  },
]

export const getDataTableTemplates = () => DATA_TABLE_TEMPLATES

export const getDataTableTemplateById = (templateId?: string) =>
  DATA_TABLE_TEMPLATES.find((template) => template.id === templateId)

const getTodayDateString = () => new Date().toISOString().slice(0, 10)

export const getDefaultValueForColumn = (col: TableColumn): unknown => {
  if (
    col.type === "Number" ||
    col.type === "Currency" ||
    col.type === "Amount (₹)"
  ) {
    return 0
  }

  if (col.type === "Checkbox") {
    return false
  }

  if (
    col.type === "Date" ||
    col.type === "Due Date" ||
    col.type === "Expiry Date"
  ) {
    return getTodayDateString()
  }

  if (col.type === "Status") {
    return "Todo"
  }

  if (col.type === "Payment Status") {
    return "Unpaid"
  }

  if (col.type === "Tag") {
    return "Medium"
  }

  if (col.type === "Dropdown") {
    return col.options?.[0] ?? "Option 1"
  }

  if (col.type === "Attachment") {
    return ""
  }

  return `New ${col.name}`
}

export const buildMandatoryDefaultRow = (columns: TableColumn[]) =>
  columns.reduce<Record<string, unknown>>((acc, col) => {
    if (!col.mandatory) {
      return acc
    }

    acc[col.name] = getDefaultValueForColumn(col)
    return acc
  }, {})
