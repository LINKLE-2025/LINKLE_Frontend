// src/types/map.ts
export interface Draft {
  lat: number;
  lng: number;
  address: string;
}

export interface SpotPhoto {
  url: string;
  caption?: string;
}

export interface SpotMessage {
  text: string;
  ts: string; // ISO string
}

export interface Spot {
  id?: string;
  alias: string;
  category: string; // 'food' | 'cafe' | ...
  lat: number;
  lng: number;
  photos?: SpotPhoto[];
  messages?: SpotMessage[];
}
