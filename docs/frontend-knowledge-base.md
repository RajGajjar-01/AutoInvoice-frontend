# AutoInvoice Frontend Knowledge Base

This document captures verified frontend knowledge from the current repository checkout on `2026-06-16`. It is intended to be a practical internal reference for future implementation, debugging, onboarding, and architecture review.

The contents below are based on direct inspection of the codebase and one production build attempt. Where behavior is inferred from code rather than manually executed in a browser, that is stated or kept narrowly scoped.

## 1. High-Level Stack

The frontend is a Vite application using:

- React 19
- TypeScript
- TanStack Router
- TanStack Query
- Tailwind CSS 4
- Radix UI primitives
- Zustand
- Axios
- Recharts
- Playwright

Verified in [package.json](D:\Projects\secret_startup\AutoInvoice-frontend\package.json).

## 2. Application Bootstrap

The main runtime entry is [src/main.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\main.tsx).

Verified behaviors:

- `OpenAPI.BASE` is set from `VITE_API_URL`, or defaults to `http://localhost:8000` in development.
- `OpenAPI.WITH_CREDENTIALS = true`.
- A global Axios request interceptor adds `X-CSRF-Token` from the `csrf_token` cookie for non-GET requests.
- The app is wrapped with:
  - `ThemeProvider`
  - `QueryClientProvider`
  - `RouterProvider`
  - `Toaster`

The global query client is in [src/queryClient.ts](D:\Projects\secret_startup\AutoInvoice-frontend\src\queryClient.ts).

Verified behaviors:

- Query and mutation errors route through `handleApiError`.
- Any `ApiError` with status `401` redirects to `/login` unless the current route is public.
- Public pages are:
  - `/`
  - `/login`
  - `/signup`
  - `/recover-password`
  - `/reset-password`

## 3. API Layer and Auth Refresh

There are two API patterns in the codebase:

1. Generated OpenAPI client services in [src/client/sdk.gen.ts](D:\Projects\secret_startup\AutoInvoice-frontend\src\client\sdk.gen.ts)
2. A custom Axios instance in [src/lib/api.ts](D:\Projects\secret_startup\AutoInvoice-frontend\src\lib\api.ts)

### 3.1 Generated Services Present

Verified generated services include:

- `AdminService`
- `AuthService`
- `CompanySettingsService`
- `CustomersService`
- `InvoicesService`
- `InvoiceTemplatesService`
- `ItemsService`
- `NotificationsService`
- `PrivateService`
- `TablesService`
- `UsersService`
- `UtilsService`

### 3.2 Axios Refresh Logic

The custom Axios instance in [src/lib/api.ts](D:\Projects\secret_startup\AutoInvoice-frontend\src\lib\api.ts) does the following:

- Sets `withCredentials = true`
- Adds CSRF header from cookie for mutating methods
- Retries once after `401` or `403`
- Refreshes session by POSTing to `${OpenAPI.BASE}/api/v1/auth/refresh`
- Avoids refresh loops for:
  - login
  - signup
  - refresh
  - logout
  - forgot-password
  - reset-password

This is used explicitly by the invoice template service in [src/features/invoice-templates/service.ts](D:\Projects\secret_startup\AutoInvoice-frontend\src\features\invoice-templates\service.ts).

## 4. Routing Model

The root route is [src/routes/__root.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\__root.tsx).

Verified root behavior:

- Renders `HeadContent` and `Outlet`
- Uses `NotFound` as the not-found component
- Uses `ErrorComponent` as the error boundary

The protected shell is [src/routes/_layout.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\_layout.tsx).

Verified layout behavior:

- Calls `useAuth()`
- Redirects unauthenticated users to `/login`
- Shows `Loading...` while auth state loads
- Wraps authenticated content with:
  - `SidebarProvider`
  - `AppSidebar`
  - `SidebarInset`

The generated route registry is [src/routeTree.gen.ts](D:\Projects\secret_startup\AutoInvoice-frontend\src\routeTree.gen.ts).

### 4.1 Public Routes

Verified public routes:

- `/`
- `/login`
- `/signup`
- `/recover-password`
- `/reset-password`

### 4.2 Protected Routes

Verified protected routes:

