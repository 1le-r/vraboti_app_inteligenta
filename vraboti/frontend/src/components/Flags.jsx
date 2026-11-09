import { useId } from 'react';

export function FlagMK() {
  return (
    <svg className="flag" viewBox="-140 -70 280 140" aria-hidden="true">
      <path fill="#D20000" d="M-140-70h280V70h-280z" />
      <path fill="#FFE600" d="M-140 14V-14L140 14V-14zM-14-70h28L0-9zM-14 70h28L0 9zM-140-70h42L12.86 7.72zM-140 70h42L12.86-7.72zM140-70h-42L-12.86 7.72zM140 70h-42L-12.86-7.72z" />
      <circle fill="#D20000" r="25" />
      <circle fill="#FFE600" r="21" />
    </svg>
  );
}

export function FlagGB() {
  const id = useId().replace(/:/g, '');
  return (
    <svg className="flag" viewBox="0 0 60 30" aria-hidden="true">
      <clipPath id={`s${id}`}><path d="M0,0 v30 h60 v-30 z" /></clipPath>
      <clipPath id={`t${id}`}><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" /></clipPath>
      <g clipPath={`url(#s${id})`}>
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#t${id})`} stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

export const FLAGS = { mk: FlagMK, en: FlagGB };
