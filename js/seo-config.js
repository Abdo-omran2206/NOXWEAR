const SEO_CONFIG = {
  siteUrl: "https://abdo-omran2206.github.io/NOXWEAR",
  siteName: "NOXWEAR",
  author: "Akira Omran",
  locale: "en_US",
  email: "info@noxwear.com",
  tagline: "Own Your Vibe. BREAK THE RULES.",
  defaultDescription:
    "NOXWEAR is a Gen Z streetwear brand offering bold hoodies, cargo fits, and technical sets. Shop limited drops with fast shipping and premium quality.",
  defaultKeywords:
    "NOXWEAR, streetwear, Gen Z fashion, hoodies, cargo pants, athleisure, urban wear, Akira Omran",
  defaultImage: "/assets/banner.png",
  logo: "/assets/logo.png",
  twitterHandle: "@noxwear",
};

function absoluteUrl(path) {
  if (!path) return SEO_CONFIG.siteUrl;
  if (path.startsWith("http")) return path;
  return `${SEO_CONFIG.siteUrl}/${path.replace(/^\//, "")}`;
}

function setMetaContent(selector, content) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute("content", content);
}

function setMetaByName(name, content) {
  setMetaContent(`meta[name="${name}"]`, content);
}

function setMetaByProperty(property, content) {
  setMetaContent(`meta[property="${property}"]`, content);
}

function setCanonical(url) {
  const link = document.querySelector('link[rel="canonical"]');
  if (link) link.setAttribute("href", url);
}

function setJsonLd(id, data) {
  let script = document.getElementById(id);
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

function applyPageSeo({ title, description, keywords, url, image, type = "website", robots = "index, follow" }) {
  document.title = title;
  setMetaByName("description", description);
  setMetaByName("keywords", keywords || SEO_CONFIG.defaultKeywords);
  setMetaByName("robots", robots);
  setMetaByName("author", SEO_CONFIG.author);
  setCanonical(url);
  setMetaByProperty("og:title", title);
  setMetaByProperty("og:description", description);
  setMetaByProperty("og:url", url);
  setMetaByProperty("og:type", type);
  setMetaByProperty("og:image", absoluteUrl(image || SEO_CONFIG.defaultImage));
  setMetaByProperty("og:site_name", SEO_CONFIG.siteName);
  setMetaByName("twitter:card", "summary_large_image");
  setMetaByName("twitter:title", title);
  setMetaByName("twitter:description", description);
  setMetaByName("twitter:image", absoluteUrl(image || SEO_CONFIG.defaultImage));
}
