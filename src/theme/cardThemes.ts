export interface CardTheme {
  id: string;
  name: string;
  bg: [string, string]; // gradient top-left -> bottom-right
  text: string;
  muted: string;
  accent: string;
  route: string;
}

/** Add a theme here and it shows up in the picker automatically. */
export const CARD_THEMES: CardTheme[] = [
  {
    id: 'marigold',
    name: 'Marigold',
    bg: ['#F7B21A', '#EF7B12'],
    text: '#14163A',
    muted: 'rgba(20,22,58,0.62)',
    accent: '#FFFFFF',
    route: '#14163A',
  },
  {
    id: 'monsoon',
    name: 'Monsoon',
    bg: ['#14163A', '#2B3A8C'],
    text: '#FFFFFF',
    muted: 'rgba(255,255,255,0.62)',
    accent: '#F5A300',
    route: '#F5A300',
  },
  {
    id: 'peacock',
    name: 'Peacock',
    bg: ['#0E6E6E', '#083F46'],
    text: '#FFFFFF',
    muted: 'rgba(255,255,255,0.62)',
    accent: '#F5C542',
    route: '#F5C542',
  },
  {
    id: 'chalk',
    name: 'Chalk',
    bg: ['#FFFFFF', '#EEF0F6'],
    text: '#14163A',
    muted: '#6A6E8A',
    accent: '#0E6E6E',
    route: '#0E6E6E',
  },
];
