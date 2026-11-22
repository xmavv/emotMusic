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

REVOKE EXECUTE ON FUNCTION "public"."genre_group"(text) FROM PUBLIC, "anon", "authenticated";
GRANT EXECUTE ON FUNCTION "public"."genre_group"(text) TO "service_role";
