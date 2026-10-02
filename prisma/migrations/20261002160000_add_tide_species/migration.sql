-- Dados: terceira linha evolutiva (Tide, a tartaruga marinha). Idempotente — o seed também a cadastra.
INSERT INTO "PetSpecies" ("id", "name", "description", "createdAt")
VALUES (gen_random_uuid()::text, 'Tide', 'Uma tartaruga marinha amigável que cresce a cada culto e evento.', CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "PetEvolution" ("id", "speciesId", "levelRequired", "name", "sprite", "createdAt")
SELECT gen_random_uuid()::text, s."id", e."levelRequired", e."name", e."sprite", CURRENT_TIMESTAMP
FROM "PetSpecies" s
CROSS JOIN (VALUES
  (2, 'Rise', 'tide_rise'),
  (5, 'Surge', 'tide_surge'),
  (10, 'Ascend', 'tide_ascend'),
  (20, 'Apex', 'tide_apex')
) AS e("levelRequired", "name", "sprite")
WHERE s."name" = 'Tide'
ON CONFLICT ("speciesId", "levelRequired") DO NOTHING;