- `/dashboard`
- `/items`
- `/items/$itemId`
- `/data-tables`
- `/data-tables/new`
- `/data-tables/$tableId`
- `/customers`
- `/customers/$customerId`
- `/invoices`
- `/invoice-history`
- `/invoice-history/$invoiceId`
- `/invoice-templates`
- `/template-builder`
- `/create-invoice`
- `/create-challan`
- `/create-proforma`
- `/create-quotation`
- `/insights`
- `/notifications`
- `/profile`
- `/settings`
- `/admin`

### 4.3 Legacy Ignored Routes

The following legacy files are intentionally ignored by the router plugin:

- [src/routes/-data-tables.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\-data-tables.tsx)
- [src/routes/-data-tables.$tableId.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\-data-tables.$tableId.tsx)

Both contain comments stating they were moved into the auth-guarded `_layout` route structure.

## 5. Auth Flows

### 5.1 Auth Hook

The main auth hook is [src/hooks/useAuth.ts](D:\Projects\secret_startup\AutoInvoice-frontend\src\hooks\useAuth.ts).

Verified behaviors:

- Uses React Query key `["currentUser"]`
- Loads current user via `AuthService.getCurrentUserInfo`
- Converts `401` responses into `null` user rather than throwing
- `signup` uses `AuthService.signup`
- `login` uses `AuthService.login`
- Both login and signup:
  - invalidate `currentUser`
  - refetch `currentUser`
  - navigate to `/dashboard`
- `logout` calls `AuthService.logout`, clears the query client, then navigates to `/login`

### 5.2 Login Page

File: [src/routes/login.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\login.tsx)

Verified details:

- Uses `react-hook-form` with Zod validation
- Requires valid email
- Requires password with minimum 8 characters
- Has link to `/recover-password`

### 5.3 Signup Page

File: [src/routes/signup.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\signup.tsx)

Verified details:

- Requires `full_name`
- Requires valid email
- Requires password with minimum 8 characters
- Requires matching confirmation password

### 5.4 Recover Password

File: [src/routes/recover-password.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\recover-password.tsx)

Verified details:

- Calls `AuthService.forgotPassword`
- Uses `useMutation`
- Resets form on success

### 5.5 Reset Password

File: [src/routes/reset-password.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\reset-password.tsx)

Verified details:

- Validates search for optional `token`
- `beforeLoad` redirects to `/login` if neither query token nor hash token is present
- Accepts `access_token` from URL hash if needed
- Calls `AuthService.resetPassword`
- Navigates to `/login` on success

## 6. Sidebar and Navigation

Sidebar files:

- [src/components/Sidebar/AppSidebar.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\components\Sidebar\AppSidebar.tsx)
- [src/components/Sidebar/Main.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\components\Sidebar\Main.tsx)
- [src/components/Sidebar/User.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\components\Sidebar\User.tsx)

Verified base navigation items:

- Dashboard
- Items
- Data Tables
- Customers
- Invoices
- Insights
- Notifications
- Account

Verified admin-only item:

- Admin

The admin item is appended when `currentUser?.is_superuser` is truthy.

## 7. Landing and Public UI

The landing page is [src/routes/index.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\index.tsx).

Verified composition:

- `Hero`
- `Features`
- `Benefits`
- `CTA`
- `Footer`
- `Appearance`
- `Logo`

If user is authenticated, the page shows a `Go to Dashboard` button. Otherwise it shows `Log In` and `Sign Up`.

## 8. Dashboard

File: [src/routes/_layout/dashboard.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\_layout\dashboard.tsx)

Verified data sources:

- `invoicesStatsQueryOptions()`
- `invoicesListQueryOptions()`
- `customersListQueryOptions()`
- `useLocalStorage("items", [])`

This means dashboard KPIs are mixed-source:

- invoice and customer numbers come from API-backed queries
- inventory metrics come from local storage

Verified dashboard sections:

- Greeting based on current time and user name
- KPI cards
- Recent invoices table
- Receivables summary
- Quick actions
- Stock alert panel

Verified quick actions link to:

- `/create-invoice`
- `/customers`
- `/items`
- `/invoices`

## 9. Insights

File: [src/routes/_layout/insights.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\_layout\insights.tsx)

Verified data sources:

- invoices list
- invoice stats
- customer list

Verified insights sections:

