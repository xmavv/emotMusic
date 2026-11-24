CREATE INDEX "ArtistsLocations_country_idx"
  ON "public"."ArtistsLocations" ("country");

CREATE INDEX "Songs_artistId_date_id_idx"
  ON "public"."Songs" ("artistId", "date" DESC, "id" DESC);

CREATE INDEX "Songs_date_id_idx"
  ON "public"."Songs" ("date" DESC, "id" DESC);

CREATE INDEX "Songs_genreGroup_date_id_idx"
  ON "public"."Songs" ("genreGroup", "date" DESC, "id" DESC);

CREATE INDEX "SongsEmotions_joy_id_idx"
  ON "public"."SongsEmotions" ("joy" DESC, "id" DESC);

CREATE INDEX "SongsEmotions_trust_id_idx"
  ON "public"."SongsEmotions" ("trust" DESC, "id" DESC);

CREATE INDEX "SongsEmotions_fear_id_idx"
  ON "public"."SongsEmotions" ("fear" DESC, "id" DESC);

CREATE INDEX "SongsEmotions_surprise_id_idx"
  ON "public"."SongsEmotions" ("surprise" DESC, "id" DESC);

CREATE INDEX "SongsEmotions_sadness_id_idx"
  ON "public"."SongsEmotions" ("sadness" DESC, "id" DESC);

CREATE INDEX "SongsEmotions_disgust_id_idx"
  ON "public"."SongsEmotions" ("disgust" DESC, "id" DESC);

CREATE INDEX "SongsEmotions_anger_id_idx"
  ON "public"."SongsEmotions" ("anger" DESC, "id" DESC);

CREATE INDEX "SongsEmotions_anticipation_id_idx"
  ON "public"."SongsEmotions" ("anticipation" DESC, "id" DESC);

CREATE FUNCTION "public"."country_songs"(
  country_code text,
  page_size integer,
  song_year integer DEFAULT NULL,
  song_genre text DEFAULT NULL,
  sort_emotion text DEFAULT NULL,
  cursor_id bigint DEFAULT NULL
)
RETURNS TABLE (
  "id" bigint,
  "name" text,
  "artist" text,
  "date" date,
  "genre" text,
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
DECLARE
  sort_table text := CASE WHEN sort_emotion IS NULL THEN 'Songs' ELSE 'SongsEmotions' END;
  sort_alias text := CASE WHEN sort_emotion IS NULL THEN 'song' ELSE 'emotions' END;
  sort_type text := CASE WHEN sort_emotion IS NULL THEN 'date' ELSE 'numeric' END;
  sort_column text := COALESCE(sort_emotion, 'date');
  cursor_value text := 'infinity';
BEGIN
  IF cursor_id IS NOT NULL THEN
    EXECUTE format('SELECT %I::text FROM "public".%I WHERE "id" = $1', sort_column, sort_table)
    INTO cursor_value
    USING cursor_id;
  END IF;

  RETURN QUERY EXECUTE format('
    SELECT
      song."id", song."name", artist."artist", song."date",
      trim(split_part(song."genre", '','', 1)),
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
      AND (%1$I.%2$I, %1$I."id") < ($4::%3$s, $5)
      AND ($6 IS NULL OR song."genreGroup" = $6)
    ORDER BY %1$I.%2$I DESC, %1$I."id" DESC
    LIMIT $7', sort_alias, sort_column, sort_type)
  USING
    country_code,
    COALESCE(make_date(song_year, 1, 1), '-infinity'::date),
    COALESCE(make_date(song_year, 12, 31), 'infinity'::date),
    cursor_value,
    COALESCE(cursor_id, 0),
    song_genre,
    page_size;
END;
$$;

REVOKE EXECUTE ON FUNCTION "public"."country_songs"(text, integer, integer, text, text, bigint) FROM PUBLIC, "anon", "authenticated";
GRANT EXECUTE ON FUNCTION "public"."country_songs"(text, integer, integer, text, text, bigint) TO "service_role";
