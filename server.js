const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;
const ORDERS_FILE = path.join(__dirname, "orders.json");

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

// API: create order
app.post("/api/orders", async (req, res) => {
  try {
    const { customer, items, total } = req.body;

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

    const order = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      customer,
      items,
      total: Number(total) || items.reduce((s, it) => s + it.price * it.qty, 0),
      status: "received",
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

// Simple admin HTML page to view orders
app.get("/admin/orders", async (req, res) => {
  try {
    await ensureOrdersFile();
    const raw = await fs.readFile(ORDERS_FILE, "utf8");
    const orders = JSON.parse(raw || "[]");

    // build simple HTML (safe & minimal)
    let html = `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Orders - Cafe Sperl Admin</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      </head>
      <body class="bg-light">
        <div class="container py-4">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>Orders</h1>
            <a href="/" class="btn btn-outline-secondary">Open Site</a>
          </div>
    `;

    if (!orders.length) {
      html += `<div class="alert alert-info">No orders yet.</div>`;
    } else {
      for (const o of orders.slice().reverse()) {
        html += `
          <div class="card mb-3">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h5>Order #${o.id}</h5>
                  <div class="text-muted">Placed: ${new Date(
                    o.createdAt
                  ).toLocaleString()}</div>
                  <div class="mt-2"><strong>${escapeHtml(
                    o.customer.name
                  )}</strong> — ${escapeHtml(o.customer.phone)}</div>
                  <div>${escapeHtml(o.customer.address || "")}</div>
                </div>
                <div class="text-end">
                  <div class="h5">₹${Number(o.total).toFixed(2)}</div>
                  <div class="badge bg-primary mt-2">${escapeHtml(
                    o.status
                  )}</div>
                </div>
              </div>

              <hr/>

              <ul class="list-unstyled mb-0">
                ${o.items
                  .map(
                    (it) => `<li class="py-1">
                    <div class="d-flex justify-content-between">
                      <div><strong>${escapeHtml(it.name)}</strong> × ${
                      it.qty
                    }</div>
                      <div>₹${(it.price * it.qty).toFixed(2)}</div>
                    </div>
                  </li>`
                  )
                  .join("")}
              </ul>
            </div>
          </div>
        `;
      }
    }

    html += `</div></body></html>`;
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
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
