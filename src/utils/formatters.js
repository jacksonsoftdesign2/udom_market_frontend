export const formatViews = (n) => {
  const num = Number(n) || 0;
  if (num >= 1000) return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}k`;
  return `${num}`;
};