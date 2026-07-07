import type { ApiRequestOptions } from './ApiRequestOptions';

// Helper to get item from localStorage with default value
const getStorageItem = <T>(key: string, defaultValue: T): T => {
	const val = localStorage.getItem(key);
	if (!val) return defaultValue;
	try {
		return JSON.parse(val) as T;
	} catch {
		return defaultValue;
	}
};

const setStorageItem = <T>(key: string, value: T): void => {
	localStorage.setItem(key, JSON.stringify(value));
};

// Seed initial data if database is empty
const seedDatabase = (userId: string) => {
	const customerKey = `mock_customers_${userId}`;
	const itemKey = `mock_items_${userId}`;
	const invoiceKey = `mock_invoices_${userId}`;
	const settingsKey = `mock_settings_${userId}`;
	const templateKey = `mock_templates_${userId}`;

	if (!localStorage.getItem(customerKey)) {
		setStorageItem(customerKey, [
			{
				id: "cust_1",
				owner_id: userId,
				name: "Acme Corporation",
				email: "billing@acme.com",
				phone: "+91 98765 43210",
				address: "123 Business Loop, Mumbai",
				billing_address: "123 Business Loop, Mumbai",
				shipping_address: "123 Business Loop, Mumbai",
				gstin: "27AAAAA1111A1Z1",
				opening_balance: 15000,
				credit_limit: 100000,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			},
			{
				id: "cust_2",
				owner_id: userId,
				name: "Zenith Tech Solutions",
				email: "finance@zenith.in",
				phone: "+91 91234 56789",
				address: "456 IT Park, Sector V, Kolkata",
				billing_address: "456 IT Park, Sector V, Kolkata",
				shipping_address: "456 IT Park, Sector V, Kolkata",
				gstin: "19BBBBB2222B2Z2",
				opening_balance: 0,
				credit_limit: 50000,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			}
		]);
	}

	if (!localStorage.getItem(itemKey)) {
		setStorageItem(itemKey, [
			{
				id: "item_1",
				owner_id: userId,
				name: "Web Development Services",
				description: "Custom frontend & backend development consulting",
				category: "Services",
				sku: "SRV-WEB-DEV",
				unit: "hours",
				price: 2500,
				tax_rate: 18,
				stock: 9999,
				low_stock_threshold: 10,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			},
			{
				id: "item_2",
				owner_id: userId,
				name: "UI/UX Design Mockups",
				description: "High fidelity Figma mockups and user flow mapping",
				category: "Services",
				sku: "SRV-UIUX",
				unit: "pcs",
				price: 15000,
				tax_rate: 18,
				stock: 9999,
				low_stock_threshold: 5,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			},
			{
				id: "item_3",
				owner_id: userId,
				name: "Cloud Hosting Management",
				description: "Monthly AWS/GCP server maintenance and scaling",
				category: "Subscriptions",
				sku: "SUB-CLOUD",
				unit: "months",
				price: 8000,
				tax_rate: 18,
				stock: 9999,
				low_stock_threshold: 2,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			}
		]);
	}

	if (!localStorage.getItem(invoiceKey)) {
		setStorageItem(invoiceKey, [
			{
				id: "inv_1",
				owner_id: userId,
				invoice_number: "INV-2026-001",
				document_type: "invoice",
				invoice_date: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString().split('T')[0],
				due_date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString().split('T')[0],
				currency: "INR",
				subtotal: 50000,
				total_tax: 9000,
				grand_total: 59000,
				status: "paid",
				customer_id: "cust_1",
				items: [
					{
						name: "Web Development Services",
						quantity: 20,
						price: 2500,
						tax: 18
					}
				],
				created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
				updated_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
			},
			{
				id: "inv_2",
				owner_id: userId,
				invoice_number: "INV-2026-002",
				document_type: "invoice",
				invoice_date: new Date().toISOString().split('T')[0],
				due_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
				currency: "INR",
				subtotal: 15000,
				total_tax: 2700,
				grand_total: 17700,
				status: "unpaid",
				customer_id: "cust_2",
				items: [
					{
						name: "UI/UX Design Mockups",
						quantity: 1,
						price: 15000,
						tax: 18
					}
				],
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			},
			{
				id: "inv_3",
				owner_id: userId,
				invoice_number: "INV-2026-003",
				document_type: "invoice",
				invoice_date: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString().split('T')[0],
				due_date: new Date(Date.now() - 26 * 24 * 3600 * 1000).toISOString().split('T')[0],
				currency: "INR",
				subtotal: 8000,
				total_tax: 1440,
				grand_total: 9440,
				status: "overdue",
				customer_id: "cust_1",
				items: [
					{
						name: "Cloud Hosting Management",
						quantity: 1,
						price: 8000,
						tax: 18
					}
				],
				created_at: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
				updated_at: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString()
			}
		]);
	}

	if (!localStorage.getItem(settingsKey)) {
		setStorageItem(settingsKey, {
			id: `settings_${userId}`,
			owner_id: userId,
			name: "My Business Ltd",
			email: "info@mybusiness.com",
			phone: "+91 99999 88888",
			invoice_prefix: "INV-",
			quotation_prefix: "QTN-",
			proforma_prefix: "PRO-",
			challan_prefix: "CHL-",
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		});
	}

	if (!localStorage.getItem(templateKey)) {
		setStorageItem(templateKey, [
			{
				id: "template_1",
				owner_id: userId,
				name: "Classic Elegant",
				kind: "built_in",
				is_active: true,
				built_in_id: "classic",
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			}
		]);
	}
};

