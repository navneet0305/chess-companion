export interface BoardTheme {
  id: string;
  name: string;
  lightSquare: string;
  darkSquare: string;
  lightHighlight: string;
  darkHighlight: string;
}

export interface CompanionTheme {
  id: string;
  name: string;
  season?: string;
  outfitId: string;
  boardThemeId?: string;
  dialoguePack: string;
  backgroundEffect?: string;
  soundPack?: string;
}

export const BOARD_THEMES: BoardTheme[] = [
  { id: 'classic',  name: 'Classic',  lightSquare: '#e8d5b5', darkSquare: '#b48866', lightHighlight: '#f6f685', darkHighlight: '#baca44' },
  { id: 'emerald',  name: 'Emerald',  lightSquare: '#eeeed2', darkSquare: '#769656', lightHighlight: '#f6f685', darkHighlight: '#baca44' },
  { id: 'midnight', name: 'Midnight', lightSquare: '#dee3e6', darkSquare: '#5b7aa4', lightHighlight: '#c8d8e8', darkHighlight: '#7ba4c8' },
  { id: 'wood',     name: 'Wood',     lightSquare: '#f0d9b5', darkSquare: '#b58863', lightHighlight: '#f7ec5b', darkHighlight: '#dac34a' },
  { id: 'coral',    name: 'Coral',    lightSquare: '#f2d1b2', darkSquare: '#c77843', lightHighlight: '#f7d888', darkHighlight: '#d4a53a' },
];
