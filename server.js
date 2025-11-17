const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;
const ORDERS_FILE = path.join(__dirname, "orders.json");
const STATUS_SEQUENCE = [
  "received",
  "preparing",
  "ready",
  "out-for-delivery",
  "completed",
];

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Ensure orders.json exists; if not, create with empty array
async function ensureOrdersFile() {
  try {
    await fs.access(ORDERS_FILE);
  } catch (err) {
    await fs.writeFile(ORDERS_FILE, JSON.stringify([], null, 2), "utf8");
  }
}

function computeOrderTotals(items, providedTotal) {
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const tax = Number((subtotal * 0.05).toFixed(2));
  const deliveryFee = subtotal >= 500 ? 0 : 30;
  const total =
    providedTotal !== undefined
      ? Number(providedTotal)
      : Number((subtotal + tax + deliveryFee).toFixed(2));
  return { subtotal, tax, deliveryFee, total };
}

function buildTimelineEntry(status) {
  return {
    status,
    timestamp: new Date().toISOString(),
  };
}

function deriveOrderNumber(existingCount) {
  return `#${1000 + existingCount + 1}`;
}

// API: create order
app.post("/api/orders", async (req, res) => {
  try {
    const { customer, items, total, notes, paymentMethod } = req.body;

    // Basic validation
    if (!customer || !customer.name || !customer.phone) {
      return res
        .status(400)
        .json({ ok: false, error: "Customer name and phone are required." });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, error: "Cart is empty." });
    }

    await ensureOrdersFile();
    const raw = await fs.readFile(ORDERS_FILE, "utf8");
    const orders = JSON.parse(raw || "[]");

    const status = "received";
    const totals = computeOrderTotals(items, total);
    const order = {
      id: uuidv4(),
      orderNumber: deriveOrderNumber(orders.length),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer,
      items,
      subtotal: totals.subtotal,
      tax: totals.tax,
      deliveryFee: totals.deliveryFee,
      total: totals.total,
      status,
      paymentMethod: paymentMethod || "Cash on Delivery",
      specialInstructions: notes || "",
      timeline: [buildTimelineEntry(status)],
    };

    orders.push(order);
    await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");

    res.json({ ok: true, orderId: order.id, msg: "Order saved." });
  } catch (err) {
    console.error("Failed to save order", err);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

// API: get orders (JSON) — used by admin page
app.get("/api/orders", async (req, res) => {
  try {
    await ensureOrdersFile();
    const raw = await fs.readFile(ORDERS_FILE, "utf8");
    const orders = JSON.parse(raw || "[]");
    res.json({ ok: true, orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Failed to read orders" });
  }
});

// API: update order status
app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res
        .status(400)
        .json({ ok: false, error: "Status is required for update." });
    }
    await ensureOrdersFile();
    const raw = await fs.readFile(ORDERS_FILE, "utf8");
    const orders = JSON.parse(raw || "[]");

    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1) {
      return res.status(404).json({ ok: false, error: "Order not found." });
    }

    orders[idx].status = status;
    orders[idx].updatedAt = new Date().toISOString();
    orders[idx].timeline = Array.isArray(orders[idx].timeline)
      ? [...orders[idx].timeline, buildTimelineEntry(status)]
      : [buildTimelineEntry(status)];

    await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
    res.json({ ok: true, order: orders[idx] });
  } catch (err) {
    console.error("Failed to update order", err);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

// Modern admin dashboard shell
app.get("/admin/orders", async (_req, res) => {
  const html = `
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Orders Management • Cafe Sperl</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      <link rel="stylesheet" href="/css/style.css">
      <style>
        body { background:#f6f4f2; }
        .admin-card { border-radius:18px; border:none; box-shadow:0 20px 45px rgba(15,15,15,0.08); transition:transform .2s ease, box-shadow .2s ease; }
        .admin-card:hover { transform:translateY(-3px); box-shadow:0 25px 55px rgba(15,15,15,0.12); }
        .status-badge { font-size:.85rem; padding:.35rem .75rem; border-radius:999px; }
        .progress-dot { width:14px; height:14px; border-radius:50%; border:2px solid #ddd; display:inline-flex; align-items:center; justify-content:center; margin-right:12px; }
        .progress-dot.active { background: #8B3A3A; border-color:#8B3A3A; }
        .progress-line { flex:1; height:2px; background:#e1dcd7; margin-right:12px; }
        .progress-line.active { background:#8B3A3A; }
        .sidebar-link { padding:0.65rem 1rem; border-radius:12px; text-decoration:none; color:#4a3f35; display:flex; align-items:center; gap:.5rem; }
        .sidebar-link.active, .sidebar-link:hover { background:#f1e4de; color:#8B3A3A; }
        .badge-pill { border-radius:999px; padding:.35rem .65rem; }
        .order-grid { display:flex; flex-direction:column; gap:1.5rem; }
        .bulk-bar { position:sticky; bottom:0; background:#fff; border-top:1px solid #eee; padding:1rem 1.5rem; box-shadow:0 -10px 30px rgba(0,0,0,0.08); display:none; }
        .bulk-bar.active { display:flex; justify-content:space-between; align-items:center; }
      </style>
    </head>
    <body>
      <div id="admin-app" class="container-fluid py-4">
        <div class="row g-4">
          <aside class="col-xl-2 d-none d-xl-block">
            <div class="p-4 rounded-4 shadow-sm bg-white h-100">
              <div class="mb-4">
                <h5 class="mb-0">Cafe Sperl Admin</h5>
                <small class="text-muted">Control Center</small>
              </div>
              <nav class="d-flex flex-column gap-2" aria-label="Admin navigation">
                <a class="sidebar-link" href="#"><span>📊</span>Dashboard</a>
                <a class="sidebar-link active" href="#"><span>🧾</span>Orders</a>
                <a class="sidebar-link" href="#"><span>🍽️</span>Menu Items</a>
                <a class="sidebar-link" href="#"><span>👥</span>Customers</a>
                <a class="sidebar-link" href="#"><span>📈</span>Analytics</a>
                <a class="sidebar-link" href="#"><span>⚙️</span>Settings</a>
              </nav>
            </div>
          </aside>
          <main class="col-12 col-xl-10">
            <div class="bg-white rounded-4 shadow-sm p-4 mb-4">
              <div class="d-flex flex-column flex-lg-row gap-3 align-items-lg-center justify-content-between mb-3">
                <div>
                  <h2 class="mb-1">Orders Management</h2>
                  <p class="text-muted mb-0" id="admin-subtitle">Live overview of every incoming order.</p>
                </div>
                <div class="d-flex flex-wrap gap-2">
                  <select id="dateRangeSelect" class="form-select">
                    <option value="today">Today</option>
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="all">All Time</option>
                  </select>
                  <button class="btn btn-outline-secondary" id="filterPanelBtn">Filters</button>
                  <button class="btn btn-outline-secondary" id="exportBtn">Export CSV</button>
                  <a href="/" class="btn btn-dark">Open Site</a>
                </div>
              </div>
              <div class="row g-3 mb-3">
                <div class="col-lg-6">
                  <input id="orderSearch" class="form-control" placeholder="Search by Order ID, Customer Name, Phone..." />
                </div>
                <div class="col-lg-3">
                  <button class="btn w-100 btn-outline-secondary" id="advancedFiltersToggle">Advanced Filters</button>
                </div>
                <div class="col-lg-3">
                  <select id="sortSelect" class="form-select">
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="high">Highest Amount</option>
                    <option value="low">Lowest Amount</option>
                  </select>
                </div>
              </div>
              <div id="advancedFilters" class="border rounded-4 p-3 bg-light mb-3" style="display:none;">
                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label">From</label>
                    <input type="date" id="filterFrom" class="form-control" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">To</label>
                    <input type="date" id="filterTo" class="form-control" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Payment Method</label>
                    <select id="filterPayment" class="form-select">
                      <option value="all">All</option>
                      <option value="Cash on Delivery">Cash on Delivery</option>
                      <option value="Card">Card</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </div>
                </div>
                <div class="d-flex gap-2 mt-3">
                  <button class="btn btn-outline-secondary" id="resetFilters">Reset</button>
                  <button class="btn btn-dark" id="applyFilters">Apply</button>
                </div>
              </div>
              <div class="row g-3" id="statsRow">
                <div class="col-6 col-lg-3">
                  <div class="p-3 rounded-4 bg-light h-100">
                    <p class="text-muted small mb-1">📊 Total Orders Today</p>
                    <h3 class="mb-0" id="stat-orders">0</h3>
                    <small class="text-success" id="stat-orders-change">+0% vs yesterday</small>
                  </div>
                </div>
                <div class="col-6 col-lg-3">
                  <div class="p-3 rounded-4 bg-light h-100">
                    <p class="text-muted small mb-1">💰 Revenue Today</p>
                    <h3 class="mb-0" id="stat-revenue">₹0</h3>
                    <small class="text-success" id="stat-revenue-change">+0% vs yesterday</small>
                  </div>
                </div>
                <div class="col-6 col-lg-3">
                  <div class="p-3 rounded-4 bg-light h-100">
                    <p class="text-muted small mb-1">⏳ Pending Orders</p>
                    <h3 class="mb-0" id="stat-pending">0</h3>
                  </div>
                </div>
                <div class="col-6 col-lg-3">
                  <div class="p-3 rounded-4 bg-light h-100">
                    <p class="text-muted small mb-1">✅ Completed</p>
                    <h3 class="mb-0" id="stat-completed">0</h3>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-4 shadow-sm p-4 mb-3">
              <div class="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-3">
                <div id="statusTabs" class="d-flex flex-wrap gap-2"></div>
                <div>
                  <label class="form-label me-2 mb-0">Sort by</label>
                  <select id="orderSort" class="form-select d-inline-block w-auto">
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="high">Highest Amount</option>
                    <option value="low">Lowest Amount</option>
                  </select>
                </div>
              </div>
              <div class="order-grid" id="ordersGrid" aria-live="polite"></div>
              <div class="text-center py-5 d-none" id="emptyState">
                <div class="display-4 mb-3">🍽️</div>
                <p class="h5">No orders yet</p>
                <p class="text-muted mb-3">Orders will appear here when customers place them.</p>
                <button class="btn btn-dark" id="refreshBtn">Refresh Page</button>
              </div>
            </div>
          </main>
        </div>
      </div>

      <div class="bulk-bar" id="bulkBar">
        <div>
          <strong id="bulkCount">0</strong> orders selected
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm" id="bulkPrint">Print All</button>
          <button class="btn btn-outline-secondary btn-sm" id="bulkExport">Export Selected</button>
          <button class="btn btn-dark btn-sm" id="bulkPrep">Mark as Preparing</button>
        </div>
      </div>

      <div class="modal fade" id="orderModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="modalTitle">Order Details</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="modalBody"></div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>

      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
      <script src="/js/admin.js"></script>
    </body>
    </html>
  `;
  res.send(html);
});

// Fallback to index
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

// small helper to escape HTML in admin output
function escapeHtml(s = "") {
  return String(s).replace(
    /[&<>"'`]/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
        "`": "&#96;",
      }[c])
  );
}
