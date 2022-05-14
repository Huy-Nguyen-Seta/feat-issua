export function calculatePosition({
  x = 130,
  y = 130,
  radius = 100,
  alpha = 0,
  value = 10,
}) {
  const x1 = x + radius * Math.sin(alpha);
  const y1 = y + radius * Math.cos(alpha);
  const x2 = x1 + (value / 4) * Math.sin(alpha);
  const y2 = y1 + (value / 4) * Math.cos(alpha);
  return [x1, y1, x2, y2];
}