- KPI cards
- Revenue trend area chart
- Invoice status pie chart
- Receivables breakdown
- Top customers bar chart
- Monthly invoice volume chart

Verified charting library:

- `recharts`

If no invoices exist, the page renders an empty state encouraging invoice creation.

## 10. Customers

### 10.1 Customer Queries

File: [src/features/customers/queries.ts](D:\Projects\secret_startup\AutoInvoice-frontend\src\features\customers\queries.ts)

Verified behaviors:

- `customersListQueryOptions` calls `CustomersService.readCustomers`
- `customerDetailQueryOptions` calls `CustomersService.readCustomer`
- API payloads are adapted into UI-friendly names such as:
  - `party_type -> partyType`
  - `billing_address -> billingAddress`
  - `shipping_address -> shippingAddress`
  - `created_at -> createdAt`

### 10.2 Customers Index

File: [src/routes/_layout/customers/index.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\_layout\customers\index.tsx)

Verified behaviors:

- Uses React Query, not local storage
- Includes search and type filter
- Counts total parties, customers, suppliers
- Renders `DataTable`
- Shows empty state when there are no entries

### 10.3 Add Customer

File: [src/components/Customers/AddCustomer.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\components\Customers\AddCustomer.tsx)

Verified behaviors:

- Calls `CustomersService.createCustomer`
- Supports party types:
  - customer
  - supplier
  - both
- Accepts GSTIN, addresses, credit terms, tags, notes
- Invalidates all customer queries on success

### 10.4 Customer Detail

File: [src/routes/_layout/customers.$customerId.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\_layout\customers.$customerId.tsx)

Verified behaviors:

- Uses `customerDetailQueryOptions(customerId)`
- Navigates back to `/customers` after deletion
- Shows custom not-found state if customer is missing

## 11. Items

Items are one of the clearest hybrid/legacy areas in the codebase.

### 11.1 Item Query Layer Exists

File: [src/features/items/queries.ts](D:\Projects\secret_startup\AutoInvoice-frontend\src\features\items\queries.ts)

Verified available query functions:

- `itemsListQueryOptions`
- `itemDetailQueryOptions`
- `itemCategoriesQueryOptions`

These call `ItemsService`.

### 11.2 Active Item UI Uses Local Storage

Verified active local-storage-based item files:

- [src/routes/_layout/items/index.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\_layout\items\index.tsx)
- [src/routes/_layout/items.$itemId.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\_layout\items.$itemId.tsx)
- [src/components/Items/AddItem.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\components\Items\AddItem.tsx)
- [src/components/Items/EditItem.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\components\Items\EditItem.tsx)
- [src/components/Items/DeleteItem.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\components\Items\DeleteItem.tsx)
- [src/components/Items/AdjustStock.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\components\Items\AdjustStock.tsx)
- [src/components/Items/ItemDetail.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\components\Items\ItemDetail.tsx)

Verified behaviors:

- Items list page reads from `useLocalStorage("items", [])`
- Item creation appends to local storage
- Stock adjustments mutate local storage
- Item detail resolves item by searching local storage
- Empty state and CRUD behavior are local-only in the current active UI

### 11.3 Item Detail

The item detail page includes:

- stock badge
- current stock stat
- sale price
- purchase price
- profit margin
- stock history
- quick actions

Verified in [ItemDetail.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\components\Items\ItemDetail.tsx).

## 12. Invoices

### 12.1 Invoice Queries

File: [src/features/invoices/queries.ts](D:\Projects\secret_startup\AutoInvoice-frontend\src\features\invoices\queries.ts)

Verified behaviors:

- `invoicesListQueryOptions` calls `InvoicesService.readInvoices`
- `invoiceDetailQueryOptions` calls `InvoicesService.readInvoice`
- `invoicesStatsQueryOptions` calls `InvoicesService.getDashboardStats`
- API fields are adapted, such as:
  - `invoice_number -> invoiceNumber`
  - `invoice_date -> invoiceDate`
  - `grand_total -> grandTotal`
  - `customer_id -> customerId`

### 12.2 Invoices Overview Page

File: [src/routes/_layout/invoices.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\_layout\invoices.tsx)

Verified sections:

- KPI stats
- recent invoices
- quick actions
- status breakdown
- status cycling
- WhatsApp share
- delete dialog

