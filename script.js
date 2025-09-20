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



// script.js
document.addEventListener("DOMContentLoaded", () => {
  const itemsEls = Array.from(document.querySelectorAll(".items"));
  const checkoutBtn = document.getElementById("checkout-btn");
  const checkoutModal = document.getElementById("checkout-modal");
  const cartSummary = document.getElementById("cart-summary");
  const screenshotInput = document.getElementById("payment-screenshot");
  const screenshotPreview = document.getElementById("screenshot-preview");
  const confirmPaymentBtn = document.getElementById("confirm-payment");
  const cartCountEl = document.getElementById("cart-count");
  const cartTotalEl = document.getElementById("cart-total");

  // assign data-id to each product and ensure a select button exists
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
  });

  let cart = []; // { id: "0", name, price: number, quantity: number }

  function formatMoney(n) {
  if (n >= 1000) {
    return `₦${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return `₦${n}`;
}




  function parsePrice(text) {
    // remove anything that's not a digit or dot
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
    const totalQty = cart.reduce((s, it) => s + it.quantity, 0);
    const totalPrice = cart.reduce((s, it) => s + it.quantity * it.price, 0);

    if (cartCountEl) cartCountEl.textContent = `Selected items: ${totalQty}`;
    if (cartTotalEl) cartTotalEl.textContent = `Total: ${formatMoney(totalPrice)}`;
  }

  // create click handlers for select buttons
  document.querySelectorAll(".select-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = btn.dataset.id;
      const itemEl = document.querySelector(`.items[data-id="${id}"]`);
      if (!itemEl) return;

      const name = (itemEl.querySelector(".name")?.innerText || "Item").trim();
      const priceText = itemEl.querySelector(".price")?.innerText || "0";
      const price = parsePrice(priceText);

      let product = findInCart(id);
      if (!product) {
        product = { id, name, price, quantity: 1 };
        cart.push(product);
      } else {
        // clicking select again increments quantity
        product.quantity++;
      }

      updateProductButton(id);
      updateCartCountAndTotal();
    });
  });

  function renderCartSummary() {
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

    // total
    const total = cart.reduce((s, it) => s + it.price * it.quantity, 0);
    const totalDiv = document.createElement("p");
    totalDiv.innerHTML = `<b>Total: ${formatMoney(total)}</b>`;
    cartSummary.appendChild(totalDiv);
  }

  // event delegation for cart +/- clicks
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
          // remove from cart
          cart = cart.filter((p) => p.id !== id);
        }
      } else {
        return;
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

  // confirm payment -> open WhatsApp with order summary
  document.getElementById("confirm-payment").addEventListener("click", () => {
  let summary = "🛒 Your Order Summary:\n\n";

  cart.forEach(item => {
    summary += `- ${item.quantity}x ${item.name} = ${formatMoney(item.price * item.quantity)}\n`;
  });

  summary += `\nTotal: ${formatMoney(cart.reduce((s, it) => s + it.price * it.quantity, 0))}`;
  summary += `\n\n✅ Please attach your payment screenshot here.`;

  const whatsappNumber = "2349013921076"; // <-- replace with your number
  const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(summary)}`;

  window.open(url, "_blank");
});

// Preview uploaded screenshot
document.getElementById("payment-screenshot").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const img = document.getElementById("screenshot-preview");
      img.src = event.target.result;
      img.style.display = "block";

      // Show the "Download PDF" button once image is uploaded
      document.getElementById("download-pdf").style.display = "inline-block";
    };
    reader.readAsDataURL(file);
  }
});

document.getElementById("download-pdf").addEventListener("click", () => {
  const img = document.getElementById("screenshot-preview");
  if (!img.src) {
    alert("Please upload a screenshot first.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4"); // portrait, millimeters, A4

  // Get page width
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Adjust image size
  const imgWidth = pageWidth - 20; // leave margins
  const imgHeight = (img.naturalHeight / img.naturalWidth) * imgWidth;

  pdf.addImage(img.src, "PNG", 10, 10, imgWidth, imgHeight);

  pdf.save("payment-proof.pdf");
});



  // initial update
  updateCartCountAndTotal();
});

// loader control: put this near the bottom of script.js
(function () {
  const loader = document.getElementById('page-loader');

  // debug helper (open console to see messages)
  console.log('Loader element found:', !!loader);

  // Hide loader when window fully loaded
  window.addEventListener('load', () => {
    console.log('window load event fired — hiding loader');
    if (loader) loader.classList.add('hide');
  });

  // Safety fallback: if load event never fires, hide after 5s
  setTimeout(() => {
    if (loader && !loader.classList.contains('hide')) {
      console.warn('Fallback: hiding loader after timeout');
      loader.classList.add('hide');
    }
  }, 5000);

  // Show loader when clicking internal links (so user sees spinner during navigation)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    // only show for same-origin and not anchor-only links
    try {
      const url = new URL(a.href, location.href);
      const isSameOrigin = url.origin === location.origin;
      const isHashOnly = url.pathname === location.pathname && url.hash && !url.search;
      if (isSameOrigin && !isHashOnly && !a.hasAttribute('target')) {
        // small delay to allow the click to trigger navigation; show spinner immediately
        if (loader) loader.classList.remove('hide');
      }
    } catch (err) {
      // invalid URL — ignore
    }
  });
})();
