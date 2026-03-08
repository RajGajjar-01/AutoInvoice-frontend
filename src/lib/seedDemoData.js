/**
 * seedDemoData.js
 * Writes rich demo data to all AutoInvoice localStorage keys.
 * Call seedDemoData() to load, clearDemoData() to wipe.
 */

function uuid() { return crypto.randomUUID() }
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10) }
function isoAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString() }

// ─── Customers (20 parties) ───────────────────────────────────────────────────
const CID = {
    techSolutions: uuid(), greenEarth: uuid(), starRetail: uuid(), primeLogistics: uuid(),
    bhartiFabrics: uuid(), sunriseElectronics: uuid(), globeImports: uuid(), cityOfficeSupplies: uuid(),
    rajTech: uuid(), deltaManufacturing: uuid(), horizonMedia: uuid(), apexConsulting: uuid(),
    blueWave: uuid(), cosmicPrints: uuid(), freshMart: uuid(), neonDigital: uuid(),
    swiftCargo: uuid(), pinnacleLaw: uuid(), urbanStudio: uuid(), brightFuture: uuid(),
}

const customers = [
    { id: CID.techSolutions, name: "TechSolutions Pvt Ltd", partyType: "customer", email: "accounts@techsolutions.in", phone: "9876543210", whatsapp: "9876543210", billingAddress: "14, Whitefield Industrial Area, Bengaluru, KA 560066", gstin: "29AADCT1234Q1ZX", openingBalance: 15000, creditLimit: 500000, paymentTerms: "Net 30", tags: ["VIP", "IT"], notes: "Preferred payment via NEFT. Send invoice PDF on email before dispatch.", createdAt: isoAgo(180) },
    { id: CID.greenEarth, name: "Green Earth Organics", partyType: "customer", email: "billing@greenearth.co", phone: "9812345678", whatsapp: "9812345678", billingAddress: "Plot 7, Phase 2, Andheri East, Mumbai, MH 400093", gstin: "27BCPFG5678L1ZY", openingBalance: 0, creditLimit: 200000, paymentTerms: "Net 15", tags: ["Organic", "Retail"], notes: "Eco-conscious brand. Provide itemised GST invoice always.", createdAt: isoAgo(150) },
    { id: CID.starRetail, name: "Star Retail Chains", partyType: "customer", email: "finance@starretail.com", phone: "9900112233", billingAddress: "88, Anna Salai, Chennai, TN 600002", gstin: "33ZRTLS9012M1ZA", openingBalance: 25000, creditLimit: 1000000, paymentTerms: "Net 45", tags: ["Bulk", "Retail"], notes: "Bulk orders only. Minimum order value ₹25,000.", createdAt: isoAgo(120) },
    { id: CID.primeLogistics, name: "Prime Logistics & Co", partyType: "customer", email: "ops@primelogistics.in", phone: "9988776655", billingAddress: "Sector 18, Gurugram, HR 122001", gstin: "06PLCAB3456N1ZP", openingBalance: 5000, creditLimit: 300000, paymentTerms: "Net 30", tags: ["Logistics"], notes: "Include freight charges separately on invoice.", createdAt: isoAgo(100) },
    { id: CID.bhartiFabrics, name: "Bharti Fabrics", partyType: "supplier", email: "supply@bhartifabrics.in", phone: "9765432109", billingAddress: "Ring Road, Surat, GJ 395002", gstin: "24BFACT7890P1ZB", openingBalance: 0, paymentTerms: "Advance 50%, balance on delivery", tags: ["Supplier", "Textiles"], notes: "Supplier — place PO at least 10 days in advance.", createdAt: isoAgo(160) },
    { id: CID.sunriseElectronics, name: "Sunrise Electronics", partyType: "supplier", email: "purchase@sunriseelec.in", phone: "9654321098", billingAddress: "Nehru Place, New Delhi, DL 110019", gstin: "07SELEC2345Q1ZS", openingBalance: 0, paymentTerms: "Net 20", tags: ["Supplier", "Electronics"], notes: "Supplier for electronic components. Standard 1-year warranty.", createdAt: isoAgo(130) },
    { id: CID.globeImports, name: "Globe Imports Pvt Ltd", partyType: "both", email: "trade@globeimports.com", phone: "9543210987", billingAddress: "Free Trade Zone, JNPT, Navi Mumbai, MH 400707", gstin: "27GIPL0001R1ZG", openingBalance: 10000, creditLimit: 750000, paymentTerms: "Net 30", tags: ["Import", "B2B"], notes: "B2B – both buys from us and sells raw materials to us.", createdAt: isoAgo(90) },
    { id: CID.cityOfficeSupplies, name: "City Office Supplies", partyType: "both", email: "info@cityoffice.in", phone: "9432109876", billingAddress: "MG Road, Pune, MH 411001", gstin: "27COSPL5678S1ZC", openingBalance: 0, paymentTerms: "Net 45", tags: ["Office", "Stationery"], notes: "Quarterly billing preferred. GST invoice mandatory.", createdAt: isoAgo(70) },
    { id: CID.rajTech, name: "Raj Technology Services", partyType: "customer", email: "billing@rajtech.io", phone: "9321098765", billingAddress: "HITEC City, Hyderabad, TS 500081", gstin: "36RTSVS4321H1ZR", openingBalance: 8000, creditLimit: 400000, paymentTerms: "Net 30", tags: ["IT", "SaaS"], notes: "Monthly retainer client. Auto-invoice on 1st of every month.", createdAt: isoAgo(85) },
    { id: CID.deltaManufacturing, name: "Delta Manufacturing Ltd", partyType: "customer", email: "accounts@deltamfg.in", phone: "9210987654", billingAddress: "MIDC, Pune, MH 411019", gstin: "27DMLTD6789D1ZM", openingBalance: 50000, creditLimit: 2000000, paymentTerms: "Net 60", tags: ["Manufacturing", "VIP"], notes: "Large volume client. Always confirm purchase order before dispatching.", createdAt: isoAgo(200) },
    { id: CID.horizonMedia, name: "Horizon Media Group", partyType: "customer", email: "finance@horizonmedia.in", phone: "9109876543", billingAddress: "Bandra West, Mumbai, MH 400050", gstin: "27HMGRP1111H1ZH", openingBalance: 0, creditLimit: 150000, paymentTerms: "Net 15", tags: ["Media", "Agency"], notes: "Creative agency. Invoices must include project code.", createdAt: isoAgo(55) },
    { id: CID.apexConsulting, name: "Apex Consulting Partners", partyType: "customer", email: "ap@apexconsult.in", phone: "9098765432", billingAddress: "DLF Cyber City, Gurugram, HR 122002", gstin: "06APCPL2222A1ZC", openingBalance: 20000, creditLimit: 600000, paymentTerms: "Net 30", tags: ["Consulting", "Premium"], notes: "Top consulting firm. Priority support and fast invoicing required.", createdAt: isoAgo(40) },
    { id: CID.blueWave, name: "Blue Wave Technologies", partyType: "customer", email: "cfo@bluewave.tech", phone: "8987654321", billingAddress: "Electronic City, Bengaluru, KA 560100", gstin: "29BWT3333B1ZB", openingBalance: 0, creditLimit: 300000, paymentTerms: "Net 30", tags: ["Tech", "Startup"], notes: "Fast-growing startup. Prefers digital-first communication.", createdAt: isoAgo(30) },
    { id: CID.cosmicPrints, name: "Cosmic Prints & Packaging", partyType: "customer", email: "orders@cosmicprints.co", phone: "8876543210", billingAddress: "Industrial Area, Ahmedabad, GJ 382481", gstin: "24CPPKG4444C1ZP", openingBalance: 3000, creditLimit: 100000, paymentTerms: "Net 20", tags: ["Printing", "MSME"], notes: "Packaging supplier. Order must be placed 7 days before due date.", createdAt: isoAgo(65) },
    { id: CID.freshMart, name: "FreshMart Retail Pvt Ltd", partyType: "customer", email: "billing@freshmart.in", phone: "8765432109", billingAddress: "Koramangala, Bengaluru, KA 560034", gstin: "29FMRTL5555F1ZF", openingBalance: 12000, creditLimit: 250000, paymentTerms: "Net 15", tags: ["Retail", "FMCG"], notes: "High frequency orders. Maintain running account.", createdAt: isoAgo(110) },
    { id: CID.neonDigital, name: "Neon Digital Studio", partyType: "customer", email: "hello@neondigital.in", phone: "8654321098", billingAddress: "HSR Layout, Bengaluru, KA 560102", gstin: "29NEONS6666N1ZD", openingBalance: 0, creditLimit: 80000, paymentTerms: "Due on receipt", tags: ["Design", "Agency"], notes: "Creative studio. Invoices must be sent before the 25th.", createdAt: isoAgo(22) },
    { id: CID.swiftCargo, name: "Swift Cargo Solutions", partyType: "supplier", email: "ops@swiftcargo.in", phone: "8543210987", billingAddress: "Jawaharlal Nehru Port, Navi Mumbai, MH 400706", gstin: "27SCARG7777S1ZS", openingBalance: 0, paymentTerms: "Net 10", tags: ["Logistics", "Supplier"], notes: "Freight and customs clearing agent.", createdAt: isoAgo(75) },
    { id: CID.pinnacleLaw, name: "Pinnacle Law Associates", partyType: "customer", email: "billing@pinnaclelaw.in", phone: "8432109876", billingAddress: "Connaught Place, New Delhi, DL 110001", gstin: "07PLAWA8888P1ZL", openingBalance: 5000, creditLimit: 200000, paymentTerms: "Net 30", tags: ["Legal", "Services"], notes: "Law firm. All invoices must be addressed to the firm, not individuals.", createdAt: isoAgo(48) },
    { id: CID.urbanStudio, name: "Urban Studio Architects", partyType: "customer", email: "accounts@urbanstudio.in", phone: "8321098765", billingAddress: "Jubilee Hills, Hyderabad, TS 500033", gstin: "36USARC9999U1ZU", openingBalance: 0, creditLimit: 500000, paymentTerms: "50% advance", tags: ["Architecture", "Design"], notes: "Project-based billing. Payment in tranches.", createdAt: isoAgo(18) },
    { id: CID.brightFuture, name: "Bright Future Edutech", partyType: "customer", email: "finance@brightfuture.edu", phone: "8210987654", billingAddress: "Sector 62, Noida, UP 201309", gstin: "09BFETC0001B1ZE", openingBalance: 0, creditLimit: 150000, paymentTerms: "Net 30", tags: ["EdTech", "Startup"], notes: "EdTech startup. Invoice via portal only.", createdAt: isoAgo(10) },
]