### 12.3 Invoice History

File: [src/routes/_layout/invoice-history/index.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\_layout\invoice-history\index.tsx)

Verified features:

- searchable invoice table
- status filter
- sort order
- detail links
- status cycling
- WhatsApp sharing
- delete dialog

### 12.4 Invoice Detail

File: [src/routes/_layout/invoice-history.$invoiceId.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\_layout\invoice-history.$invoiceId.tsx)

Verified sections:

- invoice metadata
- line items
- totals
- notes
- payment terms
- bill-to panel
- summary panel
- status badge
- WhatsApp share
- delete flow

### 12.5 Invoice Templates

Files:

- [src/routes/_layout/invoice-templates.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\_layout\invoice-templates.tsx)
- [src/features/invoice-templates/service.ts](D:\Projects\secret_startup\AutoInvoice-frontend\src\features\invoice-templates\service.ts)
- [src/features/invoice-templates/queries.ts](D:\Projects\secret_startup\AutoInvoice-frontend\src\features\invoice-templates\queries.ts)
- [src/features/invoice-templates/mutations.ts](D:\Projects\secret_startup\AutoInvoice-frontend\src\features\invoice-templates\mutations.ts)

Verified capabilities:

- list templates
- detect active template
- activate template
- create custom template
- update template
- delete template
- import PDF template
- import HTML template
- import Excel-derived template
- preview built-in templates

Verified built-in template ids:

- `clean-teal`
- `geometric`
- `circle-studio`
- `aizen-bold`
- `simple-boxed`

### 12.6 Template Builder

File: [src/routes/_layout/template-builder.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\_layout\template-builder.tsx)

Verified capabilities:

- drag and drop block ordering via `@dnd-kit`
- block style editing
- global template design editing
- save and activate custom template
- popup HTML preview

Verified block types:

- company-header
- customer-details
- invoice-meta
- items-table
- totals
- notes
- signature
- footer

### 12.7 Create Invoice

File: [src/routes/_layout/create-invoice.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\_layout\create-invoice.tsx)

This is one of the most important files in the app.

Verified capabilities:

- preselect customer from query string
- preselect item from query string
- support `documentType` variants
- load active invoice template
- load customers from API
- load items from local storage
- load company profile from local storage
- create customer on the fly if needed
- create invoice through API
- deduct stock from local storage after save
- build invoice HTML client-side
- preview invoice in a dialog iframe
- download invoice PDF using `html2pdf.js`
- send invoice via WhatsApp
- send invoice via email

Verified search validation:

- `customerId`
- `itemId`
- `documentType`

Verified document variant default:

- if missing, `documentType` defaults to `"invoice"`

### 12.8 Document Variants

Files:

- [src/routes/_layout/create-challan.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\_layout\create-challan.tsx)
- [src/routes/_layout/create-proforma.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\_layout\create-proforma.tsx)
- [src/routes/_layout/create-quotation.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\_layout\create-quotation.tsx)

Verified behavior:

- All three pages redirect into `/create-invoice`
- They pass:
  - `documentType: "challan"`
  - `documentType: "proforma"`
  - `documentType: "quotation"`

These are not separate full implementations. They are variants of the invoice creation flow.

## 13. Data Tables

### 13.1 Data Table Query Layer

File: [src/features/data-tables/queries.ts](D:\Projects\secret_startup\AutoInvoice-frontend\src\features\data-tables\queries.ts)

Verified functions:

- `tablesListQueryOptions`
- `tableDetailQueryOptions`
- `adaptTableDetailToUi`
- `adaptTableListItemToUi`

Verified service usage:

- `TablesService.listTables`
- `TablesService.getTable`

### 13.2 Data Tables Index

File: [src/routes/_layout/data-tables/index.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\_layout\data-tables\index.tsx)

Verified capabilities:

- list tables
- search tables
- create blank table
- create table from template
- rename table
- duplicate table
- delete table
- show template catalog tab

### 13.3 Create Table

File: [src/routes/_layout/data-tables.new.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\_layout\data-tables.new.tsx)

Verified behavior:

- passes optional `templateId` into `CreateTablePage`

### 13.4 Table Detail View

File: [src/routes/_layout/data-tables.$tableId.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\_layout\data-tables.$tableId.tsx)

