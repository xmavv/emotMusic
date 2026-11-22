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

CREATE FUNCTION "public"."refresh_country_year_emotions"()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY "public"."country_year_emotions";
$$;

REVOKE EXECUTE ON FUNCTION "public"."refresh_country_year_emotions"() FROM PUBLIC, "anon", "authenticated";
GRANT EXECUTE ON FUNCTION "public"."refresh_country_year_emotions"() TO "service_role";
