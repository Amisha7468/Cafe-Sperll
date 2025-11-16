// main.js - frontend + cart + modal + checkout
const menuData = [
  {
    id: 1,
    name: "Cappuccino",
    price: 149,
    img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    name: "Latte",
    price: 169,
    img: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    name: "Espresso",
    price: 119,
    img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    name: "Iced Latte",
    price: 179,
    img: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    name: "Cheese Pizza",
    price: 249,
    img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6,
    name: "Farmhouse Pizza",
    price: 329,
    img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 7,
    name: "Veg Sandwich",
    price: 129,
    img: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 8,
    name: "Grilled Cheese Sandwich",
    price: 159,
    img: "https://images.unsplash.com/photo-1528736235302-52922df5c122?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 9,
    name: "French Fries",
    price: 99,
    img: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 10,
    name: "Garlic Bread",
    price: 149,
    img: "https://www.ambitiouskitchen.com/wp-content/uploads/2023/02/Garlic-Bread-4-1064x1064.jpg",
  },
  {
    id: 11,
    name: "Chocolate Brownie",
    price: 129,
    img: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRD92i2ymecT_Z4Pxx2FsJSlEvo2sJ9Ar9LAEi8fE_v8wauVsghducei5f1MgLCietJ5JHbVw58",
  },
  {
    id: 12,
    name: "Chocolate Cookie",
    price: 99,
    img: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80",
  },
];

let cart = [];

// init
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  renderMenu();
  attachMenuHandlers();
  setupCartControls();
  setupCheckout();
});

// render menu grid
function renderMenu() {
  const grid = document.getElementById("menuGrid");
  grid.innerHTML = "";
  menuData.forEach((item) => {
    const col = document.createElement("div");
    col.className = "col-md-4";
    col.innerHTML = `
      <div class="menu-card" data-id="${item.id}">
        <img src="${item.img}" alt="${escapeHtml(item.name)}">
        <div class="p-3 text-center">
          <h5>${escapeHtml(item.name)}</h5>
          <div class="d-flex justify-content-between align-items-center">
            <div class="price">₹${item.price}</div>
            <button class="btn btn-sm btn-dark add-to-cart" data-id="${
              item.id
            }">Add to Cart</button>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(col);
  });

  // individual add-to-cart buttons shouldn't open modal
  document.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = Number(btn.dataset.id);
      addToCart(id);
    });
  });
}

// attach click for card -> modal
function attachMenuHandlers() {
  document.getElementById("menuGrid").addEventListener("click", (e) => {
    const card = e.target.closest(".menu-card");
    if (!card) return;
    const id = Number(card.dataset.id);
    openItemModal(id);
  });
}

// modal open/populate
function openItemModal(id) {
  const item = menuData.find((i) => i.id === id);
  if (!item) return;
  document.getElementById("modal-img").src = item.img;
  document.getElementById("modal-title").textContent = item.name;
  document.getElementById(
    "modal-desc"
  ).textContent = `${item.name} — freshly prepared using premium ingredients. Enjoy the rich flavors at Cafe Sperl.`;
  document.getElementById("modal-price").textContent = item.price;

  const addBtn = document.getElementById("modal-add-cart");
  addBtn.onclick = (ev) => {
    ev.stopPropagation();
    addToCart(id);
    const inst = bootstrap.Modal.getInstance(
      document.getElementById("itemModal")
    );
    if (inst) inst.hide();
  };

  new bootstrap.Modal(document.getElementById("itemModal")).show();
}

// cart functions
function addToCart(id) {
  const item = menuData.find((i) => i.id === id);
  if (!item) return;
  const exists = cart.find((x) => x.id === id);
  if (exists) exists.qty++;
  else cart.push({ ...item, qty: 1 });
  updateCartUI();
}

function changeQty(id, delta) {
  const it = cart.find((x) => x.id === id);
  if (!it) return;
  it.qty += delta;
  if (it.qty <= 0) cart = cart.filter((x) => x.id !== id);
  updateCartUI();
}

function updateCartUI() {
  const cartItems = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const cartTotalEl = document.getElementById("cart-total");
  const checkoutBtn = document.getElementById("checkout-btn");
  cartItems.innerHTML = "";
  let total = 0;
  cart.forEach((it) => {
    total += it.price * it.qty;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${it.img}">
      <div style="flex:1">
        <div><strong>${escapeHtml(it.name)}</strong></div>
        <div>₹${it.price} × ${it.qty} = ₹${it.price * it.qty}</div>
        <div class="qty-controls mt-2">
          <button class="btn" onclick="changeQty(${it.id}, -1)">-</button>
          <span class="mx-2">${it.qty}</span>
          <button class="btn" onclick="changeQty(${it.id}, 1)">+</button>
        </div>
      </div>
    `;
    cartItems.appendChild(div);
  });

  cartCount.textContent = cart.reduce((s, i) => s + i.qty, 0);
  cartTotalEl.textContent = total.toFixed(2);
  checkoutBtn.disabled = cart.length === 0;
}

// cart panel open/close
function setupCartControls() {
  const open = document.getElementById("open-cart");
  const close = document.getElementById("close-cart");
  const overlay = document.getElementById("cart-overlay");
  const panel = document.getElementById("cart-panel");

  open.addEventListener("click", () => {
    panel.style.right = "0";
    overlay.style.display = "block";
  });
  close.addEventListener("click", () => {
    panel.style.right = "-420px";
    overlay.style.display = "none";
  });
  overlay.addEventListener("click", () => {
    panel.style.right = "-420px";
    overlay.style.display = "none";
  });
}

// checkout: send to backend
function setupCheckout() {
  const form = document.getElementById("checkoutForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const customer = {
      name: fd.get("name").trim(),
      phone: fd.get("phone").trim(),
      address: fd.get("address").trim(),
    };
    if (!customer.name || !customer.phone) {
      showCheckoutAlert("Enter name & phone", "danger");
      return;
    }
    if (cart.length === 0) {
      showCheckoutAlert("Cart empty", "danger");
      return;
    }

    const order = {
      customer,
      items: cart.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        qty: i.qty,
      })),
      total: cart.reduce((s, i) => s + i.price * i.qty, 0),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      const data = await res.json();
      if (data.ok) {
        showCheckoutAlert("Order placed! ID: " + data.orderId, "success");
        cart = [];
        updateCartUI();
        setTimeout(() => {
          const modal = bootstrap.Modal.getInstance(
            document.getElementById("checkoutModal")
          );
          if (modal) modal.hide();
          document.getElementById("cart-panel").style.right = "-420px";
          document.getElementById("cart-overlay").style.display = "none";
        }, 1100);
      } else
        showCheckoutAlert(
          "Order failed: " + (data.error || "unknown"),
          "danger"
        );
    } catch (err) {
      console.error(err);
      showCheckoutAlert("Network error", "danger");
    }
  });
}

function showCheckoutAlert(msg, type = "info") {
  const out = document.getElementById("checkout-alert");
  out.innerHTML = `<div class="alert alert-${type}">${escapeHtml(msg)}</div>`;
}

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
