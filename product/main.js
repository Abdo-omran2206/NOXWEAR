const params = new URLSearchParams(window.location.search);
const id = params.get("id");

window.onload = () => {
  const side_image = document.getElementById("side-image");
  const mainImage = document.getElementById("main-image");
  const name = document.getElementById("name");
  const price = document.getElementById("price");
  const description = document.getElementById("description");
  const sizesContiner = document.getElementById("sizes-continer");
  const product = Products.find((p) => p.id == id);

  if (product) {
    const pageUrl = `${SEO_CONFIG.siteUrl}/product/index.html?id=${product.id}`;
    const pageTitle = `${product.name} | NOXWEAR`;
    const pageDescription = product.description.slice(0, 160);

    applyPageSeo({
      title: pageTitle,
      description: pageDescription,
      url: pageUrl,
      image: product.image,
      type: "product",
    });

    setMetaByProperty("product:price:amount", String(product.price));
    setMetaByProperty("product:price:currency", "USD");

    setJsonLd("json-ld-product", {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      image: absoluteUrl(product.image),
      description: product.description,
      sku: `NOX-${product.id}`,
      brand: { "@type": "Brand", name: SEO_CONFIG.siteName },
      manufacturer: { "@type": "Person", name: SEO_CONFIG.author },
      offers: {
        "@type": "Offer",
        url: pageUrl,
        priceCurrency: "USD",
        price: product.price,
        availability: "https://schema.org/InStock",
        seller: { "@type": "Organization", name: SEO_CONFIG.siteName },
      },
    });

    setJsonLd("json-ld-breadcrumb", {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SEO_CONFIG.siteUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Products",
          item: `${SEO_CONFIG.siteUrl}/index.html#Products`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: product.name,
          item: pageUrl,
        },
      ],
    });

    document.title = pageTitle;
    mainImage.src = `../${product.image}`;
    mainImage.alt = `${product.name} — NOXWEAR streetwear`;
    name.innerText = product.name;
    const breadcrumbName = document.getElementById("breadcrumb-name");
    if (breadcrumbName) breadcrumbName.innerText = product.name;
    price.innerText = "$" + product.price;
    description.innerText = product.description;
    side_image.innerHTML = "";

    // Gallery thumbnails
    product.gallery.map((image) => {
      const img = document.createElement("img");
      img.classList.add("side-image-class");
      img.loading = "lazy"
      img.src = `../${image}`;
      img.addEventListener("click", () => {
        mainImage.src = img.src;
      });
      side_image.appendChild(img);
    });

    // Sizes
    product.sizes.map((size, index) => {
      const sizebox = document.createElement("button");
      sizebox.classList.add("sizebox");
      sizebox.innerText = size;
      sizebox.addEventListener("click", () => {
        const currentActive = sizesContiner.querySelector(".active");
        if (currentActive) currentActive.classList.remove("active");
        sizebox.classList.add("active");
      });
      if (index === 0) sizebox.classList.add("active");
      sizesContiner.appendChild(sizebox);
    });

    // Colors — store name & code as data attributes for cart reading
    const colorsContiner = document.getElementById("colors-continer");
    if (product.colors && colorsContiner) {
      product.colors.map((color, index) => {
        const colorbox = document.createElement("button");
        colorbox.classList.add("colorbox");
        colorbox.style.backgroundColor = color.code;
        colorbox.title = color.name;
        colorbox.dataset.colorName = color.name;
        colorbox.dataset.colorCode = color.code;

        colorbox.addEventListener("click", () => {
          const currentActive = colorsContiner.querySelector(".active");
          if (currentActive) currentActive.classList.remove("active");
          colorbox.classList.add("active");
        });

        if (index === 0) colorbox.classList.add("active");
        colorsContiner.appendChild(colorbox);
      });
    }else{
      document.getElementById("colors-group").style.display = "none"
    }

    // Add to Cart button — real localStorage integration
    const cartButton = document.querySelector(".cart-button");
    if (cartButton) {
      cartButton.addEventListener("click", () => {
        const activeSize = sizesContiner.querySelector(".sizebox.active");
        const selectedSize = activeSize ? activeSize.innerText : product.sizes[0];

        const colorsContinerEl = document.getElementById("colors-continer");
        const activeColor = colorsContinerEl
          ? colorsContinerEl.querySelector(".colorbox.active")
          : null;
        const selectedColor = activeColor
          ? { name: activeColor.dataset.colorName, code: activeColor.dataset.colorCode }
          : product.colors[0];

        const counter = document.getElementById("counter");
        const quantity = counter ? Math.max(1, parseInt(counter.innerText, 10) || 1) : 1;

        const cartItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          size: selectedSize,
          color: selectedColor,
          quantity: quantity,
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

        showToastNotification(
          `Added ${quantity}\u00d7 ${product.name} (${selectedSize} / ${selectedColor.name}) to cart!`
        );

        updateCartCountBadge();
      });
    }
  } else {
    applyPageSeo({
      title: "Product Not Found | NOXWEAR",
      description: "The requested NOXWEAR product could not be found.",
      url: `${SEO_CONFIG.siteUrl}/product/index.html`,
      robots: "noindex, nofollow",
    });
    document.title = "Product Not Found | NOXWEAR";
  }

  // Sync badge on page load
  updateCartCountBadge();
};

function toggleMenu() {
  const dropDown = document.getElementById("drop-down");
  if (dropDown.style.display === "block") {
    dropDown.style.display = "none";
  } else {
    dropDown.style.display = "block";
  }
}

function handleCounter(state) {
  const counter = document.getElementById("counter");
  let num = parseInt(counter.innerText, 10);
  if (Number.isNaN(num)) num = 1;

  if (state === "plus") {
    counter.innerText = num + 1;
  } else if (num > 1) {
    counter.innerText = num - 1;
  }
}
