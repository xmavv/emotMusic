CREATE INDEX "ArtistsLocations_country_idx"
  ON "public"."ArtistsLocations" ("country");

CREATE INDEX "Songs_artistId_date_id_idx"
  ON "public"."Songs" ("artistId", "date" DESC, "id" DESC);

CREATE INDEX "Songs_date_id_idx"
  ON "public"."Songs" ("date" DESC, "id" DESC);

CREATE FUNCTION "public"."country_songs"(
  country_code text,
  page_size integer,
  song_year integer DEFAULT NULL,
  cursor_date date DEFAULT NULL,
  cursor_id bigint DEFAULT NULL
)
RETURNS TABLE (
  "id" bigint,
  "name" text,
  "artist" text,
  "date" date,
  "joy" double precision,
  "trust" double precision,
  "fear" double precision,
  "surprise" double precision,
  "sadness" double precision,
  "disgust" double precision,
  "anger" double precision,
  "anticipation" double precision
)
LANGUAGE plpgsql
STABLE
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY EXECUTE '
    SELECT
      song."id", song."name", artist."artist", song."date",
      emotions."joy"::double precision,
      emotions."trust"::double precision,
      emotions."fear"::double precision,
      emotions."surprise"::double precision,
      emotions."sadness"::double precision,
      emotions."disgust"::double precision,
      emotions."anger"::double precision,
      emotions."anticipation"::double precision
    FROM "public"."Songs" AS song
    JOIN "public"."ArtistsLocations" AS artist ON artist."id" = song."artistId"
    JOIN "public"."SongsEmotions" AS emotions ON emotions."id" = song."id"
    WHERE artist."country" = $1
      AND song."date" >= $2
      AND song."date" <= $3
      AND (song."date", song."id") < ($4, $5)
    ORDER BY song."date" DESC, song."id" DESC
    LIMIT $6'
  USING
    country_code,
    COALESCE(make_date(song_year, 1, 1), '-infinity'::date),
    COALESCE(make_date(song_year, 12, 31), 'infinity'::date),
    COALESCE(cursor_date, 'infinity'::date),
    COALESCE(cursor_id, 0),
    page_size;
END;
$$;

REVOKE EXECUTE ON FUNCTION "public"."country_songs"(text, integer, integer, date, bigint) FROM PUBLIC, "anon", "authenticated";
GRANT EXECUTE ON FUNCTION "public"."country_songs"(text, integer, integer, date, bigint) TO "service_role";
