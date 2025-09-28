let cart = []; // global shopping cart

// Fade in page on load
window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");
});

window.addEventListener("load", () => {
  document.getElementById("page-loader").classList.add("hide");
});

// MENU TOGGLE
const menu = document.querySelector(".menu");
const ham = document.querySelector(".ham");
const closeIcon = document.querySelector(".close");

if (ham && menu && closeIcon) {
  ham.addEventListener("click", () => {
    menu.style.visibility = "visible";
  });

  closeIcon.addEventListener("click", () => {
    menu.style.visibility = "hidden";
  });
}

// FLEXIBLE IMAGE SLIDER
const slider = document.querySelector(".img-slider");
let slideIndex = 0;

function showSlide() {
  if (!slider) return;
  const slides = slider.querySelectorAll("img");
  slideIndex = (slideIndex + 1) % slides.length;
  slider.style.transform = `translateX(-${slideIndex * 100}%)`;
}

setInterval(showSlide, 4000); // every 4 seconds

// SEARCH FUNCTION
const searchBar = document.getElementById("search-bar");
const noResultsMsg = document.getElementById("no-results");

if (searchBar) {
  searchBar.addEventListener("input", () => {
    const query = searchBar.value.toLowerCase();
    const products = document.querySelectorAll(".items");

    let visibleCount = 0;

    products.forEach((item) => {
      const name = item.querySelector(".name")?.innerText.toLowerCase() || "";
      const info = item.querySelector(".info")?.innerText.toLowerCase() || "";
      const price = item.querySelector(".price")?.innerText.toLowerCase() || "";

      if (name.includes(query) || info.includes(query) || price.includes(query)) {
        item.style.display = "flex";
        visibleCount++;
      } else {
        item.style.display = "none";
      }
    });

    // Show or hide "no results" message
    if (visibleCount === 0) {
      noResultsMsg.style.display = "block";
    } else {
      noResultsMsg.style.display = "none";
    }
  });
}

// ---------- CART FUNCTIONS ----------
function formatMoney(n) {
  if (n >= 1000) {
    return `₦${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return `₦${n}`;
}

function parsePrice(text) {
  const n = parseFloat(String(text).replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : n;
}

function findInCart(id) {
  return cart.find((p) => p.id === id);
}

function updateProductButton(id) {
  const itemEl = document.querySelector(`.items[data-id="${id}"]`);
  if (!itemEl) return;
  const btn = itemEl.querySelector(".select-btn");
  const product = findInCart(id);

  if (!btn) return;

  if (product) {
    btn.classList.add("selected");
    btn.textContent = `Selected (${product.quantity})`;
  } else {
    btn.classList.remove("selected");
    btn.textContent = "Select";
  }
}

function updateCartCountAndTotal() {
  const cartCountEl = document.getElementById("cart-count");
  const cartTotalEl = document.getElementById("cart-total");

  const totalQty = cart.reduce((s, it) => s + it.quantity, 0);
  const totalPrice = cart.reduce((s, it) => s + it.quantity * it.price, 0);

  if (cartCountEl) cartCountEl.textContent = `Selected items: ${totalQty}`;
  if (cartTotalEl) cartTotalEl.textContent = `Total: ${formatMoney(totalPrice)}`;
}

function renderCartSummary() {
  const cartSummary = document.getElementById("cart-summary");
  if (!cartSummary) return;
  cartSummary.innerHTML = "";

  if (cart.length === 0) {
    cartSummary.innerHTML = "<p>No items selected.</p>";
    return;
  }

  cart.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cart-row";
    row.style.margin = "10px 0";
    row.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap">
        <div style="min-width:140px;"><b>${item.name}</b></div>
        <div>${formatMoney(item.price)}</div>
        <div>
          <button class="cart-decr" data-id="${item.id}">-</button>
          <span class="cart-qty" data-id="${item.id}" style="margin:0 8px;">${item.quantity}</span>
          <button class="cart-incr" data-id="${item.id}">+</button>
        </div>
        <div style="min-width:80px;">Subtotal: <b>${formatMoney(item.price * item.quantity)}</b></div>
      </div>
    `;
    cartSummary.appendChild(row);
  });

  const total = cart.reduce((s, it) => s + it.price * it.quantity, 0);
  const totalDiv = document.createElement("p");
  totalDiv.innerHTML = `<b>Total: ${formatMoney(total)}</b>`;
  cartSummary.appendChild(totalDiv);
}

