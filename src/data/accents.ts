export type Accent = 'sand' | 'sky' | 'mint' | 'mono';

export const ACCENTS: { id: Accent; label: string; swatch: string }[] = [
  { id: 'sand', label: 'Sand', swatch: '#c5ac98' },
  { id: 'sky', label: 'Sky', swatch: '#8ab4f8' },
  { id: 'mint', label: 'Mint', swatch: '#19c39b' },
  { id: 'mono', label: 'Mono', swatch: '#e7e5e4' },
];

export const ACCENT_KEY = 'banker_accent_v1';