This is the most advanced UI in the repo after the invoice builder.

Verified capabilities:

- suspense-based table loading
- inline editable cells
- keyboard cell navigation
- formula bar
- formula evaluation via [src/lib/formula-engine.ts](D:\Projects\secret_startup\AutoInvoice-frontend\src\lib\formula-engine.ts)
- range selection for numeric columns
- summary/status bar
- search
- option/date/bool filters
- mobile entry sheet
- row selection
- bulk delete
- add row
- delete row
- reminder modal
- export menu

Verified table row mutation methods are available in the generated client:

- `duplicateTable`
- `createTableRow`
- `updateTableRow`
- `deleteTableRow`
- `bulkDeleteTableRows`

### 13.5 Data Table UI Store

File: [src/features/data-tables/table-ui-store.ts](D:\Projects\secret_startup\AutoInvoice-frontend\src\features\data-tables\table-ui-store.ts)

Verified role:

- central Zustand store for table interaction state
- stores focused cell, selection, filters, selected rows, reminder modal state, formula bar state

## 14. Notifications

Files:

- [src/routes/_layout/notifications.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\_layout\notifications.tsx)
- [src/features/data-tables/notification-store.ts](D:\Projects\secret_startup\AutoInvoice-frontend\src\features\data-tables\notification-store.ts)

Verified behavior:

- notifications page is built from local Zustand state
- source reminder data is derived from table details
- page synchronizes overdue reminders by reading all tables
- supports:
  - unread/read tabs
  - mark all read
  - clear all
  - search
  - group by date

Important note:

- There is a generated `NotificationsService`, but the active notifications UX is not built around it.

## 15. Admin

File: [src/routes/_layout/admin.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\_layout\admin.tsx)

Verified behaviors:

- `beforeLoad` calls `UsersService.readUserMe()`
- redirects non-superusers away
- lists users via `AdminService.listUsers`
- uses suspense
- shows `AddUser`
- uses a table with actions

## 16. Settings vs Profile

These two routes serve different purposes and should not be mentally merged.

### 16.1 `/settings`

Files:

- [src/routes/_layout/settings.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\_layout\settings.tsx)
- [src/components/UserSettings/UserInformation.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\components\UserSettings\UserInformation.tsx)
- [src/components/UserSettings/ChangePassword.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\components\UserSettings\ChangePassword.tsx)
- [src/components/UserSettings/DeleteAccount.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\components\UserSettings\DeleteAccount.tsx)

Verified purpose:

- user account management
- update personal user info through `UsersService.updateUserMe`
- change password
- delete account

There is also a demo data tab in the page route.

Verified demo-data behavior:

- calls `seedDemoData()`
- calls `clearDemoData()`

### 16.2 `/profile`

File: [src/routes/_layout/profile.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\_layout\profile.tsx)

Verified purpose:

- local company profile and invoice-branding editor
- stores:
  - company name
  - tax ids
  - address
  - bank details
  - invoice defaults
  - logo
  - footer note

Important note:

- This page uses `useLocalStorage("company-details", defaultCompany)`
- It is not currently wired to `CompanySettingsService`

### 16.3 Additional Business Profile Component

File: [src/components/Profile/BusinessDetailsForm.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\components\Profile\BusinessDetailsForm.tsx)

Observed status:

- has form validation
- does not call a real backend service
- mutation uses `setTimeout` and returns form data
- likely incomplete, experimental, or unused in primary routing

## 17. Theme System

Files:

- [src/components/theme-provider.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\components\theme-provider.tsx)
- [src/components/Common/Appearance.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\components\Common\Appearance.tsx)

Verified theme support:

- light
- dark
- system

Theme controls appear in:

- public auth layout
- app sidebar footer

## 18. Demo Data

File: [src/lib/seedDemoData.ts](D:\Projects\secret_startup\AutoInvoice-frontend\src\lib\seedDemoData.ts)

Verified local storage keys written:

- `customers`
- `items`
- `invoices`
- `selected-template`

Verified keys removed during clear:

- `customers`
- `items`
- `invoices`
- `selected-template`
- `custom-template`
- `imported-template`
- `demo-tables`

Important note:

- This demo-data system is local-storage-oriented.
- It does not populate backend API resources directly.

## 19. State Source Map

This section is important because the app is not uniform.

