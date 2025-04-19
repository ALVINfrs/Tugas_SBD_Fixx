let cart = [];
function loadCart() {
  const savedCart = localStorage.getItem("kopiKenanganCart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartDisplay();
    updateCartCount();
  }
}

function saveCart() {
  localStorage.setItem("kopiKenanganCart", JSON.stringify(cart));
  updateCartCount();
}

function addToCart(product, quantity = 1) {
  const existingItem = cart.find((item) => item.id == product.id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
    });
  }

  saveCart();
  updateCartDisplay();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id != productId);
  saveCart();
  updateCartDisplay();
}

function updateQuantity(productId, quantity) {
  const item = cart.find((item) => item.id == productId);

  if (item) {
    item.quantity = quantity;

    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      saveCart();
      updateCartDisplay();
    }
  }
}

function calculateCartTotal() {
  return cart.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
}

function updateCartDisplay() {
  const cartItemsContainer = document.querySelector(".cart-items");
  const cartTotalElement = document.getElementById("cart-total-price");

  if (!cartItemsContainer) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <p>Keranjang belanja kosong</p>
      </div>
    `;
    cartTotalElement.textContent = "0";
  } else {
    cartItemsContainer.innerHTML = "";

    cart.forEach((item) => {
      const cartItem = document.createElement("div");
      cartItem.classList.add("cart-item");
      cartItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-detail">
          <h3>${item.name}</h3>
          <p>Rp. ${item.price.toLocaleString()}</p>
        </div>
        <div class="cart-item-quantity">
          <button class="quantity-decrease" data-id="${item.id}">-</button>
          <span>${item.quantity}</span>
          <button class="quantity-increase" data-id="${item.id}">+</button>
        </div>
        <div class="cart-item-price">
          Rp. ${(item.price * item.quantity).toLocaleString()}
        </div>
        <button class="cart-item-remove" data-id="${item.id}">
          <i data-feather="trash-2"></i>
        </button>
      `;

      cartItemsContainer.appendChild(cartItem);
    });

    feather.replace();

    document.querySelectorAll(".quantity-decrease").forEach((button) => {
      button.addEventListener("click", function () {
        const productId = this.dataset.id;
        const item = cart.find((item) => item.id == productId);
        if (item) {
          updateQuantity(productId, item.quantity - 1);
        }
      });
    });

    document.querySelectorAll(".quantity-increase").forEach((button) => {
      button.addEventListener("click", function () {
        const productId = this.dataset.id;
        const item = cart.find((item) => item.id == productId);
        if (item) {
          updateQuantity(productId, item.quantity + 1);
        }
      });
    });

    document.querySelectorAll(".cart-item-remove").forEach((button) => {
      button.addEventListener("click", function () {
        const productId = this.dataset.id;
        removeFromCart(productId);
      });
    });

    const total = calculateCartTotal();
    cartTotalElement.textContent = total.toLocaleString();
  }
}

function updateCartCount() {
  const cartCount = document.querySelector(".cart-count");

  if (cartCount) {
    const totalItems = cart.reduce((count, item) => count + item.quantity, 0);
    cartCount.textContent = totalItems;
  }
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartDisplay();
}

