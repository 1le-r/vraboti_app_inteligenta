export const initials = (s = '') =>
  s.split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

const LOGO_COLORS = [
  ['var(--accent-soft)', 'var(--accent)'],
  ['var(--amber-soft)', 'var(--amber)'],
  ['var(--blue-soft)', 'var(--blue)'],
  ['var(--red-soft)', 'var(--red)']
];

export function logoColors(company = '') {
  let h = 0;
  for (const ch of company) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return LOGO_COLORS[h % LOGO_COLORS.length];
}
