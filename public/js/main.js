// main.js - frontend + cart + modal + checkout
const menuCategories = [
  { id: "all", label: "All Items", icon: "🍽️" },
  { id: "beverages", label: "Beverages", icon: "☕" },
  { id: "starters", label: "Starters", icon: "🥗" },
  { id: "pizza", label: "Pizza", icon: "🍕" },
  { id: "sandwiches", label: "Sandwiches", icon: "🥪" },
  { id: "main-course", label: "Main Course", icon: "🍝" },
  { id: "sides-snacks", label: "Sides & Snacks", icon: "🍟" },
  { id: "desserts", label: "Desserts", icon: "🍰" },
  { id: "combo-meals", label: "Combo Meals", icon: "🍱" },
];

const menuData = [
  {
    id: 1,
    name: "Cappuccino",
    price: 149,
    img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
    category: "beverages",
    rating: 4.8,
    isVeg: true,
    orderedToday: 92,
    description: "Rich espresso topped with steamed milk and velvet foam.",
  },
  {
    id: 2,
    name: "Signature Latte",
    price: 169,
    img: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80",
    category: "beverages",
    rating: 4.7,
    isVeg: true,
    orderedToday: 88,
    description: "Silky-smooth latte infused with caramel undertones.",
  },
  {
    id: 3,
    name: "Double Espresso",
    price: 119,
    img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    category: "beverages",
    rating: 4.6,
    isVeg: true,
    orderedToday: 54,
    description: "A bold, concentrated shot for purists.",
  },
  {
    id: 4,
    name: "Iced Latte",
    price: 179,
    img: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80",
    category: "beverages",
    rating: 4.5,
    isVeg: true,
    orderedToday: 61,
    description: "Chilled espresso with milk over artisanal ice.",
  },
  {
    id: 5,
    name: "Cheese Burst Pizza",
    price: 249,
    img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    category: "pizza",
    rating: 4.9,
    isVeg: true,
    orderedToday: 110,
    description: "Wood-fired base layered with molten cheese blend.",
  },
  {
    id: 6,
    name: "Farmhouse Supreme",
    price: 329,
    img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
    category: "pizza",
    rating: 4.7,
    isVeg: false,
    orderedToday: 97,
    description: "Loaded with roasted veggies, jalapeños, and smoked chicken.",
  },
  {
    id: 7,
    name: "Classic Veg Sandwich",
    price: 129,
    img: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80",
    category: "sandwiches",
    rating: 4.6,
    isVeg: true,
    orderedToday: 73,
    description: "Multigrain bread stuffed with crunchy veggies and pesto.",
  },
  {
    id: 8,
    name: "Grilled Cheese Melt",
    price: 159,
    img: "https://images.unsplash.com/photo-1528736235302-52922df5c122?auto=format&fit=crop&w=800&q=80",
    category: "sandwiches",
    rating: 4.8,
    isVeg: true,
    orderedToday: 82,
    description: "Golden-brown toast hugging a trio of cheeses.",
  },
  {
    id: 9,
    name: "French Fries Bucket",
    price: 99,
    img: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80",
    category: "sides-snacks",
    rating: 4.5,
    isVeg: true,
    orderedToday: 65,
    description: "Crispy shoestring fries dusted with peri-peri spice.",
  },
  {
    id: 10,
    name: "Garlic Pull-Apart Bread",
    price: 149,
    img: "https://www.ambitiouskitchen.com/wp-content/uploads/2023/02/Garlic-Bread-4-1064x1064.jpg",
    category: "starters",
    rating: 4.6,
    isVeg: true,
    orderedToday: 58,
    description: "Wood-fired bread brushed with herbed garlic butter.",
  },
  {
    id: 11,
    name: "Chocolate Brownie",
    price: 129,
    img: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRD92i2ymecT_Z4Pxx2FsJSlEvo2sJ9Ar9LAEi8fE_v8wauVsghducei5f1MgLCietJ5JHbVw58",
    category: "desserts",
    rating: 4.9,
    isVeg: true,
    orderedToday: 79,
    description: "Fudgy brownie finished with sea salt flakes.",
  },
  {
    id: 12,
    name: "Hazelnut Cookie",
    price: 99,
    img: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80",
    category: "desserts",
    rating: 4.7,
    isVeg: true,
    orderedToday: 64,
    description: "Chewy cookie packed with roasted hazelnuts.",
  },
  {
    id: 13,
    name: "Creamy Alfredo Pasta",
    price: 289,
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    category: "main-course",
    rating: 4.8,
    isVeg: true,
    orderedToday: 71,
    description: "Handmade fettuccine tossed in parmesan cream sauce.",
  },
  {
    id: 14,
    name: "BBQ Smoky Burger",
    price: 299,
    img: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80",
    category: "main-course",
    rating: 4.6,
    isVeg: false,
    orderedToday: 67,
    description: "Angus patty, charred onions, and BBQ glaze on brioche.",
  },
  {
    id: 15,
    name: "Peri-Peri Wings",
    price: 219,
    img: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80",
    category: "starters",
    rating: 4.7,
    isVeg: false,
    orderedToday: 59,
    description: "Fire-grilled wings slathered in tangy peri-peri sauce.",
  },
  {
    id: 16,
    name: "Mediterranean Salad",
    price: 189,
    img: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=800&q=80",
    category: "sides-snacks",
    rating: 4.5,
    isVeg: true,
    orderedToday: 48,
    description: "Crunchy greens with feta, olives, and citrus vinaigrette.",
  },
  {
    id: 17,
    name: "Brownie Blast Sundae",
    price: 199,
    img: "https://images.unsplash.com/photo-1497051788611-2c64812349a3?auto=format&fit=crop&w=800&q=80",
    category: "desserts",
    rating: 4.9,
    isVeg: true,
    orderedToday: 83,
    description: "Warm brownie, gelato, and caramel drizzle.",
  },
  {
    id: 18,
    name: "Cafe Feast Combo",
    price: 449,
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    category: "combo-meals",
    rating: 4.8,
    isVeg: true,
    orderedToday: 76,
    description: "Mini pizza, fries, brownie, and beverage duo.",
  },
];

