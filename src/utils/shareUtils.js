import { pickSrc } from "./imageUtils";

export const getProductUrl = (productId) => {
  const base = import.meta.env.VITE_APP_URL || window.location.origin;
  return `${base}/product/${productId}`;
};

export const getShareText = (product) =>
  `${product.name}\nTsh ${Number(product.price || 0).toLocaleString()}\nSold by: ${product.trader_name || "UDOM Market"}\n\n${getProductUrl(product.id)}`;

const loadCanvasImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("fail"));
    img.src = src + (src.includes("?") ? "&" : "?") + "_cb=" + Date.now();
  });

export const generateShareCard = async (product, images, activeImg, avifSupported) => {
  const CARD_W = 800;
  const IMG_H = 560;
  const STRIP_H = 210;

  const canvas = document.createElement("canvas");
  canvas.width = CARD_W;
  canvas.height = IMG_H + STRIP_H;
  const ctx = canvas.getContext("2d");

  // ── Product image (dominant) ──
  const productImgSrc = typeof images[activeImg] === "object"
    ? pickSrc(images[activeImg], "medium", avifSupported)
    : images[activeImg];

  try {
    const productImg = await loadCanvasImage(productImgSrc);
    const scale = Math.max(CARD_W / productImg.width, IMG_H / productImg.height);
    const drawW = productImg.width * scale;
    const drawH = productImg.height * scale;
    ctx.drawImage(productImg, (CARD_W - drawW) / 2, (IMG_H - drawH) / 2, drawW, drawH);
  } catch {
    ctx.fillStyle = "#1a2e6e";
    ctx.fillRect(0, 0, CARD_W, IMG_H);
    ctx.fillStyle = "#ffffff55";
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(product.name, CARD_W / 2, IMG_H / 2);
  }

  // Gradient fade into white strip
  const grad = ctx.createLinearGradient(0, IMG_H - 100, 0, IMG_H);
  grad.addColorStop(0, "rgba(255,255,255,0)");
  grad.addColorStop(1, "rgba(255,255,255,1)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, IMG_H - 100, CARD_W, 100);

  // ── White strip ──
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, IMG_H, CARD_W, STRIP_H);

  const LOGO_SIZE = 64;
  const AVATAR_SIZE = 64;
  const ROW_Y = IMG_H + 22;
  const LOGO_CX = 44 + LOGO_SIZE / 2;
  const LOGO_CY = ROW_Y + LOGO_SIZE / 2;

  // UDOM logo circle
  ctx.beginPath();
  ctx.arc(LOGO_CX, LOGO_CY, LOGO_SIZE / 2, 0, Math.PI * 2);
  ctx.fillStyle = "#1a2e6e";
  ctx.fill();
  ctx.font = "bold 30px sans-serif";
  ctx.fillStyle = "#F5C518";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("U", LOGO_CX, LOGO_CY);

  // Trader avatar circle
  const TRADER_CX = 44 + LOGO_SIZE + 14 + AVATAR_SIZE / 2;
  const TRADER_CY = ROW_Y + AVATAR_SIZE / 2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(TRADER_CX, TRADER_CY, AVATAR_SIZE / 2, 0, Math.PI * 2);
  ctx.clip();

  if (product.trader_image) {
    try {
      const traderImg = await loadCanvasImage(product.trader_image);
      ctx.drawImage(traderImg,
        TRADER_CX - AVATAR_SIZE / 2,
        TRADER_CY - AVATAR_SIZE / 2,
        AVATAR_SIZE, AVATAR_SIZE
      );
    } catch {
      ctx.fillStyle = "#e8edf7";
      ctx.fillRect(TRADER_CX - AVATAR_SIZE / 2, TRADER_CY - AVATAR_SIZE / 2, AVATAR_SIZE, AVATAR_SIZE);
      ctx.restore();
      ctx.fillStyle = "#1a2e6e";
      ctx.font = "bold 26px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(product.trader_name?.charAt(0).toUpperCase() || "T", TRADER_CX, TRADER_CY);
    }
  } else {
    ctx.fillStyle = "#e8edf7";
    ctx.fillRect(TRADER_CX - AVATAR_SIZE / 2, TRADER_CY - AVATAR_SIZE / 2, AVATAR_SIZE, AVATAR_SIZE);
    ctx.restore();
    ctx.fillStyle = "#1a2e6e";
    ctx.font = "bold 26px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(product.trader_name?.charAt(0).toUpperCase() || "T", TRADER_CX, TRADER_CY);
  }
  ctx.restore();

  // Labels beside avatars
  const TEXT_X = 44 + LOGO_SIZE + 14 + AVATAR_SIZE + 16;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#1a2e6e";
  ctx.font = "bold 22px sans-serif";
  ctx.fillText("UDOM Market", TEXT_X, ROW_Y + 28);
  ctx.fillStyle = "#888888";
  ctx.font = "18px sans-serif";
  ctx.fillText(product.trader_name || "Trader", TEXT_X, ROW_Y + 54);

  // Product name (truncated)
  const NAME_Y = IMG_H + 118;
  ctx.fillStyle = "#111111";
  ctx.font = "bold 28px sans-serif";
  const maxW = CARD_W - 88;
  let name = product.name;
  while (ctx.measureText(name).width > maxW && name.length > 10) name = name.slice(0, -1);
  if (name !== product.name) name += "…";
  ctx.fillText(name, 44, NAME_Y);

  // Price
  ctx.fillStyle = "#c49200";
  ctx.font = "bold 26px sans-serif";
  ctx.fillText(`Tsh ${Number(product.price || 0).toLocaleString()}`, 44, NAME_Y + 40);

  // URL
  const url = getProductUrl(product.id).replace(/^https?:\/\//, "");
  ctx.fillStyle = "#aaaaaa";
  ctx.font = "16px sans-serif";
  ctx.fillText(url, 44, NAME_Y + 72);

  // Navy bottom bar
  ctx.fillStyle = "#1a2e6e";
  ctx.fillRect(0, IMG_H + STRIP_H - 10, CARD_W, 10);

  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
};