// ─────────────────────────────────────────────
//  Supply Chain Portal — API Bridge
//  Backend: http://localhost:3000  (your backend)
//  Mirrors window.supplyChainAPI pattern for all pages
// ─────────────────────────────────────────────

const API_BASE = 'http://localhost:3000';

// ── Auth token (stored in localStorage) ──────
const getToken = () => localStorage.getItem('sc_token') || '';
const setToken = (t) => localStorage.setItem('sc_token', t);
const clearToken = () => localStorage.removeItem('sc_token');

// ── Core fetch ────────────────────────────────
const apiFetch = async (endpoint, options = {}) => {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
        if (response.status === 401) {
            // Token expired — redirect to login
            clearToken();
            window.location.href = 'login.html';
            return null;
        }
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || `HTTP ${response.status}`);
        }
        // DELETE returns 204 no content
        if (response.status === 204) return true;
        return await response.json();
    } catch (error) {
        console.error(`API error [${endpoint}]:`, error.message);
        return null;
    }
};

// ── Utilities ─────────────────────────────────
const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);

const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getStatusBadgeClass = (status) => {
    if (!status) return 'warning';
    const s = status.toUpperCase();
    if (s === 'DELIVERED') return 'success';
    if (s === 'SHIPPED')   return 'info';
    if (s === 'PENDING')   return 'warning';
    if (s === 'CANCELLED') return 'danger';
    return 'warning';
};

const getEmptyStateHTML = (colspan, message) => `
    <tr>
        <td colspan="${colspan}" style="text-align:center; padding:40px; color:var(--text-secondary);">
            <i class='bx bx-data' style="font-size:36px; display:block; margin-bottom:10px; opacity:0.4;"></i>
            ${message}
        </td>
    </tr>`;

// ── Public API ────────────────────────────────
window.supplyChainAPI = {

    // AUTH
    login: async (email, password) => {
        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!res.ok) return null;
            const data = await res.json();
            if (data.token) setToken(data.token);
            return data;
        } catch { return null; }
    },
    logout: () => {
        clearToken();
        window.location.href = 'login.html';
    },
    isLoggedIn: () => !!getToken(),

    // STATS (computed from existing endpoints)
    getStats: async () => {
        const [orders, customers, products, suppliers, warehouses, inventory] = await Promise.all([
            apiFetch('/orders').catch(() => []),
            apiFetch('/customers').catch(() => []),
            apiFetch('/products').catch(() => []),
            apiFetch('/suppliers').catch(() => []),
            apiFetch('/warehouses').catch(() => []),
            apiFetch('/inventory').catch(() => []),
        ]);
        const pending = (orders || []).filter(o => o.status === 'PENDING').length;
        const avgCap = warehouses && warehouses.length
            ? Math.round((warehouses || []).reduce((s, w) => s + (w.capacity || 0), 0) / warehouses.length).toLocaleString()
            : '—';
        return {
            orders:    (orders    || []).length,
            customers: (customers || []).length,
            products:  (products  || []).length,
            suppliers: (suppliers || []).length,
            warehouses:(warehouses|| []).length,
            inventory: (inventory || []).length,
            pending,
            avgCapacity: avgCap,
            _raw: { orders, customers, products, suppliers, warehouses, inventory }
        };
    },

    // GETTERS
    getOrders:     () => apiFetch('/orders'),
    getCustomers:  () => apiFetch('/customers'),
    getProducts:   () => apiFetch('/products'),
    getSuppliers:  () => apiFetch('/suppliers'),
    getWarehouses: () => apiFetch('/warehouses'),
    getInventory:  () => apiFetch('/inventory'),

    getOrder:     (id) => apiFetch(`/orders/${id}`),
    getCustomer:  (id) => apiFetch(`/customers/${id}`),
    getProduct:   (id) => apiFetch(`/products/${id}`),
    getSupplier:  (id) => apiFetch(`/suppliers/${id}`),
    getWarehouse: (id) => apiFetch(`/warehouses/${id}`),

    // ORDERS
    createOrder: (data) => apiFetch('/orders', { method: 'POST', body: JSON.stringify(data) }),
    updateOrder: (id, data) => apiFetch(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteOrder: async (id) => { const r = await apiFetch(`/orders/${id}`, { method: 'DELETE' }); return r !== null; },

    // CUSTOMERS
    createCustomer: (data) => apiFetch('/customers', { method: 'POST', body: JSON.stringify(data) }),
    updateCustomer: (id, data) => apiFetch(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteCustomer: async (id) => { const r = await apiFetch(`/customers/${id}`, { method: 'DELETE' }); return r !== null; },

    // PRODUCTS
    createProduct: (data) => apiFetch('/products', { method: 'POST', body: JSON.stringify(data) }),
    updateProduct: (id, data) => apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteProduct: async (id) => { const r = await apiFetch(`/products/${id}`, { method: 'DELETE' }); return r !== null; },

    // SUPPLIERS
    createSupplier: (data) => apiFetch('/suppliers', { method: 'POST', body: JSON.stringify(data) }),
    updateSupplier: (id, data) => apiFetch(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteSupplier: async (id) => { const r = await apiFetch(`/suppliers/${id}`, { method: 'DELETE' }); return r !== null; },

    // WAREHOUSES
    createWarehouse: (data) => apiFetch('/warehouses', { method: 'POST', body: JSON.stringify(data) }),
    updateWarehouse: (id, data) => apiFetch(`/warehouses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteWarehouse: async (id) => { const r = await apiFetch(`/warehouses/${id}`, { method: 'DELETE' }); return r !== null; },

    // INVENTORY
    createInventory: (data) => apiFetch('/inventory', { method: 'POST', body: JSON.stringify(data) }),
    updateInventory: (pid, wid, data) => apiFetch(`/inventory/${pid}/${wid}`, { method: 'PUT', body: JSON.stringify(data) }),

    // UTILS (exposed for inline scripts in each page)
    formatCurrency,
    formatDate,
    getStatusBadgeClass,
    getEmptyStateHTML,
};

// ── Auth Guard ────────────────────────────────
// Pages that are publicly accessible (no login required)
const PUBLIC_PAGES = ['login.html', 'index.html', ''];

document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Redirect unauthenticated users away from protected pages
    if (!PUBLIC_PAGES.includes(currentPage) && !getToken()) {
        window.location.replace('login.html');
        return;
    }

    // Redirect already-logged-in users away from login page
    if (currentPage === 'login.html' && getToken()) {
        window.location.replace('dashboard.html');
        return;
    }

    // ── Nav: auto-set active link ───────────────
    document.querySelectorAll('.nav-item').forEach(item => {
        const href = item.getAttribute('href') || '';
        item.classList.toggle('active', href === currentPage);
    });
});
