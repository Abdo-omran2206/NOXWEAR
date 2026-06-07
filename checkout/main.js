function toggleMenu() {
  const dropDown = document.getElementById("drop-down");
  dropDown.style.display = dropDown.style.display === "block" ? "none" : "block";
}

window.addEventListener("scroll", () => {
  const nav = document.getElementById("nav");
  if (!nav) return;
  nav.classList.toggle("active", window.scrollY > 30);
});

function getCartData() {
  return JSON.parse(localStorage.getItem("noxwear_cart")) || [];
}

function renderCartItems() {
  const cartItemsEl = document.getElementById("cart-items");
  const orderTotalEl = document.getElementById("order-total");
  const cart = getCartData();

  if (!cartItemsEl || !orderTotalEl) return;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="empty-cart-message">Your cart is empty. Add items before checking out.</p>';
    orderTotalEl.textContent = "$0.00";
    return;
  }

  let total = 0;

  cartItemsEl.innerHTML = cart
    .map((item) => {
      const lineTotal = item.price * item.quantity;
      total += lineTotal;
      return `
        <article class="checkout-item">
          <div class="checkout-item-image">
            <img src="../${item.image}" alt="${item.name}" loading="lazy">
          </div>
          <div class="checkout-item-details">
            <h4 class="checkout-item-name">${item.name}</h4>
            <div class="checkout-item-tags">
              <span class="checkout-item-tag">Size ${item.size}</span>
              <span class="checkout-item-tag checkout-item-color">
                <span class="color-dot" style="background-color: ${item.color.code}"></span>
                ${item.color.name}
              </span>
            </div>
            <span class="checkout-item-qty">Qty: ${item.quantity}</span>
          </div>
          <div class="checkout-item-price">
            <span class="checkout-item-unit">$${item.price.toFixed(2)} each</span>
            <span class="checkout-item-total">$${lineTotal.toFixed(2)}</span>
          </div>
        </article>
      `;
    })
    .join("");

  orderTotalEl.textContent = `$${total.toFixed(2)}`;
}

const GOFILE_TOKEN = "";
// Use /exec (deployed web app), not /dev — /dev blocks cross-origin requests from localhost
const SCRIPT_URL = "";

function getCartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function buildPaymentFileName(method, phone, file) {
  const ext = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "jpg";
  const safePhone = phone.replace(/\D/g, "");
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const date = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`;
  const time = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

  return `${method}-${safePhone}-${date}_${time}.${ext}`;
}

function renamePaymentFile(file, method, phone) {
  const fileName = buildPaymentFileName(method, phone, file);
  return new File([file], fileName, { type: file.type, lastModified: file.lastModified });
}

async function uploadPaymentProof(file) {
  const formData = new FormData();
  formData.append("file", file, file.name);

  const response = await fetch("https://upload.gofile.io/uploadfile", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GOFILE_TOKEN}`,
    },
    body: formData,
  });

  const result = await response.json();

  if (result.status !== "ok" || !result.data) {
    throw new Error("Payment screenshot upload failed.");
  }

  return result.data.downloadPage || `https://gofile.io/d/${result.data.code}`;
}

async function submitOrder(orderData) {
  // Form-encoded POST avoids a CORS preflight (JSON + custom Content-Type triggers OPTIONS, which GAS does not support)
  const response = await fetch(SCRIPT_URL, {
    method: "POST",
    body: new URLSearchParams({
      data: JSON.stringify(orderData),
    }),
  });

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    if (!response.ok) {
      throw new Error("Order submission failed.");
    }
    return { status: "ok" };
  }
}

document.getElementById("checkout-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const cart = getCartData();
  if (cart.length === 0) {
    Swal.fire({
      title: "Cart is empty",
      text: "Add products to your cart before confirming payment.",
      icon: "warning",
      background: "#1a1a1a",
      color: "#fff",
      confirmButtonColor: "#8b5cf6",
    });
    return;
  }

  const form = e.target;
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const paymentFile = form.paymentProof.files[0];
  if (!paymentFile) {
    form.reportValidity();
    return;
  }

  const submitBtn = form.querySelector(".submit-btn");
  if (submitBtn) submitBtn.disabled = true;

  Swal.fire({
    title: "Submitting order...",
    text: "Uploading payment proof and saving your order.",
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
    background: "#1a1a1a",
    color: "#fff",
  });

  try {
    const renamedFile = renamePaymentFile(
      paymentFile,
      form.paymentMethod.value,
      form.phone.value.trim()
    );
    const imageUrl = await uploadPaymentProof(renamedFile);

    await submitOrder({
      name: form.fullName.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      method: form.paymentMethod.value,
      imageUrl,
      total: getCartTotal(cart).toFixed(2),
      products: cart,
    });

    await Swal.fire({
      title: "Order Received!",
      text: "We'll verify your payment and contact you shortly.",
      icon: "success",
      background: "#1a1a1a",
      color: "#fff",
      confirmButtonColor: "#00ffb2",
    });

    localStorage.removeItem("noxwear_cart");
    window.location.href = "../index.html";
  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      title: "Submission failed",
      text: "Could not complete your order. Please try again.",
      icon: "error",
      background: "#1a1a1a",
      color: "#fff",
      confirmButtonColor: "#8b5cf6",
    });
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
});
const PAYMENT_NUMBERS = {
  instapay: { label: "Instapay", number: "01234567891" },
  "vodafone-cash": { label: "Vodafone Cash", number: "01098765432" },
};

function updatePaymentNumber(method) {
  const payment = PAYMENT_NUMBERS[method] || PAYMENT_NUMBERS.instapay;
  const labelEl = document.getElementById("payment-method-label");
  const numberEl = document.getElementById("payment-number-value");

  if (labelEl) labelEl.textContent = payment.label;
  if (numberEl) numberEl.textContent = payment.number;
}

async function copyPaymentNumber() {
  const numberEl = document.getElementById("payment-number-value");
  const copyBtn = document.getElementById("copy-payment-number");
  if (!numberEl) return;

  const number = numberEl.textContent.trim();

  try {
    await navigator.clipboard.writeText(number);
    if (copyBtn) {
      const label = copyBtn.querySelector("span");
      copyBtn.classList.add("copied");
      if (label) label.textContent = "Copied!";
      setTimeout(() => {
        copyBtn.classList.remove("copied");
        if (label) label.textContent = "Copy";
      }, 2000);
    }
  } catch {
    Swal.fire({
      title: "Copy failed",
      text: "Please copy the number manually.",
      icon: "error",
      background: "#1a1a1a",
      color: "#fff",
      confirmButtonColor: "#8b5cf6",
    });
  }
}

document.querySelectorAll('input[name="paymentMethod"]').forEach((radio) => {
  radio.addEventListener("change", (e) => updatePaymentNumber(e.target.value));
});

document.getElementById("copy-payment-number")?.addEventListener("click", copyPaymentNumber);

updatePaymentNumber("instapay");
renderCartItems();
