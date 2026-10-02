-- Dados: quarta linha evolutiva (Ígneo, a salamandra de fogo). Idempotente — o seed também a cadastra.
INSERT INTO "PetSpecies" ("id", "name", "description", "createdAt")
VALUES (gen_random_uuid()::text, 'Ígneo', 'Uma salamandra de fogo amigável que cresce a cada culto e evento.', CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "PetEvolution" ("id", "speciesId", "levelRequired", "name", "sprite", "createdAt")
SELECT gen_random_uuid()::text, s."id", e."levelRequired", e."name", e."sprite", CURRENT_TIMESTAMP
FROM "PetSpecies" s
CROSS JOIN (VALUES
  (2, 'Rise', 'igneo_rise'),
  (5, 'Surge', 'igneo_surge'),
  (10, 'Ascend', 'igneo_ascend'),
  (20, 'Apex', 'igneo_apex')
) AS e("levelRequired", "name", "sprite")
WHERE s."name" = 'Ígneo'
ON CONFLICT ("speciesId", "levelRequired") DO NOTHING;
