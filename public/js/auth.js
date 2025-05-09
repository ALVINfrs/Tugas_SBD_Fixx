let currentUser = null;

function checkAuthStatus() {
  fetch("/api/auth/status")
    .then((response) => response.json())
    .then((data) => {
      if (data.isAuthenticated) {
        currentUser = data.user;
        updateAuthUI(true);
      } else {
        updateAuthUI(false);
      }
    })
    .catch((error) => {
      console.error("Auth check error:", error);
      updateAuthUI(false);
    });
}

function updateAuthUI(isLoggedIn) {
  const loggedInContent = document.querySelector(
    ".user-panel-content.logged-in"
  );
  const loggedOutContent = document.querySelector(
    ".user-panel-content.logged-out"
  );

  if (isLoggedIn && currentUser) {
    loggedInContent.style.display = "block";
    loggedOutContent.style.display = "none";
    document.getElementById("user-name").textContent = currentUser.name;
    loadOrderHistory(); // Add this line
  } else {
    loggedInContent.style.display = "none";
    loggedOutContent.style.display = "block";
    document.querySelector(".login-form").style.display = "block";
    document.querySelector(".register-form").style.display = "none";
  }
}

function getCurrentUser() {
  return currentUser;
}

function initAuth() {
  const userAccountButton = document.getElementById("user-account");
  const userPanel = document.querySelector(".user-panel");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const logoutButton = document.getElementById("logout-button");
  const showRegisterLink = document.getElementById("show-register");
  const showLoginLink = document.getElementById("show-login");

  checkAuthStatus();

  userAccountButton.addEventListener("click", function (e) {
    e.preventDefault();
    userPanel.classList.toggle("active");
    document.querySelector(".search-form").classList.remove("active");
    document.querySelector(".shopping-cart").classList.remove("active");
  });

  showRegisterLink.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(".login-form").style.display = "none";
    document.querySelector(".register-form").style.display = "block";
  });

  showLoginLink.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(".login-form").style.display = "block";
    document.querySelector(".register-form").style.display = "none";
  });

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          currentUser = data.user;
          updateAuthUI(true);
          userPanel.classList.remove("active");
          showMessage("Login berhasil", "success");
        } else {
          showMessage(data.error || "Login gagal", "error");
        }
      })
      .catch((error) => {
        console.error("Login error:", error);
        showMessage("Terjadi kesalahan saat login", "error");
      });
  });

  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const phone = document.getElementById("register-phone").value;

    fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password, phone }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          document.querySelector(".register-form").style.display = "none";
          document.querySelector(".login-form").style.display = "block";
          registerForm.reset();
          showMessage("Registrasi berhasil, silakan login", "success");
        } else {
          showMessage(data.error || "Registrasi gagal", "error");
        }
      })
      .catch((error) => {
        console.error("Registration error:", error);
        showMessage("Terjadi kesalahan saat registrasi", "error");
      });
  });

  logoutButton.addEventListener("click", function (e) {
    e.preventDefault();

    fetch("/api/auth/logout", {
      method: "POST",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          currentUser = null;
          updateAuthUI(false);
          userPanel.classList.remove("active");
          showMessage("Logout berhasil", "success");
        } else {
          showMessage(data.error || "Logout gagal", "error");
        }
      })
      .catch((error) => {
        console.error("Logout error:", error);
        showMessage("Terjadi kesalahan saat logout", "error");
      });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initAuth();
});

function loadOrderHistory() {
  fetch("/api/orders/user/orders")
    .then((response) => response.json())
    .then((orders) => {
      const ordersContainer = document.getElementById("ordersContainer");
      ordersContainer.innerHTML = "";

      if (orders.length === 0) {
        ordersContainer.innerHTML = `
          <div class="empty-orders">
            <p>Belum ada riwayat pesanan</p>
          </div>
        `;
        return;
      }

      orders.forEach((order) => {
        const orderElement = document.createElement("div");
        orderElement.classList.add("order");
        orderElement.innerHTML = `
          <div class="order-header">
            <h4>Order #${order.order_number}</h4>
            <p class="order-date">${new Date(
              order.order_date
            ).toLocaleDateString()}</p>
            <p class="order-status ${order.status}">${order.status}</p>
          </div>
          <div class="order-summary">
           <div class="order-image">
        <!-- Gambar dummy untuk pesanan -->
<img src="/img/Caffeine.png" alt="Kopi Arabika" />

      </div>
            <p>${
              order.item_count
            } item(s) - Total: Rp. ${order.total.toLocaleString()}</p>
            <button class="btn view-receipt" data-order-id="${
              order.id
            }">Lihat Detail</button>
          </div>
        `;
        ordersContainer.appendChild(orderElement);
      });

      // Add event listeners for view receipt buttons
      document.querySelectorAll(".view-receipt").forEach((button) => {
        button.addEventListener("click", function () {
          const orderId = this.dataset.orderId;
          viewOrderReceipt(orderId);
        });
      });
    })
    .catch((error) => {
      console.error("Error loading order history:", error);
    });
}

function viewOrderReceipt(orderId) {
  fetch(`/api/orders/${orderId}`)
    .then((response) => response.json())
    .then((data) => {
      const order = data.order;
      const items = data.items;

      document.getElementById("receipt-date").textContent = new Date(
        order.order_date
      ).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      document.getElementById("receipt-order-id").textContent =
        order.order_number;
      document.getElementById("receipt-customer-name").textContent =
        order.customer_name;
      document.getElementById("receipt-customer-email").textContent =
        order.email;
      document.getElementById("receipt-customer-phone").textContent =
        order.phone;
      document.getElementById("receipt-customer-address").textContent =
        order.address;

      const receiptItems = document.getElementById("receipt-items-table");
      receiptItems.innerHTML = "";

      items.forEach((item) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${item.product_name}</td>
          <td>Rp. ${item.price.toLocaleString()}</td>
          <td>${item.quantity}</td>
          <td>Rp. ${item.subtotal.toLocaleString()}</td>
        `;
        receiptItems.appendChild(row);
      });

      document.getElementById("receipt-subtotal").textContent =
        order.subtotal.toLocaleString();
      document.getElementById("receipt-shipping").textContent =
        order.shipping_fee.toLocaleString();
      document.getElementById("receipt-total").textContent =
        order.total.toLocaleString();
      document.getElementById("receipt-payment-method").textContent =
        order.payment_method === "bank"
          ? "Transfer Bank"
          : order.payment_method === "cod"
          ? "Bayar di Tempat (COD)"
          : order.payment_method === "ovo"
          ? "OVO"
          : order.payment_method === "gopay"
          ? "GoPay"
          : order.payment_method;
      document
        .getElementById("print-receipt")
        .addEventListener("click", function () {
          window.print();
        });

      document.getElementById("receipt-modal").classList.add("active");
    })
    .catch((error) => {
      console.error("Error fetching order:", error);
      showMessage("Gagal memuat detail pesanan", "error");
    });
}
