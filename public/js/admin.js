const STATUS_META = {
  received: { label: "Received", color: "#3B82F6" },
  preparing: { label: "Preparing", color: "#F97316" },
  ready: { label: "Ready", color: "#10B981" },
  "out-for-delivery": { label: "Out for Delivery", color: "#8B5CF6" },
  completed: { label: "Completed", color: "#6B7280" },
  cancelled: { label: "Cancelled", color: "#EF4444" },
};

const STATUS_FLOW = [
  "received",
  "preparing",
  "ready",
  "out-for-delivery",
  "completed",
];

let ordersState = [];
let filteredOrders = [];
let statusFilter = "all";
let refreshTimer;
let selectedOrders = new Set();

document.addEventListener("DOMContentLoaded", () => {
  fetchOrders();
  setupControls();
  refreshTimer = setInterval(fetchOrders, 30000);
});

function setupControls() {
  const search = document.getElementById("orderSearch");
  const sortSelect = document.getElementById("sortSelect");
  const orderSort = document.getElementById("orderSort");
  const refreshBtn = document.getElementById("refreshBtn");
  const advancedToggle = document.getElementById("advancedFiltersToggle");
  const advancedPanel = document.getElementById("advancedFilters");
  const applyFilters = document.getElementById("applyFilters");
  const resetFilters = document.getElementById("resetFilters");
  const exportBtn = document.getElementById("exportBtn");
  const bulkPrint = document.getElementById("bulkPrint");
  const bulkExport = document.getElementById("bulkExport");
  const bulkPrep = document.getElementById("bulkPrep");

  if (search) search.addEventListener("input", applyFiltersAndRender);
  if (sortSelect) sortSelect.addEventListener("change", applyFiltersAndRender);
  if (orderSort) orderSort.addEventListener("change", applyFiltersAndRender);
  if (refreshBtn) refreshBtn.addEventListener("click", fetchOrders);
  if (advancedToggle)
    advancedToggle.addEventListener("click", () => {
      advancedPanel.style.display =
        advancedPanel.style.display === "none" ? "block" : "none";
    });
  if (applyFilters) applyFilters.addEventListener("click", applyFiltersAndRender);
  if (resetFilters)
    resetFilters.addEventListener("click", () => {
      ["filterFrom", "filterTo"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });
      const pay = document.getElementById("filterPayment");
      if (pay) pay.value = "all";
      applyFiltersAndRender();
    });
  if (exportBtn) exportBtn.addEventListener("click", exportCSV);
  if (bulkPrint) bulkPrint.addEventListener("click", () => printOrders(true));
  if (bulkExport) bulkExport.addEventListener("click", exportSelected);
  if (bulkPrep)
    bulkPrep.addEventListener("click", () => bulkUpdateStatus("preparing"));
}

async function fetchOrders() {
  try {
    const res = await fetch("/api/orders");
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Failed to fetch");

    const prevIds = new Set(ordersState.map((o) => o.id));
    const newOnes = data.orders.filter((o) => !prevIds.has(o.id));
    ordersState = data.orders
      .map((order) => ({
        ...order,
        items: order.items.map((item) => ({
          name: item.name,
          qty: item.qty ?? item.quantity ?? 1,
          price: item.price,
        })),
      }))
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    renderFilters();
    applyFiltersAndRender();
    if (newOnes.length) {
      announce(`${newOnes.length} new orders received`);
      highlightNewOrders(newOnes.map((o) => o.id));
    }
  } catch (err) {
    console.error(err);
    announce("Failed to load orders", true);
  }
}

function renderFilters() {
  const tabs = document.getElementById("statusTabs");
  if (!tabs) return;

  const counts = ordersState.reduce((acc, order) => {
    const status = order.status || "received";
    acc[status] = (acc[status] || 0) + 1;
    acc.all = (acc.all || 0) + 1;
    return acc;
  }, {});

  const statuses = ["all", ...Object.keys(STATUS_META)];
  tabs.innerHTML = statuses
    .map((key) => {
      const isActive = statusFilter === key;
      const label =
        key === "all" ? "All" : STATUS_META[key]?.label || key.toUpperCase();
      const count = counts[key] || 0;
      const className = isActive ? "btn" : "btn btn-outline-secondary";
      const style = isActive
        ? "background:#8B3A3A;color:#fff;border:none;"
        : "border-color:#8B3A3A;color:#8B3A3A;";
      return `<button type="button" class="${className}" data-status="${key}" style="${style}">${label} (${count})</button>`;
    })
    .join("");

  tabs.querySelectorAll("button").forEach((btn) =>
    btn.addEventListener("click", () => {
      statusFilter = btn.dataset.status;
      renderFilters();
      applyFiltersAndRender();
    })
  );
}