// ─── Items (20 products & services) ──────────────────────────────────────────
const IID = {
    laptop: uuid(), mouse: uuid(), hdmi: uuid(), hub: uuid(), keyboard: uuid(),
    monitor: uuid(), a4Paper: uuid(), penSet: uuid(), stapler: uuid(), notebook: uuid(),
    webDesign: uuid(), seoAudit: uuid(), amc: uuid(), socialMedia: uuid(), cloud: uuid(),
    tshirt: uuid(), printBanner: uuid(), officeChair: uuid(), projector: uuid(), speakerSet: uuid(),
}

const items = [
    { id: IID.laptop, name: "Business Laptop 14\"", sku: "ELE-LAP-001", category: "Electronics", unit: "pcs", salePrice: 52999, purchasePrice: 43000, taxRate: 18, hsnCode: "84713010", description: "14-inch business laptop, Intel Core i5, 16GB RAM, 512GB SSD", stock: 14, lowStockThreshold: 5, stockHistory: [{ date: isoAgo(120), type: "purchase", qty: 30, reason: "Initial stock" }, { date: isoAgo(60), type: "invoice", qty: -10, reason: "Bulk order" }, { date: isoAgo(20), type: "purchase", qty: 10, reason: "Restock" }, { date: isoAgo(5), type: "invoice", qty: -6, reason: "Invoice INV-2503-A1B2" }] },
    { id: IID.mouse, name: "Wireless Ergonomic Mouse", sku: "ELE-MOU-002", category: "Electronics", unit: "pcs", salePrice: 1299, purchasePrice: 750, taxRate: 18, hsnCode: "84716020", description: "2.4GHz wireless optical mouse, ergonomic design", stock: 3, lowStockThreshold: 10, stockHistory: [{ date: isoAgo(110), type: "purchase", qty: 80, reason: "Initial stock" }, { date: isoAgo(70), type: "invoice", qty: -30, reason: "Bulk order" }, { date: isoAgo(40), type: "invoice", qty: -35, reason: "Order" }, { date: isoAgo(10), type: "invoice", qty: -12, reason: "Invoice" }] },
    { id: IID.hdmi, name: "HDMI Cable 2m", sku: "ELE-CAB-003", category: "Electronics", unit: "pcs", salePrice: 499, purchasePrice: 180, taxRate: 18, hsnCode: "85444290", description: "High-speed 4K HDMI 2.0 cable, 2 metres", stock: 0, lowStockThreshold: 20, stockHistory: [{ date: isoAgo(100), type: "purchase", qty: 150, reason: "Initial stock" }, { date: isoAgo(60), type: "invoice", qty: -80, reason: "Order" }, { date: isoAgo(30), type: "invoice", qty: -70, reason: "Bulk" }] },
    { id: IID.hub, name: "USB-C Hub 7-in-1", sku: "ELE-HUB-004", category: "Electronics", unit: "pcs", salePrice: 2199, purchasePrice: 1100, taxRate: 18, hsnCode: "85172900", description: "USB-C 7-in-1 hub: HDMI, USB 3.0x3, SD card, PD charging", stock: 32, lowStockThreshold: 10, stockHistory: [{ date: isoAgo(90), type: "purchase", qty: 60, reason: "Initial stock" }, { date: isoAgo(45), type: "invoice", qty: -20, reason: "Order" }, { date: isoAgo(15), type: "purchase", qty: 15, reason: "Restock" }] },
    { id: IID.keyboard, name: "Mechanical Wireless Keyboard", sku: "ELE-KEY-005", category: "Electronics", unit: "pcs", salePrice: 3499, purchasePrice: 2200, taxRate: 18, hsnCode: "84716010", description: "Compact tenkeyless wireless mechanical keyboard, blue switches", stock: 18, lowStockThreshold: 8, stockHistory: [{ date: isoAgo(80), type: "purchase", qty: 30, reason: "Initial stock" }, { date: isoAgo(40), type: "invoice", qty: -12, reason: "Order" }] },
    { id: IID.monitor, name: "27\" 4K IPS Monitor", sku: "ELE-MON-006", category: "Electronics", unit: "pcs", salePrice: 28999, purchasePrice: 22000, taxRate: 18, hsnCode: "85285990", description: "27-inch 4K UHD IPS panel, 60Hz, USB-C, HDR400", stock: 7, lowStockThreshold: 3, stockHistory: [{ date: isoAgo(70), type: "purchase", qty: 15, reason: "Initial stock" }, { date: isoAgo(30), type: "invoice", qty: -8, reason: "Order" }] },
    { id: IID.a4Paper, name: "A4 Copy Paper (500 sheets)", sku: "STA-PAP-001", category: "Stationery", unit: "ream", salePrice: 399, purchasePrice: 250, taxRate: 12, hsnCode: "48025690", description: "75 GSM premium quality A4 copy paper, 500 sheets per ream", stock: 4, lowStockThreshold: 20, stockHistory: [{ date: isoAgo(130), type: "purchase", qty: 300, reason: "Initial stock" }, { date: isoAgo(80), type: "invoice", qty: -120, reason: "Order" }, { date: isoAgo(40), type: "invoice", qty: -100, reason: "Bulk" }, { date: isoAgo(15), type: "invoice", qty: -76, reason: "Order" }] },
    { id: IID.penSet, name: "Premium Ballpoint Pen Set (12 pack)", sku: "STA-PEN-002", category: "Stationery", unit: "pack", salePrice: 249, purchasePrice: 120, taxRate: 12, hsnCode: "96081010", description: "12-pack assorted colour ballpoint pens, 1.0mm tip", stock: 82, lowStockThreshold: 20, stockHistory: [{ date: isoAgo(120), type: "purchase", qty: 200, reason: "Initial stock" }, { date: isoAgo(60), type: "invoice", qty: -80, reason: "Order" }, { date: isoAgo(25), type: "invoice", qty: -38, reason: "Order" }] },
    { id: IID.stapler, name: "Heavy Duty Stapler", sku: "STA-STA-003", category: "Stationery", unit: "pcs", salePrice: 599, purchasePrice: 300, taxRate: 18, hsnCode: "84722090", description: "Full-strip heavy duty stapler, capacity 50 sheets", stock: 0, lowStockThreshold: 8, stockHistory: [{ date: isoAgo(110), type: "purchase", qty: 40, reason: "Initial stock" }, { date: isoAgo(55), type: "invoice", qty: -25, reason: "Order" }, { date: isoAgo(20), type: "invoice", qty: -15, reason: "Order" }] },
    { id: IID.notebook, name: "Executive Hardbound Notebook A5", sku: "STA-NTB-004", category: "Stationery", unit: "pcs", salePrice: 349, purchasePrice: 180, taxRate: 12, hsnCode: "48201000", description: "200-page A5 hardbound notebook, ruled, elastic band closure", stock: 55, lowStockThreshold: 15, stockHistory: [{ date: isoAgo(90), type: "purchase", qty: 100, reason: "Initial stock" }, { date: isoAgo(45), type: "invoice", qty: -45, reason: "Order" }] },
    { id: IID.webDesign, name: "Website Design & Development", sku: "SVC-WEB-001", category: "Services", unit: "project", salePrice: 45000, purchasePrice: null, taxRate: 18, hsnCode: "998314", description: "Complete responsive website design and development (up to 10 pages)", stock: 99, lowStockThreshold: 1, stockHistory: [{ date: isoAgo(180), type: "purchase", qty: 99, reason: "Service capacity" }, { date: isoAgo(90), type: "invoice", qty: -3, reason: "Projects delivered" }, { date: isoAgo(30), type: "invoice", qty: -2, reason: "Projects" }] },
    { id: IID.seoAudit, name: "SEO Audit & Strategy", sku: "SVC-SEO-002", category: "Services", unit: "report", salePrice: 12000, purchasePrice: null, taxRate: 18, hsnCode: "998313", description: "In-depth SEO audit with keyword strategy and competitor analysis", stock: 99, lowStockThreshold: 1, stockHistory: [{ date: isoAgo(150), type: "purchase", qty: 99, reason: "Service capacity" }, { date: isoAgo(60), type: "invoice", qty: -5, reason: "Reports delivered" }] },
    { id: IID.amc, name: "Annual Maintenance Contract", sku: "SVC-AMC-003", category: "Services", unit: "contract", salePrice: 8500, purchasePrice: null, taxRate: 18, hsnCode: "998519", description: "12-month hardware maintenance contract including 4 on-site visits", stock: 99, lowStockThreshold: 1, stockHistory: [{ date: isoAgo(160), type: "purchase", qty: 99, reason: "Service capacity" }, { date: isoAgo(80), type: "invoice", qty: -6, reason: "Contracts signed" }, { date: isoAgo(25), type: "invoice", qty: -3, reason: "Renewals" }] },
    { id: IID.socialMedia, name: "Social Media Management (Monthly)", sku: "SVC-SMM-004", category: "Services", unit: "month", salePrice: 15000, purchasePrice: null, taxRate: 18, hsnCode: "998361", description: "End-to-end social media management: content, posting, analytics", stock: 99, lowStockThreshold: 1, stockHistory: [{ date: isoAgo(120), type: "purchase", qty: 99, reason: "Service capacity" }, { date: isoAgo(60), type: "invoice", qty: -4, reason: "Months delivered" }] },
    { id: IID.cloud, name: "Cloud Hosting (Annual Plan)", sku: "SVC-CLD-005", category: "Services", unit: "year", salePrice: 18000, purchasePrice: null, taxRate: 18, hsnCode: "998315", description: "Annual cloud hosting plan: 50GB storage, SSL, daily backups", stock: 99, lowStockThreshold: 1, stockHistory: [{ date: isoAgo(100), type: "purchase", qty: 99, reason: "Service capacity" }, { date: isoAgo(40), type: "invoice", qty: -4, reason: "Subscriptions" }] },
    { id: IID.tshirt, name: "Custom Printed T-Shirt", sku: "PRN-TSH-001", category: "Printing", unit: "pcs", salePrice: 299, purchasePrice: 150, taxRate: 5, hsnCode: "61091000", description: "100% cotton custom printed t-shirt with logo, min order 50 pcs", stock: 200, lowStockThreshold: 50, stockHistory: [{ date: isoAgo(60), type: "purchase", qty: 500, reason: "Bulk stock" }, { date: isoAgo(30), type: "invoice", qty: -300, reason: "Corporate order" }] },
    { id: IID.printBanner, name: "Flex Banner Printing (10x4 ft)", sku: "PRN-BNR-002", category: "Printing", unit: "pcs", salePrice: 850, purchasePrice: 400, taxRate: 5, hsnCode: "39206200", description: "High-resolution flex banner printing, UV resistant ink, 10x4 ft", stock: 45, lowStockThreshold: 10, stockHistory: [{ date: isoAgo(50), type: "purchase", qty: 80, reason: "Stock" }, { date: isoAgo(20), type: "invoice", qty: -35, reason: "Event orders" }] },
    { id: IID.officeChair, name: "Ergonomic Office Chair", sku: "FUR-CHR-001", category: "Furniture", unit: "pcs", salePrice: 12500, purchasePrice: 8000, taxRate: 18, hsnCode: "94013000", description: "Adjustable lumbar support, mesh back, 5-star base, armrests", stock: 12, lowStockThreshold: 3, stockHistory: [{ date: isoAgo(90), type: "purchase", qty: 20, reason: "Initial stock" }, { date: isoAgo(35), type: "invoice", qty: -8, reason: "Office setup order" }] },
    { id: IID.projector, name: "Full HD Business Projector", sku: "ELE-PRJ-007", category: "Electronics", unit: "pcs", salePrice: 39999, purchasePrice: 30000, taxRate: 18, hsnCode: "85286100", description: "1080p FHD projector, 3500 lumens, HDMI, wireless connectivity", stock: 5, lowStockThreshold: 2, stockHistory: [{ date: isoAgo(75), type: "purchase", qty: 10, reason: "Initial stock" }, { date: isoAgo(30), type: "invoice", qty: -5, reason: "Conference room orders" }] },
    { id: IID.speakerSet, name: "Conference Speaker System", sku: "ELE-SPK-008", category: "Electronics", unit: "set", salePrice: 8999, purchasePrice: 5500, taxRate: 18, hsnCode: "85182900", description: "2.1 conference speaker system, 80W total output, Bluetooth & 3.5mm", stock: 9, lowStockThreshold: 3, stockHistory: [{ date: isoAgo(65), type: "purchase", qty: 15, reason: "Initial stock" }, { date: isoAgo(25), type: "invoice", qty: -6, reason: "Orders" }] },
]

