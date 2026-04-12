# Data Table Template Catalog Design

**Goal:** Rebuild the existing four data-table templates, add six new business templates, and centralize template/default-row behavior so template-based tables can always add rows safely.

**Design:**
- Move template definitions out of `src/components/DataTables/tableStore.ts` into a dedicated catalog module.
- Define a shared template type with metadata: `id`, `name`, `description`, `icon`, `category`, and `columns`.
- Add catalog helpers so `TemplateSelector` and `CreateTablePage` read from one source of truth instead of searching raw arrays.
- Extract row default generation into reusable logic keyed off column type, then consume that logic from the table detail route.

**Template Set:**
- Rebuilt existing templates: `Invoice Tracker`, `Client Directory`, `Expense Tracker`, `Contract Tracker`
- New templates: `Sales Pipeline`, `Project Tracker`, `Subscription Billing`, `Lead CRM`, `Purchase Orders`, `Vendor Tracker`

**Behavioral Requirement:**
- Template-created tables must allow `Add Row` immediately, even when templates include mandatory fields.

**Verification:**
- Playwright regression for template-created tables adding a row.
- Playwright regression that the templates tab shows all ten template names.
