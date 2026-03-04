/**
 * seedDemoData.js
 * Writes realistic demo data to all AutoInvoice localStorage keys.
 * Call seedDemoData() to load, clearDemoData() to wipe everything.
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uuid() {
    return crypto.randomUUID()
}

function daysAgo(n) {
    const d = new Date()
    d.setDate(d.getDate() - n)
    return d.toISOString().slice(0, 10)
}

function isoAgo(n) {
    const d = new Date()
    d.setDate(d.getDate() - n)
    return d.toISOString()
}

// ─── Customers ────────────────────────────────────────────────────────────────

const CUSTOMER_IDS = {
    techSolutions: uuid(),
    greenEarth: uuid(),
    starRetail: uuid(),
    primeLogistics: uuid(),
    bhartiFabrics: uuid(),
    sunriseElectronics: uuid(),
    globeImports: uuid(),
    cityOfficeSupplies: uuid(),
}

const customers = [
    {
        id: CUSTOMER_IDS.techSolutions,
        name: "TechSolutions Pvt Ltd",
        partyType: "customer",
        email: "accounts@techsolutions.in",
        phone: "9876543210",
        billingAddress: "14, Whitefield Industrial Area, Bengaluru, KA 560066",
        gstin: "29AADCT1234Q1ZX",
        notes: "Preferred payment via NEFT. Send invoice PDF on email before dispatch.",
        paymentTerms: "Net 30",
        createdAt: isoAgo(120),
    },
    {
        id: CUSTOMER_IDS.greenEarth,
        name: "Green Earth Organics",
        partyType: "customer",
        email: "billing@greenearth.co",
        phone: "9812345678",
        billingAddress: "Plot 7, Phase 2, Andheri East, Mumbai, MH 400093",
        gstin: "27BCPFG5678L1ZY",
        notes: "Eco-conscious brand. Provide itemised GST invoice always.",
        paymentTerms: "Net 15",
        createdAt: isoAgo(90),
    },
    {
        id: CUSTOMER_IDS.starRetail,
        name: "Star Retail Chains",
        partyType: "customer",
        email: "finance@starretail.com",
        phone: "9900112233",
        billingAddress: "88, Anna Salai, Chennai, TN 600002",
        gstin: "33ZRTLS9012M1ZA",
        notes: "Bulk orders only. Minimum order value ₹25,000.",
        paymentTerms: "Net 45",
        createdAt: isoAgo(75),
    },
    {
        id: CUSTOMER_IDS.primeLogistics,
        name: "Prime Logistics & Co",
        partyType: "customer",
        email: "ops@primelogistics.in",
        phone: "9988776655",
        billingAddress: "Sector 18, Gurugram, HR 122001",
        gstin: "06PLCAB3456N1ZP",
        notes: "Include freight charges separately on invoice.",
        paymentTerms: "Net 30",
        createdAt: isoAgo(60),
    },
    {
        id: CUSTOMER_IDS.bhartiFabrics,
        name: "Bharti Fabrics",
        partyType: "supplier",
        email: "supply@bhartifabrics.in",
        phone: "9765432109",
        billingAddress: "Ring Road, Surat, GJ 395002",
        gstin: "24BFACT7890P1ZB",
        notes: "Supplier — place PO at least 10 days in advance.",
        paymentTerms: "Advance 50%, balance on delivery",
        createdAt: isoAgo(100),
    },
    {
        id: CUSTOMER_IDS.sunriseElectronics,
        name: "Sunrise Electronics",
        partyType: "supplier",
        email: "purchase@sunriseelec.in",
        phone: "9654321098",
        billingAddress: "Nehru Place, New Delhi, DL 110019",
        gstin: "07SELEC2345Q1ZS",
        notes: "Supplier for electronic components. Standard 1-year warranty on all goods.",
        paymentTerms: "Net 20",
        createdAt: isoAgo(80),
    },
    {
        id: CUSTOMER_IDS.globeImports,
        name: "Globe Imports Pvt Ltd",
        partyType: "both",
        email: "trade@globeimports.com",
        phone: "9543210987",
        billingAddress: "Free Trade Zone, JNPT, Navi Mumbai, MH 400707",
        gstin: "27GIPL0001R1ZG",
        notes: "B2B – both buys from us and sells raw materials to us.",
        paymentTerms: "Net 30",
        createdAt: isoAgo(55),
    },
    {
        id: CUSTOMER_IDS.cityOfficeSupplies,
        name: "City Office Supplies",
        partyType: "both",
        email: "info@cityoffice.in",
        phone: "9432109876",
        billingAddress: "MG Road, Pune, MH 411001",
        gstin: "27COSPL5678S1ZC",
        notes: "Quarterly billing preferred. GST invoice mandatory.",
        paymentTerms: "Net 45",
        createdAt: isoAgo(40),
    },
]

// ─── Items ────────────────────────────────────────────────────────────────────

const ITEM_IDS = {
    laptop: uuid(),
    wirelessMouse: uuid(),
    hdmiCable: uuid(),
    usbHub: uuid(),
    a4Paper: uuid(),
    penSet: uuid(),
    stapler: uuid(),
    webDesign: uuid(),
    seoAudit: uuid(),
    maintenance: uuid(),
}

const items = [
    {
        id: ITEM_IDS.laptop,
        name: "Business Laptop 14\"",
        sku: "ELE-LAP-001",
        category: "Electronics",
        unit: "pcs",
        salePrice: 52999,
        purchasePrice: 43000,
        taxRate: 18,
        hsnCode: "84713010",
        description: "14-inch business laptop, Intel Core i5, 16GB RAM, 512GB SSD",
        stock: 12,
        lowStockThreshold: 5,
        stockHistory: [
            { date: isoAgo(85), type: "purchase", qty: 20, reason: "Initial stock" },
            { date: isoAgo(60), type: "invoice", qty: -3, reason: "Invoice INV-2501-X9A2" },
            { date: isoAgo(45), type: "invoice", qty: -2, reason: "Invoice INV-2501-B7F4" },
            { date: isoAgo(30), type: "purchase", qty: 5, reason: "Restock" },
            { date: isoAgo(15), type: "invoice", qty: -8, reason: "Invoice INV-2502-C3D1" },
        ],
    },
    {
        id: ITEM_IDS.wirelessMouse,
        name: "Wireless Ergonomic Mouse",
        sku: "ELE-MOU-002",
        category: "Electronics",
        unit: "pcs",
        salePrice: 1299,
        purchasePrice: 750,
        taxRate: 18,
        hsnCode: "84716020",
        description: "2.4GHz wireless optical mouse, ergonomic design",
        stock: 3,
        lowStockThreshold: 10,
        stockHistory: [
            { date: isoAgo(80), type: "purchase", qty: 50, reason: "Initial stock" },
            { date: isoAgo(55), type: "invoice", qty: -15, reason: "Invoice INV-2501-D5E6" },
            { date: isoAgo(40), type: "invoice", qty: -20, reason: "Invoice INV-2502-F1G7" },
            { date: isoAgo(20), type: "invoice", qty: -12, reason: "Invoice INV-2502-H8I9" },
        ],
    },
    {
        id: ITEM_IDS.hdmiCable,
        name: "HDMI Cable 2m",
        sku: "ELE-CAB-003",
        category: "Electronics",
        unit: "pcs",
        salePrice: 499,
        purchasePrice: 180,
        taxRate: 18,
        hsnCode: "85444290",
        description: "High-speed 4K HDMI 2.0 cable, 2 metres",
        stock: 0,
        lowStockThreshold: 15,
        stockHistory: [
            { date: isoAgo(75), type: "purchase", qty: 100, reason: "Initial stock" },
            { date: isoAgo(50), type: "invoice", qty: -40, reason: "Invoice INV-2501-J2K0" },
            { date: isoAgo(35), type: "invoice", qty: -35, reason: "Invoice INV-2502-L3M4" },
            { date: isoAgo(18), type: "invoice", qty: -25, reason: "Invoice INV-2502-N5O6" },
        ],
    },
    {
        id: ITEM_IDS.usbHub,
        name: "USB-C Hub 7-in-1",
        sku: "ELE-HUB-004",
        category: "Electronics",
        unit: "pcs",
        salePrice: 2199,
        purchasePrice: 1100,
        taxRate: 18,
        hsnCode: "85172900",
        description: "USB-C 7-in-1 hub: HDMI, USB 3.0x3, SD card, PD charging",
        stock: 28,
        lowStockThreshold: 10,
        stockHistory: [
            { date: isoAgo(70), type: "purchase", qty: 40, reason: "Initial stock" },
            { date: isoAgo(45), type: "invoice", qty: -8, reason: "Invoice INV-2501-P7Q8" },
            { date: isoAgo(20), type: "invoice", qty: -4, reason: "Invoice INV-2502-R9S0" },
        ],
    },
    {
        id: ITEM_IDS.a4Paper,
        name: "A4 Copy Paper (500 sheets)",
        sku: "STA-PAP-001",
        category: "Stationery",
        unit: "ream",
        salePrice: 399,
        purchasePrice: 250,
        taxRate: 12,
        hsnCode: "48025690",
        description: "75 GSM premium quality A4 copy paper, 500 sheets per ream",
        stock: 4,
        lowStockThreshold: 20,
        stockHistory: [
            { date: isoAgo(90), type: "purchase", qty: 200, reason: "Initial stock" },
            { date: isoAgo(65), type: "invoice", qty: -80, reason: "Invoice INV-2501-T1U2" },
            { date: isoAgo(40), type: "invoice", qty: -70, reason: "Invoice INV-2502-V3W4" },
            { date: isoAgo(20), type: "invoice", qty: -46, reason: "Invoice INV-2502-X5Y6" },
        ],
    },
    {
        id: ITEM_IDS.penSet,
        name: "Premium Ballpoint Pen Set (12 pack)",
        sku: "STA-PEN-002",
        category: "Stationery",
        unit: "pack",
        salePrice: 249,
        purchasePrice: 120,
        taxRate: 12,
        hsnCode: "96081010",
        description: "12-pack assorted colour ballpoint pens, 1.0mm tip",
        stock: 65,
        lowStockThreshold: 20,
        stockHistory: [
            { date: isoAgo(85), type: "purchase", qty: 150, reason: "Initial stock" },
            { date: isoAgo(60), type: "invoice", qty: -40, reason: "Invoice INV-2501-Z7A8" },
            { date: isoAgo(30), type: "invoice", qty: -45, reason: "Invoice INV-2502-B9C0" },
        ],
    },
    {
        id: ITEM_IDS.stapler,
        name: "Heavy Duty Stapler",
        sku: "STA-STA-003",
        category: "Stationery",
        unit: "pcs",
        salePrice: 599,
        purchasePrice: 300,
        taxRate: 18,
        hsnCode: "84722090",
        description: "Full-strip heavy duty stapler, capacity 50 sheets",
        stock: 0,
        lowStockThreshold: 8,
        stockHistory: [
            { date: isoAgo(80), type: "purchase", qty: 30, reason: "Initial stock" },
            { date: isoAgo(55), type: "invoice", qty: -18, reason: "Invoice INV-2501-D1E2" },
            { date: isoAgo(35), type: "invoice", qty: -12, reason: "Invoice INV-2502-F3G4" },
        ],
    },
    {
        id: ITEM_IDS.webDesign,
        name: "Website Design & Development",
        sku: "SVC-WEB-001",
        category: "Services",
        unit: "project",
        salePrice: 45000,
        purchasePrice: null,
        taxRate: 18,
        hsnCode: "998314",
        description: "Complete responsive website design and development (up to 10 pages)",
        stock: 99,
        lowStockThreshold: 1,
        stockHistory: [
            { date: isoAgo(90), type: "purchase", qty: 99, reason: "Service capacity" },
            { date: isoAgo(60), type: "invoice", qty: -1, reason: "Invoice INV-2501-H5I6" },
            { date: isoAgo(30), type: "invoice", qty: -1, reason: "Invoice INV-2502-J7K8" },
        ],
    },
    {
        id: ITEM_IDS.seoAudit,
        name: "SEO Audit & Strategy",
        sku: "SVC-SEO-002",
        category: "Services",
        unit: "report",
        salePrice: 12000,
        purchasePrice: null,
        taxRate: 18,
        hsnCode: "998313",
        description: "In-depth SEO audit with keyword strategy and competitor analysis",
        stock: 99,
        lowStockThreshold: 1,
        stockHistory: [
            { date: isoAgo(85), type: "purchase", qty: 99, reason: "Service capacity" },
            { date: isoAgo(45), type: "invoice", qty: -2, reason: "Invoice INV-2502-L9M0" },
        ],
    },
    {
        id: ITEM_IDS.maintenance,
        name: "Annual Maintenance Contract",
        sku: "SVC-AMC-003",
        category: "Services",
        unit: "contract",
        salePrice: 8500,
        purchasePrice: null,
        taxRate: 18,
        hsnCode: "998519",
        description: "12-month hardware maintenance contract including 4 on-site visits",
        stock: 99,
        lowStockThreshold: 1,
        stockHistory: [
            { date: isoAgo(80), type: "purchase", qty: 99, reason: "Service capacity" },
            { date: isoAgo(50), type: "invoice", qty: -3, reason: "Invoice INV-2502-N1O2" },
            { date: isoAgo(20), type: "invoice", qty: -2, reason: "Invoice INV-2503-P3Q4" },
        ],
    },
]

// ─── Invoices ─────────────────────────────────────────────────────────────────

function makeInvoice({
    num, daysAgoIssued, daysAgoDue, customer, invItems, status, notes = "", paymentTerms = "Net 30",
}) {
    const subtotal = invItems.reduce((s, it) => s + it.quantity * it.price, 0)
    const totalTax = invItems.reduce((s, it) => s + it.quantity * it.price * (it.tax / 100), 0)
    return {
        id: uuid(),
        invoiceNumber: num,
        invoiceDate: daysAgo(daysAgoIssued),
        dueDate: daysAgo(daysAgoDue),
        currency: "INR",
        customer,
        items: invItems,
        subtotal: Math.round(subtotal * 100) / 100,
        totalTax: Math.round(totalTax * 100) / 100,
        grandTotal: Math.round((subtotal + totalTax) * 100) / 100,
        notes,
        paymentTerms,
        status,
        createdAt: isoAgo(daysAgoIssued),
    }
}

// Helper to build customer snapshot (as stored on invoice)
function snap(c) {
    return { name: c.name, address: c.billingAddress, gst: c.gstin, phone: c.phone, email: c.email }
}

const invoices = [
    makeInvoice({
        num: "INV-2501-X9A2",
        daysAgoIssued: 130, daysAgoDue: 100,
        customer: snap(customers[0]),
        invItems: [
            { name: "Business Laptop 14\"", quantity: 3, price: 52999, tax: 18, itemId: ITEM_IDS.laptop },
            { name: "USB-C Hub 7-in-1", quantity: 3, price: 2199, tax: 18, itemId: ITEM_IDS.usbHub },
        ],
        status: "paid",
        notes: "Delivered to Bengaluru office. Payment via NEFT confirmed.",
        paymentTerms: "Net 30",
    }),
    makeInvoice({
        num: "INV-2501-B7F4",
        daysAgoIssued: 110, daysAgoDue: 80,
        customer: snap(customers[1]),
        invItems: [
            { name: "A4 Copy Paper (500 sheets)", quantity: 50, price: 399, tax: 12, itemId: ITEM_IDS.a4Paper },
            { name: "Premium Ballpoint Pen Set (12 pack)", quantity: 30, price: 249, tax: 12, itemId: ITEM_IDS.penSet },
        ],
        status: "paid",
        notes: "Monthly stationery supply. Invoice accepted.",
        paymentTerms: "Net 15",
    }),
    makeInvoice({
        num: "INV-2501-D5E6",
        daysAgoIssued: 100, daysAgoDue: 85,
        customer: snap(customers[2]),
        invItems: [
            { name: "Wireless Ergonomic Mouse", quantity: 15, price: 1299, tax: 18, itemId: ITEM_IDS.wirelessMouse },
            { name: "HDMI Cable 2m", quantity: 20, price: 499, tax: 18, itemId: ITEM_IDS.hdmiCable },
        ],
        status: "paid",
        notes: "Bulk order for store chain. Payment cleared.",
        paymentTerms: "Net 45",
    }),
    makeInvoice({
        num: "INV-2501-H5I6",
        daysAgoIssued: 95, daysAgoDue: 65,
        customer: snap(customers[3]),
        invItems: [
            { name: "Website Design & Development", quantity: 1, price: 45000, tax: 18, itemId: ITEM_IDS.webDesign },
        ],
        status: "paid",
        notes: "Project milestone 1 payment.",
        paymentTerms: "50% advance, 50% on delivery",
    }),
    makeInvoice({
        num: "INV-2501-J2K0",
        daysAgoIssued: 88, daysAgoDue: 58,
        customer: snap(customers[0]),
        invItems: [
            { name: "HDMI Cable 2m", quantity: 40, price: 499, tax: 18, itemId: ITEM_IDS.hdmiCable },
            { name: "Annual Maintenance Contract", quantity: 2, price: 8500, tax: 18, itemId: ITEM_IDS.maintenance },
        ],
        status: "paid",
        notes: "Office accessories + AMC renewal.",
        paymentTerms: "Net 30",
    }),
    makeInvoice({
        num: "INV-2501-P7Q8",
        daysAgoIssued: 80, daysAgoDue: 50,
        customer: snap(customers[6]),
        invItems: [
            { name: "USB-C Hub 7-in-1", quantity: 8, price: 2199, tax: 18, itemId: ITEM_IDS.usbHub },
        ],
        status: "paid",
        notes: "Export order. Customs cleared.",
        paymentTerms: "Net 30",
    }),
    makeInvoice({
        num: "INV-2502-C3D1",
        daysAgoIssued: 70, daysAgoDue: 40,
        customer: snap(customers[2]),
        invItems: [
            { name: "Business Laptop 14\"", quantity: 8, price: 52999, tax: 18, itemId: ITEM_IDS.laptop },
            { name: "Wireless Ergonomic Mouse", quantity: 8, price: 1299, tax: 18, itemId: ITEM_IDS.wirelessMouse },
        ],
        status: "paid",
        notes: "Retail store expansion order — paid in full.",
        paymentTerms: "Net 45",
    }),
    makeInvoice({
        num: "INV-2502-F1G7",
        daysAgoIssued: 60, daysAgoDue: 30,
        customer: snap(customers[1]),
        invItems: [
            { name: "Wireless Ergonomic Mouse", quantity: 20, price: 1299, tax: 18, itemId: ITEM_IDS.wirelessMouse },
            { name: "Premium Ballpoint Pen Set (12 pack)", quantity: 45, price: 249, tax: 12, itemId: ITEM_IDS.penSet },
        ],
        status: "paid",
        notes: "Quarterly office supply order.",
        paymentTerms: "Net 15",
    }),
    makeInvoice({
        num: "INV-2502-J7K8",
        daysAgoIssued: 50, daysAgoDue: 20,
        customer: snap(customers[3]),
        invItems: [
            { name: "Website Design & Development", quantity: 1, price: 45000, tax: 18, itemId: ITEM_IDS.webDesign },
            { name: "SEO Audit & Strategy", quantity: 1, price: 12000, tax: 18, itemId: ITEM_IDS.seoAudit },
        ],
        status: "unpaid",
        notes: "Final project delivery. Payment awaited.",
        paymentTerms: "Net 30",
    }),
    makeInvoice({
        num: "INV-2502-L9M0",
        daysAgoIssued: 48, daysAgoDue: 18,
        customer: snap(customers[6]),
        invItems: [
            { name: "SEO Audit & Strategy", quantity: 2, price: 12000, tax: 18, itemId: ITEM_IDS.seoAudit },
            { name: "Annual Maintenance Contract", quantity: 1, price: 8500, tax: 18, itemId: ITEM_IDS.maintenance },
        ],
        status: "unpaid",
        notes: "Digital marketing retainer Q1.",
        paymentTerms: "Net 30",
    }),
    makeInvoice({
        num: "INV-2502-N5O6",
        daysAgoIssued: 45, daysAgoDue: 15,
        customer: snap(customers[0]),
        invItems: [
            { name: "HDMI Cable 2m", quantity: 25, price: 499, tax: 18, itemId: ITEM_IDS.hdmiCable },
            { name: "USB-C Hub 7-in-1", quantity: 4, price: 2199, tax: 18, itemId: ITEM_IDS.usbHub },
        ],
        status: "unpaid",
        notes: "Accessories for new conference rooms.",
        paymentTerms: "Net 30",
    }),
    makeInvoice({
        num: "INV-2502-R9S0",
        daysAgoIssued: 40, daysAgoDue: 10,
        customer: snap(customers[7]),
        invItems: [
            { name: "A4 Copy Paper (500 sheets)", quantity: 46, price: 399, tax: 12, itemId: ITEM_IDS.a4Paper },
            { name: "Heavy Duty Stapler", quantity: 12, price: 599, tax: 18, itemId: ITEM_IDS.stapler },
        ],
        status: "overdue",
        notes: "Monthly stationery. Payment overdue — follow up required.",
        paymentTerms: "Net 15",
    }),
    makeInvoice({
        num: "INV-2502-V3W4",
        daysAgoIssued: 38, daysAgoDue: 8,
        customer: snap(customers[4]),
        invItems: [
            { name: "Annual Maintenance Contract", quantity: 2, price: 8500, tax: 18, itemId: ITEM_IDS.maintenance },
        ],
        status: "overdue",
        notes: "AMC renewal for FY 2025-26. Pending collection.",
        paymentTerms: "Advance 50%, balance on delivery",
    }),
    makeInvoice({
        num: "INV-2503-P3Q4",
        daysAgoIssued: 20, daysAgoDue: -10,
        customer: snap(customers[2]),
        invItems: [
            { name: "Business Laptop 14\"", quantity: 5, price: 52999, tax: 18, itemId: ITEM_IDS.laptop },
            { name: "USB-C Hub 7-in-1", quantity: 5, price: 2199, tax: 18, itemId: ITEM_IDS.usbHub },
            { name: "Wireless Ergonomic Mouse", quantity: 5, price: 1299, tax: 18, itemId: ITEM_IDS.wirelessMouse },
        ],
        status: "unpaid",
        notes: "New store setup equipment package.",
        paymentTerms: "Net 45",
    }),
    makeInvoice({
        num: "INV-2503-Z1A2",
        daysAgoIssued: 8, daysAgoDue: -22,
        customer: snap(customers[1]),
        invItems: [
            { name: "SEO Audit & Strategy", quantity: 1, price: 12000, tax: 18, itemId: ITEM_IDS.seoAudit },
            { name: "Premium Ballpoint Pen Set (12 pack)", quantity: 20, price: 249, tax: 12, itemId: ITEM_IDS.penSet },
        ],
        status: "overdue",
        notes: "Mixed services and supplies order. Overdue — escalate.",
        paymentTerms: "Net 15",
    }),
]

// ─── Public API ───────────────────────────────────────────────────────────────

export function seedDemoData() {
    localStorage.setItem("customers", JSON.stringify(customers))
    localStorage.setItem("items", JSON.stringify(items))
    localStorage.setItem("invoices", JSON.stringify(invoices))
    localStorage.setItem("selected-template", JSON.stringify("professional"))
}

export function clearDemoData() {
    const keys = ["customers", "items", "invoices", "selected-template", "custom-template", "imported-template"]
    keys.forEach((k) => localStorage.removeItem(k))
}
