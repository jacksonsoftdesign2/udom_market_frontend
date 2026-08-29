const REFRESH_WINDOW_MS = 3 * 60 * 1000; // reshuffle roughly every 3 minutes
const RECENT_BOOST_DAYS = 3; // products newer than this get a higher shuffle weight

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function seededRandom(seed) {
  let t = (seed + 0x6D2B79F5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function recencyWeight(product) {
  const created = new Date(product.created_at).getTime();
  if (!created || Number.isNaN(created)) return 1;
  const ageDays = (Date.now() - created) / (1000 * 60 * 60 * 24);
  if (ageDays <= RECENT_BOOST_DAYS) return 5; // newer items shuffle-weighted higher
  return 1;
}

export function fairFeedOrder(products, preferences = null) {
  if (!products || products.length === 0) return [];

  const epoch = Math.floor(Date.now() / REFRESH_WINDOW_MS);

  const withKeys = products.map(p => {
    const seed = hashString(`${epoch}-${p.id}`);
    const r = seededRandom(seed);
    let weight = recencyWeight(p);

    if (preferences?.hasPreferences) {
      if (preferences.boostedVariantIds?.includes(p.variant_id)) weight *= 6;
      else if (preferences.boostedBrandIds?.includes(p.brand_id)) weight *= 4;
      else if (preferences.boostedCategoryIds?.includes(p.category_id)) weight *= 2.5;
    }

    const sortKey = Math.pow(r, 1 / weight);
    return { p, sortKey };
  });

  withKeys.sort((a, b) => b.sortKey - a.sortKey);

  const buckets = new Map();
  const traderOrder = [];
  withKeys.forEach(({ p }) => {
    const key = p.trader_id ?? p.trader_name ?? "unknown";
    if (!buckets.has(key)) {
      buckets.set(key, []);
      traderOrder.push(key);
    }
    buckets.get(key).push(p);
  });

  const result = [];
  let remaining = withKeys.length;
  while (remaining > 0) {
    for (const key of traderOrder) {
      const bucket = buckets.get(key);
      if (bucket.length > 0) {
        result.push(bucket.shift());
        remaining--;
      }
    }
  }

  return result;
}