// ─── Invoice builder ──────────────────────────────────────────────────────────
function snap(c) { return { name: c.name, address: c.billingAddress, gst: c.gstin, phone: c.phone, email: c.email } }
function makeInv({ num, issued, due, customer, lines, status, notes = "", paymentTerms = "Net 30" }) {
    const subtotal = lines.reduce((s, it) => s + it.quantity * it.price, 0)
    const totalTax = lines.reduce((s, it) => s + it.quantity * it.price * (it.tax / 100), 0)
    return { id: uuid(), invoiceNumber: num, invoiceDate: daysAgo(issued), dueDate: daysAgo(due), currency: "INR", customer, items: lines, subtotal: Math.round(subtotal * 100) / 100, totalTax: Math.round(totalTax * 100) / 100, grandTotal: Math.round((subtotal + totalTax) * 100) / 100, notes, paymentTerms, status, createdAt: isoAgo(issued) }
}

// ─── Invoices (25 invoices) ───────────────────────────────────────────────────
const gl = (id, name, qty, price, tax) => ({ itemId: id, name, quantity: qty, price, tax })

const invoices = [
    // Paid invoices (older)
    makeInv({ num: "INV-2501-X9A2", issued: 155, due: 125, customer: snap(customers[0]), status: "paid", paymentTerms: "Net 30", notes: "Delivered to Bengaluru office. NEFT confirmed.", lines: [gl(IID.laptop, "Business Laptop 14\"", 3, 52999, 18), gl(IID.hub, "USB-C Hub 7-in-1", 3, 2199, 18)] }),
    makeInv({ num: "INV-2501-B7F4", issued: 140, due: 125, customer: snap(customers[1]), status: "paid", paymentTerms: "Net 15", notes: "Monthly stationery supply.", lines: [gl(IID.a4Paper, "A4 Copy Paper (500 sheets)", 50, 399, 12), gl(IID.penSet, "Premium Ballpoint Pen Set", 30, 249, 12)] }),
    makeInv({ num: "INV-2501-D5E6", issued: 130, due: 115, customer: snap(customers[2]), status: "paid", paymentTerms: "Net 15", notes: "Bulk order for store chain.", lines: [gl(IID.mouse, "Wireless Ergonomic Mouse", 15, 1299, 18), gl(IID.hdmi, "HDMI Cable 2m", 20, 499, 18)] }),
    makeInv({ num: "INV-2501-H5I6", issued: 125, due: 95, customer: snap(customers[3]), status: "paid", paymentTerms: "50% advance", notes: "Website project milestone 1.", lines: [gl(IID.webDesign, "Website Design & Development", 1, 45000, 18)] }),
    makeInv({ num: "INV-2501-J2K0", issued: 118, due: 88, customer: snap(customers[0]), status: "paid", paymentTerms: "Net 30", notes: "Office accessories + AMC.", lines: [gl(IID.hdmi, "HDMI Cable 2m", 40, 499, 18), gl(IID.amc, "Annual Maintenance Contract", 2, 8500, 18)] }),
    makeInv({ num: "INV-2501-P7Q8", issued: 110, due: 80, customer: snap(customers[6]), status: "paid", paymentTerms: "Net 30", notes: "Export order. Customs cleared.", lines: [gl(IID.hub, "USB-C Hub 7-in-1", 8, 2199, 18)] }),
    makeInv({ num: "INV-2502-C3D1", issued: 100, due: 70, customer: snap(customers[2]), status: "paid", paymentTerms: "Net 30", notes: "Retail store expansion order.", lines: [gl(IID.laptop, "Business Laptop 14\"", 8, 52999, 18), gl(IID.mouse, "Wireless Ergonomic Mouse", 8, 1299, 18)] }),
    makeInv({ num: "INV-2502-F1G7", issued: 90, due: 60, customer: snap(customers[1]), status: "paid", paymentTerms: "Net 15", notes: "Quarterly office supply order.", lines: [gl(IID.mouse, "Wireless Ergonomic Mouse", 20, 1299, 18), gl(IID.penSet, "Premium Ballpoint Pen Set", 45, 249, 12)] }),
    makeInv({ num: "INV-2502-K3L4", issued: 85, due: 55, customer: snap(customers[8]), status: "paid", paymentTerms: "Net 30", notes: "Monthly SEO retainer.", lines: [gl(IID.seoAudit, "SEO Audit & Strategy", 1, 12000, 18), gl(IID.socialMedia, "Social Media Management", 1, 15000, 18)] }),
    makeInv({ num: "INV-2502-M5N6", issued: 80, due: 50, customer: snap(customers[9]), status: "paid", paymentTerms: "Net 60", notes: "Manufacturing unit equipment.", lines: [gl(IID.monitor, "27\" 4K IPS Monitor", 5, 28999, 18), gl(IID.keyboard, "Mechanical Wireless Keyboard", 5, 3499, 18), gl(IID.hub, "USB-C Hub 7-in-1", 5, 2199, 18)] }),
    makeInv({ num: "INV-2502-Q9R0", issued: 75, due: 60, customer: snap(customers[13]), status: "paid", paymentTerms: "Net 20", notes: "Exhibition banners and t-shirts.", lines: [gl(IID.printBanner, "Flex Banner Printing", 20, 850, 5), gl(IID.tshirt, "Custom Printed T-Shirt", 100, 299, 5)] }),
    makeInv({ num: "INV-2502-S1T2", issued: 70, due: 40, customer: snap(customers[10]), status: "paid", paymentTerms: "Net 15", notes: "Website for media campaign.", lines: [gl(IID.webDesign, "Website Design & Development", 1, 45000, 18), gl(IID.cloud, "Cloud Hosting Annual Plan", 1, 18000, 18)] }),
    makeInv({ num: "INV-2502-U3V4", issued: 65, due: 50, customer: snap(customers[14]), status: "paid", paymentTerms: "Net 15", notes: "Monthly stationery bulk.", lines: [gl(IID.a4Paper, "A4 Copy Paper", 80, 399, 12), gl(IID.notebook, "Executive Hardbound Notebook", 40, 349, 12), gl(IID.stapler, "Heavy Duty Stapler", 10, 599, 18)] }),
    makeInv({ num: "INV-2502-W5X6", issued: 55, due: 25, customer: snap(customers[11]), status: "paid", paymentTerms: "Net 30", notes: "Consulting office setup.", lines: [gl(IID.officeChair, "Ergonomic Office Chair", 8, 12500, 18), gl(IID.projector, "Full HD Business Projector", 1, 39999, 18)] }),
    makeInv({ num: "INV-2502-Y7Z8", issued: 50, due: 20, customer: snap(customers[7]), status: "paid", paymentTerms: "Net 45", notes: "Quarterly stationery supply.", lines: [gl(IID.a4Paper, "A4 Copy Paper", 46, 399, 12), gl(IID.stapler, "Heavy Duty Stapler", 12, 599, 18)] }),

    // Unpaid invoices
    makeInv({ num: "INV-2502-J7K8", issued: 45, due: 15, customer: snap(customers[3]), status: "unpaid", paymentTerms: "Net 30", notes: "Final project delivery. Payment awaited.", lines: [gl(IID.webDesign, "Website Design & Development", 1, 45000, 18), gl(IID.seoAudit, "SEO Audit & Strategy", 1, 12000, 18)] }),
    makeInv({ num: "INV-2502-L9M0", issued: 42, due: 12, customer: snap(customers[6]), status: "unpaid", paymentTerms: "Net 30", notes: "Digital marketing retainer Q1.", lines: [gl(IID.seoAudit, "SEO Audit & Strategy", 2, 12000, 18), gl(IID.amc, "Annual Maintenance Contract", 1, 8500, 18)] }),
    makeInv({ num: "INV-2502-N5O6", issued: 38, due: 8, customer: snap(customers[0]), status: "unpaid", paymentTerms: "Net 30", notes: "Accessories for new conference rooms.", lines: [gl(IID.speakerSet, "Conference Speaker System", 3, 8999, 18), gl(IID.hub, "USB-C Hub 7-in-1", 4, 2199, 18)] }),
    makeInv({ num: "INV-2503-A1B2", issued: 25, due: -5, customer: snap(customers[2]), status: "unpaid", paymentTerms: "Net 30", notes: "New store setup equipment package.", lines: [gl(IID.laptop, "Business Laptop 14\"", 5, 52999, 18), gl(IID.hub, "USB-C Hub 7-in-1", 5, 2199, 18), gl(IID.mouse, "Wireless Ergonomic Mouse", 5, 1299, 18)] }),
    makeInv({ num: "INV-2503-C3D4", issued: 18, due: -12, customer: snap(customers[15]), status: "unpaid", paymentTerms: "Due on receipt", notes: "Branding campaign design.", lines: [gl(IID.webDesign, "Website Design & Development", 1, 45000, 18), gl(IID.socialMedia, "Social Media Management", 2, 15000, 18)] }),
    makeInv({ num: "INV-2503-E5F6", issued: 10, due: 20, customer: snap(customers[12]), status: "unpaid", paymentTerms: "Net 30", notes: "IT infrastructure for startup.", lines: [gl(IID.laptop, "Business Laptop 14\"", 2, 52999, 18), gl(IID.monitor, "27\" 4K IPS Monitor", 2, 28999, 18), gl(IID.keyboard, "Mechanical Wireless Keyboard", 2, 3499, 18)] }),

    // Overdue invoices
    makeInv({ num: "INV-2502-R9S0", issued: 60, due: 30, customer: snap(customers[7]), status: "overdue", paymentTerms: "Net 30", notes: "Payment overdue — follow up required.", lines: [gl(IID.a4Paper, "A4 Copy Paper", 46, 399, 12), gl(IID.stapler, "Heavy Duty Stapler", 12, 599, 18)] }),
    makeInv({ num: "INV-2502-V3W4", issued: 52, due: 22, customer: snap(customers[4]), status: "overdue", paymentTerms: "Net 30", notes: "AMC renewal for FY 2025-26. Pending collection.", lines: [gl(IID.amc, "Annual Maintenance Contract", 2, 8500, 18)] }),
    makeInv({ num: "INV-2503-Z1A2", issued: 40, due: 10, customer: snap(customers[1]), status: "overdue", paymentTerms: "Net 15", notes: "Mixed services and supplies. Overdue — escalate.", lines: [gl(IID.seoAudit, "SEO Audit & Strategy", 1, 12000, 18), gl(IID.penSet, "Premium Ballpoint Pen Set", 20, 249, 12)] }),
    makeInv({ num: "INV-2503-G7H8", issued: 35, due: 5, customer: snap(customers[16]), status: "overdue", paymentTerms: "Net 30", notes: "Freight charges for March shipment. Pending.", lines: [gl(IID.amc, "Annual Maintenance Contract", 3, 8500, 18), gl(IID.speakerSet, "Conference Speaker System", 2, 8999, 18)] }),
]

