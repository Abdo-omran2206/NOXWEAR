function showAddCartModal(productId) {
  const product = Products.find((p) => p.id == productId);
  if (!product) return;

  let selectedSize = product.sizes?.[0] || "";
  let selectedColor = product.colors?.[0] || {};
  let quantity = 1;

  Swal.fire({
    title: `${product.name}`,
    showCloseButton: true,
    showConfirmButton: false,
    background:"#1a1a1a",
    color:"#fff",
    width: 760,
    customClass: {
      popup: "quick-add-swal-popup",
      htmlContainer: "quick-add-swal-html"
    },
    html: `
      <div class="quick-add-layout">
        <div class="quick-add-image-col">
          <img src="${product.image}" alt="${product.name}" class="quick-add-img" loading="lazy"/>
        </div>

        <div class="quick-add-info-col">
          <p class="quick-add-price">$${product.price}</p>
          <p class="quick-add-description">${product.description}</p>

          <div class="quick-add-selection">
            <span class="selection-label">Select Size</span>
            <div class="quick-add-sizes">
              ${product.sizes
                .map(
                  (size, idx) =>
                    `<button class="quick-add-size-box ${
                      idx === 0 ? "active" : ""
                    }" data-size="${size}">${size}</button>`
                )
                .join("")}
            </div>
          </div>

          <div class="quick-add-selection">
            ${product.colors && product.colors.length > 0 ?
              `<span class="selection-label">Select Color</span>` : ""
            }
            <div class="quick-add-colors">
              ${product.colors && product.colors.length > 0 ?
                product.colors.map(
                  (color, idx) =>
                    `<button class="quick-add-color-box ${
                      idx === 0 ? "active" : ""
                    }" data-color-name="${color.name}" data-color-code="${color.code}" style="background-color: ${color.code};" title="${color.name}"></button>`
                )
                .join("") : ""}
            </div>
          </div>

          <div class="quick-add-action-row">
            <div class="quick-add-counter-box">
              <button class="counter-btn minus-btn"><i class="fas fa-minus"></i></button>
              <span class="counter-value">1</span>
              <button class="counter-btn plus-btn"><i class="fas fa-plus"></i></button>
            </div>
            <button class="quick-add-submit-btn">
              <i class="fas fa-shopping-bag"></i> Add To Cart
            </button>
          </div>
        </div>
      </div>
    `,
    didOpen: () => {
      const swalContainer = Swal.getHtmlContainer();
      const sizeBoxes = swalContainer.querySelectorAll(".quick-add-size-box");
      const colorBoxes = swalContainer.querySelectorAll(".quick-add-color-box");
      const minusBtn = swalContainer.querySelector(".minus-btn");
      const plusBtn = swalContainer.querySelector(".plus-btn");
      const counterValue = swalContainer.querySelector(".counter-value");
      const submitBtn = swalContainer.querySelector(".quick-add-submit-btn");

      const updateCounter = () => {
        counterValue.textContent = quantity;
      };

      sizeBoxes.forEach((box) => {
        box.addEventListener("click", () => {
          sizeBoxes.forEach((b) => b.classList.remove("active"));
          box.classList.add("active");
          selectedSize = box.getAttribute("data-size");
        });
      });

      colorBoxes.forEach((box) => {
        box.addEventListener("click", () => {
          colorBoxes.forEach((b) => b.classList.remove("active"));
          box.classList.add("active");
          selectedColor = {
            name: box.getAttribute("data-color-name"),
            code: box.getAttribute("data-color-code")
          };
        });
      });

      plusBtn.addEventListener("click", () => {
        quantity++;
        updateCounter();
      });

      minusBtn.addEventListener("click", () => {
        if (quantity > 1) {
          quantity--;
          updateCounter();
        }
      });

      submitBtn.addEventListener("click", () => {
        const cartItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          size: selectedSize,
          color: selectedColor,
          quantity: quantity
        };

        let cart = JSON.parse(localStorage.getItem("noxwear_cart")) || [];
        const existingIndex = cart.findIndex(
          (item) =>
            item.id === cartItem.id &&
            item.size === cartItem.size &&
            item.color.code === cartItem.color.code
        );

        if (existingIndex > -1) {
          cart[existingIndex].quantity += quantity;
        } else {
          cart.push(cartItem);
        }

        localStorage.setItem("noxwear_cart", JSON.stringify(cart));

        Swal.close();
        showToastNotification(`Added ${quantity}x ${product.name} (${selectedSize} / ${selectedColor.name}) to cart!`);
        updateCartCountBadge();
      });
    }
  });
}

function showToastNotification(message) {
  try {
    if (typeof Swal !== "undefined" && typeof Swal.fire === "function") {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: message,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: "#1a1a1a",
        color: "#ffffff",
        customClass: {
          popup: "swal2-toast-popup"
        }
      });
      return;
    }
  } catch (error) {
    console.error("SweetAlert2 toast failed:", error);
  }

  // Fallback when SweetAlert2 is not available
  alert(message);
}

window.showToastNotification = showToastNotification;

function updateCartCountBadge() {
  const cart = JSON.parse(localStorage.getItem("noxwear_cart")) || [];
  const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  
  // Find or create cart badge on navbar
  const cartIcon = document.getElementById("cart-icon");
  if (cartIcon) {
    let badge = cartIcon.querySelector(".cart-badge");
    if (totalCount > 0) {
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "cart-badge";
        cartIcon.appendChild(badge);
      }
      badge.textContent = totalCount;
    } else if (badge) {
      badge.remove();
    }
  }
}

// Initial count update on load
window.addEventListener("DOMContentLoaded", () => {
  updateCartCountBadge();
});