// ---------- EVENT HANDLERS ----------
document.addEventListener("DOMContentLoaded", () => {
  const itemsEls = Array.from(document.querySelectorAll(".items"));
  const checkoutBtn = document.getElementById("checkout-btn");
  const checkoutModal = document.getElementById("checkout-modal");
  const screenshotInput = document.getElementById("payment-screenshot");
  const screenshotPreview = document.getElementById("screenshot-preview");
  const confirmPaymentBtn = document.getElementById("confirm-payment");

  // assign data-id and ensure select button exists
  itemsEls.forEach((el, idx) => {
    el.dataset.id = String(idx);

    let btn = el.querySelector(".select-btn");
    if (!btn) {
      btn = document.createElement("button");
      btn.className = "select-btn";
      btn.textContent = "Select";
      el.appendChild(btn);
    }
    btn.dataset.id = String(idx);

    // attach click to select button
    btn.addEventListener("click", () => {
      const name = (el.querySelector(".name")?.innerText || "Item").trim();
      const priceText = el.querySelector(".price")?.innerText || "0";
      const price = parsePrice(priceText);

      let product = findInCart(el.dataset.id);
      if (!product) {
        product = { id: el.dataset.id, name, price, quantity: 1 };
        cart.push(product);
      } else {
        product.quantity++;
      }

      updateProductButton(el.dataset.id);
      updateCartCountAndTotal();
    });
  });

  // event delegation for +/- inside cart modal
  const cartSummary = document.getElementById("cart-summary");
  if (cartSummary) {
    cartSummary.addEventListener("click", (e) => {
      const target = e.target;
      const id = target.dataset?.id;
      if (!id) return;

      const product = findInCart(id);
      if (!product) return;

      if (target.classList.contains("cart-incr")) {
        product.quantity++;
      } else if (target.classList.contains("cart-decr")) {
        product.quantity--;
        if (product.quantity <= 0) {
          cart = cart.filter((p) => p.id !== id);
        }
      }

      updateProductButton(id);
      updateCartCountAndTotal();
      renderCartSummary();
    });
  }

  // checkout button
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (cart.length === 0) {
        alert("No items selected!");
        return;
      }
      renderCartSummary();
      checkoutModal.style.display = "flex";
    });
  }

  // screenshot preview
  if (screenshotInput) {
    screenshotInput.addEventListener("change", function () {
      const file = this.files?.[0];
      if (!file) {
        screenshotPreview.style.display = "none";
        screenshotPreview.src = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        screenshotPreview.src = ev.target.result;
        screenshotPreview.style.display = "block";
      };
      reader.readAsDataURL(file);
    });
  }

  // confirm payment -> WhatsApp
  if (confirmPaymentBtn) {
    confirmPaymentBtn.addEventListener("click", () => {
      let summary = "🛒 Your Order Summary:\n\n";

      cart.forEach(item => {
        summary += `- ${item.quantity}x ${item.name} = ${formatMoney(item.price * item.quantity)}\n`;
      });

      summary += `\nTotal: ${formatMoney(cart.reduce((s, it) => s + it.price * it.quantity, 0))}`;
      summary += `\n\n✅ Please attach your payment screenshot here.`;

      const whatsappNumber = "2349013921076";
      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(summary)}`;

      window.open(url, "_blank");
    });
  }

  // ---------- PAYSTACK ----------
  const payBtn = document.getElementById("paystack-btn");
  if (payBtn) {
    payBtn.addEventListener("click", () => {
      const amount = cart.reduce((s, it) => s + it.price * it.quantity, 0);

      if (amount <= 0) {
        alert("Your cart is empty!");
        return;
      }

      var handler = PaystackPop.setup({
        key: "pk_test_7dfafd756e0da36a66cc8cc84d39de38ecc98dcc", 
        email: "customer@example.com",
        amount: Math.round(amount * 100),
        currency: "NGN",
        channels: ["bank"],
        metadata: {
          custom_fields: cart.map(item => ({ 
            display_name: item.name,
            variable_name: item.name,
            value: `Qty: ${item.quantity}, Subtotal: ₦${item.price * item.quantity}`
          }))
        },
        callback: function (response) {
          alert("✅ Payment complete! Ref: " + response.reference + "\nTotal Paid: ₦" + amount);
        },
        onClose: function () {
          alert("Payment window closed.");
        }
      });

      handler.openIframe();
    });
  }

  // --- Press/tap fallback: add 'pressed' class on pointerdown, remove on release ---
(function addPressedHandlers() {
  const selectors = ['.select-btn', '.cart-incr', '.cart-decr'];

  document.addEventListener('pointerdown', (e) => {
    const btn = e.target.closest(selectors.join(','));
    if (!btn) return;
    btn.classList.add('pressed');
  });

  ['pointerup', 'pointercancel', 'pointerleave'].forEach(evt => {
    document.addEventListener(evt, (e) => {
      const btn = e.target.closest(selectors.join(','));
      if (!btn) return;
      btn.classList.remove('pressed');
    });
  });

  // For older browsers that don't support pointer events, fallback to touch events
  document.addEventListener('touchstart', (e) => {
    const btn = e.target.closest(selectors.join(','));
    if (btn) btn.classList.add('pressed');
  }, {passive: true});

  ['touchend','touchcancel'].forEach(evt => {
    document.addEventListener(evt, (e) => {
      const btn = e.target.closest(selectors.join(','));
      if (btn) btn.classList.remove('pressed');
    });
  });
})();

  updateCartCountAndTotal();
});

// Close checkout modal
const checkoutModal = document.getElementById("checkout-modal");
const closeModal = document.querySelector(".close-modal");

if (closeModal) {
  closeModal.addEventListener("click", () => {
    checkoutModal.style.display = "none";
  });
}

// Close modal if clicking outside content
window.addEventListener("click", (e) => {
  if (e.target === checkoutModal) {
    this.checkoutModal.style.display = "none";
  }
});

