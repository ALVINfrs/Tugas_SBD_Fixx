document.addEventListener("DOMContentLoaded", function () {
  let products = window.products;
  const navbarNav = document.querySelector(".navbar-nav");
  const hamburger = document.querySelector("#hamburger-menu");

  hamburger.addEventListener("click", function (e) {
    e.preventDefault();
    navbarNav.classList.toggle("active");
  });

  document.addEventListener("click", function (e) {
    if (!hamburger.contains(e.target) && !navbarNav.contains(e.target)) {
      navbarNav.classList.remove("active");
    }

    const searchForm = document.querySelector(".search-form");
    const searchButton = document.querySelector("#search-button");

    if (!searchButton.contains(e.target) && !searchForm.contains(e.target)) {
      searchForm.classList.remove("active");
    }

    const shoppingCart = document.querySelector(".shopping-cart");
    const cartButton = document.querySelector("#shopping-cart-button");

    if (!cartButton.contains(e.target) && !shoppingCart.contains(e.target)) {
      shoppingCart.classList.remove("active");
    }

    const userPanel = document.querySelector(".user-panel");
    const userButton = document.querySelector("#user-account");

    if (!userButton.contains(e.target) && !userPanel.contains(e.target)) {
      userPanel.classList.remove("active");
    }
  });

  const searchForm = document.querySelector(".search-form");
  const searchButton = document.querySelector("#search-button");

  searchButton.addEventListener("click", function (e) {
    e.preventDefault();
    searchForm.classList.toggle("active");
    document.querySelector(".shopping-cart").classList.remove("active");
    document.querySelector(".user-panel").classList.remove("active");
    navbarNav.classList.remove("active");
  });

  const searchBox = document.querySelector("#search-box");

  searchBox.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();

    if (typeof window.products !== "undefined" && window.products.length > 0) {
      const filteredProducts = window.products.filter(
        ...(product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm)
      );

      displaySearchResults(filteredProducts, searchTerm);
    }
  });

  function displaySearchResults(results, searchTerm) {
    const productList = document.getElementById("product-list");

    if (!isInViewport(document.getElementById("menu"))) {
      return;
    }

    if (searchTerm === "") {
      const activeFilter =
        document.querySelector(".filter-btn.active").dataset.filter;
      displayProducts(activeFilter);
      return;
    }

    productList.innerHTML = "";

    if (results.length === 0) {
      productList.innerHTML = `
          <div class="empty-search">
            <p>Tidak ada produk yang cocok dengan pencarian "${searchTerm}"</p>
          </div>
        `;
      return;
    }

    results.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.classList.add("product-card");
      productCard.innerHTML = `
          <div class="product-icons">
            <a href="#" class="product-detail" data-id="${product.id}">
              <i data-feather="eye"></i>
            </a>
            <a href="#" class="add-to-cart" data-id="${product.id}">
              <i data-feather="shopping-cart"></i>
            </a>
          </div>
          <div class="product-image">
            <img src="${product.image}" alt="${product.name}">
          </div>
          <div class="product-content">
            <h3>${product.name}</h3>
            <div class="stars">
              <i data-feather="star" class="star-full"></i>
              <i data-feather="star" class="star-full"></i>
              <i data-feather="star" class="star-full"></i>
              <i data-feather="star" class="star-full"></i>
              <i data-feather="star"></i>
            </div>
            <div class="price">Rp. ${product.price.toLocaleString()}</div>
            <p class="description">${product.description.substring(0, 60)}${
        product.description.length > 60 ? "..." : ""
      }</p>
          </div>
        `;

      productList.appendChild(productCard);
    });

    feather.replace();

    document.querySelectorAll(".add-to-cart").forEach((button) => {
      button.addEventListener("click", function (e) {
        e.preventDefault();
        const productId = this.dataset.id;
        const product = products.find((p) => p.id == productId);

        if (product) {
          addToCart(product);
          showMessage("Produk ditambahkan ke keranjang", "success");
        }
      });
    });

    document.querySelectorAll(".product-detail").forEach((button) => {
      button.addEventListener("click", function (e) {
        e.preventDefault();
        const productId = this.dataset.id;
        const product = window.products.find((p) => p.id == productId);

        if (product) {
          showProductDetail(product);
        }
      });
    });
  }

  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  function showProductDetail(product) {
    let productModal = document.getElementById("product-detail-modal");

    if (!productModal) {
      productModal = document.createElement("div");
      productModal.id = "product-detail-modal";
      productModal.classList.add("modal");

      const modalContent = `
          <div class="modal-container">
            <span class="close-modal">&times;</span>
            <div class="product-detail-content">
              <div class="product-detail-image">
                <img src="${product.image}" alt="${product.name}">
              </div>
              <div class="product-detail-info">
                <h2>${product.name}</h2>
                <div class="stars">
                  <i data-feather="star" class="star-full"></i>
                  <i data-feather="star" class="star-full"></i>
                  <i data-feather="star" class="star-full"></i>
                  <i data-feather="star" class="star-full"></i>
                  <i data-feather="star"></i>
                </div>
                <p class="price">Rp. ${product.price.toLocaleString()}</p>
                <p class="description">${product.description}</p>
                <div class="product-quantity">
                  <button class="quantity-btn decrease">-</button>
                  <input type="number" value="1" min="1" id="product-quantity">
                  <button class="quantity-btn increase">+</button>
                </div>
                <button class="btn add-to-cart-btn">Tambahkan ke Keranjang</button>
              </div>
            </div>
          </div>
        `;

      productModal.innerHTML = modalContent;
      document.body.appendChild(productModal);

      feather.replace();

      const closeButton = productModal.querySelector(".close-modal");
      closeButton.addEventListener("click", function () {
        productModal.classList.remove("active");
      });

      const quantityInput = productModal.querySelector("#product-quantity");
      const decreaseBtn = productModal.querySelector(".quantity-btn.decrease");
      const increaseBtn = productModal.querySelector(".quantity-btn.increase");

      decreaseBtn.addEventListener("click", function () {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
          quantityInput.value = currentValue - 1;
        }
      });

      increaseBtn.addEventListener("click", function () {
        const currentValue = parseInt(quantityInput.value);
        quantityInput.value = currentValue + 1;
      });

      const addToCartBtn = productModal.querySelector(".add-to-cart-btn");
      addToCartBtn.addEventListener("click", function () {
        const quantity = parseInt(quantityInput.value);
        addToCart(product, quantity);
        showMessage(
          `${quantity} ${product.name} ditambahkan ke keranjang`,
          "success"
        );
        productModal.classList.remove("active");
      });
    } else {
      productModal.querySelector(".product-detail-image img").src =
        product.image;
      productModal.querySelector(".product-detail-info h2").textContent =
        product.name;
      productModal.querySelector(
        ".price"
      ).textContent = `Rp. ${product.price.toLocaleString()}`;
      productModal.querySelector(".description").textContent =
        product.description;
      productModal.querySelector("#product-quantity").value = 1;
    }

    productModal.classList.add("active");
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      if (
        href === "#" ||
        this.classList.contains("product-detail") ||
        this.classList.contains("add-to-cart")
      ) {
        return;
      }

      e.preventDefault();

      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 60,
          behavior: "smooth",
        });

        navbarNav.classList.remove("active");
      }
    });
  });

  const contactForm = document.querySelector(".contact form");

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = this.querySelector('input[placeholder="Nama"]').value;
    const email = this.querySelector('input[placeholder="Email"]').value;
    const phone = this.querySelector('input[placeholder="No Hp"]').value;
    const message = this.querySelector("textarea").value;

    if (!name || !email || !phone || !message) {
      showMessage("Mohon lengkapi semua field", "error");
      return;
    }

    fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, phone, message }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          showMessage("Pesan berhasil dikirim", "success");
          contactForm.reset();
        } else {
          showMessage(data.error || "Gagal mengirim pesan", "error");
        }
      })
      .catch((error) => {
        console.error("Contact form error:", error);
        showMessage("Terjadi kesalahan saat mengirim pesan", "error");
      });
  });
});
