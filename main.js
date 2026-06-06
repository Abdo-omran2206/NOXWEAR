function toggleMenu() {
  const dropDown = document.getElementById("drop-down");
  if (dropDown.style.display === "block") {
    dropDown.style.display = "none";
  } else {
    dropDown.style.display = "block";
  }
}

window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const nav = document.getElementById("nav");
  if (scrollTop > 30) {
    nav.classList.add("active");
  }
  if (scrollTop === 0) {
    nav.classList.remove("active");
  }
});

window.onload = function () {
  const productGrid = document.querySelector(".product-grid");

  Products.map((product) => {
    const productCardContainer = document.createElement("div");
    const productCard = document.createElement("div");

    productCard.classList.add("product-card");
    productCard.id = product.id;

    // Click the card → go to product detail page
    productCard.addEventListener("click", (event) => {
      const id = event.currentTarget.id;
      location.assign(`product/index.html?id=${id}`);
    });

    productCardContainer.dataset.aos = "zoom-out";
    productCardContainer.dataset.aosDelay = product.id * 100;

    productCard.innerHTML = `
      <img src="${product.image}" alt="${product.name}" loading="lazy">
      <div class="text-section">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <p class="price">$${product.price}</p>
        <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
      </div>
    `;

    productCardContainer.appendChild(productCard);
    productGrid.appendChild(productCardContainer);

    // Add-to-cart: open modal, don't navigate to product page
    const button = productCard.querySelector(".add-to-cart-btn");
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      addtoCart(product.id);
    });
  });

  // Sync cart badge on landing page load
  updateCartCountBadge();

  if (typeof setJsonLd === "function" && typeof SEO_CONFIG !== "undefined") {
    setJsonLd("json-ld-products", {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "NOXWEAR Products",
      "itemListElement": Products.map((product, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `${SEO_CONFIG.siteUrl}/product/index.html?id=${product.id}`,
        "name": product.name,
      })),
    });
  }
};

function addtoCart(id) {
  showAddCartModal(id);
}
