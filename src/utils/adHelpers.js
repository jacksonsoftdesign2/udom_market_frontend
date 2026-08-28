export function isAdCurrentlyActive(ad) {
  if (!ad.is_active) return false;
  const today = new Date().toISOString().slice(0, 10);
  if (ad.start_date && ad.start_date.slice(0, 10) > today) return false;
  if (ad.end_date && ad.end_date.slice(0, 10) < today) return false;
  return true;
}