let cart = [];
const BEST_SELLER_LIMIT = 6;
const BRAND_COLOR = "#8B3A3A";
const BRAND_COLOR_DARK = "#6d2d2d";
const categoryLabelMap = Object.fromEntries(
  menuCategories.map((c) => [c.id, c.label])
);
const BEST_SELLER_FOOD_SET = new Set(
  menuCategories
    .map((c) => c.id)
    .filter(
      (id) => id !== "all" && id !== "beverages" && id !== "desserts"
    )
);
const bestSellerPool = [...menuData].sort(
  (a, b) => (b.orderedToday || 0) - (a.orderedToday || 0)
);

// init
document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const menuHandled = setupMenuPageFilters();
  if (!menuHandled) {
    initProductGrid("menuGrid", menuData, {
      columnClass: "col-12 col-md-6 col-lg-4",
      stagger: true,
    });
  }

  setupBestSellerSection();
  setupHeroBanner();
  setupViewMenuButton();

  setupCartControls();
  setupCheckout();
});

// render generic product grid
function initProductGrid(gridId, items, options = {}) {
  if (!document.getElementById(gridId)) return;
  renderItemsIntoGrid(gridId, items, options);
}

function renderItemsIntoGrid(
  gridId,
  items,
  { animate = false, columnClass = "col-md-4", stagger = false } = {}
) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  const renderContent = () => {
    if (!items.length) {
      grid.innerHTML = `<div class="col-12 text-center text-muted py-4">No dishes available in this category yet.</div>`;
    } else {
      grid.innerHTML = items
        .map((item) => buildProductCard(item, columnClass))
        .join("");
    }
    attachAddToCartButtons(grid);
    attachMenuHandlers(gridId);
    enhanceCards(grid, { stagger });
  };

  const performRender = () => {
    renderContent();
  };

  if (animate) {
    grid.style.transition = "opacity 0.3s ease";
    grid.style.opacity = "0";
    setTimeout(() => {
      performRender();
      requestAnimationFrame(() => {
        grid.style.opacity = "1";
      });
    }, 200);
  } else performRender();
}