function applyFiltersAndRender() {
  const search = document.getElementById("orderSearch")?.value.toLowerCase() || "";
  const sortValue =
    document.getElementById("sortSelect")?.value ||
    document.getElementById("orderSort")?.value ||
    "newest";

  const from = document.getElementById("filterFrom")?.value;
  const to = document.getElementById("filterTo")?.value;
  const payment = document.getElementById("filterPayment")?.value || "all";

  filteredOrders = ordersState.filter((order) => {
    const matchesStatus =
      statusFilter === "all" || (order.status || "received") === statusFilter;
    const matchesSearch =
      !search ||
      order.id.toLowerCase().includes(search) ||
      (order.orderNumber || "").toLowerCase().includes(search) ||
      order.customer?.name?.toLowerCase().includes(search) ||
      String(order.customer?.phone || "")
        .toLowerCase()
        .includes(search);
    const matchesPayment = payment === "all" || order.paymentMethod === payment;
    const placed = new Date(order.createdAt);
    const matchesFrom = !from || placed >= new Date(from);
    const matchesTo = !to || placed <= new Date(to);
    return matchesStatus && matchesSearch && matchesPayment && matchesFrom && matchesTo;
  });

  switch (sortValue) {
    case "oldest":
      filteredOrders.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      break;
    case "high":
      filteredOrders.sort((a, b) => b.total - a.total);
      break;
    case "low":
      filteredOrders.sort((a, b) => a.total - b.total);
      break;
    default:
      filteredOrders.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  renderStats();
  renderOrders();
}

function renderStats() {
  const today = new Date().toDateString();
  const todayOrders = ordersState.filter(
    (o) => new Date(o.createdAt).toDateString() === today
  );
  const totalToday = todayOrders.length;
  const revenueToday = todayOrders.reduce((s, o) => s + Number(o.total || 0), 0);
  const pending = ordersState.filter(
    (o) => !["completed", "cancelled"].includes(o.status)
  ).length;
  const completed = ordersState.filter((o) => o.status === "completed").length;

  setText("stat-orders", totalToday);
  setText("stat-revenue", formatCurrency(revenueToday));
  setText("stat-pending", pending);
  setText("stat-completed", completed);
}

function renderOrders() {
  const grid = document.getElementById("ordersGrid");
  const empty = document.getElementById("emptyState");
  if (!grid || !empty) return;

  if (!filteredOrders.length) {
    grid.innerHTML = "";
    empty.classList.remove("d-none");
    return;
  }
  empty.classList.add("d-none");

  grid.innerHTML = filteredOrders
    .map((order) => buildOrderCard(order))
    .join("");

  grid.querySelectorAll("[data-action='view']").forEach((btn) =>
    btn.addEventListener("click", (e) =>
      openOrderModal(e.currentTarget.dataset.id)
    )
  );
  grid.querySelectorAll("[data-action='status']").forEach((btn) =>
    btn.addEventListener("click", (e) =>
      updateStatus(e.currentTarget.dataset.id, e.currentTarget.dataset.status)
    )
  );
  grid.querySelectorAll("[data-action='contact']").forEach((btn) =>
    btn.addEventListener("click", (e) => contactCustomer(e.currentTarget.dataset.phone))
  );
  grid.querySelectorAll("[data-action='print']").forEach((btn) =>
    btn.addEventListener("click", (e) => printOrder(e.currentTarget.dataset.id))
  );
  grid.querySelectorAll(".order-checkbox").forEach((checkbox) =>
    checkbox.addEventListener("change", handleBulkSelection)
  );
}

function buildOrderCard(order) {
  const statusMeta = STATUS_META[order.status] || STATUS_META.received;
  const timeline = Array.isArray(order.timeline) ? order.timeline : [];
  const special = order.specialInstructions;
  const address =
    order.customer?.address || order.customer?.addressLine || "Pickup";
  const phone = order.customer?.phone || "N/A";

  const progress = STATUS_FLOW.map((status, idx) => {
    const isActive = STATUS_FLOW.indexOf(order.status) >= idx;
    return `
      <div class="d-flex align-items-center">
        <div class="progress-dot ${isActive ? "active" : ""}" aria-hidden="true"></div>
        ${idx < STATUS_FLOW.length - 1 ? `<div class="progress-line ${isActive ? "active" : ""}"></div>` : ""}
      </div>
    `;
  }).join("");

  return `
    <div class="card admin-card" data-order-id="${order.id}">
      <div class="card-body">
        <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-3">
          <div class="d-flex align-items-center gap-2">
            <input type="checkbox" class="form-check-input order-checkbox" data-id="${order.id}" aria-label="Select order ${order.orderNumber || order.id}">
            <div>
              <div class="text-muted small">Order ID</div>
              <div class="d-flex align-items-center gap-2">
                <code>${order.orderNumber || order.id.slice(0, 10)}...</code>
                <button class="btn btn-sm btn-outline-secondary" onclick="navigator.clipboard.writeText('${order.id}')">Copy</button>
              </div>
            </div>
          </div>
          <div class="text-end">
            <div class="h4 mb-1">${formatCurrency(order.total || 0)}</div>
            <span class="status-badge" style="background:${statusMeta.color}1a; color:${statusMeta.color};">${statusMeta.label}</span>
          </div>
        </div>

        <div class="row g-3 mb-3">
          <div class="col-md-4">
            <div class="text-muted small mb-1">Placed</div>
            <strong>${formatDate(order.createdAt)}</strong>
          </div>
          <div class="col-md-8">
            <div class="d-flex align-items-center">${progress}</div>
          </div>
        </div>

        <div class="row g-3 mb-3">
          <div class="col-md-4">
            <div class="text-muted small mb-1">Customer</div>
            <div><strong>${order.customer?.name || "Walk-in"}</strong></div>
            <a class="text-decoration-none" href="tel:${phone}">${phone}</a>
          </div>
          <div class="col-md-5">
            <div class="text-muted small mb-1">Delivery Address</div>
            <div>${address}</div>
          </div>
          <div class="col-md-3">
            <div class="text-muted small mb-1">Payment</div>
            <div>${order.paymentMethod || "Cash on Delivery"}</div>
          </div>
        </div>

        <div class="mb-3">
          <div class="text-muted small mb-2">Items Ordered</div>
          <ul class="list-unstyled mb-0">
            ${order.items
              .map(
                (item) => `
                  <li class="d-flex justify-content-between border-bottom py-1">
                    <span>${item.name} × ${item.qty}</span>
                    <strong>${formatCurrency(item.price * item.qty)}</strong>
                  </li>
                `
              )
              .join("")}
          </ul>
        </div>

        ${special ? `<div class="p-3 bg-light rounded-4 mb-3"><strong>Special Notes:</strong> <em>${special}</em></div>` : ""}

        <div class="d-flex flex-wrap gap-2">
          <button class="btn btn-outline-secondary btn-sm" data-action="view" data-id="${order.id}">View Details</button>
          ${buildStatusButtons(order)}
          <button class="btn btn-outline-secondary btn-sm" data-action="print" data-id="${order.id}">Print</button>
          <button class="btn btn-outline-secondary btn-sm" data-action="contact" data-phone="${phone}">Contact Customer</button>
        </div>
      </div>
    </div>
  `;
}

function buildStatusButtons(order) {
  const options = STATUS_FLOW.filter((status) => status !== order.status);
  return options
    .slice(0, 2)
    .map(
      (status) => `
        <button class="btn btn-sm" data-action="status" data-id="${order.id}" data-status="${status}" style="background:${STATUS_META[status].color};color:#fff;">
          Mark ${STATUS_META[status].label}
        </button>
      `
    )
    .join("");
}

async function updateStatus(id, status) {
  try {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Failed to update status");
    announce(`Order updated to ${status}`);
    fetchOrders();
  } catch (err) {
    console.error(err);
    announce("Failed to update order", true);
  }
}

function contactCustomer(phone) {
  if (!phone) return;
  window.open(`tel:${phone}`, "_self");
}

function printOrder(id) {
  const order = ordersState.find((o) => o.id === id);
  if (!order) return;
  const content = `
    <div>
      <h2>Order ${order.orderNumber || order.id}</h2>
      <p>${formatDate(order.createdAt)}</p>
      <hr/>
      <p><strong>${order.customer?.name}</strong><br/>${order.customer?.phone}<br/>${order.customer?.address || ""}</p>
      <hr/>
      ${order.items
        .map(
          (item) => `<p>${item.name} × ${item.qty} - ${formatCurrency(item.price * item.qty)}</p>`
        )
        .join("")}
      <hr/>
      <p>Total: ${formatCurrency(order.total || 0)}</p>
      ${order.specialInstructions ? `<p><strong>Notes:</strong> ${order.specialInstructions}</p>` : ""}
    </div>
  `;
  const win = window.open("", "_blank");
  win.document.write(content);
  win.document.close();
  win.print();
}

function printOrders(useSelected = false) {
  const ids = useSelected ? Array.from(selectedOrders) : filteredOrders.map((o) => o.id);
  ids.forEach(printOrder);
}

function openOrderModal(id) {
  const order = ordersState.find((o) => o.id === id);
  if (!order) return;
  const modalBody = document.getElementById("modalBody");
  const modalTitle = document.getElementById("modalTitle");
  if (!modalBody || !modalTitle) return;

  modalTitle.textContent = `Order ${order.orderNumber || order.id}`;
  modalBody.innerHTML = `
    <p><strong>Customer:</strong> ${order.customer?.name} (${order.customer?.phone})</p>
    <p><strong>Address:</strong> ${order.customer?.address || "Pickup"}</p>
    <p><strong>Payment:</strong> ${order.paymentMethod || "Cash on Delivery"}</p>
    <p><strong>Total:</strong> ${formatCurrency(order.total || 0)}</p>
    <hr/>
    <h6>Timeline</h6>
    <ul>
      ${order.timeline
        ?.map(
          (entry) => `<li>${formatDate(entry.timestamp)} — ${STATUS_META[entry.status]?.label || entry.status}</li>`
        )
        .join("") || "<li>No timeline entries</li>"}
    </ul>
  `;
  const modal = new bootstrap.Modal(document.getElementById("orderModal"));
  modal.show();
}

function exportCSV() {
  const rows = [
    ["Order ID", "Order Number", "Customer", "Phone", "Status", "Total", "Created At"],
    ...filteredOrders.map((o) => [
      o.id,
      o.orderNumber || "",
      o.customer?.name || "",
      o.customer?.phone || "",
      o.status,
      o.total,
      o.createdAt,
    ]),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  downloadFile(csv, "orders.csv", "text/csv");
}

function exportSelected() {
  const selected = ordersState.filter((o) => selectedOrders.has(o.id));
  if (!selected.length) return;
  const rows = [
    ["Order ID", "Customer", "Status", "Total"],
    ...selected.map((o) => [o.id, o.customer?.name, o.status, o.total]),
  ];
  const csv = rows.map((row) => row.join(",")).join("\n");
  downloadFile(csv, "selected-orders.csv", "text/csv");
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function highlightNewOrders(ids) {
  ids.forEach((id) => {
    const card = document.querySelector(`[data-order-id="${id}"]`);
    if (card) {
      card.classList.add("border", "border-success");
      setTimeout(() => {
        card.classList.remove("border", "border-success");
      }, 2000);
    }
  });
}

function handleBulkSelection(e) {
  const id = e.target.dataset.id;
  if (e.target.checked) selectedOrders.add(id);
  else selectedOrders.delete(id);
  updateBulkBar();
}

function updateBulkBar() {
  const bar = document.getElementById("bulkBar");
  const countEl = document.getElementById("bulkCount");
  if (!bar || !countEl) return;
  countEl.textContent = selectedOrders.size;
  bar.classList.toggle("active", selectedOrders.size > 0);
}

function bulkUpdateStatus(status) {
  selectedOrders.forEach((id) => updateStatus(id, status));
  selectedOrders.clear();
  updateBulkBar();
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function formatCurrency(value) {
  return `₹${Number(value).toFixed(2)}`;
}

function formatDate(date) {
  return new Date(date).toLocaleString();
}

function announce(message, isError = false) {
  console[isError ? "error" : "log"](message);
}

