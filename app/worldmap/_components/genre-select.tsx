import { findGenreGroup, GENRE_GROUPS, type GenreGroup } from "@/utils/genres";

const BUTTON_CLASS =
  "block h-6.5 max-w-28 cursor-pointer appearance-none overflow-hidden text-ellipsis whitespace-nowrap rounded-full border border-neutral-700 bg-neutral-950 pl-3 pr-7 leading-6 outline-none scheme-dark field-sizing-content hover:text-neutral-100 focus-visible:border-neutral-400 sm:max-w-48";
const CUSTOM_LIST_CLASS =
  "supports-[appearance:base-select]:[appearance:base-select] [&::picker-icon]:hidden supports-[appearance:base-select]:[&::picker(select)]:[appearance:base-select]";
const LIST_CLASS =
  "[&::picker(select)]:mt-1.5 [&::picker(select)]:rounded-xl [&::picker(select)]:border [&::picker(select)]:border-neutral-800 [&::picker(select)]:bg-neutral-900 [&::picker(select)]:p-1 [&::picker(select)]:text-neutral-300 [&::picker(select)]:shadow-xl";
const OPTION_CLASS =
  "min-h-0 cursor-pointer rounded-lg px-3 py-1.5 outline-none checked:text-amber-300 hover:bg-neutral-800 focus-visible:bg-neutral-800 [&::checkmark]:hidden";

interface GenreSelectProps {
  genre: GenreGroup | null;
  isLoading: boolean;
  failed: boolean;
  onGenreChange: (genre: GenreGroup | null) => void;
}

export function GenreSelect({
  genre,
  isLoading,
  failed,
  onGenreChange,
}: GenreSelectProps) {
  return (
    <div className="flex items-center gap-3 text-xs text-neutral-400">
      <div className={`relative ${isLoading ? "animate-pulse" : ""}`}>
        <select
          aria-label="Genre"
          aria-busy={isLoading}
          value={genre ?? ""}
          onChange={(ev) =>
            onGenreChange(findGenreGroup(ev.target.value)?.id ?? null)
          }
          className={`${BUTTON_CLASS} ${CUSTOM_LIST_CLASS} ${LIST_CLASS} ${genre ? "text-neutral-100" : ""}`}
        >
          <option value="" className={OPTION_CLASS}>
            All genres
          </option>
          {GENRE_GROUPS.map(({ id, label }) => (
            <option key={id} value={id} className={OPTION_CLASS}>
              {label}
            </option>
          ))}
        </select>
        <svg
          viewBox="0 0 10 10"
          className="pointer-events-none absolute right-3 top-1/2 size-2.5 -translate-y-1/2"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M1.5 3.5 5 7l3.5-3.5" />
        </svg>
      </div>
      {failed && <span role="alert">Could not load genre.</span>}
    </div>
  );
}