// ─── Data Tables seed ─────────────────────────────────────────────────────────
// We patch tablesStore directly since it's in-memory (not localStorage).
// This is imported and called once per app session.
function seedTablesStore() {
    try {
        // Dynamic import isn't possible here; we store a flag and handle it in tableStore
        // Instead, write to a special localStorage key that tableStore reads on init
        const tables = [
            {
                id: "demo-invoice-tracker",
                name: "Invoice Tracker",
                description: "Track invoices, amounts, and payment status",
                columns: [
                    { name: "Invoice No", type: "Text", mandatory: true, description: "", options: [] },
                    { name: "Client Name", type: "Text", mandatory: true, description: "", options: [] },
                    { name: "Amount", type: "Amount (₹)", mandatory: true, description: "", options: [] },
                    { name: "Issue Date", type: "Date", mandatory: false, description: "", options: [] },
                    { name: "Due Date", type: "Due Date", mandatory: false, description: "", options: [] },
                    { name: "Payment Status", type: "Payment Status", mandatory: false, description: "", options: [] },
                    { name: "Notes", type: "Text", mandatory: false, description: "", options: [] },
                ],
                rows: [
                    { id: uuid(), "Invoice No": "INV-2501-X9A2", "Client Name": "TechSolutions Pvt Ltd", "Amount": "198795", "Issue Date": daysAgo(155), "Due Date": daysAgo(125), "Payment Status": "Paid", "Notes": "NEFT confirmed" },
                    { id: uuid(), "Invoice No": "INV-2501-B7F4", "Client Name": "Green Earth Organics", "Amount": "27402", "Issue Date": daysAgo(140), "Due Date": daysAgo(125), "Payment Status": "Paid", "Notes": "" },
                    { id: uuid(), "Invoice No": "INV-2502-C3D1", "Client Name": "Star Retail Chains", "Amount": "511864", "Issue Date": daysAgo(100), "Due Date": daysAgo(70), "Payment Status": "Paid", "Notes": "Retail expansion" },
                    { id: uuid(), "Invoice No": "INV-2502-J7K8", "Client Name": "Prime Logistics & Co", "Amount": "67620", "Issue Date": daysAgo(45), "Due Date": daysAgo(15), "Payment Status": "Unpaid", "Notes": "Follow up needed" },
                    { id: uuid(), "Invoice No": "INV-2502-R9S0", "Client Name": "City Office Supplies", "Amount": "28614", "Issue Date": daysAgo(60), "Due Date": daysAgo(30), "Payment Status": "Overdue", "Notes": "Escalate immediately" },
                    { id: uuid(), "Invoice No": "INV-2503-A1B2", "Client Name": "Star Retail Chains", "Amount": "329165", "Issue Date": daysAgo(25), "Due Date": daysAgo(-5), "Payment Status": "Unpaid", "Notes": "New store setup" },
                    { id: uuid(), "Invoice No": "INV-2502-V3W4", "Client Name": "Bharti Fabrics", "Amount": "20060", "Issue Date": daysAgo(52), "Due Date": daysAgo(22), "Payment Status": "Overdue", "Notes": "AMC renewal" },
                    { id: uuid(), "Invoice No": "INV-2503-E5F6", "Client Name": "Blue Wave Technologies", "Amount": "191554", "Issue Date": daysAgo(10), "Due Date": daysAgo(-20), "Payment Status": "Unpaid", "Notes": "New client" },
                ],
                reminders: [],
                createdAt: isoAgo(30),
            },
            {
                id: "demo-client-directory",
                name: "Client Directory",
                description: "Manage client contacts and details",
                columns: [
                    { name: "Client Name", type: "Text", mandatory: true, description: "", options: [] },
                    { name: "Email", type: "Text", mandatory: false, description: "", options: [] },
                    { name: "Phone", type: "Text", mandatory: false, description: "", options: [] },
                    { name: "Company", type: "Text", mandatory: false, description: "", options: [] },
                    { name: "City", type: "Text", mandatory: false, description: "", options: [] },
                    { name: "Active", type: "Checkbox", mandatory: false, description: "", options: [] },
                    { name: "Tag", type: "Tag", mandatory: false, description: "", options: [] },
                ],
                rows: [
                    { id: uuid(), "Client Name": "Ravi Kumar", "Email": "ravi.kumar@techsolutions.in", "Phone": "9876543210", "Company": "TechSolutions Pvt Ltd", "City": "Bengaluru", "Active": true, "Tag": "VIP" },
                    { id: uuid(), "Client Name": "Priya Menon", "Email": "priya@greenearth.co", "Phone": "9812345678", "Company": "Green Earth Organics", "City": "Mumbai", "Active": true, "Tag": "High" },
                    { id: uuid(), "Client Name": "Suresh Iyer", "Email": "finance@starretail.com", "Phone": "9900112233", "Company": "Star Retail Chains", "City": "Chennai", "Active": true, "Tag": "Medium" },
                    { id: uuid(), "Client Name": "Anita Sharma", "Email": "ops@primelogistics.in", "Phone": "9988776655", "Company": "Prime Logistics", "City": "Gurugram", "Active": true, "Tag": "High" },
                    { id: uuid(), "Client Name": "Deepak Joshi", "Email": "cfo@bluewave.tech", "Phone": "8987654321", "Company": "Blue Wave Technologies", "City": "Bengaluru", "Active": true, "Tag": "Urgent" },
                    { id: uuid(), "Client Name": "Meena Pillai", "Email": "ap@apexconsult.in", "Phone": "9098765432", "Company": "Apex Consulting", "City": "Gurugram", "Active": true, "Tag": "VIP" },
                    { id: uuid(), "Client Name": "Rahul Desai", "Email": "billing@freshmart.in", "Phone": "8765432109", "Company": "FreshMart Retail", "City": "Bengaluru", "Active": false, "Tag": "Low" },
                    { id: uuid(), "Client Name": "Kavya Nair", "Email": "finance@horizonmedia.in", "Phone": "9109876543", "Company": "Horizon Media Group", "City": "Mumbai", "Active": true, "Tag": "Medium" },
                    { id: uuid(), "Client Name": "Vikram Singh", "Email": "billing@rajtech.io", "Phone": "9321098765", "Company": "Raj Technology Services", "City": "Hyderabad", "Active": true, "Tag": "High" },
                    { id: uuid(), "Client Name": "Pooja Agarwal", "Email": "hello@neondigital.in", "Phone": "8654321098", "Company": "Neon Digital Studio", "City": "Bengaluru", "Active": true, "Tag": "Medium" },
                ],
                reminders: [],
                createdAt: isoAgo(45),
            },
            {
                id: "demo-expense-tracker",
                name: "Business Expenses",
                description: "Log and categorize business expenses",
                columns: [
                    { name: "Date", type: "Date", mandatory: true, description: "", options: [] },
                    { name: "Description", type: "Text", mandatory: true, description: "", options: [] },
                    { name: "Amount", type: "Amount (₹)", mandatory: true, description: "", options: [] },
                    { name: "Category", type: "Dropdown", mandatory: false, description: "", options: ["Travel", "Food", "Office", "Marketing", "Technology", "Other"] },
                    { name: "Paid By", type: "Text", mandatory: false, description: "", options: [] },
                    { name: "Status", type: "Status", mandatory: false, description: "", options: [] },
                ],
                rows: [
                    { id: uuid(), "Date": daysAgo(2), "Description": "Google Ads Campaign - March", "Amount": "25000", "Category": "Marketing", "Paid By": "Company Card", "Status": "Done" },
                    { id: uuid(), "Date": daysAgo(4), "Description": "Office Internet Bill", "Amount": "3500", "Category": "Office", "Paid By": "UPI", "Status": "Done" },
                    { id: uuid(), "Date": daysAgo(6), "Description": "Team Lunch - Q1 Review", "Amount": "4800", "Category": "Food", "Paid By": "Cash", "Status": "Done" },
                    { id: uuid(), "Date": daysAgo(8), "Description": "Bengaluru to Mumbai Flight", "Amount": "8200", "Category": "Travel", "Paid By": "Company Card", "Status": "Done" },
                    { id: uuid(), "Date": daysAgo(10), "Description": "Adobe Creative Cloud Annual", "Amount": "54000", "Category": "Technology", "Paid By": "Company Card", "Status": "Done" },
                    { id: uuid(), "Date": daysAgo(12), "Description": "Printer Cartridges", "Amount": "2200", "Category": "Office", "Paid By": "Petty Cash", "Status": "Done" },
                    { id: uuid(), "Date": daysAgo(15), "Description": "LinkedIn Premium (3 seats)", "Amount": "18000", "Category": "Marketing", "Paid By": "Company Card", "Status": "Done" },
                    { id: uuid(), "Date": daysAgo(18), "Description": "Client Site Visit - Train", "Amount": "1850", "Category": "Travel", "Paid By": "Employee", "Status": "In Progress" },
                    { id: uuid(), "Date": daysAgo(20), "Description": "Figma Annual Plan", "Amount": "12000", "Category": "Technology", "Paid By": "Company Card", "Status": "Done" },
                    { id: uuid(), "Date": daysAgo(22), "Description": "Office Supplies - Amazon", "Amount": "3600", "Category": "Office", "Paid By": "Company Card", "Status": "Done" },
                    { id: uuid(), "Date": daysAgo(25), "Description": "Instagram & Facebook Ads", "Amount": "15000", "Category": "Marketing", "Paid By": "UPI", "Status": "Done" },
                    { id: uuid(), "Date": daysAgo(28), "Description": "Team Offsite - Coorg", "Amount": "42000", "Category": "Travel", "Paid By": "Company Card", "Status": "In Progress" },
                    { id: uuid(), "Date": daysAgo(30), "Description": "Domain Renewal (5 domains)", "Amount": "5500", "Category": "Technology", "Paid By": "UPI", "Status": "Done" },
                    { id: uuid(), "Date": daysAgo(35), "Description": "Business Cards Printing", "Amount": "1800", "Category": "Marketing", "Paid By": "Cash", "Status": "Done" },
                ],
                reminders: [],
                createdAt: isoAgo(60),
            },
            {
                id: "demo-contract-tracker",
                name: "Contract Tracker",
                description: "Track contracts and their expiry dates",
                columns: [
                    { name: "Contract Name", type: "Text", mandatory: true, description: "", options: [] },
                    { name: "Client", type: "Text", mandatory: false, description: "", options: [] },
                    { name: "Start Date", type: "Date", mandatory: false, description: "", options: [] },
                    { name: "Expiry Date", type: "Expiry Date", mandatory: false, description: "", options: [] },
                    { name: "Value", type: "Amount (₹)", mandatory: false, description: "", options: [] },
                    { name: "Status", type: "Status", mandatory: false, description: "", options: [] },
                ],
                rows: [
                    { id: uuid(), "Contract Name": "Annual Website Maintenance", "Client": "TechSolutions Pvt Ltd", "Start Date": daysAgo(365), "Expiry Date": daysAgo(-5), "Value": "120000", "Status": "In Progress" },
                    { id: uuid(), "Contract Name": "SEO Retainer Agreement", "Client": "Green Earth Organics", "Start Date": daysAgo(270), "Expiry Date": daysAgo(90), "Value": "144000", "Status": "Done" },
                    { id: uuid(), "Contract Name": "Cloud Hosting SLA", "Client": "Star Retail Chains", "Start Date": daysAgo(180), "Expiry Date": daysAgo(-185), "Value": "54000", "Status": "In Progress" },
                    { id: uuid(), "Contract Name": "Digital Marketing Retainer", "Client": "Horizon Media Group", "Start Date": daysAgo(120), "Expiry Date": daysAgo(-60), "Value": "360000", "Status": "In Progress" },
                    { id: uuid(), "Contract Name": "IT Support AMC", "Client": "Prime Logistics & Co", "Start Date": daysAgo(90), "Expiry Date": daysAgo(-275), "Value": "102000", "Status": "In Progress" },
                    { id: uuid(), "Contract Name": "Social Media Management", "Client": "Neon Digital Studio", "Start Date": daysAgo(60), "Expiry Date": daysAgo(-120), "Value": "180000", "Status": "Todo" },
                    { id: uuid(), "Contract Name": "ERP Implementation", "Client": "Delta Manufacturing Ltd", "Start Date": daysAgo(45), "Expiry Date": daysAgo(-135), "Value": "850000", "Status": "In Progress" },
                    { id: uuid(), "Contract Name": "Legal Document Automation", "Client": "Pinnacle Law Associates", "Start Date": daysAgo(20), "Expiry Date": daysAgo(-160), "Value": "220000", "Status": "Todo" },
                    { id: uuid(), "Contract Name": "Architecture Project Portal", "Client": "Urban Studio Architects", "Start Date": daysAgo(10), "Expiry Date": daysAgo(-170), "Value": "175000", "Status": "Todo" },
                    { id: uuid(), "Contract Name": "EdTech Platform Dev", "Client": "Bright Future Edutech", "Start Date": daysAgo(3), "Expiry Date": daysAgo(-177), "Value": "320000", "Status": "Blocked" },
                ],
                reminders: [],
                createdAt: isoAgo(20),
            },
        ]
        localStorage.setItem("demo-tables", JSON.stringify(tables))
    } catch (e) {
        console.warn("Could not seed tables store:", e)
    }
}

// ─── Public API ───────────────────────────────────────────────────────────────
export function seedDemoData() {
    localStorage.setItem("customers", JSON.stringify(customers))
    localStorage.setItem("items", JSON.stringify(items))
    localStorage.setItem("invoices", JSON.stringify(invoices))
    localStorage.setItem("selected-template", JSON.stringify("professional"))
    seedTablesStore()
}

export function clearDemoData() {
    const keys = ["customers", "items", "invoices", "selected-template", "custom-template", "imported-template", "demo-tables"]
    keys.forEach((k) => localStorage.removeItem(k))
}
