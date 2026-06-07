function getCartData() {
  return JSON.parse(localStorage.getItem("noxwear_cart")) || [];
}

function saveCartData(cart) {
  localStorage.setItem("noxwear_cart", JSON.stringify(cart));
}

document.getElementById("cart-icon").addEventListener("click", () => {
  const data = getCartData();

  if (data.length === 0) {
    Swal.fire({
      title: "Your cart is empty",
      background: "#1a1a1a",
      color: "#fff",
      confirmButtonColor: "#007BFF",
    });
    return;
  }

  Swal.fire({
    title: "NOXWEAR - Cart",
    background: "#1a1a1a",
    color: "#fff",
    confirmButtonText: "Check Out",
    confirmButtonColor: "#007BFF",
    showCancelButton: true,
    html: `
      <div class="cart-modal-content">
        <ul class="cart-product-list">
          ${renderElement(data)}
        </ul>
      </div>
    `,
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = formatPagePath("checkout/index.html");
    }
  });
});

function renderElement(data) {
  return data
    .map((product, idx) => `
      <li class="cart-product-card">
        <img src="${formatImageSrc(product.image)}" alt="${product.name}" loading="lazy"/>
        <div class="cart-product-details">
          <h4>Name: ${product.name}</h4>
          <p>Price: $${product.price}</p>
          <p>Quantity: ${product.quantity}</p>
          <div>
            <button type="button" class="cancel-order" onclick="cancelOrder(${idx})">
              Remove
            </button>
          </div>
        </div>
      </li>
    `)
    .join("");
}

function formatImageSrc(path) {
  if (!path) return "";

  const inSubfolder = window.location.pathname.includes("/checkout") || window.location.pathname.includes("/product");

  if (inSubfolder) {
    return `../${path}`
  }
  return path
}

function formatPagePath(path) {
  if (!path) return "";

  const inSubfolder = window.location.pathname.includes("/checkout") || window.location.pathname.includes("/product");

  if (inSubfolder) {
    return `../${path}`
  }
  return path

}

function cancelOrder(idx) {
  const data = getCartData();
  if (idx < 0 || idx >= data.length) {
    return;
  }

  data.splice(idx, 1);
  saveCartData(data);
  updateCartCountBadge();

  const container = Swal.getHtmlContainer();
  if (container) {
    container.innerHTML = data.length
      ? `
          <div class="cart-modal-content">
            <ul class="cart-product-list">
              ${renderElement(data)}
            </ul>
          </div>
        `
      : `
          <div class="cart-empty-message">
            <p>Your cart is now empty.</p>
          </div>
        `;
  }
}