function buildProductCard(item, columnClass) {
  const categoryTag = (categoryLabelMap[item.category] || item.category || "").toUpperCase();
  const vegLabel = item.isVeg ? "Vegetarian" : "Non-Vegetarian";
  const vegIcon = item.isVeg ? "🟢" : "🔴";
  const ratingText = `★★★★★ ${Number(item.rating || 0).toFixed(1)}`;
  const orderedCopy = `Ordered ${(item.orderedToday ?? 0)}+ times today`;

  return `
    <div class="${columnClass}">
      <div class="menu-card h-100" data-id="${item.id}" data-category="${escapeHtml(
        item.category || ""
      )}" style="transition:transform 0.2s ease, box-shadow 0.2s ease;">
        <img src="${item.img}" alt="${escapeHtml(item.name)}" loading="lazy" style="border-top-left-radius:1rem;border-top-right-radius:1rem;aspect-ratio:16/9;object-fit:cover;">
        <div class="p-3 text-center">
          <div class="text-muted small fw-semibold mb-1" style="letter-spacing:0.08em;">${categoryTag}</div>
          <h5>${escapeHtml(item.name)}</h5>
          <p class="text-muted small mb-2">${escapeHtml(item.description || "")}</p>
          <div class="small fw-semibold" style="color:#f5b100;">${ratingText}</div>
          <div class="text-muted small">${orderedCopy}</div>
          <div class="d-flex justify-content-between align-items-center mt-3">
            <div class="price d-flex align-items-center gap-2">
              ₹${item.price}
              <span role="img" aria-label="${vegLabel}" style="font-size:0.9rem;">${vegIcon}</span>
            </div>
            <button class="btn btn-sm btn-dark add-to-cart" data-id="${item.id}">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function attachAddToCartButtons(scope) {
  if (!scope) return;
  scope.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = Number(btn.dataset.id);
      addToCart(id);
    });
  });
}

const modalListeners = new Set();
function attachMenuHandlers(gridId) {
  const container = document.getElementById(gridId);
  if (!container || modalListeners.has(gridId)) return;
  container.addEventListener("click", (e) => {
    const card = e.target.closest(".menu-card");
    if (!card) return;
    const id = Number(card.dataset.id);
    openItemModal(id);
  });
  modalListeners.add(gridId);
}

// modal open/populate
function openItemModal(id) {
  const item = menuData.find((i) => i.id === id);
  if (!item) return;
  document.getElementById("modal-img").src = item.img;
  document.getElementById("modal-title").textContent = item.name;
  const fallbackDesc = `${item.name} — freshly prepared using premium ingredients. Enjoy the rich flavors at Cafe Sperl.`;
  document.getElementById("modal-desc").textContent = item.description || fallbackDesc;
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

function setupBestSellerSection() {
  const grid = document.getElementById("bestSellerGrid");
  if (!grid) return;

  personalizeBestSellerHeading();

  const tabs = document.querySelectorAll(".best-seller-tab");
  let activeCategory = "all";

  const renderForCategory = (category) => {
    let pool;
    if (category === "all") pool = bestSellerPool;
    else if (category === "food")
      pool = bestSellerPool.filter((item) => BEST_SELLER_FOOD_SET.has(item.category));
    else pool = bestSellerPool.filter((item) => item.category === category);
    const limit = pool.length < BEST_SELLER_LIMIT ? pool.length : BEST_SELLER_LIMIT;
    const items = pool.slice(0, limit || pool.length);
    renderItemsIntoGrid("bestSellerGrid", items, {
      animate: true,
      columnClass: "col-12 col-md-6 col-lg-4",
      stagger: true,
    });
  };

  tabs.forEach((btn) => {
    const category = btn.dataset.category;
    applyFilterButtonState(btn, category === activeCategory);
    btn.setAttribute("aria-pressed", category === activeCategory);
    btn.addEventListener("click", () => {
      if (activeCategory === category) return;
      activeCategory = category;
      tabs.forEach((tab) => {
        const isActive = tab.dataset.category === activeCategory;
        applyFilterButtonState(tab, isActive);
        tab.setAttribute("aria-pressed", isActive);
      });
      renderForCategory(activeCategory);
    });
  });

  renderForCategory(activeCategory);
}

function applyFilterButtonState(btn, isActive) {
  btn.style.border = `1px solid ${BRAND_COLOR}`;
  btn.style.backgroundColor = isActive ? BRAND_COLOR : "transparent";
  btn.style.color = isActive ? "#fff" : BRAND_COLOR;
  btn.style.transition = "all 0.3s ease";
  btn.style.boxShadow = isActive ? "0 10px 20px rgba(139,58,58,0.2)" : "none";
  btn.classList.add("fw-semibold");
}

function setupViewMenuButton() {
  const btn = document.getElementById("view-menu-btn");
  if (!btn) return;
  btn.style.transition = "background-color 0.3s ease, box-shadow 0.3s ease";
  btn.addEventListener("mouseenter", () => {
    btn.style.backgroundColor = BRAND_COLOR_DARK;
    btn.style.boxShadow = "0 12px 24px rgba(109,45,45,0.35)";
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.backgroundColor = BRAND_COLOR;
    btn.style.boxShadow = "0 10px 20px rgba(139,58,58,0.2)";
  });
}

function setupHeroBanner() {
  const banner = document.getElementById("hero-banner");
  const dismiss = document.getElementById("hero-banner-close");
  if (!banner || !dismiss) return;
  banner.style.transition = "opacity 0.3s ease";
  dismiss.addEventListener("click", () => {
    banner.style.opacity = "0";
    setTimeout(() => {
      banner.style.display = "none";
    }, 280);
  });
}

function personalizeBestSellerHeading() {
  const title = document.getElementById("bestSellerTitle");
  const subtitle = document.getElementById("bestSellerSubtitle");
  if (!title || !subtitle) return;
  const visitFlag = localStorage.getItem("cafesperl_returning");

  if (visitFlag === null) {
    title.textContent = "Fan Favorites";
    subtitle.textContent = "What keeps people coming back";
    localStorage.setItem("cafesperl_returning", "false");
  } else {
    title.textContent = "Welcome Back! You Might Like...";
    subtitle.textContent = "Handpicked classics waiting for you";
    localStorage.setItem("cafesperl_returning", "true");
  }
}

function setupMenuPageFilters() {
  const grid = document.getElementById("menuGrid");
  if (!grid) return false;
  const sidebar = document.getElementById("menuCategoryList");
  const mobileTabs = document.getElementById("menuCategoryTabs");
  const searchInput = document.getElementById("menuSearchInput");
  const sortSelect = document.getElementById("menuSortSelect");

  let activeCategory = normalizeCategoryFromHash();
  let searchTerm = "";
  let sortBy = "popular";

  renderCategoryControls(sidebar, "vertical");
  renderCategoryControls(mobileTabs, "tabs");
  bindSearchAndSort();
  renderMenuItems();
  window.addEventListener("hashchange", () => {
    const newCat = normalizeCategoryFromHash();
    if (newCat !== activeCategory) {
      activeCategory = newCat;
      updateCategoryHighlight();
      renderMenuItems({ scroll: true });
    }
  });

  return true;

  function renderCategoryControls(container, mode) {
    if (!container) return;
    container.innerHTML = "";
    menuCategories.forEach((cat) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className =
        mode === "tabs"
          ? "btn btn-sm text-nowrap flex-shrink-0"
          : "btn w-100 text-start";
      button.dataset.cat = cat.id;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-label", cat.label);
      button.tabIndex = 0;
      button.innerHTML = buildCategoryButtonInner(cat, mode);
      styleCategoryButton(button, cat.id === activeCategory, mode);
      button.addEventListener("click", () => handleCategoryChange(cat.id));
      button.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCategoryChange(cat.id);
        }
      });
      container.appendChild(button);
    });
  }

  function buildCategoryButtonInner(cat, mode) {
    const count = getCategoryCount(cat.id);
    if (mode === "tabs") {
      return `<span class="d-flex align-items-center gap-2">${cat.icon}<span>${cat.label}</span></span>`;
    }
    return `
      <span class="d-flex align-items-center justify-content-between w-100">
        <span class="d-flex align-items-center gap-2">
          <span>${cat.icon}</span>
          <span>${cat.label}</span>
        </span>
        <span class="d-flex align-items-center gap-2">
          <span class="badge rounded-pill" data-role="count">${count}</span>
          <span style="font-size:1.1rem;" data-role="arrow">→</span>
        </span>
      </span>
    `;
  }

  function styleCategoryButton(button, isActive, mode) {
    button.setAttribute("aria-pressed", isActive);
    button.setAttribute("aria-selected", isActive);
    if (mode === "tabs") {
      button.style.border = `1px solid ${BRAND_COLOR}`;
      button.style.backgroundColor = isActive ? BRAND_COLOR : "transparent";
      button.style.color = isActive ? "#fff" : BRAND_COLOR;
      button.style.transition = "all 0.3s ease";
      button.style.boxShadow = isActive ? "0 10px 20px rgba(139,58,58,0.2)" : "none";
    } else {
      button.style.border = "1px solid rgba(0,0,0,0.05)";
      button.style.backgroundColor = isActive ? BRAND_COLOR : "transparent";
      button.style.color = isActive ? "#fff" : "#2c2c2c";
      button.style.padding = "12px 16px";
      button.style.borderRadius = "12px";
      button.style.transition = "all 0.3s ease";
      button.style.boxShadow = isActive ? "0 15px 25px rgba(139,58,58,0.25)" : "none";
      const badge = button.querySelector('[data-role="count"]');
      if (badge) {
        badge.style.backgroundColor = isActive ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.05)";
        badge.style.color = isActive ? "#fff" : "#333";
        badge.style.border = "none";
      }
      const arrow = button.querySelector('[data-role="arrow"]');
      if (arrow) arrow.style.color = isActive ? "#fff" : BRAND_COLOR;
    }
  }

  function updateCategoryHighlight() {
    [sidebar, mobileTabs].forEach((container) => {
      if (!container) return;
      container.querySelectorAll("button").forEach((btn) => {
        const isActive = btn.dataset.cat === activeCategory;
        styleCategoryButton(btn, isActive, container === mobileTabs ? "tabs" : "vertical");
      });
    });
  }

  function bindSearchAndSort() {
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        searchTerm = e.target.value.trim().toLowerCase();
        renderMenuItems();
      });
    }
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        sortBy = e.target.value;
        renderMenuItems();
      });
    }
  }

  function renderMenuItems(options = {}) {
    const filtered = getFilteredItems();
    renderItemsIntoGrid(
      "menuGrid",
      filtered,
      {
        animate: true,
        columnClass: "col-12 col-md-6 col-xl-4",
        stagger: true,
      }
    );
    if (options.scroll) {
      const y = grid.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }

  function getFilteredItems() {
    let items = menuData.filter((item) => {
      if (activeCategory !== "all" && item.category !== activeCategory) return false;
      if (searchTerm && !item.name.toLowerCase().includes(searchTerm)) return false;
      return true;
    });
    items = sortItems(items, sortBy);
    return items;
  }

  function sortItems(items, sort) {
    const sorted = [...items];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        sorted.sort((a, b) => (b.orderedToday || 0) - (a.orderedToday || 0));
    }
    return sorted;
  }

  function handleCategoryChange(catId) {
    if (catId === activeCategory) return;
    activeCategory = catId;
    updateCategoryHighlight();
    updateHash(catId);
    renderMenuItems({ scroll: true });
  }

  function normalizeCategoryFromHash() {
    const hash = window.location.hash.replace("#", "");
    const exists = menuCategories.find((c) => c.id === hash);
    return exists ? exists.id : "all";
  }

  function updateHash(catId) {
    const base = `${window.location.pathname}${window.location.search}`;
    if (catId === "all") history.replaceState(null, "", base);
    else history.replaceState(null, "", `${base}#${catId}`);
  }

  function getCategoryCount(id) {
    if (id === "all") return menuData.length;
    return menuData.filter((item) => item.category === id).length;
  }
}

function enhanceCards(grid, { stagger } = {}) {
  const cards = grid.querySelectorAll(".menu-card");
  cards.forEach((card, idx) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(12px)";
    const delay = stagger ? idx * 60 : 0;
    setTimeout(() => {
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, delay);
    card.addEventListener("mouseenter", () => {
      card.style.transform = "scale(1.02)";
      card.style.boxShadow = "0 20px 35px rgba(0,0,0,0.12)";
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "scale(1)";
      card.style.boxShadow = "0 10px 20px rgba(0,0,0,0.08)";
    });
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
