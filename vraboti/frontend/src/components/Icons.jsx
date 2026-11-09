const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const Search = () => <svg className="icon" viewBox="0 0 24 24" {...s}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
export const Pin = () => <svg className="icon" style={{ width: 14, height: 14 }} viewBox="0 0 24 24" {...s}><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></svg>;
export const Star = ({ filled }) => (
  <svg className="icon" viewBox="0 0 24 24" {...s} fill={filled ? 'currentColor' : 'none'}>
    <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z" />
  </svg>
);
export const Close = () => <svg className="icon" viewBox="0 0 24 24" {...s}><path d="M6 6l12 12M18 6 6 18" /></svg>;
export const Plus = () => <svg className="icon" viewBox="0 0 24 24" {...s} strokeWidth={2.4}><path d="M12 5v14M5 12h14" /></svg>;
export const Logout = () => <svg className="icon" viewBox="0 0 24 24" {...s}><path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" /></svg>;
export const UserIc = () => <svg width="24" height="24" viewBox="0 0 24 24" {...s}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>;
export const Brief = () => <svg width="24" height="24" viewBox="0 0 24 24" {...s}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" /></svg>;
export const FileIc = () => <svg width="22" height="22" viewBox="0 0 24 24" {...s}><path d="M14 3H6v18h12V7z" /><path d="M14 3v4h4M9 13h6M9 17h4" /></svg>;
export const Edit = () => <svg className="icon" style={{ width: 16, height: 16 }} viewBox="0 0 24 24" {...s}><path d="M4 20h4L19 9l-4-4L4 16z" /></svg>;
export const Trash = () => <svg className="icon" style={{ width: 16, height: 16 }} viewBox="0 0 24 24" {...s}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>;
export const Eye = () => <svg className="icon" viewBox="0 0 24 24" {...s}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>;
export const EyeOff = () => <svg className="icon" viewBox="0 0 24 24" {...s}><path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 3.8M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6M3 3l18 18M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>;
export const Arrow = () => <svg className="icon" viewBox="0 0 24 24" {...s}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
export const Users = () => <svg width="20" height="20" viewBox="0 0 24 24" {...s}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c1-3.5 3.5-5.5 6.5-5.5s5.5 2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5c2 .7 3.2 2.6 3.7 5.5" /></svg>;
export const Megaphone = () => <svg width="20" height="20" viewBox="0 0 24 24" {...s}><path d="M3 10v4h4l7 5V5L7 10zM17.5 8.5a5 5 0 0 1 0 7" /></svg>;
export const Flow = () => <svg width="20" height="20" viewBox="0 0 24 24" {...s}><path d="M4 6h10M4 12h16M4 18h7" /><circle cx="17" cy="6" r="2" /><circle cx="14" cy="18" r="2" /></svg>;
export const Mail = () => <svg width="26" height="26" viewBox="0 0 24 24" {...s}><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" /></svg>;
