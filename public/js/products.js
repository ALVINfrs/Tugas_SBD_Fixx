window.products = []; // supaya global

let products = [];

async function fetchProducts() {
  try {
    const response = await fetch("/api/products");
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    // ✅ Tambahkan baris ini setelah berhasil fetch:
    products = await response.json();
    window.products = products;

    displayProducts("all");
  } catch (error) {
    console.error("Error:", error);
    const productList = document.getElementById("product-list");
    productList.innerHTML = `
      <div class="error-message">
        <p>Gagal memuat produk. Silakan coba lagi nanti.</p>
      </div>
    `;
  }
}

function displayProducts(filter = "all") {
  const productList = document.getElementById("product-list");
  productList.innerHTML = "";

  let filteredProducts = products;

  if (filter !== "all") {
    filteredProducts = products.filter(
      (product) => product.category === filter
    );
  }

  if (filteredProducts.length === 0) {
    productList.innerHTML = `
      <div class="empty-filter">
        <p>Tidak ada produk dalam kategori ini.</p>
      </div>
    `;
    return;
  }

  filteredProducts.forEach((product) => {
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
          <i data-feather="star" class="star-full"></i>
          
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
  document.querySelectorAll(".product-detail").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      const productId = this.dataset.id;
      const product = products.find((p) => p.id == productId);

      if (product) {
        showProductDetail(product);
      }
    });
  });

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
}

function initFilterButtons() {
  const filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      filterButtons.forEach((btn) => btn.classList.remove("active"));

      this.classList.add("active");

      const filter = this.dataset.filter;
      displayProducts(filter);
    });
  });
}

function showMessage(message, type = "success") {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", `message-${type}`);
  messageDiv.textContent = message;

  document.body.appendChild(messageDiv);

  setTimeout(() => {
    messageDiv.classList.add("show");
  }, 10);

  setTimeout(() => {
    messageDiv.classList.remove("show");
    setTimeout(() => {
      messageDiv.remove();
    }, 300);
  }, 3000);
}
function showProductDetail(product) {
  const modal = document.getElementById("product-detail-modal");

  // Isi konten detail
  document.getElementById("detail-image").src = product.image;
  document.getElementById("detail-name").textContent = product.name;
  document.getElementById(
    "detail-category"
  ).textContent = `Kategori: ${product.category}`;
  document.getElementById("detail-price").textContent =
    product.price.toLocaleString();
  document.getElementById("detail-description").textContent =
    product.description;

  // Tampilkan modal
  modal.classList.add("active");
}

// Tutup modal saat klik tombol close
document.addEventListener("DOMContentLoaded", function () {
  const closeDetail = document.querySelector(
    "#product-detail-modal .close-modal"
  );
  closeDetail.addEventListener("click", () => {
    document.getElementById("product-detail-modal").classList.remove("active");
  });
});

document.addEventListener("DOMContentLoaded", function () {
  fetchProducts();
  initFilterButtons();
});

// Add this function to products.js
function initSearch() {
  const searchBox = document.querySelector("#search-box");

  if (searchBox) {
    searchBox.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase();

      if (searchTerm === "") {
        const activeFilter =
          document.querySelector(".filter-btn.active").dataset.filter;
        displayProducts(activeFilter);
        return;
      }

      const filteredProducts = window.products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm)
      );

      displaySearchResults(filteredProducts, searchTerm);
    });
  }
}

function displaySearchResults(results, searchTerm) {
  const productList = document.getElementById("product-list");
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
  attachProductEventListeners();
}

// Update the DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", function () {
  fetchProducts();
  initFilterButtons();
  initSearch(); // Add this line
});
