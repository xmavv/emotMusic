CREATE FUNCTION "public"."genre_group"(genre text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = ''
AS $$
  SELECT CASE
    WHEN main ~ 'metal|hardcore|deathcore|grindcore'                                        THEN 'metal'
    WHEN main ~ 'rap rock|rapcore|pop rock|pop punk|country rock|folk rock|soul rock'       THEN 'rock'
    WHEN main ~ 'hip.?hop|\mrap\M|trap|drill|grime|crunk' AND main !~ 'trip.?hop'           THEN 'hip-hop'
    WHEN main ~ 'reggae|\mska\M|dancehall|\mdub\M|latin|afro|salsa|bachata|cumbia|samba|bossa' THEN 'reggae-latin-afro'
    WHEN main ~ 'electro|house|techno|trance|\medm\M|dance|dubstep|drum and bass|ambient|synth|\midm\M|disco|trip.?hop|chillwave|downtempo' THEN 'electronic'
    WHEN main ~ 'r&b|\mrnb\M|soul|funk|gospel|motown'                                       THEN 'rnb-soul'
    WHEN main ~ 'rock|punk|grunge|\memo\M|shoegaze|new wave|psychedelic|^indie$'            THEN 'rock'
    WHEN main ~ 'pop'                                                                       THEN 'pop'
    WHEN main ~ 'folk|country|americana|bluegrass|singer|acoustic'                          THEN 'folk-country'
    WHEN main ~ 'jazz|blues|swing'                                                          THEN 'jazz-blues'
    ELSE 'other'
  END
  FROM (SELECT lower(trim(split_part(coalesce(genre, ''), ',', 1))) AS main) AS first_genre;
$$;

ALTER TABLE "public"."Songs"
  ADD COLUMN "genreGroup" text GENERATED ALWAYS AS ("public"."genre_group"("genre")) STORED;

CREATE INDEX "Songs_genreGroup_date_id_idx"
  ON "public"."Songs" ("genreGroup", "date" DESC, "id" DESC);

DROP MATERIALIZED VIEW "public"."country_year_emotions";

CREATE MATERIALIZED VIEW "public"."country_year_emotions" AS
SELECT
  CASE WHEN GROUPING(song."genreGroup") = 1 THEN 'all' ELSE song."genreGroup" END AS "genre_group",
  artist."country"                                                AS "country",
  EXTRACT(YEAR FROM song."date")::integer                         AS "year",
  COUNT(*)::integer                                               AS "song_count",
  ROUND(AVG(emotions."joy"), 3)::double precision           AS "joy",
  ROUND(AVG(emotions."trust"), 3)::double precision         AS "trust",
  ROUND(AVG(emotions."fear"), 3)::double precision          AS "fear",
  ROUND(AVG(emotions."surprise"), 3)::double precision      AS "surprise",
  ROUND(AVG(emotions."sadness"), 3)::double precision       AS "sadness",
  ROUND(AVG(emotions."disgust"), 3)::double precision       AS "disgust",
  ROUND(AVG(emotions."anger"), 3)::double precision         AS "anger",
  ROUND(AVG(emotions."anticipation"), 3)::double precision  AS "anticipation"
FROM "public"."Songs" AS song
JOIN "public"."ArtistsLocations" AS artist ON artist."id" = song."artistId"
JOIN "public"."SongsEmotions" AS emotions ON emotions."id" = song."id"
WHERE artist."country" IS NOT NULL
  AND song."date" IS NOT NULL
GROUP BY GROUPING SETS (
  (artist."country", EXTRACT(YEAR FROM song."date")),
  (artist."country", EXTRACT(YEAR FROM song."date"), song."genreGroup")
);

CREATE UNIQUE INDEX "country_year_emotions_genre_year_country_idx"
  ON "public"."country_year_emotions" ("genre_group", "year", "country");

REVOKE ALL ON "public"."country_year_emotions" FROM "anon", "authenticated";
GRANT SELECT ON "public"."country_year_emotions" TO "service_role";

DROP FUNCTION "public"."country_songs"(text, integer, integer, date, bigint);
DROP FUNCTION "public"."country_songs_by_emotion"(text, text, integer, integer, bigint);

CREATE FUNCTION "public"."country_songs"(
  country_code text,
  page_size integer,
  song_year integer DEFAULT NULL,
  song_genre text DEFAULT NULL,
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
      AND ($6 IS NULL OR song."genreGroup" = $6)
    ORDER BY song."date" DESC, song."id" DESC
    LIMIT $7'
  USING
    country_code,
    COALESCE(make_date(song_year, 1, 1), '-infinity'::date),
    COALESCE(make_date(song_year, 12, 31), 'infinity'::date),
    COALESCE(cursor_date, 'infinity'::date),
    COALESCE(cursor_id, 0),
    song_genre,
    page_size;
END;
$$;

CREATE FUNCTION "public"."country_songs_by_emotion"(
  country_code text,
  emotion text,
  page_size integer,
  song_year integer DEFAULT NULL,
  song_genre text DEFAULT NULL,
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
DECLARE
  cursor_value numeric;
BEGIN
  IF emotion <> ALL (ARRAY['joy', 'trust', 'fear', 'surprise', 'sadness', 'disgust', 'anger', 'anticipation']) THEN
    RAISE EXCEPTION 'unknown emotion: %', emotion;
  END IF;

  IF cursor_id IS NOT NULL THEN
    EXECUTE format('SELECT %I FROM "public"."SongsEmotions" WHERE "id" = $1', emotion)
    INTO cursor_value
    USING cursor_id;
    IF cursor_value IS NULL THEN
      RETURN;
    END IF;
  END IF;

  RETURN QUERY EXECUTE format('
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
    FROM "public"."SongsEmotions" AS emotions
    JOIN "public"."Songs" AS song ON song."id" = emotions."id"
    JOIN "public"."ArtistsLocations" AS artist ON artist."id" = song."artistId"
    WHERE artist."country" = $1
      AND song."date" >= $2
      AND song."date" <= $3
      AND (emotions.%1$I, emotions."id") < ($4, $5)
      AND ($6 IS NULL OR song."genreGroup" = $6)
    ORDER BY emotions.%1$I DESC, emotions."id" DESC
    LIMIT $7', emotion)
  USING
    country_code,
    COALESCE(make_date(song_year, 1, 1), '-infinity'::date),
    COALESCE(make_date(song_year, 12, 31), 'infinity'::date),
    COALESCE(cursor_value, 'Infinity'::numeric),
    COALESCE(cursor_id, 0),
    song_genre,
    page_size;
END;
$$;

REVOKE EXECUTE ON FUNCTION "public"."genre_group"(text) FROM PUBLIC, "anon", "authenticated";
GRANT EXECUTE ON FUNCTION "public"."genre_group"(text) TO "service_role";
REVOKE EXECUTE ON FUNCTION "public"."country_songs"(text, integer, integer, text, date, bigint) FROM PUBLIC, "anon", "authenticated";
GRANT EXECUTE ON FUNCTION "public"."country_songs"(text, integer, integer, text, date, bigint) TO "service_role";
REVOKE EXECUTE ON FUNCTION "public"."country_songs_by_emotion"(text, text, integer, integer, text, bigint) FROM PUBLIC, "anon", "authenticated";
GRANT EXECUTE ON FUNCTION "public"."country_songs_by_emotion"(text, text, integer, integer, text, bigint) TO "service_role";