### 19.1 API-Backed Active Surfaces

Verified API-backed active surfaces:

- auth
- current user
- customers
- invoices
- invoice stats
- invoice templates
- data tables
- admin users

### 19.2 Local-Storage-Backed Active Surfaces

Verified local-storage-backed active surfaces:

- items list/detail/crud/stock adjustments
- company profile / business branding
- demo data
- invoice builder inventory depletion

### 19.3 Zustand-Backed Active Surfaces

Verified Zustand-backed active surfaces:

- data table UI state
- notifications state

## 20. Testing Coverage

Playwright config is in [playwright.config.ts](D:\Projects\secret_startup\AutoInvoice-frontend\playwright.config.ts).

Verified config details:

- base URL: `http://localhost:5173`
- web server command: `npm run dev`
- auth storage state: `playwright/.auth/user.json`

### 20.1 Covered Areas

Verified tests cover:

- auth redirects
- login
- signup
- password reset flow
- admin user management
- items CRUD and empty state
- data table template list and basic row creation/edit behavior
- user settings and theme switching
- repository is TypeScript-only check

Relevant files:

- [tests/auth-redirect.spec.ts](D:\Projects\secret_startup\AutoInvoice-frontend\tests\auth-redirect.spec.ts)
- [tests/login.spec.ts](D:\Projects\secret_startup\AutoInvoice-frontend\tests\login.spec.ts)
- [tests/sign-up.spec.ts](D:\Projects\secret_startup\AutoInvoice-frontend\tests\sign-up.spec.ts)
- [tests/reset-password.spec.ts](D:\Projects\secret_startup\AutoInvoice-frontend\tests\reset-password.spec.ts)
- [tests/admin.spec.ts](D:\Projects\secret_startup\AutoInvoice-frontend\tests\admin.spec.ts)
- [tests/items.spec.ts](D:\Projects\secret_startup\AutoInvoice-frontend\tests\items.spec.ts)
- [tests/data-tables.spec.ts](D:\Projects\secret_startup\AutoInvoice-frontend\tests\data-tables.spec.ts)
- [tests/user-settings.spec.ts](D:\Projects\secret_startup\AutoInvoice-frontend\tests\user-settings.spec.ts)
- [tests/typescript-only.spec.ts](D:\Projects\secret_startup\AutoInvoice-frontend\tests\typescript-only.spec.ts)

### 20.2 Not Clearly Covered

I did not find dedicated Playwright coverage for:

- landing page content/CTA behavior
- dashboard
- insights
- customers detail/edit/delete flows
- invoice creation
- invoice history
- invoice detail
- invoice templates end-to-end beyond auth/session-template activation paths
- template builder
- notifications page
- company profile page

## 21. Build and Deployment

### 21.1 Development

File: [vite.config.ts](D:\Projects\secret_startup\AutoInvoice-frontend\vite.config.ts)

Verified behaviors:

- `@` alias points to `./src`
- dev server proxies `/api` to `http://localhost:8000`

### 21.2 Environment Files

Files:

- [.env.example](D:\Projects\secret_startup\AutoInvoice-frontend\.env.example)
- [.env.production.example](D:\Projects\secret_startup\AutoInvoice-frontend\.env.production.example)

Verified variable:

- `VITE_API_URL`

### 21.3 Docker

File: [Dockerfile](D:\Projects\secret_startup\AutoInvoice-frontend\Dockerfile)

Verified behavior:

- multi-stage build
- build-time `VITE_API_URL`
- serves output with nginx

### 21.4 Nginx

File: [nginx.conf](D:\Projects\secret_startup\AutoInvoice-frontend\nginx.conf)

Verified behavior:

- proxies `/api/` to `https://backend-production-7571.up.railway.app/api/`
- hardcodes allowed frontend origin `https://autoinvoice-frontend-production.up.railway.app`
- handles CORS preflight
- serves SPA via `try_files`

Important portability note:

- This config is environment-specific and not generic.

## 22. Verified Build Status

I attempted a production build with:

```powershell
npm.cmd run build
```

Verified result:

- build failed

Verified blocker:

- Vite/Rollup failed to resolve import `zustand/react/shallow`
- referenced from [src/routes/_layout/data-tables.$tableId.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\_layout\data-tables.$tableId.tsx)