function initCheckoutModal() {
  const checkoutModal = document.getElementById("checkout-modal");
  const closeModalButtons = document.querySelectorAll(".close-modal");

  document
    .getElementById("checkout-button")
    .addEventListener("click", function () {
      if (cart.length === 0) {
        showMessage("Keranjang belanja kosong", "error");
        return;
      }

      const checkoutItems = document.querySelector(".checkout-items");
      checkoutItems.innerHTML = "";

      cart.forEach((item) => {
        const checkoutItem = document.createElement("div");
        checkoutItem.classList.add("checkout-item");
        checkoutItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="checkout-item-detail">
          <h4>${item.name}</h4>
          <p>${item.quantity} x Rp. ${item.price.toLocaleString()}</p>
        </div>
        <div class="checkout-item-total">
          Rp. ${(item.price * item.quantity).toLocaleString()}
        </div>
      `;

        checkoutItems.appendChild(checkoutItem);
      });

      const subtotal = calculateCartTotal();
      const shipping = 15000;
      const total = subtotal + shipping;

      document.getElementById("checkout-subtotal").textContent =
        subtotal.toLocaleString();
      document.getElementById("checkout-shipping").textContent =
        shipping.toLocaleString();
      document.getElementById("checkout-total").textContent =
        total.toLocaleString();

      const user = getCurrentUser();
      if (user) {
        document.getElementById("checkout-name").value = user.name || "";
        document.getElementById("checkout-email").value = user.email || "";
        document.getElementById("checkout-phone").value = user.phone || "";
      }

      checkoutModal.classList.add("active");
    });

  closeModalButtons.forEach((button) => {
    button.addEventListener("click", function () {
      document.querySelectorAll(".modal").forEach((modal) => {
        modal.classList.remove("active");
      });
    });
  });

  document
    .getElementById("checkout-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      const customerName = document.getElementById("checkout-name").value;
      const email = document.getElementById("checkout-email").value;
      const phone = document.getElementById("checkout-phone").value;
      const address = document.getElementById("checkout-address").value;
      const paymentMethod = document.querySelector(
        'input[name="payment"]:checked'
      ).value;

      const subtotal = calculateCartTotal();
      const shipping = 15000;
      const total = subtotal + shipping;

      const orderData = {
        customerName,
        email,
        phone,
        address,
        items: cart,
        subtotal,
        shipping,
        total,
        paymentMethod,
      };

      fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            showReceipt(orderData, data.orderNumber);
            clearCart();
          } else {
            showMessage(data.error || "Gagal membuat pesanan", "error");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          showMessage("Terjadi kesalahan. Silakan coba lagi.", "error");
        });
    });
}

function showReceipt(orderData, orderNumber) {
  document.getElementById("checkout-modal").classList.remove("active");

  const receiptDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  document.getElementById("receipt-date").textContent = receiptDate;
  document.getElementById("receipt-order-id").textContent = orderNumber;
  document.getElementById("receipt-customer-name").textContent =
    orderData.customerName;
  document.getElementById("receipt-customer-email").textContent =
    orderData.email;
  document.getElementById("receipt-customer-phone").textContent =
    orderData.phone;
  document.getElementById("receipt-customer-address").textContent =
    orderData.address;

  const receiptItems = document.getElementById("receipt-items-table");
  receiptItems.innerHTML = "";

  orderData.items.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>Rp. ${item.price.toLocaleString()}</td>
      <td>${item.quantity}</td>
      <td>Rp. ${(item.price * item.quantity).toLocaleString()}</td>
    `;

    receiptItems.appendChild(row);
  });

  document.getElementById("receipt-subtotal").textContent =
    orderData.subtotal.toLocaleString();
  document.getElementById("receipt-shipping").textContent =
    orderData.shipping.toLocaleString();
  document.getElementById("receipt-total").textContent =
    orderData.total.toLocaleString();
  const paymentMethods = {
    bank: "Transfer Bank",
    cod: "Bayar di Tempat (COD)",
    gopay: "GoPay",
    ovo: "OVO",
    dana: "DANA",
  };

  document.getElementById("receipt-payment-method").textContent =
    paymentMethods[orderData.paymentMethod];

  document.getElementById("receipt-modal").classList.add("active");

  document
    .getElementById("print-receipt")
    .addEventListener("click", function () {
      window.print();
    });
}

document.addEventListener("DOMContentLoaded", function () {
  loadCart();

  const shoppingCartButton = document.getElementById("shopping-cart-button");
  const shoppingCart = document.querySelector(".shopping-cart");

  shoppingCartButton.addEventListener("click", function (e) {
    e.preventDefault();

    // Cek apakah user sudah login
    const user = getCurrentUser();
    if (!user) {
      showMessage(
        "Silakan login terlebih dahulu untuk melihat keranjang",
        "error"
      );
      document.querySelector(".user-panel").classList.add("active");
      document.querySelector(".search-form").classList.remove("active");
      document.querySelector(".shopping-cart").classList.remove("active");
      return;
    }

    // Kalau sudah login, tampilkan keranjang
    shoppingCart.classList.toggle("active");
    document.querySelector(".search-form").classList.remove("active");
    document.querySelector(".user-panel").classList.remove("active");
  });

  document.getElementById("clear-cart").addEventListener("click", function () {
    if (confirm("Apakah Anda yakin ingin mengosongkan keranjang?")) {
      clearCart();
    }
  });

  initCheckoutModal();
});

// In cart.js - Update the checkout button click handler
document
  .getElementById("checkout-button")
  .addEventListener("click", function () {
    if (cart.length === 0) {
      showMessage("Keranjang belanja kosong", "error");
      return;
    }

    // Check if user is logged in
    if (!getCurrentUser()) {
      showMessage(
        "Silakan login terlebih dahulu untuk melanjutkan checkout",
        "error"
      );
      document.querySelector(".user-panel").classList.add("active");
      return;
    }

    const checkoutItems = document.querySelector(".checkout-items");
    checkoutItems.innerHTML = "";

    cart.forEach((item) => {
      const checkoutItem = document.createElement("div");
      checkoutItem.classList.add("checkout-item");
      checkoutItem.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="checkout-item-detail">
        <h4>${item.name}</h4>
        <p>${item.quantity} x Rp. ${item.price.toLocaleString()}</p>
      </div>
      <div class="checkout-item-total">
        Rp. ${(item.price * item.quantity).toLocaleString()}
      </div>
    `;

      checkoutItems.appendChild(checkoutItem);
    });

    const subtotal = calculateCartTotal();
    const shipping = 15000;
    const total = subtotal + shipping;

    document.getElementById("checkout-subtotal").textContent =
      subtotal.toLocaleString();
    document.getElementById("checkout-shipping").textContent =
      shipping.toLocaleString();
    document.getElementById("checkout-total").textContent =
      total.toLocaleString();

    const user = getCurrentUser();
    if (user) {
      document.getElementById("checkout-name").value = user.name || "";
      document.getElementById("checkout-email").value = user.email || "";
      document.getElementById("checkout-phone").value = user.phone || "";
    }

    document.getElementById("checkout-modal").classList.add("active");
  });
