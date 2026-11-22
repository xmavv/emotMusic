export const GENRE_GROUPS = [
  { id: "hip-hop", label: "Hip hop" },
  { id: "rock", label: "Rock" },
  { id: "pop", label: "Pop" },
  { id: "electronic", label: "Electronic" },
  { id: "metal", label: "Metal" },
  { id: "folk-country", label: "Folk / country" },
  { id: "jazz-blues", label: "Jazz / blues" },
  { id: "rnb-soul", label: "R&B / soul" },
  { id: "reggae-latin-afro", label: "Reggae / latin / afro" },
  { id: "other", label: "Other" },
] as const;

export type GenreGroup = (typeof GENRE_GROUPS)[number]["id"];

export const findGenreGroup = (id: string | null) =>
  GENRE_GROUPS.find((genre) => genre.id === id);