Verified additional output:

- CSS optimizer emitted 2 warnings before the fatal error

This means the repository, in its current checked-out state, does not complete a production build successfully.

## 23. Known Inconsistencies and Risks

### 23.1 Mixed Persistence Model

The strongest architecture risk is mixed persistence:

- customers/invoices/tables use backend APIs
- items/company profile still use local storage in active flows
- invoice creation depends on both

Likely consequences:

- data drift
- environment-specific behavior
- missing server truth for inventory
- harder onboarding and debugging

### 23.2 Unused or Transitional Paths

Potentially transitional or incomplete areas:

- `features/items/queries.ts` exists, but active items UI does not use it
- `CompanySettingsService` exists, but active company profile does not use it
- `NotificationsService` exists, but active notifications page does not use it
- `BusinessDetailsForm.tsx` appears non-primary and mocks persistence

### 23.3 Encoding/Mojibake Problems

Many files visibly contain broken character encoding sequences such as:

- `â‚¹`
- `â€”`
- `â€¦`
- `Â£`
- other malformed punctuation in comments and visible strings

Observed in multiple active UI files including:

- [dashboard.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\_layout\dashboard.tsx)
- [insights.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\_layout\insights.tsx)
- [settings.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\_layout\settings.tsx)
- [profile.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\_layout\profile.tsx)
- [ItemDetail.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\components\Items\ItemDetail.tsx)
- [seedDemoData.ts](D:\Projects\secret_startup\AutoInvoice-frontend\src\lib\seedDemoData.ts)

This is both a source-quality issue and potentially a user-visible UI issue.

### 23.4 Build Brokenness

The unresolved `zustand/react/shallow` import is a concrete release blocker.

## 24. Mental Model for Future Work

If you are changing this frontend, the safest current mental model is:

- The app shell, auth, customers, invoices, tables, and admin are backend-oriented.
- Items and company branding are still local-first.
- The invoice builder is the main integration hotspot because it joins API data, local inventory state, local company state, templates, PDF generation, and external sharing.
- Data tables are the most interaction-heavy feature and the most likely place for UI-state bugs.
- `/settings` and `/profile` are different domains and should remain clearly separated unless intentionally merged.

## 25. Recommended Reference Entry Points

For future work, these are the fastest files to re-open first:

- App bootstrap: [src/main.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\main.tsx)
- Protected shell: [src/routes/_layout.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\_layout.tsx)
- Route map: [src/routeTree.gen.ts](D:\Projects\secret_startup\AutoInvoice-frontend\src\routeTree.gen.ts)
- Auth behavior: [src/hooks/useAuth.ts](D:\Projects\secret_startup\AutoInvoice-frontend\src\hooks\useAuth.ts)
- Invoice creation: [src/routes/_layout/create-invoice.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\_layout\create-invoice.tsx)
- Data tables detail: [src/routes/_layout/data-tables.$tableId.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\_layout\data-tables.$tableId.tsx)
- Customers query layer: [src/features/customers/queries.ts](D:\Projects\secret_startup\AutoInvoice-frontend\src\features\customers\queries.ts)
- Invoices query layer: [src/features/invoices/queries.ts](D:\Projects\secret_startup\AutoInvoice-frontend\src\features\invoices\queries.ts)
- Items local CRUD: [src/components/Items/AddItem.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\components\Items\AddItem.tsx)
- Company profile local editor: [src/routes/_layout/profile.tsx](D:\Projects\secret_startup\AutoInvoice-frontend\src\routes\_layout\profile.tsx)
- Template service: [src/features/invoice-templates/service.ts](D:\Projects\secret_startup\AutoInvoice-frontend\src\features\invoice-templates\service.ts)
- Playwright config: [playwright.config.ts](D:\Projects\secret_startup\AutoInvoice-frontend\playwright.config.ts)

## 26. Closing Summary

This frontend is feature-rich and already supports:

- authentication
- customer management
- invoice management
- invoice templates and custom builder
- document variants
- spreadsheet-like business tables
- notifications
- admin user management
- user settings
- company branding profile

But the codebase is currently in a transitional state:

- not all domains share the same persistence model
- some generated services are not yet wired into active UI paths
- there are visible encoding issues
- production build is currently broken

That mix is the most important context to preserve for future work.
