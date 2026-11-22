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

CREATE FUNCTION "public"."country_songs_by_emotion"(
  country_code text,
  emotion text,
  page_size integer,
  song_year integer DEFAULT NULL,
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
    ORDER BY emotions.%1$I DESC, emotions."id" DESC
    LIMIT $6', emotion)
  USING
    country_code,
    COALESCE(make_date(song_year, 1, 1), '-infinity'::date),
    COALESCE(make_date(song_year, 12, 31), 'infinity'::date),
    COALESCE(cursor_value, 'Infinity'::numeric),
    COALESCE(cursor_id, 0),
    page_size;
END;
$$;

REVOKE EXECUTE ON FUNCTION "public"."country_songs_by_emotion"(text, text, integer, integer, bigint) FROM PUBLIC, "anon", "authenticated";
GRANT EXECUTE ON FUNCTION "public"."country_songs_by_emotion"(text, text, integer, integer, bigint) TO "service_role";
