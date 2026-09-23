/** App chrome tokens. Keep the app quiet so the card is the loud thing. */
export const ui = {
  bg: '#FFFFFF',
  surface: '#F5F6FA',
  ink: '#14163A', // deep indigo instead of plain black
  muted: '#6A6E8A',
  line: '#E6E7EF',
  marigold: '#F5A300', // primary action
  danger: '#C2362B',
  radius: 14,
  space: (n: number) => n * 4,
} as const;