export interface MockResponse {
	status: number;
	statusText: string;
	data: any;
}

export const handleMockRequest = (options: ApiRequestOptions, url: string): MockResponse | null => {
	// Parse pathname
	let path = url;
	try {
		if (url.startsWith('http')) {
			path = new URL(url).pathname;
		}
	} catch (e) {
		// Ignore
	}

	const method = options.method.toUpperCase();

	// Auth Endpoints
	if (path === '/api/v1/auth/signup' && method === 'POST') {
		const requestBody = options.body as any;
		const users = getStorageItem<any[]>('mock_users', []);
		
		if (users.find(u => u.email === requestBody.email)) {
			return {
				status: 400,
				statusText: 'Bad Request',
				data: { detail: 'Email already registered.' }
			};
		}

		const newUser = {
			id: "usr_" + Math.random().toString(36).substr(2, 9),
			email: requestBody.email,
			full_name: requestBody.full_name || 'Guest User',
			is_active: true,
			is_superuser: false,
			is_verified: true,
			avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(requestBody.full_name || 'Guest')}`,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		};

		users.push(newUser);
		setStorageItem('mock_users', users);
		setStorageItem('mock_current_user', newUser);

		// Seed initial user data
		seedDatabase(newUser.id);

		return {
			status: 200,
			statusText: 'OK',
			data: {
				access_token: 'mock-access-token',
				token_type: 'bearer',
				user: newUser
			}
		};
	}

	if (path === '/api/v1/auth/login' && method === 'POST') {
		const requestBody = options.body as any;
		const users = getStorageItem<any[]>('mock_users', []);
		const user = users.find(u => u.email === requestBody.email);

		if (!user) {
			return {
				status: 400,
				statusText: 'Bad Request',
				data: { detail: 'Incorrect email or password.' }
			};
		}

		setStorageItem('mock_current_user', user);
		seedDatabase(user.id);

		return {
			status: 200,
			statusText: 'OK',
			data: {
				access_token: 'mock-access-token',
				token_type: 'bearer',
				user
			}
		};
	}

	if (path === '/api/v1/auth/logout' && method === 'POST') {
		localStorage.removeItem('mock_current_user');
		return {
			status: 200,
			statusText: 'OK',
			data: { message: 'Logged out successfully.' }
		};
	}

	if (path === '/api/v1/auth/me') {
		const currentUser = getStorageItem<any>('mock_current_user', null);
		if (!currentUser) {
			return {
				status: 401,
				statusText: 'Unauthorized',
				data: { detail: 'Not authenticated' }
			};
		}

		if (method === 'GET') {
			return {
				status: 200,
				statusText: 'OK',
				data: currentUser
			};
		}

		if (method === 'PATCH') {
			const requestBody = options.body as any;
			const updatedUser = {
				...currentUser,
				...requestBody,
				updated_at: new Date().toISOString()
			};

			const users = getStorageItem<any[]>('mock_users', []);
			const index = users.findIndex(u => u.id === currentUser.id);
			if (index !== -1) {
				users[index] = updatedUser;
				setStorageItem('mock_users', users);
			}

			setStorageItem('mock_current_user', updatedUser);
			return {
				status: 200,
				statusText: 'OK',
				data: updatedUser
			};
		}
	}

	// For all subsequent endpoints, require authenticated user
	const currentUser = getStorageItem<any>('mock_current_user', null);
	if (!currentUser) {
		// Bypass health check endpoints
		if (path === '/health') {
			return {
				status: 200,
				statusText: 'OK',
				data: 'ok'
			};
		}
		return {
			status: 401,
			statusText: 'Unauthorized',
			data: { detail: 'Not authenticated' }
		};
	}

	const userId = currentUser.id;
	const customerKey = `mock_customers_${userId}`;
	const itemKey = `mock_items_${userId}`;
	const invoiceKey = `mock_invoices_${userId}`;
	const settingsKey = `mock_settings_${userId}`;
	const templateKey = `mock_templates_${userId}`;

	// Company Settings Endpoints
	if (path === '/api/v1/company-settings/') {
		const settings = getStorageItem<any>(settingsKey, {
			id: `settings_${userId}`,
			owner_id: userId,
			name: "My Business Ltd",
			email: currentUser.email,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		});

		if (method === 'GET') {
			return {
				status: 200,
				statusText: 'OK',
				data: settings
			};
		}

		if (method === 'POST' || method === 'PUT') {
			const requestBody = options.body as any;
			const updatedSettings = {
				...settings,
				...requestBody,
				updated_at: new Date().toISOString()
			};
			setStorageItem(settingsKey, updatedSettings);
			return {
				status: 200,
				statusText: 'OK',
				data: updatedSettings
			};
		}
	}

	// Customers Endpoints
	if (path === '/api/v1/customers/') {
		const customers = getStorageItem<any[]>(customerKey, []);

		if (method === 'GET') {
			return {
				status: 200,
				statusText: 'OK',
				data: {
					data: customers,
					count: customers.length
				}
			};
		}

		if (method === 'POST') {
			const requestBody = options.body as any;
			const newCustomer = {
				...requestBody,
				id: "cust_" + Math.random().toString(36).substr(2, 9),
				owner_id: userId,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			};
			customers.push(newCustomer);
			setStorageItem(customerKey, customers);
			return {
				status: 200,
				statusText: 'OK',
				data: newCustomer
			};
		}
	}

	if (path.startsWith('/api/v1/customers/')) {
		const id = path.split('/').filter(Boolean).pop();
		const customers = getStorageItem<any[]>(customerKey, []);
		const index = customers.findIndex(c => c.id === id);

		if (index === -1) {
			return { status: 404, statusText: 'Not Found', data: { detail: 'Customer not found' } };
		}

		if (method === 'GET') {
			return { status: 200, statusText: 'OK', data: customers[index] };
		}

		if (method === 'PUT') {
			const requestBody = options.body as any;
			const updatedCustomer = {
				...customers[index],
				...requestBody,
				updated_at: new Date().toISOString()
			};
			customers[index] = updatedCustomer;
			setStorageItem(customerKey, customers);
			return { status: 200, statusText: 'OK', data: updatedCustomer };
		}

		if (method === 'DELETE') {
			customers.splice(index, 1);
			setStorageItem(customerKey, customers);
			return { status: 204, statusText: 'No Content', data: null };
		}
	}

	// Items Endpoints
	if (path === '/api/v1/items/categories/list' && method === 'GET') {
		const items = getStorageItem<any[]>(itemKey, []);
		const categories = Array.from(new Set(items.map(i => i.category).filter(Boolean)));
		return {
			status: 200,
			statusText: 'OK',
			data: categories
		};
	}

	if (path === '/api/v1/items/') {
		const items = getStorageItem<any[]>(itemKey, []);

		if (method === 'GET') {
			return {
				status: 200,
				statusText: 'OK',
				data: {
					data: items,
					count: items.length
				}
			};
		}

		if (method === 'POST') {
			const requestBody = options.body as any;
			const newItem = {
				...requestBody,
				id: "item_" + Math.random().toString(36).substr(2, 9),
				owner_id: userId,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			};
			items.push(newItem);
			setStorageItem(itemKey, items);
			return {
				status: 200,
				statusText: 'OK',
				data: newItem
			};
		}
	}

	if (path.startsWith('/api/v1/items/')) {
		const parts = path.split('/').filter(Boolean);
		const id = parts[3]; // format: api/v1/items/{id}
		const items = getStorageItem<any[]>(itemKey, []);
		const index = items.findIndex(i => i.id === id);

		if (index === -1) {
			return { status: 404, statusText: 'Not Found', data: { detail: 'Item not found' } };
		}

		if (parts.length > 4 && parts[4] === 'adjust-stock' && method === 'POST') {
			const requestBody = options.body as any;
			const currentStock = items[index].stock || 0;
			const adjustedStock = currentStock + (requestBody.adjustment || 0);
			items[index].stock = adjustedStock;
			
			// Log stock history
			items[index].stock_history = items[index].stock_history || [];
			items[index].stock_history.push({
				date: new Date().toISOString(),
				adjustment: requestBody.adjustment,
				notes: requestBody.notes || 'Manual Adjustment',
				resulting_stock: adjustedStock
			});

			items[index].updated_at = new Date().toISOString();
			setStorageItem(itemKey, items);
			return { status: 200, statusText: 'OK', data: items[index] };
		}

		if (method === 'GET') {
			return { status: 200, statusText: 'OK', data: items[index] };
		}

		if (method === 'PUT') {
			const requestBody = options.body as any;
			const updatedItem = {
				...items[index],
				...requestBody,
				updated_at: new Date().toISOString()
			};
			items[index] = updatedItem;
			setStorageItem(itemKey, items);
			return { status: 200, statusText: 'OK', data: updatedItem };
		}

		if (method === 'DELETE') {
			items.splice(index, 1);
			setStorageItem(itemKey, items);
			return { status: 204, statusText: 'No Content', data: null };
		}
	}

	// Invoices Stats
	if (path === '/api/v1/invoices/stats' && method === 'GET') {
		const invoices = getStorageItem<any[]>(invoiceKey, []);
		const customers = getStorageItem<any[]>(customerKey, []);

		const total_invoices = invoices.length;
		const paid_count = invoices.filter(i => i.status === 'paid').length;
		const unpaid_count = invoices.filter(i => i.status === 'unpaid').length;
		const overdue_count = invoices.filter(i => i.status === 'overdue').length;
		const total_customers = customers.length;
		const total_revenue = invoices
			.filter(i => i.status === 'paid')
			.reduce((sum, i) => sum + (i.grand_total || 0), 0);

		return {
			status: 200,
			statusText: 'OK',
			data: {
				total_invoices,
				paid_count,
				unpaid_count,
				overdue_count,
				total_customers,
				total_revenue
			}
		};
	}

	// Invoices Endpoints
	if (path === '/api/v1/invoices/') {
		const invoices = getStorageItem<any[]>(invoiceKey, []);

		if (method === 'GET') {
			return {
				status: 200,
				statusText: 'OK',
				data: {
					data: invoices,
					count: invoices.length
				}
			};
		}

		if (method === 'POST') {
			const requestBody = options.body as any;
			const newInvoice = {
				...requestBody,
				id: "inv_" + Math.random().toString(36).substr(2, 9),
				owner_id: userId,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			};
			invoices.push(newInvoice);
			setStorageItem(invoiceKey, invoices);
			return {
				status: 200,
				statusText: 'OK',
				data: newInvoice
			};
		}
	}

	if (path.startsWith('/api/v1/invoices/')) {
		const parts = path.split('/').filter(Boolean);
		const id = parts[3]; // format: api/v1/invoices/{id}
		const invoices = getStorageItem<any[]>(invoiceKey, []);
		const index = invoices.findIndex(i => i.id === id);

		if (index === -1) {
			return { status: 404, statusText: 'Not Found', data: { detail: 'Invoice not found' } };
		}

		// Email, Whatsapp, Reminder endpoints
		if (parts.length > 4) {
			const action = parts[4];
			if (action === 'send-email' || action === 'send-whatsapp' || action === 'send-reminder') {
				return {
					status: 200,
					statusText: 'OK',
					data: { message: `Invoice action '${action}' completed successfully.` }
				};
			}
		}

		if (method === 'GET') {
			const invoice = invoices[index];
			const customers = getStorageItem<any[]>(customerKey, []);
			const customer = customers.find(c => c.id === invoice.customer_id) || null;
			return {
				status: 200,
				statusText: 'OK',
				data: {
					...invoice,
					customer
				}
			};
		}

		if (method === 'PUT') {
			const requestBody = options.body as any;
			const updatedInvoice = {
				...invoices[index],
				...requestBody,
				updated_at: new Date().toISOString()
			};
			invoices[index] = updatedInvoice;
			setStorageItem(invoiceKey, invoices);
			return { status: 200, statusText: 'OK', data: updatedInvoice };
		}

		if (method === 'DELETE') {
			invoices.splice(index, 1);
			setStorageItem(invoiceKey, invoices);
			return { status: 204, statusText: 'No Content', data: null };
		}
	}

	// Templates Endpoints
	if (path === '/api/v1/invoice-templates/') {
		const templates = getStorageItem<any[]>(templateKey, []);
		if (method === 'GET') {
			return {
				status: 200,
				statusText: 'OK',
				data: {
					data: templates,
					count: templates.length
				}
			};
		}
	}

	if (path === '/api/v1/invoice-templates/active' && method === 'GET') {
		const templates = getStorageItem<any[]>(templateKey, []);
		const active = templates.find(t => t.is_active) || templates[0] || null;
		return {
			status: 200,
			statusText: 'OK',
			data: active
		};
	}

	// Catch-all mock handler for other common routes to avoid network crashes
	if (path.startsWith('/api/v1/')) {
		return {
			status: 200,
			statusText: 'OK',
			data: { data: [], count: 0 }
		};
	}

	return null;
};
